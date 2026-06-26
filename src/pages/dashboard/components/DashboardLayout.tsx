import type { ComponentType, ReactNode } from "react";
import { LayoutDashboard, LogOut, MessageSquare } from "lucide-react";

import Logo from "@/atoms/Logo";
import { Button } from "@/atoms/ui/button";
import { cn } from "@/lib/utils";

export type DashboardTab = "dashboard" | "chat";

interface DashboardLayoutProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onLogout: () => void;
  children: ReactNode;
}

const NAV_ITEMS: { id: DashboardTab; label: string; icon: ComponentType<{ className?: string }> }[] =
  [
    { id: "dashboard", label: "Connected accounts", icon: LayoutDashboard },
    { id: "chat", label: "Text chat", icon: MessageSquare },
  ];

export default function DashboardLayout({
  activeTab,
  onTabChange,
  onLogout,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b px-4 py-3 md:hidden">
        <Logo imageClassName="size-8" nameClassName="text-base" />
        <Button variant="ghost" size="sm" onClick={onLogout}>
          Log out
        </Button>
      </header>

      {/* Mobile tabs */}
      <nav className="flex border-b md:hidden">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors",
              activeTab === id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-muted-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </nav>

      {/* Sidebar — desktop */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-slate-50/80 md:flex">
        <div className="flex items-center border-b px-5 py-5">
          <Logo imageClassName="size-10" nameClassName="text-base" />
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activeTab === id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t p-3">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={onLogout}>
            <LogOut className="size-4" />
            Log out
          </Button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
