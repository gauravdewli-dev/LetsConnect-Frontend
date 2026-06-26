import type { ComponentType, ReactNode } from "react";
import { CheckCircle2, Mail, MessageSquare, Plus } from "lucide-react";

import { Badge } from "@/atoms/ui/badge";
import { Button } from "@/atoms/ui/button";
import { API_URL } from "@/pages/dashboard/api";
import { getToken } from "@/models/auth-model/selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { disconnectSlack } from "../api";
import { useConnections } from "../hooks/useConnections";
import { triggerFetchStatus } from "../sagaActions";

export default function IntegrationNodes() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(getToken);
  const { status, loading, error } = useConnections();

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (loading && !status) {
    return <p className="text-sm text-muted-foreground">Loading integrations…</p>;
  }

  if (!status) {
    return null;
  }

  const gmailConnected = status.gmail_connected;
  const slackConnected = status.slack_connected;
  const slackConfigured = status.slack_configured;
  const slackSendAsUser = status.slack_send_as_user;
  const slackNeedsReconnect = slackConnected && !slackSendAsUser;

  function connectGmail() {
    if (!token || gmailConnected) return;
    window.location.href = `${API_URL}/gmail/connect?token=${encodeURIComponent(token)}`;
  }

  function connectSlack() {
    if (!token || !slackConfigured) return;
    window.location.href = `${API_URL}/slack/install?token=${encodeURIComponent(token)}`;
  }

  async function handleDisconnectSlack() {
    await disconnectSlack();
    dispatch(triggerFetchStatus());
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <IntegrationNode
        icon={Mail}
        name="Gmail"
        description="Connect your inbox so the assistant can read and search email."
        connected={gmailConnected}
        detail={gmailConnected ? status.gmail_email || "Connected" : "Not connected"}
        action={
          gmailConnected ? (
            <Button variant="outline" size="sm" className="w-full" disabled>
              <CheckCircle2 className="size-4 text-green-600" />
              Connected
            </Button>
          ) : (
            <Button size="sm" className="w-full" onClick={connectGmail}>
              <Plus className="size-4" />
              Add Gmail
            </Button>
          )
        }
      />

      <IntegrationNode
        icon={MessageSquare}
        name="Slack"
        description="Send Slack DMs and channel messages as yourself from text chat."
        connected={slackConnected && slackSendAsUser}
        detail={
          slackNeedsReconnect
            ? "Reconnect required"
            : slackConnected
              ? "Connected"
              : slackConfigured
                ? "Not connected"
                : "Not configured"
        }
        action={
          !slackConfigured ? (
            <Button variant="secondary" size="sm" className="w-full" disabled>
              Not configured
            </Button>
          ) : slackNeedsReconnect ? (
            <div className="flex flex-col gap-2">
              <Button size="sm" className="w-full" onClick={connectSlack}>
                Reconnect Slack
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => void handleDisconnectSlack()}
              >
                Disconnect
              </Button>
            </div>
          ) : slackConnected ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => void handleDisconnectSlack()}
            >
              Disconnect
            </Button>
          ) : (
            <Button variant="secondary" size="sm" className="w-full" onClick={connectSlack}>
              <Plus className="size-4" />
              Add Slack
            </Button>
          )
        }
      />
    </div>
  );
}

function IntegrationNode({
  icon: Icon,
  name,
  description,
  connected,
  detail,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  name: string;
  description: string;
  connected: boolean;
  detail: string;
  action: ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-5 text-foreground" />
          </div>
          <div>
            <p className="font-semibold leading-none">{name}</p>
            <Badge variant={connected ? "success" : "warning"} className="mt-1.5">
              {detail}
            </Badge>
          </div>
        </div>
      </div>
      <p className="mb-4 flex-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
