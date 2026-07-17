"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsController = void 0;
const settings_service_1 = require("./settings.service");
exports.settingsController = {
    async getOrganization(req, res) {
        const organizationId = req.user.organizationId;
        const settings = await settings_service_1.settingsService.getOrganizationSettings(organizationId);
        res.status(200).json({
            success: true,
            data: settings,
        });
    },
    async updateOrganization(req, res) {
        const organizationId = req.user.organizationId;
        const data = req.body;
        const settings = await settings_service_1.settingsService.updateOrganizationSettings(organizationId, data);
        res.status(200).json({
            success: true,
            data: settings,
        });
    },
};
//# sourceMappingURL=settings.controller.js.map