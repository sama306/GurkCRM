import { z } from "zod";

export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export const TASK_STATUSES = ["PENDING", "IN_PROGRESS", "DONE"] as const;

export const createTaskSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200),
  description: z.string().max(2000).optional(),
  assigneeId: z.string().cuid("Debe ser un ID de usuario válido"),
  relatedCustomerId: z.string().cuid("Debe ser un ID de cliente válido").optional(),
  relatedDealId: z.string().cuid("Debe ser un ID de deal válido").optional(),
  priority: z.enum(TASK_PRIORITIES, { message: "Prioridad inválida" }).optional().default("MEDIUM"),
  status: z.enum(TASK_STATUSES, { message: "Estado inválido" }).optional().default("PENDING"),
  dueDate: z.string().datetime({ offset: true }).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, "El título no puede estar vacío").max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  assigneeId: z.string().cuid("Debe ser un ID de usuario válido").optional(),
  relatedCustomerId: z.string().cuid("Debe ser un ID de cliente válido").nullable().optional(),
  relatedDealId: z.string().cuid("Debe ser un ID de deal válido").nullable().optional(),
  priority: z.enum(TASK_PRIORITIES, { message: "Prioridad inválida" }).optional(),
  status: z.enum(TASK_STATUSES, { message: "Estado inválido" }).optional(),
  dueDate: z.string().datetime({ offset: true }).nullable().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Debes enviar al menos un campo para actualizar" },
);

export const changeStatusSchema = z.object({
  status: z.enum(TASK_STATUSES, { message: "Estado inválido" }),
});
