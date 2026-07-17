"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateOwnProfileSchema = exports.updateUserSchema = void 0;
const zod_1 = require("zod");
exports.updateUserSchema = zod_1.z.object({
    roleId: zod_1.z
        .string()
        .min(1, 'El ID del rol no puede estar vacío')
        .optional(),
    isActive: zod_1.z.boolean().optional(),
}).refine((data) => data.roleId !== undefined || data.isActive !== undefined, { message: 'Debes enviar al menos roleId o isActive' });
exports.updateOwnProfileSchema = zod_1.z.object({
    fullName: zod_1.z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100)
        .optional(),
    avatarUrl: zod_1.z
        .string()
        .url('Debe ser una URL válida')
        .max(500)
        .nullable()
        .optional(),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: zod_1.z
        .string()
        .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
        .max(128),
});
//# sourceMappingURL=users.schema.js.map