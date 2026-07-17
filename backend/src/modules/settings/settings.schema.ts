import { z } from 'zod';

export const updateOrganizationSettingsSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre no puede estar vacío')
    .max(200)
    .optional(),
  logoUrl: z
    .string()
    .url('Debe ser una URL válida')
    .max(500)
    .or(z.literal(''))
    .nullable()
    .optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'El color debe tener formato hex (#RRGGBB)')
    .optional(),
  timezone: z
    .string()
    .min(1, 'La zona horaria no puede estar vacía')
    .optional(),
});
