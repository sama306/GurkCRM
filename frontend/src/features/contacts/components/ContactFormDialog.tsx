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
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  createContactSchema,
  updateContactSchema,
} from "@/features/contacts/schemas/contact.schema";
import {
  useCreateContact,
  useUpdateContact,
} from "@/features/contacts/hooks/useContacts";
import type { Contact } from "@/types/contact";

interface ContactFormDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  contact?: Contact;
}

export function ContactFormDialog({
  open,
  onClose,
  companyId,
  contact,
}: ContactFormDialogProps) {
  const isEdit = !!contact;
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isEdit ? updateContactSchema : createContactSchema),
    defaultValues: {
      fullName: "",
      position: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (contact) {
        reset({
          fullName: contact.fullName,
          position: contact.position ?? "",
          email: contact.email ?? "",
          phone: contact.phone ?? "",
        });
      } else {
        reset({
          fullName: "",
          position: "",
          email: "",
          phone: "",
        });
      }
    }
  }, [open, contact, reset]);

  const mutation = isEdit ? updateMutation : createMutation;
  const isLoading = mutation.isPending || isSubmitting;

  function cleanPayload(data: Record<string, any>) {
    const payload = { ...data };
    for (const key of ["position", "email", "phone"]) {
      if (!payload[key]) delete payload[key];
    }
    return payload;
  }

  async function onSubmit(data: Record<string, any>) {
    try {
      const payload = cleanPayload(data);
      if (isEdit && contact) {
        await updateMutation.mutateAsync({
          id: contact.id,
          data: payload,
          companyId,
        } as any);
      } else {
        await createMutation.mutateAsync({ companyId, data: payload } as any);
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
          <DialogTitle>
            {isEdit ? "Editar contacto" : "Nuevo contacto"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualizá los datos del contacto."
              : "Completá los datos para agregar un nuevo contacto."}
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
                <Label htmlFor="position">Cargo</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="position"
                  placeholder="Ej: CEO, CTO..."
                  {...register("position")}
                  aria-invalid={!!errors.position}
                />
                <FieldError errors={[errors.position]} />
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
                  placeholder="correo@ejemplo.com"
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
                  type="tel"
                  placeholder="+54 11 5555-5555"
                  {...register("phone")}
                  aria-invalid={!!errors.phone}
                />
                <FieldError errors={[errors.phone]} />
              </FieldContent>
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? isEdit
                  ? "Actualizando..."
                  : "Creando..."
                : isEdit
                  ? "Guardar cambios"
                  : "Crear contacto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
