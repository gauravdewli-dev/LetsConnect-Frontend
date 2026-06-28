import EmailDraftCard, { EmailRowCard } from "./blocks/EmailCard";
import CalloutBlock from "./blocks/CalloutBlock";
import JiraIssueCard from "./blocks/JiraIssueCard";
import SlackDraftCard from "./blocks/SlackDraftCard";
import InlineMarkdown from "./InlineMarkdown";
import type { MessageBlock } from "./types";

interface MessageBlockRendererProps {
  block: MessageBlock;
  index: number;
}

function ListBlock({ block }: { block: Extract<MessageBlock, { type: "list" }> }) {
  const Tag = block.ordered ? "ol" : "ul";

  return (
    <Tag
      className={
        block.ordered
          ? "list-decimal space-y-2 pl-5 text-sm"
          : "list-disc space-y-2 pl-5 text-sm"
      }
    >
      {block.items.map((itemBlocks, itemIndex) => (
        <li key={itemIndex} className="leading-relaxed">
          {itemBlocks.map((inner, innerIndex) => (
            <MessageBlockRenderer key={innerIndex} block={inner} index={innerIndex} />
          ))}
        </li>
      ))}
    </Tag>
  );
}

export default function MessageBlockRenderer({ block, index }: MessageBlockRendererProps) {
  switch (block.type) {
    case "paragraph":
      return (
        <p key={index} className="text-sm leading-relaxed text-foreground/90">
          <InlineMarkdown text={block.text} />
        </p>
      );
    case "heading":
      return (
        <p key={index} className="text-sm font-semibold text-foreground">
          {block.text}
        </p>
      );
    case "email_draft":
      return <EmailDraftCard key={index} block={block} />;
    case "email_row":
      return <EmailRowCard key={index} block={block} />;
    case "slack_draft":
      return <SlackDraftCard key={index} block={block} />;
    case "jira_issue":
      return <JiraIssueCard key={index} block={block} />;
    case "callout":
      return <CalloutBlock key={index} block={block} />;
    case "list":
      return <ListBlock key={index} block={block} />;
    default:
      return null;
  }
}
