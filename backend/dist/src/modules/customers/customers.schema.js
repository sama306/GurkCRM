"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
const zod_1 = require("zod");
exports.createCustomerSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1, 'El nombre completo es requerido').max(200),
    email: zod_1.z.string().email('Debe ser un email válido').max(200).optional(),
    phone: zod_1.z.string().max(50).optional(),
    address: zod_1.z.string().max(500).optional(),
    notes: zod_1.z.string().optional(),
    companyId: zod_1.z.string().cuid('Debe ser un ID de empresa válido').optional(),
    ownerId: zod_1.z.string().cuid('Debe ser un ID de usuario válido').optional(),
    status: zod_1.z
        .enum(['LEAD', 'ACTIVE', 'INACTIVE'], {
        message: 'El estado debe ser LEAD, ACTIVE o INACTIVE',
    })
        .optional()
        .default('LEAD'),
});
exports.updateCustomerSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1, 'El nombre completo no puede estar vacío').max(200).optional(),
    email: zod_1.z.string().email('Debe ser un email válido').max(200).optional(),
    phone: zod_1.z.string().max(50).optional(),
    address: zod_1.z.string().max(500).optional(),
    notes: zod_1.z.string().optional(),
    companyId: zod_1.z.string().cuid('Debe ser un ID de empresa válido').nullable().optional(),
    ownerId: zod_1.z.string().cuid('Debe ser un ID de usuario válido').optional(),
    status: zod_1.z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).optional(),
}).refine((data) => Object.keys(data).length > 0, { message: 'Debes enviar al menos un campo para actualizar' });
//# sourceMappingURL=customers.schema.js.map