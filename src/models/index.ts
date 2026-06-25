import type { ReducersMapObject } from "@reduxjs/toolkit";

import authModelReducer from "./auth-model/slice";
import authModelSaga from "./auth-model/sagas";

interface ReducerItem {
  name: string;
  reducer: ReducersMapObject[string];
}

export const modelSagas: (() => Generator)[] = [authModelSaga];

export const modelReducers: ReducerItem[] = [authModelReducer as ReducerItem];
