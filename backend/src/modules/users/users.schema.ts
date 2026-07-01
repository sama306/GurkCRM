import { z } from 'zod';

export const updateUserSchema = z.object({
  roleId: z
    .string()
    .min(1, 'El ID del rol no puede estar vacío')
    .optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => data.roleId !== undefined || data.isActive !== undefined,
  { message: 'Debes enviar al menos roleId o isActive' },
);

export const updateOwnProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100)
    .optional(),
  avatarUrl: z
    .string()
    .url('Debe ser una URL válida')
    .max(500)
    .nullable()
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .max(128),
});


