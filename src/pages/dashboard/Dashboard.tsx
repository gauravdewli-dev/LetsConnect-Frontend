import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/atoms/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/atoms/ui/card";
import { useAuth } from "@/pages/auth-management/hooks/useAuth";

import AddToSlackButton from "./components/AddToSlackButton";
import ConnectGmailButton from "./components/ConnectGmailButton";
import ConnectionStatus from "./components/ConnectionStatus";
import SlackChatGuide from "./components/SlackChatGuide";
import SlackSetupGuide from "./components/SlackSetupGuide";
import { useConnections } from "./hooks/useConnections";

export default function Dashboard() {
  const navigate = useNavigate();
  const { token, fetchMe, signOut } = useAuth();
  const { status, startPoll, stopPoll } = useConnections();

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [fetchMe, token]);

  useEffect(() => {
    startPoll();
    return () => {
      stopPoll();
    };
  }, [startPoll, stopPoll]);

  function handleLogout() {
    signOut();
    navigate("/login");
  }

  const slackReady = status?.slack_connected;

  return (
    <div className="mx-auto mt-8 max-w-2xl space-y-6 px-4 pb-12">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>
              Connect Gmail and Slack — then ask about your inbox directly in Slack.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <ConnectionStatus />
          <div className="flex flex-col gap-2 sm:flex-row">
            <ConnectGmailButton />
            <AddToSlackButton />
          </div>
          {slackReady && (
            <p className="text-sm text-muted-foreground">
              You&apos;re all set. Open Slack and DM the bot to start chatting about your emails.
            </p>
          )}
        </CardContent>
      </Card>

      <SlackSetupGuide />
      <SlackChatGuide />
    </div>
  );
}
