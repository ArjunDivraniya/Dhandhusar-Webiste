import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { userRepository } from '../repositories/user.repository.js';
import { AppError } from './errorHandler.js';

/**
 * Authentication middleware.
 * Verifies short-lived access JWT from Authorization header or HttpOnly cookie.
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    // 1. Check Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }

    // 2. Fallback to HttpOnly cookie if present
    if (!token && req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      throw new AppError('Authentication required. No access token provided.', 401, 'UNAUTHORIZED');
    }

    // 3. Verify JWT signature and expiration
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      throw new AppError('Invalid or expired access token.', 401, 'INVALID_ACCESS_TOKEN');
    }

    // 4. Verify user exists and is active in database
    const user = await userRepository.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new AppError('User account is invalid or deactivated.', 401, 'ACCOUNT_INVALID');
    }

    // 5. Fetch fresh permissions from DB
    const permissions = await userRepository.getUserPermissions(user.id);
    const roles = user.roles.map((r) => r.role.name);

    // 6. Attach authenticated user context
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      roles,
      permissions,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Role-Based Access Control (RBAC) middleware.
 * Allows access if the user possesses ANY of the allowed roles, or is a SUPER_ADMIN.
 */
export function authorizeRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const isSuperAdmin = req.user.roles.includes('SUPER_ADMIN');
    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!isSuperAdmin && !hasRole) {
      return next(
        new AppError(
          `Forbidden. Insufficient role permissions. Required: ${allowedRoles.join(' or ')}`,
          403,
          'FORBIDDEN_ROLE'
        )
      );
    }

    next();
  };
}

/**
 * Permission-Based Access Control middleware.
 * Allows access if the user possesses ALL of the required permissions, or is a SUPER_ADMIN.
 */
export function authorizePermission(...requiredPermissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const isSuperAdmin = req.user.roles.includes('SUPER_ADMIN');
    const hasAllPermissions = requiredPermissions.every((perm) =>
      req.user!.permissions.includes(perm)
    );

    if (!isSuperAdmin && !hasAllPermissions) {
      return next(
        new AppError(
          `Forbidden. Missing required permissions: ${requiredPermissions.join(', ')}`,
          403,
          'FORBIDDEN_PERMISSION'
        )
      );
    }

    next();
  };
}

