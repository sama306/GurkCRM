export interface DashboardSummary {
  activeCustomers: number;
  openDeals: number;
  wonDealsValueThisMonth: number;
  myPendingTasks: number;
}

export interface RecentActivityItem {
  id: string;
  type: 'CUSTOMER' | 'DEAL' | 'TASK';
  title: string;
  descriptionText: string;
  createdAt: string;
}
