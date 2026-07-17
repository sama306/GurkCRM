import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn } from "lucide-react";

import { loginSchema } from "@/features/auth/schemas/auth.schema";
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

type LoginFormData = z.input<typeof loginSchema>;

export default function LoginForm() {
  const [apiError, setApiError] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/app/dashboard";
    }
  }, [isAuthenticated]);

  async function onSubmit(data: LoginFormData) {
    setApiError(null);

    try {
      const res = await authService.login(data);
      setAuth(res.data.user, res.data.accessToken);
      window.location.href = "/app/dashboard";
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { error?: { message?: string } } } };
      if (err.response?.status === 401) {
        setApiError("Email o contraseña incorrectos.");
      } else {
        setApiError("Ocurrió un error al iniciar sesión. Intentá de nuevo.");
      }
    }
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle>Iniciar sesión</CardTitle>
        <CardDescription>
          Ingresá tu email y contraseña para acceder al sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
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
                  placeholder="••••••••"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                <FieldError errors={[errors.password]} />
              </FieldContent>
            </Field>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border-border accent-primary"
                {...register("rememberMe")}
              />
              Recordarme
            </label>

            {apiError && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {apiError}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              <LogIn className="size-4" />
              {isSubmitting ? "Ingresando..." : "Ingresar"}
            </Button>
          </FieldGroup>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <a
            href="/forgot-password"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ¿Olvidaste tu contraseña?
          </a>
          <span>
            ¿No tenés cuenta?{" "}
            <a
              href="/register"
              className="font-medium text-primary transition-colors hover:text-primary/80"
            >
              Registrate
            </a>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
