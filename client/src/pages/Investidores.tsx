import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Building2, Shield, Target, CheckCircle2, AlertCircle, ArrowRight, FileText, Download, ChevronDown } from "lucide-react";
import PDFViewer from "@/components/PDFViewer";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function Investidores() {
  const [expandedPDF, setExpandedPDF] = useState<string | null>(null);
  const { data: summary, isLoading } = trpc.dashboard.summary.useQuery();
  const { data: timeline } = trpc.timeline.list.useQuery();
  const { data: simulacoes } = trpc.tributario.simulacoes.useQuery();

  const passivoTributarioTotal = 3827799.69;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const passivoTotal = (summary?.valorTotalTrabalhista ?? 0) + (summary?.valorTotalCivel ?? 0) + passivoTributarioTotal;

  const distribuicaoData = [
    { name: "Trabalhista", value: summary?.valorTotalTrabalhista ?? 0, color: "#c8956c" },
    { name: "Cível/Outros", value: summary?.valorTotalCivel ?? 0, color: "#4a5a3a" },
    { name: "Tributário Federal", value: passivoTributarioTotal, color: "#d4553a" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2d2a1e] to-[#3d3929] text-white rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="h-8 w-8 text-[#c8956c]" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif">SERMAP Engenharia LTDA</h1>
            <p className="text-white/60 text-sm">Visão Estratégica para Investidores</p>
          </div>
        </div>
        <p className="text-white/80 leading-relaxed max-w-3xl">
          A SERMAP Engenharia é uma empresa com histórico no setor de engenharia e construção, atualmente em fase de reestruturação. 
          A empresa busca investidores estratégicos para retomar suas atividades operacionais. Este painel apresenta o cenário 
          jurídico e fiscal organizado, demonstrando transparência e gestão profissional do passivo.
        </p>
      </div>

      {/* Situação Atual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-sm">Situação Atual</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empresa desestruturada com passivo significativo. Atividades operacionais paralisadas. 
              Necessita de investimento para retomada.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#4a5a3a]">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-[#4a5a3a]" />
              <h3 className="font-semibold text-sm">Gestão em Curso</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Consultoria tributária estratégica contratada por 90 dias para organizar o passivo, 
              proteger o patrimônio e preparar o cenário para investidores.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#c8956c]">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-[#c8956c]" />
              <h3 className="font-semibold text-sm">Objetivo</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Apresentar um cenário jurídico e fiscal organizado e atrativo, demonstrando que o passivo 
              está sob controle e gestão profissional.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Passivo Consolidado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif">Passivo Consolidado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="text-center p-6 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Passivo Total Estimado</p>
                <p className="text-3xl font-bold mt-2">{formatCurrency(passivoTotal)}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-[#c8956c]" />
                    <span className="text-sm">Trabalhista ({summary?.trabalhistas} processos)</span>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(summary?.valorTotalTrabalhista ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-[#4a5a3a]" />
                    <span className="text-sm">Cível/Outros ({summary?.civeis} processos)</span>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(summary?.valorTotalCivel ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-[#d4553a]" />
                    <span className="text-sm">Tributário Federal (PGFN)</span>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(passivoTributarioTotal)}</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distribuicaoData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {distribuicaoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estratégia de Gestão */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#4a5a3a]" />
            Estratégia de Gestão do Passivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-[#4a5a3a]" />
                <h4 className="font-medium text-sm">Proteção Patrimonial</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Estratégias para impedir que execuções atinjam bens pessoais da sócia-administradora, 
                preservando o patrimônio da empresa para futura operação.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-[#4a5a3a]" />
                <h4 className="font-medium text-sm">Gestão de Passivo</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Administração ativa do passivo com negociações individuais junto a procuradorias 
                e credores, buscando acordos vantajosos conforme oportunidades surgirem.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-[#4a5a3a]" />
                <h4 className="font-medium text-sm">Monitoramento Contínuo</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Acompanhamento automatizado de todas as movimentações processuais via integração 
                com o DataJud do CNJ, garantindo que nenhum prazo seja perdido.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-[#4a5a3a]" />
                <h4 className="font-medium text-sm">Organização para Investidores</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Estruturação completa do cenário jurídico e fiscal, com transparência total 
                sobre riscos e oportunidades, facilitando a due diligence.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apresentações - Potencial da Empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#c8956c]" />
            Potencial Operacional da SERMAP
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Conheça a infraestrutura robusta e o potencial impressionante da SERMAP antes dos desafios atuais.
            A empresa demonstra capacidade técnica e operacional de classe mundial.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Botão Apresentação 1 */}
            <button
              onClick={() => setExpandedPDF(expandedPDF === 'infra' ? null : 'infra')}
              className="p-6 rounded-lg border bg-gradient-to-br from-[#2d2a1e]/5 to-[#c8956c]/5 hover:shadow-md transition-shadow text-left w-full"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-lg bg-[#c8956c]/10">
                  <FileText className="h-6 w-6 text-[#c8956c]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-base mb-1">Infraestrutura e Equipamentos</h4>
                      <p className="text-xs text-muted-foreground">Relatório técnico detalhado</p>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-[#c8956c] transition-transform ${expandedPDF === 'infra' ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Clique para visualizar a apresentação completa com navegação interativa
              </p>
            </button>

            {/* Botão Apresentação 2 */}
            <button
              onClick={() => setExpandedPDF(expandedPDF === 'empresa' ? null : 'empresa')}
              className="p-6 rounded-lg border bg-gradient-to-br from-[#4a5a3a]/5 to-[#2d2a1e]/5 hover:shadow-md transition-shadow text-left w-full"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-lg bg-[#4a5a3a]/10">
                  <Building2 className="h-6 w-6 text-[#4a5a3a]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-base mb-1">Empresa SERMAP</h4>
                      <p className="text-xs text-muted-foreground">Visão geral e potencial</p>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-[#4a5a3a] transition-transform ${expandedPDF === 'empresa' ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Clique para visualizar a apresentação completa com navegação interativa
              </p>
            </button>
          </div>

          {/* Visualizadores PDF Expandidos */}
          {expandedPDF === 'infra' && (
            <div className="mt-6 p-6 rounded-lg border bg-card">
              <PDFViewer
                url="https://files.manuscdn.com/user_upload_by_module/session_file/310519663297073580/VioeIjLbrjQfHQmz.pdf"
                title="Infraestrutura e Equipamentos - SERMAP"
                downloadName="REPORT-INFRAESTRUTURAEEQUIPAMENTOS.pdf"
              />
            </div>
          )}

          {expandedPDF === 'empresa' && (
            <div className="mt-6 p-6 rounded-lg border bg-card">
              <PDFViewer
                url="https://files.manuscdn.com/user_upload_by_module/session_file/310519663297073580/JyAHLiNajogLsJdn.pdf"
                title="Empresa SERMAP - Visão Estratégica"
                downloadName="EmpresaSERMAP.pdf"
              />
            </div>
          )}

          {/* Destaque de Potencial */}
          <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-sm text-amber-900 mb-1">Potencial de Retomada</h5>
                <p className="text-sm text-amber-800 leading-relaxed">
                  A SERMAP possui infraestrutura robusta e capacidade operacional comprovada. Com investimento estratégico e gestão profissional do passivo, a empresa tem potencial significativo para retomar suas atividades e gerar valor. 
                  Este painel demonstra que o passivo está organizado e sob controle, criando um cenário seguro para investidores.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plano de Ação */}
      {timeline && timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-serif">Plano de Ação — 90 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="flex overflow-x-auto gap-6 pb-4">
                {timeline.map((item, index) => (
                  <div key={item.id} className="flex-shrink-0 w-56 relative">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${item.status === "concluido" ? "bg-green-500" : item.status === "em_andamento" ? "bg-[#c8956c]" : "bg-muted-foreground/30"}`}>
                        {index + 1}
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${item.status === "em_andamento" ? "border-[#c8956c] text-[#c8956c]" : item.status === "concluido" ? "border-green-500 text-green-600" : ""}`}>
                        {item.status === "concluido" ? "Concluído" : item.status === "em_andamento" ? "Em andamento" : "Pendente"}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-semibold mb-1">{item.titulo}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.descricao}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">{item.dataInicio} → {item.dataFim}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nota de Rodapé */}
      <div className="p-4 rounded-lg bg-muted/50 border text-center">
        <p className="text-sm text-muted-foreground">
          Este painel é atualizado em tempo real. Todas as informações são gerenciadas pela 
          <strong> Alessandra Hoffmann — Consultoria Estratégica</strong>, responsável pela gestão 
          do passivo judicial e tributário da SERMAP pelo período de 90 dias.
        </p>
      </div>
    </div>
  );
}
