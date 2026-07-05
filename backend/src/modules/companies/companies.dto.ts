export interface CompanyResponseDTO {
  id: string;
  organizationId: string;
  name: string;
  industry: string | null;
  website: string | null;
  address: string | null;
  size: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyDTO {
  name: string;
  industry?: string;
  website?: string;
  address?: string;
  size?: string;
  status: string;
}

export interface UpdateCompanyDTO {
  name?: string;
  industry?: string;
  website?: string;
  address?: string;
  size?: string;
  status?: string;
}

export interface ListCompaniesFilters {
  page?: number;
  limit?: number;
  search?: string;
  industry?: string;
  status?: string;
  size?: string;
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
