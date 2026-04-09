"use client";

import { useState } from "react";
import { FileText, Loader2, Printer, X, TrendingUp, TrendingDown } from "lucide-react";
import { api } from "@/lib/api";

interface ReportData {
  title: string;
  period: string;
  generated_at: string;
  executive_summary: { status: string; score: number; score_label: string };
  kpis: Record<string, { value: number; formatted: string }>;
  comparison: { vs_previous: Record<string, string> };
  top_performers: { name: string; cpa: number; sales: number; status: string }[];
  worst_performers: { name: string; cpa: number; sales: number; status: string }[];
  ltv: { buyers_skills: number; converted_mentoria: number; conversion_rate: string; revenue_mentoria: number; estimated_ltv: string };
  chart_data: { daily_cpa: { date: string; cpa: number }[]; daily_sales: { date: string; sales: number }[]; daily_profit: { date: string; profit: number }[] };
}

export function ReportButton() {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const data = await api.generateReport({ period });
      setReport(data);
    } catch { }
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-[#1e1e1e] bg-[#111] px-3 py-2 text-sm text-[#999] transition-colors hover:border-[#e89b6a] hover:text-[#e89b6a]"
      >
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Relatorio CEO</span>
      </button>
    );
  }

  if (!report) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-6 w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Gerar Relatorio</h3>
            <button onClick={() => setOpen(false)} className="text-[#666] hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <label className="text-xs text-[#999]">Periodo</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="mt-1 w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 text-sm text-white mb-4">
            <option value="7d">Ultimos 7 dias</option>
            <option value="14d">Ultimos 14 dias</option>
            <option value="30d">Ultimos 30 dias</option>
            <option value="month">Mes atual</option>
          </select>
          <button onClick={generate} disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#e89b6a] px-4 py-2 text-sm font-medium text-black">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {loading ? "Gerando..." : "Gerar Relatorio"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] overflow-auto">
      {/* Top bar (hidden in print) */}
      <div className="print:hidden sticky top-0 z-10 flex items-center justify-between bg-[#111] border-b border-[#1e1e1e] px-6 py-3">
        <span className="text-sm text-[#999]">Relatorio gerado em {new Date(report.generated_at).toLocaleString("pt-BR")}</span>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg bg-[#e89b6a] px-4 py-2 text-sm font-medium text-black">
            <Printer className="h-4 w-4" /> Imprimir / PDF
          </button>
          <button onClick={() => { setReport(null); setOpen(false); }} className="rounded-lg border border-[#333] px-3 py-2 text-sm text-[#999] hover:text-white">
            Fechar
          </button>
        </div>
      </div>

      {/* Report content */}
      <div className="max-w-3xl mx-auto px-8 py-8 print:px-0 print:py-4 print:max-w-none">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 print:mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white print:text-black">{report.title}</h1>
            <p className="text-sm text-[#999] print:text-gray-500">{report.period}</p>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${report.executive_summary.score >= 60 ? "text-green-400 print:text-green-600" : "text-red-400 print:text-red-600"}`}>
              {report.executive_summary.score}
            </div>
            <div className="text-xs text-[#999] print:text-gray-500">{report.executive_summary.score_label}</div>
          </div>
        </div>

        {/* Executive summary */}
        <div className="rounded-lg border border-[#1e1e1e] print:border-gray-300 bg-[#111] print:bg-gray-50 p-4 mb-6 print:mb-4">
          <p className="text-sm text-[#ccc] print:text-gray-700">{report.executive_summary.status}</p>
        </div>

        {/* KPIs grid */}
        <div className="grid grid-cols-4 gap-3 mb-6 print:mb-4">
          {[
            { key: "investimento", label: "Investimento", compare: null },
            { key: "lucro_liquido", label: "Lucro Liquido", compare: "lucro" },
            { key: "vendas", label: "Vendas", compare: "vendas" },
            { key: "roas", label: "ROAS", compare: null },
          ].map(({ key, label, compare }) => {
            const kpi = report.kpis[key];
            const change = compare ? report.comparison.vs_previous[compare] : null;
            const isPositive = change?.startsWith("+");
            return (
              <div key={key} className="rounded-lg border border-[#1e1e1e] print:border-gray-300 bg-[#111] print:bg-white p-3 text-center">
                <p className="text-xs text-[#666] print:text-gray-500">{label}</p>
                <p className="text-xl font-bold text-white print:text-black mt-1">{kpi?.formatted ?? "—"}</p>
                {change && (
                  <p className={`text-xs mt-1 flex items-center justify-center gap-0.5 ${isPositive ? "text-green-400 print:text-green-600" : "text-red-400 print:text-red-600"}`}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {change} vs anterior
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-5 gap-2 mb-6 print:mb-4">
          {["cpa", "receita_liquida", "margem", "receita_bruta", "ticket_medio"].map((key) => {
            const kpi = report.kpis[key];
            return (
              <div key={key} className="rounded-lg border border-[#1e1e1e] print:border-gray-200 bg-[#111] print:bg-white p-2 text-center">
                <p className="text-[10px] text-[#666] print:text-gray-500 uppercase">{key.replace(/_/g, " ")}</p>
                <p className="text-sm font-bold text-white print:text-black">{kpi?.formatted ?? "—"}</p>
              </div>
            );
          })}
        </div>

        {/* Top & Worst */}
        <div className="grid grid-cols-2 gap-4 mb-6 print:mb-4">
          <div>
            <h3 className="text-sm font-bold text-green-400 print:text-green-600 mb-2">Top Performers</h3>
            {report.top_performers.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#1e1e1e] print:border-gray-200 text-sm">
                <span className="text-[#ccc] print:text-gray-700 truncate max-w-[60%]">{p.name}</span>
                <span className="text-green-400 print:text-green-600 font-mono">CPA R${p.cpa} | {p.sales}v</span>
              </div>
            ))}
            {report.top_performers.length === 0 && <p className="text-xs text-[#666]">Sem dados</p>}
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-400 print:text-red-600 mb-2">Pior Performance</h3>
            {report.worst_performers.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#1e1e1e] print:border-gray-200 text-sm">
                <span className="text-[#ccc] print:text-gray-700 truncate max-w-[60%]">{p.name}</span>
                <span className="text-red-400 print:text-red-600 font-mono">CPA R${p.cpa} | {p.sales}v</span>
              </div>
            ))}
            {report.worst_performers.length === 0 && <p className="text-xs text-[#666]">Nenhum acima do limite</p>}
          </div>
        </div>

        {/* LTV */}
        {report.ltv.buyers_skills > 0 && (
          <div className="rounded-lg border border-[#1e1e1e] print:border-gray-300 bg-[#111] print:bg-gray-50 p-4 mb-6 print:mb-4">
            <h3 className="text-sm font-bold text-[#e89b6a] print:text-orange-600 mb-2">LTV e Upsell</h3>
            <div className="grid grid-cols-4 gap-3 text-center text-sm">
              <div>
                <p className="text-[#666] print:text-gray-500 text-xs">Compradores</p>
                <p className="text-white print:text-black font-bold">{report.ltv.buyers_skills}</p>
              </div>
              <div>
                <p className="text-[#666] print:text-gray-500 text-xs">Mentoria</p>
                <p className="text-white print:text-black font-bold">{report.ltv.converted_mentoria} ({report.ltv.conversion_rate})</p>
              </div>
              <div>
                <p className="text-[#666] print:text-gray-500 text-xs">Receita Mentoria</p>
                <p className="text-white print:text-black font-bold">R${report.ltv.revenue_mentoria.toLocaleString("pt-BR")}</p>
              </div>
              <div>
                <p className="text-[#666] print:text-gray-500 text-xs">LTV Estimado</p>
                <p className="text-[#e89b6a] print:text-orange-600 font-bold">{report.ltv.estimated_ltv}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-[#666] print:text-gray-400 pt-4 border-t border-[#1e1e1e] print:border-gray-200">
          Gerado automaticamente por trafego.bravy.com.br
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
