import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOrganizationSettings, useUpdateOrganizationSettings } from "@/features/settings/hooks/useSettings";
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

const organizationSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre no puede estar vacío")
    .max(200),
  logoUrl: z
    .string()
    .url("Debe ser una URL válida")
    .max(500)
    .or(z.literal(""))
    .optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Formato hex (#RRGGBB)")
    .optional()
    .or(z.literal("")),
  timezone: z
    .string()
    .min(1, "La zona horaria no puede estar vacía"),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

export function OrganizationForm() {
  const { data: settings, isLoading } = useOrganizationSettings();
  const updateSettings = useUpdateOrganizationSettings();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      logoUrl: "",
      primaryColor: "",
      timezone: "",
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        name: settings.name,
        logoUrl: settings.logoUrl ?? "",
        primaryColor: settings.primaryColor ?? "",
        timezone: settings.timezone,
      });
    }
  }, [settings, reset]);

  const primaryColorValue = watch("primaryColor");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuración de organización</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  async function onSubmit(data: OrganizationFormData) {
    await updateSettings.mutateAsync({
      name: data.name,
      logoUrl: data.logoUrl === "" ? null : data.logoUrl,
      primaryColor: data.primaryColor === "" ? undefined : data.primaryColor,
      timezone: data.timezone,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de organización</CardTitle>
        <CardDescription>
          Personalizá el branding y la configuración regional de tu organización.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel>
                <Label htmlFor="name">Nombre de la organización</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="name"
                  placeholder="Mi Empresa"
                  {...register("name")}
                  aria-invalid={!!errors.name}
                />
                <FieldError errors={[errors.name]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="logoUrl">URL del logo</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="logoUrl"
                  type="url"
                  placeholder="https://ejemplo.com/logo.png"
                  {...register("logoUrl")}
                  aria-invalid={!!errors.logoUrl}
                />
                <FieldError errors={[errors.logoUrl]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="primaryColor">Color principal</Label>
              </FieldLabel>
              <FieldContent className="flex flex-row items-center gap-2">
                <input
                  id="primaryColorPicker"
                  type="color"
                  value={primaryColorValue || "#000000"}
                  onChange={(e) =>
                    setValue("primaryColor", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                  className="size-8 cursor-pointer rounded border border-input"
                />
                <Input
                  id="primaryColor"
                  placeholder="#2563EB"
                  {...register("primaryColor")}
                  aria-invalid={!!errors.primaryColor}
                  className="flex-1"
                />
                <FieldError errors={[errors.primaryColor]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="timezone">Zona horaria</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="timezone"
                  placeholder="America/Argentina/Buenos_Aires"
                  {...register("timezone")}
                  aria-invalid={!!errors.timezone}
                />
                <FieldError errors={[errors.timezone]} />
              </FieldContent>
            </Field>

            <Button
              type="submit"
              disabled={updateSettings.isPending || isSubmitting}
              className="w-fit"
            >
              {updateSettings.isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
