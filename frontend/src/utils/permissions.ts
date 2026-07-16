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

export function canExport(role: string): boolean {
  return roleAtLeast(role, "SALES");
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
    canExport: canExport(role),
  };
}

/**
 * Task permissions — a diferencia de canEdit/canDelete genéricos que solo
 * miran el rol, estas funciones reciben la task completa + userId del
 * usuario autenticado, porque el permiso depende de datos del recurso:
 *  - ADMIN/OWNER → siempre true
 *  - SALES        → true solo si task.assigneeId === userId
 *  - VIEWER       → siempre false
 */

export function canEditTask(
  userRole: string,
  userId: string,
  task: { assigneeId: string },
): boolean {
  if (userRole === "ADMIN" || userRole === "OWNER") return true;
  if (userRole === "SALES") return task.assigneeId === userId;
  return false;
}

export function canDeleteTask(
  userRole: string,
  userId: string,
  task: { assigneeId: string },
): boolean {
  if (userRole === "ADMIN" || userRole === "OWNER") return true;
  if (userRole === "SALES") return task.assigneeId === userId;
  return false;
}
