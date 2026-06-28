import type { MessageBlock } from "./types";

const CALLOUT_PATTERNS: { re: RegExp; variant: "success" | "info" | "warning"; title: string }[] = [
  { re: /^\*\*Delivered:\*\*\s*(.+)$/is, variant: "success", title: "Delivered" },
  { re: /^\*\*Where to find it:\*\*\s*(.+)$/is, variant: "info", title: "Where to find it" },
  { re: /^\*\*Saved as draft:\*\*\s*(.+)$/is, variant: "info", title: "Saved as draft" },
];

const FIELD_RE = {
  subject: /(?:\*\*)?Subject(?:\*\*)?:\s*(.+?)(?:\n|$)/i,
  to: /(?:\*\*)?To(?:\*\*)?:\s*(.+?)(?:\n|$)/i,
  cc: /(?:\*\*)?Cc(?:\*\*)?:\s*(.+?)(?:\n|$)/i,
  from: /(?:\*\*)?From(?:\*\*)?:\s*(.+?)(?:\n|$|\*\*)/i,
  date: /(?:\*\*)?Date(?:\*\*)?:\s*(.+?)(?:\n|$|\*\*)/i,
};

function stripMarkdownBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1").trim();
}

function parseCallout(text: string): MessageBlock | null {
  for (const { re, variant, title } of CALLOUT_PATTERNS) {
    const match = text.trim().match(re);
    if (match) {
      return { type: "callout", variant, title, text: stripMarkdownBold(match[1].trim()) };
    }
  }
  return null;
}

function parseEmailDraft(text: string): MessageBlock | null {
  const trimmed = text.trim();
  const subjectMatch = trimmed.match(FIELD_RE.subject);
  if (!subjectMatch) return null;

  const toMatch = trimmed.match(FIELD_RE.to);
  const ccMatch = trimmed.match(FIELD_RE.cc);

  let bodyStart = trimmed.indexOf("\n\n");
  if (bodyStart === -1) {
    const afterSubject = trimmed.slice(subjectMatch.index! + subjectMatch[0].length).trim();
    if (!afterSubject || afterSubject.startsWith("To:") || afterSubject.startsWith("Cc:")) {
      bodyStart = -1;
    } else {
      bodyStart = trimmed.indexOf(afterSubject);
    }
  }

  let body = "";
  if (bodyStart >= 0) {
    body = trimmed.slice(bodyStart).trim();
    body = body.replace(/^(?:To|Cc):\s*.+\n?/gim, "").trim();
  }

  const hasHeadersOnly = !body && (toMatch || ccMatch);
  if (!body && !hasHeadersOnly) return null;

  return {
    type: "email_draft",
    subject: stripMarkdownBold(subjectMatch[1]),
    to: toMatch ? stripMarkdownBold(toMatch[1]) : undefined,
    cc: ccMatch ? stripMarkdownBold(ccMatch[1]) : undefined,
    body,
  };
}

function parseEmailRow(text: string): MessageBlock | null {
  const fromMatch = text.match(FIELD_RE.from);
  const subjectMatch = text.match(FIELD_RE.subject);
  const dateMatch = text.match(FIELD_RE.date);

  if (!fromMatch && !subjectMatch) return null;

  let snippet = text;
  for (const match of [fromMatch, subjectMatch, dateMatch]) {
    if (match) snippet = snippet.replace(match[0], "");
  }
  snippet = stripMarkdownBold(snippet.replace(/^[\d]+[.)]\s*/, "").replace(/^[-*•]\s*/, "").trim());

  return {
    type: "email_row",
    from: fromMatch ? stripMarkdownBold(fromMatch[1]) : undefined,
    subject: subjectMatch ? stripMarkdownBold(subjectMatch[1]) : undefined,
    date: dateMatch ? stripMarkdownBold(dateMatch[1]) : undefined,
    snippet: snippet || undefined,
  };
}

function parseSlackDraft(text: string): MessageBlock | null {
  const trimmed = text.trim();
  const recipientMatch = trimmed.match(
    /(?:slack\s+)?(?:message|dm)(?:\s+to)?(?:\s+\*\*([^*]+)\*\*|\s+([^\n:]+))?:?\s*\n([\s\S]+)/i,
  );
  if (recipientMatch) {
    return {
      type: "slack_draft",
      recipient: stripMarkdownBold(recipientMatch[1] || recipientMatch[2] || ""),
      text: recipientMatch[3].trim(),
    };
  }

  const quoted = trimmed.match(/^["'`""]([\s\S]+)["'`""]$/);
  if (quoted && trimmed.toLowerCase().includes("slack")) {
    return { type: "slack_draft", text: quoted[1].trim() };
  }

  return null;
}

function parseJiraIssue(text: string): MessageBlock | null {
  const keyMatch = text.match(/\b([A-Z][A-Z0-9]+-\d+)\b/);
  if (!keyMatch) return null;

  const urlMatch = text.match(/https?:\/\/[^\s)]+/);
  const statusMatch = text.match(/(?:\*\*)?Status(?:\*\*)?:\s*(.+?)(?:\n|$|\*\*)/i);
  const summaryMatch = text.match(/(?:\*\*)?Summary(?:\*\*)?:\s*(.+?)(?:\n|$|\*\*)/i);

  let snippet = text.replace(keyMatch[0], "").trim();
  if (summaryMatch) snippet = snippet.replace(summaryMatch[0], "").trim();
  if (statusMatch) snippet = snippet.replace(statusMatch[0], "").trim();
  if (urlMatch) snippet = snippet.replace(urlMatch[0], "").trim();
  snippet = stripMarkdownBold(snippet.replace(/^[-*•\d.)]+\s*/, "").trim());

  if (!summaryMatch && !statusMatch && snippet.length < 8) return null;

  return {
    type: "jira_issue",
    key: keyMatch[1],
    summary: summaryMatch ? stripMarkdownBold(summaryMatch[1]) : snippet || undefined,
    status: statusMatch ? stripMarkdownBold(statusMatch[1]) : undefined,
    url: urlMatch?.[0],
  };
}

function parseList(text: string): MessageBlock | null {
  const lines = text.split("\n").filter((l) => l.trim());
  const ordered = /^\d+[.)]\s/.test(lines[0]?.trim() ?? "");
  const bullet = /^[-*•]\s/.test(lines[0]?.trim() ?? "");
  if (!ordered && !bullet) return null;

  const items: MessageBlock[][] = [];
  for (const line of lines) {
    const itemText = line.replace(/^\d+[.)]\s/, "").replace(/^[-*•]\s/, "").trim();
    const row = parseEmailRow(itemText);
    const jira = !row ? parseJiraIssue(itemText) : null;
    if (row) items.push([row]);
    else if (jira) items.push([jira]);
    else items.push([{ type: "paragraph", text: itemText }]);
  }

  return { type: "list", ordered, items };
}

function parseHeading(text: string): MessageBlock | null {
  const trimmed = text.trim();
  const md = trimmed.match(/^#{1,3}\s+(.+)$/);
  if (md) return { type: "heading", text: md[1].trim() };
  if (/^\*\*.+\*\*:?\s*$/.test(trimmed) && trimmed.length < 80) {
    return { type: "heading", text: stripMarkdownBold(trimmed.replace(/:$/, "")) };
  }
  return null;
}

function classifySegment(text: string): MessageBlock[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const block =
    parseCallout(trimmed) ??
    parseEmailDraft(trimmed) ??
    parseSlackDraft(trimmed) ??
    parseList(trimmed) ??
    parseHeading(trimmed) ??
    parseEmailRow(trimmed) ??
    parseJiraIssue(trimmed);

  if (block) return [block];
  return [{ type: "paragraph", text: trimmed }];
}

export function parseAssistantMessage(content: string): MessageBlock[] {
  const segments = splitSegments(content);
  const blocks: MessageBlock[] = [];

  for (const segment of segments) {
    blocks.push(...classifySegment(segment));
  }

  return blocks.length > 0 ? blocks : [{ type: "paragraph", text: content }];
}

function splitSegments(content: string): string[] {
  const segments: string[] = [];
  let buffer = "";
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isListLine = /^\s*(?:\d+[.)]|[-*•])\s/.test(line);
    const prevIsList = buffer && /^\s*(?:\d+[.)]|[-*•])\s/m.test(buffer.split("\n").at(-1) ?? "");

    if (isListLine && !prevIsList && buffer.trim()) {
      segments.push(buffer.trim());
      buffer = line;
    } else if (!isListLine && prevIsList && line.trim() === "") {
      segments.push(buffer.trim());
      buffer = "";
    } else {
      buffer += (buffer ? "\n" : "") + line;
    }
  }
  if (buffer.trim()) segments.push(buffer.trim());

  if (segments.length === 0 && content.trim()) {
    return content.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  }

  return segments.flatMap((seg) => {
    if (seg.includes("\n\n")) {
      return seg.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
    }
    return [seg];
  });
}

