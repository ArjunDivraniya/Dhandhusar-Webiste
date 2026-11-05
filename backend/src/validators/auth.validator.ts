import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty'),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: 'Current password is required' })
    .min(1, 'Current password cannot be empty'),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(8, 'New password must be at least 8 characters long')
    .refine((val) => /[A-Z]/.test(val), {
      message: 'New password must contain at least one uppercase letter',
    })
    .refine((val) => /[a-z]/.test(val), {
      message: 'New password must contain at least one lowercase letter',
    })
    .refine((val) => /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(val), {
      message: 'New password must contain at least one number or special character',
    }),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

