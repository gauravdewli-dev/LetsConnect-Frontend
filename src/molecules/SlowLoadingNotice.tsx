import { useEffect, useRef, useState } from "react";
import { Cloud, Sparkles, X } from "lucide-react";

import { API_URL } from "@/lib/constants/app-constants";
import { cn } from "@/lib/utils";

const DEFAULT_DELAY_MS = 5000;

function isHostedBackend(): boolean {
  return !API_URL.includes("localhost") && !API_URL.includes("127.0.0.1");
}

type SlowLoadingNoticeProps = {
  active: boolean;
  delayMs?: number;
  /** Hide on localhost (default: true) */
  hostedOnly?: boolean;
  className?: string;
};

export default function SlowLoadingNotice({
  active,
  delayMs = DEFAULT_DELAY_MS,
  hostedOnly = true,
  className,
}: SlowLoadingNoticeProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const loadingStartedRef = useRef<number | null>(null);

  const shouldMonitor = active && (!hostedOnly || isHostedBackend());

  useEffect(() => {
    if (shouldMonitor) {
      loadingStartedRef.current ??= Date.now();
    } else {
      loadingStartedRef.current = null;
      setVisible(false);
      setElapsedSec(0);
    }
  }, [shouldMonitor]);

  useEffect(() => {
    if (!shouldMonitor || dismissed) return;

    const showTimer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(showTimer);
  }, [shouldMonitor, delayMs, dismissed]);

  useEffect(() => {
    if (!active) setDismissed(false);
  }, [active]);

  useEffect(() => {
    if (!shouldMonitor) return;

    const tick = window.setInterval(() => {
      const started = loadingStartedRef.current;
      if (started) {
        setElapsedSec(Math.floor((Date.now() - started) / 1000));
      }
    }, 1000);

    return () => window.clearInterval(tick);
  }, [shouldMonitor]);

  if (!visible || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4",
        "animate-[slow-notice-in_0.45s_ease-out]",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-auto relative w-full max-w-md overflow-hidden rounded-2xl",
          "border border-indigo-200/80 bg-white/95 shadow-xl shadow-indigo-500/10 backdrop-blur-md",
        )}
      >
        <div className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-indigo-100">
          <div className="slow-notice-bar h-full w-1/3 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />
        </div>

        <div className="absolute -right-8 -top-8 size-24 rounded-full bg-indigo-400/10 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 size-20 rounded-full bg-violet-400/10 blur-2xl" />

        <div className="relative flex gap-4 p-4 pt-5">
          <div className="relative shrink-0">
            <span className="absolute inset-0 animate-ping rounded-2xl bg-indigo-400/25" />
            <div className="relative flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30">
              <Cloud className="size-6" strokeWidth={1.75} />
            </div>
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-indigo-500" />
                <p className="text-sm font-semibold text-foreground">Still working on it</p>
              </div>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="shrink-0 rounded-lg p-1 text-muted-foreground transition hover:bg-slate-100 hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              LetsConnect runs on{" "}
              <span className="font-medium text-indigo-700">Render</span>. After idle time the
              server wakes up — first responses can take{" "}
              <span className="font-medium text-foreground">30–60 seconds</span>. Your request is
              still running; please keep this tab open.
            </p>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex gap-1">
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
              <span className="text-[10px] font-medium tabular-nums text-indigo-600/80">
                {elapsedSec > 0 ? `${elapsedSec}s elapsed` : "Starting up…"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
