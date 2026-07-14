import { useCallback, useEffect } from "react";

import {
  clearConnectingProvider,
  consumeStaleConnecting,
  getConnectingProvider,
  getConnectingRemainingMs,
  type ConnectingProvider,
} from "@/lib/connectionCache";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
  getConnectTimedOut,
  getConnectingIntegration,
  getConnectionStatus,
} from "../selectors";
import { clearConnecting, setConnectTimedOut, setConnecting } from "../slice";

function isProviderConnected(
  provider: ConnectingProvider,
  status: ReturnType<typeof getConnectionStatus>,
): boolean {
  if (!status) return false;
  if (provider === "gmail") return status.gmail_connected && status.calendar_connected;
  if (provider === "jira") return status.jira_connected;
  if (provider === "github") return status.github_connected;
  return status.slack_connected && status.slack_send_as_user;
}

export function useConnectionTimeout() {
  const dispatch = useAppDispatch();
  const connecting = useAppSelector(getConnectingIntegration);
  const connectTimedOut = useAppSelector(getConnectTimedOut);
  const status = useAppSelector(getConnectionStatus);

  const revokeConnecting = useCallback(
    (provider: ConnectingProvider) => {
      clearConnectingProvider();
      dispatch(clearConnecting());
      dispatch(setConnectTimedOut(provider));
    },
    [dispatch],
  );

  useEffect(() => {
    const stale = consumeStaleConnecting();
    if (stale) {
      dispatch(setConnectTimedOut(stale));
      dispatch(clearConnecting());
      return;
    }

    const pending = getConnectingProvider();
    if (pending) {
      dispatch(setConnecting(pending));
    }
  }, [dispatch]);

  useEffect(() => {
    if (!connecting) return;

    if (status && isProviderConnected(connecting, status)) {
      clearConnectingProvider();
      dispatch(clearConnecting());
      return;
    }

    const remaining = getConnectingRemainingMs();
    if (remaining <= 0) {
      revokeConnecting(connecting);
      return;
    }

    const timer = window.setTimeout(() => {
      revokeConnecting(connecting);
    }, remaining);

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (getConnectingRemainingMs() <= 0) {
        revokeConnecting(connecting);
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [connecting, dispatch, revokeConnecting, status]);

  return { connecting, connectTimedOut, revokeConnecting };
}
