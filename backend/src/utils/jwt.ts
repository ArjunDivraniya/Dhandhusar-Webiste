import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface TokenUserPayload {
  userId: string;
  email: string;
  roles: string[];
}

export interface RefreshTokenPayload {
  userId: string;
}

/**
 * Signs a short-lived access JWT (e.g. 15 minutes) containing safe identity claims.
 */
export function signAccessToken(payload: TokenUserPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    issuer: 'explore-dhandusar-auth',
  });
}

/**
 * Signs a longer-lived refresh JWT (e.g. 7 days).
 */
export function signRefreshToken(payload: RefreshTokenPayload): string {
  const expiresInSeconds = env.JWT_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60;
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: expiresInSeconds,
    issuer: 'explore-dhandusar-auth',
  });
}

/**
 * Verifies and decodes an access token.
 */
export function verifyAccessToken(token: string): TokenUserPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: 'explore-dhandusar-auth',
  }) as TokenUserPayload;
}

/**
 * Verifies and decodes a refresh token.
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: 'explore-dhandusar-auth',
  }) as RefreshTokenPayload;
}

/**
 * Produces a one-way SHA-256 hash of a raw token for safe persistence in PostgreSQL.
 * If the database is ever read, raw tokens are never exposed.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

