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
      <a
        href="/app/settings"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Mi perfil
      </a>
      {canManageUsers(role) && (
        <a
          href="/app/settings/organization"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Organización
        </a>
      )}
    </>
  );
}
