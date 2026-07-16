import { z } from "zod";

export const DEAL_STAGES = [
  "NEW",
  "CONTACTED",
  "MEETING",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

export const createDealSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200),
  customerId: z.string().min(1, "El cliente es requerido"),
  companyId: z.string().optional(),
  ownerId: z.string().optional(),
  estimatedValue: z.coerce.number().positive("El valor estimado debe ser positivo").optional().default(0),
  currency: z.string().max(10).optional().default("USD"),
  stage: z.enum(DEAL_STAGES, { message: "Stage inválido" }).optional().default("NEW"),
  expectedCloseDate: z.string().datetime({ offset: true }).optional(),
  lostReason: z.string().max(500).optional(),
}).superRefine((data, ctx) => {
  if (data.stage === "LOST" && !data.lostReason) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "lostReason es requerido cuando stage es LOST",
      path: ["lostReason"],
    });
  }
  if (data.stage !== "LOST" && data.lostReason) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "lostReason solo puede enviarse cuando stage es LOST",
      path: ["lostReason"],
    });
  }
});

export const updateDealSchema = z.object({
  title: z.string().min(1, "El título no puede estar vacío").max(200).optional(),
  customerId: z.string().min(1, "El cliente es requerido").optional(),
  companyId: z.string().nullable().optional(),
  ownerId: z.string().optional(),
  estimatedValue: z.coerce.number().positive("El valor estimado debe ser positivo").optional(),
  currency: z.string().max(10).optional(),
  expectedCloseDate: z.string().datetime({ offset: true }).nullable().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Debes enviar al menos un campo para actualizar" },
);

export const changeStageSchema = z.object({
  stage: z.enum(DEAL_STAGES, { message: "Stage inválido" }),
  position: z.number().int().min(0, "La posición debe ser un entero no negativo"),
  lostReason: z.string().max(500).optional(),
}).superRefine((data, ctx) => {
  if (data.stage === "LOST" && !data.lostReason) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "lostReason es requerido cuando el nuevo stage es LOST",
      path: ["lostReason"],
    });
  }
});
