"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Pause,
  Play,
  Heart,
  TrendingDown,
  XCircle,
  Archive,
  FlaskConical,
  Clock,
  Plus,
  Trophy,
} from "lucide-react";

import { api, type Creative } from "@/lib/api";
import { formatBRL, formatPercent } from "@/lib/format";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cpaColor(value: number) {
  if (value < 50) return "#50c878";
  if (value <= 70) return "#f5c542";
  return "#e85040";
}

function daysColor(days: number) {
  if (days < 14) return "#50c878";
  if (days <= 21) return "#f5c542";
  return "#e85040";
}

function stageBadge(stage: string) {
  switch (stage) {
    case "healthy":
      return (
        <Badge className="bg-[#50c878]/20 text-[#50c878] border-[#50c878]/30">
          Saudavel
        </Badge>
      );
    case "declining":
      return (
        <Badge className="bg-[#f5c542]/20 text-[#f5c542] border-[#f5c542]/30">
          Declinando
        </Badge>
      );
    case "exhausted":
      return (
        <Badge className="bg-[#e85040]/20 text-[#e85040] border-[#e85040]/30">
          Esgotado
        </Badge>
      );
    case "reserve":
      return (
        <Badge className="bg-[#71717a]/20 text-[#999] border-[#71717a]/30">
          Reserva
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[#999]">
          {stage}
        </Badge>
      );
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "Ativo":
      return (
        <Badge className="bg-[#50c878]/20 text-[#50c878] border-[#50c878]/30">
          Ativo
        </Badge>
      );
    case "Pausado":
      return (
        <Badge className="bg-[#71717a]/20 text-[#999] border-[#71717a]/30">
          Pausado
        </Badge>
      );
    case "Saturado":
      return (
        <Badge className="bg-[#e85040]/20 text-[#e85040] border-[#e85040]/30">
          Saturado
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[#999]">
          {status}
        </Badge>
      );
  }
}

function getRecommendation(creative: Creative): string | null {
  if (creative.cpa != null && creative.cpa > 70) {
    return "Trocar criativo — CPA acima de R$70";
  }
  if ((creative.daysActive ?? 0) > 21) {
    return "Trocar criativo — Mais de 21 dias ativo";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Creative Pipeline Summary
// ---------------------------------------------------------------------------

function PipelineSummary() {
  const { data: lifecycle, isLoading } = useQuery({
    queryKey: ["creativeLifecycle"],
    queryFn: () => api.getCreativeLifecycle(),
    refetchInterval: 60000,
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

  // Backend /creatives/lifecycle retorna { summary: { total_active, healthy, declining, exhausted, in_reserve, status, message }, creatives, production_queue }
  const summary = lifecycle?.summary ?? {};
  const healthy = summary.healthy ?? 0;
  const declining = summary.declining ?? 0;
  const exhausted = summary.exhausted ?? 0;
  const reserve = summary.in_reserve ?? 0;

  const pipelineCards = [
    { label: "Saudaveis", count: healthy, color: "#50c878", icon: Heart },
    { label: "Declinando", count: declining, color: "#f5c542", icon: TrendingDown },
    { label: "Esgotados", count: exhausted, color: "#e85040", icon: XCircle },
    { label: "Reserva", count: reserve, color: "#71717a", icon: Archive },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {pipelineCards.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.label} className="border-[#1e1e1e] bg-[#111111]">
              <CardContent className="flex items-center gap-3 p-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${p.color}15` }}
                >
                  <Icon size={20} style={{ color: p.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: p.color }}>
                    {p.count}
                  </p>
                  <p className="text-xs text-[#999]">{p.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {reserve === 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-[#e85040]/30 bg-[#e85040]/10 px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-[#e85040]" />
          <p className="text-sm font-medium text-[#e85040]">
            ZERO criativos em reserva. Produzir {Math.max(3, exhausted + declining)} criativos URGENTE.
          </p>
        </div>
      )}

      {reserve > 0 && declining > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-[#f5c542]/30 bg-[#f5c542]/10 px-4 py-3">
          <Clock className="h-5 w-5 shrink-0 text-[#f5c542]" />
          <p className="text-sm text-[#f5c542]">
            {declining} criativo(s) declinando. Preparar substituicao com os {reserve} em reserva.
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Creative Lifecycle Cards
// ---------------------------------------------------------------------------

function LifecycleCards() {
  const { data: lifecycle, isLoading } = useQuery({
    queryKey: ["creativeLifecycle"],
    queryFn: () => api.getCreativeLifecycle(),
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-52 animate-pulse border-[#1e1e1e] bg-[#111111]" />
        ))}
      </div>
    );
  }

  const creatives = lifecycle?.creatives ?? [];

  if (creatives.length === 0) {
    return (
      <Card className="border-[#1e1e1e] bg-[#111111]">
        <CardContent className="py-8 text-center text-[#999]">
          Nenhum dado de ciclo de vida disponivel.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Backend /creatives/lifecycle retorna campos snake_case:
          days_active, initial_ctr, current_ctr, current_cpa, current_hook_rate,
          estimated_days_remaining, lifecycle_stage */}
      {creatives.map((c: any) => {
        const days = c.days_active ?? c.daysActive ?? 0;
        const ctrPrev = c.initial_ctr ?? c.ctrPrevious ?? null;
        const ctrCurr = c.current_ctr ?? c.ctr ?? null;
        const cpa = c.current_cpa ?? c.cpa ?? null;
        const hookRate = c.current_hook_rate ?? c.hookRate ?? null;
        const daysRemaining = c.estimated_days_remaining ?? c.daysRemaining ?? null;
        const stage = c.lifecycle_stage ?? c.stage ?? "healthy";
        const ctrChange =
          ctrPrev && ctrCurr && ctrPrev > 0
            ? ((ctrCurr - ctrPrev) / ctrPrev) * 100
            : null;

        return (
          <Card key={c.id ?? c.name} className="border-[#1e1e1e] bg-[#111111]">
            <CardContent className="space-y-3 p-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{c.name}</span>
                  <Badge variant="outline" className="text-[#e89b6a] border-[#e89b6a]/40 text-xs">
                    {c.type}
                  </Badge>
                </div>
                {stageBadge(stage)}
              </div>

              {/* Days active */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#999]">Dias ativo:</span>
                <Badge
                  className="text-xs"
                  style={{
                    backgroundColor: `${daysColor(days)}20`,
                    color: daysColor(days),
                    borderColor: `${daysColor(days)}40`,
                  }}
                >
                  {days} dias
                </Badge>
              </div>

              {/* CPA */}
              {cpa != null && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#999]">CPA:</span>
                  <span className="text-sm font-semibold" style={{ color: cpaColor(cpa) }}>
                    {formatBRL(cpa)}
                  </span>
                </div>
              )}

              {/* CTR change */}
              {ctrPrev != null && ctrCurr != null && ctrChange != null && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#999]">CTR:</span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: ctrChange < 0 ? "#e85040" : "#50c878" }}
                  >
                    {formatPercent(ctrPrev)} &rarr; {formatPercent(ctrCurr)} (
                    {ctrChange < 0 ? "\u2193" : "\u2191"}
                    {Math.abs(ctrChange).toFixed(0)}%)
                  </span>
                </div>
              )}

              {/* Hook Rate */}
              {hookRate != null && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#999]">Hook Rate:</span>
                  <span className="text-sm text-[#ccc]">{formatPercent(hookRate)}</span>
                </div>
              )}

              {/* Days remaining */}
              {daysRemaining != null && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#999]">Dias restantes estimados:</span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: daysRemaining < 5 ? "#e85040" : "#ccc" }}
                  >
                    ~{daysRemaining} dias
                  </span>
                </div>
              )}

              {/* Recommendation */}
              {c.recommendation && (
                <p className="text-xs italic text-[#666]">{c.recommendation}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Creative Ranking Table
// ---------------------------------------------------------------------------

function CreativeRankingTable() {
  const queryClient = useQueryClient();

  const { data: creatives, isLoading } = useQuery({
    queryKey: ["creatives"],
    queryFn: () => api.getCreatives(),
    refetchInterval: 60000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Creative> }) =>
      api.updateCreative(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creatives"] });
    },
  });

  if (isLoading) {
    return <Card className="h-40 animate-pulse border-[#1e1e1e] bg-[#111111]" />;
  }

  const sorted = [...(creatives ?? [])].sort((a, b) => {
    if (a.cpa == null && b.cpa == null) return 0;
    if (a.cpa == null) return 1;
    if (b.cpa == null) return -1;
    return a.cpa - b.cpa;
  });

  return (
    <Card className="border-[#1e1e1e] bg-[#111111]">
      <CardHeader>
        <CardTitle className="text-white">Ranking de Criativos por CPA</CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="py-8 text-center text-[#999]">
            Nenhum criativo encontrado. O agente ainda nao sincronizou criativos da Meta.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#1e1e1e] hover:bg-transparent">
                  <TableHead className="text-[#999]">#</TableHead>
                  <TableHead className="text-[#999]">Nome</TableHead>
                  <TableHead className="text-[#999]">Tipo</TableHead>
                  <TableHead className="text-[#999]">Status</TableHead>
                  <TableHead className="text-[#999]">Campanha</TableHead>
                  <TableHead className="text-right text-[#999]">CTR</TableHead>
                  <TableHead className="text-right text-[#999]">Hook Rate</TableHead>
                  <TableHead className="text-right text-[#999]">CPA</TableHead>
                  <TableHead className="text-center text-[#999]">Dias Ativo</TableHead>
                  <TableHead className="text-[#999]">Recomendacao</TableHead>
                  <TableHead className="text-[#999]">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((c, idx) => {
                  const showLifetimeAlert =
                    c.lifetimeAlert === true || (c.daysActive ?? 0) > 21;
                  const recommendation = getRecommendation(c);
                  const isActive = c.status === "Ativo";

                  return (
                    <TableRow
                      key={c.id}
                      className="border-[#1e1e1e] text-white hover:bg-[#1a1a1a]"
                    >
                      <TableCell className="font-mono text-[#999]">{idx + 1}</TableCell>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[#e89b6a] border-[#e89b6a]/40">
                          {c.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{statusBadge(c.status)}</TableCell>
                      <TableCell className="text-[#ccc]">{c.campaign?.name ?? "\u2014"}</TableCell>
                      <TableCell className="text-right text-[#ccc]">
                        {c.ctr != null ? formatPercent(c.ctr) : "\u2014"}
                      </TableCell>
                      <TableCell className="text-right text-[#ccc]">
                        {c.hookRate != null ? formatPercent(c.hookRate) : "\u2014"}
                      </TableCell>
                      <TableCell className="text-right">
                        {c.cpa != null ? (
                          <span style={{ color: cpaColor(c.cpa), fontWeight: 600 }}>
                            {formatBRL(c.cpa)}
                          </span>
                        ) : (
                          <span className="text-[#999]">{"\u2014"}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-[#ccc]">{c.daysActive ?? "\u2014"}</span>
                          {showLifetimeAlert && (
                            <AlertTriangle className="h-4 w-4 text-[#f5c542]" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {recommendation ? (
                          <span className="text-sm text-[#e85040]">{recommendation}</span>
                        ) : (
                          <span className="text-sm text-[#50c878]">OK</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className={
                            isActive
                              ? "border-[#e85040]/40 text-[#e85040] hover:bg-[#e85040]/10 hover:text-[#e85040]"
                              : "border-[#50c878]/40 text-[#50c878] hover:bg-[#50c878]/10 hover:text-[#50c878]"
                          }
                          onClick={() =>
                            updateMutation.mutate({
                              id: c.id,
                              data: { status: isActive ? "Pausado" : "Ativo" },
                            })
                          }
                          disabled={updateMutation.isPending}
                        >
                          {isActive ? (
                            <>
                              <Pause className="mr-1 h-3.5 w-3.5" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="mr-1 h-3.5 w-3.5" />
                              Ativar
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// A/B Tests Section
// ---------------------------------------------------------------------------

function confidenceColor(confidence: number) {
  if (confidence >= 90) return "#50c878";
  if (confidence >= 70) return "#f5c542";
  return "#999";
}

function testStatusBadge(status: string) {
  switch (status) {
    case "waiting":
      return (
        <Badge className="bg-[#71717a]/20 text-[#999] border-[#71717a]/30">
          Aguardando dados
        </Badge>
      );
    case "trending":
      return (
        <Badge className="bg-[#f5c542]/20 text-[#f5c542] border-[#f5c542]/30">
          Tendencia clara
        </Badge>
      );
    case "ready":
      return (
        <Badge className="bg-[#50c878]/20 text-[#50c878] border-[#50c878]/30">
          Decisao pronta
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[#999]">
          {status}
        </Badge>
      );
  }
}

function ABTestsSection() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTest, setNewTest] = useState({ name: "", variantA: "", variantB: "" });

  const { data: tests, isLoading } = useQuery({
    queryKey: ["activeTests"],
    queryFn: () => api.getActiveTests(),
    refetchInterval: 60000,
  });

  const [mutationError, setMutationError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createTest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeTests"] });
      setDialogOpen(false);
      setNewTest({ name: "", variantA: "", variantB: "" });
      setMutationError(null);
    },
    onError: (err: any) => {
      // Formulário atual não coleta adsetId nem ids dos ads — o backend exige.
      // Enquanto não refatorar o form, ao menos mostra o erro em vez de engolir.
      setMutationError(err?.message || "Erro ao criar teste");
    },
  });

  const decideMutation = useMutation({
    mutationFn: ({ id, winner }: { id: string; winner: string }) =>
      // Backend espera "variantA" | "variantB", não "A" | "B"
      api.decideTest(id, winner === "A" ? "variantA" : winner === "B" ? "variantB" : winner),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeTests"] });
      setMutationError(null);
    },
    onError: (err: any) => {
      setMutationError(err?.message || "Erro ao aplicar decisão");
    },
  });

  if (isLoading) {
    return <Card className="h-40 animate-pulse border-[#1e1e1e] bg-[#111111]" />;
  }

  const testList = tests ?? [];

  return (
    <div className="space-y-4">
      {mutationError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          <XCircle className="h-4 w-4 shrink-0" />
          <span>{mutationError}</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Testes A/B Ativos</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button
              variant="outline"
              size="sm"
              className="border-[#e89b6a]/40 text-[#e89b6a] hover:bg-[#e89b6a]/10 hover:text-[#e89b6a]"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Criar Teste
            </Button>
          </DialogTrigger>
          <DialogContent className="border-[#1e1e1e] bg-[#111111] text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Novo Teste A/B</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                <p className="text-sm text-yellow-400 font-medium">Use a aba Lancar com template TESTE_AB</p>
                <p className="text-xs text-yellow-400/80 mt-1">
                  Testes A/B criados pelo dashboard usam o Campaign Builder (aba Lancar → tipo "Teste A/B").
                  Ele cria a campanha completa com 2 ad sets e criativos diferentes automaticamente.
                  O agente resolve o teste em 5 dias e declara vencedor.
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-[#ccc]">Nome do teste</Label>
                <Input
                  className="border-[#1e1e1e] bg-[#0a0a0a] text-white"
                  value={newTest.name}
                  onChange={(e) => setNewTest((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Hook emocional vs racional"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#ccc]">Variante A (ID ou nome do criativo)</Label>
                <Input
                  className="border-[#1e1e1e] bg-[#0a0a0a] text-white"
                  value={newTest.variantA}
                  onChange={(e) => setNewTest((p) => ({ ...p, variantA: e.target.value }))}
                  placeholder="Criativo A"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#ccc]">Variante B (ID ou nome do criativo)</Label>
                <Input
                  className="border-[#1e1e1e] bg-[#0a0a0a] text-white"
                  value={newTest.variantB}
                  onChange={(e) => setNewTest((p) => ({ ...p, variantB: e.target.value }))}
                  placeholder="Criativo B"
                />
              </div>
              <Button
                className="w-full bg-[#e89b6a] text-black hover:bg-[#e89b6a]/90"
                onClick={() => createMutation.mutate(newTest)}
                disabled={createMutation.isPending || !newTest.name || !newTest.variantA || !newTest.variantB}
              >
                {createMutation.isPending ? "Criando..." : "Criar Teste"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {testList.length === 0 ? (
        <Card className="border-[#1e1e1e] bg-[#111111]">
          <CardContent className="py-8 text-center text-[#999]">
            <FlaskConical className="mx-auto mb-2 h-8 w-8 text-[#666]" />
            Nenhum teste A/B ativo. Crie um teste para comparar criativos.
          </CardContent>
        </Card>
      ) : (
        testList.map((test: any) => {
          // Backend /tests/active usa variant_a / variant_b / days_running / min_days (snake_case)
          const a = test.variant_a ?? test.variantA ?? {};
          const b = test.variant_b ?? test.variantB ?? {};
          const confidence = test.confidence ?? 0;
          const status =
            confidence >= 90 ? "ready" : confidence >= 60 ? "trending" : "waiting";
          const winner = test.winner ?? (confidence >= 90 ? (a.cpa <= b.cpa ? "A" : "B") : null);

          return (
            <Card key={test.id} className="border-[#1e1e1e] bg-[#111111]">
              <CardContent className="space-y-4 p-4">
                {/* Test header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FlaskConical className="h-4 w-4 text-[#e89b6a]" />
                    <span className="font-medium text-white">{test.name}</span>
                  </div>
                  {testStatusBadge(status)}
                </div>

                {/* Variants side by side */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Variante A", data: a },
                    { label: "Variante B", data: b },
                  ].map((variant) => (
                    <div
                      key={variant.label}
                      className="space-y-2 rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] p-3"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#999]">
                        {variant.label}
                      </p>
                      <p className="text-sm text-[#ccc]">{variant.data.name ?? variant.label}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#999]">CPA</span>
                          <span
                            className="font-medium"
                            style={{
                              color: variant.data.cpa != null ? cpaColor(variant.data.cpa) : "#999",
                            }}
                          >
                            {variant.data.cpa != null ? formatBRL(variant.data.cpa) : "\u2014"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#999]">CTR</span>
                          <span className="text-[#ccc]">
                            {variant.data.ctr != null ? formatPercent(variant.data.ctr) : "\u2014"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#999]">Hook Rate</span>
                          <span className="text-[#ccc]">
                            {variant.data.hookRate != null
                              ? formatPercent(variant.data.hookRate)
                              : "\u2014"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#999]">Vendas</span>
                          <span className="text-[#ccc]">{variant.data.sales ?? "\u2014"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#999]">Spend</span>
                          <span className="text-[#ccc]">
                            {variant.data.spend != null ? formatBRL(variant.data.spend) : "\u2014"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Confidence bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#999]">Confianca</span>
                    <span style={{ color: confidenceColor(confidence) }}>
                      {confidence.toFixed(0)}%
                    </span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#1e1e1e]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(confidence, 100)}%`,
                        backgroundColor: confidenceColor(confidence),
                      }}
                    />
                    {/* 90% marker */}
                    <div
                      className="absolute top-0 h-full w-0.5 bg-white/30"
                      style={{ left: "90%" }}
                    />
                  </div>
                  <p className="text-right text-[10px] text-[#666]">meta: 90%</p>
                </div>

                {/* Timer — backend retorna days_running / min_days */}
                <div className="flex items-center gap-2 text-xs text-[#999]">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Rodando ha {test.days_running ?? test.daysRunning ?? 0} dias (minimo: {test.min_days ?? test.minDays ?? 7})
                  </span>
                </div>

                {/* Decision banner */}
                {status === "ready" && winner && (
                  <div className="flex items-center justify-between rounded-lg border border-[#50c878]/30 bg-[#50c878]/10 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-[#50c878]" />
                      <span className="text-sm font-medium text-[#50c878]">
                        DECIDIR: Variante {winner} venceu
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#50c878] text-black hover:bg-[#50c878]/90"
                      onClick={() =>
                        decideMutation.mutate({ id: test.id, winner })
                      }
                      disabled={decideMutation.isPending}
                    >
                      {decideMutation.isPending ? "Aplicando..." : "Aplicar Decisao"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

function CreativeStockCard() {
  const { data: stock } = useQuery({ queryKey: ["creativeStock"], queryFn: api.getCreativeStock });
  if (!stock) return null;

  const color = stock.alert_level === "ok" ? "green" : stock.alert_level === "warning" ? "yellow" : "red";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Archive className="h-4 w-4" />
          Estoque de Criativos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-2">
          <div className="text-center">
            <p className="text-xl font-bold text-green-400">{stock.healthy_count}</p>
            <p className="text-[10px] text-[#666]">Saudaveis</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-yellow-400">{stock.declining_count}</p>
            <p className="text-[10px] text-[#666]">Declinio</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-red-400">{stock.exhausted_count}</p>
            <p className="text-[10px] text-[#666]">Esgotados</p>
          </div>
          <div className="flex-1 text-right">
            <Badge variant="outline" className={`border-${color}-500/30 bg-${color}-500/10 text-${color}-400`}>
              {stock.alert_level === "ok" ? "OK" : stock.alert_level === "warning" ? "Atencao" : "Critico"}
            </Badge>
          </div>
        </div>
        {stock.days_until_crisis > 0 && (
          <p className="text-xs text-[#999]">~{stock.days_until_crisis} dias ate precisar de novos criativos</p>
        )}
        <p className="text-xs text-[#666] mt-1">{stock.recommendation}</p>
      </CardContent>
    </Card>
  );
}

function ThruplayCards() {
  const { data } = useQuery({ queryKey: ["thruplay"], queryFn: api.getThruplayAnalysis });
  if (!data?.creatives?.length) return null;

  const withThruplay = data.creatives.filter((c: any) => c.current_thruplay !== null);
  if (withThruplay.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Play className="h-4 w-4" />
          ThruPlay Rate (15s+)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {withThruplay.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between py-1 border-b border-[#1e1e1e]/50 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white truncate">{c.name}</p>
                {c.content_fatigue && (
                  <p className="text-[10px] text-orange-400 mt-0.5">Fadiga de conteudo — refazer corpo do video</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {c.hook_rate !== null && <span className="text-[10px] text-[#666]">Hook {c.hook_rate}%</span>}
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                  c.thruplay_status === "healthy" ? "bg-green-500/10 text-green-400" :
                  c.thruplay_status === "warning" ? "bg-yellow-500/10 text-yellow-400" :
                  "bg-red-500/10 text-red-400"
                }`}>
                  {c.current_thruplay}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CreativesTab() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Criativos</h2>
        <p className="text-sm text-[#999]">
          Criativos sao descobertos automaticamente pelo agente via Meta API
        </p>
      </div>

      {/* Creative Stock + ThruPlay (Pontos 7 e 8) */}
      <div className="grid gap-4 md:grid-cols-2">
        <CreativeStockCard />
        <ThruplayCards />
      </div>

      {/* Pipeline Summary */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Pipeline de Criativos</h3>
        <PipelineSummary />
      </section>

      {/* Lifecycle Cards */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Ciclo de Vida dos Criativos</h3>
        <LifecycleCards />
      </section>

      {/* Ranking Table */}
      <section>
        <CreativeRankingTable />
      </section>

      {/* A/B Tests */}
      <section>
        <ABTestsSection />
      </section>
    </div>
  );
}
