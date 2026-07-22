import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { createInvitationSchema } from "@/features/invitations/schemas/invitation.schema";
import { useCreateInvitation } from "@/features/invitations/hooks/useInvitations";
import type { RoleOption } from "@/services/users.service";

type FormData = z.infer<typeof createInvitationSchema>;

interface InviteUserDialogProps {
  open: boolean;
  onClose: () => void;
  roles: RoleOption[];
  actorRole: string;
}

const ROLE_ORDER = ["OWNER", "ADMIN", "SALES", "VIEWER"];
const ROLE_LABEL: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  SALES: "Sales",
  VIEWER: "Viewer",
};

function sortRolesByOrder(roles: RoleOption[]): RoleOption[] {
  return [...roles].sort((a, b) => {
    return ROLE_ORDER.indexOf(a.name) - ROLE_ORDER.indexOf(b.name);
  });
}

function availableRoles(actorRole: string, roles: RoleOption[]): RoleOption[] {
  const sorted = sortRolesByOrder(roles);
  if (actorRole === "ADMIN") {
    return sorted.filter((r) => r.name !== "OWNER" && r.name !== "ADMIN");
  }
  return sorted;
}

export function InviteUserDialog({ open, onClose, roles, actorRole }: InviteUserDialogProps) {
  const createMutation = useCreateInvitation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: { email: "", roleId: "" },
  });

  const roleOptions = useMemo(() => availableRoles(actorRole, roles), [actorRole, roles]);
  const roleIdValue = watch("roleId");

  useEffect(() => {
    if (open) {
      reset({ email: "", roleId: "" });
    }
  }, [open, reset]);

  const isLoading = createMutation.isPending || isSubmitting;

  async function onSubmit(data: FormData) {
    try {
      await createMutation.mutateAsync(data);
      onClose();
    } catch {
      // error handled by mutation onError toast
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invitar usuario</DialogTitle>
          <DialogDescription>
            Enviá una invitación por email para que se una a la organización.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel>
                <Label htmlFor="email">Email *</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@ejemplo.com"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                <FieldError errors={[errors.email]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label htmlFor="role">Rol *</Label>
              </FieldLabel>
              <FieldContent>
                <Select
                  value={roleIdValue}
                  onValueChange={(val: string) => setValue("roleId", val, { shouldValidate: true })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {ROLE_LABEL[r.name] ?? r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.roleId]} />
              </FieldContent>
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Invitar usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
