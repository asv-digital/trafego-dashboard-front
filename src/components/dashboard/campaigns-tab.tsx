"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { api, type Campaign, type CreateCampaignInput } from "@/lib/api";
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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUSES = ["Ativa", "Pausada", "Matou", "Escalando", "Aprendizado"] as const;
type CampaignStatus = (typeof STATUSES)[number];

const STATUS_COLORS: Record<CampaignStatus, string> = {
  Ativa: "#50c878",
  Pausada: "#71717a",
  Matou: "#e85040",
  Escalando: "#5b9bd5",
  Aprendizado: "#f5c542",
};

const TYPES = ["Remarketing", "Prospecção", "Escala"] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusBadge(status: string) {
  const color = STATUS_COLORS[status as CampaignStatus] ?? "#71717a";
  return (
    <Badge
      className="text-white border-none"
      style={{ backgroundColor: color }}
    >
      {status}
    </Badge>
  );
}

function typeBadge(type: string) {
  return (
    <Badge variant="outline" className="text-[#e89b6a] border-[#e89b6a]/40">
      {type}
    </Badge>
  );
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

function nextStatus(current: string): CampaignStatus {
  const idx = STATUSES.indexOf(current as CampaignStatus);
  if (idx === -1) return STATUSES[0];
  return STATUSES[(idx + 1) % STATUSES.length];
}

// ---------------------------------------------------------------------------
// Campaign Card
// ---------------------------------------------------------------------------

function CampaignCard({
  campaign,
  onStatusChange,
}: {
  campaign: Campaign;
  onStatusChange: (id: string, status: string) => void;
}) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-bold text-zinc-100">
            {campaign.name}
          </CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            {typeBadge(campaign.type)}
            {statusBadge(campaign.status)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Status cycle button */}
        <Button
          variant="outline"
          size="sm"
          className="text-xs border-zinc-700 hover:border-[#e89b6a] hover:text-[#e89b6a]"
          onClick={() =>
            onStatusChange(campaign.id, nextStatus(campaign.status))
          }
        >
          Mudar para: {nextStatus(campaign.status)}
        </Button>

        {/* Audience & Budget */}
        {campaign.audience && (
          <p className="text-sm text-zinc-400">
            <span className="text-zinc-500">Público:</span> {campaign.audience}
          </p>
        )}
        <p className="text-sm text-zinc-400">
          <span className="text-zinc-500">Orçamento:</span>{" "}
          {formatBRL(campaign.dailyBudget)}/dia
        </p>

        {/* Aggregated Metrics */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-zinc-800">
          <Metric label="Gasto Total" value={formatBRL(campaign.totalInvestment ?? 0)} />
          <Metric label="Vendas" value={String(campaign.totalSales ?? 0)} />
          <Metric
            label="CPA"
            value={campaign.cpa != null ? formatBRL(campaign.cpa) : "—"}
            trailing={cpaDot(campaign.cpa)}
          />
          <Metric
            label="ROAS"
            value={campaign.roas != null ? formatRoas(campaign.roas) : "—"}
          />
          <Metric
            label="CTR"
            value={campaign.ctr != null ? formatPercent(campaign.ctr) : "—"}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
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
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-sm font-semibold text-zinc-200">{value}</span>
      {trailing}
    </div>
  );
}

// ---------------------------------------------------------------------------
// New Campaign Form
// ---------------------------------------------------------------------------

const INITIAL_FORM: CreateCampaignInput = {
  name: "",
  type: "Prospecção",
  audience: "",
  dailyBudget: 0,
  startDate: new Date().toISOString().slice(0, 10),
  status: "Ativa",
};

function NewCampaignForm() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateCampaignInput>({ ...INITIAL_FORM });

  const mutation = useMutation({
    mutationFn: (data: CreateCampaignInput) => api.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setForm({ ...INITIAL_FORM });
    },
  });

  function set<K extends keyof CreateCampaignInput>(
    key: K,
    value: CreateCampaignInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    mutation.mutate(form);
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">Nova Campanha</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="camp-name" className="text-zinc-400">
              Nome
            </Label>
            <Input
              id="camp-name"
              placeholder="Nome da campanha"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
          </div>

          {/* Tipo */}
          <div className="space-y-1.5">
            <Label className="text-zinc-400">Tipo</Label>
            <Select value={form.type} onValueChange={(val) => val && set("type", val)}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Público-alvo */}
          <div className="space-y-1.5">
            <Label htmlFor="camp-audience" className="text-zinc-400">
              Público-alvo
            </Label>
            <Input
              id="camp-audience"
              placeholder="Ex: Mulheres 25-45"
              value={form.audience ?? ""}
              onChange={(e) => set("audience", e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
          </div>

          {/* Orçamento */}
          <div className="space-y-1.5">
            <Label htmlFor="camp-budget" className="text-zinc-400">
              Orçamento diário R$
            </Label>
            <Input
              id="camp-budget"
              type="number"
              min={0}
              step={0.01}
              value={form.dailyBudget || ""}
              onChange={(e) => set("dailyBudget", Number(e.target.value))}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
          </div>

          {/* Data de início */}
          <div className="space-y-1.5">
            <Label htmlFor="camp-start" className="text-zinc-400">
              Data de início
            </Label>
            <Input
              id="camp-start"
              type="date"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
          </div>

          {/* Status inicial */}
          <div className="space-y-1.5">
            <Label className="text-zinc-400">Status inicial</Label>
            <Select
              value={form.status ?? "Ativa"}
              onValueChange={(val) => val && set("status", val)}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["Ativa", "Aprendizado", "Pausada"] as const).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
            <Button
              type="submit"
              disabled={mutation.isPending || !form.name.trim()}
              className="bg-[#e89b6a] hover:bg-[#d88a5a] text-zinc-950 font-semibold"
            >
              <Plus className="h-4 w-4 mr-1" />
              {mutation.isPending ? "Criando..." : "Criar Campanha"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

export default function CampaignsTab() {
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: api.getCampaigns,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateCampaign(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });

  function handleStatusChange(id: string, status: string) {
    updateMutation.mutate({ id, status });
  }

  return (
    <div className="space-y-6">
      {/* Campaign Cards Grid */}
      {isLoading ? (
        <p className="text-zinc-500 text-center py-12">Carregando campanhas...</p>
      ) : campaigns.length === 0 ? (
        <p className="text-zinc-500 text-center py-12">
          Nenhuma campanha cadastrada.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c) => (
            <CampaignCard
              key={c.id}
              campaign={c}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* New Campaign Form */}
      <NewCampaignForm />
    </div>
  );
}
