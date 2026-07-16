export interface User {
  id: string;
  organizationId: string;
  roleId: string;
  roleName: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserInput {
  roleId?: string;
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  isActive?: boolean;
  roleName?: string;
  page?: number;
  limit?: number;
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
