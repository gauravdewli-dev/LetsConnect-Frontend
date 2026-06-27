import { useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { triggerFetchMe } from "@/models/auth-model/sagaActions";
import {
  getAuthLoading,
  getIsAuthenticated,
  getToken,
  getUser,
} from "@/models/auth-model/selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

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
  const isAuthenticated = useAppSelector(getIsAuthenticated);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
      return;
    }
    if (!user && !loading) {
      dispatch(triggerFetchMe());
    }
  }, [token, user, loading, dispatch, navigate, location.pathname]);

  if (!isAuthenticated) {
    return null;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="size-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return <>{children}</>;
}
