import React from "react";

import ErrorBoundary from "@/atoms/ui/error-boundary";
import ErrorFallback from "@/molecules/error-fallback";

interface WithErrorBoundaryOptions {
  fallbackTitle?: string;
  fallbackMessage?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {},
) {
  const WrappedComponent = (props: P) => {
    const {
      fallbackTitle = "Something went wrong",
      fallbackMessage = "This component encountered an error. Please try again.",
      onError,
      resetOnPropsChange = true,
      resetKeys,
    } = options;

    return (
      <ErrorBoundary
        onError={onError}
        resetOnPropsChange={resetOnPropsChange}
        resetKeys={resetKeys}
        fallback={
          <div className="flex min-h-screen items-center justify-center p-4">
            <ErrorFallback
              title={fallbackTitle}
              message={fallbackMessage}
              onRetry={() => window.location.reload()}
            />
          </div>
        }
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default withErrorBoundary;
