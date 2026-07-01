import { apiClient } from "./api-client";
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  AuthResponse,
  RefreshResponse,
  User,
} from "@/types/auth";

export const authService = {
  register(data: RegisterInput) {
    return apiClient.post<AuthResponse>("/auth/register", data);
  },

  login(data: LoginInput) {
    return apiClient.post<AuthResponse>("/auth/login", data);
  },

  refresh() {
    return apiClient.post<RefreshResponse>("/auth/refresh");
  },

  logout() {
    return apiClient.post("/auth/logout");
  },

  forgotPassword(data: ForgotPasswordInput) {
    return apiClient.post("/auth/forgot-password", data);
  },

  resetPassword(data: ResetPasswordInput) {
    return apiClient.post("/auth/reset-password", data);
  },

  getMe() {
    return apiClient.get<User>("/auth/me");
  },
};
