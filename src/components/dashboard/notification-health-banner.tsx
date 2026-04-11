"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

// Banner fixo no topo do dashboard que alerta quando o canal de notificação
// WhatsApp está degradado ou quebrado. Polling a cada 60s via /api/notifications/health.
//
// Motivação: se o WhatsApp cair, o usuário perde os alertas críticos do agente.
// Essa tela é a ÚNICA forma de descobrir a falha sem depender do próprio canal
// quebrado. Tem que ser visualmente impossível de ignorar quando vermelho.
export function NotificationHealthBanner() {
  const { data, isLoading } = useQuery({
    queryKey: ["notification-health"],
    queryFn: api.getNotificationHealth,
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });

  if (isLoading || !data || data.status === "healthy") return null;

  const isCritical = data.status === "critical";

  const bgColor = isCritical ? "bg-red-950/80" : "bg-amber-950/80";
  const borderColor = isCritical ? "border-red-500" : "border-amber-500";
  const textColor = isCritical ? "text-red-200" : "text-amber-200";
  const iconColor = isCritical ? "text-red-400" : "text-amber-400";
  const Icon = isCritical ? AlertCircle : AlertTriangle;
  const label = isCritical
    ? "NOTIFICAÇÕES WHATSAPP CRÍTICAS"
    : "NOTIFICAÇÕES WHATSAPP DEGRADADAS";

  return (
    <div
      className={`${bgColor} border-b-2 ${borderColor} px-4 py-3 sm:px-6 lg:px-8`}
      role="alert"
    >
      <div className="mx-auto max-w-7xl flex items-center gap-3">
        <Icon className={`h-5 w-5 flex-shrink-0 ${iconColor}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${textColor}`}>{label}</p>
          <p className={`text-xs ${textColor} opacity-90 mt-0.5`}>
            {data.reason}
            {data.consecutive_failures > 0 &&
              ` · ${data.consecutive_failures} falha(s) consecutiva(s)`}
            {data.failed_last_24h > 0 && ` · ${data.failed_last_24h} falha(s) em 24h`}
            {data.sent_last_24h > 0 && ` · ${data.sent_last_24h} entrega(s) em 24h`}
            {" · "}
            Alertas do agente podem não estar chegando. Verifique Config → Notificações.
          </p>
        </div>
      </div>
    </div>
  );
}
