import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/pages/auth-management/hooks/useAuth";

import DashboardConnections from "./components/DashboardConnections";
import DashboardLayout, { type DashboardTab } from "./components/DashboardLayout";
import TextChat from "./components/TextChat";
import { useConnections } from "./hooks/useConnections";

export default function Dashboard() {
  const navigate = useNavigate();
  const { token, fetchMe, signOut } = useAuth();
  const { startPoll, stopPoll } = useConnections();
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [fetchMe, token]);

  useEffect(() => {
    startPoll();
    return () => {
      stopPoll();
    };
  }, [startPoll, stopPoll]);

  function handleLogout() {
    signOut();
    navigate("/login");
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
      {activeTab === "dashboard" ? (
        <DashboardConnections />
      ) : (
        <TextChat />
      )}
    </DashboardLayout>
  );
}
