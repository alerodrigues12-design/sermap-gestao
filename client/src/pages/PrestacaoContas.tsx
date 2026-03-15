import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { toast } from "sonner";

function formatBRL(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function today() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function PrestacaoContas() {
  const utils = trpc.useUtils();
  const { data: lancamentos = [], isLoading } = trpc.prestacaoContas.listar.useQuery();

  const criarMutation = trpc.prestacaoContas.criar.useMutation({
    onSuccess: () => {
      utils.prestacaoContas.listar.invalidate();
      setDialogOpen(false);
      resetForm();
      toast.success("Lançamento registrado com sucesso.");
    },
    onError: (err) => toast.error(err.message),
  });

  const excluirMutation = trpc.prestacaoContas.excluir.useMutation({
    onSuccess: () => {
      utils.prestacaoContas.listar.invalidate();
      toast.success("Lançamento excluído.");
    },
    onError: (err) => toast.error(err.message),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(today());
  const [observacoes, setObservacoes] = useState("");

  function resetForm() {
    setTipo("entrada");
    setDescricao("");
    setValor("");
    setData(today());
    setObservacoes("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(valor.replace(",", "."));
    if (!descricao.trim() || isNaN(num) || num <= 0) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    criarMutation.mutate({ tipo, descricao: descricao.trim(), valor: num, data, observacoes: observacoes.trim() || undefined });
  }

  const totalEntradas = lancamentos
    .filter((l) => l.tipo === "entrada")
    .reduce((acc, l) => acc + parseFloat(l.valor), 0);

  const totalSaidas = lancamentos
    .filter((l) => l.tipo === "saida")
    .reduce((acc, l) => acc + parseFloat(l.valor), 0);

  const saldo = totalEntradas - totalSaidas;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prestação de Contas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Alessandra Hoffmann — Consultoria Tributária Estratégica
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Lançamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Lançamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as "entrada" | "saida")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada (valor recebido)</SelectItem>
                    <SelectItem value="saida">Saída (valor gasto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Descrição *</Label>
                <Input
                  placeholder="Ex: Honorários março, Passagem aérea..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Valor (R$) *</Label>
                  <Input
                    placeholder="0,00"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Data *</Label>
                  <Input
                    placeholder="DD/MM/AAAA"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Observações</Label>
                <Textarea
                  placeholder="Detalhes adicionais (opcional)"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" className="flex-1" disabled={criarMutation.isPending}>
                  {criarMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de totais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/40">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Recebido</p>
                <p className="text-xl font-bold text-green-700 dark:text-green-400">{formatBRL(totalEntradas)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/40">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Gasto</p>
                <p className="text-xl font-bold text-red-700 dark:text-red-400">{formatBRL(totalSaidas)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 ${saldo >= 0 ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" : "border-orange-400 bg-orange-50 dark:bg-orange-950/20"}`}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${saldo >= 0 ? "bg-[var(--color-primary)]/10" : "bg-orange-100 dark:bg-orange-900/40"}`}>
                <Wallet className={`w-5 h-5 ${saldo >= 0 ? "text-[var(--color-primary)]" : "text-orange-600"}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Saldo</p>
                <p className={`text-xl font-bold ${saldo >= 0 ? "text-[var(--color-primary)]" : "text-orange-600"}`}>{formatBRL(saldo)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de lançamentos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Lançamentos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Carregando...</div>
          ) : lancamentos.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Nenhum lançamento registrado ainda. Clique em "Novo Lançamento" para começar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Descrição</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Valor</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {lancamentos.map((l) => (
                    <tr key={l.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{l.data}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">{l.descricao}</span>
                        {l.observacoes && (
                          <p className="text-xs text-muted-foreground mt-0.5">{l.observacoes}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {l.tipo === "entrada" ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-0 font-normal">
                            Entrada
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-0 font-normal">
                            Saída
                          </Badge>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${l.tipo === "entrada" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {l.tipo === "saida" ? "− " : "+ "}{formatBRL(l.valor)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
                              <AlertDialogDescription>
                                O lançamento <strong>"{l.descricao}"</strong> será removido permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => excluirMutation.mutate({ id: l.id })}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
