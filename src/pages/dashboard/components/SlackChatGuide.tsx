import { ExternalLink, MessageSquare } from "lucide-react";

import { Button } from "@/atoms/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/atoms/ui/card";

import { useConnections } from "../hooks/useConnections";

const EXAMPLES = [
  "How many unread emails do I have?",
  "Send a DM to Rohit saying hello",
  "Read the latest messages from #general",
];

export default function SlackChatGuide() {
  const { status } = useConnections();

  const slackConnected = status?.slack_connected ?? false;
  const slackSendAsUser = status?.slack_send_as_user ?? false;
  const slackOpenUrl = status?.slack_open_url;
  const ready = slackConnected && slackSendAsUser;

  if (!ready) {
    return null;
  }

  return (
    <Card className="border-indigo-100 bg-indigo-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4 text-indigo-600" />
          Chat with LetsConnect in Slack
        </CardTitle>
        <CardDescription>
          The same AI assistant as Text chat — now in your Slack workspace as the LetsConnect app.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          Open <strong>LetsConnect</strong> under <strong>Apps</strong> in Slack and send a direct
          message. You should have received a welcome message when you connected.
        </p>

        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          If Slack says <strong>&quot;Sending messages to this app has been turned off&quot;</strong>,
          go to{" "}
          <a
            href="https://api.slack.com/apps"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            api.slack.com/apps
          </a>{" "}
          → your app → <strong>App Home</strong> → enable <strong>Messages Tab</strong> and check{" "}
          <strong>Allow users to send Slash commands and messages from the messages tab</strong>.
          Then refresh Slack.
        </div>

        {slackOpenUrl ? (
          <Button asChild className="w-full sm:w-auto">
            <a href={slackOpenUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              Open LetsConnect in Slack
            </a>
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            Slack sidebar → <strong>More</strong> → <strong>Apps</strong> → <strong>LetsConnect</strong>
          </p>
        )}

        <div>
          <p className="mb-2 font-medium">Try asking in Slack:</p>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {EXAMPLES.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
