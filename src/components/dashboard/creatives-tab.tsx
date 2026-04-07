"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Pause, Play } from "lucide-react";

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cpaColor(value: number) {
  if (value < 50) return "#50c878";
  if (value <= 70) return "#f5c542";
  return "#e85040";
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
      return <Badge variant="outline" className="text-[#999]">{status}</Badge>;
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
// Main Component
// ---------------------------------------------------------------------------

export function CreativesTab() {
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
    return (
      <p className="py-12 text-center text-[#999]">Carregando criativos...</p>
    );
  }

  // Sort by CPA ascending (best first), nulls last
  const sorted = [...(creatives ?? [])].sort((a, b) => {
    if (a.cpa == null && b.cpa == null) return 0;
    if (a.cpa == null) return 1;
    if (b.cpa == null) return -1;
    return a.cpa - b.cpa;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Criativos</h2>
        <p className="text-sm text-[#999]">
          Criativos sao descobertos automaticamente pelo agente via Meta API
        </p>
      </div>

      {/* Creatives Ranking Table */}
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
                          {c.campaign?.name ?? "\u2014"}
                        </TableCell>

                        {/* CTR */}
                        <TableCell className="text-right text-[#ccc]">
                          {c.ctr != null ? formatPercent(c.ctr) : "\u2014"}
                        </TableCell>

                        {/* Hook Rate */}
                        <TableCell className="text-right text-[#ccc]">
                          {c.hookRate != null ? formatPercent(c.hookRate) : "\u2014"}
                        </TableCell>

                        {/* CPA */}
                        <TableCell className="text-right">
                          {c.cpa != null ? (
                            <span style={{ color: cpaColor(c.cpa), fontWeight: 600 }}>
                              {formatBRL(c.cpa)}
                            </span>
                          ) : (
                            <span className="text-[#999]">{"\u2014"}</span>
                          )}
                        </TableCell>

                        {/* Dias Ativo */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-[#ccc]">{c.daysActive ?? "\u2014"}</span>
                            {showLifetimeAlert && (
                              <AlertTriangle className="h-4 w-4 text-[#f5c542]" />
                            )}
                          </div>
                        </TableCell>

                        {/* Recommendation */}
                        <TableCell>
                          {recommendation ? (
                            <span className="text-sm text-[#e85040]">{recommendation}</span>
                          ) : (
                            <span className="text-sm text-[#50c878]">OK</span>
                          )}
                        </TableCell>

                        {/* Actions */}
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
                                <Pause className="h-3.5 w-3.5 mr-1" />
                                Pausar
                              </>
                            ) : (
                              <>
                                <Play className="h-3.5 w-3.5 mr-1" />
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
    </div>
  );
}
