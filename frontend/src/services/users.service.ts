import { apiClient } from "./api-client";
import type { User } from "@/types/auth";

interface UsersResponse {
  data: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const usersService = {
  getUsers() {
    return apiClient
      .get<UsersResponse>("/users", { params: { limit: 200 } })
      .then((res) => res.data);
  },
};
