import { LOGO_SRC } from "@/atoms/Logo";

interface ChatPreviewMockProps {
  userMessage: string;
  assistantMessage: string;
}

export default function ChatPreviewMock({ userMessage, assistantMessage }: ChatPreviewMockProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-slate-50/80 shadow-inner">
      <div className="border-b bg-white px-3 py-2 text-xs font-medium text-muted-foreground">
        Text chat
      </div>
      <div className="space-y-3 p-3">
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl bg-indigo-600 px-3 py-2 text-xs leading-relaxed text-white">
            {userMessage}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <img src={LOGO_SRC} alt="" className="size-6 shrink-0 rounded-full object-cover" />
          <div className="max-w-[85%] rounded-2xl border bg-white px-3 py-2 text-xs leading-relaxed whitespace-pre-line text-foreground shadow-sm">
            {assistantMessage}
          </div>
        </div>
      </div>
      <div className="border-t bg-white px-3 py-2">
        <div className="h-8 rounded-lg border bg-slate-50" />
      </div>
    </div>
  );
}
