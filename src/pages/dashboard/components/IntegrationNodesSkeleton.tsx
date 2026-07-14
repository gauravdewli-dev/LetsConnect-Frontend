import { Skeleton } from "@/atoms/ui/skeleton";

function GraphNodeSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex w-40 flex-col items-center rounded-2xl border bg-white/80 p-3 shadow-sm">
        <Skeleton className="mb-2 size-11 rounded-xl" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="mt-2 h-3 w-24" />
      </div>
    </div>
  );
}

export default function IntegrationNodesSkeleton() {
  return (
    <div className="space-y-3">
      <div className="relative h-[520px] overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-50/80 to-white shadow-sm">
        <GraphNodeSkeleton className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        <GraphNodeSkeleton className="absolute left-[10%] top-[16%]" />
        <GraphNodeSkeleton className="absolute right-[10%] top-[16%]" />
        <GraphNodeSkeleton className="absolute left-1/2 top-[6%] -translate-x-1/2" />
        <GraphNodeSkeleton className="absolute bottom-[14%] left-1/2 -translate-x-1/2" />
      </div>
    </div>
  );
}
