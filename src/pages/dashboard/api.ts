import apiService, { API_URL } from "@/services/api";
import type {
  ChatHistoryResponse,
  ChatRequest,
  ChatResponse,
  ConnectionStatusResponse,
} from "@/types";

export const getStatus = () =>
  apiService.get<ConnectionStatusResponse>("/api/status").then((r) => r.data);

export const backfillConnectionProfiles = () =>
  apiService
    .post<ConnectionStatusResponse>("/api/connections/backfill-profiles")
    .then((r) => r.data);

export const getChatMessages = (params?: { limit?: number; before?: string }) =>
  apiService
    .get<ChatHistoryResponse>("/api/chat/messages", { params })
    .then((r) => r.data);

export const postChat = (payload: ChatRequest) =>
  apiService.post<ChatResponse>("/api/chat", payload).then((r) => r.data);

export const disconnectGmail = () =>
  apiService.delete<{ message: string }>("/api/gmail").then((r) => r.data);

export const disconnectSlack = () =>
  apiService.delete<{ message: string }>("/api/slack").then((r) => r.data);

export const disconnectJira = () =>
  apiService.delete<{ message: string }>("/api/jira").then((r) => r.data);

export { API_URL };
