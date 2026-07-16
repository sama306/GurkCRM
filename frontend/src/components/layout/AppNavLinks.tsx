import { useAuthStore } from "@/stores/auth.store";
import { canManageUsers } from "@/utils/permissions";

export function AppNavLinks() {
  const user = useAuthStore((s) => s.user);
  const role = user?.roleName ?? "VIEWER";

  return (
    <>
      {canManageUsers(role) && (
        <a
          href="/app/users"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Usuarios
        </a>
      )}
    </>
  );
}
