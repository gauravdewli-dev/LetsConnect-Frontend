import { useCallback } from "react";

import { triggerStartStatusPoll, triggerStopStatusPoll } from "@/pages/dashboard/sagaActions";
import {
  getConnectionStatus,
  getConnectionsError,
  getConnectionsLoading,
  getConnectionsPolling,
} from "@/pages/dashboard/selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function useConnections() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(getConnectionStatus);
  const loading = useAppSelector(getConnectionsLoading);
  const error = useAppSelector(getConnectionsError);
  const polling = useAppSelector(getConnectionsPolling);

  const startPoll = useCallback(
    () => dispatch(triggerStartStatusPoll()),
    [dispatch],
  );
  const stopPoll = useCallback(() => dispatch(triggerStopStatusPoll()), [dispatch]);

  return { status, loading, error, polling, startPoll, stopPoll };
}
