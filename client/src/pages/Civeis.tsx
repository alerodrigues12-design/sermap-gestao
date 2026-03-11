import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Search, FileText, ExternalLink, CheckCircle2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProcessoAnexoIA } from "@/components/ProcessoAnexoIA";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function Civeis() {
  const { data: allProcessos, isLoading } = trpc.processos.list.useQuery();
  const [search, setSearch] = useState("");
  const [filterSistema, setFilterSistema] = useState("todos");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [selectedProcesso, setSelectedProcesso] = useState<any>(null);

  const processos = useMemo(() => {
    return (allProcessos || []).filter((p) => p.tipo !== "trabalhista");
  }, [allProcessos]);

  const filtered = useMemo(() => {
    return processos.filter((p) => {
      const matchSearch = !search || p.numero.toLowerCase().includes(search.toLowerCase()) || p.autor?.toLowerCase().includes(search.toLowerCase()) || p.assunto?.toLowerCase().includes(search.toLowerCase());
      const matchSistema = filterSistema === "todos" || p.sistema === filterSistema;
      const matchTipo = filterTipo === "todos" || p.tipo === filterTipo;
      return matchSearch && matchSistema && matchTipo;
    });
  }, [processos, search, filterSistema, filterTipo]);

  const totalValor = useMemo(() => {
    return filtered.reduce((sum, p) => sum + parseFloat(p.valorSentenca || p.valorCondenacao || "0"), 0);
  }, [filtered]);

  const totalEsaj = useMemo(() => {
    return filtered.filter((p) => p.sistema === "esaj").length;
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
        <h1 className="text-2xl md:text-3xl font-bold font-serif">Processos Cíveis e Tributários</h1>
        <p className="text-muted-foreground mt-1">Acompanhamento dos {processos.length} processos cíveis, tributários e execuções fiscais</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold mt-1">{filtered.length}</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Valor Total</p>
            <p className="text-2xl font-bold mt-1 text-[#4a5a3a]">{formatCurrency(totalValor)}</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">eSAJ (São Paulo)</p>
            <p className="text-2xl font-bold mt-1">{totalEsaj}</p>
          </CardContent>
        </Card>
        <Card className="stat-card border-destructive/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-xs text-destructive uppercase tracking-wider">Perda de Prazo</p>
            </div>
            <p className="text-2xl font-bold mt-1 text-destructive">{filtered.filter((p) => p.perdaPrazo).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por número, parte ou assunto..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterSistema} onValueChange={setFilterSistema}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Sistema" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Sistemas</SelectItem>
            <SelectItem value="pje">PJe</SelectItem>
            <SelectItem value="esaj">eSAJ (São Paulo)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Tipos</SelectItem>
            <SelectItem value="civel">Cível</SelectItem>
            <SelectItem value="tributario">Tributário</SelectItem>
            <SelectItem value="execucao_fiscal">Execução Fiscal</SelectItem>
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
                  <th className="text-left p-3 font-medium text-muted-foreground">Sistema</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Tipo</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Partes</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Assunto</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Valor</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const isGrave = p.risco === 'alto' && (p.observacoes?.toLowerCase().includes('sheila') || p.status?.toLowerCase().includes('redirecionamento') || p.observacoes?.toLowerCase().includes('grave'));
                  const isSucesso = p.observacoes?.toLowerCase().includes('hasta pública suspensa') || p.observacoes?.toLowerCase().includes('tutela de urgência') && p.observacoes?.toLowerCase().includes('deferida');
                  return (
                  <tr
                    key={p.id}
                    className={`border-b hover:bg-muted/30 cursor-pointer transition-colors ${
                      isSucesso ? "bg-emerald-50 border-l-4 border-l-emerald-600" :
                      isGrave ? "bg-red-50 border-l-4 border-l-red-600" : 
                      p.perdaPrazo ? "bg-destructive/5 border-l-4 border-l-destructive" : ""
                    }`}
                    onClick={() => setSelectedProcesso(p)}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {isSucesso && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                        {isGrave && !isSucesso && <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0" />}
                        {p.perdaPrazo && !isGrave && !isSucesso && <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />}
                        <span className="font-mono text-xs">{p.numero}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={p.sistema === "esaj" ? "default" : "secondary"} className={`text-[10px] ${p.sistema === "esaj" ? "bg-blue-600" : ""}`}>
                        {p.sistema === "esaj" ? "eSAJ" : "PJe"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {p.tipo === "execucao_fiscal" ? "Exec. Fiscal" : p.tipo === "tributario" ? "Tributário" : "Cível"}
                      </Badge>
                    </td>
                    <td className="p-3 max-w-[120px]">
                      <p className="text-xs truncate">{p.autor}</p>
                      <p className="text-xs text-muted-foreground truncate">vs {p.reu}</p>
                    </td>
                    <td className="p-3 max-w-[180px] truncate text-muted-foreground text-xs">{p.assunto}</td>
                    <td className="p-3 text-right font-medium whitespace-nowrap">
                      {parseFloat(p.valorSentenca || "0") > 0 ? formatCurrency(parseFloat(p.valorSentenca || "0")) : "-"}
                    </td>
                    <td className="p-3">
                      {isSucesso ? (
                        <Badge className="text-[10px] bg-emerald-600 hover:bg-emerald-700">HASTA SUSPENSA ✓</Badge>
                      ) : p.perdaPrazo ? (
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
              <FileText className="h-5 w-5 text-[#4a5a3a]" />
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
                    <p className="text-xs text-muted-foreground">Sistema</p>
                    <Badge variant={selectedProcesso.sistema === "esaj" ? "default" : "secondary"} className={selectedProcesso.sistema === "esaj" ? "bg-blue-600" : ""}>
                      {selectedProcesso.sistema === "esaj" ? "eSAJ (TJSP)" : "PJe"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Órgão</p>
                    <p className="text-sm">{selectedProcesso.orgao}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Local</p>
                    <p className="text-sm">{selectedProcesso.local}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Autor</p>
                    <p className="text-sm font-medium">{selectedProcesso.autor}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Réu</p>
                    <p className="text-sm">{selectedProcesso.reu}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Assunto</p>
                    <p className="text-sm">{selectedProcesso.assunto}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valor</p>
                    <p className="text-sm font-bold text-[#4a5a3a]">
                      {parseFloat(selectedProcesso.valorSentenca || "0") > 0 ? formatCurrency(parseFloat(selectedProcesso.valorSentenca || "0")) : "Não informado"}
                    </p>
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
                  tipoProcesso="civel"
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
