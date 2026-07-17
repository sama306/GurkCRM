"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompanySchema = exports.createCompanySchema = void 0;
const zod_1 = require("zod");
exports.createCompanySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'El nombre de la empresa es requerido').max(200),
    industry: zod_1.z.string().max(100).optional(),
    website: zod_1.z.string().url('Debe ser una URL válida').max(500).optional(),
    address: zod_1.z.string().max(500).optional(),
    size: zod_1.z.enum(['1-10', '11-50', '51-200', '201+']).optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE'], {
        message: 'El estado debe ser ACTIVE o INACTIVE',
    }),
});
exports.updateCompanySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'El nombre no puede estar vacío').max(200).optional(),
    industry: zod_1.z.string().max(100).optional(),
    website: zod_1.z.string().url('Debe ser una URL válida').max(500).optional(),
    address: zod_1.z.string().max(500).optional(),
    size: zod_1.z.enum(['1-10', '11-50', '51-200', '201+']).optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional(),
}).refine((data) => Object.keys(data).length > 0, { message: 'Debes enviar al menos un campo para actualizar' });
//# sourceMappingURL=companies.schema.js.map