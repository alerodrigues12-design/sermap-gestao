import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Timeline() {
  const { data: timeline, isLoading } = trpc.timeline.list.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const total = timeline?.length ?? 0;
  const concluidos = timeline?.filter((t) => t.status === "concluido").length ?? 0;
  const emAndamento = timeline?.filter((t) => t.status === "em_andamento").length ?? 0;
  const progresso = total > 0 ? Math.round(((concluidos + emAndamento * 0.5) / total) * 100) : 0;

  // Calculate days
  const startDate = new Date("2026-02-20");
  const endDate = new Date("2026-05-20");
  const today = new Date();
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, totalDays - daysElapsed);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-serif flex items-center gap-2">
          <Clock className="h-7 w-7 text-[#c8956c]" />
          Plano de Ação — 90 Dias
        </h1>
        <p className="text-muted-foreground mt-1">
          Acompanhamento da gestão estratégica do passivo da SERMAP
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-[#2d2a1e] to-[#3d3929] text-white border-0">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-white/60 uppercase tracking-wider">Progresso Geral</p>
              <p className="text-3xl font-bold mt-1">{progresso}%</p>
              <Progress value={progresso} className="mt-3 h-2 bg-white/20" />
            </div>
            <div className="text-center">
              <p className="text-sm text-white/60 uppercase tracking-wider">Dias Decorridos</p>
              <p className="text-3xl font-bold mt-1">{daysElapsed}</p>
              <p className="text-xs text-white/40 mt-1">de {totalDays} dias</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-white/60 uppercase tracking-wider">Dias Restantes</p>
              <p className="text-3xl font-bold mt-1 text-[#c8956c]">{daysRemaining}</p>
              <p className="text-xs text-white/40 mt-1">até 20/05/2026</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="stat-card">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{concluidos}</p>
            <p className="text-xs text-muted-foreground">Concluídos</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4 text-center">
            <Loader2 className="h-6 w-6 text-[#c8956c] mx-auto mb-2" />
            <p className="text-2xl font-bold">{emAndamento}</p>
            <p className="text-xs text-muted-foreground">Em Andamento</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4 text-center">
            <Circle className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-2xl font-bold">{total - concluidos - emAndamento}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Horizontal Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif">Linha do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-0 min-w-max">
              {timeline?.map((item, index) => {
                const isLast = index === (timeline?.length ?? 0) - 1;
                const statusColor = item.status === "concluido" ? "bg-green-500" : item.status === "em_andamento" ? "bg-[#c8956c]" : "bg-muted-foreground/30";
                const statusIcon = item.status === "concluido" ? <CheckCircle2 className="h-5 w-5 text-white" /> : item.status === "em_andamento" ? <Loader2 className="h-5 w-5 text-white" /> : <Circle className="h-5 w-5 text-white" />;

                return (
                  <div key={item.id} className="flex items-start">
                    <div className="flex flex-col items-center w-52">
                      {/* Node */}
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${statusColor} shadow-lg`}>
                        {statusIcon}
                      </div>
                      {/* Content */}
                      <div className="mt-4 text-center px-2">
                        <Badge variant="outline" className={`text-[9px] mb-2 ${item.status === "em_andamento" ? "border-[#c8956c] text-[#c8956c]" : item.status === "concluido" ? "border-green-500 text-green-600" : ""}`}>
                          {item.status === "concluido" ? "Concluído" : item.status === "em_andamento" ? "Em andamento" : "Pendente"}
                        </Badge>
                        <h4 className="text-sm font-semibold leading-tight">{item.titulo}</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[180px]">{item.descricao}</p>
                        <p className="text-[10px] text-muted-foreground mt-2 font-mono">{item.dataInicio} → {item.dataFim}</p>
                      </div>
                    </div>
                    {/* Connector */}
                    {!isLast && (
                      <div className="flex items-center h-10">
                        <div className={`w-16 h-0.5 ${item.status === "concluido" ? "bg-green-500" : item.status === "em_andamento" ? "bg-[#c8956c]" : "bg-muted-foreground/20"}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold font-serif">Detalhamento das Etapas</h2>
        {timeline?.map((item, index) => {
          const statusColor = item.status === "concluido" ? "border-l-green-500" : item.status === "em_andamento" ? "border-l-[#c8956c]" : "border-l-muted-foreground/30";
          return (
            <Card key={item.id} className={`border-l-4 ${statusColor}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-sm font-bold ${item.status === "concluido" ? "bg-green-500" : item.status === "em_andamento" ? "bg-[#c8956c]" : "bg-muted-foreground/30"}`}>
                        {index + 1}
                      </span>
                      <h3 className="font-semibold">{item.titulo}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed ml-10">{item.descricao}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="outline" className={`text-[10px] ${item.status === "em_andamento" ? "border-[#c8956c] text-[#c8956c]" : item.status === "concluido" ? "border-green-500 text-green-600" : ""}`}>
                      {item.status === "concluido" ? "Concluído" : item.status === "em_andamento" ? "Em andamento" : "Pendente"}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono">{item.dataInicio}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{item.dataFim}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
