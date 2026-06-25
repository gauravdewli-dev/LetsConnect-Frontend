import { call, cancelled, delay, put, race, take, takeLatest } from "redux-saga/effects";

import { STATUS_POLL_MS } from "@/lib/constants/app-constants";
import type { ConnectionStatusResponse } from "@/types";

import * as api from "./api";
import * as sagaActions from "./sagaActions";
import { setFetchStatusFailure, setFetchStatusSuccess } from "./slice";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Failed to load status";
}

function* handleFetchStatus() {
  try {
    const status: ConnectionStatusResponse = yield call(api.getStatus);
    yield put(setFetchStatusSuccess(status));
  } catch (error) {
    yield put(setFetchStatusFailure(getErrorMessage(error)));
  }
}

function* pollStatusLoop(): Generator {
  try {
    while (true) {
      yield put(sagaActions.triggerFetchStatus());
      yield delay(STATUS_POLL_MS);
    }
  } finally {
    if (yield cancelled()) {
      // polling stopped
    }
  }
}

function* watchStatusPoll(): Generator {
  while (yield take(sagaActions.triggerStartStatusPoll.type)) {
    yield race({
      task: call(pollStatusLoop),
      cancel: take(sagaActions.triggerStopStatusPoll.type),
    });
  }
}

export default function* rootSaga() {
  yield takeLatest(sagaActions.triggerFetchStatus.type, handleFetchStatus);
  yield watchStatusPoll();
}
