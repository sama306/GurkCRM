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
  createDealSchema,
  updateDealSchema,
} from "@/features/deals/schemas/deal.schema";
import { useCreateDeal, useUpdateDeal } from "@/features/deals/hooks/useDeals";
import { useCustomers } from "@/features/customers/hooks/useCustomers";
import { useUsers } from "@/hooks/useUsers";
import type { Deal } from "@/types/deal";
import { useAuthStore } from "@/stores/auth.store";

interface DealFormDialogProps {
  open: boolean;
  onClose: () => void;
  deal?: Deal;
}

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" },
  { value: "ARS", label: "ARS" },
  { value: "EUR", label: "EUR" },
] as const;

export function DealFormDialog({ open, onClose, deal }: DealFormDialogProps) {
  const isEdit = !!deal;
  const createMutation = useCreateDeal();
  const updateMutation = useUpdateDeal();
  const { data: customersData } = useCustomers({ limit: 200, sortBy: "fullName", order: "asc" });
  const { data: usersData } = useUsers();
  const currentUser = useAuthStore((s) => s.user);

  const customers = customersData?.data ?? [];
  const users = usersData ?? [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isEdit ? updateDealSchema : createDealSchema),
    defaultValues: {
      title: "",
      customerId: "",
      companyId: "",
      estimatedValue: undefined,
      currency: "USD",
      expectedCloseDate: undefined,
      ownerId: "",
    },
  });

  const currencyValue = watch("currency");
  const customerIdValue = watch("customerId");
  const ownerIdValue = watch("ownerId");
  const expectedCloseDateValue = watch("expectedCloseDate");

  function toDateInputValue(iso: string | undefined): string {
    if (!iso) return "";
    try {
      return new Date(iso).toISOString().split("T")[0];
    } catch {
      return "";
    }
  }

  useEffect(() => {
    if (open) {
      if (deal) {
        reset({
          title: deal.title,
          customerId: deal.customerId,
          companyId: deal.companyName ?? "",
          estimatedValue: deal.estimatedValue,
          currency: deal.currency,
          expectedCloseDate: deal.expectedCloseDate ?? undefined,
          ownerId: deal.ownerId,
        } as any);
      } else {
        reset({
          title: "",
          customerId: "",
          companyId: "",
          estimatedValue: undefined,
          currency: "USD",
          expectedCloseDate: undefined,
          ownerId: currentUser?.id ?? "",
        });
      }
    }
  }, [open, deal, reset, currentUser]);

  const mutation = isEdit ? updateMutation : createMutation;
  const isLoading = mutation.isPending || isSubmitting;

  function cleanPayload(data: Record<string, any>) {
    const payload = { ...data };
    if (!payload.companyId) delete payload.companyId;
    if (!payload.expectedCloseDate) delete payload.expectedCloseDate;
    if (!payload.estimatedValue) delete payload.estimatedValue;
    return payload;
  }

  async function onSubmit(data: Record<string, any>) {
    try {
      const payload = cleanPayload(data);
      if (isEdit && deal) {
        await updateMutation.mutateAsync({ id: deal.id, data: payload } as any);
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
          <DialogTitle>{isEdit ? "Editar negocio" : "Nueva oportunidad"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualizá los datos del negocio."
              : "Completá los datos para crear una nueva oportunidad."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel>
                <Label htmlFor="title">Título *</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="title"
                  placeholder="Título del negocio"
                  {...register("title")}
                  aria-invalid={!!errors.title}
                />
                <FieldError errors={[errors.title]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="customerId">Cliente *</Label>
              </FieldLabel>
              <FieldContent>
                <Select
                  value={customerIdValue ?? ""}
                  onValueChange={(val: any) =>
                    setValue("customerId", val === "" ? "" : val, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c: { id: string; fullName: string }) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.customerId]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="estimatedValue">Valor estimado</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="estimatedValue"
                  type="number"
                  placeholder="0"
                  {...register("estimatedValue")}
                  aria-invalid={!!errors.estimatedValue}
                />
                <FieldError errors={[errors.estimatedValue]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="currency">Moneda</Label>
              </FieldLabel>
              <FieldContent>
                <Select
                  value={currencyValue}
                  onValueChange={(val: any) => setValue("currency", val, { shouldValidate: true })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.currency]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="expectedCloseDate">Fecha estimada de cierre</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="expectedCloseDate"
                  type="date"
                  value={toDateInputValue(expectedCloseDateValue)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setValue(
                      "expectedCloseDate",
                      val ? new Date(val + "T00:00:00.000Z").toISOString() : undefined,
                      { shouldValidate: true },
                    );
                  }}
                  aria-invalid={!!errors.expectedCloseDate}
                />
                <FieldError errors={[errors.expectedCloseDate]} />
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
                    setValue("ownerId", val === "" ? "" : val, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u: { id: string; fullName: string }) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.ownerId]} />
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
                  : "Crear oportunidad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
