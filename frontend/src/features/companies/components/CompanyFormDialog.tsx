import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  createCompanySchema,
  updateCompanySchema,
} from "@/features/companies/schemas/company.schema";
import { useCreateCompany, useUpdateCompany } from "@/features/companies/hooks/useCompanies";
import type { Company } from "@/types/company";

const SIZE_OPTIONS = [
  { value: "1-10", label: "1-10" },
  { value: "11-50", label: "11-50" },
  { value: "51-200", label: "51-200" },
  { value: "201+", label: "201+" },
] as const;

interface CompanyFormDialogProps {
  open: boolean;
  onClose: () => void;
  company?: Company;
}

export function CompanyFormDialog({ open, onClose, company }: CompanyFormDialogProps) {
  const isEdit = !!company;
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isEdit ? updateCompanySchema : createCompanySchema),
    defaultValues: {
      name: "",
      industry: "",
      website: "",
      address: "",
      status: "ACTIVE",
    },
  });

  const statusValue = watch("status");
  const sizeValue = watch("size");

  useEffect(() => {
    if (open) {
      if (company) {
        reset({
          name: company.name,
          industry: company.industry ?? "",
          website: company.website ?? "",
          address: company.address ?? "",
          size: company.size ?? undefined,
          status: company.status,
        } as any);
      } else {
        reset({
          name: "",
          industry: "",
          website: "",
          address: "",
          size: undefined,
          status: "ACTIVE",
        });
      }
    }
  }, [open, company, reset]);

  const mutation = isEdit ? updateMutation : createMutation;
  const isLoading = mutation.isPending || isSubmitting;

  function cleanPayload(data: Record<string, any>) {
    const payload = { ...data };
    for (const key of ["industry", "website", "address", "size"]) {
      if (!payload[key]) delete payload[key];
    }
    return payload;
  }

  async function onSubmit(data: Record<string, any>) {
    try {
      const payload = cleanPayload(data);
      if (isEdit && company) {
        await updateMutation.mutateAsync({ id: company.id, data: payload } as any);
      } else {
        await createMutation.mutateAsync(payload as any);
      }
      onClose();
    } catch {
      // error handled by mutation onError toast
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar empresa" : "Nueva empresa"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualizá los datos de la empresa."
              : "Completá los datos para registrar una nueva empresa."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel>
                <Label htmlFor="name">Nombre *</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="name"
                  placeholder="Nombre de la empresa"
                  {...register("name")}
                  aria-invalid={!!errors.name}
                />
                <FieldError errors={[errors.name]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="industry">Industria</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="industry"
                  placeholder="Ej: Tecnología, Salud..."
                  {...register("industry")}
                  aria-invalid={!!errors.industry}
                />
                <FieldError errors={[errors.industry]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="website">Sitio web</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://ejemplo.com"
                  {...register("website")}
                  aria-invalid={!!errors.website}
                />
                <FieldError errors={[errors.website]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="address">Dirección</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="address"
                  placeholder="Dirección física"
                  {...register("address")}
                  aria-invalid={!!errors.address}
                />
                <FieldError errors={[errors.address]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="size">Tamaño</Label>
              </FieldLabel>
              <FieldContent>
                <Select
                  value={sizeValue ?? ""}
                  onValueChange={(val: any) => setValue("size", val === "" ? undefined : val, { shouldValidate: true })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar tamaño" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.size]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="status">Estado *</Label>
              </FieldLabel>
              <FieldContent>
                <Select
                  value={statusValue}
                  onValueChange={(val: any) => setValue("status", val, { shouldValidate: true })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.status]} />
              </FieldContent>
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? isEdit
                  ? "Actualizando..."
                  : "Creando..."
                : isEdit
                  ? "Guardar cambios"
                  : "Crear empresa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
