import { apiClient } from "./api-client";

export interface UserLookup {
  id: string;
  fullName: string;
}

export const usersService = {
  getUsers() {
    return apiClient
      .get<UserLookup[]>("/users/lookup")
      .then((res) => res.data);
  },
};
