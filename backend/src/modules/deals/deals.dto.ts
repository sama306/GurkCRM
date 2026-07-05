export const DEAL_STAGES = [
  'NEW',
  'CONTACTED',
  'MEETING',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST',
] as const;

export type DealStage = typeof DEAL_STAGES[number];

export interface DealResponseDTO {
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

export interface DealCardDTO {
  id: string;
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
}

export type DealBoardDTO = Record<string, DealCardDTO[]>;

export interface CreateDealDTO {
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

export interface UpdateDealDTO {
  title?: string;
  customerId?: string;
  companyId?: string | null;
  ownerId?: string;
  estimatedValue?: number;
  currency?: string;
  expectedCloseDate?: string | null;
}

export interface ChangeStageDTO {
  stage: string;
  position: number;
  lostReason?: string;
}

export interface ListDealsFilters {
  page?: number;
  limit?: number;
  search?: string;
  stage?: string;
  ownerId?: string;
  customerId?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
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
