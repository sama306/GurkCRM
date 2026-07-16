import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => dashboardService.getSummary(),
  });
}

export function useRecentActivity(limit?: number) {
  return useQuery({
    queryKey: ["dashboard-recent-activity", limit],
    queryFn: () => dashboardService.getRecentActivity(limit),
  });
}
