export interface Company {
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

export interface CreateCompanyInput {
  name: string;
  industry?: string;
  website?: string;
  address?: string;
  size?: string;
  status: string;
}

export interface UpdateCompanyInput {
  name?: string;
  industry?: string;
  website?: string;
  address?: string;
  size?: string;
  status?: string;
}

export interface CompanyFilters {
  search?: string;
  industry?: string;
  status?: string;
  size?: string;
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
