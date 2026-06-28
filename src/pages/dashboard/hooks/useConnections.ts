import { useCallback } from "react";

import { triggerStartStatusPoll, triggerStopStatusPoll } from "@/pages/dashboard/sagaActions";
import {
  getConnectingIntegration,
  getConnectionStatus,
  getConnectionsError,
  getConnectionsLoading,
  getConnectionsPolling,
  getConnectionsRefreshing,
} from "@/pages/dashboard/selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function useConnections() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(getConnectionStatus);
  const loading = useAppSelector(getConnectionsLoading);
  const refreshing = useAppSelector(getConnectionsRefreshing);
  const error = useAppSelector(getConnectionsError);
  const polling = useAppSelector(getConnectionsPolling);
  const connecting = useAppSelector(getConnectingIntegration);

  const startPoll = useCallback(
    () => dispatch(triggerStartStatusPoll()),
    [dispatch],
  );
  const stopPoll = useCallback(() => dispatch(triggerStopStatusPoll()), [dispatch]);

  return { status, loading, refreshing, error, polling, connecting, startPoll, stopPoll };
}
