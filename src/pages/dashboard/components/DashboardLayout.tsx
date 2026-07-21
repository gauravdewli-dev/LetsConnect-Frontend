import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { Code2, LayoutDashboard, LogOut, Menu, MessageSquare, X } from "lucide-react";

import Logo from "@/atoms/Logo";
import { Button } from "@/atoms/ui/button";
import { cn } from "@/lib/utils";

import type { DashboardTab } from "@/lib/dashboardTab";

import { useConnections } from "../hooks/useConnections";

export type { DashboardTab };

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
    { id: "developer", label: "Developer guide", icon: Code2 },
  ];

export default function DashboardLayout({
  activeTab,
  onTabChange,
  onLogout,
  children,
}: DashboardLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeItem = NAV_ITEMS.find((item) => item.id === activeTab) ?? NAV_ITEMS[0];
  const ActiveIcon = activeItem.icon;
  const { status } = useConnections();
  const gmailConnected = status?.gmail_connected ?? false;
  const slackConnected = status?.slack_connected ?? false;
  const slackSendAsUser = status?.slack_send_as_user ?? false;
  const jiraConnected = status?.jira_connected ?? false;
  const githubConnected = status?.github_connected ?? false;
  const slackSynced = slackConnected && slackSendAsUser;
  const canChat = gmailConnected || slackSynced || jiraConnected || githubConnected;
  const slackReconnectNeeded = slackConnected && !slackSendAsUser;
  const showChatOnline = activeTab === "chat" && canChat && !slackReconnectNeeded;

  useEffect(() => {
    setMenuOpen(false);
  }, [activeTab]);

  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    function onPointerDown(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [menuOpen]);

  return (
    <div className="flex h-dvh flex-col bg-background lg:flex-row">
      {/* Mobile top bar + menu */}
      <header className="relative z-40 shrink-0 border-b bg-white lg:hidden" ref={menuRef}>
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Logo nameClassName="text-base" />
          {showChatOnline && (
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
              Online
            </span>
          )}
        </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-2.5 py-2 text-sm font-medium transition",
                menuOpen
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-foreground hover:bg-slate-50",
              )}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="size-4 shrink-0" /> : <Menu className="size-4 shrink-0" />}
              <ActiveIcon className="size-4 shrink-0 text-indigo-600" />
              <span className="max-w-[9.5rem] truncate sm:max-w-none">{activeItem.label}</span>
            </button>

            <Button variant="ghost" size="sm" className="shrink-0 px-2" onClick={onLogout}>
              <LogOut className="size-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id="mobile-nav-menu"
            className="absolute inset-x-0 top-full z-50 border-b border-slate-200 bg-white px-2 py-2 shadow-lg shadow-slate-900/10"
            aria-label="Dashboard sections"
          >
            <ul className="space-y-0.5">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                const selected = activeTab === id;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => {
                        onTabChange(id);
                        setMenuOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                        selected
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-foreground hover:bg-slate-50",
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", selected ? "text-white" : "text-indigo-600")} />
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </header>

      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/25 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar — desktop */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-slate-50/80 lg:flex">
        <div className="flex h-[4.375rem] shrink-0 items-center border-b bg-white px-5">
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

        <div className="flex h-24 shrink-0 items-center border-t bg-white p-3">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={onLogout}>
            <LogOut className="size-4" />
            Log out
          </Button>
        </div>
      </aside>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
