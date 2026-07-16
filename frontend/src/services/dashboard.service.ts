import { apiClient } from "./api-client";
import type { DashboardSummary, RecentActivityItem } from "@/types/dashboard";

export const dashboardService = {
  getSummary() {
    return apiClient.get<DashboardSummary>("/dashboard/summary").then((res) => res.data);
  },

  getRecentActivity(limit?: number) {
    const params = limit ? { limit } : undefined;
    return apiClient.get<RecentActivityItem[]>("/dashboard/recent-activity", { params }).then((res) => res.data);
  },
};
