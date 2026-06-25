import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { TOKEN_KEY } from "@/lib/constants/app-constants";
import type { AuthState, UserResponse } from "@/types";

import { triggerFetchMe, triggerLogin, triggerSignup } from "./sagaActions";

const initialState: AuthState = {
  token: localStorage.getItem(TOKEN_KEY),
  user: null,
  loading: false,
  error: null,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthSuccess(state, action: PayloadAction<string>) {
      state.token = action.payload;
      state.loading = false;
      state.error = null;
      localStorage.setItem(TOKEN_KEY, action.payload);
    },
    setAuthFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
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
      state.user = null;
      state.error = null;
      localStorage.removeItem(TOKEN_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(triggerLogin, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(triggerSignup, (state) => {
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
  setFetchMeSuccess,
  setFetchMeFailure,
  logout,
} = slice.actions;
