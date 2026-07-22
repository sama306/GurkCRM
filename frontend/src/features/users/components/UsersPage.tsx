import { useState, useEffect } from "react";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { useUsersList, useUpdateUser, useRoles } from "@/features/users/hooks/useUsersManagement";
import { UsersTable } from "./UsersTable";
import { Pagination } from "@/features/companies/components/Pagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuthStore } from "@/stores/auth.store";
import { canManageUsers } from "@/utils/permissions";
import { InviteUserDialog } from "@/features/invitations/components/InviteUserDialog";
import { PendingInvitationsList } from "@/features/invitations/components/PendingInvitationsList";
import type { UserFilters, UpdateUserInput } from "@/types/user";

export function UsersPage() {
  return (
    <QueryProvider>
      <UsersPageContent />
    </QueryProvider>
  );
}

const ROLE_OPTIONS = [
  { value: "", label: "Todos los roles" },
  { value: "OWNER", label: "Owner" },
  { value: "ADMIN", label: "Admin" },
  { value: "SALES", label: "Sales" },
  { value: "VIEWER", label: "Viewer" },
];

function UsersPageContent() {
  const [search, setSearch] = useState("");
  const [roleName, setRoleName] = useState("");
  const [page, setPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);

  const currentUser = useAuthStore((s) => s.user);
  const actorRole = currentUser?.roleName ?? "VIEWER";
  const showInvite = canManageUsers(actorRole);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleName]);

  const filters: UserFilters = {
    search: debouncedSearch || undefined,
    roleName: roleName || undefined,
    page,
    limit: 20,
  };

  const { data, isLoading, isError } = useUsersList(filters);
  const { data: roles } = useRoles();
  const updateMutation = useUpdateUser();

  const users = data?.data ?? [];
  const meta = data?.meta;

  function handleUpdateUser(id: string, update: UpdateUserInput) {
    updateMutation.mutate({ id, data: update });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
        {showInvite && (
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="size-4" />
            Invitar usuario
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar usuarios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={roleName} onValueChange={setRoleName}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <UsersTable
        users={users}
        roles={roles ?? []}
        isLoading={isLoading}
        isError={isError}
        onUpdateUser={handleUpdateUser}
        isUpdating={updateMutation.isPending}
      />

      {meta && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          onPageChange={setPage}
        />
      )}

      <PendingInvitationsList />

      {showInvite && (
        <InviteUserDialog
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          roles={roles ?? []}
          actorRole={actorRole}
        />
      )}
    </div>
  );
}
