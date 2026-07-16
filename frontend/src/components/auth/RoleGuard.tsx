import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallbackUrl?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallbackUrl = "/app/dashboard",
}: RoleGuardProps) {
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const role = user?.roleName ?? "";

  useEffect(() => {
    if (!isLoading && role && !allowedRoles.includes(role)) {
      window.location.href = fallbackUrl;
    }
  }, [isLoading, role, allowedRoles, fallbackUrl]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
