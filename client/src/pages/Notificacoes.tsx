import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CheckCheck, AlertTriangle, Info, Clock, Activity, RefreshCw, Wifi, WifiOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function Notificacoes() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data: notificacoes, isLoading, refetch } = trpc.notificacoes.list.useQuery();
  const { data: movRecentes, refetch: refetchMov } = trpc.movimentacoes.recentes.useQuery();
  const { data: datajudStatus, refetch: refetchStatus } = trpc.datajud.status.useQuery();
  const [consultando, setConsultando] = useState(false);

  const marcarTodasLidas = trpc.notificacoes.marcarTodasLidas.useMutation({
    onSuccess: () => {
      toast.success("Todas as notificações marcadas como lidas.");
      refetch();
    },
  });
  const marcarMovLidas = trpc.movimentacoes.marcarTodasLidas.useMutation({
    onSuccess: () => {
      toast.success("Todas as movimentações marcadas como lidas.");
      refetchMov();
    },
  });

  const executarConsulta = trpc.datajud.executarAgora.useMutation({
    onSuccess: (resultado) => {
      setConsultando(false);
      toast.success(
        `Consulta concluída: ${resultado.processosConsultados} processos verificados, ${resultado.novasMovimentacoes} novas movimentações encontradas.`
      );
      refetch();
      refetchMov();
      refetchStatus();
    },
    onError: (error) => {
      setConsultando(false);
      toast.error(`Erro na consulta: ${error.message}`);
    },
  });

  const handleConsultarAgora = () => {
    setConsultando(true);
    executarConsulta.mutate();
  };

  const tipoIcons: Record<string, React.ReactNode> = {
    alerta: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    info: <Info className="h-4 w-4 text-blue-500" />,
    prazo: <Clock className="h-4 w-4 text-[#d4553a]" />,
    movimentacao: <Activity className="h-4 w-4 text-[#4a5a3a]" />,
  };

  const tipoLabels: Record<string, string> = {
    alerta: "Alerta",
    info: "Informação",
    prazo: "Prazo",
    movimentacao: "Movimentação",
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif flex items-center gap-2">
            <Bell className="h-7 w-7 text-[#c8956c]" />
            Notificações e Alertas
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe movimentações processuais e alertas do sistema
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => marcarTodasLidas.mutate()}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar notificações como lidas
          </Button>
          <Button variant="outline" size="sm" onClick={() => marcarMovLidas.mutate()}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar movimentações como lidas
          </Button>
        </div>
      </div>

      {/* Status do Monitoramento DataJud */}
      <Card className="border-[#4a5a3a]/30 bg-[#4a5a3a]/5">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              {datajudStatus?.apiKeyConfigurada ? (
                <div className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-700">Monitoramento DataJud Ativo</p>
                    <p className="text-xs text-muted-foreground">
                      {datajudStatus.ultimaConsulta
                        ? `Última consulta: ${new Date(datajudStatus.ultimaConsulta).toLocaleString("pt-BR")}`
                        : "Aguardando primeira consulta automática..."}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Consultas automáticas a cada 30 minutos
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <WifiOff className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-amber-600">Monitoramento Aguardando Configuracao</p>
                    <p className="text-xs text-muted-foreground">
                      API Key do DataJud nao configurada. Obtenha em: datajud-wiki.cnj.jus.br/api-publica/acesso/
                    </p>
                  </div>
                </div>
              )}
            </div>
            {isAdmin && datajudStatus?.apiKeyConfigurada && (
              <Button
                variant="default"
                size="sm"
                onClick={handleConsultarAgora}
                disabled={consultando}
                className="bg-[#4a5a3a] hover:bg-[#3a4a2a]"
              >
                {consultando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Consultando processos...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Consultar DataJud Agora
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notificações do Sistema */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-serif">Alertas do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          {(!notificacoes || notificacoes.length === 0) ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação no momento.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Notificações serão geradas automaticamente quando novas movimentações forem detectadas.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notificacoes.map((n) => (
                <div key={n.id} className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${!n.lida ? "bg-primary/5 border-primary/20" : "bg-background"}`}>
                  <div className="mt-0.5">{tipoIcons[n.tipo ?? "info"] || tipoIcons.info}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium">{n.titulo}</h4>
                      {!n.lida && <Badge className="text-[9px] h-4 bg-primary">Nova</Badge>}
                      <Badge variant="outline" className="text-[9px]">{tipoLabels[n.tipo ?? "info"]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{n.mensagem}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString("pt-BR") : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Movimentações Recentes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#4a5a3a]" />
            Movimentações Processuais Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(!movRecentes || movRecentes.length === 0) ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada ainda.</p>
              <p className="text-xs text-muted-foreground mt-1">
                {datajudStatus?.apiKeyConfigurada
                  ? "As movimentações serão registradas automaticamente na próxima consulta ao DataJud."
                  : "Configure a API Key do DataJud para ativar o monitoramento automático."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {movRecentes.map((m) => (
                <div key={m.id} className={`flex items-start gap-3 p-4 rounded-lg border ${!m.lida ? "bg-[#4a5a3a]/5 border-[#4a5a3a]/20" : ""}`}>
                  <Activity className="h-4 w-4 text-[#4a5a3a] mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs">{(m as any).processo?.numero || `Processo #${m.processoId}`}</span>
                      {!m.lida && <Badge className="text-[9px] h-4 bg-[#4a5a3a]">Nova</Badge>}
                    </div>
                    <p className="text-sm">{m.descricao}</p>
                    {m.complemento && <p className="text-xs text-muted-foreground mt-0.5">{m.complemento}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {m.dataMovimentacao ? new Date(m.dataMovimentacao).toLocaleString("pt-BR") : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info about DataJud */}
      <div className="p-4 rounded-lg bg-muted/50 border">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Sobre o Monitoramento Automático</p>
            <p className="text-sm text-muted-foreground mt-1">
              A plataforma consulta periodicamente a API Pública do DataJud (CNJ), 
              verificando novas movimentações em todos os {isAdmin ? "46" : ""} processos cadastrados. 
              Quando uma nova movimentação é detectada, uma notificação é gerada automaticamente. 
              {isAdmin && " Como administradora, você pode forçar uma consulta imediata usando o botão acima."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
