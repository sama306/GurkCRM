import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, Info } from "lucide-react";

import { forgotPasswordSchema } from "@/features/auth/schemas/auth.schema";
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

type ForgotPasswordFormData = {
  email: string;
};

export default function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    try {
      await authService.forgotPassword(data);
    } catch {
      // always show success regardless (security: prevent email enumeration)
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle>Revisá tu email</CardTitle>
          <CardDescription>
            Si el email existe en nuestro sistema, vas a recibir un link para
            restablecer tu contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="size-6 text-primary" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              El proceso puede tomar unos minutos. Si no ves el correo, revisá
              tu carpeta de spam.
            </p>
            {import.meta.env.DEV && (
              <p className="flex items-start gap-2 rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-xs text-warning">
                <Info className="mt-0.5 size-3.5 shrink-0" />
                <span>Modo desarrollo: revisá la consola del backend para ver el link de reseteo.</span>
              </p>
            )}
            <a
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              <ArrowLeft className="size-4" />
              Volver a iniciar sesión
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle>Recuperar contraseña</CardTitle>
        <CardDescription>
          Ingresá tu email y te enviaremos un link para restablecer tu
          contraseña.
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

            <Button type="submit" disabled={isSubmitting} className="w-full">
              <Mail className="size-4" />
              {isSubmitting ? "Enviando..." : "Enviar link"}
            </Button>
          </FieldGroup>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver a iniciar sesión
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
