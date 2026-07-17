import { QueryProvider } from "@/components/providers/QueryProvider";
import { ProfileForm } from "./ProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";

export function SettingsProfilePage() {
  return (
    <QueryProvider>
      <div className="mx-auto max-w-2xl space-y-8">
        <ProfileForm />
        <ChangePasswordForm />
      </div>
    </QueryProvider>
  );
}
