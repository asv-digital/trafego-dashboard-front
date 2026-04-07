"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Radio } from "lucide-react";

import { api, type MetricEntry } from "@/lib/api";
import {
  formatBRL,
  formatNumber,
  formatPercent,
  formatDate,
  formatRoas,
} from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

function cpaColorClass(value: number): string {
  if (value < 50) return "#50c878";
  if (value <= 70) return "#f5c542";
  return "#e85040";
}

function safeDivide(numerator: number, denominator: number): number | null {
  if (!denominator || !isFinite(numerator / denominator)) return null;
  return numerator / denominator;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function RealtimeTab() {
  // Live insights from Meta API
  const { data: realtimeInsights = [], isLoading: loadingRealtime } = useQuery({
    queryKey: ["realtimeInsights"],
    queryFn: api.getMetaRealtimeInsights,
    refetchInterval: 60000,
  });

  // Historical metrics from database
  const { data: metrics = [], isLoading: loadingMetrics } = useQuery<MetricEntry[]>({
    queryKey: ["metrics"],
    queryFn: () => api.getMetrics(),
    refetchInterval: 60000,
  });

  if (loadingRealtime) {
    return (
      <p className="py-12 text-center text-[#999]">Carregando dados em tempo real...</p>
    );
  }

  // Parse realtime insights into table rows
  const realtimeRows = realtimeInsights.map((row: any) => {
    const spend = Number(row.spend) || 0;
    const impressions = Number(row.impressions) || 0;
    const clicks = Number(row.clicks) || 0;
    const sales =
      Number(row.actions?.find((a: any) => a.action_type === "purchase")?.value) ||
      Number(row.purchases) ||
      Number(row.sales) ||
      0;
    const ctr = safeDivide(clicks, impressions) !== null ? (clicks / impressions) * 100 : null;
    const cpc = safeDivide(spend, clicks);
    const cpm = safeDivide(spend, impressions) !== null ? (spend / impressions) * 1000 : null;
    const cpa = safeDivide(spend, sales);
    const roas = safeDivide(sales * 97, spend);

    return {
      name: row.campaign_name || row.campaignName || row.name || "—",
      spend,
      impressions,
      clicks,
      ctr,
      cpc,
      cpm,
      sales,
      cpa,
      roas,
    };
  });

  // Historical: last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const historicalMetrics = metrics
    .filter((m) => new Date(m.date) >= thirtyDaysAgo)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-[#e85040] animate-pulse" />
          <h2 className="text-lg font-semibold text-white">Metricas em Tempo Real</h2>
        </div>
        <Badge className="bg-[#e89b6a]/10 text-[#e89b6a] border-[#e89b6a]/30">
          Auto-refresh 60s
        </Badge>
      </div>

      {/* ---- Realtime Table ---- */}
      <Card className="border-[#1e1e1e] bg-[#111111]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="h-5 w-5 text-[#e89b6a]" />
            Campanhas — Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#1e1e1e] hover:bg-transparent">
                  <TableHead className="text-[#999]">Campanha</TableHead>
                  <TableHead className="text-right text-[#999]">Gasto</TableHead>
                  <TableHead className="text-right text-[#999]">Impressoes</TableHead>
                  <TableHead className="text-right text-[#999]">Cliques</TableHead>
                  <TableHead className="text-right text-[#999]">CTR</TableHead>
                  <TableHead className="text-right text-[#999]">CPC</TableHead>
                  <TableHead className="text-right text-[#999]">CPM</TableHead>
                  <TableHead className="text-right text-[#999]">Vendas</TableHead>
                  <TableHead className="text-right text-[#999]">CPA</TableHead>
                  <TableHead className="text-right text-[#999]">ROAS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {realtimeRows.length === 0 ? (
                  <TableRow className="border-[#1e1e1e]">
                    <TableCell colSpan={10} className="py-8 text-center text-[#999]">
                      Nenhum dado em tempo real disponivel. O agente ainda nao sincronizou.
                    </TableCell>
                  </TableRow>
                ) : (
                  realtimeRows.map((row: any, idx: number) => (
                    <TableRow key={idx} className="border-[#1e1e1e] hover:bg-[#1a1a1a]">
                      <TableCell className="font-medium text-white">{row.name}</TableCell>
                      <TableCell className="text-right text-[#ccc]">{formatBRL(row.spend)}</TableCell>
                      <TableCell className="text-right text-[#ccc]">{formatNumber(row.impressions)}</TableCell>
                      <TableCell className="text-right text-[#ccc]">{formatNumber(row.clicks)}</TableCell>
                      <TableCell className="text-right text-[#ccc]">
                        {row.ctr != null ? formatPercent(row.ctr) : "\u2014"}
                      </TableCell>
                      <TableCell className="text-right text-[#ccc]">
                        {row.cpc != null ? formatBRL(row.cpc) : "\u2014"}
                      </TableCell>
                      <TableCell className="text-right text-[#ccc]">
                        {row.cpm != null ? formatBRL(row.cpm) : "\u2014"}
                      </TableCell>
                      <TableCell className="text-right text-[#ccc]">{formatNumber(row.sales)}</TableCell>
                      <TableCell className="text-right">
                        {row.cpa != null ? (
                          <span style={{ color: cpaColorClass(row.cpa), fontWeight: 600 }}>
                            {formatBRL(row.cpa)}
                          </span>
                        ) : (
                          <span className="text-[#999]">{"\u2014"}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium text-[#e89b6a]">
                        {row.roas != null ? formatRoas(row.roas) : "\u2014"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ---- Historical Table (Last 30 Days) ---- */}
      <Card className="border-[#1e1e1e] bg-[#111111]">
        <CardHeader>
          <CardTitle className="text-white">Historico — Ultimos 30 dias</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingMetrics ? (
            <p className="py-8 text-center text-[#999]">Carregando historico...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#1e1e1e] hover:bg-transparent">
                    <TableHead className="text-[#999]">Data</TableHead>
                    <TableHead className="text-[#999]">Campanha</TableHead>
                    <TableHead className="text-right text-[#999]">Investimento</TableHead>
                    <TableHead className="text-right text-[#999]">Impressoes</TableHead>
                    <TableHead className="text-right text-[#999]">Cliques</TableHead>
                    <TableHead className="text-right text-[#999]">Vendas</TableHead>
                    <TableHead className="text-right text-[#999]">CPA</TableHead>
                    <TableHead className="text-right text-[#999]">ROAS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicalMetrics.length === 0 ? (
                    <TableRow className="border-[#1e1e1e]">
                      <TableCell colSpan={8} className="py-8 text-center text-[#999]">
                        Nenhuma metrica historica registrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    historicalMetrics.map((m) => {
                      const cpa = safeDivide(m.investment, m.sales);
                      const roas = safeDivide(m.sales * 97, m.investment);
                      return (
                        <TableRow key={m.id} className="border-[#1e1e1e] hover:bg-[#1a1a1a]">
                          <TableCell className="text-[#ccc]">{formatDate(m.date)}</TableCell>
                          <TableCell className="text-[#ccc]">{m.campaign?.name ?? "\u2014"}</TableCell>
                          <TableCell className="text-right text-[#ccc]">{formatBRL(m.investment)}</TableCell>
                          <TableCell className="text-right text-[#ccc]">{formatNumber(m.impressions)}</TableCell>
                          <TableCell className="text-right text-[#ccc]">{formatNumber(m.clicks)}</TableCell>
                          <TableCell className="text-right text-[#ccc]">{formatNumber(m.sales)}</TableCell>
                          <TableCell className="text-right">
                            {cpa != null ? (
                              <span style={{ color: cpaColorClass(cpa), fontWeight: 600 }}>
                                {formatBRL(cpa)}
                              </span>
                            ) : (
                              "\u2014"
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium text-[#e89b6a]">
                            {roas != null ? formatRoas(roas) : "\u2014"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
