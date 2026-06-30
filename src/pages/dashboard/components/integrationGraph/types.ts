import type { ConnectionStatusResponse } from "@/types";

export type IntegrationId = "gmail" | "slack" | "jira";

export type HubSide = "top" | "left" | "right" | "bottom";

/** Which hub handle each integration uses when connected. */
export const HUB_HANDLE_BY_INTEGRATION: Record<IntegrationId, HubSide> = {
  gmail: "left",
  slack: "right",
  jira: "bottom",
};

/** Integration handle that faces the hub for each default layout. */
export const INTEGRATION_HANDLE_BY_ID: Record<IntegrationId, HubSide> = {
  gmail: "right",
  slack: "left",
  jira: "top",
};

export function hubSourceHandle(side: HubSide): string {
  return `hub-out-${side}`;
}

export function hubTargetHandle(side: HubSide): string {
  return `hub-in-${side}`;
}

export function integrationSourceHandle(side: HubSide): string {
  return `int-out-${side}`;
}

export function integrationTargetHandle(side: HubSide): string {
  return `int-in-${side}`;
}

export function edgeHandlesForIntegration(id: IntegrationId): {
  sourceHandle: string;
  targetHandle: string;
} {
  const hubSide = HUB_HANDLE_BY_INTEGRATION[id];
  const intSide = INTEGRATION_HANDLE_BY_ID[id];
  return {
    sourceHandle: hubSourceHandle(hubSide),
    targetHandle: integrationTargetHandle(intSide),
  };
}

export type HubNodeData = {
  label: string;
  subtitle: string;
  username?: string;
  active?: boolean;
};

export type IntegrationNodeData = {
  kind: IntegrationId;
  label: string;
  subtitle: string;
  username?: string;
  detail?: string;
  connected: boolean;
  connectable: boolean;
  connecting?: boolean;
  warning?: string;
  onDisconnect?: () => void;
};

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function hubIdentity(status: ConnectionStatusResponse, fallbackEmail?: string | null): {
  username?: string;
  subtitle: string;
} {
  const username =
    status.gmail_display_name ||
    (status.slack_connected ? status.slack_display_name : null) ||
    status.jira_display_name ||
    (status.gmail_email ? nameFromEmail(status.gmail_email) : null) ||
    (fallbackEmail ? nameFromEmail(fallbackEmail) : null);

  const subtitle =
    status.gmail_email ||
    fallbackEmail ||
    (status.slack_connected ? status.slack_team_name : null) ||
    status.jira_site_name ||
    "Your assistant";

  return { username: username ?? undefined, subtitle: subtitle ?? "Your assistant" };
}

export function integrationLinked(id: IntegrationId, status: ConnectionStatusResponse): boolean {
  switch (id) {
    case "gmail":
      return status.gmail_connected && status.calendar_connected;
    case "slack":
      return status.slack_connected;
    case "jira":
      return status.jira_connected;
  }
}

export function integrationStatus(
  id: IntegrationId,
  status: ConnectionStatusResponse,
): {
  connected: boolean;
  connectable: boolean;
  subtitle: string;
  username?: string;
  detail?: string;
  warning?: string;
} {
  switch (id) {
    case "gmail": {
      const needsCalendar = status.gmail_connected && !status.calendar_connected;
      return {
        connected: status.gmail_connected && status.calendar_connected,
        connectable: true,
        subtitle: needsCalendar
          ? "Enable Calendar"
          : status.gmail_connected
            ? "Connected"
            : "Drag to LetsConnect",
        username: status.gmail_connected
          ? status.gmail_display_name || (status.gmail_email ? nameFromEmail(status.gmail_email) : undefined)
          : undefined,
        detail: status.gmail_connected ? status.gmail_email || undefined : undefined,
        warning: needsCalendar ? "Reconnect" : undefined,
      };
    }
    case "slack": {
      const ready = status.slack_connected && status.slack_send_as_user;
      const needsReconnect = status.slack_connected && !status.slack_send_as_user;
      return {
        connected: ready,
        connectable: status.slack_configured,
        subtitle: needsReconnect
          ? "Reconnect required"
          : status.slack_configured
            ? "Drag to LetsConnect"
            : "Not configured",
        username: ready ? status.slack_display_name || undefined : undefined,
        detail: ready ? status.slack_team_name || undefined : undefined,
        warning: needsReconnect ? "Reconnect" : !status.slack_configured ? "Dev setup" : undefined,
      };
    }
    case "jira":
      return {
        connected: status.jira_connected,
        connectable: status.jira_configured,
        subtitle: status.jira_configured ? "Drag to LetsConnect" : "Not configured",
        username: status.jira_connected ? status.jira_display_name || undefined : undefined,
        detail: status.jira_connected
          ? status.jira_site_name || status.jira_site_url || undefined
          : undefined,
        warning: !status.jira_configured ? "Dev setup" : undefined,
      };
  }
}

export const POSITIONS_STORAGE_KEY = "letsconnect-graph-positions";

export const DEFAULT_POSITIONS: Record<string, { x: number; y: number }> = {
  hub: { x: 320, y: 220 },
  gmail: { x: 80, y: 80 },
  slack: { x: 560, y: 80 },
  jira: { x: 320, y: 420 },
};
