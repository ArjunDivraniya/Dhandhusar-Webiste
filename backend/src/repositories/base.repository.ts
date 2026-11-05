/**
 * Generic Base Repository Interfaces & Pagination Types
 * 
 * Repositories encapsulate raw Prisma database queries.
 * They do not contain HTTP request/response logic or business authorization logic.
 */

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IBaseRepository<T, CreateInput, UpdateInput> {
  findById(id: string): Promise<T | null>;
  findMany(filter?: Record<string, unknown>, pagination?: PaginationOptions): Promise<PaginatedResult<T>>;
  create(data: CreateInput): Promise<T>;
  update(id: string, data: UpdateInput): Promise<T>;
  delete(id: string): Promise<T>;
}

