import { z } from "zod";

export const createCustomerSchema = z.object({
  fullName: z.string().min(1, "El nombre completo es requerido").max(200),
  email: z.string().email("Debe ser un email válido").max(200).optional(),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  notes: z.string().optional(),
  companyId: z.string().optional(),
  ownerId: z.string().optional(),
  status: z
    .enum(["LEAD", "ACTIVE", "INACTIVE"], {
      message: "El estado debe ser LEAD, ACTIVE o INACTIVE",
    })
    .optional()
    .default("LEAD"),
});

export const updateCustomerSchema = z
  .object({
    fullName: z.string().min(1, "El nombre completo no puede estar vacío").max(200).optional(),
    email: z.string().email("Debe ser un email válido").max(200).optional(),
    phone: z.string().max(50).optional(),
    address: z.string().max(500).optional(),
    notes: z.string().optional(),
    companyId: z.string().nullable().optional(),
    ownerId: z.string().optional(),
    status: z.enum(["LEAD", "ACTIVE", "INACTIVE"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });
