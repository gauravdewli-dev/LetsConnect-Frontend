import { useState } from "react";
import {
  ArrowRight,
  Check,
  ExternalLink,
  GitBranch,
  Mail,
  MessageSquare,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/atoms/ui/button";
import { cn } from "@/lib/utils";
import type { ConnectingProvider } from "@/lib/connectionCache";

import ChatPreviewMock from "./ChatPreviewMock";

interface TourStep {
  title: string;
  body: string;
  bullets?: string[];
  preview?: { user: string; assistant: string };
}

const TOUR: Record<ConnectingProvider, TourStep[]> = {
  gmail: [
    {
      title: "Gmail is connected",
      body: "LetsConnect can now work with your inbox — one place to ask questions and take action.",
      bullets: [
        "See unread emails and search your inbox",
        "Draft replies and send messages for you",
        "Find threads and summarize what matters",
      ],
    },
    {
      title: "Ask in plain language",
      body: "Open Text chat and type what you need. No menus, no switching apps.",
      preview: {
        user: "How many unread emails do I have?",
        assistant: "You have 12 unread threads in your inbox. Want me to list the most recent?",
      },
    },
    {
      title: "You're all set",
      body: "Head to Text chat whenever you want help with email — LetsConnect handles the rest.",
    },
  ],
  slack: [
    {
      title: "Slack is connected",
      body: "Message teammates and read channels without leaving LetsConnect.",
      bullets: [
        "Send DMs as you in your normal Slack conversations",
        "Read recent messages from channels",
        "Chat with LetsConnect inside Slack (Apps → LetsConnect)",
      ],
    },
    {
      title: "Try it in chat",
      body: "Ask LetsConnect to message someone or check a channel — it acts on your behalf.",
      preview: {
        user: "Send a DM to Alex saying the standup moved to 3pm",
        assistant: "Here's the message I'll send Alex:\n\n\"Hey — standup moved to 3pm today.\"\n\nSend it?",
      },
    },
    {
      title: "You're all set",
      body: "Use Text chat on the dashboard, or open LetsConnect in Slack for the same assistant.",
    },
  ],
  jira: [
    {
      title: "Jira is connected",
      body: "Manage tickets from one assistant — search, create, and update without opening Jira.",
      bullets: [
        "Find issues assigned to you or search with plain English",
        "Create new tickets with a quick description",
        "Update status, summary, or details on existing issues",
      ],
    },
    {
      title: "Tickets in conversation",
      body: "Describe what you need. LetsConnect finds the right Jira action for you.",
      preview: {
        user: "Show my open bugs in PROJ",
        assistant: "Found 3 open bugs in PROJ:\n• PROJ-42 — Login timeout\n• PROJ-38 — Mobile layout\n• PROJ-31 — API retry\n\nWant details on any of these?",
      },
    },
    {
      title: "You're all set",
      body: "Open Text chat anytime to search tickets, create issues, or stay on top of your work.",
    },
  ],
  github: [
    {
      title: "GitHub is connected",
      body: "Work with your repos from chat — including private ones you can access.",
      bullets: [
        "List repositories and open pull requests",
        "Create or merge PRs with confirmation",
        "Check GitHub Actions build status",
      ],
    },
    {
      title: "Repos and Actions in chat",
      body: "Ask in plain language. LetsConnect uses your GitHub account to read and act.",
      preview: {
        user: "Show open PRs on owner/repo and the latest Actions run",
        assistant: "3 open PRs on owner/repo.\nLatest Actions run: #142 — success on main.\nWant details on a PR or another run?",
      },
    },
    {
      title: "You're all set",
      body: "Open Text chat anytime to list PRs, raise a merge request, or check CI status.",
    },
  ],
};

const PROVIDER_META = {
  gmail: { label: "Gmail", icon: Mail, accent: "text-rose-600 bg-rose-50 ring-rose-100" },
  slack: { label: "Slack", icon: MessageSquare, accent: "text-violet-600 bg-violet-50 ring-violet-100" },
  jira: { label: "Jira", icon: Ticket, accent: "text-blue-600 bg-blue-50 ring-blue-100" },
  github: { label: "GitHub", icon: GitBranch, accent: "text-zinc-700 bg-zinc-100 ring-zinc-200" },
} as const;

interface ConnectionSuccessTourProps {
  provider: ConnectingProvider;
  onDismiss: () => void;
}

export default function ConnectionSuccessTour({ provider, onDismiss }: ConnectionSuccessTourProps) {
  const steps = TOUR[provider];
  const meta = PROVIDER_META[provider];
  const Icon = meta.icon;
  const [step, setStep] = useState(0);

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="relative w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl">
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition hover:bg-slate-100 hover:text-foreground"
        aria-label="Close"
      >
        <X className="size-4" />
      </button>

      <div className="mb-5 flex items-center gap-3">
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-xl ring-4",
            meta.accent,
          )}
        >
          {isLast ? <Check className="size-5" strokeWidth={2.5} /> : <Icon className="size-5" />}
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {meta.label} connected
          </p>
          <h2 className="text-lg font-semibold leading-tight">{current.title}</h2>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">{current.body}</p>

      {current.bullets && (
        <ul className="mt-4 space-y-2">
          {current.bullets.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-foreground">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-indigo-500" />
              {item}
            </li>
          ))}
        </ul>
      )}

      {current.preview && (
        <div className="mt-4">
          <ChatPreviewMock
            userMessage={current.preview.user}
            assistantMessage={current.preview.assistant}
          />
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === step ? "w-5 bg-indigo-600" : "w-1.5 bg-slate-200",
              )}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {!isLast ? (
            <>
              {step > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)}>
                  Back
                </Button>
              )}
              <Button size="sm" onClick={() => setStep((s) => s + 1)}>
                Next
                <ArrowRight className="size-4" />
              </Button>
            </>
          ) : (
            <>
              {provider === "slack" && (
                <Button asChild variant="outline" size="sm">
                  <a href="https://slack.com/signin" target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" />
                    Open Slack
                  </a>
                </Button>
              )}
              <Button asChild size="sm">
                <Link to="/?tab=chat">Start chatting</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
