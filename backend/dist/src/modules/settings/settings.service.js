"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const settings_repository_1 = require("./settings.repository");
function toSettingsDTO(org) {
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
exports.settingsService = {
    async getOrganizationSettings(organizationId) {
        const org = await settings_repository_1.settingsRepository.findByOrganizationId(organizationId);
        if (!org) {
            throw new AppError_1.AppError(404, 'ORGANIZATION_NOT_FOUND', 'Organización no encontrada');
        }
        return toSettingsDTO(org);
    },
    async updateOrganizationSettings(organizationId, data) {
        const org = await settings_repository_1.settingsRepository.findByOrganizationId(organizationId);
        if (!org) {
            throw new AppError_1.AppError(404, 'ORGANIZATION_NOT_FOUND', 'Organización no encontrada');
        }
        const updateData = {};
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
        const updated = await settings_repository_1.settingsRepository.update(organizationId, updateData);
        return toSettingsDTO(updated);
    },
};
//# sourceMappingURL=settings.service.js.map