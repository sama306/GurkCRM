import type { UserResponseDTO } from '../auth/auth.dto';

export type { UserResponseDTO };

export interface UpdateOwnProfileInput {
  fullName?: string;
  avatarUrl?: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ListUsersFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  roleName?: string;
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
