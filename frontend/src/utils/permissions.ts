import { useAuthStore } from "@/stores/auth.store";

const ROLES = ["VIEWER", "SALES", "ADMIN", "OWNER"] as const;
type Role = (typeof ROLES)[number];

function roleAtLeast(userRole: string, minimum: Role): boolean {
  return ROLES.indexOf(userRole as Role) >= ROLES.indexOf(minimum);
}

/**
 * Companies / Customers / Contacts / Deals: Sales+ puede crear y editar,
 * Admin+ puede eliminar, Viewer solo lectura.
 */

export function canCreate(role: string): boolean {
  return roleAtLeast(role, "SALES");
}

export function canEdit(role: string): boolean {
  return roleAtLeast(role, "SALES");
}

export function canDelete(role: string): boolean {
  return roleAtLeast(role, "ADMIN");
}

/**
 * Hook que expone los permisos del usuario autenticado.
 * Reutilizable en cualquier componente de módulo comercial.
 */
export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const role = user?.roleName ?? "VIEWER";

  return {
    role,
    canCreate: canCreate(role),
    canEdit: canEdit(role),
    canDelete: canDelete(role),
  };
}
