import { useCallback } from "react";

import { logout } from "@/models/auth-model/slice";
import { triggerFetchMe, triggerLogin, triggerSignup } from "@/models/auth-model/sagaActions";
import {
  getAuthError,
  getAuthLoading,
  getToken,
  getUser,
} from "@/models/auth-model/selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { LoginPayload, SignupPayload } from "@/types";

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
  const signup = useCallback(
    (payload: SignupPayload) => dispatch(triggerSignup(payload)),
    [dispatch],
  );
  const fetchMe = useCallback(() => dispatch(triggerFetchMe()), [dispatch]);
  const signOut = useCallback(() => dispatch(logout()), [dispatch]);

  return { token, user, loading, error, login, signup, fetchMe, signOut };
}
