import { AppError } from '../../shared/errors/AppError';
import { settingsRepository } from './settings.repository';
import type { OrganizationSettingsDTO, UpdateOrganizationSettingsDTO } from './settings.dto';

function toSettingsDTO(org: {
  id: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}): OrganizationSettingsDTO {
  return {
    id: org.id,
    name: org.name,
    logoUrl: org.logoUrl,
    primaryColor: org.primaryColor,
    timezone: org.timezone,
    createdAt: org.createdAt.toISOString(),
    updatedAt: org.updatedAt.toISOString(),
  };
}

export const settingsService = {
  async getOrganizationSettings(organizationId: string): Promise<OrganizationSettingsDTO> {
    const org = await settingsRepository.findByOrganizationId(organizationId);
    if (!org) {
      throw new AppError(404, 'ORGANIZATION_NOT_FOUND', 'Organización no encontrada');
    }
    return toSettingsDTO(org);
  },

  async updateOrganizationSettings(
    organizationId: string,
    data: UpdateOrganizationSettingsDTO,
  ): Promise<OrganizationSettingsDTO> {
    const org = await settingsRepository.findByOrganizationId(organizationId);
    if (!org) {
      throw new AppError(404, 'ORGANIZATION_NOT_FOUND', 'Organización no encontrada');
    }

    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.logoUrl !== undefined) {
      updateData.logoUrl = data.logoUrl === '' ? null : data.logoUrl;
    }
    if (data.primaryColor !== undefined) {
      updateData.primaryColor = data.primaryColor;
    }
    if (data.timezone !== undefined) {
      updateData.timezone = data.timezone;
    }

    const updated = await settingsRepository.update(organizationId, updateData);
    return toSettingsDTO(updated);
  },
};
