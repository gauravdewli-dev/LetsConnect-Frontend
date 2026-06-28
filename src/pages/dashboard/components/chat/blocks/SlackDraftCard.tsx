import { Hash, User } from "lucide-react";

import { SlackIcon } from "../../integrationGraph/brandIcons";
import InlineMarkdown from "../InlineMarkdown";
import type { MessageBlock } from "../types";

interface SlackDraftCardProps {
  block: Extract<MessageBlock, { type: "slack_draft" }>;
}

export default function SlackDraftCard({ block }: SlackDraftCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-violet-100 bg-white/80 px-3 py-2">
        <SlackIcon className="size-4" />
        <span className="text-xs font-semibold uppercase tracking-wide text-violet-700">
          Slack message
        </span>
        {block.recipient && (
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <User className="size-3" />
            {block.recipient}
          </span>
        )}
        {block.channel && (
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Hash className="size-3" />
            {block.channel}
          </span>
        )}
      </div>
      <div className="px-3 py-3">
        <div className="rounded-lg border border-violet-100/80 bg-white/90 px-3 py-2.5">
          <InlineMarkdown text={block.text} className="text-sm leading-relaxed text-foreground/90" />
        </div>
      </div>
    </div>
  );
}
