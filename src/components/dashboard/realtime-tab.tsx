"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Radio, TrendingDown, TrendingUp, Minus } from "lucide-react";

import { api, type MetricEntry } from "@/lib/api";
import {
  formatBRL,
  formatNumber,
  formatPercent,
  formatDate,
  formatRoas,
} from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cpaColorClass(value: number): string {
  if (value < 50) return "#50c878";
  if (value <= 70) return "#f5c542";
  return "#e85040";
}

function safeDivide(numerator: number, denominator: number): number | null {
  if (!denominator || !isFinite(numerator / denominator)) return null;
  return numerator / denominator;
}

function pacingStatusColor(status: string): string {
  switch (status) {
    case "underpacing":
      return "#f5c542";
    case "on_track":
      return "#50c878";
    case "overpacing":
      return "#5b9bd5";
    default:
      return "#999";
  }
}

function pacingStatusLabel(status: string): string {
  switch (status) {
    case "underpacing":
      return "Abaixo do ritmo";
    case "on_track":
      return "No ritmo";
    case "overpacing":
      return "Acima do ritmo";
    default:
      return status || "—";
  }
}

function pacingStatusIcon(status: string) {
  switch (status) {
    case "underpacing":
      return <TrendingDown className="h-4 w-4" />;
    case "on_track":
      return <Minus className="h-4 w-4" />;
    case "overpacing":
      return <TrendingUp className="h-4 w-4" />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Budget Pacing Card
// ---------------------------------------------------------------------------

function BudgetPacingCard() {
  const { data: pacing, isLoading } = useQuery({
    queryKey: ["pacing"],
    queryFn: api.getPacing,
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <Card className="border-[#1e1e1e] bg-[#111111]">
        <CardContent className="py-8 text-center text-[#999]">
          Carregando pacing...
        </CardContent>
      </Card>
    );
  }

  if (!pacing) return null;

  const dayElapsedPct = Number(pacing.dayElapsedPercent ?? pacing.day_elapsed_percent ?? 0);
  const budgetSpentPct = Number(pacing.budgetSpentPercent ?? pacing.budget_spent_percent ?? 0);
  const status = pacing.status ?? "unknown";
  const message = pacing.message ?? "";
  const projectedSpend = Number(pacing.projectedSpend ?? pacing.projected_spend ?? 0);

  return (
    <Card className="border-[#1e1e1e] bg-[#111111]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-white">
          <Activity className="h-5 w-5 text-[#e89b6a]" />
          Budget Pacing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Double progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#999]">
            <span>Progresso do dia</span>
            <span>{formatPercent(dayElapsedPct)}</span>
          </div>
          <div className="relative h-3 w-full rounded-full bg-[#1e1e1e] overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[#444]"
              style={{ width: `${Math.min(dayElapsedPct, 100)}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[#e89b6a]"
              style={{ width: `${Math.min(budgetSpentPct, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[#999]">
            <span>Budget gasto</span>
            <span>{formatPercent(budgetSpentPct)}</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <span style={{ color: pacingStatusColor(status) }}>
            {pacingStatusIcon(status)}
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: pacingStatusColor(status) }}
          >
            {pacingStatusLabel(status)}
          </span>
        </div>

        {/* Message */}
        {message && <p className="text-sm text-[#999]">{message}</p>}

        {/* Projected spend */}
        {projectedSpend > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#666]">Gasto projetado</span>
            <span className="font-semibold text-white">{formatBRL(projectedSpend)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Funnel Visualization
// ---------------------------------------------------------------------------

interface FunnelStep {
  label: string;
  value: number;
}

function FunnelVisualization() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ["overview"],
    queryFn: api.getOverview,
    refetchInterval: 60000,
  });

  if (isLoading || !overview) {
    return null;
  }

  const steps: FunnelStep[] = [
    { label: "Impressoes", value: Number(overview.totalImpressions ?? 0) },
    { label: "Cliques", value: Number(overview.totalClicks ?? 0) },
    {
      label: "PageViews",
      value: Math.round(Number(overview.totalClicks ?? 0) * 0.85),
    },
    {
      label: "Checkouts",
      value: Math.round(Number(overview.totalSales ?? 0) * 2.5),
    },
    { label: "Vendas", value: Number(overview.totalSales ?? 0) },
  ];

  const maxValue = steps[0]?.value || 1;

  return (
    <Card className="border-[#1e1e1e] bg-[#111111]">
      <CardHeader className="pb-3">
        <CardTitle className="text-white">Funil de Conversao</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, idx) => {
            const width = Math.max((step.value / maxValue) * 100, 8);
            const nextStep = steps[idx + 1];
            const convRate =
              nextStep && step.value > 0
                ? (nextStep.value / step.value) * 100
                : null;
            const rateThreshold = idx === 0 ? 2 : idx < 3 ? 15 : 30;
            const rateColor =
              convRate !== null
                ? convRate >= rateThreshold
                  ? "#50c878"
                  : "#e85040"
                : undefined;

            return (
              <div key={step.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#ccc] font-medium">{step.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold">
                      {formatNumber(step.value)}
                    </span>
                    {convRate !== null && (
                      <span
                        className="text-xs font-medium"
                        style={{ color: rateColor }}
                      >
                        {formatPercent(convRate)} &rarr;
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-[#1e1e1e] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#e89b6a] transition-all"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function RealtimeTab() {
  // Live insights from Meta API
  const { data: realtimeInsights = [], isLoading: loadingRealtime } = useQuery({
    queryKey: ["realtimeInsights"],
    queryFn: api.getMetaRealtimeInsights,
    refetchInterval: 60000,
  });

  // Historical metrics from database
  const { data: metrics = [], isLoading: loadingMetrics } = useQuery<MetricEntry[]>({
    queryKey: ["metrics"],
    queryFn: () => api.getMetrics(),
    refetchInterval: 60000,
  });

  // Parse realtime insights into table rows
  const realtimeRows = realtimeInsights.map((row: any) => {
    const spend = Number(row.spend) || 0;
    const impressions = Number(row.impressions) || 0;
    const clicks = Number(row.clicks) || 0;
    const outboundClicks =
      Number(
        row.outbound_clicks?.find?.((a: any) => a.action_type === "outbound_click")?.value
      ) ||
      Number(row.outbound_clicks) ||
      clicks;
    const sales =
      Number(row.actions?.find((a: any) => a.action_type === "purchase")?.value) ||
      Number(row.purchases) ||
      Number(row.sales) ||
      0;
    const outboundCtr =
      impressions > 0 ? (outboundClicks / impressions) * 100 : null;
    const cpc = safeDivide(spend, clicks);
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : null;
    const cpa = safeDivide(spend, sales);
    const roas = safeDivide(sales * 97, spend);
    const videoViews3s =
      Number(
        row.video_avg_time_watched_actions?.find?.(
          (a: any) => a.action_type === "video_view"
        )?.value
      ) || Number(row.video_thruplay_watched_actions?.[0]?.value) || 0;
    const hookRate =
      impressions > 0 && videoViews3s > 0
        ? (videoViews3s / impressions) * 100
        : null;

    return {
      name: row.campaign_name || row.campaignName || row.name || "—",
      spend,
      impressions,
      clicks,
      outboundCtr,
      cpc,
      cpm,
      sales,
      cpa,
      roas,
      hookRate,
    };
  });

  // Historical: last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const historicalMetrics = metrics
    .filter((m) => new Date(m.date) >= thirtyDaysAgo)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-[#e85040] animate-pulse" />
          <h2 className="text-lg font-semibold text-white">Metricas em Tempo Real</h2>
        </div>
        <Badge className="bg-[#e89b6a]/10 text-[#e89b6a] border-[#e89b6a]/30">
          Auto-refresh 60s
        </Badge>
      </div>

      {/* ---- Budget Pacing + Funnel ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BudgetPacingCard />
        <FunnelVisualization />
      </div>

      {/* ---- Realtime Table ---- */}
      <Card className="border-[#1e1e1e] bg-[#111111]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="h-5 w-5 text-[#e89b6a]" />
            Campanhas — Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRealtime ? (
            <p className="py-8 text-center text-[#999]">Carregando dados em tempo real...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#1e1e1e] hover:bg-transparent">
                    <TableHead className="text-[#999]">Campanha</TableHead>
                    <TableHead className="text-right text-[#999]">Gasto</TableHead>
                    <TableHead className="text-right text-[#999]">Impressoes</TableHead>
                    <TableHead className="text-right text-[#999]">Cliques</TableHead>
                    <TableHead className="text-right text-[#999]">Outbound CTR</TableHead>
                    <TableHead className="text-right text-[#999]">CPC</TableHead>
                    <TableHead className="text-right text-[#999]">CPM</TableHead>
                    <TableHead className="text-right text-[#999]">Vendas</TableHead>
                    <TableHead className="text-right text-[#999]">CPA</TableHead>
                    <TableHead className="text-right text-[#999]">ROAS</TableHead>
                    <TableHead className="text-right text-[#999]">Hook Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {realtimeRows.length === 0 ? (
                    <TableRow className="border-[#1e1e1e]">
                      <TableCell colSpan={11} className="py-8 text-center text-[#999]">
                        Nenhum dado em tempo real disponivel. O agente ainda nao sincronizou.
                      </TableCell>
                    </TableRow>
                  ) : (
                    realtimeRows.map((row: any, idx: number) => (
                      <TableRow key={idx} className="border-[#1e1e1e] hover:bg-[#1a1a1a]">
                        <TableCell className="font-medium text-white">{row.name}</TableCell>
                        <TableCell className="text-right text-[#ccc]">
                          {formatBRL(row.spend)}
                        </TableCell>
                        <TableCell className="text-right text-[#ccc]">
                          {formatNumber(row.impressions)}
                        </TableCell>
                        <TableCell className="text-right text-[#ccc]">
                          {formatNumber(row.clicks)}
                        </TableCell>
                        <TableCell className="text-right text-[#ccc]">
                          {row.outboundCtr != null ? formatPercent(row.outboundCtr) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-[#ccc]">
                          {row.cpc != null ? formatBRL(row.cpc) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-[#ccc]">
                          {row.cpm != null ? formatBRL(row.cpm) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-[#ccc]">
                          {formatNumber(row.sales)}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.cpa != null ? (
                            <span style={{ color: cpaColorClass(row.cpa), fontWeight: 600 }}>
                              {formatBRL(row.cpa)}
                            </span>
                          ) : (
                            <span className="text-[#999]">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium text-[#e89b6a]">
                          {row.roas != null ? formatRoas(row.roas) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-[#ccc]">
                          {row.hookRate != null ? formatPercent(row.hookRate) : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---- Historical Table (Last 30 Days) ---- */}
      <Card className="border-[#1e1e1e] bg-[#111111]">
        <CardHeader>
          <CardTitle className="text-white">Historico — Ultimos 30 dias</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingMetrics ? (
            <p className="py-8 text-center text-[#999]">Carregando historico...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#1e1e1e] hover:bg-transparent">
                    <TableHead className="text-[#999]">Data</TableHead>
                    <TableHead className="text-[#999]">Campanha</TableHead>
                    <TableHead className="text-right text-[#999]">Investimento</TableHead>
                    <TableHead className="text-right text-[#999]">Impressoes</TableHead>
                    <TableHead className="text-right text-[#999]">Cliques</TableHead>
                    <TableHead className="text-right text-[#999]">Vendas</TableHead>
                    <TableHead className="text-right text-[#999]">CPA</TableHead>
                    <TableHead className="text-right text-[#999]">ROAS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicalMetrics.length === 0 ? (
                    <TableRow className="border-[#1e1e1e]">
                      <TableCell colSpan={8} className="py-8 text-center text-[#999]">
                        Nenhuma metrica historica registrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    historicalMetrics.map((m) => {
                      const cpa = safeDivide(m.investment, m.sales);
                      const roas = safeDivide(m.sales * 97, m.investment);
                      return (
                        <TableRow key={m.id} className="border-[#1e1e1e] hover:bg-[#1a1a1a]">
                          <TableCell className="text-[#ccc]">{formatDate(m.date)}</TableCell>
                          <TableCell className="text-[#ccc]">
                            {m.campaign?.name ?? "—"}
                          </TableCell>
                          <TableCell className="text-right text-[#ccc]">
                            {formatBRL(m.investment)}
                          </TableCell>
                          <TableCell className="text-right text-[#ccc]">
                            {formatNumber(m.impressions)}
                          </TableCell>
                          <TableCell className="text-right text-[#ccc]">
                            {formatNumber(m.clicks)}
                          </TableCell>
                          <TableCell className="text-right text-[#ccc]">
                            {formatNumber(m.sales)}
                          </TableCell>
                          <TableCell className="text-right">
                            {cpa != null ? (
                              <span style={{ color: cpaColorClass(cpa), fontWeight: 600 }}>
                                {formatBRL(cpa)}
                              </span>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium text-[#e89b6a]">
                            {roas != null ? formatRoas(roas) : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
