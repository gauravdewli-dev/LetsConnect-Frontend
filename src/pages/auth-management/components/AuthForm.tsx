import { type FormEvent, useState } from "react";
import { Loader2, Lock, Mail } from "lucide-react";

import { Button } from "@/atoms/ui/button";
import { Input } from "@/atoms/ui/input";
import { Label } from "@/atoms/ui/label";
import {
  forgotPassword,
  resendVerification,
  resetPassword,
  signup,
  verifyEmail,
} from "@/models/auth-model/api";
import {
  formatZodErrors,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  verifyEmailSchema,
  type LoginFormValues,
} from "@/schemas/auth";
import type { LoginPayload, TokenResponse } from "@/types";

export type AuthView =
  | "login"
  | "signup"
  | "verify-email"
  | "forgot-request"
  | "forgot-reset";

interface AuthFormProps {
  view: AuthView;
  loading: boolean;
  error: string | null;
  onViewChange: (view: AuthView) => void;
  onLogin: (payload: LoginPayload) => void;
  onVerified: (tokens: TokenResponse) => void;
  onClearError: () => void;
}

const VIEW_TITLES: Record<AuthView, { title: string; subtitle: string }> = {
  login: { title: "Welcome back", subtitle: "Sign in to manage your connections." },
  signup: { title: "Create your account", subtitle: "Sign up to connect integrations and start chatting." },
  "verify-email": {
    title: "Verify your email",
    subtitle: "Enter the 6-digit code we sent to your inbox.",
  },
  "forgot-request": {
    title: "Forgot password",
    subtitle: "We'll email you a 6-digit code to reset your password.",
  },
  "forgot-reset": {
    title: "Reset password",
    subtitle: "Enter the code from your email and choose a new password.",
  },
};

export default function AuthForm({
  view,
  loading,
  error,
  onViewChange,
  onLogin,
  onVerified,
  onClearError,
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const busy = loading || localLoading;
  const displayError = error || localError;
  const { title, subtitle } = VIEW_TITLES[view];

  function clearErrors() {
    setLocalError(null);
    setFieldErrors({});
    onClearError();
  }

  async function handleLoginSubmit(e: FormEvent) {
    e.preventDefault();
    const result = loginSchema.safeParse({ email, password } satisfies LoginFormValues);
    if (!result.success) {
      setFieldErrors(formatZodErrors(result.error));
      return;
    }
    clearErrors();
    onLogin(result.data);
  }

  async function handleSignupSubmit(e: FormEvent) {
    e.preventDefault();
    const result = signupSchema.safeParse({ email, password });
    if (!result.success) {
      setFieldErrors(formatZodErrors(result.error));
      return;
    }
    clearErrors();
    setLocalLoading(true);
    try {
      const res = await signup(result.data);
      setMessage(res.message);
      setOtp("");
      onViewChange("verify-email");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLocalLoading(false);
    }
  }

  async function handleVerifySubmit(e: FormEvent) {
    e.preventDefault();
    const result = verifyEmailSchema.safeParse({ email, otp });
    if (!result.success) {
      setFieldErrors(formatZodErrors(result.error));
      return;
    }
    clearErrors();
    setLocalLoading(true);
    try {
      const tokens = await verifyEmail(result.data.email, result.data.otp);
      onVerified(tokens);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLocalLoading(false);
    }
  }

  async function handleResendVerification() {
    clearErrors();
    setLocalLoading(true);
    try {
      const res = await resendVerification(email);
      setMessage(res.message);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Could not resend code");
    } finally {
      setLocalLoading(false);
    }
  }

  async function handleForgotRequest(e: FormEvent) {
    e.preventDefault();
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setFieldErrors(formatZodErrors(result.error));
      return;
    }
    clearErrors();
    setLocalLoading(true);
    try {
      const res = await forgotPassword(result.data.email);
      setMessage(res.message);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      onViewChange("forgot-reset");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLocalLoading(false);
    }
  }

  async function handleForgotReset(e: FormEvent) {
    e.preventDefault();
    const result = resetPasswordSchema.safeParse({
      email,
      otp,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    if (!result.success) {
      setFieldErrors(formatZodErrors(result.error));
      return;
    }
    clearErrors();
    setLocalLoading(true);
    try {
      const res = await resetPassword({
        email: result.data.email,
        otp: result.data.otp,
        new_password: result.data.new_password,
      });
      setMessage(res.message);
      setPassword("");
      onViewChange("login");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLocalLoading(false);
    }
  }

  return (
    <>
      <div className="mb-6 hidden lg:block">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2.5 text-sm text-indigo-900">
          {message}
        </div>
      )}

      {(view === "login" || view === "signup") && (
        <form
          onSubmit={(e) => void (view === "signup" ? handleSignupSubmit(e) : handleLoginSubmit(e))}
          className="flex flex-col gap-5"
        >
          <EmailField email={email} setEmail={setEmail} error={fieldErrors.email} />
          <PasswordField
            password={password}
            setPassword={setPassword}
            error={fieldErrors.password}
            isSignup={view === "signup"}
            showForgot={view === "login"}
            onForgot={() => {
              clearErrors();
              setMessage(null);
              onViewChange("forgot-request");
            }}
          />
          {displayError && <ErrorBox message={displayError} />}
          <SubmitButton busy={busy} label={view === "signup" ? "Create account" : "Sign in"} />
        </form>
      )}

      {view === "verify-email" && (
        <form onSubmit={(e) => void handleVerifySubmit(e)} className="flex flex-col gap-5">
          <EmailField email={email} setEmail={setEmail} error={fieldErrors.email} disabled />
          <OtpField otp={otp} setOtp={setOtp} error={fieldErrors.otp} />
          {displayError && <ErrorBox message={displayError} />}
          <SubmitButton busy={busy} label="Verify email" />
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            disabled={busy}
            onClick={() => void handleResendVerification()}
          >
            Resend code
          </Button>
        </form>
      )}

      {view === "forgot-request" && (
        <form onSubmit={(e) => void handleForgotRequest(e)} className="flex flex-col gap-5">
          <EmailField email={email} setEmail={setEmail} error={fieldErrors.email} />
          {displayError && <ErrorBox message={displayError} />}
          <SubmitButton busy={busy} label="Send reset code" />
        </form>
      )}

      {view === "forgot-reset" && (
        <form onSubmit={(e) => void handleForgotReset(e)} className="flex flex-col gap-5">
          <OtpField otp={otp} setOtp={setOtp} error={fieldErrors.otp} />
          <PasswordField
            password={newPassword}
            setPassword={setNewPassword}
            error={fieldErrors.new_password}
            label="New password"
            id="new-password"
            isSignup
          />
          <PasswordField
            password={confirmPassword}
            setPassword={setConfirmPassword}
            error={fieldErrors.confirm_password}
            label="Confirm password"
            id="confirm-password"
          />
          {displayError && <ErrorBox message={displayError} />}
          <SubmitButton busy={busy} label="Reset password" />
        </form>
      )}

      <FooterLinks view={view} onViewChange={onViewChange} clearErrors={clearErrors} setMessage={setMessage} />
    </>
  );
}

function EmailField({
  email,
  setEmail,
  error,
  disabled,
}: {
  email: string;
  setEmail: (v: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email address</Label>
      <div className="relative">
        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 pl-10"
          autoComplete="email"
          disabled={disabled}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function PasswordField({
  password,
  setPassword,
  error,
  isSignup,
  showForgot,
  onForgot,
  label = "Password",
  id = "password",
}: {
  password: string;
  setPassword: (v: string) => void;
  error?: string;
  isSignup?: boolean;
  showForgot?: boolean;
  onForgot?: () => void;
  label?: string;
  id?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {showForgot && onForgot && (
          <button
            type="button"
            onClick={onForgot}
            className="text-xs font-medium text-indigo-600 hover:underline"
          >
            Forgot password?
          </button>
        )}
      </div>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type="password"
          placeholder={isSignup ? "At least 8 characters" : "Enter your password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 pl-10"
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {isSignup && !error && (
        <p className="text-xs text-muted-foreground">
          8+ characters with uppercase, lowercase, and a number.
        </p>
      )}
    </div>
  );
}

function OtpField({
  otp,
  setOtp,
  error,
}: {
  otp: string;
  setOtp: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="otp">6-digit code</Label>
      <Input
        id="otp"
        inputMode="numeric"
        maxLength={6}
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="123456"
        className="h-11 tracking-widest"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
      {message}
    </div>
  );
}

function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
  return (
    <Button type="submit" disabled={busy} size="lg" className="mt-1 w-full">
      {busy ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Please wait…
        </>
      ) : (
        label
      )}
    </Button>
  );
}

function FooterLinks({
  view,
  onViewChange,
  clearErrors,
  setMessage,
}: {
  view: AuthView;
  onViewChange: (v: AuthView) => void;
  clearErrors: () => void;
  setMessage: (m: string | null) => void;
}) {
  function switchTo(next: AuthView) {
    clearErrors();
    setMessage(null);
    onViewChange(next);
  }

  if (view === "login") {
    return (
      <div className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => switchTo("signup")}
          className="font-semibold text-indigo-600 hover:underline"
        >
          Sign up free
        </button>
      </div>
    );
  }

  if (view === "signup") {
    return (
      <div className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => switchTo("login")}
          className="font-semibold text-indigo-600 hover:underline"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-muted-foreground">
      <button
        type="button"
        onClick={() => switchTo("login")}
        className="font-semibold text-indigo-600 hover:underline"
      >
        Back to sign in
      </button>
    </div>
  );
}
