import { apiClient } from "./api-client";
import type { User, UpdateUserInput, UserFilters, PaginatedResult } from "@/types/user";

export interface RoleOption {
  id: string;
  name: string;
}

export interface UserLookup {
  id: string;
  fullName: string;
}

export const usersService = {
  getRoles() {
    return apiClient
      .get<RoleOption[]>("/users/roles")
      .then((res) => res.data);
  },

  getUsersForLookup() {
    return apiClient
      .get<UserLookup[]>("/users/lookup")
      .then((res) => res.data);
  },

  getUsers(filters: UserFilters) {
    return apiClient
      .get<PaginatedResult<User>>("/users", { params: filters })
      .then((res) => res.data);
  },

  getUserById(id: string) {
    return apiClient.get<User>(`/users/${id}`).then((res) => res.data);
  },

  updateUser(id: string, data: UpdateUserInput) {
    return apiClient.patch<User>(`/users/${id}`, data).then((res) => res.data);
  },

  updateMe(data: { fullName?: string; avatarUrl?: string | null }) {
    return apiClient.patch<User>("/users/me", data).then((res) => res.data);
  },

  changeMyPassword(data: { currentPassword: string; newPassword: string }) {
    return apiClient.patch<{ message: string }>("/users/me/password", data).then((res) => res.data);
  },
};
