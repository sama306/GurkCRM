export interface DashboardSummaryDTO {
  activeCustomers: number;
  openDeals: number;
  wonDealsValueThisMonth: number;
  myPendingTasks: number;
}

export interface RecentActivityItemDTO {
  id: string;
  type: 'CUSTOMER' | 'DEAL' | 'TASK';
  title: string;
  descriptionText: string;
  createdAt: string;
}
