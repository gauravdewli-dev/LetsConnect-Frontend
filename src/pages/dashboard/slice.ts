import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { ConnectionsState, ConnectionStatusResponse } from "@/types";

import {
  triggerFetchStatus,
  triggerStartStatusPoll,
  triggerStopStatusPoll,
} from "./sagaActions";

const initialState: ConnectionsState = {
  status: null,
  loading: false,
  error: null,
  polling: false,
};

const slice = createSlice({
  name: "connections",
  initialState,
  reducers: {
    setFetchStatusSuccess(state, action: PayloadAction<ConnectionStatusResponse>) {
      state.status = action.payload;
      state.loading = false;
    },
    setFetchStatusFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(triggerFetchStatus, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(triggerStartStatusPoll, (state) => {
        state.polling = true;
      })
      .addCase(triggerStopStatusPoll, (state) => {
        state.polling = false;
      });
  },
});

export default {
  name: "connections",
  reducer: slice.reducer,
};

export const { setFetchStatusSuccess, setFetchStatusFailure } = slice.actions;
