import { MessageSquare } from "lucide-react";

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
  "Summarize my latest unread emails",
  "Search emails from this week",
];

export default function SlackChatGuide() {
  const { status } = useConnections();

  const gmailConnected = status?.gmail_connected ?? false;
  const slackConnected = status?.slack_connected ?? false;
  const ready = gmailConnected && slackConnected;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          Chat in Slack
        </CardTitle>
        <CardDescription>
          Gmail questions are handled in Slack — message the bot and replies come back there.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {!gmailConnected && (
          <p className="text-muted-foreground">Connect Gmail above so the agent can read your inbox.</p>
        )}
        {gmailConnected && !slackConnected && (
          <p className="text-muted-foreground">
            Click <strong>Add to Slack</strong> above, then open a DM with the app bot.
          </p>
        )}
        {ready && (
          <>
            <p className="text-muted-foreground">
              Open Slack → <strong>Apps</strong> → your bot → send a direct message. You can also
              @mention the bot in a channel.
            </p>
            <div>
              <p className="mb-2 font-medium">Try asking:</p>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {EXAMPLES.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
