"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DollarSign,
  TrendingUp,
  Target,
  ShoppingCart,
  MousePointerClick,
  Eye,
  Bot,
  RefreshCw,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import { api, type Campaign, type MetricEntry } from "@/lib/api";
import {
  formatBRL,
  formatNumber,
  formatPercent,
  formatDate,
  formatRoas,
} from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function roasColor(value: number) {
  if (value >= 2) return "#50c878";
  if (value >= 1.4) return "#f5c542";
  return "#e85040";
}

function cpaColor(value: number) {
  if (value < 50) return "#50c878";
  if (value <= 70) return "#f5c542";
  return "#e85040";
}

interface DateAgg {
  date: string;
  investment: number;
  sales: number;
}

function buildTimeSeriesData(metrics: MetricEntry[]) {
  const map = new Map<string, DateAgg>();

  for (const m of metrics) {
    const key = m.date.slice(0, 10);
    const existing = map.get(key);
    if (existing) {
      existing.investment += m.investment;
      existing.sales += m.sales;
    } else {
      map.set(key, { date: key, investment: m.investment, sales: m.sales });
    }
  }

  const sorted = Array.from(map.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return sorted.map((d) => ({
    date: formatDate(d.date),
    cpa: d.sales > 0 ? d.investment / d.sales : 0,
    roas: d.investment > 0 ? (d.sales * 97) / d.investment : 0,
  }));
}

function buildSalesByCampaign(campaigns: Campaign[]) {
  return campaigns
    .map((c) => ({
      name: c.name.length > 20 ? `${c.name.slice(0, 18)}...` : c.name,
      sales: c.totalSales ?? 0,
    }))
    .sort((a, b) => b.sales - a.sales);
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
}

function KpiCard({ title, value, icon, color }: KpiCardProps) {
  return (
    <Card className="border-[#1e1e1e] bg-[#111111]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-[#999]">
          {title}
        </CardTitle>
        <span className="text-[#e89b6a]">{icon}</span>
      </CardHeader>
      <CardContent>
        <p
          className="text-2xl font-bold"
          style={{ color: color ?? "#ffffff" }}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Custom Tooltips
// ---------------------------------------------------------------------------

function CpaTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-[#1e1e1e] bg-[#111111] px-3 py-2 text-sm text-white shadow-lg">
      <p className="mb-1 text-[#999]">{label}</p>
      <p>CPA: {formatBRL(payload[0].value)}</p>
    </div>
  );
}

function RoasTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-[#1e1e1e] bg-[#111111] px-3 py-2 text-sm text-white shadow-lg">
      <p className="mb-1 text-[#999]">{label}</p>
      <p>ROAS: {formatRoas(payload[0].value)}</p>
    </div>
  );
}

function SalesTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-[#1e1e1e] bg-[#111111] px-3 py-2 text-sm text-white shadow-lg">
      <p className="mb-1 text-[#999]">{label}</p>
      <p>Vendas: {formatNumber(payload[0].value)}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function OverviewTab() {
  const queryClient = useQueryClient();

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ["overview"],
    queryFn: api.getOverview,
    refetchInterval: 60000,
  });

  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ["metrics"],
    queryFn: () => api.getMetrics(),
    refetchInterval: 60000,
  });

  const { data: campaigns, isLoading: loadingCampaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: api.getCampaigns,
    refetchInterval: 60000,
  });

  const { data: realtimeInsights } = useQuery({
    queryKey: ["realtimeInsights"],
    queryFn: api.getMetaRealtimeInsights,
    refetchInterval: 60000,
  });

  const { data: agentStatus } = useQuery({
    queryKey: ["agentStatus"],
    queryFn: api.getAgentStatus,
    refetchInterval: 60000,
  });

  const triggerMutation = useMutation({
    mutationFn: api.triggerAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentStatus"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      queryClient.invalidateQueries({ queryKey: ["realtimeInsights"] });
    },
  });

  if (loadingOverview || loadingMetrics || loadingCampaigns) {
    return (
      <p className="py-12 text-center text-[#999]">Carregando...</p>
    );
  }

  if (!overview || !metrics || !campaigns) return null;

  // Aggregate today's realtime data
  const todaySpend = realtimeInsights?.reduce((sum: number, r: any) => sum + (Number(r.spend) || 0), 0) ?? 0;
  const todaySales = realtimeInsights?.reduce((sum: number, r: any) => sum + (Number(r.actions?.find((a: any) => a.action_type === "purchase")?.value) || Number(r.purchases) || Number(r.sales) || 0), 0) ?? 0;
  const todayClicks = realtimeInsights?.reduce((sum: number, r: any) => sum + (Number(r.clicks) || 0), 0) ?? 0;
  const todayImpressions = realtimeInsights?.reduce((sum: number, r: any) => sum + (Number(r.impressions) || 0), 0) ?? 0;
  const todayCPA = todaySales > 0 ? todaySpend / todaySales : 0;
  const todayROAS = todaySpend > 0 ? (todaySales * 97) / todaySpend : 0;

  // Use realtime data if available, otherwise fallback to overview
  const hasRealtime = realtimeInsights && realtimeInsights.length > 0;
  const displaySpend = hasRealtime ? todaySpend : overview.totalInvestment;
  const displaySales = hasRealtime ? todaySales : overview.totalSales;
  const displayROAS = hasRealtime ? todayROAS : overview.roas;
  const displayCPA = hasRealtime ? todayCPA : overview.cpa;
  const displayClicks = hasRealtime ? todayClicks : overview.totalClicks;
  const displayImpressions = hasRealtime ? todayImpressions : overview.totalImpressions;

  const tsData = buildTimeSeriesData(metrics);
  const salesData = buildSalesByCampaign(campaigns);

  return (
    <div className="space-y-6">
      {/* ---- KPI Cards ---- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title={hasRealtime ? "Investimento Hoje" : "Investimento Total"}
          value={formatBRL(displaySpend)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KpiCard
          title={hasRealtime ? "Vendas Hoje" : "Total de Vendas"}
          value={formatNumber(displaySales)}
          icon={<ShoppingCart className="h-5 w-5" />}
          color={displaySales > 0 ? "#50c878" : "#ffffff"}
        />
        <KpiCard
          title="ROAS Atual"
          value={formatRoas(displayROAS)}
          icon={<Target className="h-5 w-5" />}
          color={roasColor(displayROAS)}
        />
        <KpiCard
          title="CPA Atual"
          value={displayCPA > 0 ? formatBRL(displayCPA) : "\u2014"}
          icon={<TrendingUp className="h-5 w-5" />}
          color={displayCPA > 0 ? cpaColor(displayCPA) : "#ffffff"}
        />
        <KpiCard
          title={hasRealtime ? "Cliques Hoje" : "Total de Cliques"}
          value={formatNumber(displayClicks)}
          icon={<MousePointerClick className="h-5 w-5" />}
        />
        <KpiCard
          title={hasRealtime ? "Impressoes Hoje" : "Total de Impressoes"}
          value={formatNumber(displayImpressions)}
          icon={<Eye className="h-5 w-5" />}
        />
      </div>

      {/* ---- CPA Evolution ---- */}
      <Card className="border-[#1e1e1e] bg-[#111111]">
        <CardHeader>
          <CardTitle className="text-white">Evolucao do CPA</CardTitle>
        </CardHeader>
        <CardContent>
          {tsData.length === 0 ? (
            <p className="py-8 text-center text-[#999]">Sem dados historicos ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={tsData}>
                <CartesianGrid stroke="#1e1e1e" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#999", fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#999", fontSize: 12 }}
                  tickLine={false}
                  tickFormatter={(v: number) => `R$${v}`}
                />
                <Tooltip content={<CpaTooltip />} />
                <ReferenceLine
                  y={50}
                  stroke="#50c878"
                  strokeDasharray="4 4"
                  label={{ value: "Meta", fill: "#50c878", fontSize: 12 }}
                />
                <ReferenceLine
                  y={70}
                  stroke="#e85040"
                  strokeDasharray="4 4"
                  label={{ value: "Alerta", fill: "#e85040", fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="cpa"
                  stroke="#e89b6a"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#e89b6a" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ---- ROAS Evolution ---- */}
      <Card className="border-[#1e1e1e] bg-[#111111]">
        <CardHeader>
          <CardTitle className="text-white">Evolucao do ROAS</CardTitle>
        </CardHeader>
        <CardContent>
          {tsData.length === 0 ? (
            <p className="py-8 text-center text-[#999]">Sem dados historicos ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={tsData}>
                <CartesianGrid stroke="#1e1e1e" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#999", fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#999", fontSize: 12 }}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}x`}
                />
                <Tooltip content={<RoasTooltip />} />
                <ReferenceLine
                  y={2}
                  stroke="#50c878"
                  strokeDasharray="4 4"
                  label={{ value: "Meta", fill: "#50c878", fontSize: 12 }}
                />
                <ReferenceLine
                  y={1.4}
                  stroke="#e85040"
                  strokeDasharray="4 4"
                  label={{ value: "Alerta", fill: "#e85040", fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="roas"
                  stroke="#5b9bd5"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#5b9bd5" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ---- Sales by Campaign ---- */}
      <Card className="border-[#1e1e1e] bg-[#111111]">
        <CardHeader>
          <CardTitle className="text-white">Vendas por Campanha</CardTitle>
        </CardHeader>
        <CardContent>
          {salesData.length === 0 ? (
            <p className="py-8 text-center text-[#999]">Sem dados de campanhas ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={salesData}>
                <CartesianGrid stroke="#1e1e1e" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#999", fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#999", fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip content={<SalesTooltip />} />
                <Bar dataKey="sales" fill="#e89b6a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ---- Agent Status ---- */}
      <Card className="border-[#1e1e1e] bg-[#111111]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Bot className="h-5 w-5 text-[#e89b6a]" />
            Status do Agente
          </CardTitle>
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: agentStatus?.running ? "#50c878" : "#71717a",
              }}
            />
            <span className="text-sm text-[#999]">
              {agentStatus?.running ? "Ativo" : "Inativo"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-[#999]">
              <Clock className="h-4 w-4" />
              <span>Ultimo sync: {agentStatus?.lastSync ? formatDate(agentStatus.lastSync) : "Nunca"}</span>
            </div>
            {agentStatus?.nextSync && (
              <div className="flex items-center gap-2 text-sm text-[#999]">
                <Clock className="h-4 w-4" />
                <span>Proximo sync: {formatDate(agentStatus.nextSync)}</span>
              </div>
            )}
            <Button
              onClick={() => triggerMutation.mutate()}
              disabled={triggerMutation.isPending}
              className="bg-[#e89b6a] text-[#0a0a0a] font-semibold hover:bg-[#d4864f]"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${triggerMutation.isPending ? "animate-spin" : ""}`} />
              {triggerMutation.isPending ? "Sincronizando..." : "Sincronizar Agora"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
