import { type FormEvent, useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send } from "lucide-react";

import { Button } from "@/atoms/ui/button";
import { Input } from "@/atoms/ui/input";
import type { ChatMessage } from "@/types";

import { postChat } from "../api";
import { useConnections } from "../hooks/useConnections";

const SUGGESTIONS = [
  "Which Slack workspace am I connected to?",
  "Send a Slack DM to Rohit saying hello",
  "Read the latest messages from #room_alerts",
  "How many unread emails do I have?",
];

export default function TextChat() {
  const { status } = useConnections();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const gmailConnected = status?.gmail_connected ?? false;
  const slackConnected = status?.slack_connected ?? false;
  const slackSendAsUser = status?.slack_send_as_user ?? false;
  const canChat = gmailConnected || (slackConnected && slackSendAsUser);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading || !canChat) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
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
      setMessages([...nextMessages, { role: "assistant", content: response.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  const connectedTools = [
    gmailConnected && "Gmail",
    slackSendAsUser && "Slack",
  ]
    .filter(Boolean)
    .join(" & ");

  const slackReconnectNeeded = slackConnected && !slackSendAsUser;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">Text chat</h1>
        <p className="text-sm text-muted-foreground">
          {slackReconnectNeeded
            ? "Reconnect Slack from Connected accounts so messages can be sent as you in your normal DMs."
            : canChat
              ? slackSendAsUser
                ? `Connected: ${connectedTools}. You can also chat with LetsConnect in Slack (Apps → LetsConnect).`
                : `Connected: ${connectedTools}.`
              : "Connect Gmail or Slack from Connected accounts to start chatting."}
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4 md:px-6">
        {messages.length === 0 && (
          <div className="mx-auto max-w-lg pt-8 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-indigo-50">
              <Bot className="size-6 text-indigo-600" />
            </div>
            <p className="font-medium">Start a conversation</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Search email, send Slack DMs, post to channels, and more.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto whitespace-normal text-left"
                  disabled={!canChat || loading}
                  onClick={() => void sendMessage(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={`${msg.role}-${index}`}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed md:max-w-[70%] ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "border bg-white text-foreground shadow-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t bg-background px-4 py-4 md:px-6">
        {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={canChat ? "Ask your assistant anything…" : "Connect Gmail or Slack first"}
            disabled={!canChat || loading}
            className="h-11"
          />
          <Button
            type="submit"
            disabled={!canChat || loading || !input.trim()}
            className="h-11 shrink-0 px-4"
          >
            <Send className="size-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
