import axios, { AxiosError } from "axios";

import { API_URL, TOKEN_KEY } from "@/lib/constants/app-constants";
import type { ApiErrorBody } from "@/types";

/** Global axios instance shared by every feature's `api.ts` module. */
const apiService = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

apiService.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiService.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const detail = error.response?.data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((d) => d.msg).filter(Boolean).join(", ")
      : detail || error.message || "Request failed";
    return Promise.reject(new Error(message));
  },
);

export { API_URL };
export default apiService;
