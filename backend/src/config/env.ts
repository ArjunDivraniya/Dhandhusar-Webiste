import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env file into process.env
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),
  DATABASE_URL: z
    .string()
    .url()
    .default('postgresql://postgres:password@localhost:5432/dhandhusar_db?schema=public'),
  DIRECT_URL: z.string().url().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // JWT Authentication Configuration
  JWT_ACCESS_SECRET: z.string().min(16).default('explore_dhandusar_access_secret_development_key_32chars'),
  JWT_REFRESH_SECRET: z.string().min(16).default('explore_dhandusar_refresh_secret_development_key_32chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN_DAYS: z
    .string()
    .default('7')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  // Optional Super Admin bootstrap seeding credentials
  SUPER_ADMIN_EMAIL: z.string().email().optional(),
  SUPER_ADMIN_PASSWORD: z.string().min(8).optional(),
  SUPER_ADMIN_NAME: z.string().optional(),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables configuration:');
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

export const env = parsedEnv.data;
