import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  type DashboardTab,
  parseDashboardTab,
  resolveDashboardTab,
  setStoredDashboardTab,
} from "@/lib/dashboardTab";

export function useDashboardTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTabState] = useState<DashboardTab>(() =>
    resolveDashboardTab(searchParams.get("tab")),
  );

  useEffect(() => {
    const urlTab = parseDashboardTab(searchParams.get("tab"));
    if (!urlTab) {
      const resolved = resolveDashboardTab(null);
      setSearchParams({ tab: resolved }, { replace: true });
      setStoredDashboardTab(resolved);
      setActiveTabState(resolved);
      return;
    }
    setStoredDashboardTab(urlTab);
    setActiveTabState(urlTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync once on mount
  }, []);

  useEffect(() => {
    const urlTab = parseDashboardTab(searchParams.get("tab"));
    if (urlTab && urlTab !== activeTab) {
      setActiveTabState(urlTab);
      setStoredDashboardTab(urlTab);
    }
  }, [searchParams, activeTab]);

  const setActiveTab = useCallback(
    (tab: DashboardTab) => {
      setActiveTabState(tab);
      setStoredDashboardTab(tab);
      setSearchParams({ tab }, { replace: true });
    },
    [setSearchParams],
  );

  return { activeTab, setActiveTab };
}
