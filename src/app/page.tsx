"use client";

import { useState } from "react";
import {
  BarChart3,
  Activity,
  Megaphone,
  Palette,
  AlertTriangle,
  BookOpen,
  Settings,
  Copy,
  Rocket,
} from "lucide-react";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { RealtimeTab } from "@/components/dashboard/realtime-tab";
import CampaignsTab from "@/components/dashboard/campaigns-tab";
import { CreativesTab } from "@/components/dashboard/creatives-tab";
import AlertsTab from "@/components/dashboard/alerts-tab";
import MethodTab from "@/components/dashboard/method-tab";
import SettingsTab from "@/components/dashboard/settings-tab";
import { LaunchTab } from "@/components/dashboard/launch-tab";
import { ReportButton } from "@/components/dashboard/ceo-report";
import { api } from "@/lib/api";

const tabs = [
  { id: "overview", label: "Visao Geral", icon: BarChart3 },
  { id: "launch", label: "Lancar", icon: Rocket },
  { id: "realtime", label: "Tempo Real", icon: Activity },
  { id: "campaigns", label: "Campanhas", icon: Megaphone },
  { id: "creatives", label: "Criativos", icon: Palette },
  { id: "alerts", label: "Alertas", icon: AlertTriangle },
  { id: "method", label: "Metodo", icon: BookOpen },
  { id: "settings", label: "Config", icon: Settings },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const handleExportJSON = async () => {
    try {
      const [campaigns, metrics, creatives, alerts] = await Promise.all([
        api.getCampaigns(),
        api.getMetrics(),
        api.getCreatives(),
        api.getAlerts(),
      ]);
      const data = { campaigns, metrics, creatives, alerts, exportedAt: new Date().toISOString() };
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      alert("Dados copiados para a área de transferência!");
    } catch {
      alert("Erro ao exportar dados.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#1e1e1e] bg-[#0f0f0f]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#e89b6a] flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-[#0a0a0a]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">
                  Bravy School
                </h1>
                <p className="text-xs text-[#999]">
                  Dashboard de Tráfego Pago — 56 Skills de Claude Code
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ReportButton />
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-2 rounded-lg border border-[#1e1e1e] bg-[#111] px-3 py-2 text-sm text-[#999] transition-colors hover:border-[#e89b6a] hover:text-[#e89b6a]"
              >
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar JSON</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-[#1e1e1e] bg-[#0f0f0f] overflow-x-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                    isActive
                      ? "border-[#e89b6a] text-[#e89b6a]"
                      : "border-transparent text-[#999] hover:text-white hover:border-[#333]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Tab Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "launch" && <LaunchTab />}
        {activeTab === "realtime" && <RealtimeTab />}
        {activeTab === "campaigns" && <CampaignsTab />}
        {activeTab === "creatives" && <CreativesTab />}
        {activeTab === "alerts" && <AlertsTab />}
        {activeTab === "method" && <MethodTab />}
        {activeTab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}
