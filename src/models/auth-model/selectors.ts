import { createSelector } from "@reduxjs/toolkit";

import type { AuthState } from "@/types";

type AuthRootState = { auth: AuthState };

export const getAuthState = (state: AuthRootState) => state.auth;

export const getToken = createSelector(getAuthState, (auth) => auth.token);
export const getUser = createSelector(getAuthState, (auth) => auth.user);
export const getIsAuthenticated = createSelector(getAuthState, (auth) => Boolean(auth.token));
export const getAuthLoading = createSelector(getAuthState, (auth) => auth.loading);
export const getAuthError = createSelector(getAuthState, (auth) => auth.error);
