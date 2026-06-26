import IntegrationNodes from "./IntegrationNodes";
import SlackChatGuide from "./SlackChatGuide";
import SlackSetupGuide from "./SlackSetupGuide";
import { useConnections } from "../hooks/useConnections";

export default function DashboardConnections() {
  const { status } = useConnections();
  const slackReady = status?.slack_connected;

  return (
    <div className="space-y-6 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
      <div>
        <h1 className="text-xl font-semibold">Connected accounts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add integrations for your AI assistant. Gmail and Slack are available today — Jira and
          Teams coming soon.
        </p>
      </div>

      <IntegrationNodes />

      {slackReady && (
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 px-4 py-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Slack connected</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>LetsConnect app</strong> — chat with your AI assistant in Slack (same as Text
              chat). Find it under <strong>Apps → LetsConnect</strong>.
            </li>
            <li>
              <strong>Send as you</strong> — when you ask to DM someone, the message appears in your
              normal Slack conversations.
            </li>
            <li>
              Reconnect Slack if the card above shows <strong>Reconnect required</strong>.
            </li>
          </ul>
        </div>
      )}

      <SlackChatGuide />

      <SlackSetupGuide />
    </div>
  );
}
