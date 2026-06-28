import { useCallback } from "react";

import { triggerFetchStatus } from "@/pages/dashboard/sagaActions";
import {
  getConnectingIntegration,
  getConnectionStatus,
  getConnectionsError,
  getConnectionsLoading,
  getConnectionsRefreshing,
} from "@/pages/dashboard/selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function useConnections() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(getConnectionStatus);
  const loading = useAppSelector(getConnectionsLoading);
  const refreshing = useAppSelector(getConnectionsRefreshing);
  const error = useAppSelector(getConnectionsError);
  const connecting = useAppSelector(getConnectingIntegration);

  const refreshStatus = useCallback(
    () => dispatch(triggerFetchStatus()),
    [dispatch],
  );

  return { status, loading, refreshing, error, connecting, refreshStatus };
}
