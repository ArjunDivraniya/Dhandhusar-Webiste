import { RefreshToken } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export interface CreateRefreshTokenInput {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export class TokenRepository {
  /**
   * Persists a hashed refresh token in the database.
   */
  public async create(data: CreateRefreshTokenInput): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        tokenHash: data.tokenHash,
        userId: data.userId,
        expiresAt: data.expiresAt,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
      },
    });
  }

  /**
   * Finds an active, unrevoked, unexpired refresh token by its hash.
   */
  public async findValidToken(tokenHash: string): Promise<(RefreshToken & { user: { id: string; email: string; isActive: boolean } }) | null> {
    return prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        },
      },
    });
  }

  /**
   * Revokes a specific token by hash.
   */
  public async revokeToken(tokenHash: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Revokes all active refresh tokens for a user (used during password change or compromise).
   */
  public async revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Deletes expired or revoked tokens to maintain database hygiene.
   */
  public async cleanupOldTokens(olderThanDays = 30): Promise<number> {
    const thresholdDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: thresholdDate } },
          { revokedAt: { lt: thresholdDate } },
        ],
      },
    });
    return result.count;
  }
}

export const tokenRepository = new TokenRepository();

