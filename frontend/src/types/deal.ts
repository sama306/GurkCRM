export type DealStage = "NEW" | "CONTACTED" | "MEETING" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";

export interface Deal {
  id: string;
  organizationId: string;
  title: string;
  estimatedValue: number;
  currency: string;
  stage: string;
  expectedCloseDate: string | null;
  lostReason: string | null;
  position: number;
  customerId: string;
  customerName: string;
  companyId: string | null;
  companyName: string | null;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

export type DealBoard = Record<DealStage, Deal[]>;

export interface CreateDealInput {
  title: string;
  customerId: string;
  companyId?: string;
  ownerId?: string;
  estimatedValue?: number;
  currency?: string;
  stage?: string;
  expectedCloseDate?: string;
  lostReason?: string;
}

export interface UpdateDealInput {
  title?: string;
  customerId?: string;
  companyId?: string | null;
  ownerId?: string;
  estimatedValue?: number;
  currency?: string;
  expectedCloseDate?: string | null;
}

export interface ChangeStageInput {
  stage: string;
  position: number;
  lostReason?: string;
}

export interface DealFilters {
  page?: number;
  limit?: number;
  search?: string;
  stage?: string;
  ownerId?: string;
  customerId?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
