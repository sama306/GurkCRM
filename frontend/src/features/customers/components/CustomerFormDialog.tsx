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
  createCustomerSchema,
  updateCustomerSchema,
} from "@/features/customers/schemas/customer.schema";
import { useCreateCustomer, useUpdateCustomer } from "@/features/customers/hooks/useCustomers";
import { useCompanies } from "@/features/companies/hooks/useCompanies";
import { useUsers } from "@/hooks/useUsers";
import type { Customer } from "@/types/customer";
import { useAuthStore } from "@/stores/auth.store";

const STATUS_OPTIONS = [
  { value: "LEAD", label: "Lead" },
  { value: "ACTIVE", label: "Activo" },
  { value: "INACTIVE", label: "Inactivo" },
] as const;

interface CustomerFormDialogProps {
  open: boolean;
  onClose: () => void;
  customer?: Customer;
}

export function CustomerFormDialog({ open, onClose, customer }: CustomerFormDialogProps) {
  const isEdit = !!customer;
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const { data: companiesData } = useCompanies({ limit: 200, sortBy: "name", order: "asc" });
  const { data: users } = useUsers();
  const currentUser = useAuthStore((s) => s.user);

  const companies = companiesData?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isEdit ? updateCustomerSchema : createCustomerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
      status: "LEAD",
    },
  });

  const statusValue = watch("status");
  const companyIdValue = watch("companyId");
  const ownerIdValue = watch("ownerId");

  useEffect(() => {
    if (open) {
      if (customer) {
        reset({
          fullName: customer.fullName,
          email: customer.email ?? "",
          phone: customer.phone ?? "",
          address: customer.address ?? "",
          notes: customer.notes ?? "",
          companyId: customer.companyId ?? undefined,
          ownerId: customer.ownerId,
          status: customer.status,
        } as any);
      } else {
        reset({
          fullName: "",
          email: "",
          phone: "",
          address: "",
          notes: "",
          companyId: undefined,
          ownerId: currentUser?.id ?? undefined,
          status: "LEAD",
        });
      }
    }
  }, [open, customer, reset, currentUser]);

  const mutation = isEdit ? updateMutation : createMutation;
  const isLoading = mutation.isPending || isSubmitting;

  function cleanPayload(data: Record<string, any>) {
    const payload = { ...data };
    for (const key of ["email", "phone", "address", "notes"]) {
      if (!payload[key]) delete payload[key];
    }
    if (!payload.companyId) delete payload.companyId;
    return payload;
  }

  async function onSubmit(data: Record<string, any>) {
    try {
      const payload = cleanPayload(data);
      if (isEdit && customer) {
        await updateMutation.mutateAsync({ id: customer.id, data: payload } as any);
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
          <DialogTitle>{isEdit ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualizá los datos del cliente."
              : "Completá los datos para registrar un nuevo cliente."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel>
                <Label htmlFor="fullName">Nombre completo *</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="fullName"
                  placeholder="Nombre y apellido"
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
                  placeholder="cliente@ejemplo.com"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                <FieldError errors={[errors.email]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="phone">Teléfono</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="phone"
                  placeholder="+54 11 1234-5678"
                  {...register("phone")}
                  aria-invalid={!!errors.phone}
                />
                <FieldError errors={[errors.phone]} />
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
                <Label htmlFor="companyId">Empresa</Label>
              </FieldLabel>
              <FieldContent>
                <Select
                  value={companyIdValue ?? ""}
                  onValueChange={(val: any) =>
                    setValue("companyId", val === "" ? undefined : val, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sin empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin empresa</SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.companyId]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="ownerId">Responsable</Label>
              </FieldLabel>
              <FieldContent>
                <Select
                  value={ownerIdValue ?? ""}
                  onValueChange={(val: any) =>
                    setValue("ownerId", val === "" ? undefined : val, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.ownerId]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="status">Estado</Label>
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
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.status]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="notes">Notas</Label>
              </FieldLabel>
              <FieldContent>
                <textarea
                  id="notes"
                  placeholder="Notas adicionales..."
                  rows={3}
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive"
                  {...register("notes")}
                  aria-invalid={!!errors.notes}
                />
                <FieldError errors={[errors.notes]} />
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
                  : "Crear cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
