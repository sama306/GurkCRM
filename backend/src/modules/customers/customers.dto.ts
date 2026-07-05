export interface CustomerResponseDTO {
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

export interface CustomerDetailDTO extends CustomerResponseDTO {
  deals: Array<{
    id: string;
    title: string;
    stage: string;
    estimatedValue: number;
    currency: string;
  }>;
}

export interface CreateCustomerDTO {
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  companyId?: string;
  ownerId?: string;
  status?: string;
}

export interface UpdateCustomerDTO {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  companyId?: string | null;
  ownerId?: string;
  status?: string;
}

export interface ListCustomersFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  ownerId?: string;
  companyId?: string;
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
