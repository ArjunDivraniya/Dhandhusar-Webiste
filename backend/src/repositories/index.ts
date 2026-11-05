/**
 * Repositories Layer (Data Access Layer)
 * 
 * 4-Tier Architecture: Routes → Controllers → Services → Repositories
 * - Repositories encapsulate raw Prisma database operations.
 * - Services consume repositories to execute business logic, transactions, and permission checks.
 */

export * from './base.repository.js';
export * from './user.repository.js';
export * from './news.repository.js';
export * from './token.repository.js';
