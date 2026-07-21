import { Skeleton } from "@/atoms/ui/skeleton";

function SidebarSkeleton() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-slate-50/80 lg:flex">
      <div className="flex h-[4.375rem] shrink-0 items-center gap-2.5 border-b bg-white px-5">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </nav>
      <div className="flex h-24 shrink-0 items-center border-t bg-white p-3">
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    </aside>
  );
}

function MobileHeaderSkeleton() {
  return (
    <header className="flex shrink-0 items-center justify-between gap-2 border-b bg-white px-3 py-2.5 sm:px-4 lg:hidden">
      <Skeleton className="h-4 w-24" />
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="size-9 rounded-md" />
      </div>
    </header>
  );
}

function DashboardContentSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 py-5 lg:px-8 lg:py-6">
      <div className="shrink-0 space-y-2">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="mt-4 flex min-h-0 flex-1 flex-col">
        <Skeleton className="min-h-0 flex-1 rounded-2xl" />
        <Skeleton className="mx-auto mt-3 h-3 w-64" />
      </div>
    </div>
  );
}

function ChatContentSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slate-50/50">
      <div className="hidden shrink-0 border-b bg-white lg:flex lg:h-[4.375rem] lg:flex-col lg:justify-center lg:px-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-3 py-8 lg:px-8 lg:py-12">
        <Skeleton className="size-16 rounded-2xl" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
        <div className="mt-4 grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="shrink-0 border-t bg-white px-3 py-2 lg:flex lg:h-24 lg:flex-col lg:justify-center lg:px-8 lg:py-0">
        <Skeleton className="mx-auto h-10 w-full max-w-3xl rounded-2xl lg:h-11" />
      </div>
    </div>
  );
}

interface AppSkeletonProps {
  variant?: "dashboard" | "chat" | "generic";
}

export default function AppSkeleton({ variant = "dashboard" }: AppSkeletonProps) {
  return (
    <div className="flex h-dvh flex-col bg-background lg:flex-row">
      <MobileHeaderSkeleton />
      <SidebarSkeleton />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {variant === "chat" ? (
          <ChatContentSkeleton />
        ) : variant === "generic" ? (
          <div className="flex flex-1 flex-col gap-4 p-6 lg:p-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full max-w-lg" />
            <Skeleton className="flex-1 rounded-2xl" />
          </div>
        ) : (
          <DashboardContentSkeleton />
        )}
      </main>
    </div>
  );
}

export function PageSkeleton() {
  return <AppSkeleton variant="generic" />;
}
