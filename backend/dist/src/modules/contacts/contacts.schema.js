"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContactSchema = exports.createContactSchema = void 0;
const zod_1 = require("zod");
exports.createContactSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1, 'El nombre completo es requerido').max(200),
    position: zod_1.z.string().max(200).optional(),
    email: zod_1.z.string().email('Debe ser un email válido').max(200).optional(),
    phone: zod_1.z.string().max(50).optional(),
    socialLinks: zod_1.z
        .array(zod_1.z.object({
        platform: zod_1.z.string().max(50),
        url: zod_1.z.string().url('Debe ser una URL válida'),
    }))
        .optional(),
});
exports.updateContactSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1, 'El nombre completo no puede estar vacío').max(200).optional(),
    position: zod_1.z.string().max(200).optional(),
    email: zod_1.z.string().email('Debe ser un email válido').max(200).optional(),
    phone: zod_1.z.string().max(50).optional(),
    socialLinks: zod_1.z
        .array(zod_1.z.object({
        platform: zod_1.z.string().max(50),
        url: zod_1.z.string().url('Debe ser una URL válida'),
    }))
        .optional(),
}).refine((data) => Object.keys(data).length > 0, { message: 'Debes enviar al menos un campo para actualizar' });
//# sourceMappingURL=contacts.schema.js.map