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
