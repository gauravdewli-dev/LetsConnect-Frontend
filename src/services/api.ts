import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { API_URL, REFRESH_TOKEN_KEY, TOKEN_KEY } from "@/lib/constants/app-constants";
import type { ApiErrorBody, TokenResponse } from "@/types";

/** Global axios instance shared by every feature's `api.ts` module. */
const apiService = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post<TokenResponse>(
      `${API_URL}/auth/refresh`,
      { refresh_token: refreshToken },
      { headers: { "Content-Type": "application/json" } },
    );
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    return data.access_token;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    return null;
  }
}

apiService.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiService.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const isAuthRoute = original?.url?.includes("/auth/login")
      || original?.url?.includes("/auth/signup")
      || original?.url?.includes("/auth/refresh")
      || original?.url?.includes("/auth/forgot-password")
      || original?.url?.includes("/auth/verify-email")
      || original?.url?.includes("/auth/resend-verification");

    if (
      error.response?.status === 401
      && original
      && !original._retry
      && !isAuthRoute
    ) {
      original._retry = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiService(original);
      }
    }

    const detail = error.response?.data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((d) => d.msg).filter(Boolean).join(", ")
      : detail || error.message || "Request failed";
    return Promise.reject(new Error(message));
  },
);

export { API_URL };
export default apiService;
