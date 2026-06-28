import { ExternalLink } from "lucide-react";

import { JiraIcon } from "../../integrationGraph/brandIcons";
import type { MessageBlock } from "../types";

interface JiraIssueCardProps {
  block: Extract<MessageBlock, { type: "jira_issue" }>;
}

export default function JiraIssueCard({ block }: JiraIssueCardProps) {
  const content = (
    <div className="flex items-start gap-2.5 rounded-lg border border-blue-200/80 bg-gradient-to-br from-blue-50/80 to-white px-3 py-2.5 shadow-sm">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 ring-1 ring-blue-200/60">
        <JiraIcon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-blue-600 px-1.5 py-0.5 font-mono text-xs font-bold text-white">
            {block.key}
          </span>
          {block.status && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
              {block.status}
            </span>
          )}
        </div>
        {block.summary && (
          <p className="mt-1 text-sm font-medium leading-snug text-foreground">{block.summary}</p>
        )}
      </div>
      {block.url && <ExternalLink className="size-3.5 shrink-0 text-blue-500" />}
    </div>
  );

  if (block.url) {
    return (
      <a href={block.url} target="_blank" rel="noopener noreferrer" className="block transition hover:opacity-90">
        {content}
      </a>
    );
  }

  return content;
}
