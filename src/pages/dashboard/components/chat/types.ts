export type MessageBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "email_draft"; subject: string; to?: string; cc?: string; body: string }
  | { type: "email_row"; from?: string; subject?: string; date?: string; snippet?: string }
  | { type: "slack_draft"; text: string; recipient?: string; channel?: string }
  | { type: "jira_issue"; key: string; summary?: string; status?: string; url?: string }
  | { type: "list"; ordered: boolean; items: MessageBlock[][] }
  | { type: "callout"; variant: "success" | "info" | "warning"; title: string; text: string };

export type ParsedAssistantMessage = {
  blocks: MessageBlock[];
};
