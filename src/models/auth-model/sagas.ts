import { call, put, takeLatest, takeLeading } from "redux-saga/effects";

import type { TokenResponse, UserResponse } from "@/types";

import * as api from "./api";
import * as sagaActions from "./sagaActions";
import {
  setAuthFailure,
  setAuthSuccess,
  setFetchMeFailure,
  setFetchMeSuccess,
  logout,
} from "./slice";
import { REFRESH_TOKEN_KEY, TOKEN_KEY } from "@/lib/constants/app-constants";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

function* handleLogin(action: ReturnType<typeof sagaActions.triggerLogin>) {
  try {
    const data: TokenResponse = yield call(api.login, action.payload);
    yield put(
      setAuthSuccess({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      }),
    );
    yield put(sagaActions.triggerFetchMe());
  } catch (error) {
    yield put(setAuthFailure(getErrorMessage(error)));
  }
}

function* handleFetchMe() {
  try {
    const user: UserResponse = yield call(api.me);
    yield put(setFetchMeSuccess(user));
  } catch (error) {
    yield put(setFetchMeFailure(getErrorMessage(error)));
    const tokenGone =
      !localStorage.getItem(TOKEN_KEY) || !localStorage.getItem(REFRESH_TOKEN_KEY);
    if (tokenGone) {
      yield put(logout());
    }
  }
}

export default function* rootSaga() {
  yield takeLatest(sagaActions.triggerLogin.type, handleLogin);
  yield takeLeading(sagaActions.triggerFetchMe.type, handleFetchMe);
}
