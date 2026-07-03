import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Lock, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";

import { resetPasswordSchema } from "@/features/auth/schemas/auth.schema";
import { authService } from "@/services/auth.service";
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

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    setToken(t);
    setLoading(false);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    values: { token: token ?? "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(data: ResetPasswordFormData) {
    setApiError(null);

    try {
      await authService.resetPassword({
        token: data.token,
        newPassword: data.newPassword,
      });
      setSuccess(true);
    } catch (error: unknown) {
      const err = error as {
        response?: {
          status?: number;
          data?: { error?: { message?: string } };
        };
      };
      if (err.response?.status === 400 || err.response?.status === 401) {
        setApiError("El link expiró o no es válido. Solicitá uno nuevo.");
      } else {
        setApiError("Ocurrió un error. Intentá de nuevo.");
      }
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!token) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Link inválido</CardTitle>
          <CardDescription>
            El link de restablecimiento es inválido o está incompleto.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">
            No se encontró un token de seguridad en la URL. Asegurate de usar
            el link completo que recibiste por email.
          </p>
          <a href="/forgot-password">
            <Button>Solicitar nuevo link</Button>
          </a>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Contraseña actualizada</CardTitle>
          <CardDescription>
            Tu contraseña se cambió correctamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="size-6 text-emerald-500" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Ya podés iniciar sesión con tu nueva contraseña.
            </p>
            <a href="/login">
              <Button>
                <ArrowLeft className="size-4" />
                Ir a iniciar sesión
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Restablecer contraseña</CardTitle>
        <CardDescription>
          Ingresá tu nueva contraseña.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel>
                <Label htmlFor="newPassword">Nueva contraseña</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  {...register("newPassword")}
                  aria-invalid={!!errors.newPassword}
                />
                <FieldError errors={[errors.newPassword]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repetí la contraseña"
                  {...register("confirmPassword")}
                  aria-invalid={!!errors.confirmPassword}
                />
                <FieldError errors={[errors.confirmPassword]} />
              </FieldContent>
            </Field>

            {apiError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              <Lock className="size-4" />
              {isSubmitting ? "Cambiando..." : "Cambiar contraseña"}
            </Button>
          </FieldGroup>
        </form>

        {apiError?.includes("expiró") && (
          <div className="mt-4 text-center">
            <a
              href="/forgot-password"
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Solicitar nuevo link
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
