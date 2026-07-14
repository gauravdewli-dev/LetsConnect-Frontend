import type { ConnectionStatusResponse } from "@/types";

const STATUS_CACHE_KEY = "lc-connection-status";
const CONNECTING_KEY = "lc-connecting";
const CONNECTING_STARTED_KEY = "lc-connecting-started-at";

export type ConnectingProvider = "gmail" | "slack" | "jira" | "github";

/** Abandon in-progress sign-in after 1 minute if OAuth is not completed. */
export const CONNECTING_TIMEOUT_MS = 60 * 1000;

export const DEFAULT_CONNECTION_STATUS: ConnectionStatusResponse = {
  gmail_connected: false,
  gmail_email: null,
  gmail_display_name: null,
  calendar_connected: false,
  slack_connected: false,
  slack_configured: false,
  slack_send_as_user: false,
  slack_team_id: null,
  slack_team_name: null,
  slack_display_name: null,
  slack_open_url: null,
  jira_connected: false,
  jira_site_url: null,
  jira_site_name: null,
  jira_display_name: null,
  jira_configured: false,
  jira_oauth_callback_url: null,
  github_connected: false,
  github_login: null,
  github_display_name: null,
  github_configured: false,
  github_oauth_callback_url: null,
};

export function getCachedConnectionStatus(): ConnectionStatusResponse | null {
  try {
    const raw = localStorage.getItem(STATUS_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConnectionStatusResponse;
  } catch {
    return null;
  }
}

export function setCachedConnectionStatus(status: ConnectionStatusResponse): void {
  localStorage.setItem(STATUS_CACHE_KEY, JSON.stringify(status));
}

function readConnectingProviderRaw(): ConnectingProvider | null {
  const value = sessionStorage.getItem(CONNECTING_KEY);
  if (value === "gmail" || value === "slack" || value === "jira" || value === "github") {
    return value;
  }
  return null;
}

export function getConnectingStartedAt(): number | null {
  const raw = sessionStorage.getItem(CONNECTING_STARTED_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isConnectingExpired(at = Date.now()): boolean {
  const started = getConnectingStartedAt();
  if (!started) return false;
  return at - started >= CONNECTING_TIMEOUT_MS;
}

export function getConnectingRemainingMs(at = Date.now()): number {
  const started = getConnectingStartedAt();
  if (!started) return 0;
  return Math.max(0, CONNECTING_TIMEOUT_MS - (at - started));
}

export function clearConnectingProvider(): void {
  sessionStorage.removeItem(CONNECTING_KEY);
  sessionStorage.removeItem(CONNECTING_STARTED_KEY);
}

export function setConnectingProvider(provider: ConnectingProvider): void {
  sessionStorage.setItem(CONNECTING_KEY, provider);
  sessionStorage.setItem(CONNECTING_STARTED_KEY, String(Date.now()));
}

/** Returns active in-progress provider, or null if none / expired (and clears storage). */
export function getConnectingProvider(): ConnectingProvider | null {
  const provider = readConnectingProviderRaw();
  if (!provider) return null;
  if (isConnectingExpired()) {
    clearConnectingProvider();
    return null;
  }
  return provider;
}

/** If the user abandoned sign-in past the timeout, returns that provider once and clears storage. */
export function consumeStaleConnecting(): ConnectingProvider | null {
  const provider = readConnectingProviderRaw();
  if (!provider) return null;
  if (!isConnectingExpired()) return null;
  clearConnectingProvider();
  return provider;
}

export const CONNECTING_LABELS: Record<ConnectingProvider, string> = {
  gmail: "Gmail",
  slack: "Slack",
  jira: "Jira",
  github: "GitHub",
};
