"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pause,
  Play,
  TrendingUp,
  Loader2,
  Clock,
  AlertTriangle,
  Eye,
  XCircle,
  ArrowUpCircle,
} from "lucide-react";

import { api, type Campaign } from "@/lib/api";
import { formatBRL, formatPercent, formatRoas, formatNumber } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

function metaStatusColor(status: string) {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "#50c878";
    case "PAUSED":
      return "#71717a";
    case "DELETED":
    case "ARCHIVED":
      return "#e85040";
    default:
      return "#f5c542";
  }
}

function metaStatusLabel(status: string) {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "Ativa";
    case "PAUSED":
      return "Pausada";
    case "DELETED":
      return "Excluida";
    case "ARCHIVED":
      return "Arquivada";
    default:
      return status || "Desconhecido";
  }
}

function cpaDot(cpa: number | null | undefined) {
  if (cpa == null) return null;
  let color = "#50c878";
  if (cpa > 70) color = "#e85040";
  else if (cpa >= 50) color = "#f5c542";
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: color }}
      title={`CPA: ${formatBRL(cpa)}`}
    />
  );
}

function frequencyColor(freq: number): string {
  if (freq < 2) return "#50c878";
  if (freq < 3.5) return "#f5c542";
  return "#e85040";
}

function frequencyLabel(freq: number): string {
  if (freq < 2) return "Saudavel";
  if (freq < 3.5) return "Atencao";
  return "Saturado";
}

// ---------------------------------------------------------------------------
// Scaling Recommendations Banner
// ---------------------------------------------------------------------------

function ScalingBanner() {
  const queryClient = useQueryClient();
  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["scalingRules"],
    queryFn: api.getScalingRules,
    refetchInterval: 60000,
  });

  const executeMutation = useMutation({
    mutationFn: (rule: any) => {
      if (rule.action === "pause" || rule.action === "kill") {
        return api.updateCampaignStatus(rule.campaignId || rule.adsetId, "PAUSED");
      }
      if (rule.action === "scale") {
        const newBudget = Math.round((rule.currentBudget || 100) * 1.2 * 100) / 100;
        return api.updateAdsetBudget(rule.adsetId || rule.campaignId, newBudget);
      }
      return Promise.resolve(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scalingRules"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["metaLiveCampaigns"] });
    },
  });

  if (isLoading || !Array.isArray(rules) || rules.length === 0) return null;

  const scaleRules = rules.filter((r: any) => r.action === "scale");
  const watchRules = rules.filter((r: any) => r.action === "watch" || r.action === "observe");
  const killRules = rules.filter(
    (r: any) => r.action === "pause" || r.action === "kill"
  );

  function renderRuleCard(rule: any, color: string, borderColor: string, bgColor: string) {
    const icon =
      rule.action === "scale" ? (
        <ArrowUpCircle className="h-4 w-4" />
      ) : rule.action === "watch" || rule.action === "observe" ? (
        <Eye className="h-4 w-4" />
      ) : (
        <XCircle className="h-4 w-4" />
      );

    const label =
      rule.action === "scale"
        ? "Escalar"
        : rule.action === "watch" || rule.action === "observe"
        ? "Observar"
        : rule.action === "kill"
        ? "Kill"
        : "Pausar";

    return (
      <Card
        key={rule.campaignId || rule.adsetId || rule.name}
        className="border bg-[#111111]"
        style={{ borderColor }}
      >
        <CardContent className="py-3 px-4 space-y-2">
          <div className="flex items-center gap-2">
            <span style={{ color }}>{icon}</span>
            <Badge style={{ backgroundColor: bgColor, color, border: "none" }}>
              {label}
            </Badge>
          </div>
          <p className="text-sm font-medium text-white">
            {rule.campaignName || rule.name || "—"}
          </p>
          <p className="text-xs text-[#999]">{rule.reason || rule.message || ""}</p>
          {(rule.action === "scale" || rule.action === "pause" || rule.action === "kill") && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              style={{ borderColor, color }}
              onClick={() => executeMutation.mutate(rule)}
              disabled={executeMutation.isPending}
            >
              {executeMutation.isPending ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : null}
              Executar
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[#999] uppercase tracking-wide">
        Recomendacoes de Scaling
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {scaleRules.map((r: any) =>
          renderRuleCard(r, "#50c878", "#50c878/40", "#50c878/10")
        )}
        {watchRules.map((r: any) =>
          renderRuleCard(r, "#f5c542", "#f5c542/40", "#f5c542/10")
        )}
        {killRules.map((r: any) =>
          renderRuleCard(r, "#e85040", "#e85040/40", "#e85040/10")
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Campaign Card
// ---------------------------------------------------------------------------

function CampaignCard({
  campaign,
  liveCampaign,
  onPause,
  onActivate,
  onScale,
  isPending,
}: {
  campaign: Campaign;
  liveCampaign?: any;
  onPause: (id: string) => void;
  onActivate: (id: string) => void;
  onScale: (campaign: Campaign) => void;
  isPending: boolean;
}) {
  const liveStatus =
    liveCampaign?.status || liveCampaign?.effective_status || campaign.status;
  const isActive = liveStatus?.toUpperCase() === "ACTIVE";
  const metaId = liveCampaign?.id || campaign.id;

  return (
    <Card className="border-[#1e1e1e] bg-[#111111]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-bold text-white">
            {liveCampaign?.name || campaign.name}
          </CardTitle>
          <Badge
            className="text-white border-none shrink-0"
            style={{ backgroundColor: metaStatusColor(liveStatus) }}
          >
            {metaStatusLabel(liveStatus)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Meta info */}
        <div className="space-y-1 text-sm text-[#999]">
          {liveCampaign?.objective && (
            <p>
              <span className="text-[#666]">Objetivo:</span>{" "}
              <span className="text-[#ccc]">{liveCampaign.objective}</span>
            </p>
          )}
          <p>
            <span className="text-[#666]">Orcamento:</span>{" "}
            <span className="text-[#ccc]">{formatBRL(campaign.dailyBudget)}/dia</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {isActive ? (
            <Button
              variant="outline"
              size="sm"
              className="border-[#e85040]/40 text-[#e85040] hover:bg-[#e85040]/10 hover:text-[#e85040]"
              onClick={() => onPause(metaId)}
              disabled={isPending}
            >
              <Pause className="h-3.5 w-3.5 mr-1" />
              Pausar
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="border-[#50c878]/40 text-[#50c878] hover:bg-[#50c878]/10 hover:text-[#50c878]"
              onClick={() => onActivate(metaId)}
              disabled={isPending}
            >
              <Play className="h-3.5 w-3.5 mr-1" />
              Ativar
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="border-[#5b9bd5]/40 text-[#5b9bd5] hover:bg-[#5b9bd5]/10 hover:text-[#5b9bd5]"
            onClick={() => onScale(campaign)}
            disabled={isPending}
          >
            <TrendingUp className="h-3.5 w-3.5 mr-1" />
            Escalar 20%
          </Button>
        </div>

        {/* Aggregated Metrics from DB */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-[#1e1e1e]">
          <MetricDisplay label="Gasto Total" value={formatBRL(campaign.totalInvestment ?? 0)} />
          <MetricDisplay label="Vendas" value={String(campaign.totalSales ?? 0)} />
          <MetricDisplay
            label="CPA"
            value={campaign.cpa != null ? formatBRL(campaign.cpa) : "—"}
            trailing={cpaDot(campaign.cpa)}
          />
          <MetricDisplay
            label="ROAS"
            value={campaign.roas != null ? formatRoas(campaign.roas) : "—"}
          />
          <MetricDisplay
            label="CTR"
            value={campaign.ctr != null ? formatPercent(campaign.ctr) : "—"}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function MetricDisplay({
  label,
  value,
  trailing,
}: {
  label: string;
  value: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-[#666]">{label}</span>
      <span className="text-sm font-semibold text-[#ccc]">{value}</span>
      {trailing}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create Campaign Dialog
// ---------------------------------------------------------------------------

const OBJECTIVES = [
  { value: "OUTCOME_SALES", label: "Vendas" },
  { value: "OUTCOME_TRAFFIC", label: "Trafego" },
  { value: "OUTCOME_AWARENESS", label: "Reconhecimento" },
];

function CreateCampaignDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("OUTCOME_SALES");
  const [dailyBudget, setDailyBudget] = useState("");
  const [status, setStatus] = useState("PAUSED");

  const mutation = useMutation({
    mutationFn: (data: any) => api.createMetaCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metaLiveCampaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setOpen(false);
      resetForm();
    },
  });

  function resetForm() {
    setName("");
    setObjective("OUTCOME_SALES");
    setDailyBudget("");
    setStatus("PAUSED");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    mutation.mutate({
      name: name.trim(),
      objective,
      daily_budget: Number(dailyBudget) || 0,
      status,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="bg-[#e89b6a] text-[#0a0a0a] font-semibold hover:bg-[#d4864f]">
          <Plus className="h-4 w-4 mr-2" />
          Criar Campanha
        </Button>
      </DialogTrigger>
      <DialogContent className="border-[#1e1e1e] bg-[#111111] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Nova Campanha Meta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[#999]">Nome da Campanha</Label>
            <Input
              placeholder="Ex: CAMP - Prospeccao Frio"
              className="border-[#1e1e1e] bg-[#0a0a0a] text-white placeholder:text-[#555]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#999]">Objetivo</Label>
            <Select value={objective} onValueChange={(v) => v && setObjective(v)}>
              <SelectTrigger className="w-full border-[#1e1e1e] bg-[#0a0a0a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#1e1e1e] bg-[#111111]">
                {OBJECTIVES.map((obj) => (
                  <SelectItem key={obj.value} value={obj.value} className="text-white">
                    {obj.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[#999]">Orcamento Diario R$</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              placeholder="150.00"
              className="border-[#1e1e1e] bg-[#0a0a0a] text-white placeholder:text-[#555]"
              value={dailyBudget}
              onChange={(e) => setDailyBudget(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#999]">Status Inicial</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v)}>
              <SelectTrigger className="w-full border-[#1e1e1e] bg-[#0a0a0a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#1e1e1e] bg-[#111111]">
                <SelectItem value="PAUSED" className="text-white">
                  Pausada
                </SelectItem>
                <SelectItem value="ACTIVE" className="text-white">
                  Ativa
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={mutation.isPending || !name.trim()}
            className="w-full bg-[#e89b6a] text-[#0a0a0a] font-semibold hover:bg-[#d4864f]"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar Campanha na Meta"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Budget Rebalance Section
// ---------------------------------------------------------------------------

function BudgetRebalanceSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["budgetRebalance"],
    queryFn: api.getBudgetRebalance,
    refetchInterval: 60000,
  });

  if (isLoading) return null;

  const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : Array.isArray(data) ? data : [];
  if (suggestions.length === 0) return null;

  return (
    <Card className="border-[#1e1e1e] bg-[#111111]">
      <CardHeader>
        <CardTitle className="text-white">Rebalanceamento de Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1e1e1e] hover:bg-transparent">
                <TableHead className="text-[#999]">AdSet</TableHead>
                <TableHead className="text-right text-[#999]">Budget Atual</TableHead>
                <TableHead className="text-right text-[#999]">Sugerido</TableHead>
                <TableHead className="text-right text-[#999]">Variacao</TableHead>
                <TableHead className="text-[#999]">Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suggestions.map((s: any, idx: number) => {
                const current = Number(s.currentBudget ?? s.current_budget ?? 0);
                const suggested = Number(s.suggestedBudget ?? s.suggested_budget ?? 0);
                const variation = current > 0 ? ((suggested - current) / current) * 100 : 0;
                const isIncrease = variation > 0;

                return (
                  <TableRow
                    key={s.adsetId || idx}
                    className="border-[#1e1e1e] hover:bg-[#1a1a1a]"
                    style={{
                      backgroundColor: isIncrease
                        ? "rgba(80, 200, 120, 0.05)"
                        : variation < 0
                        ? "rgba(232, 80, 64, 0.05)"
                        : undefined,
                    }}
                  >
                    <TableCell className="font-medium text-white">
                      {s.adsetName || s.name || s.adsetId || "—"}
                    </TableCell>
                    <TableCell className="text-right text-[#ccc]">
                      {formatBRL(current)}
                    </TableCell>
                    <TableCell className="text-right text-[#ccc]">
                      {formatBRL(suggested)}
                    </TableCell>
                    <TableCell className="text-right font-semibold" style={{
                      color: isIncrease ? "#50c878" : variation < 0 ? "#e85040" : "#999",
                    }}>
                      {isIncrease ? "+" : ""}{formatPercent(variation)}
                    </TableCell>
                    <TableCell className="text-[#999] text-sm">
                      {s.reason || s.motivo || "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Placement Performance Section
// ---------------------------------------------------------------------------

function PlacementPerformanceSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["placementMetrics"],
    queryFn: () => api.getPlacementMetrics(),
    refetchInterval: 60000,
  });

  if (isLoading) return null;

  const placements = Array.isArray(data?.placements) ? data.placements : Array.isArray(data) ? data : [];
  if (placements.length === 0) return null;

  // Find best/worst CPA
  const cpas = placements
    .map((p: any) => Number(p.cpa ?? 0))
    .filter((c: number) => c > 0);
  const bestCpa = cpas.length > 0 ? Math.min(...cpas) : null;
  const worstCpa = cpas.length > 0 ? Math.max(...cpas) : null;

  const insights = data?.insights || data?.summary || null;

  return (
    <Card className="border-[#1e1e1e] bg-[#111111]">
      <CardHeader>
        <CardTitle className="text-white">Performance por Posicionamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1e1e1e] hover:bg-transparent">
                <TableHead className="text-[#999]">Plataforma</TableHead>
                <TableHead className="text-[#999]">Posicao</TableHead>
                <TableHead className="text-right text-[#999]">CPM</TableHead>
                <TableHead className="text-right text-[#999]">Cliques</TableHead>
                <TableHead className="text-right text-[#999]">Conversoes</TableHead>
                <TableHead className="text-right text-[#999]">CPA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placements.map((p: any, idx: number) => {
                const cpa = Number(p.cpa ?? 0);
                const isBest = bestCpa !== null && cpa === bestCpa && cpa > 0;
                const isWorst = worstCpa !== null && cpa === worstCpa && cpa > 0;

                return (
                  <TableRow key={idx} className="border-[#1e1e1e] hover:bg-[#1a1a1a]">
                    <TableCell className="text-white font-medium">
                      {p.platform || p.publisher_platform || "—"}
                    </TableCell>
                    <TableCell className="text-[#ccc]">
                      {p.position || p.platform_position || "—"}
                    </TableCell>
                    <TableCell className="text-right text-[#ccc]">
                      {formatBRL(Number(p.cpm ?? 0))}
                    </TableCell>
                    <TableCell className="text-right text-[#ccc]">
                      {formatNumber(Number(p.clicks ?? 0))}
                    </TableCell>
                    <TableCell className="text-right text-[#ccc]">
                      {formatNumber(Number(p.conversions ?? p.purchases ?? 0))}
                    </TableCell>
                    <TableCell
                      className="text-right font-semibold"
                      style={{
                        color: isBest ? "#50c878" : isWorst ? "#e85040" : "#ccc",
                      }}
                    >
                      {cpa > 0 ? formatBRL(cpa) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {insights && typeof insights === "string" && (
          <p className="text-sm text-[#999] border-t border-[#1e1e1e] pt-3">{insights}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Frequency by AdSet Section
// ---------------------------------------------------------------------------

function FrequencyByAdsetSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["frequencyByAdset"],
    queryFn: api.getFrequencyByAdset,
    refetchInterval: 60000,
  });

  if (isLoading) return null;

  const adsets = Array.isArray(data?.adsets) ? data.adsets : Array.isArray(data) ? data : [];
  if (adsets.length === 0) return null;

  return (
    <Card className="border-[#1e1e1e] bg-[#111111]">
      <CardHeader>
        <CardTitle className="text-white">Frequencia por AdSet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1e1e1e] hover:bg-transparent">
                <TableHead className="text-[#999]">AdSet</TableHead>
                <TableHead className="text-right text-[#999]">Frequencia</TableHead>
                <TableHead className="text-right text-[#999]">Impressoes</TableHead>
                <TableHead className="text-right text-[#999]">Alcance</TableHead>
                <TableHead className="text-[#999]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adsets.map((a: any, idx: number) => {
                const freq = Number(a.frequency ?? 0);
                return (
                  <TableRow key={a.adsetId || idx} className="border-[#1e1e1e] hover:bg-[#1a1a1a]">
                    <TableCell className="font-medium text-white">
                      {a.adsetName || a.name || "—"}
                    </TableCell>
                    <TableCell
                      className="text-right font-semibold"
                      style={{ color: frequencyColor(freq) }}
                    >
                      {freq.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-[#ccc]">
                      {formatNumber(Number(a.impressions ?? 0))}
                    </TableCell>
                    <TableCell className="text-right text-[#ccc]">
                      {formatNumber(Number(a.reach ?? 0))}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="border-none text-white"
                        style={{ backgroundColor: frequencyColor(freq) }}
                      >
                        {frequencyLabel(freq)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Action Log Timeline
// ---------------------------------------------------------------------------

function ActionLogTimeline() {
  const { data, isLoading } = useQuery({
    queryKey: ["actionLog"],
    queryFn: () => api.getActionLog(20),
    refetchInterval: 30000,
  });

  if (isLoading) return null;

  const logs = Array.isArray(data?.logs) ? data.logs : Array.isArray(data) ? data : [];
  if (logs.length === 0) return null;

  return (
    <Card className="border-[#1e1e1e] bg-[#111111]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Clock className="h-5 w-5 text-[#e89b6a]" />
          Log de Acoes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.map((log: any, idx: number) => {
            const time = log.timestamp || log.createdAt || log.time || "";
            const formattedTime = time
              ? new Date(time).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—";
            const message = log.message || log.description || log.action || "—";

            return (
              <div key={log.id || idx} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-[#e89b6a] mt-1.5" />
                  {idx < logs.length - 1 && (
                    <div className="w-px h-full min-h-[20px] bg-[#1e1e1e]" />
                  )}
                </div>
                <div className="flex items-baseline gap-2 pb-2">
                  <span className="text-xs font-mono text-[#e89b6a] shrink-0">
                    {formattedTime}
                  </span>
                  <span className="text-sm text-[#ccc]">{message}</span>
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
// Main Export
// ---------------------------------------------------------------------------

export default function CampaignsTab() {
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: api.getCampaigns,
    refetchInterval: 60000,
  });

  const { data: liveCampaigns = [] } = useQuery({
    queryKey: ["metaLiveCampaigns"],
    queryFn: api.getMetaLiveCampaigns,
    refetchInterval: 60000,
  });

  const pauseMutation = useMutation({
    mutationFn: (id: string) => api.updateCampaignStatus(id, "PAUSED"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metaLiveCampaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => api.updateCampaignStatus(id, "ACTIVE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metaLiveCampaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });

  const scaleMutation = useMutation({
    mutationFn: (campaign: Campaign) => {
      const newBudget = Math.round(campaign.dailyBudget * 1.2 * 100) / 100;
      return api.updateAdsetBudget(campaign.id, newBudget);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metaLiveCampaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });

  const isPending =
    pauseMutation.isPending || activateMutation.isPending || scaleMutation.isPending;

  // Merge live data with DB campaigns
  const liveCampaignMap = new Map<string, any>();
  liveCampaigns.forEach((lc: any) => {
    liveCampaignMap.set(lc.id, lc);
    liveCampaignMap.set(lc.name, lc);
  });

  return (
    <div className="space-y-6">
      {/* ---- Scaling Recommendations ---- */}
      <ScalingBanner />

      {/* ---- Header with Create Button ---- */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Campanhas</h2>
        <CreateCampaignDialog />
      </div>

      {/* ---- Campaign Cards Grid ---- */}
      {loadingCampaigns ? (
        <p className="text-[#999] text-center py-12">Carregando campanhas...</p>
      ) : campaigns.length === 0 && liveCampaigns.length === 0 ? (
        <Card className="border-[#1e1e1e] bg-[#111111]">
          <CardContent className="py-12 text-center text-[#999]">
            Nenhuma campanha encontrada. Crie uma campanha para comecar.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c) => (
            <CampaignCard
              key={c.id}
              campaign={c}
              liveCampaign={liveCampaignMap.get(c.id) || liveCampaignMap.get(c.name)}
              onPause={(id) => pauseMutation.mutate(id)}
              onActivate={(id) => activateMutation.mutate(id)}
              onScale={(camp) => scaleMutation.mutate(camp)}
              isPending={isPending}
            />
          ))}
          {/* Show live-only campaigns not in DB */}
          {liveCampaigns
            .filter(
              (lc: any) => !campaigns.some((c) => c.id === lc.id || c.name === lc.name)
            )
            .map((lc: any) => (
              <CampaignCard
                key={lc.id}
                campaign={{
                  id: lc.id,
                  name: lc.name,
                  type: lc.objective || "",
                  audience: null,
                  dailyBudget: Number(lc.daily_budget) / 100 || 0,
                  startDate: lc.start_time || "",
                  status: lc.status || lc.effective_status || "",
                  createdAt: lc.created_time || "",
                  updatedAt: lc.updated_time || "",
                  metrics: [],
                  creatives: [],
                }}
                liveCampaign={lc}
                onPause={(id) => pauseMutation.mutate(id)}
                onActivate={(id) => activateMutation.mutate(id)}
                onScale={(camp) => scaleMutation.mutate(camp)}
                isPending={isPending}
              />
            ))}
        </div>
      )}

      {/* ---- Budget Rebalance ---- */}
      <BudgetRebalanceSection />

      {/* ---- Placement Performance ---- */}
      <PlacementPerformanceSection />

      {/* ---- Frequency by AdSet ---- */}
      <FrequencyByAdsetSection />

      {/* ---- Action Log Timeline ---- */}
      <ActionLogTimeline />
    </div>
  );
}
