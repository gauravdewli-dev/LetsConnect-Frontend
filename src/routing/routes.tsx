import { Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import { flattenPages, Pages } from "@/pages";
import AuthGuard from "@/routing/AuthGuard";
import { PageSkeleton } from "@/routing/AppSkeleton";
import NotFoundPage from "@/routing/not-found";
import Layout from "@/templates/layout";

const PageLoading = () => <PageSkeleton />;

export default function AppRouter() {
  const location = useLocation();

  useEffect(() => {
    const currentPage = flattenPages(Pages).find((page) => page.path === location.pathname);
    document.title = currentPage?.title || "LetsConnect";
  }, [location]);

  return (
    <Routes>
      {flattenPages(Pages).map((page) => {
        const Component = page.component;
        const isPublic = page.routeProps?.public === true;

        const element = (
          <Layout
            component={
              <Suspense fallback={<PageLoading />}>
                <Component />
              </Suspense>
            }
          />
        );

        return (
          <Route
            key={page.path}
            path={page.path}
            element={isPublic ? element : <AuthGuard>{element}</AuthGuard>}
          />
        );
      })}
      <Route
        path="*"
        element={
          <Layout
            component={
              <Suspense fallback={<PageLoading />}>
                <NotFoundPage />
              </Suspense>
            }
          />
        }
      />
    </Routes>
  );
}
