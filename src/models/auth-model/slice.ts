import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { REFRESH_TOKEN_KEY, TOKEN_KEY } from "@/lib/constants/app-constants";
import type { AuthState, UserResponse } from "@/types";

import { triggerFetchMe, triggerLogin } from "./sagaActions";

const initialState: AuthState = {
  token: localStorage.getItem(TOKEN_KEY),
  refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  user: null,
  loading: false,
  error: null,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthSuccess(state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) {
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.loading = false;
      state.error = null;
      localStorage.setItem(TOKEN_KEY, action.payload.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, action.payload.refreshToken);
    },
    setAuthFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAuthError(state) {
      state.error = null;
    },
    setFetchMeSuccess(state, action: PayloadAction<UserResponse>) {
      state.user = action.payload;
      state.loading = false;
    },
    setFetchMeFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.error = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(triggerLogin, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(triggerFetchMe, (state) => {
        state.loading = true;
      });
  },
});

export default {
  name: "auth",
  reducer: slice.reducer,
};

export const {
  setAuthSuccess,
  setAuthFailure,
  clearAuthError,
  setFetchMeSuccess,
  setFetchMeFailure,
  logout,
} = slice.actions;
