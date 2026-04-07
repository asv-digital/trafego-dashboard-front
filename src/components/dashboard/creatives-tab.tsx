"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Trash2, RefreshCw } from "lucide-react";

import { api, type Creative, type Campaign, type CreateCreativeInput } from "@/lib/api";
import { formatBRL, formatPercent, formatDate } from "@/lib/format";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CREATIVE_TYPES = [
  "Video Talking Head",
  "Screen Recording",
  "Carrossel",
  "Imagem",
] as const;

const STATUS_OPTIONS = ["Ativo", "Pausado", "Saturado"] as const;

const STATUS_CYCLE: Record<string, string> = {
  Ativo: "Pausado",
  Pausado: "Saturado",
  Saturado: "Ativo",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cpaColor(value: number) {
  if (value < 50) return "#50c878";
  if (value <= 70) return "#e89b6a";
  return "#e85040";
}

function statusBadge(status: string) {
  switch (status) {
    case "Ativo":
      return (
        <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">
          Ativo
        </Badge>
      );
    case "Pausado":
      return (
        <Badge className="bg-zinc-600/20 text-zinc-400 border-zinc-600/30">
          Pausado
        </Badge>
      );
    case "Saturado":
      return (
        <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
          Saturado
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function CreativesTab() {
  const queryClient = useQueryClient();

  // ---- Queries ----
  const { data: creatives, isLoading: loadingCreatives } = useQuery({
    queryKey: ["creatives"],
    queryFn: () => api.getCreatives(),
  });

  const { data: campaigns, isLoading: loadingCampaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: api.getCampaigns,
  });

  // ---- Mutations ----
  const createMutation = useMutation({
    mutationFn: (data: CreateCreativeInput) => api.createCreative(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creatives"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Creative> }) =>
      api.updateCreative(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creatives"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteCreative(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creatives"] });
    },
  });

  // ---- Form State ----
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<string>(CREATIVE_TYPES[0]);
  const [formCampaignId, setFormCampaignId] = useState("");
  const [formStatus, setFormStatus] = useState<string>("Ativo");
  const [formCtr, setFormCtr] = useState("");
  const [formHookRate, setFormHookRate] = useState("");
  const [formCpa, setFormCpa] = useState("");

  function resetForm() {
    setFormName("");
    setFormType(CREATIVE_TYPES[0]);
    setFormCampaignId("");
    setFormStatus("Ativo");
    setFormCtr("");
    setFormHookRate("");
    setFormCpa("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formCampaignId) return;

    const input: CreateCreativeInput = {
      name: formName.trim(),
      type: formType,
      status: formStatus,
      campaignId: formCampaignId,
      ...(formCtr !== "" && { ctr: parseFloat(formCtr) }),
      ...(formHookRate !== "" && { hookRate: parseFloat(formHookRate) }),
      ...(formCpa !== "" && { cpa: parseFloat(formCpa) }),
    };

    createMutation.mutate(input);
  }

  // ---- Loading ----
  if (loadingCreatives || loadingCampaigns) {
    return (
      <p className="py-12 text-center text-[#999]">Carregando...</p>
    );
  }

  // Sort creatives by CPA ascending (best first), nulls last
  const sorted = [...(creatives ?? [])].sort((a, b) => {
    if (a.cpa == null && b.cpa == null) return 0;
    if (a.cpa == null) return 1;
    if (b.cpa == null) return -1;
    return a.cpa - b.cpa;
  });

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* Creatives Ranking Table                                          */}
      {/* ================================================================ */}
      <Card className="border-[#1e1e1e] bg-[#111111]">
        <CardHeader>
          <CardTitle className="text-white">Ranking de Criativos</CardTitle>
        </CardHeader>
        <CardContent>
          {sorted.length === 0 ? (
            <p className="py-8 text-center text-[#999]">
              Nenhum criativo cadastrado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#1e1e1e]">
                  <TableHead className="text-[#999]">#</TableHead>
                  <TableHead className="text-[#999]">Nome</TableHead>
                  <TableHead className="text-[#999]">Tipo</TableHead>
                  <TableHead className="text-[#999]">Status</TableHead>
                  <TableHead className="text-[#999]">Campanha</TableHead>
                  <TableHead className="text-[#999]">CTR</TableHead>
                  <TableHead className="text-[#999]">Hook Rate</TableHead>
                  <TableHead className="text-[#999]">CPA</TableHead>
                  <TableHead className="text-[#999]">Dias Ativo</TableHead>
                  <TableHead className="text-[#999]">Alerta</TableHead>
                  <TableHead className="text-[#999]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((c, idx) => {
                  const showAlert =
                    c.lifetimeAlert === true || (c.daysActive ?? 0) > 21;

                  return (
                    <TableRow
                      key={c.id}
                      className="border-[#1e1e1e] text-white"
                    >
                      {/* Rank */}
                      <TableCell className="text-[#999] font-mono">
                        {idx + 1}
                      </TableCell>

                      {/* Nome */}
                      <TableCell className="font-medium">{c.name}</TableCell>

                      {/* Tipo */}
                      <TableCell>
                        <Badge variant="outline" className="text-[#e89b6a] border-[#e89b6a]/40">
                          {c.type}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell>{statusBadge(c.status)}</TableCell>

                      {/* Campanha */}
                      <TableCell className="text-[#ccc]">
                        {c.campaign?.name ?? "—"}
                      </TableCell>

                      {/* CTR */}
                      <TableCell>
                        {c.ctr != null ? formatPercent(c.ctr) : "—"}
                      </TableCell>

                      {/* Hook Rate */}
                      <TableCell>
                        {c.hookRate != null ? formatPercent(c.hookRate) : "N/A"}
                      </TableCell>

                      {/* CPA */}
                      <TableCell>
                        {c.cpa != null ? (
                          <span style={{ color: cpaColor(c.cpa) }}>
                            {formatBRL(c.cpa)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>

                      {/* Dias Ativo */}
                      <TableCell className="text-center">
                        {c.daysActive ?? "—"}
                      </TableCell>

                      {/* Alert */}
                      <TableCell className="text-center">
                        {showAlert ? (
                          <span title="Criativo com mais de 21 dias. Considere trocar.">
                            <AlertTriangle className="h-4 w-4 text-amber-400 inline-block" />
                          </span>
                        ) : null}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#999] hover:text-[#e89b6a]"
                            title={`Mudar para ${STATUS_CYCLE[c.status] ?? "Ativo"}`}
                            onClick={() =>
                              updateMutation.mutate({
                                id: c.id,
                                data: {
                                  status: STATUS_CYCLE[c.status] ?? "Ativo",
                                },
                              })
                            }
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#999] hover:text-red-400"
                            title="Excluir criativo"
                            onClick={() => deleteMutation.mutate(c.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* New Creative Form                                                */}
      {/* ================================================================ */}
      <Card className="border-[#1e1e1e] bg-[#111111]">
        <CardHeader>
          <CardTitle className="text-white">Novo Criativo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Nome */}
              <div className="space-y-2">
                <Label className="text-[#999]">Nome / Descrição</Label>
                <Input
                  placeholder="Ex: VSL Principal v2"
                  className="border-[#1e1e1e] bg-[#0a0a0a] text-white placeholder:text-[#555]"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label className="text-[#999]">Tipo</Label>
                <Select value={formType} onValueChange={(v) => v && setFormType(v)}>
                  <SelectTrigger className="w-full border-[#1e1e1e] bg-[#0a0a0a] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#1e1e1e] bg-[#111111]">
                    {CREATIVE_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="text-white">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Campanha */}
              <div className="space-y-2">
                <Label className="text-[#999]">Campanha</Label>
                <Select value={formCampaignId} onValueChange={(v) => v && setFormCampaignId(v)}>
                  <SelectTrigger className="w-full border-[#1e1e1e] bg-[#0a0a0a] text-white">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="border-[#1e1e1e] bg-[#111111]">
                    {(campaigns ?? []).map((camp) => (
                      <SelectItem key={camp.id} value={camp.id} className="text-white">
                        {camp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-[#999]">Status</Label>
                <Select value={formStatus} onValueChange={(v) => v && setFormStatus(v)}>
                  <SelectTrigger className="w-full border-[#1e1e1e] bg-[#0a0a0a] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#1e1e1e] bg-[#111111]">
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className="text-white">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* CTR */}
              <div className="space-y-2">
                <Label className="text-[#999]">CTR %</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 2.5"
                  className="border-[#1e1e1e] bg-[#0a0a0a] text-white placeholder:text-[#555]"
                  value={formCtr}
                  onChange={(e) => setFormCtr(e.target.value)}
                />
              </div>

              {/* Hook Rate */}
              <div className="space-y-2">
                <Label className="text-[#999]">Hook Rate %</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 35.0"
                  className="border-[#1e1e1e] bg-[#0a0a0a] text-white placeholder:text-[#555]"
                  value={formHookRate}
                  onChange={(e) => setFormHookRate(e.target.value)}
                />
              </div>

              {/* CPA */}
              <div className="space-y-2">
                <Label className="text-[#999]">CPA R$</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 45.00"
                  className="border-[#1e1e1e] bg-[#0a0a0a] text-white placeholder:text-[#555]"
                  value={formCpa}
                  onChange={(e) => setFormCpa(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={createMutation.isPending || !formName.trim() || !formCampaignId}
              className="bg-[#e89b6a] text-black font-semibold hover:bg-[#d4864f] disabled:opacity-50"
            >
              {createMutation.isPending ? "Salvando..." : "Adicionar Criativo"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
