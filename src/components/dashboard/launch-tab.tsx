"use client";

import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Upload, ChevronRight, ChevronLeft, Rocket, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";

const CTA_OPTIONS = [
  { value: "LEARN_MORE", label: "Saiba Mais" },
  { value: "SHOP_NOW", label: "Comprar Agora" },
  { value: "SIGN_UP", label: "Cadastre-se" },
  { value: "SUBSCRIBE", label: "Assinar" },
  { value: "GET_OFFER", label: "Obter Oferta" },
];

type Step = 1 | 2 | 3 | 4;

export function LaunchTab() {
  const [step, setStep] = useState<Step>(1);

  // Step 1 state
  const [file, setFile] = useState<File | null>(null);
  const [primaryText, setPrimaryText] = useState("");
  const [headline, setHeadline] = useState("56 Skills de Claude Code");
  const [description, setDescription] = useState("");
  const [ctaType, setCtaType] = useState("LEARN_MORE");
  const [linkUrl, setLinkUrl] = useState("https://bravy.com.br/skills-claude-code");
  const [uploading, setUploading] = useState(false);
  const [mediaResult, setMediaResult] = useState<{ type: string; metaId: string } | null>(null);
  const [creativeId, setCreativeId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 2 state
  const [campaignType, setCampaignType] = useState("PROSPECCAO_BROAD");
  const [lalAudienceId, setLalAudienceId] = useState("");
  const [existingCampaignId, setExistingCampaignId] = useState("");
  const [useExisting, setUseExisting] = useState(false);
  const [abFile, setAbFile] = useState<File | null>(null);
  const [abCreativeId, setAbCreativeId] = useState<string | null>(null);

  // Step 3 state
  const [campaignName, setCampaignName] = useState("");
  const [adSetName, setAdSetName] = useState("");
  const [adName, setAdName] = useState("");
  const [customBudget, setCustomBudget] = useState(50);

  // Step 4 state
  const [launching, setLaunching] = useState(false);
  const [launchResult, setLaunchResult] = useState<any>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [launchSteps, setLaunchSteps] = useState<string[]>([]);

  // Data queries
  const { data: templates } = useQuery({ queryKey: ["launchTemplates"], queryFn: api.getLaunchTemplates });
  const { data: audiences } = useQuery({ queryKey: ["builderAudiences"], queryFn: api.getBuilderAudiences, enabled: campaignType === "PROSPECCAO_LAL" });
  const { data: campaigns } = useQuery({ queryKey: ["builderCampaigns"], queryFn: api.getBuilderCampaigns, enabled: useExisting });
  const { data: allocation } = useQuery({ queryKey: ["budgetAllocation"], queryFn: api.getBudgetAllocation });

  const selectedTemplate = templates?.templates?.find((t: any) => t.key === campaignType);
  const budgetAvailable = allocation ? allocation.daily_target - allocation.allocation.total : 500;

  // Handlers
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await api.uploadMedia(file);
      if (result.error) throw new Error(result.error);
      setMediaResult(result);

      // Create preview/creative
      const preview = await api.previewCreative({
        mediaType: result.type, metaId: result.metaId,
        primaryText, headline, description, ctaType, linkUrl,
      });
      if (preview.error) throw new Error(preview.error);
      setCreativeId(preview.creativeId);
    } catch (err: any) {
      alert("Erro no upload: " + (err.message || err));
    }
    setUploading(false);
  };

  const handleLaunch = async () => {
    if (!creativeId) return;
    setLaunching(true);
    setLaunchError(null);
    setLaunchSteps([]);

    try {
      setLaunchSteps(s => [...s, "Verificando budget..."]);
      await new Promise(r => setTimeout(r, 500));

      setLaunchSteps(s => [...s, "Criando campanha..."]);
      const result = await api.launchCampaign({
        creativeId,
        campaignType,
        campaignName: campaignName || undefined,
        adSetName: adSetName || undefined,
        adName: adName || undefined,
        existingCampaignId: useExisting ? existingCampaignId : undefined,
        lalAudienceId: campaignType === "PROSPECCAO_LAL" ? lalAudienceId : undefined,
        customBudget,
        abVariantCreativeId: campaignType === "TESTE_AB" ? abCreativeId : undefined,
      });

      if (result.error) throw new Error(result.error);

      setLaunchSteps(s => [...s, "Criando ad set..."]);
      await new Promise(r => setTimeout(r, 300));
      setLaunchSteps(s => [...s, "Criando ad..."]);
      await new Promise(r => setTimeout(r, 300));
      setLaunchSteps(s => [...s, "Ativando..."]);
      await new Promise(r => setTimeout(r, 300));
      setLaunchSteps(s => [...s, "Campanha no ar! O agente esta monitorando."]);

      setLaunchResult(result);
    } catch (err: any) {
      setLaunchError(err.message || "Erro ao lancar campanha");
    }
    setLaunching(false);
  };

  const autoName = () => {
    const prefix = campaignType === "REMARKETING" ? "[RMK]" : campaignType === "ASC" ? "[ASC]" : "[PROSP]";
    const date = new Date().toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
    return `${prefix} ${headline.slice(0, 30)} - ${date}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= s ? "bg-[#e89b6a] text-black" : "bg-[#1e1e1e] text-[#666]"
            }`}>{s}</div>
            <span className={`text-xs hidden sm:inline ${step >= s ? "text-white" : "text-[#666]"}`}>
              {s === 1 ? "Criativo" : s === 2 ? "Tipo" : s === 3 ? "Config" : "Lancar"}
            </span>
            {s < 4 && <div className={`flex-1 h-px ${step > s ? "bg-[#e89b6a]" : "bg-[#1e1e1e]"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Criativo */}
      {step === 1 && (
        <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Criativo</h2>

          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-[#333] rounded-lg p-8 text-center cursor-pointer hover:border-[#e89b6a] transition-colors"
          >
            <Upload className="h-8 w-8 mx-auto text-[#666] mb-2" />
            <p className="text-sm text-[#999]">{file ? file.name : "Clique ou arraste: MP4, MOV, JPG, PNG"}</p>
            <p className="text-xs text-[#666] mt-1">Max: 500MB video / 30MB imagem</p>
            <input ref={fileRef} type="file" accept="video/*,image/*" className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          <div>
            <label className="text-sm font-medium text-white">Texto principal</label>
            <textarea value={primaryText} onChange={(e) => setPrimaryText(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 text-sm text-white resize-none h-20"
              placeholder="Copy do anuncio (125 chars recomendado)" maxLength={500} />
            <p className="text-xs text-[#666] text-right">{primaryText.length}/500</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-white">Titulo</label>
              <input value={headline} onChange={(e) => setHeadline(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-sm font-medium text-white">CTA</label>
              <select value={ctaType} onChange={(e) => setCtaType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 text-sm text-white">
                {CTA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-white">URL destino</label>
            <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 text-sm text-white" />
          </div>

          {file && !creativeId && (
            <button onClick={handleUpload} disabled={uploading}
              className="flex items-center gap-2 rounded-lg bg-[#e89b6a] px-4 py-2 text-sm font-medium text-black hover:bg-[#d88a5a]">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Enviando..." : "Upload e Criar Preview"}
            </button>
          )}
          {creativeId && <p className="text-sm text-green-400 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Criativo criado no Meta</p>}
        </div>
      )}

      {/* Step 2: Tipo */}
      {step === 2 && (
        <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Tipo de Campanha</h2>

          <div className="space-y-2">
            {(templates?.templates || []).map((t: any) => (
              <label key={t.key} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                campaignType === t.key ? "border-[#e89b6a] bg-[#e89b6a]/5" : "border-[#1e1e1e] hover:border-[#333]"
              }`}>
                <input type="radio" name="type" value={t.key} checked={campaignType === t.key}
                  onChange={() => { setCampaignType(t.key); setCustomBudget(t.suggestedBudget); }} className="mt-1" />
                <div>
                  <p className="text-sm font-medium text-white">{t.label}</p>
                  <p className="text-xs text-[#666]">{t.description}</p>
                  <p className="text-xs text-[#e89b6a] mt-1">Budget sugerido: R${t.suggestedBudget}/dia</p>
                </div>
              </label>
            ))}
          </div>

          {campaignType === "PROSPECCAO_LAL" && (
            <div>
              <label className="text-sm font-medium text-white">Selecionar Lookalike</label>
              <select value={lalAudienceId} onChange={(e) => setLalAudienceId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 text-sm text-white">
                <option value="">Selecione...</option>
                {(audiences?.lookalikes || []).map((l: any) => (
                  <option key={l.id} value={l.metaAudienceId || l.id}>{l.name}</option>
                ))}
                {(audiences?.meta_audiences || []).filter((a: any) => a.subtype === "LOOKALIKE").map((a: any) => (
                  <option key={a.id} value={a.id}>{a.name} (~{a.count?.toLocaleString()})</option>
                ))}
              </select>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-[#999] cursor-pointer">
            <input type="checkbox" checked={useExisting} onChange={(e) => setUseExisting(e.target.checked)} />
            Adicionar a campanha existente
          </label>

          {useExisting && (
            <select value={existingCampaignId} onChange={(e) => setExistingCampaignId(e.target.value)}
              className="w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 text-sm text-white">
              <option value="">Selecione campanha...</option>
              {(campaigns?.campaigns || []).map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} (R${c.dailyBudget}/dia)</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Step 3: Config */}
      {step === 3 && (
        <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Configuracao</h2>

          <div>
            <label className="text-sm font-medium text-white">Nome da Campanha</label>
            <input value={campaignName || autoName()} onChange={(e) => setCampaignName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 text-sm text-white" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-white">Nome do Ad Set</label>
              <input value={adSetName} onChange={(e) => setAdSetName(e.target.value)} placeholder="Broad 25-55"
                className="mt-1 w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-sm font-medium text-white">Nome do Ad</label>
              <input value={adName} onChange={(e) => setAdName(e.target.value)} placeholder="Video v1"
                className="mt-1 w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 text-sm text-white" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-white">Budget diario (R$)</label>
            <input type="number" value={customBudget} onChange={(e) => setCustomBudget(parseFloat(e.target.value) || 0)}
              className="mt-1 w-28 rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 text-sm text-white" />
            <p className={`text-xs mt-1 ${budgetAvailable < customBudget ? "text-red-400" : "text-[#666]"}`}>
              Disponivel: R${budgetAvailable.toFixed(0)} de R${allocation?.daily_target || 500}/dia
            </p>
          </div>
        </div>
      )}

      {/* Step 4: Review & Launch */}
      {step === 4 && (
        <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Revisao e Lancamento</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-[#1e1e1e]">
              <span className="text-[#999]">Criativo</span>
              <span className="text-white">{file?.name || "—"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1e1e1e]">
              <span className="text-[#999]">Tipo</span>
              <span className="text-white">{selectedTemplate?.label || campaignType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1e1e1e]">
              <span className="text-[#999]">Budget</span>
              <span className="text-white">R${customBudget}/dia</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1e1e1e]">
              <span className="text-[#999]">Campanha</span>
              <span className="text-white">{campaignName || autoName()}</span>
            </div>
          </div>

          <div className="rounded-lg bg-[#0a0a0a] p-4 text-xs text-[#666] space-y-1">
            <p className="text-[#999] font-medium mb-2">O agente vai:</p>
            <p>Monitorar a cada 4h</p>
            <p>Pausar se gastar {`>`} R$200 sem vendas</p>
            <p>Pausar se CPA {`>`} R$93,60 por 3 dias</p>
            <p>Escalar se CPA {`<`} R$50 por 3 dias</p>
            <p>Respeitar learning phase (72h)</p>
            <p>Verificar budget total antes de escalar</p>
          </div>

          {!launchResult && !launchError && (
            <button onClick={handleLaunch} disabled={launching || !creativeId}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#e89b6a] px-6 py-3 text-base font-bold text-black hover:bg-[#d88a5a] disabled:opacity-50">
              {launching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />}
              {launching ? "Lancando..." : "LANCAR CAMPANHA"}
            </button>
          )}

          {launchSteps.length > 0 && (
            <div className="space-y-1">
              {launchSteps.map((s, i) => (
                <p key={i} className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-[#999]">{s}</span>
                </p>
              ))}
            </div>
          )}

          {launchError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
              <p className="text-sm text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> {launchError}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={() => setStep(s => Math.max(1, s - 1) as Step)} disabled={step === 1}
          className="flex items-center gap-1 rounded-lg border border-[#333] px-4 py-2 text-sm text-[#999] hover:text-white disabled:opacity-30">
          <ChevronLeft className="h-4 w-4" /> Voltar
        </button>
        {step < 4 && (
          <button onClick={() => setStep(s => Math.min(4, s + 1) as Step)}
            disabled={step === 1 && !creativeId}
            className="flex items-center gap-1 rounded-lg bg-[#e89b6a] px-4 py-2 text-sm font-medium text-black hover:bg-[#d88a5a] disabled:opacity-50">
            Proximo <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
