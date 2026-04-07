"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pause,
  Play,
  TrendingUp,
  Loader2,
} from "lucide-react";

import { api, type Campaign } from "@/lib/api";
import { formatBRL, formatPercent, formatRoas } from "@/lib/format";
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
  const liveStatus = liveCampaign?.status || liveCampaign?.effective_status || campaign.status;
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
            value={campaign.cpa != null ? formatBRL(campaign.cpa) : "\u2014"}
            trailing={cpaDot(campaign.cpa)}
          />
          <MetricDisplay
            label="ROAS"
            value={campaign.roas != null ? formatRoas(campaign.roas) : "\u2014"}
          />
          <MetricDisplay
            label="CTR"
            value={campaign.ctr != null ? formatPercent(campaign.ctr) : "\u2014"}
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
                <SelectItem value="PAUSED" className="text-white">Pausada</SelectItem>
                <SelectItem value="ACTIVE" className="text-white">Ativa</SelectItem>
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

  const isPending = pauseMutation.isPending || activateMutation.isPending || scaleMutation.isPending;

  // Merge live data with DB campaigns
  const liveCampaignMap = new Map<string, any>();
  liveCampaigns.forEach((lc: any) => {
    liveCampaignMap.set(lc.id, lc);
    liveCampaignMap.set(lc.name, lc);
  });

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Campanhas</h2>
        <CreateCampaignDialog />
      </div>

      {/* Campaign Cards Grid */}
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
            .filter((lc: any) => !campaigns.some((c) => c.id === lc.id || c.name === lc.name))
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
    </div>
  );
}
