"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertOctagon,
  XCircle,
  AlertTriangle,
  CheckCircle,
  Pause,
  Gauge,
  ArrowLeftRight,
  ShoppingCart,
  RotateCcw,
  CreditCard,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";

import { api, type Alert } from "@/lib/api";
import { formatBRL, formatPercent, formatNumber, formatRoas } from "@/lib/format";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ---------------------------------------------------------------------------
// Level config helpers
// ---------------------------------------------------------------------------

const levelConfig: Record<
  Alert["level"],
  {
    color: string;
    icon: typeof AlertOctagon;
    iconColor: string;
    badge: string;
    pulse: boolean;
  }
> = {
  critical: {
    color: "#e85040",
    icon: AlertOctagon,
    iconColor: "#e85040",
    badge: "CRITICO",
    pulse: true,
  },
  red: {
    color: "#e85040",
    icon: XCircle,
    iconColor: "#e85040",
    badge: "ALERTA",
    pulse: false,
  },
  yellow: {
    color: "#f5c542",
    icon: AlertTriangle,
    iconColor: "#f5c542",
    badge: "ATENCAO",
    pulse: false,
  },
  green: {
    color: "#50c878",
    icon: CheckCircle,
    iconColor: "#50c878",
    badge: "ESCALAR",
    pulse: false,
  },
};

// ---------------------------------------------------------------------------
// Diagnostic reference data
// ---------------------------------------------------------------------------

const diagnosticRows = [
  {
    symptom: "CTR alto + CPA alto",
    diagnosis: "LP fraca",
    action: "Revisar landing page",
    color: "#e85040",
  },
  {
    symptom: "CTR baixo + CPM normal",
    diagnosis: "Criativo fraco",
    action: "Trocar hooks e criativos",
    color: "#f5c542",
  },
  {
    symptom: "CTR alto + CPA baixo",
    diagnosis: "Performance excelente",
    action: "Escalar 20-30% budget",
    color: "#50c878",
  },
  {
    symptom: "CPM muito alto",
    diagnosis: "Publico pequeno demais",
    action: "Expandir audiencia",
    color: "#f5c542",
  },
  {
    symptom: "Frequencia > 5",
    diagnosis: "Fadiga de criativo",
    action: "Trocar criativo urgente",
    color: "#e85040",
  },
];

// ---------------------------------------------------------------------------
// Heatmap color helper
// ---------------------------------------------------------------------------

function heatmapColor(value: number, max: number) {
  if (max === 0) return "rgba(232,155,106,0.05)";
  const intensity = value / max;
  if (intensity === 0) return "rgba(232,155,106,0.05)";
  return `rgba(232,155,106,${Math.max(0.1, intensity)})`;
}

const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];

// ---------------------------------------------------------------------------
// Operation Score
// ---------------------------------------------------------------------------

function OperationScore() {
  const { data: score, isLoading } = useQuery({
    queryKey: ["score"],
    queryFn: () => api.getScore(),
    refetchInterval: 120000,
  });

  if (isLoading) {
    return <Card className="h-20 animate-pulse border-[#1e1e1e] bg-[#111111]" />;
  }

  const value = score?.score ?? 0;
  const status = score?.status ?? "Desconhecido";
  const color =
    value >= 80 ? "#50c878" : value >= 50 ? "#f5c542" : "#e85040";

  return (
    <Card className="border-[#1e1e1e] bg-[#111111]">
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{ border: `3px solid ${color}` }}
        >
          <span className="text-xl font-bold" style={{ color }}>
            {value}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Score Operacional</p>
          <p className="text-xs" style={{ color }}>
            {status}
          </p>
        </div>
        <Gauge className="ml-auto h-5 w-5 text-[#666]" />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Alert Card with Action
// ---------------------------------------------------------------------------

function AlertCard({
  alert,
  onPauseAdset,
  isPausing,
}: {
  alert: Alert;
  onPauseAdset: (campaignId: string) => void;
  isPausing: boolean;
}) {
  const config = levelConfig[alert.level];
  const Icon = config.icon;

  const showPauseAction =
    alert.level === "critical" || alert.level === "red";

  return (
    <Card
      className="relative overflow-hidden border-0"
      style={{
        borderLeft: `4px solid ${config.color}`,
        background: "rgba(255,255,255,0.03)",
      }}
    >
      {config.pulse && (
        <span
          className="absolute left-0 top-0 h-full w-1 animate-pulse"
          style={{ backgroundColor: config.color }}
        />
      )}
      <CardContent className="flex items-start gap-4 p-4">
        <Icon
          className="mt-0.5 shrink-0"
          size={22}
          style={{ color: config.iconColor }}
        />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs font-semibold"
              style={{ borderColor: config.color, color: config.color }}
            >
              {config.badge}
            </Badge>
            <span className="text-sm font-medium text-[#ccc]">
              {alert.campaign}
            </span>
            {alert.adSet && (
              <span className="text-xs text-[#666]">/ {alert.adSet}</span>
            )}
          </div>
          <p className="text-sm text-[#999]">{alert.message}</p>
          <div className="flex items-center gap-3">
            <p className="text-sm italic text-[#666]">{alert.action}</p>
            {showPauseAction && (
              <Button
                variant="outline"
                size="sm"
                className="border-[#e85040]/40 text-[#e85040] hover:bg-[#e85040]/10 hover:text-[#e85040] text-xs"
                onClick={() => onPauseAdset(alert.campaignId)}
                disabled={isPausing}
              >
                <Pause className="mr-1 h-3 w-3" />
                Pausar este conjunto
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Alerts Section
// ---------------------------------------------------------------------------

function AlertsSection() {
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: api.getAlerts,
    refetchInterval: 120000,
  });

  const pauseMutation = useMutation({
    mutationFn: (campaignId: string) =>
      api.updateAdsetStatus(campaignId, "PAUSED"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["metaLiveCampaigns"] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-20 animate-pulse border-0 bg-[#1e1e1e]/50" />
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card
        className="border-0"
        style={{
          borderLeft: "4px solid #50c878",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <CardContent className="flex items-center gap-3 p-4">
          <CheckCircle size={22} style={{ color: "#50c878" }} />
          <p className="text-sm text-[#ccc]">
            Nenhum alerta ativo. Tudo funcionando normalmente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => (
        <AlertCard
          key={`${alert.campaignId}-${idx}`}
          alert={alert}
          onPauseAdset={(id) => pauseMutation.mutate(id)}
          isPausing={pauseMutation.isPending}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Discrepancy Card
// ---------------------------------------------------------------------------

function DiscrepancyCard() {
  const { data: disc, isLoading } = useQuery({
    queryKey: ["discrepancy"],
    queryFn: () => api.getDiscrepancy(),
    refetchInterval: 120000,
  });

  if (isLoading) {
    return <Card className="h-28 animate-pulse border-[#1e1e1e] bg-[#111111]" />;
  }

  if (!disc) return null;

  const metaSales = disc.metaSales ?? 0;
  const kirvanoSales = disc.kirvanoSales ?? 0;
  const diff = kirvanoSales > 0 ? ((kirvanoSales - metaSales) / kirvanoSales) * 100 : 0;
  const diffAbs = Math.abs(diff);

  return (
    <Card className="border-[#1e1e1e] bg-[#111111]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-white">
          <ArrowLeftRight className="h-4 w-4 text-[#e89b6a]" />
          Discrepancia Meta vs Kirvano
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] p-3">
            <p className="text-xs text-[#999]">Meta Ads</p>
            <p className="text-lg font-bold text-white">
              {disc.metaRevenue != null ? formatBRL(disc.metaRevenue) : `${metaSales} vendas`}
            </p>
          </div>
          <div className="rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] p-3">
            <p className="text-xs text-[#999]">Kirvano</p>
            <p className="text-lg font-bold text-white">
              {disc.kirvanoRevenue != null ? formatBRL(disc.kirvanoRevenue) : `${kirvanoSales} vendas`}
            </p>
          </div>
        </div>
        {diffAbs > 0 && (
          <Badge
            className="text-xs"
            style={{
              backgroundColor: diffAbs > 15 ? "rgba(232,80,64,0.15)" : "rgba(245,197,66,0.15)",
              color: diffAbs > 15 ? "#e85040" : "#f5c542",
              borderColor: diffAbs > 15 ? "rgba(232,80,64,0.3)" : "rgba(245,197,66,0.3)",
            }}
          >
            Meta subreporta {diffAbs.toFixed(1)}%
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Sales Summary
// ---------------------------------------------------------------------------

function SalesSummarySection() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["salesSummary"],
    queryFn: () => api.getSalesSummary(),
    refetchInterval: 120000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-24 animate-pulse border-[#1e1e1e] bg-[#111111]" />
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const approved = summary.approved ?? 0;
  const refunded = summary.refunded ?? 0;
  const chargebacks = summary.chargebacks ?? 0;
  const total = approved + refunded + chargebacks;
  const refundRate = total > 0 ? (refunded / total) * 100 : 0;

  const cards = [
    {
      label: "Aprovadas",
      value: approved,
      icon: ShoppingCart,
      color: "#50c878",
    },
    {
      label: "Reembolsadas",
      value: refunded,
      icon: RotateCcw,
      color: "#f5c542",
    },
    {
      label: "Chargebacks",
      value: chargebacks,
      icon: CreditCard,
      color: "#e85040",
    },
    {
      label: "Taxa Reembolso",
      value: formatPercent(refundRate),
      icon: TrendingUp,
      color: refundRate > 5 ? "#e85040" : "#50c878",
      isPercent: true,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="border-[#1e1e1e] bg-[#111111]">
              <CardContent className="flex items-center gap-3 p-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${c.color}15` }}
                >
                  <Icon size={20} style={{ color: c.color }} />
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: c.color }}>
                    {c.isPercent ? c.value : formatNumber(c.value as number)}
                  </p>
                  <p className="text-xs text-[#999]">{c.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {refundRate > 5 && (
        <div className="flex items-center gap-3 rounded-lg border border-[#e85040]/30 bg-[#e85040]/10 px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-[#e85040]" />
          <p className="text-sm font-medium text-[#e85040]">
            Taxa de reembolso em {formatPercent(refundRate)} — acima do limite de 5%. Investigar
            causa urgente.
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sales Heatmap
// ---------------------------------------------------------------------------

function SalesHeatmap() {
  const { data: heatmap, isLoading } = useQuery({
    queryKey: ["salesHeatmap"],
    queryFn: () => api.getSalesHeatmap(),
    refetchInterval: 120000,
  });

  if (isLoading) {
    return <Card className="h-60 animate-pulse border-[#1e1e1e] bg-[#111111]" />;
  }

  if (!heatmap) return null;

  const grid: number[][] = heatmap.grid ?? [];
  const insights: string[] = heatmap.insights ?? [];

  // Find max value for color scaling
  let max = 0;
  for (const row of grid) {
    for (const val of row) {
      if (val > max) max = val;
    }
  }

  // Generate hour labels
  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}h`);

  return (
    <Card className="border-[#1e1e1e] bg-[#111111]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-white">Heatmap de Vendas (Dia x Hora)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Hour labels */}
            <div className="mb-1 flex">
              <div className="w-10 shrink-0" />
              {hours.map((h) => (
                <div
                  key={h}
                  className="flex-1 text-center text-[10px] text-[#666]"
                >
                  {parseInt(h) % 3 === 0 ? h : ""}
                </div>
              ))}
            </div>

            {/* Grid rows */}
            {grid.map((row, dayIdx) => (
              <div key={dayIdx} className="flex items-center">
                <div className="w-10 shrink-0 text-xs text-[#999]">
                  {dayLabels[dayIdx] ?? dayIdx}
                </div>
                {(row ?? []).map((val, hourIdx) => (
                  <div
                    key={hourIdx}
                    className="m-[1px] flex-1 rounded-sm"
                    style={{
                      backgroundColor: heatmapColor(val, max),
                      height: 20,
                    }}
                    title={`${dayLabels[dayIdx]} ${hours[hourIdx]}: ${val} vendas`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="space-y-1 pt-2">
            {insights.map((insight, idx) => (
              <p key={idx} className="text-xs text-[#999]">
                {insight}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// LTV Card
// ---------------------------------------------------------------------------

function LtvCard() {
  const { data: ltv, isLoading } = useQuery({
    queryKey: ["salesLtv"],
    queryFn: () => api.getSalesLtv(),
    refetchInterval: 120000,
  });

  if (isLoading) {
    return <Card className="h-40 animate-pulse border-[#1e1e1e] bg-[#111111]" />;
  }

  if (!ltv) return null;

  const skillsBuyers = ltv.skillsBuyers ?? 0;
  const mentoriaConversions = ltv.mentoriaConversions ?? 0;
  const conversionRate =
    skillsBuyers > 0 ? (mentoriaConversions / skillsBuyers) * 100 : 0;
  const estimatedLtv = ltv.estimatedLtv ?? 0;
  const realRoas = ltv.realRoas ?? 0;

  return (
    <Card className="border-[#1e1e1e] bg-[#111111]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-white">
          <DollarSign className="h-4 w-4 text-[#e89b6a]" />
          LTV & Upsell
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs text-[#999]">Compradores Skills</p>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#e89b6a]" />
              <span className="text-lg font-bold text-white">
                {formatNumber(skillsBuyers)}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[#999]">Conversoes Mentoria</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#50c878]" />
              <span className="text-lg font-bold text-[#50c878]">
                {formatNumber(mentoriaConversions)}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[#999]">Taxa Conversao</p>
            <span className="text-lg font-bold text-white">
              {formatPercent(conversionRate)}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[#999]">LTV Estimado / Comprador</p>
            <span className="text-lg font-bold text-[#e89b6a]">
              {formatBRL(estimatedLtv)}
            </span>
          </div>
        </div>

        <Separator className="my-4 bg-[#1e1e1e]" />

        <div className="flex items-center justify-between">
          <span className="text-sm text-[#999]">ROAS Real (com LTV)</span>
          <span
            className="text-lg font-bold"
            style={{ color: realRoas >= 2 ? "#50c878" : realRoas >= 1 ? "#f5c542" : "#e85040" }}
          >
            {formatRoas(realRoas)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Diagnostico Rapido Section
// ---------------------------------------------------------------------------

function DiagnosticoRapido() {
  return (
    <Card className="border-[#1e1e1e] bg-[#111111]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-white">
          Diagnostico Rapido
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1e1e1e] hover:bg-transparent">
                <TableHead className="text-[#999]">Sintoma</TableHead>
                <TableHead className="text-[#999]">Diagnostico</TableHead>
                <TableHead className="text-[#999]">Acao</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diagnosticRows.map((row, idx) => (
                <TableRow
                  key={idx}
                  className="border-[#1e1e1e] hover:bg-[#1a1a1a]"
                  style={{ borderLeft: `3px solid ${row.color}` }}
                >
                  <TableCell className="font-medium text-[#ccc]">{row.symptom}</TableCell>
                  <TableCell className="text-[#999]">{row.diagnosis}</TableCell>
                  <TableCell style={{ color: row.color }} className="font-medium">
                    {row.action}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile fallback */}
        <div className="space-y-0 md:hidden">
          {diagnosticRows.map((row, idx) => (
            <div key={idx}>
              <div
                className="grid grid-cols-3 gap-4 px-6 py-3 text-sm"
                style={{ borderLeft: `3px solid ${row.color}` }}
              >
                <span className="font-medium text-[#ccc]">{row.symptom}</span>
                <span className="text-[#999]">{row.diagnosis}</span>
                <span style={{ color: row.color }} className="font-medium">
                  {row.action}
                </span>
              </div>
              {idx < diagnosticRows.length - 1 && (
                <Separator className="bg-[#1e1e1e]/60" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

export default function AlertsTab() {
  return (
    <div className="space-y-8">
      {/* Operation Score */}
      <section>
        <OperationScore />
      </section>

      {/* Alertas */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">
            Alertas & Diagnostico
          </h2>
          <Badge className="bg-[#e89b6a]/10 text-[#e89b6a] border-[#e89b6a]/30">
            Auto-refresh 2min
          </Badge>
        </div>
        <AlertsSection />
      </section>

      {/* Discrepancy */}
      <section>
        <DiscrepancyCard />
      </section>

      {/* Sales Summary */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Resumo de Vendas</h3>
        <SalesSummarySection />
      </section>

      {/* Sales Heatmap */}
      <section>
        <SalesHeatmap />
      </section>

      {/* LTV */}
      <section>
        <LtvCard />
      </section>

      {/* Diagnostico Rapido */}
      <section>
        <DiagnosticoRapido />
      </section>
    </div>
  );
}
