import { apiClient } from "./api-client";
import type { User, UpdateUserInput, UserFilters, PaginatedResult } from "@/types/user";

export interface UserLookup {
  id: string;
  fullName: string;
}

export const usersService = {
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
};
