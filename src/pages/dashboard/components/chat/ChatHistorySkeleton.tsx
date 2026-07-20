import { LOGO_SRC } from "@/atoms/Logo";

export default function ChatHistorySkeleton({ slackSynced = false }: { slackSynced?: boolean }) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-4 py-24"
      role="status"
      aria-live="polite"
      aria-label="Loading conversation"
    >
      <div className="relative flex size-16 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-indigo-200/60" />
        <img
          src={LOGO_SRC}
          alt=""
          className="relative size-14 rounded-full object-cover ring-2 ring-indigo-100 shadow-sm"
        />
      </div>
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-foreground">Loading conversation</p>
        <p className="text-xs text-muted-foreground">
          {slackSynced ? "Syncing messages from web & Slack…" : "Fetching your recent messages…"}
        </p>
      </div>
    </div>
  );
}
