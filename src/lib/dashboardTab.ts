export type DashboardTab = "dashboard" | "chat" | "developer";

export const DASHBOARD_TABS: DashboardTab[] = ["dashboard", "chat", "developer"];
export const DEFAULT_DASHBOARD_TAB: DashboardTab = "dashboard";

const STORAGE_KEY = "lc-dashboard-tab";

export function parseDashboardTab(value: string | null | undefined): DashboardTab | null {
  if (value === "dashboard" || value === "chat" || value === "developer") return value;
  return null;
}

export function getStoredDashboardTab(): DashboardTab | null {
  try {
    return parseDashboardTab(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function setStoredDashboardTab(tab: DashboardTab): void {
  localStorage.setItem(STORAGE_KEY, tab);
}

/** URL tab wins, then localStorage, then default. */
export function resolveDashboardTab(urlTab: string | null | undefined): DashboardTab {
  return parseDashboardTab(urlTab) ?? getStoredDashboardTab() ?? DEFAULT_DASHBOARD_TAB;
}

export function readDashboardTabFromSearch(search: string): DashboardTab {
  return resolveDashboardTab(new URLSearchParams(search).get("tab"));
}
