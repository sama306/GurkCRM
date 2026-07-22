import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, UserPlus, AlertCircle, ArrowLeft } from "lucide-react";

import { acceptInvitationSchema } from "@/features/invitations/schemas/invitation.schema";
import { invitationsService } from "@/services/invitations.service";
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
import { Badge } from "@/components/ui/badge";

type FormData = z.infer<typeof acceptInvitationSchema>;

export default function AcceptInvitationForm() {
  const [token, setToken] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(true);
  const [verification, setVerification] = useState<{
    valid: boolean;
    email?: string;
    organizationName?: string;
    roleName?: string;
    reason?: string;
  } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    setToken(t);

    if (t) {
      invitationsService
        .verifyInvitationToken(t)
        .then((res) => {
          if ("valid" in res && res.valid) {
            setVerification({
              valid: true,
              email: res.email,
              organizationName: res.organizationName,
              roleName: res.roleName,
            });
          } else {
            setVerification({
              valid: false,
              reason: (res as { valid: false; reason: string }).reason,
            });
          }
        })
        .catch(() => {
          setVerification({
            valid: false,
            reason: "Error al verificar la invitación.",
          });
        })
        .finally(() => setLoadingToken(false));
    } else {
      setVerification({ valid: false, reason: "No se encontró un token de invitación en la URL." });
      setLoadingToken(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/app/dashboard";
    }
  }, [isAuthenticated]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(acceptInvitationSchema),
  });

  async function onSubmit(data: FormData) {
    setApiError(null);

    try {
      const res = await invitationsService.acceptInvitation({
        token: token!,
        fullName: data.fullName,
        password: data.password,
      });
      setAuth(res.user, res.accessToken);
      window.location.href = "/app/dashboard";
    } catch (error: unknown) {
      const err = error as {
        response?: {
          status?: number;
          data?: { error?: { message?: string } };
        };
      };
      if (err.response?.data?.error?.message) {
        setApiError(err.response.data.error.message);
      } else {
        setApiError("Ocurrió un error al aceptar la invitación. Intentá de nuevo.");
      }
    }
  }

  if (isAuthenticated) {
    return null;
  }

  // Loading
  if (loadingToken) {
    return (
      <Card className="w-full shadow-md">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Invalid / expired / etc
  if (verification && !verification.valid) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle>Invitación inválida</CardTitle>
          <CardDescription>{verification.reason}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="size-6 text-destructive" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {verification.reason}
          </p>
          <a href="/">
            <Button>
              <ArrowLeft className="size-4" />
              Volver al inicio
            </Button>
          </a>
        </CardContent>
      </Card>
    );
  }

  // Valid — show form
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle>Aceptar invitación</CardTitle>
        <CardDescription>
          Te invitaron a unirte a <strong>{verification?.organizationName}</strong> como{" "}
          <Badge variant="outline" className="font-normal">
            {verification?.roleName}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel>
                <Label>Email</Label>
              </FieldLabel>
              <FieldContent>
                <Input value={verification?.email ?? ""} disabled className="bg-muted" />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="fullName">Nombre completo *</Label>
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
                <Label htmlFor="password">Contraseña *</Label>
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
                <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
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
              <UserPlus className="size-4" />
              {isSubmitting ? "Aceptando..." : "Aceptar invitación"}
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
