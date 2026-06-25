import { type FormEvent, useState } from "react";

import { Button } from "@/atoms/ui/button";
import { Input } from "@/atoms/ui/input";
import { Label } from "@/atoms/ui/label";
import type { LoginPayload } from "@/types";

interface LoginFormProps {
  isSignup: boolean;
  loading: boolean;
  error: string | null;
  onSubmit: (payload: LoginPayload) => void;
}

export default function LoginForm({ isSignup, loading, error, onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ email, password });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
      </Button>
    </form>
  );
}
