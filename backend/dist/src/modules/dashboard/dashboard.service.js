"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = void 0;
const dashboard_repository_1 = require("./dashboard.repository");
exports.dashboardService = {
    async getSummary(organizationId, userId) {
        const [activeCustomers, openDeals, wonDealsValueThisMonth, myPendingTasks] = await Promise.all([
            dashboard_repository_1.dashboardRepository.countActiveCustomers(organizationId),
            dashboard_repository_1.dashboardRepository.countOpenDeals(organizationId),
            dashboard_repository_1.dashboardRepository.sumWonDealsThisMonth(organizationId),
            dashboard_repository_1.dashboardRepository.countPendingTasks(organizationId, userId),
        ]);
        return { activeCustomers, openDeals, wonDealsValueThisMonth, myPendingTasks };
    },
    async getRecentActivity(organizationId, limit) {
        const items = await dashboard_repository_1.dashboardRepository.getRecentActivity(organizationId, limit);
        return items.map((item) => ({
            id: item.id,
            type: item.type,
            title: item.title,
            descriptionText: item.descriptionText,
            createdAt: item.createdAt.toISOString(),
        }));
    },
};
//# sourceMappingURL=dashboard.service.js.map