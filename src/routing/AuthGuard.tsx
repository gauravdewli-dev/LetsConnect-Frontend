import { useEffect, useRef, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { logout } from "@/models/auth-model/slice";
import { triggerFetchMe } from "@/models/auth-model/sagaActions";
import {
  getAuthError,
  getAuthLoading,
  getIsAuthenticated,
  getToken,
  getUser,
} from "@/models/auth-model/selectors";
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

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
      return;
    }
    if (user || loading || meRequestedRef.current) return;
    meRequestedRef.current = true;
    dispatch(triggerFetchMe());
  }, [token, user, loading, dispatch, navigate, location.pathname]);

  useEffect(() => {
    if (authError && !user && !loading) {
      dispatch(logout());
      navigate("/login", { replace: true, state: { from: location.pathname } });
    }
  }, [authError, user, loading, dispatch, navigate, location.pathname]);

  if (!isAuthenticated) {
    return null;
  }

  if (!user) {
    const variant = location.pathname.includes("chat") ? "chat" : "dashboard";
    return <AppSkeleton variant={variant} />;
  }

  return <>{children}</>;
}
