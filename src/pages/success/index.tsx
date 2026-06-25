import React from "react";

import { withErrorBoundary } from "../with-error-boundary";

const SuccessComponent = React.lazy(() => import("./Success"));

const Success = withErrorBoundary(SuccessComponent, {
  fallbackTitle: "Connection Error",
  fallbackMessage: "The connection result page encountered an error. Please try refreshing the page.",
});

export default [
  {
    path: "/success",
    key: "success",
    componentId: "success",
    component: Success,
    routeProps: { noSidebar: true, public: true },
    title: "LetsConnect | Connection",
    headerName: "Connection",
    exact: true,
    name: "success",
  },
];
