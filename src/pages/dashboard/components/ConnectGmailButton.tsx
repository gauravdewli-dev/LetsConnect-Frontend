import { API_URL } from "@/pages/dashboard/api";
import { Button } from "@/atoms/ui/button";
import { getToken } from "@/models/auth-model/selectors";
import { useAppSelector } from "@/store/hooks";

import { useConnections } from "../hooks/useConnections";

export default function ConnectGmailButton() {
  const token = useAppSelector(getToken);
  const { status } = useConnections();
  const gmailConnected = status?.gmail_connected ?? false;

  function connect() {
    if (!token || gmailConnected) return;
    window.location.href = `${API_URL}/gmail/connect?token=${encodeURIComponent(token)}`;
  }

  return (
    <Button onClick={connect} disabled={gmailConnected} className="w-full">
      {gmailConnected ? "Gmail connected" : "Connect Gmail"}
    </Button>
  );
}
