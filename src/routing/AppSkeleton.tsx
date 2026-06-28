import { Skeleton } from "@/atoms/ui/skeleton";

function SidebarSkeleton() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-slate-50/80 md:flex">
      <div className="flex items-center gap-3 border-b px-5 py-5">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <nav className="flex-1 space-y-2 p-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </nav>
      <div className="border-t p-3">
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    </aside>
  );
}

function MobileHeaderSkeleton() {
  return (
    <>
      <header className="flex items-center justify-between border-b px-4 py-3 md:hidden">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-16 rounded-md" />
      </header>
      <nav className="flex border-b md:hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-1 justify-center py-3">
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </nav>
    </>
  );
}

function DashboardContentSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 py-5 md:px-8 md:py-6">
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
      <div className="shrink-0 border-b bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12">
        <Skeleton className="size-16 rounded-2xl" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
        <div className="mt-4 grid w-full max-w-lg grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="shrink-0 border-t bg-white px-4 py-4 md:px-8">
        <Skeleton className="mx-auto h-11 max-w-3xl rounded-2xl" />
      </div>
    </div>
  );
}

interface AppSkeletonProps {
  variant?: "dashboard" | "chat" | "generic";
}

export default function AppSkeleton({ variant = "dashboard" }: AppSkeletonProps) {
  return (
    <div className="flex h-screen flex-col bg-background md:flex-row">
      <MobileHeaderSkeleton />
      <SidebarSkeleton />
      <main className="flex flex-1 flex-col overflow-hidden">
        {variant === "chat" ? (
          <ChatContentSkeleton />
        ) : variant === "generic" ? (
          <div className="flex flex-1 flex-col gap-4 p-6 md:p-8">
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
