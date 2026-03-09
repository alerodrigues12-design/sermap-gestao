import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Scale, FileText, Landmark, AlertTriangle, TrendingDown, Bell, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: summary, isLoading: loadingSummary } = trpc.dashboard.summary.useQuery();
  const { data: notifCount } = trpc.dashboard.notificacoesCount.useQuery();
  const { data: movRecentes } = trpc.dashboard.movimentacoesRecentes.useQuery();
  const { data: timeline } = trpc.timeline.list.useQuery();
  const { data: perdaPrazo } = trpc.processos.perdaPrazo.useQuery();

  const passivoTributarioTotal = 3827799.69;

  const pieData = summary
    ? [
        { name: "Trabalhista", value: summary.valorTotalTrabalhista, color: "#c8956c" },
        { name: "Cível/Outros", value: summary.valorTotalCivel, color: "#4a5a3a" },
        { name: "Tributário Federal", value: passivoTributarioTotal, color: "#d4553a" },
      ]
    : [];

  const barData = summary
    ? [
        { name: "Trabalhistas", quantidade: summary.trabalhistas, fill: "#c8956c" },
        { name: "Cíveis", quantidade: summary.civeis, fill: "#4a5a3a" },
        { name: "Perda de Prazo", quantidade: summary.perdaPrazo, fill: "#d4553a" },
      ]
    : [];

  const passivoTotal = summary
    ? summary.valorTotalTrabalhista + summary.valorTotalCivel + passivoTributarioTotal
    : 0;

  if (loadingSummary) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-foreground">
            Gestão Estratégica SERMAP
          </h1>
          <p className="text-muted-foreground mt-1">
            Painel de acompanhamento do passivo judicial e tributário
          </p>
        </div>
        {(notifCount?.total ?? 0) > 0 && (
          <button
            onClick={() => setLocation("/notificacoes")}
            className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="text-sm font-medium">{notifCount!.total} alertas pendentes</span>
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card border-l-4 border-l-[#c8956c] cursor-pointer hover:shadow-lg" onClick={() => setLocation("/trabalhistas")}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Trabalhistas</p>
                <p className="text-2xl font-bold mt-1">{summary?.trabalhistas ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatCurrency(summary?.valorTotalTrabalhista ?? 0)}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#c8956c]/10 flex items-center justify-center">
                <Scale className="h-6 w-6 text-[#c8956c]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card border-l-4 border-l-[#4a5a3a] cursor-pointer hover:shadow-lg" onClick={() => setLocation("/civeis")}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cíveis / Tributários</p>
                <p className="text-2xl font-bold mt-1">{summary?.civeis ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatCurrency(summary?.valorTotalCivel ?? 0)}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#4a5a3a]/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-[#4a5a3a]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card border-l-4 border-l-[#d4553a] cursor-pointer hover:shadow-lg" onClick={() => setLocation("/tributario")}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Passivo PGFN</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(passivoTributarioTotal)}</p>
                <p className="text-xs text-muted-foreground mt-1">IRPJ + CSLL</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#d4553a]/10 flex items-center justify-center">
                <Landmark className="h-6 w-6 text-[#d4553a]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card border-l-4 border-l-green-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Prazos Anteriores</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{summary?.perdaPrazo ?? 0}</p>
                <p className="text-xs text-green-600/80 mt-1">Sob controle — providências tomadas</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Passivo Total Banner */}
      <Card className="bg-gradient-to-r from-[#2d2a1e] to-[#3d3929] text-white border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-white/70 uppercase tracking-wider">Passivo Total Estimado</p>
              <p className="text-3xl md:text-4xl font-bold mt-1">{formatCurrency(passivoTotal)}</p>
              <p className="text-sm text-white/60 mt-2">Trabalhista + Cível + Tributário Federal</p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-8 w-8 text-[#c8956c]" />
              <div className="text-right">
                <p className="text-sm text-white/70">Gestão Estratégica</p>
                <p className="text-xs text-[#c8956c]">90 dias em andamento</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Distribuição do Passivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Processos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="quantidade" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nota sobre Prazos Anteriores - Sob Controle */}
      {perdaPrazo && perdaPrazo.length > 0 && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg font-serif text-green-700 dark:text-green-400">
                Prazos Anteriores — Providências Tomadas
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">Processos Trabalhistas</p>
              <p className="text-sm text-muted-foreground">Petições apresentadas e aguardando decisão. Não haverá prejuízo em razão da suspensão do leilão determinada nos autos. Situação monitorada e sob controle.</p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">Processos Cíveis</p>
              <p className="text-sm text-muted-foreground">Petições já apresentadas em todos os feitos. O processo de maior risco envolvia o Banco do Brasil, para o qual foi apresentada tese de nulidade de citação visando ganhar tempo processual para estruturação da defesa.</p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">Execução Fiscal Federal (União)</p>
              <p className="text-sm text-muted-foreground">A empresa não possuía procurador constituído nos autos, o que gerou a perda de prazo. Foi peticionada tese jurídica inédita que deverá proporcionar ganho substancial de tempo processual para estruturação da defesa.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline Preview */}
      {timeline && timeline.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-serif">Plano de Ação - 90 Dias</CardTitle>
              <button onClick={() => setLocation("/timeline")} className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver completo <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex overflow-x-auto gap-4 pb-2">
              {timeline.slice(0, 5).map((item) => (
                <div key={item.id} className="flex-shrink-0 w-48 p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`h-2 w-2 rounded-full ${item.status === "concluido" ? "bg-green-500" : item.status === "em_andamento" ? "bg-[#c8956c]" : "bg-muted-foreground/30"}`} />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {item.status === "concluido" ? "Concluído" : item.status === "em_andamento" ? "Em andamento" : "Pendente"}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-tight">{item.titulo}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{item.dataInicio} → {item.dataFim}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
