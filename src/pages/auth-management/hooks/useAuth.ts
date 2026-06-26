import { useCallback } from "react";

import { REFRESH_TOKEN_KEY } from "@/lib/constants/app-constants";
import { logoutApi } from "@/models/auth-model/api";
import { logout, clearAuthError } from "@/models/auth-model/slice";
import { triggerFetchMe, triggerLogin } from "@/models/auth-model/sagaActions";
import {
  getAuthError,
  getAuthLoading,
  getToken,
  getUser,
} from "@/models/auth-model/selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { LoginPayload } from "@/types";

export function useAuth() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(getToken);
  const user = useAppSelector(getUser);
  const loading = useAppSelector(getAuthLoading);
  const error = useAppSelector(getAuthError);

  const login = useCallback(
    (payload: LoginPayload) => dispatch(triggerLogin(payload)),
    [dispatch],
  );
  const fetchMe = useCallback(() => dispatch(triggerFetchMe()), [dispatch]);
  const signOut = useCallback(() => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      void logoutApi(refreshToken).catch(() => undefined);
    }
    dispatch(logout());
  }, [dispatch]);

  const clearError = useCallback(() => dispatch(clearAuthError()), [dispatch]);

  return { token, user, loading, error, login, fetchMe, signOut, clearError };
}
