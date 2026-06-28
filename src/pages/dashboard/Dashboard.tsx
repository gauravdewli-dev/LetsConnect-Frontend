import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  getCachedConnectionStatus,
} from "@/lib/connectionCache";
import { useAuth } from "@/pages/auth-management/hooks/useAuth";
import { useAppDispatch } from "@/store/hooks";

import DashboardConnections from "./components/DashboardConnections";
import DashboardDeveloperGuide from "./components/DashboardDeveloperGuide";
import DashboardLayout, { type DashboardTab } from "./components/DashboardLayout";
import TextChat from "./components/TextChat";
import { useConnections } from "./hooks/useConnections";
import { useConnectionTimeout } from "./hooks/useConnectionTimeout";
import { triggerFetchStatus } from "./sagaActions";
import { hydrateConnectionStatus } from "./slice";

function tabFromParam(value: string | null): DashboardTab | null {
  if (value === "dashboard" || value === "chat" || value === "developer") return value;
  return null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { token, fetchMe, signOut } = useAuth();
  const { startPoll, stopPoll } = useConnections();
  useConnectionTimeout();
  const [activeTab, setActiveTab] = useState<DashboardTab>(
    () => tabFromParam(searchParams.get("tab")) ?? "dashboard",
  );

  useEffect(() => {
    const tab = tabFromParam(searchParams.get("tab"));
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [fetchMe, token]);

  useEffect(() => {
    const cached = getCachedConnectionStatus();
    if (cached) {
      dispatch(hydrateConnectionStatus(cached));
    }
    dispatch(triggerFetchStatus());
    startPoll();
    return () => {
      stopPoll();
    };
  }, [dispatch, startPoll, stopPoll]);

  function handleLogout() {
    signOut();
    navigate("/login");
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
      {activeTab === "dashboard" && <DashboardConnections />}
      {activeTab === "chat" && <TextChat />}
      {activeTab === "developer" && <DashboardDeveloperGuide />}
    </DashboardLayout>
  );
}
