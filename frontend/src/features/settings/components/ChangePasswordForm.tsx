import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useChangePassword } from "@/features/settings/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
      .max(128),
    confirmPassword: z.string().min(1, "Debés confirmar la nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.input<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const changePassword = useChangePassword();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ChangePasswordFormData) {
    setSuccessMessage(null);
    await changePassword.mutateAsync({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    setSuccessMessage("Contraseña cambiada correctamente. En tu próximo inicio de sesión usá la nueva contraseña.");
    reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cambiar contraseña</CardTitle>
        <CardDescription>
          La contraseña debe tener al menos 8 caracteres.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel>
                <Label htmlFor="currentPassword">Contraseña actual</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register("currentPassword")}
                  aria-invalid={!!errors.currentPassword}
                />
                <FieldError errors={[errors.currentPassword]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="newPassword">Nueva contraseña</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register("newPassword")}
                  aria-invalid={!!errors.newPassword}
                />
                <FieldError errors={[errors.newPassword]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  aria-invalid={!!errors.confirmPassword}
                />
                <FieldError errors={[errors.confirmPassword]} />
              </FieldContent>
            </Field>

            {successMessage && (
              <div
                role="alert"
                className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
              >
                {successMessage}
              </div>
            )}

            <Button
              type="submit"
              disabled={changePassword.isPending || isSubmitting}
              className="w-fit"
            >
              {changePassword.isPending ? "Cambiando..." : "Cambiar contraseña"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
