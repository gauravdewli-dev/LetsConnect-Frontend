import { type FormEvent, type UIEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Loader2, RefreshCw, Send, Sparkles } from "lucide-react";

import { Button } from "@/atoms/ui/button";
import type { ChatMessage, StoredChatMessage } from "@/types";

import { getChatMessages, postChat } from "../api";
import { useConnections } from "../hooks/useConnections";

import ChatHistorySkeleton from "./chat/ChatHistorySkeleton";
import { AssistantMessage, TypingIndicator, UserMessage } from "./chat/ChatMessages";

const SUGGESTIONS = [
  "Show my connected workspace and integrations",
  "What's on my calendar this week?",
  "Schedule a meeting tomorrow at 3pm with a Google Meet link",
  "Summarize unread emails in my inbox",
  "Show Jira tickets assigned to me",
  "Show open PRs I raised on GitHub",
  "Show PRs waiting for my review on GitHub",
  "Review my latest open PR — title, description, and link",
];

const SCROLL_TOP_THRESHOLD_PX = 80;
/** Latest / older pages are always this size — one request at a time. */
const CHAT_PAGE_SIZE = 10;

function toChatMessage(record: StoredChatMessage): ChatMessage {
  return {
    id: record.id,
    role: record.role,
    content: record.content,
    toolsUsed: record.tools_used.length > 0 ? record.tools_used : undefined,
    sentAt: Date.parse(record.created_at),
    channel: record.channel,
  };
}

function prependUnique(older: ChatMessage[], current: ChatMessage[]): ChatMessage[] {
  const seen = new Set(current.map((m) => m.id).filter(Boolean));
  const unique = older.filter((m) => !m.id || !seen.has(m.id));
  return unique.length === 0 ? current : [...unique, ...current];
}

export default function TextChat() {
  const { status } = useConnections();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  /** ISO timestamp cursor for the next older page; null = reached first message in DB. */
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stickToBottomRef = useRef(true);
  const loadingOlderRef = useRef(false);
  const nextCursorRef = useRef<string | null>(null);
  /** True only after user scrolls up from the bottom — prevents open-chat `before` calls. */
  const userScrolledUpRef = useRef(false);
  /** When set, restore this scroll position after older messages are prepended (no jump). */
  const scrollAnchorRef = useRef<{ height: number; top: number } | null>(null);

  const gmailConnected = status?.gmail_connected ?? false;
  const slackConnected = status?.slack_connected ?? false;
  const slackSendAsUser = status?.slack_send_as_user ?? false;
  const jiraConnected = status?.jira_connected ?? false;
  const githubConnected = status?.github_connected ?? false;
  const slackSynced = slackConnected && slackSendAsUser;
  const canChat = gmailConnected || slackSynced || jiraConnected || githubConnected;

  /** Open chat: latest 10 only — no `before` filter. */
  const loadHistory = useCallback(async () => {
    userScrolledUpRef.current = false;
    scrollAnchorRef.current = null;
    stickToBottomRef.current = true;
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await getChatMessages({ limit: CHAT_PAGE_SIZE });
      setConversationId(data.conversation_id);
      setMessages(data.messages.map(toChatMessage));
      setNextCursor(data.next_cursor);
      nextCursorRef.current = data.next_cursor;
      stickToBottomRef.current = true;
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : "Failed to load chat history");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  /**
   * Scroll-up: next older batch of 10 using `before` (oldest timestamp of current page).
   * Continues until `next_cursor` is null (start of conversation in DB).
   */
  const loadOlderMessages = useCallback(async () => {
    const before = nextCursorRef.current;
    if (!before || loadingOlderRef.current || !userScrolledUpRef.current) return;

    const container = scrollRef.current;
    scrollAnchorRef.current = {
      height: container?.scrollHeight ?? 0,
      top: container?.scrollTop ?? 0,
    };

    loadingOlderRef.current = true;
    setLoadingOlder(true);
    stickToBottomRef.current = false;

    try {
      const data = await getChatMessages({ limit: CHAT_PAGE_SIZE, before });
      const older = data.messages.map(toChatMessage);
      setMessages((prev) => prependUnique(older, prev));
      setNextCursor(data.next_cursor);
      nextCursorRef.current = data.next_cursor;
    } catch {
      scrollAnchorRef.current = null;
    } finally {
      loadingOlderRef.current = false;
      setLoadingOlder(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const slackSyncKey = `${slackConnected}:${slackSendAsUser}`;
  const slackSyncKeyRef = useRef(slackSyncKey);
  const prevSlackConnectedRef = useRef(slackConnected);

  useEffect(() => {
    const wasConnected = prevSlackConnectedRef.current;
    prevSlackConnectedRef.current = slackConnected;

    if (wasConnected && !slackConnected) {
      setMessages([]);
      setConversationId(null);
      setNextCursor(null);
      nextCursorRef.current = null;
      userScrolledUpRef.current = false;
      scrollAnchorRef.current = null;
      setError(null);
    }

    if (historyLoading || slackSyncKeyRef.current === slackSyncKey) return;
    slackSyncKeyRef.current = slackSyncKey;
    void loadHistory();
  }, [historyLoading, loadHistory, slackConnected, slackSyncKey]);

  // Scroll only when sticking to bottom (open / send). Never auto-scroll when loading older.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const anchor = scrollAnchorRef.current;
    if (anchor) {
      el.scrollTop = anchor.top + (el.scrollHeight - anchor.height);
      scrollAnchorRef.current = null;
      return;
    }

    if (loadingOlderRef.current || !stickToBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading, historyLoading]);

  function handleScroll(e: UIEvent<HTMLDivElement>) {
    if (loadingOlderRef.current || scrollAnchorRef.current) return;

    const el = e.currentTarget;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distanceFromBottom < 100;

    if (distanceFromBottom > 120) {
      userScrolledUpRef.current = true;
    }

    if (userScrolledUpRef.current && el.scrollTop <= SCROLL_TOP_THRESHOLD_PX) {
      void loadOlderMessages();
    }
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading || !canChat || historyLoading) return;

    const now = Date.now();
    const userMessage: ChatMessage = {
      id: `local-user-${now}`,
      role: "user",
      content: trimmed,
      sentAt: now,
      channel: "web",
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);
    stickToBottomRef.current = true;
    userScrolledUpRef.current = false;
    scrollAnchorRef.current = null;

    try {
      const response = await postChat({
        message: trimmed,
        conversation_id: conversationId ?? undefined,
      });
      setConversationId(response.conversation_id);
      setMessages([
        ...nextMessages,
        {
          id: `local-assistant-${Date.now()}`,
          role: "assistant",
          content: response.reply,
          toolsUsed: response.tools_used,
          sentAt: Date.now(),
          channel: "web",
        },
      ]);
    } catch (err) {
      setMessages(messages);
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  }

  const slackReconnectNeeded = slackConnected && !slackSendAsUser;

  const connectedTools = [
    gmailConnected && "Gmail",
    slackSynced && "Slack",
    jiraConnected && "Jira",
    githubConnected && "GitHub",
  ].filter(Boolean) as string[];

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-slate-50/50">
      <div className="shrink-0 border-b bg-white px-3 py-2.5 sm:px-4 md:flex md:h-[4.375rem] md:flex-col md:justify-center md:px-6 md:py-0">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
            <h1 className="text-base font-semibold sm:text-lg">LetsConnect</h1>
            {canChat && !slackReconnectNeeded && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                Online
              </span>
            )}
          </div>
          {slackReconnectNeeded ? (
            <p className="mt-0.5 text-xs leading-snug text-amber-700 sm:text-sm">
              Reconnect Slack from Connected accounts to send as you.
            </p>
          ) : canChat ? (
            <p
              className="mt-0.5 hidden truncate text-xs text-muted-foreground sm:block sm:text-sm"
              title={connectedTools.join(", ")}
            >
              {connectedTools.join(" · ")}
              {slackSynced ? " · Synced with Slack" : ""}
            </p>
          ) : (
            <p className="mt-0.5 hidden text-xs leading-snug text-muted-foreground sm:block sm:text-sm">
              Connect Gmail, Slack, Jira, or GitHub to start chatting.
            </p>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 md:px-8 md:py-6"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4">
          {historyLoading && <ChatHistorySkeleton slackSynced={slackSynced} />}

          {!historyLoading && historyError && (
            <div className="flex flex-col items-center gap-4 pt-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-red-50">
                <RefreshCw className="size-6 text-red-500" />
              </div>
              <div className="max-w-sm space-y-1">
                <p className="font-medium text-foreground">Couldn&apos;t load your conversation</p>
                <p className="text-sm text-muted-foreground">{historyError}</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => void loadHistory()}>
                <RefreshCw className="mr-2 size-3.5" />
                Try again
              </Button>
            </div>
          )}

          {!historyLoading && !historyError && loadingOlder && (
            <div className="flex items-center justify-center gap-2 py-3">
              <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
                <Loader2 className="size-3.5 animate-spin text-indigo-500" />
                Loading earlier messages…
              </div>
            </div>
          )}

          {!historyLoading && !historyError && !loadingOlder && !nextCursor && messages.length > 0 && (
            <p className="py-1 text-center text-[11px] text-muted-foreground/70">
              Beginning of conversation
            </p>
          )}

          {!historyLoading && !historyError && messages.length === 0 && (
            <div className="flex flex-col items-center pt-12 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-indigo-100">
                <Sparkles className="size-8 text-indigo-600" />
              </div>
              <p className="text-lg font-semibold">How can I help today?</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Search email, send Slack messages, manage Jira tickets, check GitHub PRs — all in one place.
              </p>
              <div className="mt-8 grid w-full max-w-lg gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={!canChat || loading}
                    onClick={() => void sendMessage(suggestion)}
                    className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-left text-sm text-foreground shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/50 disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!historyLoading &&
            !historyError &&
            messages.map((msg, index) =>
              msg.role === "user" ? (
                <UserMessage
                  key={msg.id ?? `${msg.role}-${msg.sentAt ?? index}`}
                  content={msg.content}
                  timestamp={msg.sentAt}
                  channel={msg.channel}
                />
              ) : (
                <AssistantMessage
                  key={msg.id ?? `${msg.role}-${msg.sentAt ?? index}`}
                  content={msg.content}
                  timestamp={msg.sentAt}
                  channel={msg.channel}
                />
              ),
            )}

          {loading && <TypingIndicator />}
        </div>
      </div>

      <div className="shrink-0 border-t bg-white px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:flex md:h-24 md:flex-col md:justify-center md:gap-1 md:px-8 md:py-0">
        {error && (
          <p className="mx-auto mb-1 max-w-3xl truncate text-xs text-destructive md:mb-0">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-3xl items-end gap-2">
          <div className="relative flex min-h-10 flex-1 items-center rounded-2xl border border-slate-200 bg-slate-50/80 shadow-sm transition-[border-color,box-shadow] focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 md:min-h-11">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={
                historyLoading
                  ? "Loading conversation…"
                  : canChat
                    ? "Message LetsConnect…"
                    : "Connect an integration first"
              }
              disabled={!canChat || loading || historyLoading || !!historyError}
              className="max-h-[min(8rem,30dvh)] min-h-10 w-full resize-none bg-transparent px-3 py-2 text-sm leading-5 outline-none placeholder:text-muted-foreground disabled:opacity-50 md:max-h-24 md:min-h-11 md:px-4 md:py-2.5"
            />
          </div>
          <Button
            type="submit"
            disabled={!canChat || loading || historyLoading || !!historyError || !input.trim()}
            className="size-10 shrink-0 rounded-2xl px-0 md:size-11"
          >
            <Send className="size-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
        <p className="mx-auto mt-1.5 hidden max-w-3xl text-center text-[10px] leading-none text-muted-foreground md:mt-0 md:block">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
