"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskStatusSchema = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
const tasks_dto_1 = require("./tasks.dto");
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'El título es requerido').max(200),
    description: zod_1.z.string().max(2000).optional(),
    assigneeId: zod_1.z.string().cuid('Debe ser un ID de usuario válido'),
    relatedCustomerId: zod_1.z.string().cuid('Debe ser un ID de cliente válido').optional(),
    relatedDealId: zod_1.z.string().cuid('Debe ser un ID de deal válido').optional(),
    priority: zod_1.z.enum(tasks_dto_1.TASK_PRIORITIES, { message: 'Prioridad inválida' }).optional().default('MEDIUM'),
    status: zod_1.z.enum(tasks_dto_1.TASK_STATUSES, { message: 'Estado inválido' }).optional().default('PENDING'),
    dueDate: zod_1.z.string().datetime({ offset: true }).optional(),
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'El título no puede estar vacío').max(200).optional(),
    description: zod_1.z.string().max(2000).nullable().optional(),
    assigneeId: zod_1.z.string().cuid('Debe ser un ID de usuario válido').optional(),
    relatedCustomerId: zod_1.z.string().cuid('Debe ser un ID de cliente válido').nullable().optional(),
    relatedDealId: zod_1.z.string().cuid('Debe ser un ID de deal válido').nullable().optional(),
    priority: zod_1.z.enum(tasks_dto_1.TASK_PRIORITIES, { message: 'Prioridad inválida' }).optional(),
    status: zod_1.z.enum(tasks_dto_1.TASK_STATUSES, { message: 'Estado inválido' }).optional(),
    dueDate: zod_1.z.string().datetime({ offset: true }).nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, { message: 'Debes enviar al menos un campo para actualizar' });
exports.updateTaskStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(tasks_dto_1.TASK_STATUSES, { message: 'Estado inválido' }),
});
//# sourceMappingURL=tasks.schema.js.map