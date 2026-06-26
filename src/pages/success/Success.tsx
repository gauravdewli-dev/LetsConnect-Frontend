import { ExternalLink } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/atoms/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/atoms/ui/card";

export default function Success() {
  const [params] = useSearchParams();
  const provider = params.get("provider") || "account";
  const connected = params.get("connected");
  const error = params.get("error");
  const isSlack = provider === "slack";

  return (
    <div className="mx-auto mt-12 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Connection {connected ? "successful" : "result"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {connected && (
            <p className="text-sm text-green-600">
              {provider === "gmail" ? "Gmail" : "Slack"} connected successfully.
            </p>
          )}
          {connected && isSlack && (
            <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Open LetsConnect in Slack</p>
              <p className="mt-1">
                The <strong>LetsConnect</strong> app was added to your workspace. Check your Slack
                DMs — you should have a welcome message from LetsConnect.
              </p>
              <p className="mt-2">
                Or go to Slack → <strong>Apps</strong> → <strong>LetsConnect</strong> and start
                chatting. It&apos;s the same assistant as Text chat on the dashboard.
              </p>
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive break-words">Connection failed: {error}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {connected && isSlack && (
            <Button asChild variant="secondary" className="w-full">
              <a href="https://slack.com/signin" target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                Open Slack
              </a>
            </Button>
          )}
          <Button asChild className="w-full">
            <Link to="/">Back to dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
