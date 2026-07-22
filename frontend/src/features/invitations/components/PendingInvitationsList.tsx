import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XCircle, Mail, Users } from "lucide-react";
import { useInvitations, useRevokeInvitation } from "@/features/invitations/hooks/useInvitations";
import { useAuthStore } from "@/stores/auth.store";
import { canManageUsers } from "@/utils/permissions";

const ROLE_BADGE: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
  OWNER: { variant: "default", label: "Owner" },
  ADMIN: { variant: "secondary", label: "Admin" },
  SALES: { variant: "outline", label: "Sales" },
  VIEWER: { variant: "destructive", label: "Viewer" },
};

function formatExpiry(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Hoy";
  if (days === 1) return "1 día";
  return `${days} días`;
}

export function PendingInvitationsList() {
  const currentUser = useAuthStore((s) => s.user);
  const actorRole = currentUser?.roleName ?? "VIEWER";
  const canRevoke = canManageUsers(actorRole);

  const { data: invitations, isLoading, isError } = useInvitations("PENDING");
  const revokeMutation = useRevokeInvitation();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">Invitaciones pendientes</h2>
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">Invitaciones pendientes</h2>
        <p className="text-sm text-destructive">Error al cargar invitaciones.</p>
      </div>
    );
  }

  if (!invitations || invitations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">Invitaciones pendientes</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Invitó</TableHead>
            <TableHead>Expira</TableHead>
            {canRevoke && <TableHead className="w-[80px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((inv) => {
            const rb = ROLE_BADGE[inv.roleName] ?? { variant: "outline" as const, label: inv.roleName };

            return (
              <TableRow key={inv.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground" />
                    <span>{inv.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={rb.variant}>{rb.label}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {inv.invitedByName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatExpiry(inv.expiresAt)}
                </TableCell>
                {canRevoke && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      title="Revocar invitación"
                      disabled={revokeMutation.isPending}
                      onClick={() => revokeMutation.mutate(inv.id)}
                    >
                      <XCircle className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
