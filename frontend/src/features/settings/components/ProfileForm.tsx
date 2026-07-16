import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/auth.store";
import { useUpdateProfile } from "@/features/settings/hooks/useSettings";
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

const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100),
  avatarUrl: z
    .string()
    .url("Debe ser una URL válida")
    .max(500)
    .or(z.literal(""))
    .optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      avatarUrl: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName,
        avatarUrl: user.avatarUrl ?? "",
      });
    }
  }, [user, reset]);

  async function onSubmit(data: ProfileFormData) {
    await updateProfile.mutateAsync({
      fullName: data.fullName,
      avatarUrl: data.avatarUrl === "" ? null : data.avatarUrl,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mi perfil</CardTitle>
        <CardDescription>
          Tu email es tu identificador de cuenta y no puede cambiarse.
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
                  value={user?.email ?? ""}
                  disabled
                />
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
                <Label htmlFor="avatarUrl">URL del avatar</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="avatarUrl"
                  type="url"
                  placeholder="https://ejemplo.com/avatar.jpg"
                  {...register("avatarUrl")}
                  aria-invalid={!!errors.avatarUrl}
                />
                <FieldError errors={[errors.avatarUrl]} />
              </FieldContent>
            </Field>

            <Button
              type="submit"
              disabled={updateProfile.isPending || isSubmitting}
              className="w-fit"
            >
              {updateProfile.isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
