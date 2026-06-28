import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getCachedConnectionStatus } from "@/lib/connectionCache";
import { useAuth } from "@/pages/auth-management/hooks/useAuth";
import { useAppDispatch } from "@/store/hooks";

import DashboardConnections from "./components/DashboardConnections";
import DashboardDeveloperGuide from "./components/DashboardDeveloperGuide";
import DashboardLayout, { type DashboardTab } from "./components/DashboardLayout";
import TextChat from "./components/TextChat";
import { useConnectionTimeout } from "./hooks/useConnectionTimeout";
import { triggerInitializeConnections } from "./sagaActions";
import { hydrateConnectionStatus } from "./slice";

function tabFromParam(value: string | null): DashboardTab | null {
  if (value === "dashboard" || value === "chat" || value === "developer") return value;
  return null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { signOut } = useAuth();
  useConnectionTimeout();
  const initializedRef = useRef(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>(
    () => tabFromParam(searchParams.get("tab")) ?? "dashboard",
  );

  useEffect(() => {
    const tab = tabFromParam(searchParams.get("tab"));
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const cached = getCachedConnectionStatus();
    if (cached) {
      dispatch(hydrateConnectionStatus(cached));
    }
    dispatch(triggerInitializeConnections());
  }, [dispatch]);

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
