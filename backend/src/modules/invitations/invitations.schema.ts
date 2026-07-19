import { z } from 'zod';

const validRoles = ['OWNER', 'ADMIN', 'SALES', 'VIEWER'] as const;

export const createInvitationSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Debe ser un email válido')
    .max(255),
  roleId: z
    .string()
    .min(1, 'El ID del rol es requerido'),
});

export const listInvitationsSchema = z.object({
  status: z
    .enum(['PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'])
    .optional(),
});
