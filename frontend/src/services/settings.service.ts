import { apiClient } from "./api-client";
import type { OrganizationSettings, UpdateOrganizationInput } from "@/types/settings";

export const settingsService = {
  getOrganizationSettings() {
    return apiClient
      .get<OrganizationSettings>("/settings/organization")
      .then((res) => res.data);
  },

  updateOrganizationSettings(data: UpdateOrganizationInput) {
    return apiClient
      .patch<OrganizationSettings>("/settings/organization", data)
      .then((res) => res.data);
  },
};
