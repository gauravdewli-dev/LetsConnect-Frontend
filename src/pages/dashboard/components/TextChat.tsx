import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Send, Sparkles } from "lucide-react";

import { LOGO_SRC } from "@/atoms/Logo";
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
  "Show my open pull requests on GitHub",
  "Check the latest GitHub Actions build status",
];

function toChatMessage(record: StoredChatMessage): ChatMessage {
  return {
    role: record.role,
    content: record.content,
    toolsUsed: record.tools_used.length > 0 ? record.tools_used : undefined,
    sentAt: Date.parse(record.created_at),
    channel: record.channel,
  };
}

export default function TextChat() {
  const { status } = useConnections();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const gmailConnected = status?.gmail_connected ?? false;
  const slackConnected = status?.slack_connected ?? false;
  const slackSendAsUser = status?.slack_send_as_user ?? false;
  const jiraConnected = status?.jira_connected ?? false;
  const githubConnected = status?.github_connected ?? false;
  const slackSynced = slackConnected && slackSendAsUser;
  const canChat = gmailConnected || slackSynced || jiraConnected || githubConnected;

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await getChatMessages();
      setConversationId(data.conversation_id);
      setMessages(data.messages.map(toChatMessage));
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : "Failed to load chat history");
    } finally {
      setHistoryLoading(false);
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
      setError(null);
    }

    if (historyLoading || slackSyncKeyRef.current === slackSyncKey) return;
    slackSyncKeyRef.current = slackSyncKey;
    void loadHistory();
  }, [historyLoading, loadHistory, slackConnected, slackSyncKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading || !canChat || historyLoading) return;

    const now = Date.now();
    const userMessage: ChatMessage = { role: "user", content: trimmed, sentAt: now, channel: "web" };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const response = await postChat({
        message: trimmed,
        conversation_id: conversationId ?? undefined,
      });
      setConversationId(response.conversation_id);
      setMessages([
        ...nextMessages,
        {
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
  ]
    .filter(Boolean)
    .join(", ");

  const statusLine = slackReconnectNeeded
    ? "Reconnect Slack from Connected accounts to send messages as you."
    : canChat
      ? slackSynced
        ? `Online · ${connectedTools} · synced with Slack`
        : `Online · ${connectedTools}`
      : "Connect Gmail, Slack, Jira, or GitHub to start chatting.";

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-slate-50/50">
      <div className="shrink-0 border-b bg-white/90 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img src={LOGO_SRC} alt="" className="size-10 rounded-full object-cover ring-2 ring-indigo-100" />
          <div>
            <h1 className="text-lg font-semibold">LetsConnect</h1>
            <p className="text-sm text-muted-foreground">{statusLine}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
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
                  key={`${msg.role}-${index}`}
                  content={msg.content}
                  timestamp={msg.sentAt}
                  channel={msg.channel}
                />
              ) : (
                <AssistantMessage
                  key={`${msg.role}-${index}`}
                  content={msg.content}
                  timestamp={msg.sentAt}
                  channel={msg.channel}
                />
              ),
            )}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="shrink-0 border-t bg-white px-4 py-4 md:px-8">
        {error && (
          <p className="mx-auto mb-2 max-w-3xl text-sm text-destructive">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl items-end gap-2">
          <div className="relative flex-1 rounded-2xl border border-slate-200 bg-slate-50/80 shadow-sm focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100">
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
              className="max-h-32 min-h-[44px] w-full resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
            />
          </div>
          <Button
            type="submit"
            disabled={!canChat || loading || historyLoading || !!historyError || !input.trim()}
            className="size-11 shrink-0 rounded-xl px-0"
          >
            <Send className="size-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-muted-foreground">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
