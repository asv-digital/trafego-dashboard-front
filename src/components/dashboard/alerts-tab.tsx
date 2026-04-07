"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertOctagon,
  XCircle,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

import { api, type Alert } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    badge: "CRÍTICO",
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
    badge: "ATENÇÃO",
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
    diagnosis: "Público pequeno demais",
    action: "Expandir audiência",
    color: "#f5c542",
  },
  {
    symptom: "Frequência > 5",
    diagnosis: "Fadiga de criativo",
    action: "Trocar criativo urgente",
    color: "#e85040",
  },
];

// ---------------------------------------------------------------------------
// Alert Card
// ---------------------------------------------------------------------------

function AlertCard({ alert }: { alert: Alert }) {
  const config = levelConfig[alert.level];
  const Icon = config.icon;

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
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs font-semibold"
              style={{ borderColor: config.color, color: config.color }}
            >
              {config.badge}
            </Badge>
            <span className="text-sm font-medium text-zinc-300">
              {alert.campaign}
            </span>
          </div>
          <p className="text-sm text-zinc-400">{alert.message}</p>
          <p className="text-sm italic text-zinc-500">{alert.action}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Alerts Section
// ---------------------------------------------------------------------------

function AlertsSection() {
  const { data: alerts = [], isLoading } = useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: api.getAlerts,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-20 animate-pulse border-0 bg-zinc-800/50" />
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
          <p className="text-sm text-zinc-300">
            Nenhum alerta ativo. Tudo funcionando normalmente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => (
        <AlertCard key={`${alert.campaignId}-${idx}`} alert={alert} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Diagnóstico Rápido Section
// ---------------------------------------------------------------------------

function DiagnosticoRapido() {
  return (
    <Card className="border-0 bg-zinc-900/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-zinc-200">
          Diagnóstico Rápido
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Header */}
        <div className="grid grid-cols-3 gap-4 px-6 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          <span>Sintoma</span>
          <span>Diagnóstico</span>
          <span>Ação</span>
        </div>
        <Separator className="bg-zinc-800" />
        {/* Rows */}
        {diagnosticRows.map((row, idx) => (
          <div key={idx}>
            <div
              className="grid grid-cols-3 gap-4 px-6 py-3 text-sm"
              style={{ borderLeft: `3px solid ${row.color}` }}
            >
              <span className="font-medium text-zinc-300">{row.symptom}</span>
              <span className="text-zinc-400">{row.diagnosis}</span>
              <span style={{ color: row.color }} className="font-medium">
                {row.action}
              </span>
            </div>
            {idx < diagnosticRows.length - 1 && (
              <Separator className="bg-zinc-800/60" />
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
        <h2 className="mb-4 text-lg font-semibold text-zinc-200">
          Alertas
        </h2>
        <AlertsSection />
      </section>

      {/* Diagnóstico Rápido */}
      <section>
        <DiagnosticoRapido />
      </section>
    </div>
  );
}
