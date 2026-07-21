import { useEffect, useRef, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  GitBranch,
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

/** Show after /auth/me has been pending this long. */
const SHOW_DELAY_MS = 5000;

/** Fixed card footprint — content swaps inside; body scrolls on small screens. */
const CARD_CLASS =
  "relative flex h-[min(90dvh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl shadow-slate-900/25 animate-[cold-tour-in_0.45s_ease-out]";

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
    body: "Your AI assistant for work tools — Gmail, Calendar, Slack, Jira, and GitHub in one chat. We’re on Render’s free tier, so the first wake-up can take 30–60 seconds. Browse these tips while the server starts.",
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
      "GitHub — repos, PRs, and Actions status",
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
      "“Show open PRs on owner/repo”",
    ],
    visual: "chat",
  },
  {
    eyebrow: "What you can do",
    title: "One place for the busywork",
    body: "Search inboxes, schedule meetings, ping Slack, manage Jira, and check GitHub — without switching tabs all day.",
    points: [
      "Summarize threads and draft replies",
      "Create calendar events with a sentence",
      "Send Slack DMs as you",
      "Create or update Jira issues from chat",
      "List PRs and check Actions builds",
    ],
    visual: "actions",
  },
  {
    eyebrow: "You’re ready",
    title: "Server’s waking — you’re set",
    body: "When loading finishes, connect an account (or open Text chat) and try your first request. You won’t see this product tour again — we’ll still explain cold starts when Render is waking up.",
    visual: "ready",
  },
];

const COLD_START_COPY = {
  eyebrow: "Server cold start",
  title: "Waking up the API",
  body: "LetsConnect’s backend is hosted on Render’s free tier. When idle, the service sleeps to save resources. The first request (like signing you in with /auth/me) waits while Render starts the server again — usually about 30–60 seconds. This isn’t a bug; it’s free-tier spin-up time.",
};

const CONNECT_ICONS: { label: string; icon: ComponentType<{ className?: string }> }[] = [
  { label: "Gmail", icon: Mail },
  { label: "Calendar", icon: Calendar },
  { label: "Slack", icon: MessageSquare },
  { label: "Jira", icon: Ticket },
  { label: "GitHub", icon: GitBranch },
];

type ColdStartTourProps = {
  active: boolean;
  delayMs?: number;
};

export default function ColdStartTour({ active, delayMs = SHOW_DELAY_MS }: ColdStartTourProps) {
  const showFullTour = !hasSeenColdStartTour();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [stillLoading, setStillLoading] = useState(true);
  const loadingStartedRef = useRef<number | null>(null);

  useEffect(() => {
    if (active) {
      loadingStartedRef.current ??= Date.now();
      setStillLoading(true);
      return;
    }

    if (visible) {
      setStillLoading(false);
      return;
    }

    loadingStartedRef.current = null;
    setElapsedSec(0);
    setVisible(false);
  }, [active, visible]);

  useEffect(() => {
    if (!active || visible) return;
    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [active, visible, delayMs]);

  useEffect(() => {
    if (!visible) return;
    const tick = window.setInterval(() => {
      const started = loadingStartedRef.current;
      if (started) setElapsedSec(Math.floor((Date.now() - started) / 1000));
    }, 1000);
    return () => window.clearInterval(tick);
  }, [visible]);

  useEffect(() => {
    if (!visible || stillLoading || showFullTour) return;
    const timer = window.setTimeout(() => setVisible(false), 1200);
    return () => window.clearTimeout(timer);
  }, [visible, stillLoading, showFullTour]);

  function dismiss() {
    if (showFullTour) markColdStartTourSeen();
    setVisible(false);
  }

  if (!visible) return null;

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

      <div className={CARD_CLASS}>
        {/* Fixed header */}
        <div className="relative shrink-0 overflow-hidden bg-[#0f172a] px-5 pb-4 pt-4 text-white sm:px-6 sm:pt-5">
          <div className="pointer-events-none absolute -left-16 -top-16 size-48 rounded-full bg-indigo-500/35 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-10 size-56 rounded-full bg-sky-500/20 blur-3xl" />

          <div className="relative flex items-start justify-between gap-3">
            <Logo imageClassName="size-10" nameClassName="text-base text-white" />
            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label={showFullTour ? "Skip tour" : "Dismiss"}
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Visual slot — fixed min-height so card size stays stable when swapping slides */}
          <div className="relative mt-4 min-h-[120px] sm:min-h-[132px]">
            {showFullTour ? (
              <div key={step} className="animate-[cold-slide_0.4s_ease-out]">
                <SlideVisual kind={slide.visual} />
              </div>
            ) : (
              <div className="flex h-full flex-col justify-center animate-[cold-slide_0.4s_ease-out]">
                <p className="text-lg font-medium leading-snug text-indigo-200 sm:text-xl">
                  Render free tier is waking up
                </p>
                <p className="mt-1.5 text-sm text-slate-300">Usually 30–60 seconds on first load</p>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable body — same width/height budget; overflow on small screens */}
        <div className="flex min-h-0 flex-1 flex-col bg-white">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
            <div
              key={showFullTour ? `tour-${step}` : "cold-start"}
              className="animate-[cold-slide_0.4s_ease-out]"
            >
              {showFullTour ? (
                <SlideCopy slide={slide} />
              ) : (
                <SlideCopy
                  slide={{
                    eyebrow: COLD_START_COPY.eyebrow,
                    title: COLD_START_COPY.title,
                    body: COLD_START_COPY.body,
                    visual: "welcome",
                  }}
                />
              )}
            </div>
          </div>

          {/* Fixed footer */}
          <div className="shrink-0 border-t border-slate-100 px-5 pb-5 pt-3 sm:px-6">
            <LoadingStatus stillLoading={stillLoading} elapsedSec={elapsedSec} />

            <div className="mt-4 flex items-center justify-between gap-3">
              {showFullTour ? (
                <>
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
                      <Button size="sm" onClick={dismiss}>
                        {stillLoading ? "Got it" : "Continue"}
                        <Check className="size-4" />
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <Button size="sm" className="ml-auto" onClick={dismiss}>
                  {stillLoading ? "Got it" : "Continue"}
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

function SlideCopy({ slide }: { slide: Slide }) {
  return (
    <>
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
    </>
  );
}

function LoadingStatus({ stillLoading, elapsedSec }: { stillLoading: boolean; elapsedSec: number }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <span className="relative flex size-2 shrink-0">
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
        <p className="truncate text-xs text-muted-foreground">
          {stillLoading ? "Waking Render free tier…" : "Backend is ready"}
        </p>
      </div>
      <span className="shrink-0 text-[11px] font-medium tabular-nums text-indigo-600">
        {elapsedSec > 0 ? `${elapsedSec}s` : "…"}
      </span>
    </div>
  );
}

function SlideVisual({ kind }: { kind: Slide["visual"] }) {
  if (kind === "welcome") {
    return (
      <div className="flex flex-col items-start gap-2">
        <p className="max-w-sm text-xl font-normal leading-snug text-indigo-200 sm:text-2xl">
          AI assistant for your work tools
        </p>
        <p className="max-w-sm text-sm text-slate-300">
          Free-tier hosting sleeps when idle — first load takes a moment.
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
            className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/10 px-2 py-2.5 ring-1 ring-white/10 sm:gap-2 sm:px-3 sm:py-3"
            style={{ animation: `cold-pop 0.45s ease-out ${i * 0.07}s both` }}
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-white/15 sm:size-10">
              <Icon className="size-4 text-white sm:size-5" />
            </span>
            <span className="text-[10px] font-medium text-slate-200 sm:text-[11px]">{label}</span>
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
        {["Inbox", "Calendar", "Slack", "Jira", "GitHub"].map((label, i) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-100 ring-1 ring-white/10 sm:px-3 sm:py-1.5"
            style={{ animation: `cold-pop 0.4s ease-out ${i * 0.06}s both` }}
          >
            <Link2 className="size-3 text-indigo-300 sm:size-3.5" />
            {label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/20 ring-1 ring-emerald-300/30 sm:size-12">
        <Check className="size-5 text-emerald-300 sm:size-6" strokeWidth={2.5} />
      </span>
      <div>
        <p className="text-base font-medium text-white">You’re all set</p>
        <p className="text-sm text-slate-300">Connect · Chat · Get work done</p>
      </div>
    </div>
  );
}
