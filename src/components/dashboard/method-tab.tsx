"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Megaphone,
  Users,
  PenTool,
  Video,
  TrendingUp,
  Settings,
  CalendarDays,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function Section({
  title,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="border-zinc-800 bg-zinc-950">
      <CardHeader className="cursor-pointer select-none" onClick={() => setOpen((v) => !v)}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-zinc-100">
            <Icon className="h-5 w-5 text-[#e89b6a]" />
            {title}
          </CardTitle>
          {open ? <ChevronUp className="h-5 w-5 text-zinc-400" /> : <ChevronDown className="h-5 w-5 text-zinc-400" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent className="pt-0">
          <Separator className="mb-4 bg-zinc-800" />
          {children}
        </CardContent>
      )}
    </Card>
  );
}

function CopyCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <p className="mb-2 text-sm font-semibold text-[#e89b6a]">{title}</p>
      <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">{text}</p>
    </div>
  );
}

function ScriptCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <p className="mb-2 text-sm font-semibold text-[#e89b6a]">{title}</p>
      <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">{text}</p>
    </div>
  );
}

export default function MethodTab() {
  return (
    <div className="space-y-4">
      {/* 1. Estrutura de Campanhas */}
      <Section title="Estrutura de Campanhas" icon={Megaphone} defaultOpen>
        <div className="space-y-4">
          {/* CAMP 1 */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-[#e89b6a] text-[#e89b6a]">Remarketing</Badge>
                <span className="text-sm font-bold text-white">CAMP 1 — Publico Quente</span>
              </div>
              <span className="text-sm font-bold text-[#e89b6a]">R$150/dia</span>
            </div>
            <div className="space-y-2 text-sm text-zinc-300">
              <p>1.1 Engajou IG @jp.asv 30d — R$50/dia</p>
              <p>1.2 Engajou IG JP + Bravy School 90d — R$50/dia</p>
              <p>1.3 Visitantes LP + Video Viewers — R$50/dia</p>
              <p className="text-xs text-zinc-500 mt-2">Todos excluem compradores ultimos 180d</p>
            </div>
          </div>

          {/* CAMP 2 */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-blue-500 text-blue-400">Prospeccao</Badge>
                <span className="text-sm font-bold text-white">CAMP 2 — Frio + LAL + Broad</span>
              </div>
              <span className="text-sm font-bold text-blue-400">R$200/dia</span>
            </div>
            <div className="space-y-2 text-sm text-zinc-300">
              <p>2.1 LAL 1% Engajados JP — R$50/dia</p>
              <p>2.2 Empreendedores Tech (25-40 anos) — R$50/dia</p>
              <p>2.3 Donos de Negocio (28-40 anos) — R$50/dia</p>
              <p>2.4 <span className="text-[#e89b6a]">BROAD</span> — Sem interesses, Brasil 25-40, ambos generos — R$50/dia</p>
              <p className="text-xs text-zinc-500 mt-2">Todos excluem publicos quentes + compradores 180d</p>
              <p className="text-xs text-zinc-500">BROAD: Sem interesses. So Brasil, 25-40 anos, ambos generos. O Pixel + CAPI guiam o algoritmo.</p>
            </div>
          </div>

          {/* CAMP 3 */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-purple-500 text-purple-400">ASC</Badge>
                <span className="text-sm font-bold text-white">CAMP 3 — Advantage+ Shopping</span>
              </div>
              <span className="text-sm font-bold text-purple-400">R$100/dia</span>
            </div>
            <div className="space-y-2 text-sm text-zinc-300">
              <p>Campanha totalmente automatizada do Meta. Nao tem ad sets manuais.</p>
              <p>Coloque 3-5 criativos e deixe o algoritmo otimizar.</p>
              <p className="text-xs text-zinc-500 mt-2">Meta gerencia audiencia, posicionamento e budget automaticamente.</p>
            </div>
          </div>

          {/* Budget total */}
          <div className="rounded-lg border border-[#e89b6a]/30 bg-[#e89b6a]/5 p-3 text-sm">
            <span className="text-[#e89b6a] font-bold">Budget total: R$450/dia</span>
            <span className="text-zinc-400"> (R$150 + R$200 + R$100) | Reserva pra escala: R$50/dia</span>
          </div>
        </div>
      </Section>

      {/* LTV e Breakeven */}
      <Section title="LTV e Breakeven" icon={DollarSign}>
        <div className="space-y-3 text-sm text-zinc-300">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-center">
              <p className="text-xs text-zinc-500">CPA Breakeven (Low Ticket)</p>
              <p className="text-xl font-bold text-red-400">R$93,60</p>
              <p className="text-xs text-zinc-500">Acima disso = prejuizo</p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-center">
              <p className="text-xs text-zinc-500">CPA Sustentavel (com LTV)</p>
              <p className="text-xl font-bold text-[#e89b6a]">~R$247</p>
              <p className="text-xs text-zinc-500">Se 5% convertem mentoria R$3.000</p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-center">
              <p className="text-xs text-zinc-500">CPA Alvo Operacional</p>
              <p className="text-xl font-bold text-green-400">R$50</p>
              <p className="text-xs text-zinc-500">Meta pra escalar com folga</p>
            </div>
          </div>
          <p className="text-xs text-zinc-500">
            Low ticket (R$97) serve como porta de entrada. O lucro real vem da mentoria (R$3.000).
            Se 5% dos compradores convertem, o LTV medio por comprador e ~R$247, permitindo CPA ate esse valor sem prejuizo no funil completo.
          </p>
        </div>
      </Section>

      {/* 2. Publicos Criados */}
      <Section title="Publicos Criados" icon={Users}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Nome</TableHead>
                <TableHead className="text-zinc-400">Tipo</TableHead>
                <TableHead className="text-zinc-400">Periodo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { nome: "Engajou IG @jp.asv", tipo: "Engajamento", periodo: "30 dias" },
                { nome: "Engajou IG @jp.asv + @asv.digital", tipo: "Engajamento", periodo: "90 dias" },
                { nome: "Visitou LP bravy.com.br", tipo: "Trafego", periodo: "30 dias" },
                { nome: "Video Viewers 75%", tipo: "Engajamento", periodo: "30 dias" },
                { nome: "Compradores Kirvano", tipo: "Custom", periodo: "180 dias (exclusao)" },
                { nome: "LAL 1% Engajados JP", tipo: "Lookalike", periodo: "\u2014" },
                { nome: "LAL 1% Compradores", tipo: "Lookalike", periodo: "\u2014" },
              ].map((row, i) => (
                <TableRow key={i} className="border-zinc-800">
                  <TableCell className="font-medium text-zinc-100">{row.nome}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-zinc-600 text-zinc-300">{row.tipo}</Badge>
                  </TableCell>
                  <TableCell className="text-zinc-300">{row.periodo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      {/* 3. Angulos Criativos */}
      <Section title="5 Angulos Criativos" icon={PenTool}>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          <CopyCard
            title="Angulo 1 — Custo de Equipe"
            text={`"Voce paga R$3.000+ por mes em funcionarios para fazer o que uma IA faz em segundos?"\n\n56 Skills de Claude Code que substituem equipes inteiras.\nDe automacao de codigo a gestao de projetos — tudo pronto pra usar.\nR$97. Pagamento unico.\n\nLink na bio`}
          />
          <CopyCard
            title="Angulo 2 — Prova Social"
            text={`"Mais de [X] profissionais ja estao usando as 56 Skills."\n\nQuem testou nao volta atras. O resultado e imediato.\nSe voce trabalha com tech, marketing ou gestao — isso vai mudar sua rotina.\nR$97 uma unica vez. Sem mensalidade.\n\nbravy.com.br/skills-claude-code`}
          />
          <CopyCard
            title="Angulo 3 — Curiosidade"
            text={`"Descobri como substituir 5 ferramentas pagas por um unico assistente de IA."\n\nSao 56 skills prontas que fazem de tudo: codigo, planilhas, copywriting, analise de dados...\nE custa menos que um almoco executivo.\n\nLink na bio`}
          />
          <CopyCard
            title="Angulo 4 — Antes/Depois"
            text={`"Antes: 3h por dia fazendo tarefas repetitivas.\nDepois: 15 minutos. Claude Code fez o resto."\n\nMostra o antes (tela cheia de abas, estresse) e o depois (terminal limpo, resultado pronto).\nR$97. Acesso imediato.\n\nLink na bio`}
          />
          <CopyCard
            title="Angulo 5 — Polemica"
            text={`"Se voce ainda faz [tarefa] manualmente, voce esta jogando dinheiro fora."\n\nIA ja faz isso melhor, mais rapido e de graca.\nA diferenca e que voce precisa saber pedir.\n56 Skills prontas pra isso. R$97.\n\nLink na bio`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-500">
          <strong className="text-zinc-400">Rotacao:</strong> Troque o angulo principal a cada 2-3 semanas. Use os 5 angulos em paralelo testando A/B. Quando um satura (CTR cai + frequencia sobe), pause e traga o proximo.
        </div>
      </Section>

      {/* 4. Roteiros dos Criativos */}
      <Section title="Roteiros dos Criativos" icon={Video}>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          <ScriptCard
            title="Roteiro 1 — Talking Head"
            text={`Hook (0-3s): "Eu pagava R$3 mil por mes numa equipe... ate descobrir isso."\n\nDesenvolvimento (3-15s): Mostrar Claude Code em acao. Explicar que sao 56 skills prontas.\n\nCTA (15-20s): "Link na bio. R$97, pagamento unico."`}
          />
          <ScriptCard
            title="Roteiro 2 — Screen Recording"
            text={`Hook (0-3s): Tela com terminal + "Olha o que essa IA faz em 30 segundos"\n\nDemo (3-25s): Rodar 1 skill mostrando input -> output impressionante\n\nCTA (25-30s): Texto overlay: "56 Skills como essa. R$97. Link na bio."`}
          />
          <ScriptCard
            title="Roteiro 3 — Carrossel 8 Funcoes"
            text={`Slide 1: "8 coisas que o Claude Code faz melhor que sua equipe"\n\nSlides 2-8: Uma skill por slide com exemplo visual\n\nSlide 9: CTA: "Sao 56 no total. R$97. Link na bio."`}
          />
        </div>
      </Section>

      {/* 5. Regras de Escala */}
      <Section title="Regras de Escala" icon={TrendingUp}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Condicao</TableHead>
                <TableHead className="text-zinc-400">Acao</TableHead>
                <TableHead className="text-zinc-400">Detalhe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { condicao: "CPA < R$50 por 3+ dias consecutivos", acao: "Escalar 20-30%", detalhe: "Aumentar budget gradualmente. Teto R$200/dia por ad set.", color: "text-green-400" },
                { condicao: "CPA R$50-70", acao: "Observar", detalhe: "Testar novos criativos. Nao escalar.", color: "text-yellow-400" },
                { condicao: "CPA > R$70 por 3+ dias consecutivos", acao: "Matar conjunto", detalhe: "Pausar e redistribuir budget", color: "text-red-400" },
                { condicao: "CPA > R$93,60 por 3+ dias", acao: "Auto-pause (prejuizo)", detalhe: "Agente pausa automaticamente. Acima do breakeven.", color: "text-red-400" },
                { condicao: "Gasto > R$200 sem venda", acao: "Pausar imediatamente", detalhe: "Acao imediata. Nao espera 3 dias.", color: "text-red-400" },
                { condicao: "CTR < 0.8%", acao: "Trocar criativo", detalhe: "Hook nao esta funcionando", color: "text-yellow-400" },
                { condicao: "Frequencia > 5", acao: "Trocar criativo", detalhe: "Publico saturado", color: "text-yellow-400" },
              ].map((row, i) => (
                <TableRow key={i} className="border-zinc-800">
                  <TableCell className="font-medium text-zinc-100">{row.condicao}</TableCell>
                  <TableCell className={row.color}>{row.acao}</TableCell>
                  <TableCell className="text-zinc-300">{row.detalhe}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      {/* 6. Checklist de Infraestrutura */}
      <Section title="Checklist de Infraestrutura" icon={Settings}>
        <ul className="space-y-3">
          {[
            "Pixel Meta instalado na LP",
            "Evento Purchase configurado (via Kirvano webhook + CAPI)",
            "Dominio verificado no Business Manager",
            "Publicos criados (Engajamento, Trafego, Custom, LAL)",
            "Compradores 180d como exclusao em todas as campanhas",
            "UTMs configuradas nos anuncios",
            "LP mobile-friendly testada",
            "Checkout Kirvano testado end-to-end",
            "WhatsApp notificacoes configurado",
            "Automacoes do agente ativadas (auto-pause, auto-scale)",
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
              <span className="text-sm text-zinc-300">{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* 7. Cronograma da Semana */}
      <Section title="Cronograma da Semana" icon={CalendarDays}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Dia</TableHead>
                <TableHead className="text-zinc-400">Acao</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { dia: "Segunda", acao: "Revisar metricas do fim de semana. Agente ja ajustou budgets automaticamente." },
                { dia: "Terca", acao: "Subir novos criativos se algum esgotou. Upload 1-clique distribui sozinho." },
                { dia: "Quarta", acao: "Checar briefing diario. Verificar overlap de publicos." },
                { dia: "Quinta", acao: "Analisar testes A/B. Aplicar decisao se confianca > 90%." },
                { dia: "Sexta", acao: "Conferir se agente escalou vencedores. Ajustar teto de budget se necessario." },
                { dia: "Sabado", acao: "Monitorar via WhatsApp. Agente roda sozinho." },
                { dia: "Domingo", acao: "Dia leve. Agente monitora e notifica se algo critico acontecer." },
              ].map((row, i) => (
                <TableRow key={i} className="border-zinc-800">
                  <TableCell className="font-medium text-[#e89b6a]">{row.dia}</TableCell>
                  <TableCell className="text-zinc-300">{row.acao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>
    </div>
  );
}
