import { Badge } from "@/atoms/ui/badge";
import { API_URL } from "@/pages/dashboard/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/atoms/ui/card";

import { useConnections } from "../hooks/useConnections";

export default function DeveloperSetupGuide() {
  const { status } = useConnections();
  const callbackUrl = status?.jira_oauth_callback_url || `${API_URL}/jira/oauth/callback`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Integration setup</CardTitle>
        <CardDescription>
          Configure integrations in <code className="text-xs">LC-Backend/.env</code>, then restart
          the backend.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-sm text-muted-foreground">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground">Gmail</h3>
            {status?.gmail_connected && <Badge variant="success">Connected</Badge>}
          </div>
          <p className="text-xs">
            Enable <strong>Gmail API</strong> and <strong>Google Calendar API</strong> in Google Cloud.
            Place OAuth credentials at{" "}
            <code className="text-xs">GMAIL_CREDENTIALS_PATH</code> (default{" "}
            <code className="text-xs">./credentials.json</code>). OAuth redirect:{" "}
            <code className="rounded bg-muted px-1 text-xs">{API_URL}/oauth/callback</code>.
            Reconnect Gmail if calendar scheduling fails with a permissions error.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground">Slack</h3>
            {status?.slack_configured ? (
              <Badge variant="success">Configured</Badge>
            ) : (
              <Badge variant="warning">Not configured</Badge>
            )}
          </div>
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
              <span className="mt-1 block">
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
              Under <strong>App Home → Show Tabs</strong>, turn on the <strong>Messages Tab</strong>{" "}
              and check{" "}
              <strong>Allow users to send Slash commands and messages from the messages tab</strong>.
            </li>
            <li>
              <strong>Manage Distribution → Activate Public Distribution</strong> so users can connect
              from any workspace.
            </li>
            <li>
              Set <code className="text-xs">SLACK_APP_ID</code>,{" "}
              <code className="text-xs">SLACK_CLIENT_ID</code>,{" "}
              <code className="text-xs">SLACK_CLIENT_SECRET</code>, and{" "}
              <code className="text-xs">SLACK_SIGNING_SECRET</code> in backend{" "}
              <code className="text-xs">.env</code>.
            </li>
          </ol>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground">Jira (developer keys)</h3>
            {status?.jira_configured ? (
              <Badge variant="success">Configured</Badge>
            ) : (
              <Badge variant="warning">Not configured</Badge>
            )}
          </div>
          <p className="text-xs">
            LetsConnect uses Atlassian OAuth 2.0 (3LO). Users connect their own Jira Cloud site from
            Connected accounts — register the app once and add keys to <code className="text-xs">.env</code>.
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Sign in at{" "}
              <a
                href="https://developer.atlassian.com/console/myapps"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                developer.atlassian.com/console/myapps
              </a>
              .
            </li>
            <li>
              Click <strong>Create</strong> → <strong>OAuth 2.0 integration</strong> → name it{" "}
              <strong>LetsConnect</strong> → Create.
            </li>
            <li>
              <strong>Permissions</strong> → <strong>Jira API</strong> → enable:{" "}
              <code className="text-xs">read:jira-work</code>,{" "}
              <code className="text-xs">write:jira-work</code>,{" "}
              <code className="text-xs">read:jira-user</code>,{" "}
              <code className="text-xs">offline_access</code>.
            </li>
            <li>
              <strong>Authorization</strong> → <strong>OAuth 2.0 (3LO)</strong> →{" "}
              <strong>Callback URLs</strong> → add exactly:
              <div className="mt-1 rounded border border-indigo-200 bg-indigo-50 px-2 py-1 font-mono text-xs break-all text-indigo-950">
                {callbackUrl}
              </div>
              <span className="mt-1 block">
                No trailing slash. Use <code className="text-xs">localhost</code>, not{" "}
                <code className="text-xs">127.0.0.1</code>. Click <strong>Save changes</strong>.
              </span>
            </li>
            <li>
              <strong>Settings</strong> → copy <strong>Client ID</strong> and <strong>Secret</strong>.
            </li>
            <li>
              Add to <code className="text-xs">LC-Backend/.env</code>:
              <pre className="mt-2 overflow-x-auto rounded bg-muted p-3 text-xs text-foreground">
{`JIRA_CLIENT_ID=your-client-id-here
JIRA_CLIENT_SECRET=your-client-secret-here`}
              </pre>
            </li>
            <li>Restart the backend, then use <strong>Connect Jira</strong> on Connected accounts.</li>
          </ol>
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900">
            <strong>&quot;The app&apos;s callback URL is invalid&quot;</strong> — register the URL
            above in Atlassian exactly. Error{" "}
            <code className="text-xs">redirect_uri is not registered</code> means the callback list
            is missing or truncated.
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
