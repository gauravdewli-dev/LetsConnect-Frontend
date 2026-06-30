import { Button } from "@/atoms/ui/button";
import { getToken } from "@/models/auth-model/selectors";
import { ensureFreshAccessToken } from "@/services/api";
import { useAppSelector } from "@/store/hooks";

import { getIntegrationConnectUrl } from "../api";
import { useConnections } from "../hooks/useConnections";

export default function ConnectGmailButton() {
  const token = useAppSelector(getToken);
  const { status } = useConnections();
  const gmailConnected = status?.gmail_connected ?? false;
  const calendarConnected = status?.calendar_connected ?? false;
  const needsCalendar = gmailConnected && !calendarConnected;

  async function connect() {
    if (!token) return;
    if (gmailConnected && calendarConnected) return;
    await ensureFreshAccessToken();
    const url = await getIntegrationConnectUrl("gmail");
    window.location.href = url;
  }

  const label = !gmailConnected
    ? "Connect Gmail"
    : needsCalendar
      ? "Enable Google Calendar"
      : "Gmail connected";

  return (
    <Button
      onClick={() => void connect()}
      disabled={gmailConnected && calendarConnected}
      className="w-full"
    >
      {label}
    </Button>
  );
}
