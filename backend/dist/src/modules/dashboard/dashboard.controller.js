"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = void 0;
const dashboard_service_1 = require("./dashboard.service");
exports.dashboardController = {
    async getSummary(req, res) {
        const { organizationId, id: userId } = req.user;
        const summary = await dashboard_service_1.dashboardService.getSummary(organizationId, userId);
        res.status(200).json({ success: true, data: summary });
    },
    async getRecentActivity(req, res) {
        const organizationId = req.user.organizationId;
        const limit = req.query.limit
            ? parseInt(req.query.limit, 10)
            : 10;
        const activity = await dashboard_service_1.dashboardService.getRecentActivity(organizationId, limit);
        res.status(200).json({ success: true, data: activity });
    },
};
//# sourceMappingURL=dashboard.controller.js.map