import { userRepository } from '../repositories/user.repository.js';
import { tokenRepository } from '../repositories/token.repository.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../utils/jwt.js';
import { AppError } from '../middlewares/errorHandler.js';
import { env } from '../config/env.js';
import { LoginInput, ChangePasswordInput } from '../validators/auth.validator.js';

export interface SanitizedUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isActive: boolean;
  roles: string[];
  permissions: string[];
}

export interface AuthSessionResponse {
  accessToken: string;
  refreshToken: string;
  user: SanitizedUser;
}

export class AuthService {
  /**
   * Authenticate an admin user with email and password.
   * Uses generic error messages to prevent account enumeration.
   */
  public async login(
    input: LoginInput,
    meta: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<AuthSessionResponse> {
    const user = await userRepository.findByEmail(input.email);

    // Generic error message if user not found
    if (!user) {
      await userRepository.logActivity({
        action: 'AUTH_LOGIN_FAILED',
        entityType: 'User',
        metadata: { email: input.email, reason: 'USER_NOT_FOUND' },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Verify account active status
    if (!user.isActive) {
      await userRepository.logActivity({
        userId: user.id,
        action: 'AUTH_LOGIN_FAILED',
        entityType: 'User',
        entityId: user.id,
        metadata: { reason: 'ACCOUNT_DEACTIVATED' },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
      throw new AppError('Account is deactivated. Please contact an administrator.', 403, 'ACCOUNT_DEACTIVATED');
    }

    // Compare bcrypt password hash
    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      await userRepository.logActivity({
        userId: user.id,
        action: 'AUTH_LOGIN_FAILED',
        entityType: 'User',
        entityId: user.id,
        metadata: { reason: 'PASSWORD_MISMATCH' },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const roles = user.roles.map((r) => r.role.name);
    const permissions = await userRepository.getUserPermissions(user.id);

    // Issue token pair
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      roles,
    });

    const rawRefreshToken = signRefreshToken({ userId: user.id });
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + env.JWT_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);

    // Persist hashed refresh token for revocation support
    await tokenRepository.create({
      tokenHash,
      userId: user.id,
      expiresAt,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    });

    // Record audit log
    await userRepository.logActivity({
      userId: user.id,
      action: 'AUTH_LOGIN_SUCCESS',
      entityType: 'User',
      entityId: user.id,
      metadata: { roles },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        roles,
        permissions,
      },
    };
  }

  /**
   * Refreshes an access token using an active, unrevoked refresh token with token rotation.
   */
  public async refreshToken(
    rawRefreshToken: string,
    meta: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload;
    try {
      payload = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_TOKEN');
    }

    const tokenHash = hashToken(rawRefreshToken);
    const storedToken = await tokenRepository.findValidToken(tokenHash);

    if (!storedToken || !storedToken.user || !storedToken.user.isActive) {
      throw new AppError('Refresh token revoked or user inactive', 401, 'TOKEN_REVOKED');
    }

    // Invalidate the consumed refresh token (token rotation prevents replay attacks)
    await tokenRepository.revokeToken(tokenHash);

    const user = await userRepository.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new AppError('User account is invalid or deactivated', 401, 'ACCOUNT_INVALID');
    }

    const roles = user.roles.map((r) => r.role.name);

    // Issue newly rotated token pair
    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      roles,
    });

    const newRawRefreshToken = signRefreshToken({ userId: user.id });
    const newTokenHash = hashToken(newRawRefreshToken);
    const expiresAt = new Date(Date.now() + env.JWT_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);

    await tokenRepository.create({
      tokenHash: newTokenHash,
      userId: user.id,
      expiresAt,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  /**
   * Invalidate session / refresh token on logout.
   */
  public async logout(rawRefreshToken?: string, userId?: string): Promise<void> {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await tokenRepository.revokeToken(tokenHash);
    }

    if (userId) {
      await userRepository.logActivity({
        userId,
        action: 'AUTH_LOGOUT',
        entityType: 'User',
        entityId: userId,
      });
    }
  }

  /**
   * Get current authenticated user profile with active roles and permissions.
   */
  public async getMe(userId: string): Promise<SanitizedUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
    }

    const roles = user.roles.map((r) => r.role.name);
    const permissions = await userRepository.getUserPermissions(user.id);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      roles,
      permissions,
    };
  }

  /**
   * Change user password, verifying current password and revoking all prior sessions.
   */
  public async changePassword(
    userId: string,
    input: ChangePasswordInput,
    meta: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isCurrentValid = await comparePassword(input.currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw new AppError('Current password does not match records', 400, 'INVALID_PASSWORD');
    }

    const newPasswordHash = await hashPassword(input.newPassword);
    await userRepository.updatePassword(userId, newPasswordHash);

    // Invalidate all existing refresh tokens for security
    await tokenRepository.revokeAllUserTokens(userId);

    await userRepository.logActivity({
      userId,
      action: 'AUTH_PASSWORD_CHANGED',
      entityType: 'User',
      entityId: userId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
  }
}

export const authService = new AuthService();

