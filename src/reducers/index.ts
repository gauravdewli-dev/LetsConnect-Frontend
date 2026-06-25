import { configureStore, type Middleware, type ReducersMapObject } from "@reduxjs/toolkit";

import { modelReducers } from "@/models";
import { flattenPages, Pages } from "@/pages";
import type { AuthState, ConnectionsState } from "@/types";

interface ReducerItem {
  name: string;
  reducer: ReducersMapObject[string];
}

export interface RootState {
  auth: AuthState;
  connections: ConnectionsState;
}

function collectPageReducers(): ReducersMapObject {
  const reducers: ReducersMapObject = {};

  for (const page of flattenPages(Pages)) {
    if (!page.importReducer) continue;
    for (const { name, reducer } of page.importReducer()) {
      reducers[name] = reducer as ReducersMapObject[string];
    }
  }

  return reducers;
}

function collectModelReducers(): ReducersMapObject {
  const reducers: ReducersMapObject = {};
  for (const { name, reducer } of modelReducers as ReducerItem[]) {
    reducers[name] = reducer;
  }
  return reducers;
}

let store: ReturnType<typeof configureStore> | undefined;

export function createAppStore(sagaMiddleware: Middleware) {
  store = configureStore({
    reducer: {
      ...collectPageReducers(),
      ...collectModelReducers(),
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
  });
  return store;
}

export type AppDispatch = ReturnType<typeof getDispatch>;

export const getStore = () => {
  if (!store) {
    throw new Error("Store has not been initialized");
  }
  return store;
};

export const getState = () => getStore().getState() as RootState;
export const getDispatch = () => getStore().dispatch;
