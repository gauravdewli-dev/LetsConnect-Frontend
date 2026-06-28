import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/utils";

import InlineMarkdown from "../InlineMarkdown";
import type { MessageBlock } from "../types";

interface CalloutBlockProps {
  block: Extract<MessageBlock, { type: "callout" }>;
}

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    wrap: "border-emerald-200/80 bg-emerald-50/80 text-emerald-900",
    iconClass: "text-emerald-600",
  },
  info: {
    icon: Info,
    wrap: "border-blue-200/80 bg-blue-50/80 text-blue-900",
    iconClass: "text-blue-600",
  },
  warning: {
    icon: AlertTriangle,
    wrap: "border-amber-200/80 bg-amber-50/80 text-amber-900",
    iconClass: "text-amber-600",
  },
} as const;

export default function CalloutBlock({ block }: CalloutBlockProps) {
  const variant = VARIANTS[block.variant];
  const Icon = variant.icon;

  return (
    <div className={cn("flex gap-2.5 rounded-xl border px-3 py-2.5", variant.wrap)}>
      <Icon className={cn("mt-0.5 size-4 shrink-0", variant.iconClass)} />
      <div className="min-w-0 text-sm">
        <p className="font-semibold">{block.title}</p>
        <InlineMarkdown text={block.text} className="mt-0.5 leading-relaxed opacity-90" />
      </div>
    </div>
  );
}
