import type { ComponentType, LazyExoticComponent } from "react";
import type { ReducersMapObject } from "@reduxjs/toolkit";

import authManagement from "./auth-management";
import dashboard from "./dashboard";
import success from "./success";

export const Pages = [authManagement, dashboard, success];

export default Pages;

export interface PageConfig {
  path: string;
  key: string;
  componentId: string;
  component: LazyExoticComponent<ComponentType> | ComponentType;
  title: string;
  name: string;
  headerName?: string;
  exact?: boolean;
  routeProps?: { noSidebar?: boolean; public?: boolean };
  importReducer?: () => Array<{ name: string; reducer: ReducersMapObject[string] }>;
  importSagas?: () => Array<() => Generator>;
}

export function flattenPages(pages: typeof Pages): PageConfig[] {
  return pages.flatMap((group) => group as PageConfig[]);
}
