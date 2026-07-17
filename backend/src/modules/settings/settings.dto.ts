export interface OrganizationSettingsDTO {
  id: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrganizationSettingsDTO {
  name?: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  timezone?: string;
}
