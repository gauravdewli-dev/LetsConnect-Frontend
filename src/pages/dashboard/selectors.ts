import { createSelector } from "@reduxjs/toolkit";

import type { ConnectionsState } from "@/types";

type ConnectionsRootState = { connections: ConnectionsState };

export const getConnectionsState = (state: ConnectionsRootState) => state.connections;

export const getConnectionStatus = createSelector(getConnectionsState, (c) => c.status);
export const getConnectionsLoading = createSelector(getConnectionsState, (c) => c.loading);
export const getConnectionsError = createSelector(getConnectionsState, (c) => c.error);
export const getConnectionsPolling = createSelector(getConnectionsState, (c) => c.polling);
