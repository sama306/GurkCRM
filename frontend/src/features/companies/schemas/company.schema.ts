import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(1, "El nombre de la empresa es requerido").max(200),
  industry: z.string().max(100).optional(),
  website: z.string().url("Debe ser una URL válida").max(500).optional(),
  address: z.string().max(500).optional(),
  size: z.enum(["1-10", "11-50", "51-200", "201+"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    message: "El estado debe ser ACTIVE o INACTIVE",
  }),
});

export const updateCompanySchema = z
  .object({
    name: z.string().min(1, "El nombre no puede estar vacío").max(200).optional(),
    industry: z.string().max(100).optional(),
    website: z.string().url("Debe ser una URL válida").max(500).optional(),
    address: z.string().max(500).optional(),
    size: z.enum(["1-10", "11-50", "51-200", "201+"]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });
