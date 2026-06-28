import { setCachedConnectionStatus } from "@/lib/connectionCache";
import { API_URL } from "@/pages/dashboard/api";
import { Button } from "@/atoms/ui/button";
import { getToken } from "@/models/auth-model/selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { disconnectSlack } from "../api";
import { useConnections } from "../hooks/useConnections";
import { setFetchStatusSuccess } from "../slice";

export default function AddToSlackButton() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(getToken);
  const { status } = useConnections();

  const slackConfigured = status?.slack_configured ?? false;
  const slackConnected = status?.slack_connected ?? false;

  function connect() {
    if (!token || !slackConfigured || slackConnected) return;
    window.location.href = `${API_URL}/slack/install?token=${encodeURIComponent(token)}`;
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
    <Button variant="secondary" onClick={connect} className="w-full">
      Add to Slack
    </Button>
  );
}
