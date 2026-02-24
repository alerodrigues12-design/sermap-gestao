import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Circle, AlertCircle, Plus, Edit2, Trash2, Calendar } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR");
  } catch {
    return dateStr;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "concluido":
      return "bg-green-100 text-green-800";
    case "em_andamento":
      return "bg-blue-100 text-blue-800";
    case "bloqueado":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "concluido":
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case "em_andamento":
      return <Circle className="h-5 w-5 text-blue-600" />;
    case "bloqueado":
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    default:
      return <Circle className="h-5 w-5 text-gray-400" />;
  }
}

export default function PlanoAcao() {
  const { data: itens, isLoading } = trpc.planoAcao.list.useQuery();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const completedCount = itens?.filter((i) => i.status === "concluido").length || 0;
  const inProgressCount = itens?.filter((i) => i.status === "em_andamento").length || 0;
  const blockedCount = itens?.filter((i) => i.status === "bloqueado").length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-serif">Plano de Ação</h1>
        <p className="text-muted-foreground mt-1">Acompanhamento das entregas e marcos do projeto</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold mt-1">{itens?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="stat-card bg-green-50">
          <CardContent className="p-4">
            <p className="text-xs text-green-600 uppercase tracking-wider">Concluídos</p>
            <p className="text-2xl font-bold mt-1 text-green-700">{completedCount}</p>
          </CardContent>
        </Card>
        <Card className="stat-card bg-blue-50">
          <CardContent className="p-4">
            <p className="text-xs text-blue-600 uppercase tracking-wider">Em Andamento</p>
            <p className="text-2xl font-bold mt-1 text-blue-700">{inProgressCount}</p>
          </CardContent>
        </Card>
        <Card className="stat-card bg-red-50">
          <CardContent className="p-4">
            <p className="text-xs text-red-600 uppercase tracking-wider">Bloqueados</p>
            <p className="text-2xl font-bold mt-1 text-red-700">{blockedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Marcos do Projeto</span>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Item ao Plano</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Funcionalidade em desenvolvimento</p>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0 divide-y">
            {itens?.map((item, index) => (
              <div
                key={item.id}
                className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                  item.status === "concluido" ? "bg-green-50/30" : item.status === "bloqueado" ? "bg-red-50/30" : ""
                }`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">{getStatusIcon(item.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">Parte {item.numero}</span>
                      <Badge className={getStatusColor(item.status)} variant="outline">
                        {item.status === "concluido"
                          ? "Concluído"
                          : item.status === "em_andamento"
                            ? "Em Andamento"
                            : item.status === "bloqueado"
                              ? "Bloqueado"
                              : "Não Iniciado"}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mt-1">{item.titulo}</h3>
                    {item.descricao && <p className="text-sm text-muted-foreground mt-1">{item.descricao}</p>}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      {item.dataPrevista && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Previsto: {formatDate(item.dataPrevista)}</span>
                        </div>
                      )}
                      {item.dataFinalizada && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          <span>Finalizado: {formatDate(item.dataFinalizada)}</span>
                        </div>
                      )}
                    </div>
                    {item.percentualConclusao && item.percentualConclusao > 0 && (
                      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(item.percentualConclusao, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getStatusIcon(selectedItem?.status)}
              Parte {selectedItem?.numero}: {selectedItem?.titulo}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge className={`${getStatusColor(selectedItem.status)} mt-1`} variant="outline">
                      {selectedItem.status === "concluido"
                        ? "Concluído"
                        : selectedItem.status === "em_andamento"
                          ? "Em Andamento"
                          : selectedItem.status === "bloqueado"
                            ? "Bloqueado"
                            : "Não Iniciado"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Progresso</p>
                    <p className="font-semibold mt-1">{(selectedItem.percentualConclusao || 0)}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Data Prevista</p>
                    <p className="font-semibold mt-1">{formatDate(selectedItem.dataPrevista)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Data Finalizada</p>
                    <p className="font-semibold mt-1">{formatDate(selectedItem.dataFinalizada)}</p>
                  </div>
                </div>

                {selectedItem.responsavel && (
                  <div>
                    <p className="text-xs text-muted-foreground">Responsável</p>
                    <p className="font-semibold mt-1">{selectedItem.responsavel}</p>
                  </div>
                )}

                {selectedItem.descricao && (
                  <div>
                    <p className="text-xs text-muted-foreground">Descrição</p>
                    <p className="mt-1 text-sm">{selectedItem.descricao}</p>
                  </div>
                )}

                {selectedItem.observacoes && (
                  <div>
                    <p className="text-xs text-muted-foreground">Observações</p>
                    <p className="mt-1 text-sm">{selectedItem.observacoes}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
