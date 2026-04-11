"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Bot, Send, Loader2, CheckCircle, XCircle, Info, Heart, Lock, Trash2, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";

function Toggle({ label, description, checked, onChange }: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-[#666] mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-[#e89b6a]" : "bg-[#333]"}`}
      >
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

function NumberField({ label, description, value, onChange, suffix }: {
  label: string;
  description?: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="py-2">
      <label className="text-sm font-medium text-white">{label}</label>
      {description && <p className="text-xs text-[#666] mt-0.5">{description}</p>}
      <div className="flex items-center gap-2 mt-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-28 rounded-lg border border-[#333] bg-[#111] px-3 py-1.5 text-sm text-white"
        />
        {suffix && <span className="text-xs text-[#666]">{suffix}</span>}
      </div>
    </div>
  );
}

export default function SettingsTab() {
  // WhatsApp config
  const [whatsappProvider, setWhatsappProvider] = useState("z-api");
  const [whatsappInstanceId, setWhatsappInstanceId] = useState("");
  // whatsappToken: campo EDITÁVEL. Começa sempre vazio. Se user não digitar nada,
  // save envia undefined e backend preserva o valor atual. Se user digitar, envia o
  // novo valor. Elimina ambiguidade do "••••••xxxx" mascarado sendo confundido
  // com valor real pelo useState.
  const [whatsappToken, setWhatsappToken] = useState("");
  // Preview do token salvo (só os últimos 4 chars mascarados). Read-only, só pra
  // user confirmar que EXISTE um token configurado.
  const [tokenPreview, setTokenPreview] = useState<string | null>(null);
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [notifyAutoActions, setNotifyAutoActions] = useState(true);
  const [notifyCreativeActions, setNotifyCreativeActions] = useState(true);
  const [notifyLearningPhase, setNotifyLearningPhase] = useState(true);
  const [notifyAlerts, setNotifyAlerts] = useState(true);
  const [notifyDailySummary, setNotifyDailySummary] = useState(true);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifSaveStatus, setNotifSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [notifSaveError, setNotifSaveError] = useState<string | null>(null);
  const [notifTestResult, setNotifTestResult] = useState<string | null>(null);
  const [notifLogs, setNotifLogs] = useState<any[]>([]);

  // Heartbeat
  const [heartbeat, setHeartbeat] = useState<any>(null);

  // Automation locks
  const [locks, setLocks] = useState<any[]>([]);
  const [locksLoading, setLocksLoading] = useState(false);

  // Automation config
  const [autoPauseNoSales, setAutoPauseNoSales] = useState(true);
  const [autoPauseSpendLimit, setAutoPauseSpendLimit] = useState(200);
  const [autoPauseBreakeven, setAutoPauseBreakeven] = useState(true);
  const [breakevenCPA, setBreakevenCPA] = useState(93.60);
  const [breakevenMinDays, setBreakevenMinDays] = useState(3);
  const [autoScaleWinners, setAutoScaleWinners] = useState(true);
  const [autoScaleCPAThreshold, setAutoScaleCPAThreshold] = useState(50);
  const [autoScalePercent, setAutoScalePercent] = useState(20);
  const [autoScaleMinDays, setAutoScaleMinDays] = useState(3);
  const [autoScaleMaxBudget, setAutoScaleMaxBudget] = useState(200);
  const [respectLearningPhase, setRespectLearningPhase] = useState(true);
  const [learningPhaseHours, setLearningPhaseHours] = useState(72);
  const [notifyOnAutoAction, setNotifyOnAutoAction] = useState(true);
  const [cpaPauseThreshold, setCpaPauseThreshold] = useState(70);
  const [autoSaving, setAutoSaving] = useState(false);

  useEffect(() => {
    api.getNotifConfig().then((data) => {
      if (data) {
        setWhatsappProvider(data.whatsappProvider || "z-api");
        setWhatsappInstanceId(data.whatsappInstanceId || "");
        // Token NUNCA entra no input editável. Só vai pro preview read-only.
        setWhatsappToken("");
        setTokenPreview(data.whatsappToken || null);
        setWhatsappPhone(data.whatsappPhone || "");
        setEnabled(data.enabled ?? true);
        setNotifyAutoActions(data.notifyAutoActions ?? true);
        setNotifyCreativeActions(data.notifyCreativeActions ?? true);
        setNotifyLearningPhase(data.notifyLearningPhase ?? true);
        setNotifyAlerts(data.notifyAlerts ?? true);
        setNotifyDailySummary(data.notifyDailySummary ?? true);
      }
    }).catch(() => {});

    api.getAutomationConfig().then((data) => {
      if (data) {
        setAutoPauseNoSales(data.autoPauseNoSales ?? true);
        setAutoPauseSpendLimit(data.autoPauseSpendLimit ?? 200);
        setAutoPauseBreakeven(data.autoPauseBreakeven ?? true);
        setBreakevenCPA(data.breakevenCPA ?? 93.60);
        setBreakevenMinDays(data.breakevenMinDays ?? 3);
        setAutoScaleWinners(data.autoScaleWinners ?? true);
        setAutoScaleCPAThreshold(data.autoScaleCPAThreshold ?? 50);
        setAutoScalePercent(data.autoScalePercent ?? 20);
        setAutoScaleMinDays(data.autoScaleMinDays ?? 3);
        setAutoScaleMaxBudget(data.autoScaleMaxBudget ?? 200);
        setRespectLearningPhase(data.respectLearningPhase ?? true);
        setLearningPhaseHours(data.learningPhaseHours ?? 72);
        setNotifyOnAutoAction(data.notifyOnAutoAction ?? true);
        setCpaPauseThreshold(data.cpaPauseThreshold ?? 70);
      }
    }).catch(() => {});

    api.getNotifLog().then(setNotifLogs).catch(() => {});
    api.getHeartbeat().then(setHeartbeat).catch(() => {});
    loadLocks();
  }, []);

  const loadLocks = useCallback(async () => {
    setLocksLoading(true);
    try {
      const data = await api.getAutomationLocks();
      setLocks(data.data || []);
    } catch {}
    setLocksLoading(false);
  }, []);

  const releaseLock = async (id: string) => {
    try {
      await api.deleteAutomationLock(id);
      setLocks((prev) => prev.filter((l) => l.id !== id));
    } catch {}
  };

  const saveNotifConfig = async () => {
    setNotifSaving(true);
    setNotifSaveStatus("idle");
    setNotifSaveError(null);
    try {
      // Só envia o token se o user digitou algo. Campo vazio = preservar o
      // valor atual no backend (undefined é ignorado pelo PUT).
      const tokenToSend = whatsappToken.trim() !== "" ? whatsappToken : undefined;
      const updated = await api.updateNotifConfig({
        whatsappProvider, whatsappInstanceId,
        whatsappToken: tokenToSend,
        whatsappPhone, enabled,
        notifyAutoActions, notifyCreativeActions, notifyLearningPhase, notifyAlerts, notifyDailySummary,
      });
      // Atualiza preview com o token mascarado que voltou do backend, e limpa
      // o input pra confirmar visualmente que o save funcionou.
      setTokenPreview(updated?.whatsappToken || null);
      setWhatsappToken("");
      setNotifSaveStatus("success");
    } catch (err: any) {
      setNotifSaveStatus("error");
      setNotifSaveError(err?.message || "erro desconhecido");
    }
    setNotifSaving(false);
  };

  const testWhatsApp = async () => {
    setNotifTestResult(null);
    try {
      const result = await api.testNotification();
      setNotifTestResult(result.success ? "success" : "fail");
    } catch {
      setNotifTestResult("fail");
    }
  };

  const saveAutoConfig = async () => {
    setAutoSaving(true);
    try {
      await api.updateAutomationConfig({
        autoPauseNoSales, autoPauseSpendLimit, autoPauseBreakeven,
        breakevenCPA, breakevenMinDays, autoScaleWinners,
        autoScaleCPAThreshold, autoScalePercent, autoScaleMinDays,
        autoScaleMaxBudget, respectLearningPhase, learningPhaseHours,
        notifyOnAutoAction, cpaPauseThreshold,
      });
    } catch {}
    setAutoSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Agent Heartbeat */}
      {heartbeat && (
        <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-5 w-5 text-red-400" />
            <h2 className="text-lg font-bold text-white">Status do Agente</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              heartbeat.status === "healthy" ? "bg-green-500/10 text-green-400 border border-green-500/30" :
              heartbeat.status === "warning" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30" :
              heartbeat.status === "critical" ? "bg-red-500/10 text-red-400 border border-red-500/30" :
              "bg-red-500/10 text-red-400 border border-red-500/30"
            }`}>
              <span className={`h-2 w-2 rounded-full ${
                heartbeat.status === "healthy" ? "bg-green-400" :
                heartbeat.status === "warning" ? "bg-yellow-400" : "bg-red-400"
              }`} />
              {heartbeat.status === "healthy" ? "Saudavel" :
               heartbeat.status === "warning" ? "Warning" :
               heartbeat.status === "critical" ? "Critico" : "Offline"}
            </span>
            {heartbeat.lastCollectionAt && (
              <span className="text-xs text-[#666]">
                Ultima coleta ha {heartbeat.hoursSinceCollection}h
              </span>
            )}
            {heartbeat.consecutiveFailures > 0 && (
              <span className="text-xs text-red-400">
                {heartbeat.consecutiveFailures} falha(s) consecutiva(s)
              </span>
            )}
            {heartbeat.dailySpendSoFar > 0 && (
              <span className="text-xs text-[#999]">
                Gasto hoje: R${heartbeat.dailySpendSoFar.toFixed(0)}
              </span>
            )}
          </div>
          {heartbeat.lastError && (
            <p className="mt-2 text-xs text-red-400/80">Erro: {heartbeat.lastError}</p>
          )}
        </div>
      )}

      {/* Automation Locks */}
      <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-yellow-400" />
            <h2 className="text-lg font-bold text-white">Locks Ativos</h2>
            <span className="text-xs text-[#666]">Coordenacao entre automacoes</span>
          </div>
          <button onClick={loadLocks} disabled={locksLoading} className="p-1.5 rounded-lg hover:bg-[#1e1e1e] transition-colors">
            <RefreshCw className={`h-4 w-4 text-[#666] ${locksLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {locks.length === 0 ? (
          <p className="text-sm text-[#666]">Nenhum lock ativo. Todas as automacoes podem agir livremente.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[#666] border-b border-[#1e1e1e]">
                  <th className="text-left py-2 pr-4">Entidade</th>
                  <th className="text-left py-2 pr-4">Bloqueado por</th>
                  <th className="text-left py-2 pr-4">Acao</th>
                  <th className="text-left py-2 pr-4">Budget</th>
                  <th className="text-left py-2 pr-4">Expira em</th>
                  <th className="text-right py-2"></th>
                </tr>
              </thead>
              <tbody>
                {locks.map((lock: any) => (
                  <tr key={lock.id} className="border-b border-[#1e1e1e]/50">
                    <td className="py-2 pr-4 text-white">
                      <span className="text-[#666]">{lock.entityType}</span> {lock.entityId.slice(0, 12)}...
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        lock.lockedBy === "ab_resolver" ? "bg-purple-500/10 text-purple-400" :
                        lock.lockedBy === "auto_executor" ? "bg-blue-500/10 text-blue-400" :
                        lock.lockedBy === "budget_rebalancer" ? "bg-green-500/10 text-green-400" :
                        "bg-yellow-500/10 text-yellow-400"
                      }`}>
                        {lock.lockedBy}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-[#999]">{lock.action}</td>
                    <td className="py-2 pr-4 text-[#999]">
                      {lock.previousValue != null && lock.newValue != null
                        ? `R$${lock.previousValue} → R$${lock.newValue}`
                        : "—"}
                    </td>
                    <td className="py-2 pr-4">
                      {lock.isExpired ? (
                        <span className="text-red-400">Expirado</span>
                      ) : (
                        <span className="text-[#999]">{lock.expiresIn}min</span>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => releaseLock(lock.id)}
                        className="p-1 rounded hover:bg-red-500/10 transition-colors"
                        title="Liberar lock"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* WhatsApp Notifications */}
      <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="h-5 w-5 text-green-400" />
          <h2 className="text-lg font-bold text-white">Notificações WhatsApp</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-white">Provedor</label>
            <select
              value={whatsappProvider}
              onChange={(e) => setWhatsappProvider(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 text-sm text-white"
            >
              <option value="z-api">Z-API</option>
              <option value="zappfy">Zappfy</option>
              <option value="evolution">Evolution API</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-white">Telefone do operador</label>
            <input
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              placeholder="5511999999999"
              className="mt-1 w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-white">Instance ID</label>
            <input
              value={whatsappInstanceId}
              onChange={(e) => setWhatsappInstanceId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-white">Token</label>
            <input
              value={whatsappToken}
              onChange={(e) => setWhatsappToken(e.target.value)}
              type="password"
              autoComplete="new-password"
              name="whatsapp-token-field"
              placeholder={tokenPreview ? "Deixe vazio para manter o atual" : "Cole o token aqui"}
              className="mt-1 w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder:text-[#666]"
            />
            {tokenPreview && (
              <p className="mt-1 text-xs text-[#666]">
                Token salvo: <span className="font-mono text-[#999]">{tokenPreview}</span>
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-[#1e1e1e] pt-4">
          <p className="text-sm font-medium text-white mb-2">Tipos de notificação</p>
          <Toggle label="Ações automáticas" description="Auto-pause, auto-scale executados pelo agente" checked={notifyAutoActions} onChange={setNotifyAutoActions} />
          <Toggle label="Criativos" description="Distribuição e esgotamento de criativos" checked={notifyCreativeActions} onChange={setNotifyCreativeActions} />
          <Toggle label="Fase de aprendizado" description="Quando uma campanha sai da fase de aprendizado" checked={notifyLearningPhase} onChange={setNotifyLearningPhase} />
          <Toggle label="Alertas críticos" description="Token expirado, chargeback, sistema offline" checked={notifyAlerts} onChange={setNotifyAlerts} />
          <Toggle label="Resumo diário (8h)" description="Métricas do dia anterior enviadas todo dia às 8h" checked={notifyDailySummary} onChange={setNotifyDailySummary} />
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={saveNotifConfig}
            disabled={notifSaving}
            className="flex items-center gap-2 rounded-lg bg-[#e89b6a] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#d88a5a]"
          >
            {notifSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Salvar
          </button>
          <button
            onClick={testWhatsApp}
            className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20"
          >
            <Send className="h-4 w-4" />
            Enviar Teste
          </button>
          {notifTestResult === "success" && (
            <span className="flex items-center gap-1 text-sm text-green-400"><CheckCircle className="h-4 w-4" /> Enviado!</span>
          )}
          {notifTestResult === "fail" && (
            <span className="flex items-center gap-1 text-sm text-red-400"><XCircle className="h-4 w-4" /> Falhou</span>
          )}
          {notifSaveStatus === "success" && (
            <span className="flex items-center gap-1 text-sm text-green-400"><CheckCircle className="h-4 w-4" /> Config salva</span>
          )}
          {notifSaveStatus === "error" && (
            <span className="flex items-center gap-1 text-sm text-red-400" title={notifSaveError ?? undefined}>
              <XCircle className="h-4 w-4" /> Erro ao salvar{notifSaveError ? `: ${notifSaveError}` : ""}
            </span>
          )}
        </div>

        {/* Notification logs */}
        {notifLogs.length > 0 && (
          <div className="mt-4 border-t border-[#1e1e1e] pt-4">
            <p className="text-sm font-medium text-white mb-2">Últimas notificações</p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {notifLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between text-xs py-1">
                  <span className="text-[#999]">{new Date(log.createdAt).toLocaleString("pt-BR")}</span>
                  <span className="text-[#666] truncate max-w-[200px]">{log.type}</span>
                  <span className={log.status === "sent" ? "text-green-400" : "text-red-400"}>
                    {log.status === "sent" ? "Enviado" : "Falhou"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Automation Config */}
      <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bot className="h-5 w-5 text-[#e89b6a]" />
          <h2 className="text-lg font-bold text-white">Automações do Agente</h2>
        </div>

        {/* Auto-pause sem vendas */}
        <div className="border-b border-[#1e1e1e] pb-4 mb-4">
          <Toggle
            label="Auto-pausar sem vendas"
            description="Se gastar mais de X reais e não fizer nenhuma venda, o agente pausa automaticamente pra não queimar dinheiro."
            checked={autoPauseNoSales}
            onChange={setAutoPauseNoSales}
          />
          {autoPauseNoSales && (
            <NumberField label="Limite de gasto" value={autoPauseSpendLimit} onChange={setAutoPauseSpendLimit} suffix="R$" />
          )}
        </div>

        {/* Auto-pause breakeven */}
        <div className="border-b border-[#1e1e1e] pb-4 mb-4">
          <Toggle
            label="Auto-pausar CPA acima do breakeven"
            description="Se o custo por venda ficar acima de R$93,60 por 3 dias seguidos, está dando prejuízo. O agente pausa."
            checked={autoPauseBreakeven}
            onChange={setAutoPauseBreakeven}
          />
          {autoPauseBreakeven && (
            <div className="grid gap-2 md:grid-cols-2">
              <NumberField label="CPA de breakeven" value={breakevenCPA} onChange={setBreakevenCPA} suffix="R$" />
              <NumberField label="Dias consecutivos" value={breakevenMinDays} onChange={setBreakevenMinDays} suffix="dias" />
            </div>
          )}
        </div>

        {/* Auto-scale */}
        <div className="border-b border-[#1e1e1e] pb-4 mb-4">
          <Toggle
            label="Auto-escalar vencedores"
            description="Se um ad set vende com CPA abaixo de R$50 por 3 dias seguidos, o agente aumenta o investimento em 20%."
            checked={autoScaleWinners}
            onChange={setAutoScaleWinners}
          />
          {autoScaleWinners && (
            <div className="grid gap-2 md:grid-cols-2">
              <NumberField label="CPA máximo pra escalar" value={autoScaleCPAThreshold} onChange={setAutoScaleCPAThreshold} suffix="R$" />
              <NumberField label="% de aumento" value={autoScalePercent} onChange={setAutoScalePercent} suffix="%" />
              <NumberField label="Dias consecutivos" value={autoScaleMinDays} onChange={setAutoScaleMinDays} suffix="dias" />
              <NumberField label="Budget máximo" value={autoScaleMaxBudget} onChange={setAutoScaleMaxBudget} suffix="R$/dia" />
            </div>
          )}
        </div>

        {/* CPA pause threshold */}
        <div className="border-b border-[#1e1e1e] pb-4 mb-4">
          <NumberField
            label="CPA de alerta para pausar"
            description="CPA acima desse valor por 3+ dias gera alerta vermelho"
            value={cpaPauseThreshold}
            onChange={setCpaPauseThreshold}
            suffix="R$"
          />
        </div>

        {/* Learning phase */}
        <div className="border-b border-[#1e1e1e] pb-4 mb-4">
          <Toggle
            label="Respeitar fase de aprendizado"
            description="Campanhas novas ficam protegidas por 72h — o agente não pausa nem escala durante esse período."
            checked={respectLearningPhase}
            onChange={setRespectLearningPhase}
          />
          {respectLearningPhase && (
            <NumberField label="Horas de aprendizado" value={learningPhaseHours} onChange={setLearningPhaseHours} suffix="horas" />
          )}
        </div>

        {/* Notify */}
        <Toggle
          label="Notificar via WhatsApp"
          description="Envia mensagem quando o agente executa uma ação automática"
          checked={notifyOnAutoAction}
          onChange={setNotifyOnAutoAction}
        />

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={saveAutoConfig}
            disabled={autoSaving}
            className="flex items-center gap-2 rounded-lg bg-[#e89b6a] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#d88a5a]"
          >
            {autoSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Salvar Automações
          </button>
        </div>

        {/* Info box */}
        <div className="mt-4 rounded-lg border border-[#333] bg-[#0a0a0a] p-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-[#e89b6a] mt-0.5 flex-shrink-0" />
            <div className="text-xs text-[#666] space-y-1">
              <p><strong className="text-[#999]">Regra de ouro:</strong> O agente NUNCA executa ações destrutivas irreversíveis. Ele apenas pausa ad sets e ajusta budgets dentro dos limites configurados.</p>
              <p><strong className="text-[#999]">Ação imediata:</strong> Gasto {`>`} limite sem vendas = pause automático (não espera 3 dias).</p>
              <p><strong className="text-[#999]">3+ dias:</strong> Todas as outras regras de escala/pause exigem 3 dias consecutivos de dados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
