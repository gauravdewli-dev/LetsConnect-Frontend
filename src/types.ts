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
  slack_connected: boolean;
  slack_configured: boolean;
  slack_send_as_user: boolean;
  slack_team_id: string | null;
  slack_open_url: string | null;
  jira_connected: boolean;
  jira_site_url: string | null;
  jira_site_name: string | null;
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
  polling: boolean;
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
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
  tools_used: string[];
}
