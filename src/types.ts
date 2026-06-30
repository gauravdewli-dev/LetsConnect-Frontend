export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserResponse {
  id: number;
  email: string;
  created_at: string;
}

export interface ConnectionStatusResponse {
  gmail_connected: boolean;
  gmail_email: string | null;
  gmail_display_name: string | null;
  calendar_connected: boolean;
  slack_connected: boolean;
  slack_configured: boolean;
  slack_send_as_user: boolean;
  slack_team_id: string | null;
  slack_team_name: string | null;
  slack_display_name: string | null;
  slack_open_url: string | null;
  jira_connected: boolean;
  jira_site_url: string | null;
  jira_site_name: string | null;
  jira_display_name: string | null;
  jira_configured: boolean;
  jira_oauth_callback_url: string | null;
}

export interface ApiErrorDetail {
  msg?: string;
}

export interface ApiErrorBody {
  detail?: string | ApiErrorDetail[];
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: UserResponse | null;
  loading: boolean;
  error: string | null;
}

export interface ConnectionsState {
  status: ConnectionStatusResponse | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  connecting: "gmail" | "slack" | "jira" | null;
  connectTimedOut: "gmail" | "slack" | "jira" | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  toolsUsed?: string[];
  sentAt?: number;
  channel?: "web" | "slack";
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
}

export interface ChatResponse {
  reply: string;
  tools_used: string[];
  conversation_id: string;
}

export interface StoredChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  channel: "web" | "slack";
  tools_used: string[];
  created_at: string;
}

export interface ChatHistoryResponse {
  conversation_id: string;
  messages: StoredChatMessage[];
  next_cursor: string | null;
}

export interface ConnectUrlResponse {
  url: string;
}
