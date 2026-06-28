import { createSelector } from "@reduxjs/toolkit";

import type { ConnectionsState } from "@/types";

type ConnectionsRootState = { connections: ConnectionsState };

export const getConnectionsState = (state: ConnectionsRootState) => state.connections;

export const getConnectionStatus = createSelector(getConnectionsState, (c) => c.status);
export const getConnectionsLoading = createSelector(getConnectionsState, (c) => c.loading);
export const getConnectionsRefreshing = createSelector(getConnectionsState, (c) => c.refreshing);
export const getConnectionsError = createSelector(getConnectionsState, (c) => c.error);
export const getConnectionsPolling = createSelector(getConnectionsState, (c) => c.polling);
export const getConnectingIntegration = createSelector(getConnectionsState, (c) => c.connecting);
export const getConnectTimedOut = createSelector(getConnectionsState, (c) => c.connectTimedOut);
