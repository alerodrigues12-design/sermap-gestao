import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area,
} from "recharts";
import {
  Shield, TrendingDown, Building2, AlertTriangle, CheckCircle2,
  Clock, Target, ChevronDown, ChevronUp, AlertCircle, Info,
  Landmark, Scale, FileText, Users, Home, ArrowRight,
  Star, Award, MapPin, TrendingUp, Briefcase, Globe, DollarSign, Zap
} from "lucide-react";

// ─── Data ───────────────────────────────────────────────────────────────────

const passivoData = [
  { frente: "Tributário", atual: 3.8, meta: 1.5, color: "#E05252" },
  { frente: "Trabalhista", atual: 2.4, meta: 1.1, color: "#E07B30" },
  { frente: "Bancário/Cível", atual: 1.2, meta: 0.4, color: "#D4B830" },
];

const composicaoData = [
  { name: "Tributário (PGFN)", value: 3.8, color: "#E05252" },
  { name: "Trabalhista (22 proc.)", value: 2.4, color: "#E07B30" },
  { name: "Bancário/Cível", value: 1.2, color: "#D4B830" },
];

const radarData = [
  { subject: "Tributário", risco: 85, controle: 60 },
  { subject: "Trabalhista", risco: 70, controle: 55 },
  { subject: "Bancário", risco: 60, controle: 45 },
  { subject: "Pessoal (Sheila)", risco: 90, controle: 40 },
  { subject: "Societário", risco: 30, controle: 80 },
];

const cronogramaData = [
  {
    mes: "Mar/26", fase: 1, cor: "#E05252", concluido: true,
    acoes: [
      "✅ Peticionamento nos processos urgentes (TRF1 + TJBA)",
      "✅ Cancelamento do leilão — nova avaliação determinada",
      "✅ Petição de nulidade na execução fiscal da União (TRF1)",
      "✅ Mapeamento do passivo extrajudicial iniciado",
      "✅ Regularização de prazos perdidos",
    ]
  },
  {
    mes: "Abr/26", fase: 1, cor: "#E05252", concluido: false,
    acoes: [
      "Acompanhar nomeação e proposta de honorários do avaliador (leilão)",
      "Obter acesso e-CAC para análise de nulidade das CDAs",
      "Formalizar contratos de consultoria e NDA",
      "Monitorar desconsideração PJ (22 processos)",
    ]
  },
  {
    mes: "Mai/26", fase: 1, cor: "#E05252", concluido: false,
    acoes: [
      "⚠️ DECISÃO: Aderir ao PGDAU (prazo 29/05/2026) — somente se nulidade União for negada",
      "Aprovação da REF trabalhista pelo juízo",
      "Impugnar avaliação do leilão se necessário (prazo após entrega do laudo)",
    ]
  },
  {
    mes: "Jun/26", fase: 2, cor: "#E07B30", concluido: false,
    acoes: [
      "Aguardar decisão sobre nulidade da União — define estratégia PGFN",
      "Negociar débitos de condomínio (Hangar/Bradesco)",
      "Regularizar reintegração de posse do terreno",
      "Impugnar cálculos trabalhistas",
    ]
  },
  {
    mes: "Jul/26", fase: 2, cor: "#E07B30", concluido: false,
    acoes: [
      "Iniciar constituição da holding familiar",
      "Revisar contrato social da SERMAP",
    ]
  },
  {
    mes: "Ago/26", fase: 2, cor: "#E07B30", concluido: false,
    acoes: [
      "Previsão: nova hasta pública (4-6 meses após cancelamento do leilão)",
      "Negociar Banco do Brasil (liberação da fiança de Sheila)",
      "Negociar maiores credores trabalhistas com caixa disponível",
    ]
  },
  {
    mes: "Set/26", fase: 3, cor: "#D4B830", concluido: false,
    acoes: [
      "Avaliar venda de ativos não estratégicos",
      "Negociar credores bancários com deságio",
    ]
  },
  {
    mes: "Out/26", fase: 3, cor: "#D4B830", concluido: false,
    acoes: [
      "Revisar contrato social (cláusulas sucessórias)",
      "Integralizar bens na holding familiar",
    ]
  },
  {
    mes: "Nov/26", fase: 3, cor: "#D4B830", concluido: false,
    acoes: [
      "Planejamento tributário da holding",
      "Estruturar regime de dividendos",
    ]
  },
  {
    mes: "Dez/26", fase: 4, cor: "#4CAF7D", concluido: false,
    acoes: [
      "Revisão geral do plano estratégico",
      "Apresentação ao Family Office (Nilton)",
      "Implementar conselho consultivo",
    ]
  },
];

const gaps = [
  { id: 1, titulo: "Regularizar prazo perdido — Bradesco", urgencia: "alta", proc: "Proc. 8031952-37.2023", impacto: "Bradesco entra no polo passivo contra Sheila", resp: "Advogado cível" },
  { id: 2, titulo: "Regularizar reintegração de posse de Sheila", urgencia: "alta", proc: "Proc. 8027713-10.2024", impacto: "Extinção do processo — perda do ativo imobiliário", resp: "Advogado cível" },
  { id: 3, titulo: "Mapear pedidos de desconsideração PJ", urgencia: "alta", proc: "22 processos trabalhistas", impacto: "Risco de penhora de bens pessoais de Sheila", resp: "Advogado trabalhista" },
  { id: 4, titulo: "Acesso ao e-CAC para análise de nulidade", urgencia: "alta", proc: "CDAs IRPJ + CSLL", impacto: "Impossibilidade de analisar nulidade das CDAs", resp: "Sheila" },
  { id: 5, titulo: "Decisão sobre adesão ao PGDAU", urgencia: "alta", proc: "Prazo: 29/05/2026", impacto: "Perda da oportunidade de redução de 61% no passivo tributário", resp: "Hoffmann + Sheila" },
  { id: 6, titulo: "Mapear e lançar passivos extrajudiciais", urgencia: "media", proc: "Fornecedores + condomínios", impacto: "Visão incompleta do passivo total para o Family Office", resp: "Sheila + Hoffmann" },
  { id: 7, titulo: "Formalizar contratos de consultoria e NDA", urgencia: "media", proc: "Hoffmann + Advogados", impacto: "Insegurança jurídica para todas as partes", resp: "Hoffmann" },
  { id: 8, titulo: "Verificar habilitações no leilão", urgencia: "media", proc: "Centro de Operações", impacto: "Distribuição desfavorável do produto da hasta", resp: "Advogado trabalhista" },
  { id: 9, titulo: "Mapear datas das doações às filhas", urgencia: "baixa", proc: "Bens doados para as filhas", impacto: "Risco de ação pauliana por credores", resp: "Hoffmann + Advogado" },
  { id: 10, titulo: "Iniciar planejamento da holding familiar", urgencia: "baixa", proc: "Após estabilização", impacto: "Ausência de estrutura de blindagem e sucessão", resp: "Advogado societário" },
];

const riscosPF = [
  { origem: "Banco do Brasil — Fiança Pessoal", proc: "0500008-92.2019.8.05.0080 — R$ 607.786,48", nivel: "alta", fundamento: "Contrato de fiança — responsabilidade solidária", acao: "Negociar liberação da fiança com aporte" },
  { origem: "Desconsideração da PJ — Trabalhista", proc: "0016691-27.2018 + risco nos 22 processos", nivel: "alta", fundamento: "Art. 855-A CLT — incidente de desconsideração", acao: "Aprovação da REF suspende o risco" },
  { origem: "Processos José Carlos Roque", proc: "Execuções diretas contra Sheila PF", nivel: "alta", fundamento: "Execução direta — sem benefício de ordem", acao: "Monitorar e quitar valores menores" },
  { origem: "Prazos Perdidos (Bradesco / Reintegração)", proc: "Procs. 8031952-37.2023 e 8027713-10.2024", nivel: "alta", fundamento: "Risco de extinção dos processos sem resolução", acao: "Regularizar com máxima urgência" },
  { origem: "Tributário — Responsabilidade Subsidiária", proc: "Art. 135 CTN — sócia-administradora", nivel: "media", fundamento: "Exige prova de ato ilícito ou dissolução irregular", acao: "Manter empresa ativa e regular" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const BADGE_URGENCIA: Record<string, string> = {
  alta: "bg-red-500/20 text-red-400 border border-red-500/40",
  media: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40",
  baixa: "bg-green-500/20 text-green-400 border border-green-500/40",
};
const LABEL_URGENCIA: Record<string, string> = { alta: "Urgente", media: "Média", baixa: "Baixa" };

const FASE_LABEL: Record<number, { label: string; cor: string }> = {
  1: { label: "Fase 1 — Estabilização", cor: "#E05252" },
  2: { label: "Fase 2 — Reorganização", cor: "#E07B30" },
  3: { label: "Fase 3 — Planejamento", cor: "#D4B830" },
  4: { label: "Fase 4 — Governança", cor: "#4CAF7D" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A2535] border border-[#2A3A4A] rounded-lg p-3 text-sm shadow-xl">
        <p className="font-semibold text-white mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: R$ {p.value}M
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── CDN URLs das imagens Hoffmann ─────────────────────────────────────────
const IMG = {
  logoVerdeBeige: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663297073580/eRObmJhgnGkKHOmL.png",
  logoBeige: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663297073580/HRhEfdCBzTwkwHxu.png",
  iconeVerde: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663297073580/LfYxNnImiKwTLTnu.png",
  logotipoVerde: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663297073580/SoVecElfXMRExkoT.png",
  aleBlazerBranco: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663297073580/GmbrUiqWfCeakQwt.png",
  aleBlazerPreto: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663297073580/rezFCWehdBgROoeb.png",
  aleCamisaBranca: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663297073580/TdSgPwkvHsqRJlLq.png",
  aleTernoBranco: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663297073580/ACcbJlzJYSjNdtJs.png",
};

// ─── Dados Hoffmann ──────────────────────────────────────────────────────────
const receitaData = [
  { cenario: "Conservador", contratos: 3, receita: 30, fill: "#6B8F71" },
  { cenario: "Estável", contratos: 5, receita: 50, fill: "#4A7C59" },
  { cenario: "Expansão", contratos: 10, receita: 100, fill: "#2D6A4F" },
];

const projecaoMensal = [
  { mes: "Jan", conservador: 30, estavel: 50, expansao: 100 },
  { mes: "Fev", conservador: 30, estavel: 50, expansao: 100 },
  { mes: "Mar", conservador: 30, estavel: 55, expansao: 110 },
  { mes: "Abr", conservador: 35, estavel: 60, expansao: 120 },
  { mes: "Mai", conservador: 35, estavel: 65, expansao: 130 },
  { mes: "Jun", conservador: 40, estavel: 70, expansao: 150 },
  { mes: "Jul", conservador: 40, estavel: 75, expansao: 160 },
  { mes: "Ago", conservador: 45, estavel: 80, expansao: 180 },
  { mes: "Set", conservador: 45, estavel: 85, expansao: 200 },
  { mes: "Out", conservador: 50, estavel: 90, expansao: 220 },
  { mes: "Nov", conservador: 50, estavel: 95, expansao: 240 },
  { mes: "Dez", conservador: 55, estavel: 100, expansao: 260 },
];

const custosData = [
  { item: "Infraestrutura Tecnológica", valor: 10000, cor: "#6B8F71" },
  { item: "Equipe Operacional", valor: 8000, cor: "#4A7C59" },
];

// ─── Componente PlanoHoffmann ────────────────────────────────────────────────
function PlanoHoffmann() {
  return (
    <div className="space-y-0">

      {/* ── HERO SECTION ── */}
      <div
        className="relative rounded-2xl overflow-hidden mb-8"
        style={{
          background: "linear-gradient(135deg, #2D4A2D 0%, #1A3A1A 40%, #0F2A0F 100%)",
          minHeight: "340px",
        }}
      >
        {/* Padrão decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, #C9A84C 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, #6B8F71 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-8">
          {/* Foto principal */}
          <div className="relative shrink-0">
            <div
              className="w-52 h-64 rounded-2xl overflow-hidden shadow-2xl"
              style={{ border: "3px solid rgba(201,168,76,0.5)" }}
            >
              <img
                src={IMG.aleBlazerPreto}
                alt="Alessandra Hoffmann"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div
              className="absolute -bottom-3 -right-3 w-14 h-14 rounded-xl overflow-hidden shadow-xl"
              style={{ border: "2px solid rgba(201,168,76,0.6)" }}
            >
              <img src={IMG.iconeVerde} alt="AH" className="w-full h-full object-contain bg-white p-1" />
            </div>
          </div>

          {/* Texto hero */}
          <div className="flex-1 text-center md:text-left">
            <div className="mb-3">
              <img src={IMG.logoVerdeBeige} alt="Alessandra Hoffmann" className="h-16 mx-auto md:mx-0 object-contain" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.5px" }}>
              Plano de Negócios Hoffmann
            </h2>
            <p className="text-lg font-semibold mb-4" style={{ color: "#C9A84C" }}>
              Inteligência Tributária Estratégica
            </p>
            <p className="text-sm text-white/75 leading-relaxed max-w-xl">
              Uma consultoria especializada em transformar passivos tributários em instrumentos de reorganização e fortalecimento empresarial — com metodologia própria, expertise multidisciplinar e atuação nacional.
            </p>
            <div className="flex flex-wrap gap-3 mt-5 justify-center md:justify-start">
              {[
                { icon: Award, label: "23 anos de atuação" },
                { icon: Globe, label: "Atuação Nacional" },
                { icon: Briefcase, label: "Metodologia Própria" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C" }}>
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── VISÃO DO NEGÓCIO ── */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-[#1A2535] border-[#2A3A4A]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "#C9A84C" }}>
              <Target className="h-4 w-4" /> Visão do Negócio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/80 leading-relaxed">
            <p>
              A <strong className="text-white">Hoffmann – Inteligência Tributária Estratégica</strong> é uma consultoria especializada em gestão estratégica de passivo tributário empresarial, com atuação voltada à reorganização fiscal e financeira de empresas que enfrentam alto nível de endividamento tributário.
            </p>
            <p>
              A consultoria parte do princípio de que o passivo tributário não deve ser tratado apenas como um problema jurídico, mas como um <strong className="text-white">elemento estratégico de reorganização empresarial</strong>.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {[
                "Diagnósticos fiscais empresariais",
                "Gestão estratégica de passivos",
                "Negociação com órgãos fiscais",
                "Reorganização tributária",
                "Contencioso fiscal estratégico",
                "Governança tributária",
                "Recuperação de créditos fiscais",
                "Proteção patrimonial empresarial",
                "Estratégias Reforma Tributária",
              ].map((item) => (
                <div key={item} className="flex items-start gap-1.5 text-xs text-white/70">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0" style={{ color: "#6B8F71" }} />
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Foto + Qualificação */}
        <div className="space-y-4">
          <Card className="bg-[#1A2535] border-[#2A3A4A] overflow-hidden">
            <div className="flex gap-4 p-4">
              <div className="w-24 h-28 rounded-xl overflow-hidden shrink-0" style={{ border: "2px solid rgba(107,143,113,0.5)" }}>
                <img src={IMG.aleCamisaBranca} alt="Alessandra Hoffmann" className="w-full h-full object-cover object-top" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#C9A84C" }}>Fundadora & Diretora Estratégica</p>
                <h3 className="text-base font-bold text-white mb-2">Alessandra Hoffmann</h3>
                <div className="space-y-1">
                  {[
                    { label: "Experiência jurídica", value: "23 anos" },
                    { label: "Advocacia", value: "18 anos" },
                    { label: "Pós-graduações", value: "12+ (MBA, LL.M.)" },
                    { label: "Especializações", value: "30+" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-white/60">{label}</span>
                      <span className="font-semibold text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-[#1A2535] border-[#2A3A4A]">
            <CardContent className="pt-4">
              <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "#C9A84C" }}>Áreas de Especialização</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Passivo Tributário",
                  "Governança Empresarial",
                  "Compliance",
                  "Planejamento Tributário",
                  "Reorganização Empresarial",
                  "Proteção Patrimonial",
                  "Reforma Tributária",
                  "M&A Estratégico",
                ].map((tag) => (
                  <span key={tag} className="text-[11px] px-2 py-1 rounded-full" style={{ background: "rgba(107,143,113,0.2)", border: "1px solid rgba(107,143,113,0.4)", color: "#9DC09E" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── METODOLOGIA AH ── */}
      <Card className="bg-[#1A2535] border-[#2A3A4A] mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "#C9A84C" }}>
            <Zap className="h-4 w-4" /> Metodologia AH — Inteligência Tributária Estratégica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-3">
            {[
              { num: "01", titulo: "Diagnóstico", desc: "Fiscal e empresarial completo", cor: "#6B8F71" },
              { num: "02", titulo: "Mapeamento", desc: "Riscos tributários identificados", cor: "#4A7C59" },
              { num: "03", titulo: "Plano Estratégico", desc: "Redução ou reorganização do passivo", cor: "#2D6A4F" },
              { num: "04", titulo: "Negociação", desc: "Reorganização fiscal estruturada", cor: "#1A5C3A" },
              { num: "05", titulo: "Governança", desc: "Implantação de governança tributária", cor: "#0D4A2D" },
            ].map((step, i) => (
              <div key={step.num} className="relative">
                {i < 4 && (
                  <div className="hidden md:block absolute top-6 right-0 w-full h-0.5 z-0" style={{ background: `linear-gradient(to right, ${step.cor}60, transparent)`, transform: "translateX(50%)" }} />
                )}
                <div className="relative z-10 text-center p-3 rounded-xl" style={{ background: `${step.cor}15`, border: `1px solid ${step.cor}40` }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-extrabold text-white" style={{ background: step.cor }}>
                    {step.num}
                  </div>
                  <p className="text-xs font-bold text-white mb-1">{step.titulo}</p>
                  <p className="text-[10px] text-white/60">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── MODELO DE SERVIÇOS ── */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {[
          {
            titulo: "Gestão Estratégica de Passivo",
            icon: Shield,
            cor: "#6B8F71",
            descricao: "Análise completa da dívida tributária, avaliação de execuções fiscais, identificação de nulidades, negociação com PGFN e acompanhamento estratégico do contencioso.",
            modelo: "Contrato de gestão mensal",
            valor: "A partir de R$ 10.000/mês",
            prazo: "Contratos de 12 meses",
            publico: "Empresas com passivo > R$ 1M",
          },
          {
            titulo: "Projetos de Redução de Passivo",
            icon: TrendingDown,
            cor: "#4A7C59",
            descricao: "Estratégias de redução via teses jurídicas, identificação de nulidades, negociações estratégicas e transações tributárias personalizadas com a PGFN.",
            modelo: "Honorários de êxito",
            valor: "% sobre redução obtida",
            prazo: "Por projeto",
            publico: "Passivos com potencial de contestação",
          },
          {
            titulo: "Recuperação Tributária",
            icon: DollarSign,
            cor: "#2D6A4F",
            descricao: "Identificação de créditos fiscais e valores pagos indevidamente. Análise de oportunidades de recuperação e compensação tributária.",
            modelo: "Êxito sobre recuperado",
            valor: "% sobre valores recuperados",
            prazo: "Por projeto",
            publico: "Empresas com histórico de pagamentos",
          },
        ].map(({ titulo, icon: Icon, cor, descricao, modelo, valor, prazo, publico }) => (
          <Card key={titulo} className="bg-[#1A2535] border-[#2A3A4A] flex flex-col" style={{ borderTopWidth: "3px", borderTopColor: cor }}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${cor}25` }}>
                  <Icon className="h-4 w-4" style={{ color: cor }} />
                </div>
                <CardTitle className="text-sm font-bold text-white leading-tight">{titulo}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              <p className="text-xs text-white/70 leading-relaxed">{descricao}</p>
              <div className="space-y-2 pt-2 border-t border-[#2A3A4A]">
                {[
                  { label: "Modelo", value: modelo },
                  { label: "Remuneração", value: valor },
                  { label: "Prazo", value: prazo },
                  { label: "Público-alvo", value: publico },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-white/50">{label}</span>
                    <span className="font-semibold text-right" style={{ color: cor, maxWidth: "55%" }}>{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── FINANCEIRO ── */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Projeção de Receita */}
        <Card className="bg-[#1A2535] border-[#2A3A4A]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "#C9A84C" }}>
              <TrendingUp className="h-4 w-4" /> Projeção de Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={receitaData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3A4A" />
                <XAxis dataKey="cenario" tick={{ fill: "#8899AA", fontSize: 11 }} />
                <YAxis tick={{ fill: "#8899AA", fontSize: 11 }} tickFormatter={(v) => `R$${v}k`} />
                <Tooltip
                  formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}.000/mês`, "Receita"]}
                  contentStyle={{ background: "#1A2535", border: "1px solid #2A3A4A", borderRadius: "8px", color: "#fff" }}
                />
                <Bar dataKey="receita" name="Receita" radius={[6, 6, 0, 0]}>
                  {receitaData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {receitaData.map((d) => (
                <div key={d.cenario} className="text-center p-2 rounded-lg" style={{ background: `${d.fill}15`, border: `1px solid ${d.fill}40` }}>
                  <p className="text-[10px] text-white/60 mb-1">{d.cenario}</p>
                  <p className="text-sm font-extrabold" style={{ color: d.fill }}>R$ {d.receita}k</p>
                  <p className="text-[10px] text-white/50">{d.contratos} contratos</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ponto de Equilíbrio + Custos */}
        <div className="space-y-4">
          <Card className="bg-[#1A2535] border-[#2A3A4A]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "#C9A84C" }}>
                <Target className="h-4 w-4" /> Ponto de Equilíbrio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-8 py-3">
                <div className="text-center">
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">Custo Fixo Mensal</p>
                  <p className="text-2xl font-extrabold text-red-400">R$ 18k</p>
                  <p className="text-[10px] text-white/50">operação completa</p>
                </div>
                <div className="text-3xl text-white/30">÷</div>
                <div className="text-center">
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">Ticket Mínimo</p>
                  <p className="text-2xl font-extrabold" style={{ color: "#6B8F71" }}>R$ 10k</p>
                  <p className="text-[10px] text-white/50">por contrato</p>
                </div>
                <div className="text-3xl text-white/30">=</div>
                <div className="text-center">
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">Break-Even</p>
                  <p className="text-2xl font-extrabold" style={{ color: "#C9A84C" }}>2</p>
                  <p className="text-[10px] text-white/50">contratos ativos</p>
                </div>
              </div>
              <div className="mt-3 p-3 rounded-lg" style={{ background: "rgba(107,143,113,0.1)", border: "1px solid rgba(107,143,113,0.3)" }}>
                <p className="text-xs text-white/70 text-center">
                  Com apenas <strong className="text-white">2 contratos ativos</strong>, a operação já se paga. Cada contrato adicional representa <strong style={{ color: "#6B8F71" }}>lucro líquido direto</strong>.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A2535] border-[#2A3A4A]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "#C9A84C" }}>
                <DollarSign className="h-4 w-4" /> Estrutura de Custos Mensais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-white">Infraestrutura Tecnológica</p>
                    <p className="text-[11px] text-white/50">Plataformas especializadas de análise tributária, acompanhamento processual e gestão estratégica</p>
                  </div>
                  <span className="text-sm font-bold shrink-0 ml-3" style={{ color: "#6B8F71" }}>R$ 10.000</span>
                </div>
                <div className="w-full bg-[#0F1923] rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{ width: "56%", background: "#6B8F71" }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-white">Equipe Operacional</p>
                    <p className="text-[11px] text-white/50">Gestão administrativa + 2 colaboradores operacionais</p>
                  </div>
                  <span className="text-sm font-bold shrink-0 ml-3" style={{ color: "#4A7C59" }}>R$ 8.000</span>
                </div>
                <div className="w-full bg-[#0F1923] rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{ width: "44%", background: "#4A7C59" }} />
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#2A3A4A]">
                <span className="text-sm font-bold text-white">Total Mensal</span>
                <span className="text-lg font-extrabold" style={{ color: "#C9A84C" }}>R$ 18.000</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── CONTRATOS ATIVOS ── */}
      <Card className="bg-[#1A2535] border-[#2A3A4A] mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "#C9A84C" }}>
            <Briefcase className="h-4 w-4" /> Contratos Ativos — Fase Inicial de Estruturação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-3 mb-4">
            {[
              { nome: "Farmácia Maravilha", fase: "Diagnóstico", cor: "#6B8F71" },
              { nome: "Sr. Carlos (Uninter)", fase: "Diagnóstico", cor: "#4A7C59" },
              { nome: "Brastrela", fase: "Diagnóstico", cor: "#2D6A4F" },
              { nome: "Sr. Paulo", fase: "Diagnóstico", cor: "#1A5C3A" },
            ].map(({ nome, fase, cor }) => (
              <div key={nome} className="p-3 rounded-xl text-center" style={{ background: `${cor}15`, border: `1px solid ${cor}40` }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: cor }}>
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-bold text-white">{nome}</p>
                <p className="text-[10px] mt-1" style={{ color: cor }}>{fase}</p>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)" }}>
            <p className="text-xs text-white/70 leading-relaxed">
              Os contratos iniciam com <strong className="text-white">diagnóstico estratégico completo do passivo fiscal</strong> (~3 meses). Após essa fase, evoluem para o modelo completo de gestão estratégica mensal, com os valores previstos no modelo de atuação da consultoria.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── ESTRUTURA GEOGRÁFICA ── */}
      <Card className="bg-[#1A2535] border-[#2A3A4A] mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "#C9A84C" }}>
            <MapPin className="h-4 w-4" /> Estrutura Geográfica & Expansão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                cidade: "São Paulo — Mooca",
                status: "Ativo",
                desc: "Escritório presencial principal. Futura presença em Alphaville em parceria estratégica.",
                cor: "#6B8F71",
                badge: "bg-green-500/20 text-green-400 border-green-500/40",
              },
              {
                cidade: "Porto Alegre — RS",
                status: "Planejado",
                desc: "Instalação de escritório onde a fundadora estará presencialmente para atendimento regional.",
                cor: "#4A7C59",
                badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
              },
              {
                cidade: "Bahia — Salvador/Feira",
                status: "Parceria Sheila",
                desc: "Ponto de presença em parceria estratégica: atendimento empresarial, workshops e eventos. Direção estratégica centralizada pela Hoffmann.",
                cor: "#C9A84C",
                badge: "bg-amber-500/20 text-amber-400 border-amber-500/40",
              },
            ].map(({ cidade, status, desc, cor, badge }) => (
              <div key={cidade} className="p-4 rounded-xl" style={{ background: `${cor}10`, border: `1px solid ${cor}35` }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" style={{ color: cor }} />
                    <p className="text-sm font-bold text-white">{cidade}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${badge}`}>{status}</span>
                </div>
                <p className="text-xs text-white/65 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── VIABILIDADE + CONCLUSÃO ── */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-[#1A2535] border-[#2A3A4A]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "#C9A84C" }}>
              <Star className="h-4 w-4" /> Viabilidade do Modelo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { titulo: "Ticket Médio Elevado", desc: "Contratos de gestão estratégica a partir de R$ 10.000/mês garantem receita recorrente previsível.", cor: "#6B8F71" },
              { titulo: "Estrutura Operacional Enxuta", desc: "Break-even com apenas 2 contratos. Escalabilidade sem crescimento proporcional de custos.", cor: "#4A7C59" },
              { titulo: "Demanda Crescente", desc: "O cenário tributário brasileiro, com elevado número de empresas com passivos relevantes, gera demanda permanente.", cor: "#2D6A4F" },
            ].map(({ titulo, desc, cor }) => (
              <div key={titulo} className="flex gap-3 p-3 rounded-lg" style={{ background: `${cor}10`, border: `1px solid ${cor}30` }}>
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: cor }} />
                <div>
                  <p className="text-sm font-bold text-white mb-1">{titulo}</p>
                  <p className="text-xs text-white/65 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Conclusão com foto */}
        <Card className="bg-[#1A2535] border-[#2A3A4A] overflow-hidden">
          <div className="relative h-full">
            <div className="absolute inset-0 opacity-20">
              <img src={IMG.aleTernoBranco} alt="" className="w-full h-full object-cover object-top" />
            </div>
            <div className="relative z-10 p-5 h-full flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "#C9A84C" }}>Conclusão & Parceria Estratégica</p>
                <p className="text-sm text-white/85 leading-relaxed mb-3">
                  A <strong className="text-white">Hoffmann – Inteligência Tributária Estratégica</strong> apresenta um modelo sólido de consultoria empresarial, baseado em expertise técnica, metodologia própria e estrutura escalável.
                </p>
                <p className="text-sm text-white/85 leading-relaxed">
                  A eventual <strong className="text-white">parceria estratégica com Sheila</strong> poderá contribuir para ampliar a atuação nacional e desenvolver projetos empresariais de maior escala, com presença na Bahia e potencial de expansão para o primeiro escritório de M&A especializado para indústrias.
                </p>
              </div>
              <div className="mt-4 p-3 rounded-lg" style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.4)" }}>
                <p className="text-xs font-bold text-center" style={{ color: "#C9A84C" }}>
                  "Transformar passivo fiscal em instrumento de reorganização e fortalecimento empresarial."
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── RODAPÉ HOFFMANN ── */}
      <div
        className="rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ background: "linear-gradient(135deg, #1A3A1A 0%, #0F2A0F 100%)", border: "1px solid rgba(107,143,113,0.3)" }}
      >
        <div className="flex items-center gap-4">
          <img src={IMG.logoVerdeBeige} alt="Hoffmann" className="h-12 object-contain" />
        </div>
        <div className="text-center">
          <p className="text-xs text-white/50">Plano de Negócios — Versão Executiva · Março 2026</p>
          <p className="text-xs text-white/50">Documento Confidencial — Uso Restrito</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-white">consultoria@hoffmannefioretto.com</p>
          <p className="text-xs text-white/50">Atuação Nacional</p>
        </div>
      </div>

    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function PlanoEstrategico() {
  const [expandedMes, setExpandedMes] = useState<string | null>("Mar/26");
  const [expandedGap, setExpandedGap] = useState<number | null>(null);

  const totalAtual = 7.4;
  const totalMeta = 3.0;
  const reducao = Math.round(((totalAtual - totalMeta) / totalAtual) * 100);

  return (
    <div className="min-h-screen bg-[#0F1923] text-white">
      {/* ── Header ── */}
      <div className="border-b border-[#2A3A4A] bg-[#0F1923] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Plano Estratégico</h1>
            <p className="text-sm text-[#8899AA]">SERMAP Engenharia · Horizonte 12 Meses · Mar/2026 – Dez/2026</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/40 px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
              Confidencial
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Passivo Tributário", value: "R$ 3,8M", sub: "→ Meta: R$ 1,5M (−61%)", cor: "#E05252", border: "border-t-red-500" },
            { label: "Passivo Trabalhista", value: "R$ 2,4M", sub: "→ Meta: R$ 1,1M (−54%)", cor: "#E07B30", border: "border-t-orange-500" },
            { label: "Passivo Bancário", value: "R$ 1,2M", sub: "→ Meta: R$ 400k (−67%)", cor: "#D4B830", border: "border-t-yellow-500" },
            { label: "Total em 12 meses", value: `≈ R$ ${totalMeta}M`, sub: `Redução de ${reducao}% (R$ ${totalAtual - totalMeta}M)`, cor: "#4CAF7D", border: "border-t-green-500" },
          ].map((k) => (
            <Card key={k.label} className={`bg-[#1A2535] border-[#2A3A4A] border-t-2 ${k.border} text-center`}>
              <CardContent className="pt-5 pb-4">
                <p className="text-[10px] text-[#8899AA] uppercase tracking-widest mb-2">{k.label}</p>
                <p className="text-2xl font-extrabold" style={{ color: k.cor }}>{k.value}</p>
                <p className="text-[11px] text-[#8899AA] mt-1">{k.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="diagnostico" className="w-full">
          <TabsList className="bg-[#1A2535] border border-[#2A3A4A] flex-wrap h-auto gap-1 p-1">
            {[
              { value: "diagnostico", label: "Diagnóstico" },
              { value: "riscos", label: "Mapa de Riscos" },
              { value: "pilares", label: "3 Pilares" },
              { value: "contencao", label: "Plano de Contenção" },
              { value: "blindagem", label: "Blindagem Patrimonial" },
              { value: "cronograma", label: "Cronograma" },
              { value: "gaps", label: "Gaps" },
              { value: "hoffmann", label: "Plano Hoffmann" },
            ].map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="text-xs data-[state=active]:bg-[#C9A84C] data-[state=active]:text-[#0F1923] data-[state=active]:font-bold"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Tab: Diagnóstico ── */}
          <TabsContent value="diagnostico" className="mt-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-[#1A2535] border-[#2A3A4A]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-[#C9A84C] uppercase tracking-wider">
                    Passivo Atual × Meta (R$ Milhões)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={passivoData} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A3A4A" />
                      <XAxis dataKey="frente" tick={{ fill: "#8899AA", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#8899AA", fontSize: 12 }} tickFormatter={(v) => `R$${v}M`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: "#8899AA", fontSize: 12 }} />
                      <Bar dataKey="atual" name="Atual" radius={[4, 4, 0, 0]}>
                        {passivoData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Bar>
                      <Bar dataKey="meta" name="Meta 12m" fill="#4CAF7D" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#1A2535] border-[#2A3A4A]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-[#C9A84C] uppercase tracking-wider">
                    Composição do Passivo Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={composicaoData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {composicaoData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Legend
                        formatter={(v) => <span style={{ color: "#8899AA", fontSize: 12 }}>{v}</span>}
                      />
                      <Tooltip formatter={(v: any) => `R$ ${v}M`} contentStyle={{ background: "#1A2535", border: "1px solid #2A3A4A", borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#C9A84C]/10 border-[#C9A84C]/30">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-[#C9A84C] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[#C9A84C] text-sm mb-1">Diagnóstico Estratégico</p>
                    <p className="text-sm text-white/80 leading-relaxed">
                      O passivo da SERMAP é <strong className="text-white">elevado, porém administrável</strong>. O principal componente — o passivo tributário — tem potencial de redução de até 61% por meio da Transação PGFN (PGDAU). O passivo trabalhista está sendo endereçado pela REF. O passivo bancário pode ser negociado com alto deságio quando houver caixa disponível. <strong className="text-white">O risco não está no valor do passivo — está na exposição pessoal de Sheila como pessoa física.</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Mapa de Riscos ── */}
          <TabsContent value="riscos" className="mt-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-[#1A2535] border-[#2A3A4A]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-[#C9A84C] uppercase tracking-wider">
                    Radar de Risco × Controle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#2A3A4A" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#8899AA", fontSize: 12 }} />
                      <Radar name="Risco" dataKey="risco" stroke="#E05252" fill="#E05252" fillOpacity={0.25} />
                      <Radar name="Controle" dataKey="controle" stroke="#4CAF7D" fill="#4CAF7D" fillOpacity={0.2} />
                      <Legend wrapperStyle={{ color: "#8899AA", fontSize: 12 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#1A2535] border-[#2A3A4A]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-red-400 uppercase tracking-wider">
                    Riscos que Recaem sobre Sheila — PF
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {riscosPF.map((r, i) => (
                    <div key={i} className="border border-[#2A3A4A] rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold text-white">{r.origem}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${BADGE_URGENCIA[r.nivel]}`}>
                          {LABEL_URGENCIA[r.nivel]}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8899AA] mb-1">{r.proc}</p>
                      <p className="text-xs text-white/70"><span className="text-[#C9A84C] font-semibold">Ação: </span>{r.acao}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-400 text-sm mb-1">Conclusão Estratégica — O Risco Real</p>
                    <p className="text-sm text-white/80 leading-relaxed">
                      O maior risco não é o valor total do passivo. É a <strong className="text-white">exposição pessoal de Sheila como pessoa física</strong>. A estratégia prioritária é estancar os três vetores de risco pessoal: fiança do Banco do Brasil, desconsideração da personalidade jurídica trabalhista e execuções diretas de José Carlos Roque. Com esses três pontos controlados, o restante do passivo é gerenciável pela empresa.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: 3 Pilares ── */}
          <TabsContent value="pilares" className="mt-6 space-y-6">
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  icon: Shield,
                  cor: "#E05252",
                  bgCor: "rgba(224,82,82,0.1)",
                  borderCor: "rgba(224,82,82,0.3)",
                  titulo: "Pilar 1 — Contenção Jurídica",
                  acoes: [
                    "Arguir benefício de ordem em todas as execuções bancárias (art. 827 CC)",
                    "Monitorar e contestar pedidos de desconsideração da PJ (art. 855-A CLT)",
                    "Regularizar prazos perdidos com urgência máxima",
                    "Proteger imóvel residencial de Sheila como bem de família (Lei 8.009/90)",
                  ],
                  objetivo: "Evitar que qualquer execução atinja o patrimônio pessoal de Sheila enquanto o passivo empresarial é equacionado.",
                },
                {
                  icon: TrendingDown,
                  cor: "#E07B30",
                  bgCor: "rgba(224,123,48,0.1)",
                  borderCor: "rgba(224,123,48,0.3)",
                  titulo: "Pilar 2 — Redução do Passivo",
                  acoes: [
                    "Analisar nulidades nas CDAs de IRPJ e CSLL (análise proprietária)",
                    "Aderir ao PGDAU até 29/05/2026 — redução de 61% no passivo tributário",
                    "Aprovar REF trabalhista — suspensão das execuções e negociação coletiva",
                    "Impugnar cálculos trabalhistas — redução de 20% a 40% nos valores",
                    "Negociar passivo bancário com deságio de 70-90% quando houver caixa",
                  ],
                  objetivo: "Reduzir passivo total de R$ 7,5M para ≈ R$ 3M em 12 meses.",
                },
                {
                  icon: Building2,
                  cor: "#4CAF7D",
                  bgCor: "rgba(76,175,125,0.1)",
                  borderCor: "rgba(76,175,125,0.3)",
                  titulo: "Pilar 3 — Reorganização Patrimonial",
                  acoes: [
                    "Confirmar impenhorabilidade do imóvel residencial (bem de família)",
                    "Constituir holding familiar com Sheila e as filhas como sócias",
                    "Doação com reserva de usufruto para bens não comprometidos",
                    "Avaliar renúncia de herança nos inventários onde o risco supera o benefício",
                    "Implementar governança corporativa para atender exigências do Family Office",
                  ],
                  objetivo: "Separar definitivamente o patrimônio empresarial do familiar e estruturar a sucessão.",
                },
              ].map((p) => (
                <Card key={p.titulo} className="bg-[#1A2535] border-[#2A3A4A] overflow-hidden">
                  <div className="h-1" style={{ background: p.cor }} />
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg" style={{ background: p.bgCor }}>
                        <p.icon className="h-4 w-4" style={{ color: p.cor }} />
                      </div>
                      <CardTitle className="text-sm font-bold text-white">{p.titulo}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {p.acoes.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-white/80">
                        <ArrowRight className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: p.cor }} />
                        <span>{a}</span>
                      </div>
                    ))}
                    <div className="mt-4 pt-3 border-t border-[#2A3A4A]">
                      <p className="text-xs text-[#8899AA]">
                        <span className="font-semibold" style={{ color: p.cor }}>Objetivo: </span>
                        {p.objetivo}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Tab: Plano de Contenção ── */}
          <TabsContent value="contencao" className="mt-6 space-y-6">
            {/* Tributário */}
            <Card className="bg-[#1A2535] border-[#2A3A4A]">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-red-400" />
                  <CardTitle className="text-sm font-bold text-red-400 uppercase tracking-wider">
                    Frente Tributária — Meta: R$ 3,8M → R$ 1,5M
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#2A3A4A]">
                        {["Estratégia", "Resultado Esperado", "Prazo", "Status"].map(h => (
                          <th key={h} className="text-left text-[11px] font-bold uppercase tracking-wider text-[#C9A84C] pb-2 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A3A4A]">
                      {[
                        { estrategia: "1. Análise de Nulidade das CDAs", desc: "IRPJ (R$ 2,8M) + CSLL (R$ 998k)", resultado: "Extinção parcial ou total do débito", prazo: "Abr–Jun/26", status: "EM CURSO", statusCor: "yellow" },
                        { estrategia: "2. Transação PGDAU (Edital 11/2025)", desc: "Prazo: 29/05/2026 — desconto de até 65%", resultado: "R$ 1.489.014,10 em 120 meses", prazo: "Até Mai/26", status: "DECISÃO URGENTE", statusCor: "red" },
                        { estrategia: "3. Negociação Individual com PGFN", desc: "Art. 11 Lei 13.988/2020", resultado: "Condições superiores ao edital padrão", prazo: "Jun–Ago/26", status: "PLANEJADO", statusCor: "blue" },
                      ].map((r, i) => (
                        <tr key={i} className="hover:bg-white/[0.02]">
                          <td className="py-3 pr-4">
                            <p className="font-semibold text-white">{r.estrategia}</p>
                            <p className="text-[11px] text-[#8899AA] mt-0.5">{r.desc}</p>
                          </td>
                          <td className="py-3 pr-4 text-white/80">{r.resultado}</td>
                          <td className="py-3 pr-4 text-[#8899AA] whitespace-nowrap">{r.prazo}</td>
                          <td className="py-3">
                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                              r.statusCor === "red" ? "bg-red-500/20 text-red-400 border border-red-500/40" :
                              r.statusCor === "yellow" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40" :
                              "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                            }`}>{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-xs text-blue-300 leading-relaxed">
                    <span className="font-bold">Sobre a Análise de Nulidade das CDAs: </span>
                    A análise de nulidades em CDAs é uma das ferramentas mais poderosas da consultoria tributária estratégica. Aproximadamente 1 em cada 100 execuções fiscais apresenta nulidades que podem levar à extinção do débito. No caso da SERMAP, o principal das CDAs é de apenas R$ 702.398,29 — os demais R$ 3,1M são multas, juros e encargos que podem ser contestados. As nulidades podem ser arguidas a qualquer tempo.
                  </p>
                </div>
                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-xs text-yellow-300 leading-relaxed">
                    <span className="font-bold">⚠️ Estratégia Condicionada — Execução Fiscal da União (TRF1): </span>
                    Foi peticionado em março/2026 levantando possível nulidade na execução fiscal da União, com médias chances de êxito em razão do tempo decorrido sem defesa. <strong className="text-yellow-200">Enquanto não houver decisão naquele processo, nenhuma negociação com a PGFN será realizada</strong> — pois uma decisão favorável pode reduzir substancialmente o passivo antes de qualquer acordo.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trabalhista */}
            <Card className="bg-[#1A2535] border-[#2A3A4A]">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-orange-400" />
                  <CardTitle className="text-sm font-bold text-orange-400 uppercase tracking-wider">
                    Frente Trabalhista — Meta: R$ 2,4M → R$ 1,1M
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#2A3A4A]">
                        {["Estratégia", "Impacto Estimado", "Prazo", "Status"].map(h => (
                          <th key={h} className="text-left text-[11px] font-bold uppercase tracking-wider text-[#C9A84C] pb-2 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A3A4A]">
                      {[
                        { estrategia: "0. Suspensão Temporária — Nova Avaliação do Leilão", desc: "Cancelamento do leilão + nomeação de avaliador → 4 a 6 meses até nova hasta", impacto: "Execuções trabalhistas suspensas durante o processo de avaliação", prazo: "Mar–Ago/26", status: "EM CURSO", statusCor: "yellow" },
                        { estrategia: "1. Aprovação da REF", desc: "Recuperação Extrajudicial Facilitada — plano já apresentado ao juízo", impacto: "Suspensão definitiva de todas as execuções + impede desconsideração PJ", prazo: "Mai/26", status: "AGUARDANDO JUÍZO", statusCor: "yellow" },
                        { estrategia: "2. Impugnação de Cálculos", desc: "Revisão técnica dos cálculos de liquidação em todos os processos", impacto: "Redução de 20% a 40% nos valores individuais", prazo: "Abr–Jun/26", status: "PLANEJADO", statusCor: "blue" },
                        { estrategia: "3. Negociação com Maiores Credores", desc: "Vagner Brum (R$ 520k) + André Vital (R$ 315k)", impacto: "Redução de 40% a 60% com pagamento à vista", prazo: "Set–Nov/26", status: "AGUARDANDO CAIXA", statusCor: "gray" },
                      ].map((r, i) => (
                        <tr key={i} className="hover:bg-white/[0.02]">
                          <td className="py-3 pr-4">
                            <p className="font-semibold text-white">{r.estrategia}</p>
                            <p className="text-[11px] text-[#8899AA] mt-0.5">{r.desc}</p>
                          </td>
                          <td className="py-3 pr-4 text-white/80">{r.impacto}</td>
                          <td className="py-3 pr-4 text-[#8899AA] whitespace-nowrap">{r.prazo}</td>
                          <td className="py-3">
                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                              r.statusCor === "yellow" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40" :
                              r.statusCor === "blue" ? "bg-blue-500/20 text-blue-400 border border-blue-500/40" :
                              "bg-gray-500/20 text-gray-400 border border-gray-500/40"
                            }`}>{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Bancário */}
            <Card className="bg-[#1A2535] border-[#2A3A4A]">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-yellow-400" />
                  <CardTitle className="text-sm font-bold text-yellow-400 uppercase tracking-wider">
                    Frente Bancária — Meta: R$ 1,2M → R$ 400k
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  {[
                    { credor: "Banco do Brasil", desc: "Fiança pessoal de Sheila — PRIORIDADE MÁXIMA", valor: "R$ 607.786,48", estrategia: "Negociar liberação da fiança + parcelamento com deságio", prazo: "Ago/26", cor: "#E05252" },
                    { credor: "Bradesco (Salas Hangar)", desc: "4 salas — condomínio e execução", valor: "A mapear", estrategia: "Negociar dação em pagamento ou parcelamento", prazo: "Jun/26", cor: "#E07B30" },
                    { credor: "Caixa / Itaú", desc: "Execuções em andamento — benefício de ordem", valor: "A mapear", estrategia: "Benefício de ordem + aguardar caixa para negociação", prazo: "Set–Nov/26", cor: "#D4B830" },
                  ].map((b, i) => (
                    <div key={i} className="border border-[#2A3A4A] rounded-lg p-4" style={{ borderLeftColor: b.cor, borderLeftWidth: 3 }}>
                      <p className="font-bold text-white text-sm">{b.credor}</p>
                      <p className="text-[11px] text-[#8899AA] mb-2">{b.desc}</p>
                      <p className="text-lg font-extrabold mb-2" style={{ color: b.cor }}>{b.valor}</p>
                      <p className="text-xs text-white/70 mb-1">{b.estrategia}</p>
                      <p className="text-[11px] text-[#8899AA]">Prazo: {b.prazo}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-3">
                  <p className="text-xs text-green-300 leading-relaxed">
                    <span className="font-bold">🏗️ Ativo Estratégico — Centro de Operações: </span>
                    O <strong className="text-green-200">Centro de Operações da SERMAP é um bem de valor suficiente para quitar integralmente o passivo total da empresa</strong>. Isso significa que, em última análise, a empresa tem lastro real para honrar todas as suas obrigações. Esse fato é fundamental para a tranquilidade de Sheila e para a negociação com o Family Office: o risco não é de insolvabilidade, mas de <em>gestão de fluxo e timing das negociações</em>.
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-xs text-blue-300 leading-relaxed">
                    <span className="font-bold">Por Que Aguardar Para Negociar: </span>
                    Dívidas bancárias antigas acumulam deságio com o tempo. Bancos preferem receber um valor menor à vista do que continuar executando por anos. Dívidas com 5+ anos de inadimplência costumam aceitar <strong>70% a 90% de desconto</strong> em negociações à vista. A estratégia é aguardar o momento em que houver recursos em caixa (venda de ativos, aporte ou geração própria) para quitar com o <strong>mínimo de valor possível</strong> — o poder de barganha é muito maior quando se tem dinheiro na mão.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Blindagem Patrimonial ── */}
          <TabsContent value="blindagem" className="mt-6 space-y-6">
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-white/80 leading-relaxed">
                    <span className="font-bold text-red-400">Princípio Fundamental: </span>
                    Toda blindagem patrimonial deve ser implementada com assessoria jurídica especializada e <strong className="text-white">nunca</strong> com o objetivo de fraudar credores já existentes — isso configuraria fraude à execução (art. 792 CPC) ou fraude contra credores (art. 158 CC). A estratégia legítima foca em <strong className="text-white">organizar e proteger o que ainda não está comprometido</strong> e em estruturar o patrimônio futuro de forma inteligente.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-[#1A2535] border-[#2A3A4A]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-[#C9A84C] uppercase tracking-wider">
                    Nível 1 — Proteção Imediata (Sem Custo)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: Home, titulo: "Bem de Família", lei: "Lei 8.009/1990", desc: "Imóvel residencial impenhorável — proteção automática. Confirmar registro e residência comprovada.", cor: "#4CAF7D" },
                    { icon: Shield, titulo: "Benefício de Ordem", lei: "Art. 827 CC", desc: "Credores devem executar bens da empresa antes de atingir Sheila. Arguir em toda execução que tente atingir Sheila diretamente.", cor: "#4A90D9" },
                    { icon: Users, titulo: "Bens das Filhas", lei: "Doações anteriores às dívidas", desc: "Bens doados antes das dívidas estão protegidos. Mapear datas das doações vs. datas das dívidas.", cor: "#C9A84C" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 border border-[#2A3A4A] rounded-lg">
                      <div className="p-2 rounded-lg shrink-0" style={{ background: `${item.cor}20` }}>
                        <item.icon className="h-4 w-4" style={{ color: item.cor }} />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{item.titulo}</p>
                        <p className="text-[11px] text-[#C9A84C] mb-1">{item.lei}</p>
                        <p className="text-xs text-white/70">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-[#1A2535] border-[#2A3A4A]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-[#C9A84C] uppercase tracking-wider">
                    Nível 2 — Proteção Estruturada
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { titulo: "Holding Familiar", sub: "Sheila 60% + Filha 1 20% + Filha 2 20%", vantagens: "Blindagem patrimonial · Sucessão planejada · Governança · Economia tributária", quando: "Após estabilização do passivo (Jul/26)" },
                    { titulo: "Doação com Reserva de Usufruto", sub: "Filhas recebem nua-propriedade; Sheila mantém usufruto", vantagens: "Proteção patrimonial · Planejamento sucessório · Redução ITCMD", quando: "Para bens não comprometidos — imediato" },
                    { titulo: "Renúncia de Herança", sub: "Inventários em andamento — em favor das filhas", vantagens: "Evita penhora imediata dos bens herdados", quando: "Antes da aceitação formal — avaliar caso a caso" },
                  ].map((item, i) => (
                    <div key={i} className="p-3 border border-[#2A3A4A] rounded-lg">
                      <p className="font-semibold text-white text-sm">{item.titulo}</p>
                      <p className="text-[11px] text-[#8899AA] mb-1">{item.sub}</p>
                      <p className="text-xs text-[#4CAF7D] mb-1">{item.vantagens}</p>
                      <p className="text-[11px] text-[#C9A84C]">Quando: {item.quando}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Organograma Holding */}
            <Card className="bg-[#1A2535] border-[#2A3A4A]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-[#C9A84C] uppercase tracking-wider">
                  Estrutura Recomendada — Holding Familiar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4 py-4">
                  {/* Sócias */}
                  <div className="flex gap-6">
                    {["Sheila (60%)", "Filha 1 (20%)", "Filha 2 (20%)"].map((s, i) => (
                      <div key={i} className="bg-[#0F1923] border border-[#C9A84C]/40 rounded-lg px-4 py-2 text-center">
                        <p className="text-xs font-bold text-[#C9A84C]">{s}</p>
                        <p className="text-[10px] text-[#8899AA]">Sócia</p>
                      </div>
                    ))}
                  </div>
                  {/* Seta */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-px h-6 bg-[#C9A84C]/40" />
                    <p className="text-[10px] text-[#8899AA]">constituem</p>
                  </div>
                  {/* Holding */}
                  <div className="bg-[#C9A84C]/10 border border-[#C9A84C] rounded-xl px-8 py-3 text-center">
                    <p className="text-sm font-extrabold text-[#C9A84C]">Holding Familiar</p>
                    <p className="text-[11px] text-white/70">Gestão patrimonial e societária</p>
                  </div>
                  {/* Seta */}
                  <div className="flex gap-12">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-px h-6 bg-[#2A3A4A]" />
                      <p className="text-[10px] text-[#8899AA]">controla</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-px h-6 bg-[#2A3A4A]" />
                      <p className="text-[10px] text-[#8899AA]">detém</p>
                    </div>
                  </div>
                  {/* Ativos */}
                  <div className="flex gap-6 flex-wrap justify-center">
                    {[
                      { label: "SERMAP Engenharia", sub: "Operacional", cor: "#E07B30" },
                      { label: "Imóveis", sub: "Patrimônio", cor: "#4A90D9" },
                      { label: "Outros Ativos", sub: "Investimentos", cor: "#4CAF7D" },
                    ].map((a, i) => (
                      <div key={i} className="bg-[#0F1923] border rounded-lg px-4 py-2 text-center" style={{ borderColor: a.cor + "60" }}>
                        <p className="text-xs font-bold" style={{ color: a.cor }}>{a.label}</p>
                        <p className="text-[10px] text-[#8899AA]">{a.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-xs text-green-300 leading-relaxed">
                    <span className="font-bold">Por Que a Holding é o Instrumento Correto: </span>
                    A holding familiar resolve simultaneamente três problemas: <strong>blindagem</strong> (os bens passam a pertencer à holding, não a Sheila diretamente), <strong>sucessão</strong> (as filhas já são sócias, eliminando a necessidade de inventário futuro) e <strong>governança</strong> (estrutura que o Family Office e investidores institucionais exigem para qualquer envolvimento).
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Cronograma ── */}
          <TabsContent value="cronograma" className="mt-6 space-y-4">
            {/* Legenda de fases */}
            <div className="flex flex-wrap gap-3 mb-2">
              {Object.entries(FASE_LABEL).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: v.cor }} />
                  <span className="text-xs text-[#8899AA]">{v.label}</span>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Linha vertical */}
              <div className="absolute left-[28px] top-4 bottom-4 w-0.5 bg-[#2A3A4A]" />

              <div className="space-y-3">
                {cronogramaData.map((item) => {
                  const isOpen = expandedMes === item.mes;
                  return (
                    <div key={item.mes} className="relative pl-16">
                      {/* Círculo na linha */}
                      <div
                        className="absolute left-4 top-3 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10"
                        style={{
                          borderColor: item.cor,
                          background: item.concluido ? item.cor : "#0F1923",
                        }}
                      >
                        {item.concluido && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>

                      <button
                        className="w-full text-left"
                        onClick={() => setExpandedMes(isOpen ? null : item.mes)}
                      >
                        <div
                          className="flex items-center justify-between p-3 rounded-lg border transition-colors"
                          style={{
                            background: isOpen ? `${item.cor}15` : "#1A2535",
                            borderColor: isOpen ? `${item.cor}60` : "#2A3A4A",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-white w-14">{item.mes}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${item.cor}20`, color: item.cor }}>
                              {FASE_LABEL[item.fase].label}
                            </span>
                            {item.concluido && (
                              <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/40 px-2 py-0.5 rounded-full font-bold">
                                CONCLUÍDO
                              </span>
                            )}
                          </div>
                          {isOpen ? <ChevronUp className="h-4 w-4 text-[#8899AA]" /> : <ChevronDown className="h-4 w-4 text-[#8899AA]" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="mt-1 ml-0 p-3 bg-[#0F1923] border border-[#2A3A4A] rounded-lg">
                          <ul className="space-y-2">
                            {item.acoes.map((a, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                                <span style={{ color: item.cor }} className="mt-0.5 shrink-0">→</span>
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* ── Tab: Plano de Negócios Hoffmann ── */}
          <TabsContent value="hoffmann" className="mt-6">
            <PlanoHoffmann />
          </TabsContent>

          {/* ── Tab: Gaps ── */}
          <TabsContent value="gaps" className="mt-6 space-y-4">
            <div className="flex gap-4 mb-2 flex-wrap">
              {[
                { label: "Urgente", count: gaps.filter(g => g.urgencia === "alta").length, cor: "#E05252", bg: "bg-red-500/20 border-red-500/40 text-red-400" },
                { label: "Média", count: gaps.filter(g => g.urgencia === "media").length, cor: "#D4B830", bg: "bg-yellow-500/20 border-yellow-500/40 text-yellow-400" },
                { label: "Baixa", count: gaps.filter(g => g.urgencia === "baixa").length, cor: "#4CAF7D", bg: "bg-green-500/20 border-green-500/40 text-green-400" },
              ].map(s => (
                <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${s.bg}`}>
                  <span>{s.count}</span>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {gaps.map((g) => {
                const isOpen = expandedGap === g.id;
                return (
                  <button
                    key={g.id}
                    className="w-full text-left"
                    onClick={() => setExpandedGap(isOpen ? null : g.id)}
                  >
                    <div className={`border rounded-lg overflow-hidden transition-all ${
                      g.urgencia === "alta" ? "border-red-500/30" :
                      g.urgencia === "media" ? "border-yellow-500/30" :
                      "border-green-500/30"
                    }`}>
                      <div className={`flex items-center justify-between p-3 ${
                        g.urgencia === "alta" ? "bg-red-500/10" :
                        g.urgencia === "media" ? "bg-yellow-500/10" :
                        "bg-green-500/10"
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-[#8899AA] w-4 font-bold">{g.id}</span>
                          <span className="text-sm font-semibold text-white">{g.titulo}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${BADGE_URGENCIA[g.urgencia]}`}>
                            {LABEL_URGENCIA[g.urgencia]}
                          </span>
                        </div>
                        {isOpen ? <ChevronUp className="h-4 w-4 text-[#8899AA] shrink-0" /> : <ChevronDown className="h-4 w-4 text-[#8899AA] shrink-0" />}
                      </div>
                      {isOpen && (
                        <div className="p-3 bg-[#1A2535] border-t border-[#2A3A4A] grid md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-[10px] text-[#8899AA] uppercase tracking-wider mb-1">Processo/Contexto</p>
                            <p className="text-white/80">{g.proc}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#8899AA] uppercase tracking-wider mb-1">Impacto se Não Resolvido</p>
                            <p className="text-white/80">{g.impacto}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#8899AA] uppercase tracking-wider mb-1">Responsável</p>
                            <p className="text-[#C9A84C] font-semibold">{g.resp}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* ── Rodapé ── */}
        <div className="border-t border-[#2A3A4A] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8899AA]">
          <div>
            <p className="font-semibold text-[#C9A84C]">Hoffmann Consultoria Tributária Estratégica</p>
            <p>consultoria@hoffmannefioretto.com</p>
          </div>
          <div className="text-center">
            <p>Plano Estratégico SERMAP Engenharia · Março de 2026 · Versão 1.0</p>
          </div>
          <div className="text-right">
            <p className="text-red-400 font-bold uppercase tracking-wider">⚠ Confidencial</p>
            <p>Não compartilhar com terceiros</p>
          </div>
        </div>
      </div>
    </div>
  );
}
