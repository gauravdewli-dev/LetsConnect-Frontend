import React from "react";

import { withErrorBoundary } from "../with-error-boundary";

const LoginComponent = React.lazy(() => import("./Login"));

const Login = withErrorBoundary(LoginComponent, {
  fallbackTitle: "Login Error",
  fallbackMessage: "The login page encountered an error. Please try refreshing the page.",
});

export default [
  {
    path: "/login",
    key: "login",
    componentId: "login",
    component: Login,
    routeProps: { noSidebar: true, public: true },
    title: "LetsConnect | Login",
    headerName: "Login",
    exact: true,
    name: "login",
  },
];
