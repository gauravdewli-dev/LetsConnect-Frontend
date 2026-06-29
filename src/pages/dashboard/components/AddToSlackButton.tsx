import { setCachedConnectionStatus } from "@/lib/connectionCache";
import { Button } from "@/atoms/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { ensureFreshAccessToken } from "@/services/api";

import { disconnectSlack, getIntegrationConnectUrl } from "../api";
import { useConnections } from "../hooks/useConnections";
import { setFetchStatusSuccess } from "../slice";

export default function AddToSlackButton() {
  const dispatch = useAppDispatch();
  const { status } = useConnections();

  const slackConfigured = status?.slack_configured ?? false;
  const slackConnected = status?.slack_connected ?? false;

  async function connect() {
    if (!slackConfigured || slackConnected) return;
    try {
      await ensureFreshAccessToken();
      const url = await getIntegrationConnectUrl("slack");
      window.location.href = url;
    } catch {
      // Connection timeout strip handles stuck OAuth elsewhere on the dashboard.
    }
  }

  async function disconnect() {
    const nextStatus = await disconnectSlack();
    setCachedConnectionStatus(nextStatus);
    dispatch(setFetchStatusSuccess(nextStatus));
  }

  if (!slackConfigured) {
    return (
      <Button variant="secondary" disabled className="w-full">
        Slack not configured
      </Button>
    );
  }

  if (slackConnected) {
    return (
      <Button variant="outline" onClick={() => void disconnect()} className="w-full">
        Disconnect Slack
      </Button>
    );
  }

  return (
    <Button variant="secondary" onClick={() => void connect()} className="w-full">
      Add to Slack
    </Button>
  );
}
