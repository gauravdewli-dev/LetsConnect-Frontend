import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/atoms/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/atoms/ui/card";

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export default function ErrorFallback({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  showRetry = true,
}: ErrorFallbackProps) {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      {showRetry && onRetry && (
        <CardContent>
          <Button onClick={onRetry} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
