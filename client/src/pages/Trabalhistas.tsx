import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Search, Scale } from "lucide-react";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProcessoAnexoIA } from "@/components/ProcessoAnexoIA";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function Trabalhistas() {
  const { data: processos, isLoading } = trpc.processos.list.useQuery({ tipo: "trabalhista" });
  const [search, setSearch] = useState("");
  const [filterLocal, setFilterLocal] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [selectedProcesso, setSelectedProcesso] = useState<any>(null);

  const locais = useMemo(() => {
    if (!processos) return [];
    const set = new Set(processos.map((p) => p.local).filter(Boolean));
    return Array.from(set).sort();
  }, [processos]);

  const filtered = useMemo(() => {
    if (!processos) return [];
    return processos.filter((p) => {
      const matchSearch = !search || p.numero.toLowerCase().includes(search.toLowerCase()) || p.autor?.toLowerCase().includes(search.toLowerCase()) || p.assunto?.toLowerCase().includes(search.toLowerCase());
      const matchLocal = filterLocal === "todos" || p.local === filterLocal;
      const matchStatus = filterStatus === "todos" || (filterStatus === "perda_prazo" && p.perdaPrazo) || (filterStatus === "execucao" && p.status?.toLowerCase().includes("execução")) || (filterStatus === "suspenso" && p.status?.toLowerCase().includes("suspenso")) || (filterStatus === "aguardando" && p.status?.toLowerCase().includes("aguardando"));
      return matchSearch && matchLocal && matchStatus;
    });
  }, [processos, search, filterLocal, filterStatus]);

  const totalCondenacao = useMemo(() => {
    return filtered.reduce((sum, p) => sum + parseFloat(p.valorCondenacao || "0"), 0);
  }, [filtered]);

  const totalPerdaPrazo = useMemo(() => {
    return filtered.filter((p) => p.perdaPrazo).length;
  }, [filtered]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-serif">Processos Trabalhistas</h1>
        <p className="text-muted-foreground mt-1">Acompanhamento dos {processos?.length ?? 0} processos trabalhistas em andamento</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total de Processos</p>
            <p className="text-2xl font-bold mt-1">{filtered.length}</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Valor Total Condenação</p>
            <p className="text-2xl font-bold mt-1 text-[#c8956c]">{formatCurrency(totalCondenacao)}</p>
          </CardContent>
        </Card>
        <Card className="stat-card border-destructive/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-xs text-destructive uppercase tracking-wider">Perda de Prazo</p>
            </div>
            <p className="text-2xl font-bold mt-1 text-destructive">{totalPerdaPrazo}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por número, reclamante ou assunto..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterLocal} onValueChange={setFilterLocal}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Local" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Locais</SelectItem>
            {locais.map((l) => (
              <SelectItem key={l} value={l!}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="perda_prazo">Perda de Prazo</SelectItem>
            <SelectItem value="execucao">Em Execução</SelectItem>
            <SelectItem value="suspenso">Suspenso</SelectItem>
            <SelectItem value="aguardando">Aguardando</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">Processo</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Reclamante</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Local</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Assunto</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Valor</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const isGrave = p.risco === 'alto' && (p.observacoes?.toLowerCase().includes('sheila') || p.status?.toLowerCase().includes('redirecionamento') || p.observacoes?.toLowerCase().includes('grave'));
                  return (
                  <tr
                    key={p.id}
                    className={`border-b hover:bg-muted/30 cursor-pointer transition-colors ${
                      isGrave ? "bg-red-50 border-l-4 border-l-red-600" : 
                      p.perdaPrazo ? "bg-destructive/5 border-l-4 border-l-destructive" : ""
                    }`}
                    onClick={() => setSelectedProcesso(p)}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {isGrave && <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0" />}
                        {p.perdaPrazo && !isGrave && <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />}
                        <span className="font-mono text-xs">{p.numero}</span>
                      </div>
                    </td>
                    <td className="p-3 max-w-[150px] truncate">{p.autor}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px] font-normal">{p.local}</Badge>
                    </td>
                    <td className="p-3 max-w-[200px] truncate text-muted-foreground">{p.assunto}</td>
                    <td className="p-3 text-right font-medium whitespace-nowrap">
                      {formatCurrency(parseFloat(p.valorCondenacao || "0"))}
                    </td>
                    <td className="p-3">
                      {p.perdaPrazo ? (
                        <Badge variant="destructive" className="text-[10px]">PERDA DE PRAZO</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground line-clamp-1">{p.status}</span>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedProcesso} onOpenChange={() => setSelectedProcesso(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <Scale className="h-5 w-5 text-[#c8956c]" />
              Detalhes do Processo
            </DialogTitle>
          </DialogHeader>
          {selectedProcesso && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Número</p>
                    <p className="font-mono text-sm">{selectedProcesso.numero}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Órgão</p>
                    <p className="text-sm">{selectedProcesso.orgao}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reclamante</p>
                    <p className="text-sm font-medium">{selectedProcesso.autor}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Local</p>
                    <p className="text-sm">{selectedProcesso.local}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Assunto</p>
                    <p className="text-sm">{selectedProcesso.assunto}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valor Condenação</p>
                    <p className="text-sm font-bold text-[#c8956c]">{formatCurrency(parseFloat(selectedProcesso.valorCondenacao || "0"))}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {selectedProcesso.perdaPrazo && <Badge variant="destructive">PERDA DE PRAZO</Badge>}
                    <p className="text-sm">{selectedProcesso.status}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Observações</p>
                  <p className="text-sm leading-relaxed bg-muted/50 p-3 rounded-lg">{selectedProcesso.observacoes || "Sem observações."}</p>
                </div>
                <ProcessoAnexoIA
                  processoId={selectedProcesso.id}
                  tipoProcesso="trabalhista"
                  numeroProcesso={selectedProcesso.numero}
                />
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
