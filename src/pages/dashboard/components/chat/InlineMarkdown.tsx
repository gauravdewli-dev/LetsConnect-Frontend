import { cn } from "@/lib/utils";

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let rest = text;
  let index = 0;

  while (rest.length > 0) {
    const linkMatch = rest.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
    if (linkMatch) {
      nodes.push(
        <a
          key={`${keyPrefix}-link-${index}`}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-700"
        >
          {linkMatch[1]}
        </a>,
      );
      rest = rest.slice(linkMatch[0].length);
      index++;
      continue;
    }

    const boldMatch = rest.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${index}`} className="font-semibold text-foreground">
          {boldMatch[1]}
        </strong>,
      );
      rest = rest.slice(boldMatch[0].length);
      index++;
      continue;
    }

    const urlMatch = rest.match(/^(https?:\/\/[^\s<]+[^\s<.,;:!?)])/);
    if (urlMatch) {
      nodes.push(
        <a
          key={`${keyPrefix}-url-${index}`}
          href={urlMatch[1]}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-700"
        >
          {urlMatch[1]}
        </a>,
      );
      rest = rest.slice(urlMatch[1].length);
      index++;
      continue;
    }

    const nextSpecial = rest.search(/(\*\*|\[|https?:\/\/)/);
    if (nextSpecial === -1) {
      nodes.push(<span key={`${keyPrefix}-t-${index}`}>{rest}</span>);
      break;
    }
    if (nextSpecial > 0) {
      nodes.push(<span key={`${keyPrefix}-t-${index}`}>{rest.slice(0, nextSpecial)}</span>);
      rest = rest.slice(nextSpecial);
      index++;
      continue;
    }

    nodes.push(<span key={`${keyPrefix}-c-${index}`}>{rest[0]}</span>);
    rest = rest.slice(1);
    index++;
  }

  return nodes;
}

interface InlineMarkdownProps {
  text: string;
  className?: string;
}

export default function InlineMarkdown({ text, className }: InlineMarkdownProps) {
  const lines = text.split("\n");

  return (
    <span className={cn("whitespace-pre-wrap break-words", className)}>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex}>
          {lineIndex > 0 && <br />}
          {renderInline(line, `l${lineIndex}`)}
        </span>
      ))}
    </span>
  );
}
