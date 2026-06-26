import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bot, Mail, MessageSquare } from "lucide-react";

import Logo from "@/atoms/Logo";
import { Button } from "@/atoms/ui/button";
import type { LoginPayload } from "@/types";

import LoginForm from "./components/LoginForm";
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

  function toggleMode() {
    setIsSignup((prev) => !prev);
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-[#0f172a] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 size-96 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative">
          <Logo
            className="mb-6"
            imageClassName="size-14"
            nameClassName="text-lg text-white"
          />
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

      {/* Form panel */}
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo className="mb-3" imageClassName="size-12" nameClassName="text-xl text-slate-900" />
            <p className="text-sm text-muted-foreground">
              {isSignup ? "Create your account" : "Welcome back"} — AI assistant for your work tools
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="mb-6 hidden lg:block">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                {isSignup ? "Create your account" : "Welcome back"}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {isSignup
                  ? "Sign up to connect integrations and start chatting."
                  : "Sign in to manage your connections."}
              </p>
            </div>

            <LoginForm
              isSignup={isSignup}
              loading={loading}
              error={error}
              onSubmit={handleSubmit}
            />

            <div className="mt-6 border-t border-slate-100 pt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 font-semibold text-indigo-600 hover:text-indigo-700"
                  onClick={toggleMode}
                >
                  {isSignup ? "Sign in" : "Sign up free"}
                </Button>
              </p>
            </div>
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
