import { User, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { PaginatedResult, PaginationOptions } from './base.repository.js';

export interface UserWithRoles extends User {
  roles: {
    role: {
      id: string;
      name: string;
      description: string | null;
    };
  }[];
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  name: string;
  avatarUrl?: string;
}

export interface UpdateUserInput {
  name?: string;
  avatarUrl?: string | null;
  isActive?: boolean;
}

export class UserRepository {
  /**
   * Find a user by primary key ID
   */
  public async findById(id: string): Promise<UserWithRoles | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  /**
   * Find an active or inactive user by unique email address
   */
  public async findByEmail(email: string): Promise<UserWithRoles | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  /**
   * List users with optional pagination and active status filter
   */
  public async findMany(
    filter?: { isActive?: boolean },
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<UserWithRoles>> {
    const page = Math.max(1, pagination?.page || 1);
    const limit = Math.min(100, Math.max(1, pagination?.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (filter?.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create a new user record
   */
  public async create(data: CreateUserInput): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        name: data.name,
        avatarUrl: data.avatarUrl,
      },
    });
  }

  /**
   * Update an existing user record
   */
  public async update(id: string, data: UpdateUserInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Update user's password hash
   */
  public async updatePassword(id: string, passwordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  /**
   * Fetch all distinct permission codes assigned to a user across all their roles
   */
  public async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const permissionSet = new Set<string>();
    for (const ur of userRoles) {
      for (const rp of ur.role.permissions) {
        permissionSet.add(rp.permission.code);
      }
    }

    return Array.from(permissionSet);
  }

  /**
   * Assign a role to a user by role name
   */
  public async assignRole(userId: string, roleName: string): Promise<void> {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new Error(`Role '${roleName}' not found.`);
    }

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
      create: {
        userId,
        roleId: role.id,
      },
      update: {},
    });
  }

  /**
   * Record an activity log entry
   */
  public async logActivity(data: {
    userId?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await prisma.activityLog.create({
      data: {
        userId: data.userId || null,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId || null,
        metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : undefined,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }
}

export const userRepository = new UserRepository();
