import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/atoms/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/atoms/ui/card";
import type { LoginPayload } from "@/types";

import LoginForm from "./components/LoginForm";
import { useAuth } from "./hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { loading, error, token, login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    if (token) {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  function handleSubmit(payload: LoginPayload) {
    if (isSignup) {
      signup(payload);
    } else {
      login(payload);
    }
  }

  return (
    <div className="mx-auto mt-12 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Slack Gmail Assistant</CardTitle>
          <CardDescription>
            {isSignup ? "Create your account" : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm
            isSignup={isSignup}
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
          />
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            {isSignup ? "Already have an account?" : "No account yet?"}{" "}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? "Log in" : "Sign up"}
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
