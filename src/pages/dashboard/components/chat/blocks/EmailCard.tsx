import { Mail, Paperclip } from "lucide-react";

import { GmailIcon } from "../../integrationGraph/brandIcons";
import InlineMarkdown from "../InlineMarkdown";
import type { MessageBlock } from "../types";

interface EmailDraftCardProps {
  block: Extract<MessageBlock, { type: "email_draft" }>;
}

export default function EmailDraftCard({ block }: EmailDraftCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-rose-200/80 bg-gradient-to-br from-rose-50/90 to-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-rose-100 bg-white/80 px-3 py-2">
        <GmailIcon className="size-4" />
        <span className="text-xs font-semibold uppercase tracking-wide text-rose-700">
          Email draft
        </span>
      </div>
      <div className="space-y-2 px-3 py-3 text-sm">
        <div className="flex gap-2">
          <Mail className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Subject
            </p>
            <p className="font-semibold text-foreground">{block.subject}</p>
          </div>
        </div>
        {block.to && (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              To
            </p>
            <p className="text-foreground">{block.to}</p>
          </div>
        )}
        {block.cc && (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Cc
            </p>
            <p className="text-foreground">{block.cc}</p>
          </div>
        )}
        {block.body && (
          <div className="rounded-lg border border-rose-100/80 bg-white/90 px-3 py-2.5">
            <InlineMarkdown text={block.body} className="text-sm leading-relaxed text-foreground/90" />
          </div>
        )}
      </div>
    </div>
  );
}

interface EmailRowCardProps {
  block: Extract<MessageBlock, { type: "email_row" }>;
}

export function EmailRowCard({ block }: EmailRowCardProps) {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm">
      <div className="flex items-start gap-2">
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-rose-50 ring-1 ring-rose-100">
          <GmailIcon className="size-3.5" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          {block.subject && (
            <p className="truncate font-medium text-foreground">{block.subject}</p>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            {block.from && <span>{block.from}</span>}
            {block.date && <span>{block.date}</span>}
          </div>
          {block.snippet && (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {block.snippet}
            </p>
          )}
        </div>
        <Paperclip className="size-3.5 shrink-0 text-muted-foreground/40" />
      </div>
    </div>
  );
}
