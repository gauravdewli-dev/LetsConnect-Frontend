import { LOGO_SRC } from "@/atoms/Logo";
import { Skeleton } from "@/atoms/ui/skeleton";

function AssistantBubbleSkeleton({ lines }: { lines: number }) {
  return (
    <div className="flex items-end gap-2.5">
      <Skeleton className="mb-5 size-8 shrink-0 rounded-full" />
      <div className="flex max-w-[min(85%,36rem)] flex-col gap-1.5">
        <div className="space-y-2 rounded-2xl rounded-bl-md border border-slate-200/60 bg-white px-4 py-3 shadow-sm">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-3.5 rounded-md"
              style={{ width: i === lines - 1 ? "72%" : "100%" }}
            />
          ))}
        </div>
        <Skeleton className="ml-1 h-2.5 w-10 rounded-md" />
      </div>
    </div>
  );
}

function UserBubbleSkeleton({ width }: { width: string }) {
  return (
    <div className="flex justify-end">
      <div className="flex max-w-[min(85%,32rem)] flex-col items-end gap-1.5">
        <Skeleton className="h-10 rounded-2xl rounded-br-md" style={{ width }} />
        <Skeleton className="h-2.5 w-10 rounded-md" />
      </div>
    </div>
  );
}

export default function ChatHistorySkeleton({ slackSynced = false }: { slackSynced?: boolean }) {
  return (
    <div
      className="flex flex-col gap-5 pt-4"
      role="status"
      aria-live="polite"
      aria-label="Loading conversation"
    >
      <p className="mx-auto text-xs font-medium text-muted-foreground/80">Loading your conversation…</p>

      <AssistantBubbleSkeleton lines={3} />
      <UserBubbleSkeleton width="11rem" />
      <AssistantBubbleSkeleton lines={2} />
      <UserBubbleSkeleton width="9rem" />
      <AssistantBubbleSkeleton lines={4} />

      <div className="flex items-center justify-center gap-2 pt-2">
        <img
          src={LOGO_SRC}
          alt=""
          className="size-5 rounded-full object-cover opacity-60 ring-2 ring-white"
        />
        <span className="text-xs text-muted-foreground">
          {slackSynced ? "Syncing messages from web & Slack" : "Loading your messages"}
        </span>
      </div>
    </div>
  );
}
