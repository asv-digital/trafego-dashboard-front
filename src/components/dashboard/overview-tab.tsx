"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  ShoppingCart,
  MousePointerClick,
  Eye,
  Bot,
  RefreshCw,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
  Percent,
  BarChart3,
  Activity,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// ---------------------------------------------------------------------------
// Theme constants
// ---------------------------------------------------------------------------

const COLORS = {
  bg: "#0a0a0a",
  card: "#111111",
  border: "#1e1e1e",
  primary: "#e89b6a",
  blue: "#5b9bd5",
  green: "#50c878",
  red: "#e85040",
  yellow: "#f5c542",
  muted: "#999999",
  white: "#ffffff",
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function roasColor(value: number) {
  if (value >= 2) return COLORS.green;
  if (value >= 1.4) return COLORS.yellow;
  return COLORS.red;
}

function cpaColor(value: number) {
  if (value < 50) return COLORS.green;
  if (value <= 70) return COLORS.yellow;
  return COLORS.red;
}

function scoreColor(score: number) {
  if (score >= 80) return COLORS.green;
  if (score >= 60) return COLORS.yellow;
  if (score >= 40) return COLORS.primary;
  return COLORS.red;
}

function scoreLabel(score: number) {
  if (score >= 80) return "Excelente";
  if (score >= 60) return "Bom";
  if (score >= 40) return "Regular";
  return "Critico";
}

function variationArrow(variation: number, invertColor = false) {
  const isPositive = variation > 0;
  const color = invertColor
    ? isPositive
      ? COLORS.red
      : COLORS.green
    : isPositive
      ? COLORS.green
      : COLORS.red;
  const arrow = isPositive ? (
    <TrendingUp className="inline h-3 w-3" />
  ) : (
    <TrendingDown className="inline h-3 w-3" />
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs" style={{ color }}>
      {arrow} {formatPercent(Math.abs(variation))}
    </span>
  );
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
// Semicircular Gauge SVG
// ---------------------------------------------------------------------------

function ScoreGauge({ score, color }: { score: number; color: string }) {
  const radius = 70;
  const cx = 90;
  const cy = 85;
  const circumference = Math.PI * radius;
  const percentage = Math.min(Math.max(score / 100, 0), 1);
  const offset = circumference * (1 - percentage);

  return (
    <svg width="180" height="110" viewBox="0 0 180 110">
      {/* Background arc */}
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="none"
        stroke={COLORS.border}
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* Score arc */}
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={`${circumference}`}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      {/* Score number */}
      <text
        x={cx}
        y={cy - 15}
        textAnchor="middle"
        fill={color}
        fontSize="32"
        fontWeight="bold"
      >
        {score}
      </text>
      {/* Label */}
      <text
        x={cx}
        y={cy + 5}
        textAnchor="middle"
        fill={COLORS.muted}
        fontSize="13"
      >
        {scoreLabel(score)}
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Mini bar for score breakdown
// ---------------------------------------------------------------------------

function MiniBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = pct >= 70 ? COLORS.green : pct >= 40 ? COLORS.yellow : COLORS.red;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 text-right" style={{ color: COLORS.muted }}>{label}</span>
      <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: COLORS.border }}>
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-8 tabular-nums" style={{ color: COLORS.muted }}>{Math.round(value)}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
  variation?: number | null;
  invertVariation?: boolean;
}

function KpiCard({ title, value, icon, color, variation, invertVariation }: KpiCardProps) {
  return (
    <Card className="border-[#1e1e1e] bg-[#111111]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-[#999]">{title}</CardTitle>
        <span className="text-[#e89b6a]">{icon}</span>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold" style={{ color: color ?? COLORS.white }}>
          {value}
        </p>
        {variation != null && variation !== 0 && (
          <div className="mt-1">{variationArrow(variation, invertVariation)}</div>
        )}
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
  const [weeklyOpen, setWeeklyOpen] = useState(false);

  const refetchOpts = { refetchInterval: 60000 };

  // ---- Data fetching ----

  const { data: tokenStatus } = useQuery({
    queryKey: ["tokenStatus"],
    queryFn: api.getTokenStatus,
    ...refetchOpts,
  });

  const { data: briefing, isLoading: loadingBriefing } = useQuery({
    queryKey: ["dailyBriefing"],
    queryFn: api.getDailyBriefing,
    ...refetchOpts,
  });

  const { data: weeklyBriefing, isLoading: loadingWeekly } = useQuery({
    queryKey: ["weeklyBriefing"],
    queryFn: api.getWeeklyBriefing,
    enabled: weeklyOpen,
  }) as any;

  const { data: score, isLoading: loadingScore } = useQuery({
    queryKey: ["score"],
    queryFn: api.getScore,
    ...refetchOpts,
  });

  const { data: goalProgress } = useQuery({
    queryKey: ["goalProgress"],
    queryFn: api.getGoalProgress,
    ...refetchOpts,
  });

  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [compareEnabled, setCompareEnabled] = useState(true);

  const { data: overviewCompare, isLoading: loadingOverview } = useQuery({
    queryKey: ["overviewCompare", selectedPeriod, compareEnabled],
    queryFn: () => api.getOverviewCompare(selectedPeriod + (compareEnabled ? "" : "&compare=none")),
    ...refetchOpts,
  });

  const { data: profit } = useQuery({
    queryKey: ["profit"],
    queryFn: () => api.getProfit(),
    ...refetchOpts,
  });

  const { data: discrepancy } = useQuery({
    queryKey: ["discrepancy"],
    queryFn: api.getDiscrepancy,
    ...refetchOpts,
  });

  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ["metrics"],
    queryFn: () => api.getMetrics(),
    ...refetchOpts,
  });

  const { data: campaigns, isLoading: loadingCampaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: api.getCampaigns,
    ...refetchOpts,
  });

  const { data: agentStatus } = useQuery({
    queryKey: ["agentStatus"],
    queryFn: api.getAgentStatus,
    ...refetchOpts,
  });

  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: api.getHealth,
    ...refetchOpts,
  });

  const { data: emq } = useQuery({
    queryKey: ["emq"],
    queryFn: api.getEventMatchQuality,
    refetchInterval: 300000, // 5 min
  });

  const { data: budgetAllocation } = useQuery({
    queryKey: ["budgetAllocation"],
    queryFn: api.getBudgetAllocation,
    ...refetchOpts,
  });

  const { data: funnel } = useQuery({
    queryKey: ["funnel"],
    queryFn: () => api.getFunnel("7d"),
    ...refetchOpts,
  });

  const { data: adDiagnostics } = useQuery({
    queryKey: ["adDiagnostics"],
    queryFn: () => api.getAdDiagnostics("7d"),
    ...refetchOpts,
  });

  const { data: cpmTrend } = useQuery({
    queryKey: ["cpmTrend"],
    queryFn: () => api.getCpmTrend(30),
    ...refetchOpts,
  });

  const { data: commentSummary } = useQuery({
    queryKey: ["commentSummary"],
    queryFn: api.getCommentSummary,
    ...refetchOpts,
  });

  const { data: lookalikes } = useQuery({
    queryKey: ["lookalikes"],
    queryFn: api.getLookalikes,
    ...refetchOpts,
  });

  const triggerMutation = useMutation({
    mutationFn: api.triggerAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentStatus"] });
      queryClient.invalidateQueries({ queryKey: ["overviewCompare"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      queryClient.invalidateQueries({ queryKey: ["score"] });
      queryClient.invalidateQueries({ queryKey: ["dailyBriefing"] });
    },
  });

  // ---- Derived data ----

  const safeMetrics = metrics ?? [];
  const safeCampaigns = campaigns ?? [];
  const tsData = buildTimeSeriesData(safeMetrics);
  const salesData = buildSalesByCampaign(safeCampaigns);

  const ov = overviewCompare?.current ?? overviewCompare ?? {};
  const variations = overviewCompare?.variations ?? {};

  // ---- Render ----

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* 1. TOKEN WARNING BANNER                                         */}
      {/* ================================================================ */}
      {tokenStatus && tokenStatus.status !== "ok" && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm font-medium ${
            tokenStatus.status === "expired"
              ? "animate-pulse border-red-700 bg-red-950 text-red-300"
              : tokenStatus.status === "critical"
                ? "border-red-700 bg-red-950 text-red-300"
                : "border-yellow-700 bg-yellow-950 text-yellow-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {tokenStatus.status === "expired" && "Token EXPIRADO. Dashboard offline."}
            {tokenStatus.status === "critical" &&
              `URGENTE: Token expira em ${tokenStatus.days_remaining ?? "?"} dias!`}
            {tokenStatus.status === "warning" &&
              `Token Meta expira em ${tokenStatus.days_remaining ?? "?"} dias. Renovar em breve.`}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* PERIOD SELECTOR                                                 */}
      {/* ================================================================ */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded-lg border border-[#1e1e1e] bg-[#111] overflow-hidden">
          {(["7d", "14d", "30d", "month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedPeriod === p
                  ? "bg-[#e89b6a] text-black"
                  : "text-[#999] hover:text-white hover:bg-[#1e1e1e]"
              }`}
            >
              {p === "7d" ? "7 dias" : p === "14d" ? "14 dias" : p === "30d" ? "30 dias" : "Mes"}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1.5 text-xs text-[#999] cursor-pointer">
          <input
            type="checkbox"
            checked={compareEnabled}
            onChange={(e) => setCompareEnabled(e.target.checked)}
            className="rounded border-[#333] bg-[#111] accent-[#e89b6a]"
          />
          Comparar com periodo anterior
        </label>
      </div>

      {/* ================================================================ */}
      {/* 2. DAILY BRIEFING CARD                                          */}
      {/* ================================================================ */}
      {loadingBriefing ? (
        <Card className="border-[#1e1e1e] bg-[#111111]">
          <CardContent className="py-6">
            <p className="text-sm text-[#999]">Carregando briefing...</p>
          </CardContent>
        </Card>
      ) : briefing ? (
        <Card
          className="border-[#1e1e1e] bg-[#111111]"
          style={{ borderLeftWidth: 3, borderLeftColor: COLORS.primary }}
        >
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <CardTitle className="text-white">Briefing do Dia</CardTitle>
            {briefing.status === "atencao" && (
              <Badge className="bg-red-900 text-red-300 hover:bg-red-900">Atencao</Badge>
            )}
            {briefing.status === "oportunidade" && (
              <Badge className="bg-green-900 text-green-300 hover:bg-green-900">Oportunidade</Badge>
            )}
            {briefing.status === "estavel" && (
              <Badge className="bg-blue-900 text-blue-300 hover:bg-blue-900">Estavel</Badge>
            )}
            {briefing.actions_count != null && briefing.actions_count > 0 && (
              <Badge className="bg-[#e89b6a]/20 text-[#e89b6a] hover:bg-[#e89b6a]/20">
                {briefing.actions_count} acoes
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <p
              className="text-sm leading-relaxed text-[#ccc]"
              style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", whiteSpace: "pre-wrap" }}
            >
              {briefing.text ?? briefing.summary ?? "Sem briefing disponivel."}
            </p>

            <button
              onClick={() => setWeeklyOpen((prev) => !prev)}
              className="mt-4 flex items-center gap-1 text-xs text-[#e89b6a] hover:underline"
            >
              {weeklyOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Ver briefing da semana
            </button>

            {weeklyOpen && (
              <div className="mt-3 rounded-md border border-[#1e1e1e] bg-[#0a0a0a] p-3">
                {loadingWeekly ? (
                  <p className="text-xs text-[#999]">Carregando...</p>
                ) : weeklyBriefing ? (
                  <p
                    className="text-xs leading-relaxed text-[#aaa]"
                    style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", whiteSpace: "pre-wrap" }}
                  >
                    {weeklyBriefing.text ?? weeklyBriefing.summary ?? "Sem dados da semana."}
                  </p>
                ) : (
                  <p className="text-xs text-[#999]">Sem briefing semanal disponivel.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* ================================================================ */}
      {/* 3. OPERATION SCORE GAUGE                                        */}
      {/* ================================================================ */}
      {loadingScore ? (
        <Card className="border-[#1e1e1e] bg-[#111111]">
          <CardContent className="py-6">
            <p className="text-sm text-[#999]">Carregando score...</p>
          </CardContent>
        </Card>
      ) : score ? (
        <Card className="border-[#1e1e1e] bg-[#111111]">
          <CardHeader>
            <CardTitle className="text-white">Score da Operacao</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-8">
              <ScoreGauge
                score={score.score ?? score.total ?? 0}
                color={scoreColor(score.score ?? score.total ?? 0)}
              />
              <div className="flex-1 space-y-2">
                {score.breakdown && (
                  <>
                    <MiniBar label="CPA" value={score.breakdown.cpa ?? 0} />
                    <MiniBar label="ROAS" value={score.breakdown.roas ?? 0} />
                    <MiniBar label="CTR" value={score.breakdown.ctr ?? 0} />
                    <MiniBar label="Freq" value={score.breakdown.frequency ?? 0} />
                    <MiniBar label="Hook" value={score.breakdown.hook_rate ?? score.breakdown.hookRate ?? 0} />
                    <MiniBar label="Criativos" value={score.breakdown.creatives ?? 0} />
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* ================================================================ */}
      {/* 4. GOAL PROGRESS BAR                                            */}
      {/* ================================================================ */}
      {goalProgress && goalProgress.status === "no_goal" ? (
        <p className="text-xs text-[#666]">Nenhuma meta definida</p>
      ) : goalProgress ? (
        <Card className="border-[#1e1e1e] bg-[#111111]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Meta Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-5 w-full overflow-hidden rounded-full" style={{ backgroundColor: COLORS.border }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(goalProgress.percent ?? 0, 100)}%`,
                  backgroundColor: (goalProgress.percent ?? 0) >= 100 ? COLORS.green : COLORS.primary,
                }}
              />
              {/* Ideal pace marker */}
              {goalProgress.ideal_percent != null && (
                <div
                  className="absolute top-0 h-full w-0.5"
                  style={{
                    left: `${Math.min(goalProgress.ideal_percent, 100)}%`,
                    backgroundColor: COLORS.white,
                    opacity: 0.6,
                  }}
                  title={`Ritmo ideal: ${goalProgress.ideal_percent}%`}
                />
              )}
            </div>
            <p className="mt-2 text-xs text-[#999]">
              {goalProgress.current ?? 0}/{goalProgress.target ?? 0} vendas (
              {formatPercent(goalProgress.percent ?? 0, 0)})
              {goalProgress.daily_needed != null && (
                <span> | Precisa de {goalProgress.daily_needed} vendas/dia</span>
              )}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* ================================================================ */}
      {/* 5. KPI CARDS GRID                                               */}
      {/* ================================================================ */}
      {loadingOverview ? (
        <p className="py-8 text-center text-[#999]">Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <KpiCard
            title="Investimento"
            value={formatBRL(ov.totalInvestment ?? ov.investment ?? 0)}
            icon={<DollarSign className="h-5 w-5" />}
            variation={variations.investment ?? null}
          />
          <KpiCard
            title="Receita Liquida"
            value={formatBRL(ov.totalRevenue ?? ov.revenue ?? 0)}
            icon={<TrendingUp className="h-5 w-5" />}
            color={COLORS.green}
            variation={variations.revenue ?? null}
          />
          <KpiCard
            title="Lucro"
            value={formatBRL(profit?.profit ?? profit?.value ?? 0)}
            icon={<Zap className="h-5 w-5" />}
            color={(profit?.profit ?? profit?.value ?? 0) >= 0 ? COLORS.green : COLORS.red}
            variation={profit?.variation ?? null}
          />
          <KpiCard
            title="ROAS"
            value={formatRoas(ov.roas ?? 0)}
            icon={<Target className="h-5 w-5" />}
            color={roasColor(ov.roas ?? 0)}
            variation={variations.roas ?? null}
          />
          <KpiCard
            title="CPA"
            value={ov.cpa > 0 ? formatBRL(ov.cpa) : "\u2014"}
            icon={<BarChart3 className="h-5 w-5" />}
            color={ov.cpa > 0 ? cpaColor(ov.cpa) : COLORS.white}
            variation={variations.cpa ?? null}
            invertVariation
          />
          <KpiCard
            title="Vendas"
            value={formatNumber(ov.totalSales ?? ov.sales ?? 0)}
            icon={<ShoppingCart className="h-5 w-5" />}
            variation={variations.sales ?? null}
          />
          <KpiCard
            title="Hook Rate"
            value={ov.hookRate != null ? formatPercent(ov.hookRate) : "\u2014"}
            icon={<MousePointerClick className="h-5 w-5" />}
            variation={variations.hookRate ?? null}
          />
          <KpiCard
            title="CPLPV"
            value={ov.cplpv != null ? formatBRL(ov.cplpv) : "\u2014"}
            icon={<Eye className="h-5 w-5" />}
            variation={variations.cplpv ?? null}
            invertVariation
          />
        </div>
      )}

      {/* ================================================================ */}
      {/* 6. DISCREPANCY CARD                                             */}
      {/* ================================================================ */}
      {discrepancy && (discrepancy.discrepancy_percent ?? 0) > 5 && (
        <Card className="border-[#1e1e1e] bg-[#111111]">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <CardTitle className="text-white">Discrepancia Meta vs Real</CardTitle>
            <Badge className="bg-yellow-900 text-yellow-300 hover:bg-yellow-900">
              Meta subreporta {formatPercent(discrepancy.discrepancy_percent ?? 0, 0)}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-[#999]">CPA Meta</p>
                <p className="text-lg font-bold text-white">
                  {formatBRL(discrepancy.cpa_meta ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#999]">CPA Real (Kirvano)</p>
                <p className="text-lg font-bold text-white">
                  {formatBRL(discrepancy.cpa_real ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#999]">Vendas Meta</p>
                <p className="text-lg font-bold text-white">
                  {formatNumber(discrepancy.sales_meta ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#999]">Vendas Real</p>
                <p className="text-lg font-bold text-white">
                  {formatNumber(discrepancy.sales_real ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ================================================================ */}
      {/* 7. CHARTS                                                       */}
      {/* ================================================================ */}

      {/* CPA Evolution */}
      <Card className="border-[#1e1e1e] bg-[#111111]">
        <CardHeader>
          <CardTitle className="text-white">Evolucao do CPA</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingMetrics ? (
            <p className="py-8 text-center text-[#999]">Carregando...</p>
          ) : tsData.length === 0 ? (
            <p className="py-8 text-center text-[#999]">Sem dados historicos ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={tsData}>
                <CartesianGrid stroke="#1e1e1e" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#999", fontSize: 12 }} tickLine={false} />
                <YAxis tick={{ fill: "#999", fontSize: 12 }} tickLine={false} tickFormatter={(v: number) => `R$${v}`} />
                <Tooltip content={<CpaTooltip />} />
                <ReferenceLine y={50} stroke={COLORS.green} strokeDasharray="4 4" label={{ value: "Meta", fill: COLORS.green, fontSize: 12 }} />
                <ReferenceLine y={70} stroke={COLORS.red} strokeDasharray="4 4" label={{ value: "Alerta", fill: COLORS.red, fontSize: 12 }} />
                <Line type="monotone" dataKey="cpa" stroke={COLORS.primary} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: COLORS.primary }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ROAS Evolution */}
      <Card className="border-[#1e1e1e] bg-[#111111]">
        <CardHeader>
          <CardTitle className="text-white">Evolucao do ROAS</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingMetrics ? (
            <p className="py-8 text-center text-[#999]">Carregando...</p>
          ) : tsData.length === 0 ? (
            <p className="py-8 text-center text-[#999]">Sem dados historicos ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={tsData}>
                <CartesianGrid stroke="#1e1e1e" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#999", fontSize: 12 }} tickLine={false} />
                <YAxis tick={{ fill: "#999", fontSize: 12 }} tickLine={false} tickFormatter={(v: number) => `${v}x`} />
                <Tooltip content={<RoasTooltip />} />
                <ReferenceLine y={2} stroke={COLORS.green} strokeDasharray="4 4" label={{ value: "Meta", fill: COLORS.green, fontSize: 12 }} />
                <ReferenceLine y={1.4} stroke={COLORS.red} strokeDasharray="4 4" label={{ value: "Alerta", fill: COLORS.red, fontSize: 12 }} />
                <Line type="monotone" dataKey="roas" stroke={COLORS.blue} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: COLORS.blue }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Sales by Campaign */}
      <Card className="border-[#1e1e1e] bg-[#111111]">
        <CardHeader>
          <CardTitle className="text-white">Vendas por Campanha</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCampaigns ? (
            <p className="py-8 text-center text-[#999]">Carregando...</p>
          ) : salesData.length === 0 ? (
            <p className="py-8 text-center text-[#999]">Sem dados de campanhas ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={salesData}>
                <CartesianGrid stroke="#1e1e1e" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: "#999", fontSize: 12 }} tickLine={false} />
                <YAxis tick={{ fill: "#999", fontSize: 12 }} tickLine={false} />
                <Tooltip content={<SalesTooltip />} />
                <Bar dataKey="sales" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* 8. AGENT STATUS CARD                                            */}
      {/* ================================================================ */}
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
                backgroundColor: agentStatus?.isRunning ? COLORS.green : "#71717a",
              }}
            />
            <span className="text-sm text-[#999]">
              {agentStatus?.isRunning ? "Coletando..." : "Aguardando"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-[#999]">
              <Clock className="h-4 w-4" />
              <span>Ultimo sync: {agentStatus?.lastRun ? formatDate(agentStatus.lastRun) : "Nunca"}</span>
            </div>
            {agentStatus?.nextRun && (
              <div className="flex items-center gap-2 text-sm text-[#999]">
                <Clock className="h-4 w-4" />
                <span>Proximo sync: {formatDate(agentStatus.nextRun)}</span>
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

      {/* ================================================================ */}
      {/* 9. SYSTEM HEALTH INDICATOR                                      */}
      {/* ================================================================ */}
      {(health || emq) && (
        <div className="flex justify-end gap-2">
          {emq && (
            <Badge
              className={`text-xs ${
                emq.status === "good"
                  ? "bg-green-900/50 text-green-400 hover:bg-green-900/50"
                  : emq.status === "warning"
                    ? "bg-yellow-900/50 text-yellow-400 hover:bg-yellow-900/50"
                    : "bg-red-900/50 text-red-400 hover:bg-red-900/50"
              }`}
              title={emq.details}
            >
              EMQ: {emq.score?.toFixed(1) ?? "?"}
              {emq.status === "good" ? " \u2713" : emq.status === "warning" ? " \u26a0" : " \ud83d\udd34"}
            </Badge>
          )}
          {health && <Badge
            className={`text-xs ${
              health.status === "ok"
                ? "bg-green-900/50 text-green-400 hover:bg-green-900/50"
                : health.status === "degraded"
                  ? "bg-yellow-900/50 text-yellow-400 hover:bg-yellow-900/50"
                  : "bg-red-900/50 text-red-400 hover:bg-red-900/50"
            }`}
          >
            <span
              className="mr-1.5 inline-block h-2 w-2 rounded-full"
              style={{
                backgroundColor:
                  health.status === "ok"
                    ? COLORS.green
                    : health.status === "degraded"
                      ? COLORS.yellow
                      : COLORS.red,
              }}
            />
            {health.status === "ok" && "OK"}
            {health.status === "degraded" && "Degradado"}
            {health.status !== "ok" && health.status !== "degraded" && "Offline"}
          </Badge>}
        </div>
      )}

      {/* ================================================================ */}
      {/* BUDGET ALLOCATION (Ponto 5)                                    */}
      {/* ================================================================ */}
      {budgetAllocation?.allocation && budgetAllocation.allocation.total > 0 && (
        <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">Alocacao de Budget</h3>
            <span className="text-xs text-[#666]">R${budgetAllocation.allocation.total.toFixed(0)} / R${budgetAllocation.daily_target}</span>
          </div>
          <div className="flex h-6 rounded-full overflow-hidden bg-[#1e1e1e]">
            {budgetAllocation.allocation.prospection > 0 && (
              <div className="bg-blue-500 flex items-center justify-center text-[9px] text-white font-medium"
                style={{ width: `${(budgetAllocation.allocation.prospection / budgetAllocation.daily_target) * 100}%` }}
                title={`Prospeccao: R$${budgetAllocation.allocation.prospection.toFixed(0)}`}>
                PROSP
              </div>
            )}
            {budgetAllocation.allocation.remarketing > 0 && (
              <div className="bg-purple-500 flex items-center justify-center text-[9px] text-white font-medium"
                style={{ width: `${(budgetAllocation.allocation.remarketing / budgetAllocation.daily_target) * 100}%` }}
                title={`Remarketing: R$${budgetAllocation.allocation.remarketing.toFixed(0)}`}>
                RMK
              </div>
            )}
            {budgetAllocation.allocation.asc > 0 && (
              <div className="bg-orange-500 flex items-center justify-center text-[9px] text-white font-medium"
                style={{ width: `${(budgetAllocation.allocation.asc / budgetAllocation.daily_target) * 100}%` }}
                title={`ASC: R$${budgetAllocation.allocation.asc.toFixed(0)}`}>
                ASC
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-2 text-[10px]">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" />Prosp: R${budgetAllocation.allocation.prospection.toFixed(0)}</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-500" />RMK: R${budgetAllocation.allocation.remarketing.toFixed(0)}</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" />ASC: R${budgetAllocation.allocation.asc.toFixed(0)}</span>
            <span className="text-[#666]">Reserva: R${budgetAllocation.allocation.reserve.toFixed(0)}</span>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* FUNNEL ANALYSIS (Ponto 5)                                      */}
      {/* ================================================================ */}
      {funnel?.funnel && (
        <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-6">
          <h3 className="text-sm font-bold text-white mb-4">Funil Completo (7d)</h3>
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { label: "Impressoes", value: funnel.funnel.impressions, rate: null, bench: 0 },
              { label: "Cliques", value: funnel.funnel.clicks, rate: funnel.rates.ctr, bench: 1.0 },
              { label: "LP Views", value: funnel.funnel.lp_views, rate: funnel.rates.click_to_lp, bench: 70 },
              { label: "Checkouts", value: funnel.funnel.checkouts, rate: funnel.rates.lp_to_checkout, bench: 5 },
              { label: "Compras", value: funnel.funnel.purchases, rate: funnel.rates.checkout_to_purchase, bench: 30 },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-1">
                {i > 0 && <span className="text-[#333] text-lg mx-1">{"\u2192"}</span>}
                <div className="text-center min-w-[80px]">
                  <p className="text-lg font-bold text-white">{typeof step.value === "number" ? step.value.toLocaleString("pt-BR") : "\u2014"}</p>
                  <p className="text-[10px] text-[#666] uppercase">{step.label}</p>
                  {step.rate !== null && (
                    <p className={`text-[10px] font-medium ${step.rate >= step.bench ? "text-green-400" : "text-red-400"}`}>
                      {step.rate}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {funnel.diagnosis?.length > 0 && funnel.diagnosis[0]?.status !== "healthy" && (
            <div className="mt-3 space-y-1">
              {funnel.diagnosis.filter((d: any) => d.status !== "healthy").map((d: any, i: number) => (
                <p key={i} className={`text-xs ${d.status === "critical" ? "text-red-400" : "text-yellow-400"}`}>
                  {d.message}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* CPM TREND (Ponto 9)                                             */}
      {/* ================================================================ */}
      {cpmTrend && cpmTrend.trend?.length > 0 && (
        <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">CPM Trend (30d)</h3>
            {cpmTrend.is_market_spike && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                Spike de mercado
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-4 mb-3">
            <div>
              <p className="text-2xl font-bold text-white">R${cpmTrend.current_cpm?.toFixed(2)}</p>
              <p className="text-[10px] text-[#666]">CPM atual</p>
            </div>
            <div>
              <p className={`text-sm font-medium ${cpmTrend.variation?.startsWith("+") ? parseFloat(cpmTrend.variation) > 20 ? "text-red-400" : "text-yellow-400" : "text-green-400"}`}>
                {cpmTrend.variation}
              </p>
              <p className="text-[10px] text-[#666]">vs media 30d (R${cpmTrend.avg_30d_cpm?.toFixed(2)})</p>
            </div>
          </div>
          {cpmTrend.note && (
            <p className={`text-xs ${cpmTrend.is_market_spike ? "text-yellow-400" : "text-[#999]"}`}>{cpmTrend.note}</p>
          )}
          <div className="flex items-end gap-[2px] mt-3 h-16">
            {cpmTrend.trend.slice(-30).map((d: any, i: number) => {
              const max = Math.max(...cpmTrend.trend.map((t: any) => t.cpm));
              const h = max > 0 ? (d.cpm / max) * 100 : 0;
              const aboveAvg = d.cpm > cpmTrend.avg_30d_cpm * 1.2;
              return (
                <div key={i} className="flex-1 min-w-[2px]" title={`${d.date}: R$${d.cpm.toFixed(2)}`}>
                  <div className={`rounded-t-sm ${aboveAvg ? "bg-red-400/60" : "bg-[#e89b6a]/40"}`} style={{ height: `${h}%` }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* COMMENT INSIGHTS (Ponto 10)                                     */}
      {/* ================================================================ */}
      {commentSummary?.data?.length > 0 && commentSummary.data.some((s: any) => s.recommendation) && (
        <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-6">
          <h3 className="text-sm font-bold text-white mb-3">Insights de Comentarios</h3>
          <div className="space-y-2">
            {commentSummary.data.filter((s: any) => s.recommendation).slice(0, 5).map((s: any) => (
              <div key={s.id} className="py-2 border-b border-[#1e1e1e]/50 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-white font-medium truncate">{s.adName}</p>
                  <span className="text-[10px] text-[#666]">{s.totalComments} comentarios</span>
                  {s.tagFriend >= 5 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400">VIRAL</span>}
                  {s.topObjection && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">{s.topObjection}</span>}
                </div>
                <p className="text-[10px] text-[#999]">{s.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* LOOKALIKE STATUS (Ponto 11)                                     */}
      {/* ================================================================ */}
      {lookalikes && (
        <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-6">
          <h3 className="text-sm font-bold text-white mb-3">Lookalike Audiences</h3>
          <div className="flex items-center gap-4 mb-3">
            <div>
              <p className="text-xl font-bold text-white">{lookalikes.buyer_count}</p>
              <p className="text-[10px] text-[#666]">Compradores</p>
            </div>
            {lookalikes.next_milestone && (
              <div className="flex-1">
                <div className="flex justify-between text-[10px] text-[#666] mb-1">
                  <span>Proximo marco: {lookalikes.next_milestone}</span>
                  <span>Faltam {lookalikes.buyers_until_next}</span>
                </div>
                <div className="h-2 bg-[#1e1e1e] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#e89b6a] rounded-full transition-all"
                    style={{ width: `${lookalikes.next_milestone > 0 ? Math.min(100, (lookalikes.buyer_count / lookalikes.next_milestone) * 100) : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          {lookalikes.lookalikes?.length > 0 && (
            <div className="space-y-1">
              {lookalikes.lookalikes.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between py-1 text-xs">
                  <span className="text-white">{l.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    l.status === "active" ? "bg-green-500/10 text-green-400" :
                    l.status === "testing" ? "bg-yellow-500/10 text-yellow-400" :
                    "bg-[#1e1e1e] text-[#666]"
                  }`}>{l.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* AD DIAGNOSTICS (Ponto 6)                                        */}
      {/* ================================================================ */}
      {adDiagnostics?.summary && adDiagnostics.summary.total_ads > 0 && (
        adDiagnostics.summary.quality_issues > 0 || adDiagnostics.summary.engagement_issues > 0 || adDiagnostics.summary.conversion_issues > 0
      ) && (
        <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-6">
          <h3 className="text-sm font-bold text-white mb-3">Diagnostico de Ads (7d)</h3>
          <div className="flex gap-4 mb-3 text-xs">
            <span className="text-[#999]">{adDiagnostics.summary.total_ads} ads analisados</span>
            {adDiagnostics.summary.quality_issues > 0 && <span className="text-red-400">{adDiagnostics.summary.quality_issues} quality issues</span>}
            {adDiagnostics.summary.engagement_issues > 0 && <span className="text-yellow-400">{adDiagnostics.summary.engagement_issues} engagement issues</span>}
            {adDiagnostics.summary.conversion_issues > 0 && <span className="text-orange-400">{adDiagnostics.summary.conversion_issues} conversion issues</span>}
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {adDiagnostics.ads?.filter((a: any) => a.priority !== "low").slice(0, 5).map((ad: any) => (
              <div key={ad.adId} className="flex items-start justify-between gap-3 py-1.5 border-b border-[#1e1e1e]/50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{ad.adName}</p>
                  <p className="text-[10px] text-[#666] mt-0.5">{ad.diagnosis}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${ad.quality?.includes("BELOW") ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>Q</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${ad.engagement?.includes("BELOW") ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>E</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${ad.conversion?.includes("BELOW") ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>C</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
