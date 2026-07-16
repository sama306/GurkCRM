import { dashboardRepository } from './dashboard.repository';
import type { DashboardSummaryDTO, RecentActivityItemDTO } from './dashboard.dto';

export const dashboardService = {
  async getSummary(
    organizationId: string,
    userId: string,
  ): Promise<DashboardSummaryDTO> {
    const [activeCustomers, openDeals, wonDealsValueThisMonth, myPendingTasks] =
      await Promise.all([
        dashboardRepository.countActiveCustomers(organizationId),
        dashboardRepository.countOpenDeals(organizationId),
        dashboardRepository.sumWonDealsThisMonth(organizationId),
        dashboardRepository.countPendingTasks(organizationId, userId),
      ]);

    return { activeCustomers, openDeals, wonDealsValueThisMonth, myPendingTasks };
  },

  async getRecentActivity(
    organizationId: string,
    limit?: number,
  ): Promise<RecentActivityItemDTO[]> {
    const items = await dashboardRepository.getRecentActivity(
      organizationId,
      limit,
    );
    return items.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      descriptionText: item.descriptionText,
      createdAt: item.createdAt.toISOString(),
    }));
  },
};
