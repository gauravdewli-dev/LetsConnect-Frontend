import { type FormEvent, useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ email, password });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email address
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={isSignup ? "At least 8 characters" : "Enter your password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            className="h-11 pl-10 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {isSignup && (
          <p className="text-xs text-muted-foreground">Use 8 or more characters for your password.</p>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading} size="lg" className="mt-1 w-full">
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Please wait…
          </>
        ) : isSignup ? (
          "Create account"
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
