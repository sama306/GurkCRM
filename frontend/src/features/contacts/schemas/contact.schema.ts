import { z } from "zod";

export const createContactSchema = z.object({
  fullName: z.string().min(1, "El nombre completo es requerido").max(200),
  position: z.string().max(200).optional(),
  email: z.string().email("Debe ser un email válido").max(200).optional(),
  phone: z.string().max(50).optional(),
  socialLinks: z
    .array(
      z.object({
        platform: z.string().max(50),
        url: z.string().url("Debe ser una URL válida"),
      }),
    )
    .optional(),
});

export const updateContactSchema = z
  .object({
    fullName: z.string().min(1, "El nombre completo no puede estar vacío").max(200).optional(),
    position: z.string().max(200).optional(),
    email: z.string().email("Debe ser un email válido").max(200).optional(),
    phone: z.string().max(50).optional(),
    socialLinks: z
      .array(
        z.object({
          platform: z.string().max(50),
          url: z.string().url("Debe ser una URL válida"),
        }),
      )
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });
