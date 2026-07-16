export interface OrganizationSettings {
  id: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  timezone?: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  avatarUrl?: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
