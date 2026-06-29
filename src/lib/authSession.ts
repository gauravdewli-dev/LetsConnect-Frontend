import { REFRESH_TOKEN_KEY, TOKEN_KEY } from "@/lib/constants/app-constants";
import { setAuthSuccess } from "@/models/auth-model/slice";
import { getDispatch } from "@/reducers";

export function persistAuthTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  try {
    getDispatch()(
      setAuthSuccess({
        accessToken,
        refreshToken,
      }),
    );
  } catch {
    // Store not initialized yet (e.g. during bootstrap).
  }
}

export function hasStoredAuthTokens(): boolean {
  return Boolean(localStorage.getItem(TOKEN_KEY) && localStorage.getItem(REFRESH_TOKEN_KEY));
}
