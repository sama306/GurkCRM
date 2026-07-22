import { z } from "zod";

export const createInvitationSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Debe ser un email válido")
    .max(255),
  roleId: z.string().min(1, "El rol es requerido"),
});

export const acceptInvitationSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "El nombre completo debe tener al menos 2 caracteres")
      .max(100),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
