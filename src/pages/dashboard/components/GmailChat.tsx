import { type FormEvent, useRef, useState } from "react";

import { Button } from "@/atoms/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/atoms/ui/card";
import { Input } from "@/atoms/ui/input";
import type { ChatMessage } from "@/types";

import { postChat } from "../api";
import { useConnections } from "../hooks/useConnections";

const SUGGESTIONS = [
  "How many unread emails do I have?",
  "Summarize my latest unread emails",
  "Search emails from this week",
];

export default function GmailChat() {
  const { status } = useConnections();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const gmailConnected = status?.gmail_connected ?? false;

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading || !gmailConnected) return;

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
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Assistant</CardTitle>
        <CardDescription>
          {gmailConnected
            ? "Ask about connected tools — starting with Gmail."
            : "Connect integrations above to start chatting."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-80 space-y-3 overflow-y-auto rounded-md border bg-muted/30 p-3">
          {messages.length === 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Try asking:</p>
              {SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mr-2 mb-2 h-auto whitespace-normal text-left"
                  disabled={!gmailConnected || loading}
                  onClick={() => void sendMessage(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
          {messages.map((msg, index) => (
            <div
              key={`${msg.role}-${index}`}
              className={`rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "ml-8 bg-primary text-primary-foreground"
                  : "mr-8 bg-background border"
              }`}
            >
              {msg.content}
            </div>
          ))}
          {loading && (
            <p className="text-sm text-muted-foreground">Thinking…</p>
          )}
          <div ref={bottomRef} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={gmailConnected ? "Ask about your emails…" : "Connect Gmail first"}
            disabled={!gmailConnected || loading}
          />
          <Button type="submit" disabled={!gmailConnected || loading || !input.trim()}>
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
