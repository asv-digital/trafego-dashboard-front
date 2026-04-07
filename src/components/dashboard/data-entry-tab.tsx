"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

import { api, Campaign, MetricEntry, CreateMetricInput } from "@/lib/api";
import { formatBRL, formatNumber, formatPercent, formatDate } from "@/lib/format";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function safeDivide(numerator: number, denominator: number): number | null {
  if (!denominator || !isFinite(numerator / denominator)) return null;
  return numerator / denominator;
}

export function DataEntryTab() {
  const queryClient = useQueryClient();

  // ── Form state ──────────────────────────────────────────────
  const [date, setDate] = useState(todayISO());
  const [campaignId, setCampaignId] = useState("");
  const [adSet, setAdSet] = useState("");
  const [investimento, setInvestimento] = useState("");
  const [impressoes, setImpressoes] = useState("");
  const [cliques, setCliques] = useState("");
  const [vendas, setVendas] = useState("");
  const [frequencia, setFrequencia] = useState("");
  const [hookRate, setHookRate] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // ── Queries ─────────────────────────────────────────────────
  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: api.getCampaigns,
  });

  const { data: metrics = [] } = useQuery<MetricEntry[]>({
    queryKey: ["metrics"],
    queryFn: () => api.getMetrics(),
  });

  // ── Mutations ───────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: api.createMetric,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteMetric,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
  });

  function resetForm() {
    setDate(todayISO());
    setCampaignId("");
    setAdSet("");
    setInvestimento("");
    setImpressoes("");
    setCliques("");
    setVendas("");
    setFrequencia("");
    setHookRate("");
    setObservacoes("");
  }

  // ── Auto-calculated values ──────────────────────────────────
  const inv = parseFloat(investimento) || 0;
  const imp = parseFloat(impressoes) || 0;
  const cli = parseFloat(cliques) || 0;
  const ven = parseFloat(vendas) || 0;

  const cpm = safeDivide(inv, imp) !== null ? (inv / imp) * 1000 : null;
  const cpc = safeDivide(inv, cli);
  const ctr = safeDivide(cli, imp) !== null ? (cli / imp) * 100 : null;
  const cpa = safeDivide(inv, ven);
  const roas = safeDivide(ven * 97, inv);

  function fmt(value: number | null, type: "brl" | "percent" | "number") {
    if (value === null) return "\u2014";
    if (type === "brl") return formatBRL(value);
    if (type === "percent") return formatPercent(value);
    return formatNumber(value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: CreateMetricInput = {
      date,
      campaignId,
      adSet,
      investment: inv,
      impressions: imp,
      clicks: cli,
      sales: ven,
      frequency: frequencia ? parseFloat(frequencia) : undefined,
      hookRate: hookRate ? parseFloat(hookRate) : undefined,
      observations: observacoes || undefined,
    };

    createMutation.mutate(payload);
  }

  // ── Row-level computed metrics ──────────────────────────────
  function rowCpm(m: MetricEntry) {
    const v = safeDivide(m.investment, m.impressions);
    return v !== null ? formatBRL((m.investment / m.impressions) * 1000) : "\u2014";
  }
  function rowCpc(m: MetricEntry) {
    const v = safeDivide(m.investment, m.clicks);
    return v !== null ? formatBRL(v) : "\u2014";
  }
  function rowCtr(m: MetricEntry) {
    const v = safeDivide(m.clicks, m.impressions);
    return v !== null ? formatPercent((m.clicks / m.impressions) * 100) : "\u2014";
  }
  function rowCpa(m: MetricEntry) {
    const v = safeDivide(m.investment, m.sales);
    return v !== null ? formatBRL(v) : "\u2014";
  }
  function rowRoas(m: MetricEntry) {
    const v = safeDivide(m.sales * 97, m.investment);
    return v !== null ? `${v.toFixed(2)}x` : "\u2014";
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Metric Entry Form ─────────────────────────────── */}
      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-100">
            Registrar Métricas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-zinc-300">
                  Data
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border-zinc-700 bg-zinc-900 text-zinc-100"
                  required
                />
              </div>

              {/* Campaign */}
              <div className="space-y-2">
                <Label htmlFor="campaign" className="text-zinc-300">
                  Campanha
                </Label>
                <Select value={campaignId} onValueChange={(v) => v && setCampaignId(v)}>
                  <SelectTrigger className="border-zinc-700 bg-zinc-900 text-zinc-100">
                    <SelectValue placeholder="Selecione uma campanha" />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-700 bg-zinc-900">
                    {campaigns.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.id}
                        className="text-zinc-100"
                      >
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ad Set */}
              <div className="space-y-2">
                <Label htmlFor="adSet" className="text-zinc-300">
                  Conjunto de Anúncios
                </Label>
                <Input
                  id="adSet"
                  value={adSet}
                  onChange={(e) => setAdSet(e.target.value)}
                  placeholder="Ex: Conjunto 01"
                  className="border-zinc-700 bg-zinc-900 text-zinc-100"
                />
              </div>

              {/* Investimento */}
              <div className="space-y-2">
                <Label htmlFor="investimento" className="text-zinc-300">
                  Investimento R$
                </Label>
                <Input
                  id="investimento"
                  type="number"
                  step="0.01"
                  min="0"
                  value={investimento}
                  onChange={(e) => setInvestimento(e.target.value)}
                  placeholder="0,00"
                  className="border-zinc-700 bg-zinc-900 text-zinc-100"
                  required
                />
              </div>

              {/* Impressoes */}
              <div className="space-y-2">
                <Label htmlFor="impressoes" className="text-zinc-300">
                  Impressões
                </Label>
                <Input
                  id="impressoes"
                  type="number"
                  min="0"
                  value={impressoes}
                  onChange={(e) => setImpressoes(e.target.value)}
                  placeholder="0"
                  className="border-zinc-700 bg-zinc-900 text-zinc-100"
                  required
                />
              </div>

              {/* Cliques */}
              <div className="space-y-2">
                <Label htmlFor="cliques" className="text-zinc-300">
                  Cliques no link
                </Label>
                <Input
                  id="cliques"
                  type="number"
                  min="0"
                  value={cliques}
                  onChange={(e) => setCliques(e.target.value)}
                  placeholder="0"
                  className="border-zinc-700 bg-zinc-900 text-zinc-100"
                  required
                />
              </div>

              {/* Vendas */}
              <div className="space-y-2">
                <Label htmlFor="vendas" className="text-zinc-300">
                  Vendas
                </Label>
                <Input
                  id="vendas"
                  type="number"
                  min="0"
                  value={vendas}
                  onChange={(e) => setVendas(e.target.value)}
                  placeholder="0"
                  className="border-zinc-700 bg-zinc-900 text-zinc-100"
                  required
                />
              </div>

              {/* Frequencia */}
              <div className="space-y-2">
                <Label htmlFor="frequencia" className="text-zinc-300">
                  Frequência{" "}
                  <span className="text-zinc-500">(opcional)</span>
                </Label>
                <Input
                  id="frequencia"
                  type="number"
                  step="0.01"
                  min="0"
                  value={frequencia}
                  onChange={(e) => setFrequencia(e.target.value)}
                  placeholder="0,00"
                  className="border-zinc-700 bg-zinc-900 text-zinc-100"
                />
              </div>

              {/* Hook Rate */}
              <div className="space-y-2">
                <Label htmlFor="hookRate" className="text-zinc-300">
                  Hook Rate %{" "}
                  <span className="text-zinc-500">(opcional)</span>
                </Label>
                <Input
                  id="hookRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={hookRate}
                  onChange={(e) => setHookRate(e.target.value)}
                  placeholder="0,00"
                  className="border-zinc-700 bg-zinc-900 text-zinc-100"
                />
              </div>
            </div>

            {/* Observacoes */}
            <div className="space-y-2">
              <Label htmlFor="observacoes" className="text-zinc-300">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Anotações sobre o dia, testes realizados..."
                className="border-zinc-700 bg-zinc-900 text-zinc-100"
                rows={3}
              />
            </div>

            {/* ── Auto-calculated fields ────────────────────── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { label: "CPM", value: fmt(cpm, "brl") },
                { label: "CPC", value: fmt(cpc, "brl") },
                { label: "CTR", value: fmt(ctr, "percent") },
                { label: "CPA", value: fmt(cpa, "brl") },
                { label: "ROAS", value: roas !== null ? `${roas.toFixed(2)}x` : "\u2014" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg border border-[#e89b6a]/20 bg-[#e89b6a]/5 p-3 text-center"
                >
                  <p className="text-xs font-medium text-[#e89b6a]">
                    {label}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-zinc-100">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-[#e89b6a] text-zinc-950 hover:bg-[#e89b6a]/90 sm:w-auto"
            >
              {createMutation.isPending ? "Salvando..." : "Registrar Métrica"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Agent Integration Card (placeholder) ──────────── */}
      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-zinc-100">
            Integração com Agente
          </CardTitle>
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-400">
            Em breve
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-zinc-400">
            Configure seu agente para alimentar esta dashboard automaticamente
            via Meta Ads API + Kirvano API
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-zinc-500">Meta Ads Access Token</Label>
              <Input
                disabled
                placeholder="Disponível em breve"
                className="border-zinc-800 bg-zinc-900/50 text-zinc-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-500">Meta Ads Account ID</Label>
              <Input
                disabled
                placeholder="Disponível em breve"
                className="border-zinc-800 bg-zinc-900/50 text-zinc-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-500">Kirvano API Key</Label>
              <Input
                disabled
                placeholder="Disponível em breve"
                className="border-zinc-800 bg-zinc-900/50 text-zinc-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Metrics Table ─────────────────────────────────── */}
      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-100">
            Métricas Registradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Data</TableHead>
                  <TableHead className="text-zinc-400">Campanha</TableHead>
                  <TableHead className="text-zinc-400">Conjunto</TableHead>
                  <TableHead className="text-right text-zinc-400">
                    Investimento
                  </TableHead>
                  <TableHead className="text-right text-zinc-400">
                    Impressões
                  </TableHead>
                  <TableHead className="text-right text-zinc-400">
                    Cliques
                  </TableHead>
                  <TableHead className="text-right text-zinc-400">
                    Vendas
                  </TableHead>
                  <TableHead className="text-right text-zinc-400">
                    CPM
                  </TableHead>
                  <TableHead className="text-right text-zinc-400">
                    CPC
                  </TableHead>
                  <TableHead className="text-right text-zinc-400">
                    CTR
                  </TableHead>
                  <TableHead className="text-right text-zinc-400">
                    CPA
                  </TableHead>
                  <TableHead className="text-right text-zinc-400">
                    ROAS
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.length === 0 ? (
                  <TableRow className="border-zinc-800">
                    <TableCell
                      colSpan={13}
                      className="py-8 text-center text-zinc-500"
                    >
                      Nenhuma métrica registrada ainda.
                    </TableCell>
                  </TableRow>
                ) : (
                  metrics.map((m) => (
                    <TableRow
                      key={m.id}
                      className="border-zinc-800 hover:bg-zinc-900/50"
                    >
                      <TableCell className="text-zinc-300">
                        {formatDate(m.date)}
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        {m.campaign?.name ?? "\u2014"}
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        {m.adSet || "\u2014"}
                      </TableCell>
                      <TableCell className="text-right text-zinc-300">
                        {formatBRL(m.investment)}
                      </TableCell>
                      <TableCell className="text-right text-zinc-300">
                        {formatNumber(m.impressions)}
                      </TableCell>
                      <TableCell className="text-right text-zinc-300">
                        {formatNumber(m.clicks)}
                      </TableCell>
                      <TableCell className="text-right text-zinc-300">
                        {formatNumber(m.sales)}
                      </TableCell>
                      <TableCell className="text-right text-zinc-300">
                        {rowCpm(m)}
                      </TableCell>
                      <TableCell className="text-right text-zinc-300">
                        {rowCpc(m)}
                      </TableCell>
                      <TableCell className="text-right text-zinc-300">
                        {rowCtr(m)}
                      </TableCell>
                      <TableCell className="text-right text-zinc-300">
                        {rowCpa(m)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-[#e89b6a]">
                        {rowRoas(m)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-red-400"
                          onClick={() => deleteMutation.mutate(m.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
