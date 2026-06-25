import { Badge } from "@/atoms/ui/badge";

import { useConnections } from "../hooks/useConnections";

export default function ConnectionStatus() {
  const { status, loading, error } = useConnections();

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (loading && !status) {
    return <p className="text-sm text-muted-foreground">Loading status…</p>;
  }

  if (!status) {
    return null;
  }

  return (
    <div className="divide-y divide-border rounded-lg border">
      <StatusRow
        label="Gmail"
        connected={status.gmail_connected}
        detail={status.gmail_connected ? status.gmail_email || "Connected" : "Not connected"}
      />
      <StatusRow
        label="Slack"
        connected={status.slack_connected}
        detail={status.slack_connected ? "Connected" : "Not connected"}
      />
    </div>
  );
}

function StatusRow({
  label,
  connected,
  detail,
}: {
  label: string;
  connected: boolean;
  detail: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <Badge variant={connected ? "success" : "warning"}>{detail}</Badge>
    </div>
  );
}
