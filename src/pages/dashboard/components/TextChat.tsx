import { type FormEvent, useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";

import { LOGO_SRC } from "@/atoms/Logo";
import { Button } from "@/atoms/ui/button";
import type { ChatMessage } from "@/types";

import { postChat } from "../api";
import { useConnections } from "../hooks/useConnections";

import { AssistantMessage, TypingIndicator, UserMessage } from "./chat/ChatMessages";

const SUGGESTIONS = [
  "Show my connected workspace and integrations",
  "Summarize unread emails in my inbox",
  "Draft a direct message to send on Slack",
  "Show Jira tickets assigned to me",
];

export default function TextChat() {
  const { status } = useConnections();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const gmailConnected = status?.gmail_connected ?? false;
  const slackConnected = status?.slack_connected ?? false;
  const slackSendAsUser = status?.slack_send_as_user ?? false;
  const jiraConnected = status?.jira_connected ?? false;
  const canChat = gmailConnected || (slackConnected && slackSendAsUser) || jiraConnected;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading || !canChat) return;

    const now = Date.now();
    const userMessage: ChatMessage = { role: "user", content: trimmed, sentAt: now };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const response = await postChat({
        message: trimmed,
        history: messages,
      });
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: response.reply,
          toolsUsed: response.tools_used,
          sentAt: Date.now(),
        },
      ]);
    } catch (err) {
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

  const connectedTools = [
    gmailConnected && "Gmail",
    slackSendAsUser && "Slack",
    jiraConnected && "Jira",
  ]
    .filter(Boolean)
    .join(", ");

  const slackReconnectNeeded = slackConnected && !slackSendAsUser;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-slate-50/50">
      <div className="shrink-0 border-b bg-white/90 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img src={LOGO_SRC} alt="" className="size-10 rounded-full object-cover ring-2 ring-indigo-100" />
          <div>
            <h1 className="text-lg font-semibold">LetsConnect</h1>
            <p className="text-sm text-muted-foreground">
              {slackReconnectNeeded
                ? "Reconnect Slack from Connected accounts to send messages as you."
                : canChat
                  ? `Online · ${connectedTools}`
                  : "Connect Gmail, Slack, or Jira to start chatting."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center pt-12 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-indigo-100">
                <Sparkles className="size-8 text-indigo-600" />
              </div>
              <p className="text-lg font-semibold">How can I help today?</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Search email, send Slack messages, manage Jira tickets, and more — all in one place.
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

          {messages.map((msg, index) =>
            msg.role === "user" ? (
              <UserMessage key={`${msg.role}-${index}`} content={msg.content} timestamp={msg.sentAt} />
            ) : (
              <AssistantMessage
                key={`${msg.role}-${index}`}
                content={msg.content}
                timestamp={msg.sentAt}
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
              placeholder={canChat ? "Message LetsConnect…" : "Connect an integration first"}
              disabled={!canChat || loading}
              className="max-h-32 min-h-[44px] w-full resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
            />
          </div>
          <Button
            type="submit"
            disabled={!canChat || loading || !input.trim()}
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
