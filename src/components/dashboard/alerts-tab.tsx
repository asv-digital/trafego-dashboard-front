"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertOctagon,
  XCircle,
  AlertTriangle,
  CheckCircle,
  Pause,
} from "lucide-react";

import { api, type Alert } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
              <span className="text-xs text-[#666]">
                / {alert.adSet}
              </span>
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
                <Pause className="h-3 w-3 mr-1" />
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
        {/* Header */}
        <div className="grid grid-cols-3 gap-4 px-6 pb-2 text-xs font-semibold uppercase tracking-wider text-[#666]">
          <span>Sintoma</span>
          <span>Diagnostico</span>
          <span>Acao</span>
        </div>
        <Separator className="bg-[#1e1e1e]" />
        {/* Rows */}
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

      {/* Diagnostico Rapido */}
      <section>
        <DiagnosticoRapido />
      </section>
    </div>
  );
}
