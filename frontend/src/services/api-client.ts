import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import type { RefreshResponse } from "@/types/auth";

const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/* ───── Token management (memoria, no localStorage) ───── */

let _accessToken: string | null = null;
let _onRefreshFail: (() => void) | null = null;

export function setApiToken(token: string | null) {
  _accessToken = token;
}

export function getApiToken(): string | null {
  return _accessToken;
}

export function onApiRefreshFail(cb: () => void) {
  _onRefreshFail = cb;
}

/* ───── Request interceptor ───── */

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

/* ───── Response interceptor (refresh flow) ───── */

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let _isRefreshing = false;
let _failedQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null) {
  _failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else {
      item.resolve(token!);
    }
  });
  _failedQueue = [];
}

async function attemptRefresh(): Promise<string> {
  const response = await apiClient.post<RefreshResponse>("/auth/refresh");
  const newToken = response.data.accessToken;
  setApiToken(newToken);
  return newToken;
}

/* ───── Response interceptor: unwrap { success, data } envelope ───── */

apiClient.interceptors.response.use((response) => {
  if (
    response.data &&
    typeof response.data === "object" &&
    "success" in response.data &&
    "data" in response.data
  ) {
    if ("meta" in response.data) {
      // Paginated response: preserve meta alongside data
      // so it becomes { data: T[], meta: { page, limit, total, totalPages } }
      response.data = { data: response.data.data, meta: response.data.meta };
    } else {
      // Single-resource response: unwrap directly
      response.data = response.data.data;
    }
  }
  return response;
});

/* ───── Response interceptor: refresh flow ───── */

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || "";

    if (url.includes("/auth/refresh") || url.includes("/auth/login")) {
      return Promise.reject(error);
    }

    if (_isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        _failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    _isRefreshing = true;
    originalRequest._retry = true;

    try {
      const newToken = await attemptRefresh();
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      setApiToken(null);
      _onRefreshFail?.();
      return Promise.reject(refreshError);
    } finally {
      _isRefreshing = false;
    }
  },
);
