import { QueryProvider } from "@/components/providers/QueryProvider";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { OrganizationForm } from "./OrganizationForm";

export function SettingsOrganizationPage() {
  return (
    <QueryProvider>
      <RoleGuard allowedRoles={["ADMIN", "OWNER"]}>
        <div className="mx-auto max-w-2xl">
          <OrganizationForm />
        </div>
      </RoleGuard>
    </QueryProvider>
  );
}
