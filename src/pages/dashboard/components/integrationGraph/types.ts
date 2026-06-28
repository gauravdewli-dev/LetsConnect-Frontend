import type { ConnectionStatusResponse } from "@/types";

export type IntegrationId = "gmail" | "slack" | "jira";

export type HubNodeData = {
  label: string;
  subtitle: string;
  active?: boolean;
};

export type IntegrationNodeData = {
  kind: IntegrationId;
  label: string;
  subtitle: string;
  connected: boolean;
  connectable: boolean;
  connecting?: boolean;
  warning?: string;
  onDisconnect?: () => void;
};

export function integrationStatus(
  id: IntegrationId,
  status: ConnectionStatusResponse,
): { connected: boolean; connectable: boolean; subtitle: string; warning?: string } {
  switch (id) {
    case "gmail":
      return {
        connected: status.gmail_connected,
        connectable: true,
        subtitle: status.gmail_connected ? status.gmail_email || "Connected" : "Drag to LetsConnect",
      };
    case "slack": {
      const ready = status.slack_connected && status.slack_send_as_user;
      const needsReconnect = status.slack_connected && !status.slack_send_as_user;
      return {
        connected: ready,
        connectable: status.slack_configured,
        subtitle: needsReconnect
          ? "Reconnect required"
          : ready
            ? "Connected"
            : status.slack_configured
              ? "Drag to LetsConnect"
              : "Not configured",
        warning: needsReconnect ? "Reconnect" : !status.slack_configured ? "Dev setup" : undefined,
      };
    }
    case "jira":
      return {
        connected: status.jira_connected,
        connectable: status.jira_configured,
        subtitle: status.jira_connected
          ? status.jira_site_name || status.jira_site_url || "Connected"
          : status.jira_configured
            ? "Drag to LetsConnect"
            : "Not configured",
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
