import { z } from 'zod';

export const registerSchema = z.object({
  organizationName: z
    .string()
    .min(2, 'El nombre de la organización debe tener al menos 2 caracteres')
    .max(100),
  fullName: z
    .string()
    .min(2, 'El nombre completo debe tener al menos 2 caracteres')
    .max(100),
  email: z
    .string()
    .email('Email inválido')
    .max(255),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  password: z.string().min(1, 'La contraseña es requerida'),
  rememberMe: z.boolean().optional().default(false),
});

export const refreshSchema = z.object({});

export const logoutSchema = z.object({});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido').max(255),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'El token es requerido'),
  newPassword: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
