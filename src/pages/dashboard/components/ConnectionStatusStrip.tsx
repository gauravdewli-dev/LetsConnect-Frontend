import { Bot, Check, Mail, MessageSquare, Ticket, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { CONNECTING_LABELS, type ConnectingProvider } from "@/lib/connectionCache";

const PROVIDER_ICONS = {
  gmail: Mail,
  slack: MessageSquare,
  jira: Ticket,
} as const;

interface ConnectionStatusStripProps {
  provider: ConnectingProvider;
  phase: "connecting" | "finishing" | "success" | "error" | "timeout";
  errorMessage?: string;
  onDismiss?: () => void;
}

export default function ConnectionStatusStrip({
  provider,
  phase,
  errorMessage,
  onDismiss,
}: ConnectionStatusStripProps) {
  const Icon = PROVIDER_ICONS[provider];
  const label = CONNECTING_LABELS[provider];
  const busy = phase === "connecting" || phase === "finishing";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-2.5",
        busy && "border-indigo-100 bg-indigo-50/60",
        phase === "success" && "border-emerald-100 bg-emerald-50/60",
        phase === "error" && "border-red-100 bg-red-50/60",
        phase === "timeout" && "border-amber-100 bg-amber-50/60",
      )}
    >
      <div className="relative flex size-8 shrink-0 items-center justify-center">
        {busy && (
          <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400/30" />
        )}
        <span
          className={cn(
            "relative flex size-8 items-center justify-center rounded-full",
            busy && "bg-indigo-600 text-white",
            phase === "success" && "bg-emerald-600 text-white",
            phase === "error" && "bg-red-500 text-white",
            phase === "timeout" && "bg-amber-500 text-white",
          )}
        >
          {phase === "success" ? (
            <Check className="size-4" strokeWidth={2.5} />
          ) : phase === "error" ? (
            <Icon className="size-4" />
          ) : (
            <Bot className="size-4" />
          )}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">
          {phase === "connecting" && `Linking ${label}`}
          {phase === "finishing" && `${label} authorized`}
          {phase === "success" && `${label} linked`}
          {phase === "error" && `${label} unavailable`}
          {phase === "timeout" && `${label} sign-in timed out`}
        </p>
        <p className="text-xs text-muted-foreground">
          {phase === "connecting" && "Redirecting to sign in"}
          {phase === "finishing" && "Updating your workspace"}
          {phase === "success" && "Ready to use with LetsConnect"}
          {phase === "error" && (errorMessage || "Try again from Connected accounts")}
          {phase === "timeout" && "Authorization wasn't completed. Link or tap the node to try again."}
        </p>
      </div>

      {busy && (
        <div className="flex shrink-0 gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 rounded-full bg-indigo-400"
              style={{
                animation: "status-dot 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}

      {phase === "timeout" && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-full p-1 text-muted-foreground transition hover:bg-amber-100 hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
