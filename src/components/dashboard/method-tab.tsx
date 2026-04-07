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

// ---------------------------------------------------------------------------
// Collapsible Section
// ---------------------------------------------------------------------------

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
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-zinc-100">
            <Icon className="h-5 w-5 text-[#e89b6a]" />
            {title}
          </CardTitle>
          {open ? (
            <ChevronUp className="h-5 w-5 text-zinc-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-zinc-400" />
          )}
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

// ---------------------------------------------------------------------------
// Copy Card
// ---------------------------------------------------------------------------

function CopyCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <p className="mb-2 text-sm font-semibold text-[#e89b6a]">{title}</p>
      <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">
        {text}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Script Card
// ---------------------------------------------------------------------------

function ScriptCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <p className="mb-2 text-sm font-semibold text-[#e89b6a]">{title}</p>
      <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">
        {text}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function MethodTab() {
  return (
    <div className="space-y-4">
      {/* 1. Estrutura de Campanhas */}
      <Section title="Estrutura de Campanhas" icon={Megaphone} defaultOpen>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Campanha</TableHead>
                <TableHead className="text-zinc-400">Tipo</TableHead>
                <TableHead className="text-zinc-400">Publico</TableHead>
                <TableHead className="text-right text-zinc-400">
                  Budget/dia
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-zinc-800">
                <TableCell className="font-medium text-zinc-100">
                  CAMP 1 — Remarketing Quente
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="border-[#e89b6a] text-[#e89b6a]"
                  >
                    Remarketing
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-300">
                  Engajou IG @jp.asv 30-90d
                </TableCell>
                <TableCell className="text-right text-zinc-100">
                  R$150
                </TableCell>
              </TableRow>
              <TableRow className="border-zinc-800">
                <TableCell className="font-medium text-zinc-100">
                  CAMP 2 — Prospecção Frio + LAL
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="border-blue-500 text-blue-400"
                  >
                    Prospecção
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-300">
                  LAL 1% + Interesses Empreendedorismo/Tech
                </TableCell>
                <TableCell className="text-right text-zinc-100">
                  R$150
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
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
                {
                  nome: "Engajou IG @jp.asv",
                  tipo: "Engajamento",
                  periodo: "30 dias",
                },
                {
                  nome: "Engajou IG @jp.asv",
                  tipo: "Engajamento",
                  periodo: "90 dias",
                },
                {
                  nome: "Visitou LP bravy.com.br",
                  tipo: "Trafego",
                  periodo: "30 dias",
                },
                {
                  nome: "Compradores Kirvano",
                  tipo: "Custom",
                  periodo: "All time",
                },
                {
                  nome: "LAL 1% Compradores",
                  tipo: "Lookalike",
                  periodo: "\u2014",
                },
                {
                  nome: "LAL 1% Engajamento 90d",
                  tipo: "Lookalike",
                  periodo: "\u2014",
                },
              ].map((row, i) => (
                <TableRow key={i} className="border-zinc-800">
                  <TableCell className="font-medium text-zinc-100">
                    {row.nome}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-zinc-600 text-zinc-300"
                    >
                      {row.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-300">{row.periodo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      {/* 3. Copies Prontas */}
      <Section title="Copies Prontas" icon={PenTool}>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          <CopyCard
            title="Copy 1 — Dor/Urgencia"
            text={`Voce ainda paga R$3.000+ por mes em funcionarios para fazer o que uma IA faz em segundos?\n56 Skills de Claude Code que substituem equipes inteiras.\nDe automacao de codigo a gestao de projetos — tudo pronto pra usar.\nPor apenas R$97. Pagamento unico.\n\ud83d\udd17 Link na bio`}
          />
          <CopyCard
            title="Copy 2 — Prova Social"
            text={`Mais de [X] profissionais ja estao usando as 56 Skills.\nQuem testou nao volta atras. O resultado e imediato.\nSe voce trabalha com tech, marketing ou gestao — isso vai mudar sua rotina.\nR$97 uma unica vez. Sem mensalidade.\n\ud83d\udd17 bravy.com.br/skills-claude-code`}
          />
          <CopyCard
            title="Copy 3 — Curiosidade"
            text={`Descobri como substituir 5 ferramentas pagas por um unico assistente de IA.\nSao 56 skills prontas que fazem de tudo: codigo, planilhas, copywriting, analise de dados...\nE custa menos que um almoco executivo.\n\ud83d\udd17 Link na bio`}
          />
        </div>
      </Section>

      {/* 4. Roteiros dos Criativos */}
      <Section title="Roteiros dos Criativos" icon={Video}>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          <ScriptCard
            title="Roteiro 1 — Talking Head (Hook Custo Equipe)"
            text={`Hook (0-3s): "Eu pagava R$3 mil por mes numa equipe... ate descobrir isso."\n\nDesenvolvimento (3-15s): Mostrar Claude Code em acao. Explicar que sao 56 skills prontas.\n\nCTA (15-20s): "Link na bio. R$97, pagamento unico. Vai gastar isso em cafe essa semana."`}
          />
          <ScriptCard
            title="Roteiro 2 — Screen Recording (Skill em 30s)"
            text={`Hook (0-3s): Tela com terminal + "Olha o que essa IA faz em 30 segundos"\n\nDemo (3-25s): Rodar 1 skill mostrando input → output impressionante\n\nCTA (25-30s): Texto overlay: "56 Skills como essa. R$97. Link na bio."`}
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
                {
                  condicao: "CPA < R$50 por 2+ dias",
                  acao: "Escalar 20-30%",
                  detalhe: "Aumentar budget gradualmente",
                  color: "text-green-400",
                },
                {
                  condicao: "CPA R$50-70",
                  acao: "Observar",
                  detalhe: "Testar novos criativos",
                  color: "text-yellow-400",
                },
                {
                  condicao: "CPA > R$70 por 2+ dias",
                  acao: "Matar conjunto",
                  detalhe: "Pausar e redistribuir budget",
                  color: "text-red-400",
                },
                {
                  condicao: "Gasto > R$200 sem venda",
                  acao: "Pausar imediatamente",
                  detalhe: "Cortar perdas",
                  color: "text-red-400",
                },
                {
                  condicao: "CTR < 0.8%",
                  acao: "Trocar criativo",
                  detalhe: "Hook nao esta funcionando",
                  color: "text-yellow-400",
                },
                {
                  condicao: "Frequencia > 5",
                  acao: "Trocar criativo",
                  detalhe: "Publico saturado",
                  color: "text-yellow-400",
                },
              ].map((row, i) => (
                <TableRow key={i} className="border-zinc-800">
                  <TableCell className="font-medium text-zinc-100">
                    {row.condicao}
                  </TableCell>
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
            "Evento Purchase configurado (via Kirvano webhook)",
            "Dominio verificado no Business Manager",
            "Publicos criados (Engajamento, Trafego, Custom, LAL)",
            "UTMs configuradas nos anuncios",
            "LP mobile-friendly testada",
            "Checkout Kirvano testado end-to-end",
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
                {
                  dia: "Segunda",
                  acao: "Revisar metricas do fim de semana. Ajustar budgets.",
                },
                {
                  dia: "Terca",
                  acao: "Testar novos criativos se CTR < 1%.",
                },
                {
                  dia: "Quarta",
                  acao: "Snapshot de metricas (registrar na dashboard).",
                },
                {
                  dia: "Quinta",
                  acao: "Analisar dados. Matar conjuntos ruins.",
                },
                {
                  dia: "Sexta",
                  acao: "Escalar o que esta funcionando.",
                },
                {
                  dia: "Sabado",
                  acao: "Snapshot de metricas. Monitorar.",
                },
                {
                  dia: "Domingo",
                  acao: "Dia leve. So monitorar gastos.",
                },
              ].map((row, i) => (
                <TableRow key={i} className="border-zinc-800">
                  <TableCell className="font-medium text-[#e89b6a]">
                    {row.dia}
                  </TableCell>
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
