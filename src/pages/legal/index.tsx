import React from "react";

import { withErrorBoundary } from "../with-error-boundary";

const PrivacyComponent = React.lazy(() => import("./Privacy"));
const TermsComponent = React.lazy(() => import("./Terms"));

const Privacy = withErrorBoundary(PrivacyComponent, {
  fallbackTitle: "Page Error",
  fallbackMessage: "Could not load the privacy policy.",
});

const Terms = withErrorBoundary(TermsComponent, {
  fallbackTitle: "Page Error",
  fallbackMessage: "Could not load the terms of service.",
});

export default [
  {
    path: "/privacy",
    key: "privacy",
    componentId: "privacy",
    component: Privacy,
    routeProps: { noSidebar: true, public: true },
    title: "LetsConnect | Privacy Policy",
    headerName: "Privacy",
    exact: true,
    name: "privacy",
  },
  {
    path: "/terms",
    key: "terms",
    componentId: "terms",
    component: Terms,
    routeProps: { noSidebar: true, public: true },
    title: "LetsConnect | Terms of Service",
    headerName: "Terms",
    exact: true,
    name: "terms",
  },
];
