import { useEffect, useRef, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Link2,
  Mail,
  MessageSquare,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";

import Logo from "@/atoms/Logo";
import { Button } from "@/atoms/ui/button";
import { hasSeenColdStartTour, markColdStartTourSeen } from "@/lib/coldStartTour";
import { cn } from "@/lib/utils";

/** Show after /auth/me has been pending this long. Tour itself is one-time via localStorage. */
const SHOW_DELAY_MS = 5000;

type Slide = {
  eyebrow: string;
  title: string;
  body: string;
  points?: string[];
  visual: "welcome" | "connect" | "chat" | "actions" | "ready";
};

const SLIDES: Slide[] = [
  {
    eyebrow: "While we wake up",
    title: "Meet LetsConnect",
    body: "Your AI assistant for work tools — Gmail, Calendar, Slack, and Jira in one chat. We’re on Render’s free tier, so the first wake-up can take 30–60 seconds. Browse these tips while the server starts.",
    visual: "welcome",
  },
  {
    eyebrow: "Step 1",
    title: "Connect your tools",
    body: "Open Connected accounts and link the apps you use. You only authorize once — LetsConnect talks to them on your behalf.",
    points: [
      "Gmail — read, search, draft, and send mail",
      "Google Calendar — list and schedule meetings",
      "Slack — message teammates and read channels",
      "Jira — find, create, and update tickets",
    ],
    visual: "connect",
  },
  {
    eyebrow: "Step 2",
    title: "Chat in plain language",
    body: "No menus to hunt through. Open Text chat and say what you need — LetsConnect picks the right tool and acts for you.",
    points: [
      "“How many unread emails do I have?”",
      "“What meetings do I have today?”",
      "“DM Alex that standup moved to 3pm”",
      "“Show my open bugs in PROJ”",
    ],
    visual: "chat",
  },
  {
    eyebrow: "What you can do",
    title: "One place for the busywork",
    body: "Search inboxes, schedule meetings, ping Slack, and manage Jira — without switching tabs all day.",
    points: [
      "Summarize threads and draft replies",
      "Create calendar events with a sentence",
      "Send Slack DMs as you",
      "Create or update Jira issues from chat",
    ],
    visual: "actions",
  },
  {
    eyebrow: "You’re ready",
    title: "Server’s waking — you’re set",
    body: "When loading finishes, connect an account (or open Text chat) and try your first request. You won’t see this tour again.",
    visual: "ready",
  },
];

const CONNECT_ICONS: { label: string; icon: ComponentType<{ className?: string }> }[] = [
  { label: "Gmail", icon: Mail },
  { label: "Calendar", icon: Calendar },
  { label: "Slack", icon: MessageSquare },
  { label: "Jira", icon: Ticket },
];

type ColdStartTourProps = {
  active: boolean;
  delayMs?: number;
};

export default function ColdStartTour({ active, delayMs = SHOW_DELAY_MS }: ColdStartTourProps) {
  const [eligible, setEligible] = useState(() => !hasSeenColdStartTour());
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [stillLoading, setStillLoading] = useState(true);
  const loadingStartedRef = useRef<number | null>(null);

  useEffect(() => {
    if (!eligible) return;

    if (active) {
      loadingStartedRef.current ??= Date.now();
      setStillLoading(true);
    } else if (visible) {
      setStillLoading(false);
    } else {
      loadingStartedRef.current = null;
      setElapsedSec(0);
    }
  }, [active, eligible, visible]);

  useEffect(() => {
    if (!eligible || !active || visible) return;

    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [eligible, active, visible, delayMs]);

  useEffect(() => {
    if (!visible) return;

    const tick = window.setInterval(() => {
      const started = loadingStartedRef.current;
      if (started) {
        setElapsedSec(Math.floor((Date.now() - started) / 1000));
      }
    }, 1000);

    return () => window.clearInterval(tick);
  }, [visible]);

  function finish() {
    markColdStartTourSeen();
    setEligible(false);
    setVisible(false);
  }

  if (!visible || !eligible) return null;

  const slide = SLIDES[step];
  const isFirst = step === 0;
  const isLast = step === SLIDES.length - 1;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cold-start-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px] animate-[cold-tour-fade_0.35s_ease-out]" />

      <div
        className={cn(
          "relative flex w-full max-w-lg flex-col overflow-hidden rounded-3xl",
          "border border-white/10 bg-white shadow-2xl shadow-slate-900/25",
          "animate-[cold-tour-in_0.45s_ease-out]",
        )}
      >
        <div className="relative overflow-hidden bg-[#0f172a] px-6 pb-8 pt-5 text-white">
          <div className="pointer-events-none absolute -left-16 -top-16 size-48 rounded-full bg-indigo-500/35 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-10 size-56 rounded-full bg-sky-500/20 blur-3xl" />

          <div className="relative flex items-start justify-between gap-3">
            <Logo imageClassName="size-10" nameClassName="text-base text-white" />
            <button
              type="button"
              onClick={finish}
              className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Skip tour"
            >
              <X className="size-4" />
            </button>
          </div>

          <div key={step} className="relative mt-6 animate-[cold-slide_0.4s_ease-out]">
            <SlideVisual kind={slide.visual} />
          </div>
        </div>

        <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
          <div key={`copy-${step}`} className="animate-[cold-slide_0.4s_ease-out]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-600">
              {slide.eyebrow}
            </p>
            <h2 id="cold-start-title" className="mt-1.5 text-xl font-semibold tracking-tight text-foreground">
              {slide.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{slide.body}</p>

            {slide.points && (
              <ul className="mt-4 space-y-2">
                {slide.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Sparkles className="mt-0.5 size-3.5 shrink-0 text-indigo-500" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                {stillLoading && (
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-indigo-400 opacity-60" />
                )}
                <span
                  className={cn(
                    "relative inline-flex size-2 rounded-full",
                    stillLoading ? "bg-indigo-500" : "bg-emerald-500",
                  )}
                />
              </span>
              <p className="text-xs text-muted-foreground">
                {stillLoading
                  ? "Waking Render free tier…"
                  : "Backend is ready — finish when you like"}
              </p>
            </div>
            <span className="text-[11px] font-medium tabular-nums text-indigo-600">
              {elapsedSec > 0 ? `${elapsedSec}s` : "…"}
            </span>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="flex gap-1.5" aria-hidden>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStep(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === step ? "w-5 bg-indigo-600" : "w-1.5 bg-slate-200 hover:bg-slate-300",
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {!isFirst && (
                <Button variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
              )}
              {!isLast ? (
                <Button size="sm" onClick={() => setStep((s) => s + 1)}>
                  Next
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button size="sm" onClick={finish}>
                  {stillLoading ? "Got it" : "Continue"}
                  <Check className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function SlideVisual({ kind }: { kind: Slide["visual"] }) {
  if (kind === "welcome") {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="max-w-sm text-2xl font-normal leading-snug text-indigo-200">
          AI assistant for your work tools
        </p>
        <p className="max-w-sm text-sm text-slate-300">
          Free-tier hosting sleeps when idle — first load takes a moment. LetsConnect is worth the wait.
        </p>
      </div>
    );
  }

  if (kind === "connect") {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CONNECT_ICONS.map(({ label, icon: Icon }, i) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 rounded-2xl bg-white/10 px-3 py-3 ring-1 ring-white/10"
            style={{ animation: `cold-pop 0.45s ease-out ${i * 0.07}s both` }}
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/15">
              <Icon className="size-5 text-white" />
            </span>
            <span className="text-[11px] font-medium text-slate-200">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (kind === "chat") {
    return (
      <div className="space-y-2 rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-indigo-500 px-3 py-2 text-xs text-white">
          What meetings do I have today?
        </div>
        <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-white/15 px-3 py-2 text-xs text-slate-100">
          You have 3 events today. Want me to summarize the first one?
        </div>
      </div>
    );
  }

  if (kind === "actions") {
    return (
      <div className="flex flex-wrap gap-2">
        {["Inbox", "Calendar", "Slack", "Jira"].map((label, i) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-slate-100 ring-1 ring-white/10"
            style={{ animation: `cold-pop 0.4s ease-out ${i * 0.06}s both` }}
          >
            <Link2 className="size-3.5 text-indigo-300" />
            {label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-400/20 ring-1 ring-emerald-300/30">
        <Check className="size-6 text-emerald-300" strokeWidth={2.5} />
      </span>
      <div>
        <p className="text-base font-medium text-white">You’re all set</p>
        <p className="text-sm text-slate-300">Connect · Chat · Get work done</p>
      </div>
    </div>
  );
}
