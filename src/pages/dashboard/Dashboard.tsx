import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { getCachedConnectionStatus } from "@/lib/connectionCache";
import ColdStartTour from "@/molecules/ColdStartTour";
import { useAuth } from "@/pages/auth-management/hooks/useAuth";
import { useAppDispatch } from "@/store/hooks";

import DashboardConnections from "./components/DashboardConnections";
import DashboardDeveloperGuide from "./components/DashboardDeveloperGuide";
import DashboardLayout from "./components/DashboardLayout";
import TextChat from "./components/TextChat";
import { useConnectionTimeout } from "./hooks/useConnectionTimeout";
import { useConnections } from "./hooks/useConnections";
import { useDashboardTab } from "./hooks/useDashboardTab";
import { triggerInitializeConnections } from "./sagaActions";
import { hydrateConnectionStatus } from "./slice";

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { signOut } = useAuth();
  const { activeTab, setActiveTab } = useDashboardTab();
  const { loading: connectionsLoading, refreshing } = useConnections();
  useConnectionTimeout();
  const initializedRef = useRef(false);

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
      <ColdStartTour active={connectionsLoading || refreshing} />
      {activeTab === "dashboard" && <DashboardConnections />}
      {activeTab === "chat" && <TextChat />}
      {activeTab === "developer" && <DashboardDeveloperGuide />}
    </DashboardLayout>
  );
}
