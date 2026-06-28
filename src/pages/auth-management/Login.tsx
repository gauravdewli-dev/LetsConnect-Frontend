import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bot, Mail, MessageSquare } from "lucide-react";

import Logo from "@/atoms/Logo";
import { setAuthSuccess } from "@/models/auth-model/slice";
import { useAppDispatch } from "@/store/hooks";
import type { LoginPayload, TokenResponse } from "@/types";

import AuthForm, { type AuthView } from "./components/AuthForm";
import { useAuth } from "./hooks/useAuth";

const FEATURES = [
  {
    icon: Bot,
    title: "AI assistant",
    description: "One agent across your tools — powered by Gemini.",
  },
  {
    icon: MessageSquare,
    title: "Chat where you work",
    description: "Slack today. Microsoft Teams and more channels coming soon.",
  },
  {
    icon: Mail,
    title: "Growing integrations",
    description: "Gmail is live now. Jira, Teams, and others on the roadmap.",
  },
];

const MOBILE_SUBTITLES: Record<AuthView, string> = {
  login: "Welcome back — AI assistant for your work tools",
  signup: "Create your account",
  "verify-email": "Verify your email to continue",
  "forgot-request": "Reset your password",
  "forgot-reset": "Enter your reset code",
};

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, token, login, clearError } = useAuth();
  const [view, setView] = useState<AuthView>("login");

  useEffect(() => {
    if (token) {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  function handleLogin(payload: LoginPayload) {
    login(payload);
  }

  function handleVerified(tokens: TokenResponse) {
    dispatch(
      setAuthSuccess({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      }),
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[#0f172a] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 size-96 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative">
          <Logo className="mb-6" imageClassName="size-14" nameClassName="text-lg text-white" />
          <p className="max-w-md text-2xl font-normal leading-tight text-indigo-300">
            AI assistant for your work tools
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
            Connect Gmail and Slack today. Jira, Microsoft Teams, and more integrations are on the
            way — all through one chat-driven agent.
          </p>
        </div>

        <div className="relative space-y-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                <Icon className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo className="mb-3" imageClassName="size-12" nameClassName="text-xl text-slate-900" />
            <p className="text-sm text-muted-foreground">{MOBILE_SUBTITLES[view]}</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
            <AuthForm
              view={view}
              loading={loading}
              error={error}
              onViewChange={setView}
              onLogin={handleLogin}
              onVerified={handleVerified}
              onClearError={clearError}
            />
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link to="/terms" className="font-medium text-indigo-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="font-medium text-indigo-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
