import { LOGO_SRC } from "@/atoms/Logo";

import MessageBlockRenderer from "./MessageBlockRenderer";
import { parseAssistantMessage } from "./parseMessage";

interface UserMessageProps {
  content: string;
  timestamp?: number;
}

function formatTime(ts?: number) {
  if (!ts) return null;
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function UserMessage({ content, timestamp }: UserMessageProps) {
  return (
    <div className="flex justify-end gap-2">
      <div className="flex max-w-[min(85%,32rem)] flex-col items-end gap-1">
        <div className="rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm">
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>
        {timestamp && (
          <span className="px-1 text-[10px] text-muted-foreground">{formatTime(timestamp)}</span>
        )}
      </div>
    </div>
  );
}

interface AssistantMessageProps {
  content: string;
  timestamp?: number;
}

export function AssistantMessage({ content, timestamp }: AssistantMessageProps) {
  const blocks = parseAssistantMessage(content);

  return (
    <div className="flex items-end gap-2.5">
      <img
        src={LOGO_SRC}
        alt=""
        className="mb-5 size-8 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
      />
      <div className="flex max-w-[min(85%,36rem)] flex-col gap-1">
        <div className="space-y-3 rounded-2xl rounded-bl-md border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
          {blocks.map((block, index) => (
            <MessageBlockRenderer key={index} block={block} index={index} />
          ))}
        </div>
        {timestamp && (
          <span className="px-1 text-[10px] text-muted-foreground">{formatTime(timestamp)}</span>
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
