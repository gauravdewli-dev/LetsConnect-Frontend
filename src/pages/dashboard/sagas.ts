import { call, put, takeLeading } from "redux-saga/effects";

import {
  clearConnectingProvider,
  setCachedConnectionStatus,
} from "@/lib/connectionCache";
import type { ConnectionStatusResponse } from "@/types";

import * as api from "./api";
import * as sagaActions from "./sagaActions";
import { setFetchStatusFailure, setFetchStatusSuccess } from "./slice";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Failed to load status";
}

function needsProfileBackfill(status: ConnectionStatusResponse): boolean {
  if (status.gmail_connected && !status.gmail_display_name) return true;
  if (status.gmail_connected && !status.calendar_connected) return true;
  if (status.slack_connected && status.slack_send_as_user && !status.slack_display_name) {
    return true;
  }
  if (status.jira_connected && !status.jira_display_name) return true;
  return false;
}

function* applyStatus(status: ConnectionStatusResponse) {
  setCachedConnectionStatus(status);
  yield put(setFetchStatusSuccess(status));
  clearConnectingProvider();
}

function* handleFetchStatus() {
  try {
    const status: ConnectionStatusResponse = yield call(api.getStatus);
    yield* applyStatus(status);
  } catch (error) {
    yield put(setFetchStatusFailure(getErrorMessage(error)));
  }
}

/** One status fetch; backfill only when display names are missing (max 2 requests). */
function* handleInitializeConnections() {
  try {
    const status: ConnectionStatusResponse = yield call(api.getStatus);
    if (needsProfileBackfill(status)) {
      const refreshed: ConnectionStatusResponse = yield call(api.backfillConnectionProfiles);
      yield* applyStatus(refreshed);
      return;
    }
    yield* applyStatus(status);
  } catch (error) {
    yield put(setFetchStatusFailure(getErrorMessage(error)));
  }
}

export default function* rootSaga() {
  yield takeLeading(sagaActions.triggerInitializeConnections.type, handleInitializeConnections);
  yield takeLeading(sagaActions.triggerFetchStatus.type, handleFetchStatus);
}
