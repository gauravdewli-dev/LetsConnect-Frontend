import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/atoms/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/atoms/ui/card";

export default function Success() {
  const [params] = useSearchParams();
  const provider = params.get("provider") || "account";
  const connected = params.get("connected");
  const error = params.get("error");

  return (
    <div className="mx-auto mt-12 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Connection {connected ? "successful" : "result"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {connected && (
            <p className="text-sm text-green-600">
              {provider === "gmail" ? "Gmail" : "Slack"} connected successfully.
            </p>
          )}
          {error && (
            <p className="text-sm text-destructive break-words">Connection failed: {error}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link to="/">Back to dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
