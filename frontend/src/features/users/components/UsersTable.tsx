import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";
import type { User, UpdateUserInput } from "@/types/user";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

interface RoleEntry {
  roleId: string;
  roleName: string;
}

function buildRoleMap(users: User[]): RoleEntry[] {
  const seen = new Set<string>();
  const map: RoleEntry[] = [];
  for (const u of users) {
    if (!seen.has(u.roleId)) {
      seen.add(u.roleId);
      map.push({ roleId: u.roleId, roleName: u.roleName });
    }
  }
  return map.sort((a, b) => {
    const order = ["OWNER", "ADMIN", "SALES", "VIEWER"];
    return order.indexOf(a.roleName) - order.indexOf(b.roleName);
  });
}

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  isError: boolean;
  onUpdateUser: (id: string, data: UpdateUserInput) => void;
  isUpdating: boolean;
}

const ROLE_BADGE: Record<
  string,
  { variant: "default" | "secondary" | "outline" | "destructive"; label: string }
> = {
  OWNER: { variant: "default", label: "Owner" },
  ADMIN: { variant: "secondary", label: "Admin" },
  SALES: { variant: "outline", label: "Sales" },
  VIEWER: { variant: "destructive", label: "Viewer" },
};

function LoadingSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="w-[100px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: 5 }).map((_, j) => (
              <TableCell key={j}>
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Users className="size-12 text-muted-foreground/40" />
      <h3 className="mt-4 text-lg font-semibold">
        No se encontraron usuarios
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        No hay usuarios que coincidan con los filtros.
      </p>
    </div>
  );
}

function canActorEditRole(
  actorRole: string,
  targetRole: string,
): boolean {
  if (actorRole === "OWNER") return true;
  if (actorRole === "ADMIN")
    return targetRole === "SALES" || targetRole === "VIEWER";
  return false;
}

function getHierarchyTooltip(
  actorRole: string,
  targetRole: string,
  isSelf: boolean,
): string | undefined {
  if (isSelf) return "No puedes cambiarte tu propio rol";
  if (actorRole === "ADMIN" && targetRole === "ADMIN")
    return "Solo un Owner puede modificar el rol de un Admin";
  if (actorRole === "ADMIN" && targetRole === "OWNER")
    return "Solo un Owner puede modificar el rol de un Owner";
  return undefined;
}

function getActiveToggleTooltip(
  actorRole: string,
  targetRole: string,
  isSelf: boolean,
  isActive: boolean,
): string | undefined {
  if (isSelf) return "No puedes desactivarte a ti mismo";
  if (actorRole === "ADMIN" && (targetRole === "ADMIN" || targetRole === "OWNER"))
    return "Solo un Owner puede activar o desactivar este usuario";
  return isActive ? "Desactivar usuario" : "Activar usuario";
}

export function UsersTable({
  users,
  isLoading,
  isError,
  onUpdateUser,
  isUpdating,
}: UsersTableProps) {
  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?.id ?? "";
  const actorRole = currentUser?.roleName ?? "VIEWER";

  if (isLoading) return <LoadingSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-destructive">
          Error al cargar los usuarios.
        </p>
      </div>
    );
  }

  if (users.length === 0) {
    return <EmptyState />;
  }

  const roleMap = buildRoleMap(users);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="w-[100px]">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const isSelf = user.id === currentUserId;
          const rb = ROLE_BADGE[user.roleName] ?? {
            variant: "outline" as const,
            label: user.roleName,
          };

          return (
            <TableRow
              key={user.id}
              className={cn(isSelf && "bg-muted/30")}
            >
              <TableCell className="font-medium">{user.fullName}</TableCell>
              <TableCell className="text-muted-foreground">
                {user.email}
              </TableCell>
              <TableCell>
                <Select
                  defaultValue={user.roleId}
                  disabled={!canActorEditRole(actorRole, user.roleName) || isUpdating}
                  onValueChange={(newRoleId) => {
                    if (newRoleId !== user.roleId) {
                      onUpdateUser(user.id, { roleId: newRoleId });
                    }
                  }}
                >
                  <SelectTrigger
                    className="h-7 w-[110px] text-xs"
                    title={getHierarchyTooltip(actorRole, user.roleName, isSelf)}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleMap.map((r) => (
                      <SelectItem key={r.roleId} value={r.roleId}>
                        {ROLE_BADGE[r.roleName]?.label ?? r.roleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <button
                  type="button"
                  disabled={!canActorEditRole(actorRole, user.roleName) || isUpdating}
                  title={getActiveToggleTooltip(actorRole, user.roleName, isSelf, user.isActive)}
                  onClick={() =>
                    onUpdateUser(user.id, { isActive: !user.isActive })
                  }
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    user.isActive
                      ? "bg-green-500"
                      : "bg-muted-foreground/30",
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block size-3.5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out",
                      user.isActive ? "translate-x-4" : "translate-x-0.5",
                    )}
                  />
                </button>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground/40 text-xs">—</span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
