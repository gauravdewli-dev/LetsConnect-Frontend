import { LOGO_SRC } from "@/atoms/Logo";

import MessageBlockRenderer from "./MessageBlockRenderer";
import { parseAssistantMessage } from "./parseMessage";

interface UserMessageProps {
  content: string;
  timestamp?: number;
  channel?: "web" | "slack";
}

function formatTimestamp(ts?: number) {
  if (!ts) return null;
  const date = new Date(ts);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
    hour: "numeric",
    minute: "2-digit",
  });
}

function ChannelLabel({ channel }: { channel?: "web" | "slack" }) {
  if (!channel) return null;
  const label = channel === "slack" ? "Slack" : "Web";
  return (
    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      {label}
    </span>
  );
}

export function UserMessage({ content, timestamp, channel }: UserMessageProps) {
  return (
    <div className="flex justify-end gap-2">
      <div className="flex max-w-[min(85%,32rem)] flex-col items-end gap-1">
        <div className="rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm">
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>
        <div className="flex items-center gap-1.5 px-1">
          <ChannelLabel channel={channel} />
          {timestamp && (
            <span className="text-[10px] text-muted-foreground">{formatTimestamp(timestamp)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface AssistantMessageProps {
  content: string;
  timestamp?: number;
  channel?: "web" | "slack";
}

export function AssistantMessage({ content, timestamp, channel }: AssistantMessageProps) {
  const blocks = parseAssistantMessage(content);

  return (
    <div className="flex items-end gap-2.5">
      <img
        src={LOGO_SRC}
        alt=""
        className="mb-5 size-7 rounded-full object-cover ring-2 ring-indigo-100 sm:size-10"
      />
      <div className="flex max-w-[min(85%,36rem)] flex-col gap-1">
        <div className="space-y-3 rounded-2xl rounded-bl-md border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
          {blocks.map((block, index) => (
            <MessageBlockRenderer key={index} block={block} index={index} />
          ))}
        </div>
        {timestamp && (
          <div className="flex items-center gap-1.5 px-1">
            <ChannelLabel channel={channel} />
            <span className="text-[10px] text-muted-foreground">{formatTimestamp(timestamp)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <img
        src={LOGO_SRC}
        alt=""
        className="mb-1 size-8 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
      />
      <div className="rounded-2xl rounded-bl-md border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-2 rounded-full bg-slate-400"
              style={{
                animation: "status-dot 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
