import apiService from "@/services/api";
import type { LoginPayload, SignupPayload, TokenResponse, UserResponse } from "@/types";

export const login = (payload: LoginPayload) =>
  apiService.post<TokenResponse>("/auth/login", payload).then((r) => r.data);

export const signup = (payload: SignupPayload) =>
  apiService.post<TokenResponse>("/auth/signup", payload).then((r) => r.data);

export const me = () => apiService.get<UserResponse>("/auth/me").then((r) => r.data);
