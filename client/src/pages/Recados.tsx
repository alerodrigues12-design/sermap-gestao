import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  MessageSquarePlus,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpCircle,
  MessageCircle,
  RefreshCw,
  Bell,
  Loader2,
  Trash2,
} from "lucide-react";

const tipoLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pendencia: { label: "Pendência", icon: <ClipboardList className="h-4 w-4" />, color: "bg-amber-100 text-amber-800 border-amber-200" },
  recado: { label: "Recado", icon: <MessageCircle className="h-4 w-4" />, color: "bg-blue-100 text-blue-800 border-blue-200" },
  solicitacao: { label: "Solicitação", icon: <Bell className="h-4 w-4" />, color: "bg-purple-100 text-purple-800 border-purple-200" },
  atualizacao: { label: "Atualização", icon: <RefreshCw className="h-4 w-4" />, color: "bg-green-100 text-green-800 border-green-200" },
};

const prioridadeLabels: Record<string, { label: string; color: string }> = {
  alta: { label: "Alta", color: "bg-red-100 text-red-800 border-red-200" },
  media: { label: "Média", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  baixa: { label: "Baixa", color: "bg-gray-100 text-gray-700 border-gray-200" },
};

const statusLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  aberto: { label: "Aberto", icon: <Clock className="h-4 w-4" />, color: "text-amber-600" },
  em_andamento: { label: "Em Andamento", icon: <ArrowUpCircle className="h-4 w-4" />, color: "text-blue-600" },
  concluido: { label: "Concluído", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-600" },
};

export default function Recados() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [tipo, setTipo] = useState<"pendencia" | "recado" | "solicitacao" | "atualizacao">("recado");
  const [prioridade, setPrioridade] = useState<"alta" | "media" | "baixa">("media");
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [processoRelacionado, setProcessoRelacionado] = useState("");

  const utils = trpc.useUtils();
  const { data: recados, isLoading } = trpc.recados.list.useQuery(
    filtroStatus !== "todos" ? { status: filtroStatus } : undefined
  );
  const { data: abertos } = trpc.recados.abertos.useQuery();

  const createMutation = trpc.recados.create.useMutation({
    onSuccess: () => {
      toast.success("Recado criado com sucesso!");
      utils.recados.list.invalidate();
      utils.recados.abertos.invalidate();
      setDialogOpen(false);
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateStatusMutation = trpc.recados.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      utils.recados.list.invalidate();
      utils.recados.abertos.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.recados.delete.useMutation({
    onSuccess: () => {
      toast.success("Recado excluído!");
      utils.recados.list.invalidate();
      utils.recados.abertos.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function resetForm() {
    setTipo("recado");
    setPrioridade("media");
    setTitulo("");
    setMensagem("");
    setProcessoRelacionado("");
  }

  function handleSubmit() {
    if (!titulo.trim() || !mensagem.trim()) {
      toast.error("Preencha o título e a mensagem.");
      return;
    }
    createMutation.mutate({
      tipo,
      prioridade,
      titulo: titulo.trim(),
      mensagem: mensagem.trim(),
      processoRelacionado: processoRelacionado.trim() || undefined,
    });
  }

  function formatDate(date: Date | string) {
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageSquarePlus className="h-7 w-7 text-[#4a5a3a]" />
            Pendências e Recados
          </h1>
          <p className="text-muted-foreground mt-1">
            Comunicação entre a consultoria e a cliente
          </p>
        </div>
        <div className="flex items-center gap-3">
          {abertos !== undefined && abertos > 0 && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              {abertos} pendente{abertos > 1 ? "s" : ""}
            </Badge>
          )}
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#4a5a3a] hover:bg-[#3d4d30] text-white">
                  <MessageSquarePlus className="h-4 w-4 mr-2" />
                  Novo Recado
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Novo Recado / Pendência</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={tipo} onValueChange={(v) => setTipo(v as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recado">Recado</SelectItem>
                          <SelectItem value="pendencia">Pendência</SelectItem>
                          <SelectItem value="solicitacao">Solicitação</SelectItem>
                          <SelectItem value="atualizacao">Atualização</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Prioridade</Label>
                      <Select value={prioridade} onValueChange={(v) => setPrioridade(v as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="baixa">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      placeholder="Ex: Documentação pendente para processo..."
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mensagem</Label>
                    <Textarea
                      placeholder="Descreva o recado ou pendência em detalhes..."
                      value={mensagem}
                      onChange={(e) => setMensagem(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Processo Relacionado (opcional)</Label>
                    <Input
                      placeholder="Ex: 0000141-18.2021.5.05.0196"
                      value={processoRelacionado}
                      onChange={(e) => setProcessoRelacionado(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={createMutation.isPending}
                    className="w-full bg-[#4a5a3a] hover:bg-[#3d4d30] text-white"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <MessageSquarePlus className="h-4 w-4 mr-2" />
                    )}
                    Publicar Recado
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "todos", label: "Todos" },
          { value: "aberto", label: "Abertos" },
          { value: "em_andamento", label: "Em Andamento" },
          { value: "concluido", label: "Concluídos" },
        ].map((f) => (
          <Button
            key={f.value}
            variant={filtroStatus === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltroStatus(f.value)}
            className={filtroStatus === f.value ? "bg-[#4a5a3a] hover:bg-[#3d4d30] text-white" : ""}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Lista de Recados */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#4a5a3a]" />
        </div>
      ) : !recados || recados.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-center">
              {filtroStatus === "todos"
                ? "Nenhum recado ou pendência registrado ainda."
                : `Nenhum recado com status "${filtroStatus === "em_andamento" ? "em andamento" : filtroStatus}".`}
            </p>
            {isAdmin && filtroStatus === "todos" && (
              <p className="text-sm text-muted-foreground/60 mt-1">
                Clique em "Novo Recado" para criar o primeiro.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {recados.map((recado) => {
            const tipoInfo = tipoLabels[recado.tipo] || tipoLabels.recado;
            const prioridadeInfo = prioridadeLabels[recado.prioridade] || prioridadeLabels.media;
            const statusInfo = statusLabels[recado.status] || statusLabels.aberto;

            return (
              <Card
                key={recado.id}
                className={`transition-all ${
                  recado.status === "concluido"
                    ? "opacity-70 border-green-200 bg-green-50/30"
                    : recado.prioridade === "alta"
                    ? "border-red-200 bg-red-50/20 shadow-sm"
                    : "hover:shadow-sm"
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${statusInfo.color}`}>
                        {statusInfo.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold leading-tight">
                          {recado.titulo}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          Por {recado.autorNome} em {formatDate(recado.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={`text-xs ${tipoInfo.color}`}>
                        {tipoInfo.icon}
                        <span className="ml-1">{tipoInfo.label}</span>
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${prioridadeInfo.color}`}>
                        {prioridadeInfo.label}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${statusInfo.color}`}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                    {recado.mensagem}
                  </p>
                  {recado.processoRelacionado && (
                    <p className="text-xs text-muted-foreground mt-3 bg-muted/50 rounded px-2 py-1 inline-block">
                      Processo: {recado.processoRelacionado}
                    </p>
                  )}
                  {isAdmin && (
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                      <span className="text-xs text-muted-foreground mr-2">Alterar status:</span>
                      {recado.status !== "aberto" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => updateStatusMutation.mutate({ id: recado.id, status: "aberto" })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Clock className="h-3 w-3 mr-1" /> Aberto
                        </Button>
                      )}
                      {recado.status !== "em_andamento" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => updateStatusMutation.mutate({ id: recado.id, status: "em_andamento" })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <ArrowUpCircle className="h-3 w-3 mr-1" /> Em Andamento
                        </Button>
                      )}
                      {recado.status !== "concluido" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs text-green-700 hover:bg-green-50"
                          onClick={() => updateStatusMutation.mutate({ id: recado.id, status: "concluido" })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Concluído
                        </Button>
                      )}
                      <div className="flex-1" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir este recado?")) {
                            deleteMutation.mutate({ id: recado.id });
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Excluir
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
