export interface Customer {
  id: string;
  organizationId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: string;
  notes: string | null;
  companyId: string | null;
  companyName: string | null;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealSummary {
  id: string;
  title: string;
  stage: string;
  estimatedValue: number;
  currency: string;
}

export interface CustomerDetail extends Customer {
  deals: DealSummary[];
}

export interface CreateCustomerInput {
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  companyId?: string;
  ownerId?: string;
  status?: string;
}

export interface UpdateCustomerInput {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  companyId?: string | null;
  ownerId?: string;
  status?: string;
}

export interface CustomerFilters {
  search?: string;
  status?: string;
  ownerId?: string;
  companyId?: string;
  page?: number;
  limit?: number;
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
