import { useEffect, useState } from "react";
import { Bot, Mail, MessageSquare, Ticket } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/atoms/ui/button";
import {
  clearConnectingProvider,
  type ConnectingProvider,
} from "@/lib/connectionCache";

import ConnectionSuccessTour from "./components/ConnectionSuccessTour";

function DashboardPreview() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-slate-50">
      <div className="flex h-full">
        <aside className="hidden w-56 border-r bg-white/80 md:block">
          <div className="border-b px-5 py-5">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-full bg-indigo-100" />
              <div className="h-4 w-24 rounded bg-slate-200" />
            </div>
          </div>
          <div className="space-y-2 p-3">
            <div className="h-9 rounded-lg bg-indigo-600/90" />
            <div className="h-9 rounded-lg bg-slate-100" />
            <div className="h-9 rounded-lg bg-slate-100" />
          </div>
        </aside>
        <main className="flex flex-1 flex-col p-8">
          <div className="mb-6 h-6 w-48 rounded bg-slate-200" />
          <div className="relative flex-1 rounded-2xl border bg-white/60">
            <div className="absolute left-1/2 top-1/2 size-36 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-indigo-200 bg-indigo-50/80" />
            <div className="absolute left-[15%] top-[20%] size-28 rounded-2xl border bg-rose-50/80" />
            <div className="absolute right-[15%] top-[20%] size-28 rounded-2xl border bg-violet-50/80" />
            <div className="absolute bottom-[18%] left-1/2 size-28 -translate-x-1/2 rounded-2xl border bg-blue-50/80" />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Success() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const providerParam = params.get("provider");
  const connected = params.get("connected");
  const error = params.get("error");

  const provider: ConnectingProvider | null =
    providerParam === "gmail" || providerParam === "slack" || providerParam === "jira"
      ? providerParam
      : null;

  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (error) {
      clearConnectingProvider();
      return;
    }
    if (connected && provider) {
      const timer = window.setTimeout(() => {
        clearConnectingProvider();
        setShowTour(true);
      }, 400);
      return () => window.clearTimeout(timer);
    }
  }, [connected, error, provider]);

  const providerLabel =
    provider === "gmail" ? "Gmail" : provider === "slack" ? "Slack" : provider === "jira" ? "Jira" : "Account";

  const ProviderIcon =
    provider === "gmail" ? Mail : provider === "slack" ? MessageSquare : provider === "jira" ? Ticket : Bot;

  return (
    <div className="relative min-h-screen">
      <DashboardPreview />
      <div className="absolute inset-0 bg-white/40 backdrop-blur-md" />

      {showTour && provider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <ConnectionSuccessTour
            provider={provider}
            onDismiss={() => navigate("/")}
          />
        </div>
      )}

      {!showTour && error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-2xl">
            <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-4 ring-red-100">
              <ProviderIcon className="size-5" />
            </div>
            <h2 className="text-lg font-semibold">Couldn&apos;t connect {providerLabel}</h2>
            <p className="mt-2 text-sm text-muted-foreground break-words">
              {error || "Something went wrong. Try again from Connected accounts."}
            </p>
            <Button asChild className="mt-6 w-full">
              <Link to="/">Back to dashboard</Link>
            </Button>
          </div>
        </div>
      )}

      {!showTour && !error && connected && provider && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 animate-pulse rounded-full bg-indigo-600/20" />
            <p className="text-sm text-muted-foreground">Preparing your tour…</p>
          </div>
        </div>
      )}
    </div>
  );
}
