import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { ConnectionsState, ConnectionStatusResponse } from "@/types";

import {
  triggerFetchStatus,
  triggerInitializeConnections,
} from "./sagaActions";

const initialState: ConnectionsState = {
  status: null,
  loading: false,
  refreshing: false,
  error: null,
  connecting: null,
  connectTimedOut: null,
};

function isIntegrationConnected(
  provider: NonNullable<ConnectionsState["connecting"]>,
  status: ConnectionStatusResponse,
): boolean {
  if (provider === "gmail") return status.gmail_connected;
  if (provider === "jira") return status.jira_connected;
  return status.slack_connected && status.slack_send_as_user;
}

const slice = createSlice({
  name: "connections",
  initialState,
  reducers: {
    hydrateConnectionStatus(state, action: PayloadAction<ConnectionStatusResponse>) {
      if (!state.status) {
        state.status = action.payload;
      }
    },
    setConnecting(state, action: PayloadAction<ConnectionsState["connecting"]>) {
      state.connecting = action.payload;
      if (action.payload) {
        state.connectTimedOut = null;
      }
    },
    clearConnecting(state) {
      state.connecting = null;
    },
    setConnectTimedOut(state, action: PayloadAction<ConnectionsState["connectTimedOut"]>) {
      state.connectTimedOut = action.payload;
      state.connecting = null;
    },
    clearConnectTimedOut(state) {
      state.connectTimedOut = null;
    },
    setFetchStatusSuccess(state, action: PayloadAction<ConnectionStatusResponse>) {
      state.status = action.payload;
      state.loading = false;
      state.refreshing = false;
      if (state.connecting && isIntegrationConnected(state.connecting, action.payload)) {
        state.connecting = null;
        state.connectTimedOut = null;
      }
    },
    setFetchStatusFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.refreshing = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(triggerFetchStatus, (state) => {
        if (state.status) {
          state.refreshing = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(triggerInitializeConnections, (state) => {
        if (state.status) {
          state.refreshing = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      });
  },
});

export default {
  name: "connections",
  reducer: slice.reducer,
};

export const {
  hydrateConnectionStatus,
  setConnecting,
  clearConnecting,
  setConnectTimedOut,
  clearConnectTimedOut,
  setFetchStatusSuccess,
  setFetchStatusFailure,
} = slice.actions;
