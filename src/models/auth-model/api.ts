import apiService from "@/services/api";
import type { LoginPayload, SignupPayload, TokenResponse, UserResponse } from "@/types";

export interface SignupResponse {
  requires_verification: boolean;
  message: string;
}

export const login = (payload: LoginPayload) =>
  apiService.post<TokenResponse>("/auth/login", payload).then((r) => r.data);

export const signup = (payload: SignupPayload) =>
  apiService.post<SignupResponse>("/auth/signup", payload).then((r) => r.data);

export const verifyEmail = (email: string, otp: string) =>
  apiService.post<TokenResponse>("/auth/verify-email", { email, otp }).then((r) => r.data);

export const resendVerification = (email: string) =>
  apiService.post<{ message: string }>("/auth/resend-verification", { email }).then((r) => r.data);

export const refresh = (refresh_token: string) =>
  apiService.post<TokenResponse>("/auth/refresh", { refresh_token }).then((r) => r.data);

export const logoutApi = (refresh_token: string) =>
  apiService.post<{ message: string }>("/auth/logout", { refresh_token }).then((r) => r.data);

export const forgotPassword = (email: string) =>
  apiService.post<{ message: string }>("/auth/forgot-password", { email }).then((r) => r.data);

export const resetPassword = (payload: { email: string; otp: string; new_password: string }) =>
  apiService.post<{ message: string }>("/auth/reset-password", payload).then((r) => r.data);

export const me = () => apiService.get<UserResponse>("/auth/me").then((r) => r.data);
