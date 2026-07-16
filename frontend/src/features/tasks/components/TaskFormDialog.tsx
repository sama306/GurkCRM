import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  createTaskSchema,
  updateTaskSchema,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "@/features/tasks/schemas/task.schema";
import { useCreateTask, useUpdateTask } from "@/features/tasks/hooks/useTasks";
import { useUsers } from "@/hooks/useUsers";
import { useCustomers } from "@/features/customers/hooks/useCustomers";
import { useDeals } from "@/features/deals/hooks/useDeals";
import type { Task } from "@/types/task";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  task?: Task;
}

const PRIORITY_OPTIONS = TASK_PRIORITIES.map((p) => ({
  value: p,
  label: p === "LOW" ? "Baja" : p === "MEDIUM" ? "Media" : "Alta",
}));

const STATUS_OPTIONS = TASK_STATUSES.map((s) => ({
  value: s,
  label:
    s === "PENDING"
      ? "Pendiente"
      : s === "IN_PROGRESS"
        ? "En progreso"
        : "Completada",
}));

export function TaskFormDialog({ open, onClose, task }: TaskFormDialogProps) {
  const isEdit = !!task;
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const { data: usersData } = useUsers();
  const { data: customersData } = useCustomers({ limit: 200, sortBy: "fullName", order: "asc" });
  const { data: dealsData } = useDeals({ limit: 200, sortBy: "title", order: "asc" });
  const currentUser = useAuthStore((s) => s.user);

  const users = usersData ?? [];
  const customers = customersData?.data ?? [];
  const deals = dealsData?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isEdit ? updateTaskSchema : createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      assigneeId: "",
      relatedCustomerId: undefined,
      relatedDealId: undefined,
      priority: "MEDIUM",
      status: "PENDING",
      dueDate: undefined,
    },
  });

  const priorityValue = watch("priority");
  const statusValue = watch("status");
  const assigneeIdValue = watch("assigneeId");
  const relatedCustomerIdValue = watch("relatedCustomerId");
  const relatedDealIdValue = watch("relatedDealId");
  const dueDateValue = watch("dueDate");

  useEffect(() => {
    if (open) {
      if (task) {
        reset({
          title: task.title,
          description: task.description ?? "",
          assigneeId: task.assigneeId,
          relatedCustomerId: task.relatedCustomerId ?? undefined,
          relatedDealId: task.relatedDealId ?? undefined,
          priority: task.priority as any,
          status: task.status as any,
          dueDate: task.dueDate ?? undefined,
        } as any);
      } else {
        reset({
          title: "",
          description: "",
          assigneeId: currentUser?.id ?? "",
          relatedCustomerId: undefined,
          relatedDealId: undefined,
          priority: "MEDIUM",
          status: "PENDING",
          dueDate: undefined,
        });
      }
    }
  }, [open, task, reset, currentUser]);

  const mutation = isEdit ? updateMutation : createMutation;
  const isLoading = mutation.isPending || isSubmitting;

  function cleanPayload(data: Record<string, any>) {
    const payload = { ...data };
    if (!payload.description) delete payload.description;
    if (!payload.relatedCustomerId) delete payload.relatedCustomerId;
    if (!payload.relatedDealId) delete payload.relatedDealId;
    if (!payload.dueDate) delete payload.dueDate;
    return payload;
  }

  async function onSubmit(data: Record<string, any>) {
    try {
      const payload = cleanPayload(data);
      if (isEdit && task) {
        await updateMutation.mutateAsync({ id: task.id, data: payload } as any);
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
          <DialogTitle>{isEdit ? "Editar tarea" : "Nueva tarea"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualizá los datos de la tarea."
              : "Completá los datos para crear una nueva tarea."}
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
                  placeholder="Título de la tarea"
                  {...register("title")}
                  aria-invalid={!!errors.title}
                />
                <FieldError errors={[errors.title]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="description">Descripción</Label>
              </FieldLabel>
              <FieldContent>
                <textarea
                  id="description"
                  placeholder="Descripción de la tarea..."
                  rows={3}
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive"
                  {...register("description")}
                  aria-invalid={!!errors.description}
                />
                <FieldError errors={[errors.description]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="assigneeId">Asignado a *</Label>
              </FieldLabel>
              <FieldContent>
                <Select
                  value={assigneeIdValue ?? ""}
                  onValueChange={(val: any) =>
                    setValue("assigneeId", val === "" ? "" : val, { shouldValidate: true })
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
                <FieldError errors={[errors.assigneeId]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="priority">Prioridad *</Label>
              </FieldLabel>
              <FieldContent>
                <Select
                  value={priorityValue}
                  onValueChange={(val: any) => setValue("priority", val, { shouldValidate: true })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.priority]} />
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
                <Label htmlFor="dueDate">Fecha límite</Label>
              </FieldLabel>
              <FieldContent>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDateValue && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {dueDateValue
                        ? format(new Date(dueDateValue), "dd MMM yyyy", { locale: es })
                        : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDateValue ? new Date(dueDateValue) : undefined}
                      onSelect={(date) =>
                        setValue(
                          "dueDate",
                          date ? date.toISOString() : undefined,
                          { shouldValidate: true },
                        )
                      }
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
                <FieldError errors={[errors.dueDate]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="relatedCustomerId">Cliente relacionado</Label>
              </FieldLabel>
              <FieldContent>
                <Select
                  value={relatedCustomerIdValue ?? ""}
                  onValueChange={(val: any) =>
                    setValue("relatedCustomerId", val === "" ? undefined : val, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sin cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin cliente</SelectItem>
                    {customers.map((c: { id: string; fullName: string }) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.relatedCustomerId]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="relatedDealId">Negocio relacionado</Label>
              </FieldLabel>
              <FieldContent>
                <Select
                  value={relatedDealIdValue ?? ""}
                  onValueChange={(val: any) =>
                    setValue("relatedDealId", val === "" ? undefined : val, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sin negocio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin negocio</SelectItem>
                    {deals.map((d: { id: string; title: string }) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.relatedDealId]} />
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
                  : "Crear tarea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
