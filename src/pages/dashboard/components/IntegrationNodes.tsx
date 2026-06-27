import type { ComponentType, ReactNode } from "react";
import { ArrowDown, ArrowRight, LogIn, Mail, MessageSquare, Plus } from "lucide-react";

import { Badge } from "@/atoms/ui/badge";
import { Button } from "@/atoms/ui/button";
import { cn } from "@/lib/utils";
import { getToken, getUser } from "@/models/auth-model/selectors";
import { API_URL } from "@/pages/dashboard/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { disconnectGmail, disconnectSlack } from "../api";
import { useConnections } from "../hooks/useConnections";
import { triggerFetchStatus } from "../sagaActions";

export default function IntegrationNodes() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(getToken);
  const user = useAppSelector(getUser);
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
  const slackReady = slackConnected && slackSendAsUser;

  function connectGmail() {
    if (!token || gmailConnected) return;
    window.location.href = `${API_URL}/gmail/connect?token=${encodeURIComponent(token)}`;
  }

  function connectSlack() {
    if (!token || !slackConfigured) return;
    window.location.href = `${API_URL}/slack/install?token=${encodeURIComponent(token)}`;
  }

  async function handleDisconnectGmail() {
    await disconnectGmail();
    dispatch(triggerFetchStatus());
  }

  async function handleDisconnectSlack() {
    await disconnectSlack();
    dispatch(triggerFetchStatus());
  }

  return (
    <div className="rounded-2xl border bg-gradient-to-b from-slate-50/80 to-white p-4 shadow-sm md:p-6">
      <p className="mb-6 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Connection flow
      </p>

      <div className="flex flex-col items-center gap-2 md:flex-row md:items-start md:justify-center md:gap-0">
        <FlowNode
          icon={LogIn}
          name="Account"
          description="Sign in with email and verify OTP"
          connected
          detail={user?.email || "Signed in"}
          accent="indigo"
        />

        <FlowArrow active />

        <FlowNode
          icon={Mail}
          name="Gmail"
          description="Read and search your inbox"
          connected={gmailConnected}
          detail={gmailConnected ? status.gmail_email || "Connected" : "Not connected"}
          accent="rose"
          action={
            gmailConnected ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => void handleDisconnectGmail()}
              >
                Disconnect
              </Button>
            ) : (
              <Button size="sm" className="w-full" onClick={connectGmail}>
                <Plus className="size-4" />
                Connect Gmail
              </Button>
            )
          }
        />

        <FlowArrow active={gmailConnected} />

        <FlowNode
          icon={MessageSquare}
          name="Slack"
          description="DM and channel messages as you"
          connected={slackReady}
          detail={
            slackNeedsReconnect
              ? "Reconnect required"
              : slackReady
                ? "Connected"
                : slackConfigured
                  ? "Not connected"
                  : "Not configured"
          }
          accent="violet"
          action={
            !slackConfigured ? (
              <Button variant="secondary" size="sm" className="w-full" disabled>
                Not configured
              </Button>
            ) : slackNeedsReconnect ? (
              <div className="flex w-full flex-col gap-2">
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
                Connect Slack
              </Button>
            )
          }
        />
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {slackReady
          ? "All set — open Text chat or message LetsConnect in Slack."
          : gmailConnected
            ? "Next: connect Slack to complete your setup."
            : "Connect Gmail, then Slack, to power your assistant."}
      </p>
    </div>
  );
}

function FlowArrow({ active }: { active: boolean }) {
  return (
    <>
      <div
        className={cn(
          "flex h-10 items-center justify-center md:h-auto md:w-14 md:shrink-0 md:px-1",
          active ? "text-indigo-500" : "text-slate-300",
        )}
        aria-hidden
      >
        <ArrowDown className="size-5 md:hidden" />
        <div className="hidden items-center md:flex">
          <div
            className={cn(
              "h-0.5 w-8 rounded-full",
              active ? "bg-indigo-400" : "bg-slate-200",
            )}
          />
          <ArrowRight className="size-5 shrink-0" />
        </div>
      </div>
    </>
  );
}

const ACCENT_STYLES = {
  indigo: {
    ring: "ring-indigo-200",
    icon: "bg-indigo-100 text-indigo-700",
    dot: "bg-indigo-500",
  },
  rose: {
    ring: "ring-rose-200",
    icon: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
  },
  violet: {
    ring: "ring-violet-200",
    icon: "bg-violet-100 text-violet-700",
    dot: "bg-violet-500",
  },
} as const;

function FlowNode({
  icon: Icon,
  name,
  description,
  connected,
  detail,
  accent,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  name: string;
  description: string;
  connected: boolean;
  detail: string;
  accent: keyof typeof ACCENT_STYLES;
  action?: ReactNode;
}) {
  const styles = ACCENT_STYLES[accent];

  return (
    <div className="flex w-full max-w-xs flex-col items-center md:w-52 md:shrink-0">
      <div
        className={cn(
          "relative flex w-full flex-col items-center rounded-2xl border bg-card p-4 shadow-sm transition-shadow",
          connected && `ring-2 ${styles.ring}`,
        )}
      >
        {connected && (
          <span
            className={cn("absolute right-3 top-3 size-2 rounded-full", styles.dot)}
            title="Connected"
          />
        )}

        <div
          className={cn(
            "mb-3 flex size-12 items-center justify-center rounded-xl",
            styles.icon,
          )}
        >
          <Icon className="size-6" />
        </div>

        <p className="font-semibold">{name}</p>
        <Badge variant={connected ? "success" : "warning"} className="mt-1.5 max-w-full truncate">
          {detail}
        </Badge>
        <p className="mt-2 text-center text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {action && <div className="mt-3 w-full px-1">{action}</div>}
    </div>
  );
}
