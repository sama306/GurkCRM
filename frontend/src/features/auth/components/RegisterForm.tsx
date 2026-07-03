import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus } from "lucide-react";

import { registerSchema } from "@/features/auth/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
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

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [apiError, setApiError] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/app/dashboard";
    }
  }, [isAuthenticated]);

  async function onSubmit(data: RegisterFormData) {
    setApiError(null);

    try {
      const { confirmPassword: _, ...registerPayload } = data;
      const res = await authService.register(registerPayload);
      setAuth(res.data.user, res.data.accessToken);
      window.location.href = "/app/dashboard";
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { error?: { message?: string } } } };
      if (err.response?.status === 409) {
        setApiError("Ya existe una cuenta con este email.");
      } else {
        setApiError("Ocurrió un error al registrarse. Intentá de nuevo.");
      }
    }
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>
          Completá los datos para crear tu organización y empezar a usar GurkCRM.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel>
                <Label htmlFor="organizationName">Organización</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="organizationName"
                  placeholder="Nombre de tu empresa"
                  {...register("organizationName")}
                  aria-invalid={!!errors.organizationName}
                />
                <FieldError errors={[errors.organizationName]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="fullName">Nombre completo</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="fullName"
                  placeholder="Tu nombre"
                  {...register("fullName")}
                  aria-invalid={!!errors.fullName}
                />
                <FieldError errors={[errors.fullName]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="email">Email</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                <FieldError errors={[errors.email]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="password">Contraseña</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                <FieldError errors={[errors.password]} />
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
                className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {apiError}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              <UserPlus className="size-4" />
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </FieldGroup>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tenés cuenta?{" "}
          <a
            href="/login"
            className="font-medium text-primary transition-colors hover:text-primary/80"
          >
            Iniciá sesión
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
