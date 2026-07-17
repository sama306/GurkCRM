"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.logoutSchema = exports.refreshSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    organizationName: zod_1.z
        .string()
        .min(2, 'El nombre de la organización debe tener al menos 2 caracteres')
        .max(100),
    fullName: zod_1.z
        .string()
        .min(2, 'El nombre completo debe tener al menos 2 caracteres')
        .max(100),
    email: zod_1.z
        .string()
        .email('Email inválido')
        .max(255),
    password: zod_1.z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(128),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido').max(255),
    password: zod_1.z.string().min(1, 'La contraseña es requerida'),
    rememberMe: zod_1.z.boolean().optional().default(false),
});
exports.refreshSchema = zod_1.z.object({});
exports.logoutSchema = zod_1.z.object({});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido').max(255),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'El token es requerido'),
    newPassword: zod_1.z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(128),
});
//# sourceMappingURL=auth.schema.js.map