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
  error: string | null;
  polling: boolean;
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
