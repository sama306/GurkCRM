"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrganizationSettingsSchema = void 0;
const zod_1 = require("zod");
exports.updateOrganizationSettingsSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, 'El nombre no puede estar vacío')
        .max(200)
        .optional(),
    logoUrl: zod_1.z
        .string()
        .url('Debe ser una URL válida')
        .max(500)
        .or(zod_1.z.literal(''))
        .nullable()
        .optional(),
    primaryColor: zod_1.z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'El color debe tener formato hex (#RRGGBB)')
        .optional(),
    timezone: zod_1.z
        .string()
        .min(1, 'La zona horaria no puede estar vacía')
        .optional(),
});
//# sourceMappingURL=settings.schema.js.map