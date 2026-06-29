import { useEffect, useRef, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { hasStoredAuthTokens } from "@/lib/authSession";
import { readDashboardTabFromSearch } from "@/lib/dashboardTab";
import { REFRESH_TOKEN_KEY } from "@/lib/constants/app-constants";
import { clearAuthError, logout } from "@/models/auth-model/slice";
import { triggerFetchMe } from "@/models/auth-model/sagaActions";
import {
  getAuthError,
  getAuthLoading,
  getIsAuthenticated,
  getToken,
  getUser,
} from "@/models/auth-model/selectors";
import { refreshAccessToken } from "@/services/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import AppSkeleton from "./AppSkeleton";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAppSelector(getToken);
  const user = useAppSelector(getUser);
  const loading = useAppSelector(getAuthLoading);
  const authError = useAppSelector(getAuthError);
  const isAuthenticated = useAppSelector(getIsAuthenticated);
  const meRequestedRef = useRef(false);
  const authRecoveryRef = useRef(false);

  useEffect(() => {
    if (!token && !hasStoredAuthTokens()) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
      return;
    }
    if (user || loading || meRequestedRef.current) return;
    meRequestedRef.current = true;
    dispatch(triggerFetchMe());
  }, [token, user, loading, dispatch, navigate, location.pathname]);

  useEffect(() => {
    if (!authError || user || loading || authRecoveryRef.current) return;
    authRecoveryRef.current = true;

    let cancelled = false;
    void (async () => {
      const newAccess = await refreshAccessToken();
      if (cancelled) return;
      authRecoveryRef.current = false;

      if (newAccess && localStorage.getItem(REFRESH_TOKEN_KEY)) {
        dispatch(clearAuthError());
        meRequestedRef.current = false;
        dispatch(triggerFetchMe());
        return;
      }

      dispatch(logout());
      navigate("/login", { replace: true, state: { from: location.pathname } });
    })();

    return () => {
      cancelled = true;
    };
  }, [authError, user, loading, dispatch, navigate, location.pathname]);

  if (!isAuthenticated && !hasStoredAuthTokens()) {
    return null;
  }

  if (!user) {
    const variant = readDashboardTabFromSearch(location.search) === "chat" ? "chat" : "dashboard";
    return <AppSkeleton variant={variant} />;
  }

  return <>{children}</>;
}
