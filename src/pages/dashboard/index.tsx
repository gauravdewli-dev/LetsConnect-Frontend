import React from "react";

import { withErrorBoundary } from "../with-error-boundary";

import dashboardReducer from "./slice";
import dashboardSagas from "./sagas";

const DashboardComponent = React.lazy(() => import("./Dashboard"));

const Dashboard = withErrorBoundary(DashboardComponent, {
  fallbackTitle: "Dashboard Error",
  fallbackMessage: "The dashboard encountered an error. Please try refreshing the page.",
});

export default [
  {
    path: "/",
    key: "dashboard",
    componentId: "dashboard",
    component: Dashboard,
    title: "LetsConnect | Dashboard",
    name: "dashboard",
    importReducer: () => [dashboardReducer],
    importSagas: () => [dashboardSagas],
  },
];
