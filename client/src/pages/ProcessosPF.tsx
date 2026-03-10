import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, User, AlertCircle, CheckCircle2, Clock, FileText, Building2, Scale, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ativo: { label: "Ativo", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <AlertCircle className="w-3 h-3" /> },
  arquivado: { label: "Arquivado", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: <CheckCircle2 className="w-3 h-3" /> },
  extinto: { label: "Extinto", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: <CheckCircle2 className="w-3 h-3" /> },
  a_verificar: { label: "A Verificar", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <Clock className="w-3 h-3" /> },
};

const TRIBUNAL_CORES: Record<string, string> = {
  TJBA: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  TJSP: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  TRT4: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  TRT5: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  TRF1: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  TRT16: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
};

function getTribunalSigla(tribunal: string): string {
  const match = tribunal.match(/^(TJBA|TJSP|TRT4|TRT5|TRT16|TRF1)/);
  return match ? match[1] : "OUTRO";
}

export default function ProcessosPF() {
  const [busca, setBusca] = useState("");
  const [filtroTribunal, setFiltroTribunal] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [processoSelecionado, setProcessoSelecionado] = useState<any>(null);
  const [editandoObs, setEditandoObs] = useState(false);
  const [novaObs, setNovaObs] = useState("");
  const [novoStatus, setNovoStatus] = useState("");
  const { data, isLoading, refetch } = trpc.processosPF.listar.useQuery();
  const atualizarMutation = trpc.processosPF.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Processo atualizado com sucesso!");
      refetch();
      setEditandoObs(false);
    },
  });

  const processos = data || [];

  const processosFiltrados = processos.filter((p: any) => {
    const matchBusca =
      !busca ||
      p.numero.toLowerCase().includes(busca.toLowerCase()) ||
      p.tribunal.toLowerCase().includes(busca.toLowerCase()) ||
      (p.assunto || "").toLowerCase().includes(busca.toLowerCase()) ||
      (p.partes || "").toLowerCase().includes(busca.toLowerCase());
    const sigla = getTribunalSigla(p.tribunal);
    const matchTribunal = filtroTribunal === "todos" || sigla === filtroTribunal;
    const matchStatus = filtroStatus === "todos" || p.status === filtroStatus;
    return matchBusca && matchTribunal && matchStatus;
  });

  // Totalizadores
  const total = processos.length;
  const aVerificar = processos.filter((p: any) => p.status === "a_verificar").length;
  const ativos = processos.filter((p: any) => p.status === "ativo").length;
  const tribunaisSet = new Set<string>(processos.map((p: any) => getTribunalSigla(p.tribunal)));
  const tribunais = Array.from(tribunaisSet);

  const handleSalvar = () => {
    if (!processoSelecionado) return;
    atualizarMutation.mutate({
      id: processoSelecionado.id,
      status: novoStatus || processoSelecionado.status,
      observacoes: novaObs,
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 opacity-50" />
          <p>Carregando processos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
              <User className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Processos Pessoa Física</h1>
              <p className="text-sm text-muted-foreground">Sheila Carneiro Soares de Aguiar — CPF</p>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="text-yellow-400 border-yellow-500/30 bg-yellow-500/10 text-xs px-3 py-1">
          <Clock className="w-3 h-3 mr-1" />
          Levantamento inicial — aguardando verificação individual
        </Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total de Processos</p>
            <p className="text-3xl font-bold text-foreground">{total}</p>
            <p className="text-xs text-muted-foreground mt-1">identificados nos PDFs</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4">
            <p className="text-xs text-yellow-400 uppercase tracking-wide mb-1">A Verificar</p>
            <p className="text-3xl font-bold text-yellow-400">{aVerificar}</p>
            <p className="text-xs text-yellow-400/70 mt-1">movimentação pendente</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <p className="text-xs text-red-400 uppercase tracking-wide mb-1">Confirmados Ativos</p>
            <p className="text-3xl font-bold text-red-400">{ativos}</p>
            <p className="text-xs text-red-400/70 mt-1">após verificação</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Tribunais</p>
            <p className="text-3xl font-bold text-foreground">{tribunais.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{tribunais.join(", ")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Aviso */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
        <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-yellow-300">Levantamento Inicial — Verificação Pendente</p>
          <p className="text-xs text-yellow-400/80 mt-0.5">
            Estes processos foram identificados a partir de consulta em site especializado. Ainda não foi realizada a verificação individual de movimentação, status atual e valores atualizados. Ao analisar cada processo, atualize o status e adicione observações.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, tribunal, assunto ou partes..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 bg-card/50"
          />
        </div>
        <Select value={filtroTribunal} onValueChange={setFiltroTribunal}>
          <SelectTrigger className="w-[160px] bg-card/50">
            <SelectValue placeholder="Tribunal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tribunais</SelectItem>
            <SelectItem value="TJBA">TJBA</SelectItem>
            <SelectItem value="TJSP">TJSP</SelectItem>
            <SelectItem value="TRT5">TRT5</SelectItem>
            <SelectItem value="TRT4">TRT4</SelectItem>
            <SelectItem value="TRF1">TRF1</SelectItem>
            <SelectItem value="TRT16">TRT16</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[160px] bg-card/50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="a_verificar">A Verificar</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="arquivado">Arquivado</SelectItem>
            <SelectItem value="extinto">Extinto</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground self-center">
          {processosFiltrados.length} de {total} processos
        </p>
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Número do Processo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tribunal / Vara</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assunto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Valor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody>
              {processosFiltrados.map((p: any, idx: number) => {
                const sigla = getTribunalSigla(p.tribunal);
                const statusInfo = STATUS_LABELS[p.status] || STATUS_LABELS.a_verificar;
                const tribunalCor = TRIBUNAL_CORES[sigla] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
                return (
                  <tr
                    key={p.id}
                    className="border-b border-border/30 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => {
                      setProcessoSelecionado(p);
                      setNovaObs(p.observacoes || "");
                      setNovoStatus(p.status);
                      setEditandoObs(true);
                    }}
                  >
                    <td className="px-4 py-3 text-muted-foreground text-xs">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-foreground font-medium">{p.numero}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className={`text-xs w-fit ${tribunalCor}`}>
                          {sigla}
                        </Badge>
                        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[220px]">
                          {p.tribunal.replace(/^(TJBA|TJSP|TRT4|TRT5|TRT16|TRF1)\s*-\s*/, "")}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground line-clamp-2 max-w-[200px]">{p.assunto || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-foreground whitespace-nowrap">{p.valor || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-xs flex items-center gap-1 w-fit ${statusInfo.color}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-7 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProcessoSelecionado(p);
                          setNovaObs(p.observacoes || "");
                          setNovoStatus(p.status);
                          setEditandoObs(true);
                        }}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Atualizar
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {processosFiltrados.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <Scale className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum processo encontrado com os filtros aplicados.</p>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de atualização */}
      <Dialog open={editandoObs} onOpenChange={setEditandoObs}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-400" />
              Atualizar Processo
            </DialogTitle>
          </DialogHeader>
          {processoSelecionado && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Número do Processo</p>
                <p className="font-mono text-sm font-medium">{processoSelecionado.numero}</p>
                <p className="text-xs text-muted-foreground mt-1">{processoSelecionado.tribunal}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Partes</p>
                <p className="text-sm">{processoSelecionado.partes || "Não identificado"}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Status após verificação</Label>
                <Select value={novoStatus} onValueChange={setNovoStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a_verificar">A Verificar</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="arquivado">Arquivado</SelectItem>
                    <SelectItem value="extinto">Extinto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Observações / Movimentação</Label>
                <Textarea
                  value={novaObs}
                  onChange={(e) => setNovaObs(e.target.value)}
                  placeholder="Descreva a situação atual do processo, última movimentação, risco, estratégia..."
                  rows={4}
                  className="text-sm"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditandoObs(false)}>Cancelar</Button>
                <Button onClick={handleSalvar} disabled={atualizarMutation.isPending}>
                  {atualizarMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
