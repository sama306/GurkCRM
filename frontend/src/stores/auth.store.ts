import { create } from "zustand";
import type { User } from "@/types/auth";
import { authService } from "@/services/auth.service";
import { setApiToken, onApiRefreshFail } from "@/services/api-client";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  onApiRefreshFail(() => {
    set({ user: null, accessToken: null, isAuthenticated: false });
  });

  return {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,

    setAuth: (user, accessToken) => {
      setApiToken(accessToken);
      set({ user, accessToken, isAuthenticated: true });
    },

    clearAuth: () => {
      setApiToken(null);
      set({ user: null, accessToken: null, isAuthenticated: false });
    },

    initializeAuth: async () => {
      set({ isLoading: true });

      try {
        const refreshRes = await authService.refresh();
        const accessToken = refreshRes.data.accessToken;
        setApiToken(accessToken);

        const meRes = await authService.getMe();
        const user = meRes.data;

        set({ user, accessToken, isAuthenticated: true, isLoading: false });
      } catch {
        setApiToken(null);
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    },
  };
});
