"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeStageSchema = exports.updateDealSchema = exports.createDealSchema = void 0;
const zod_1 = require("zod");
const deals_dto_1 = require("./deals.dto");
exports.createDealSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'El título es requerido').max(200),
    customerId: zod_1.z.string().cuid('Debe ser un ID de cliente válido'),
    companyId: zod_1.z.string().cuid('Debe ser un ID de empresa válido').optional(),
    ownerId: zod_1.z.string().cuid('Debe ser un ID de usuario válido').optional(),
    estimatedValue: zod_1.z.coerce.number().positive('El valor estimado debe ser positivo').optional().default(0),
    currency: zod_1.z.string().max(10).optional().default('USD'),
    stage: zod_1.z.enum(deals_dto_1.DEAL_STAGES, { message: 'Stage inválido' }).optional().default('NEW'),
    expectedCloseDate: zod_1.z.string().datetime({ offset: true }).optional(),
    lostReason: zod_1.z.string().max(500).optional(),
}).superRefine((data, ctx) => {
    if (data.stage === 'LOST' && !data.lostReason) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'lostReason es requerido cuando stage es LOST',
            path: ['lostReason'],
        });
    }
    if (data.stage !== 'LOST' && data.lostReason) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'lostReason solo puede enviarse cuando stage es LOST',
            path: ['lostReason'],
        });
    }
});
exports.updateDealSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'El título no puede estar vacío').max(200).optional(),
    customerId: zod_1.z.string().cuid('Debe ser un ID de cliente válido').optional(),
    companyId: zod_1.z.string().cuid('Debe ser un ID de empresa válido').nullable().optional(),
    ownerId: zod_1.z.string().cuid('Debe ser un ID de usuario válido').optional(),
    estimatedValue: zod_1.z.coerce.number().positive('El valor estimado debe ser positivo').optional(),
    currency: zod_1.z.string().max(10).optional(),
    expectedCloseDate: zod_1.z.string().datetime({ offset: true }).nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, { message: 'Debes enviar al menos un campo para actualizar' });
exports.changeStageSchema = zod_1.z.object({
    stage: zod_1.z.enum(deals_dto_1.DEAL_STAGES, { message: 'Stage inválido' }),
    position: zod_1.z.number().int().min(0, 'La posición debe ser un entero no negativo'),
    lostReason: zod_1.z.string().max(500).optional(),
}).superRefine((data, ctx) => {
    if (data.stage === 'LOST' && !data.lostReason) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'lostReason es requerido cuando el nuevo stage es LOST',
            path: ['lostReason'],
        });
    }
});
//# sourceMappingURL=deals.schema.js.map