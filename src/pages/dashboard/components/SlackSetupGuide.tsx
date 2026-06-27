import { API_URL } from "@/pages/dashboard/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/atoms/ui/card";

import { useConnections } from "../hooks/useConnections";

export default function SlackSetupGuide() {
  const { status } = useConnections();

  if (status?.slack_configured) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Slack app setup</CardTitle>
        <CardDescription>
          Add these values to <code className="text-xs">LC-Backend/.env</code>, then restart the
          backend.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Create a Slack app at{" "}
            <a
              href="https://api.slack.com/apps"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              api.slack.com/apps
            </a>
            .
          </li>
          <li>
            OAuth redirect URL:{" "}
            <code className="rounded bg-muted px-1 text-xs">{API_URL}/slack/oauth/callback</code>
          </li>
          <li>
            Event Subscriptions → enable and set Request URL to{" "}
            <code className="rounded bg-muted px-1 text-xs">{API_URL}/slack/events</code>
            <span className="block mt-1">
              For local dev, expose the backend with ngrok and set{" "}
              <code className="text-xs">BACKEND_URL</code> to the public URL.
            </span>
          </li>
          <li>
            Subscribe to bot events: <code className="text-xs">message.im</code> and{" "}
            <code className="text-xs">app_mention</code>.
          </li>
          <li>
            Under <strong>OAuth &amp; Permissions → User Token Scopes</strong>, add:{" "}
            <code className="text-xs">chat:write</code>,{" "}
            <code className="text-xs">im:write</code>,{" "}
            <code className="text-xs">users:read</code>,{" "}
            <code className="text-xs">channels:history</code>,{" "}
            <code className="text-xs">channels:read</code>,{" "}
            <code className="text-xs">groups:history</code>,{" "}
            <code className="text-xs">groups:read</code>.
          </li>
          <li>
            Under <strong>App Home → Show Tabs</strong>, turn on the <strong>Messages Tab</strong> and
            check <strong>Allow users to send Slash commands and messages from the messages tab</strong>.
            Without this, Slack shows &quot;Sending messages to this app has been turned off.&quot;
          </li>
          <li>
            Under <strong>App Home</strong>, you can also enable the Home tab. Subscribe to{" "}
            <code className="text-xs">app_home_opened</code> under Event Subscriptions.
          </li>
          <li>
            Set display name to <strong>LetsConnect</strong> under Basic Information.
          </li>
          <li>
            <strong>Manage Distribution → Activate Public Distribution</strong> so users can connect
            from <em>any</em> Slack workspace. Without this, OAuth fails with{" "}
            <code className="text-xs">invalid_team_for_non_distributed_app</code> outside your dev
            workspace. You may need a privacy policy URL — use your deployed{" "}
            <code className="text-xs">/privacy</code> page.
          </li>
          <li>
            Copy <code className="text-xs">App ID</code> into{" "}
            <code className="text-xs">SLACK_APP_ID</code> in backend <code className="text-xs">.env</code>.
          </li>
          <li>
            Copy <code className="text-xs">Client ID</code>,{" "}
            <code className="text-xs">Client Secret</code>, and{" "}
            <code className="text-xs">Signing Secret</code> into{" "}
            <code className="text-xs">SLACK_CLIENT_ID</code>,{" "}
            <code className="text-xs">SLACK_CLIENT_SECRET</code>,{" "}
            <code className="text-xs">SLACK_SIGNING_SECRET</code>.
          </li>
        </ol>
      </CardContent>
    </Card>
  );
}
