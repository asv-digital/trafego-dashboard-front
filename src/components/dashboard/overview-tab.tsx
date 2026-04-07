"use client";

import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  TrendingUp,
  Target,
  ShoppingCart,
  BarChart3,
  MousePointerClick,
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function roasColor(value: number) {
  if (value >= 2) return "#50c878";
  if (value >= 1.4) return "#e89b6a";
  return "#e85040";
}

function cpaColor(value: number) {
  if (value < 50) return "#50c878";
  if (value <= 70) return "#e89b6a";
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
// Custom Tooltip
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
  const {
    data: overview,
    isLoading: loadingOverview,
  } = useQuery({
    queryKey: ["overview"],
    queryFn: api.getOverview,
  });

  const {
    data: metrics,
    isLoading: loadingMetrics,
  } = useQuery({
    queryKey: ["metrics"],
    queryFn: () => api.getMetrics(),
  });

  const {
    data: campaigns,
    isLoading: loadingCampaigns,
  } = useQuery({
    queryKey: ["campaigns"],
    queryFn: api.getCampaigns,
  });

  if (loadingOverview || loadingMetrics || loadingCampaigns) {
    return (
      <p className="py-12 text-center text-[#999]">Carregando...</p>
    );
  }

  if (!overview || !metrics || !campaigns) return null;

  const tsData = buildTimeSeriesData(metrics);
  const salesData = buildSalesByCampaign(campaigns);

  return (
    <div className="space-y-6">
      {/* ---- KPI Cards ---- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="Investimento Total"
          value={formatBRL(overview.totalInvestment)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KpiCard
          title="Receita Total"
          value={formatBRL(overview.totalRevenue)}
          icon={<TrendingUp className="h-5 w-5" />}
          color="#50c878"
        />
        <KpiCard
          title="ROAS Geral"
          value={formatRoas(overview.roas)}
          icon={<Target className="h-5 w-5" />}
          color={roasColor(overview.roas)}
        />
        <KpiCard
          title="CPA Médio"
          value={formatBRL(overview.cpa)}
          icon={<ShoppingCart className="h-5 w-5" />}
          color={cpaColor(overview.cpa)}
        />
        <KpiCard
          title="Total de Vendas"
          value={formatNumber(overview.totalSales)}
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <KpiCard
          title="Taxa de Conversão LP"
          value={formatPercent(overview.conversionRate)}
          icon={<MousePointerClick className="h-5 w-5" />}
        />
      </div>

      {/* ---- CPA Evolution ---- */}
      <Card className="border-[#1e1e1e] bg-[#111111]">
        <CardHeader>
          <CardTitle className="text-white">Evolução do CPA</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* ---- ROAS Evolution ---- */}
      <Card className="border-[#1e1e1e] bg-[#111111]">
        <CardHeader>
          <CardTitle className="text-white">Evolução do ROAS</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* ---- Sales by Campaign ---- */}
      <Card className="border-[#1e1e1e] bg-[#111111]">
        <CardHeader>
          <CardTitle className="text-white">Vendas por Campanha</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
