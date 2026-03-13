import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  FileText, Sparkles, Copy, Download, Trash2, Loader2,
  CheckCircle2, Edit3, Save, AlertTriangle, Scale, ChevronDown, ChevronUp
} from "lucide-react";

type TipoProcesso = "trabalhista" | "civel" | "pf";

type TipoPeticao =
  | "excecao_pre_executividade"
  | "embargos_execucao"
  | "impugnacao"
  | "recurso_ordinario"
  | "agravo_peticao"
  | "contestacao"
  | "peticao_generica"
  | "excecao_incompetencia"
  | "nulidade_citacao"
  | "prescricao_decadencia";

interface Props {
  processoId: number;
  tipoProcesso: TipoProcesso;
  numeroProcesso?: string;
  contextoAnalise?: string; // resumo da análise IA
  urgencias?: string[]; // peças urgentes identificadas pela IA
}

const TIPOS_PETICAO: { value: TipoPeticao; label: string; descricao: string; urgente?: boolean }[] = [
  { value: "excecao_pre_executividade", label: "Exceção de Pré-Executividade", descricao: "Arguição de nulidades sem garantia do juízo", urgente: true },
  { value: "embargos_execucao", label: "Embargos à Execução", descricao: "Defesa em execução com garantia do juízo" },
  { value: "impugnacao", label: "Impugnação", descricao: "Impugnação ao cumprimento de sentença" },
  { value: "nulidade_citacao", label: "Arguição de Nulidade de Citação", descricao: "Nulidade por vício na citação", urgente: true },
  { value: "prescricao_decadencia", label: "Prescrição / Decadência", descricao: "Arguição de prescrição ou decadência do crédito", urgente: true },
  { value: "excecao_incompetencia", label: "Exceção de Incompetência", descricao: "Arguição de incompetência do juízo" },
  { value: "recurso_ordinario", label: "Recurso Ordinário", descricao: "Recurso contra sentença trabalhista" },
  { value: "agravo_peticao", label: "Agravo de Petição", descricao: "Recurso em fase de execução trabalhista" },
  { value: "contestacao", label: "Contestação", descricao: "Defesa inicial no processo" },
  { value: "peticao_generica", label: "Petição Genérica", descricao: "Petição para qualquer finalidade" },
];

const STATUS_CORES: Record<string, string> = {
  rascunho: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  revisada: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  finalizada: "bg-green-500/20 text-green-400 border-green-500/30",
};

export function GeradorPeticao({ processoId, tipoProcesso, numeroProcesso, contextoAnalise, urgencias }: Props) {
  const [tipoPeticaoSelecionado, setTipoPeticaoSelecionado] = useState<TipoPeticao | "">("");
  const [instrucoes, setInstrucoes] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [conteudoEditado, setConteudoEditado] = useState("");
  const [expandidoId, setExpandidoId] = useState<number | null>(null);
  const [gerandoNova, setGerandoNova] = useState(false);

  const utils = trpc.useUtils();

  const { data: peticoes = [], isLoading } = trpc.peticoes.listar.useQuery(
    { processoId, tipoProcesso },
    { enabled: !!processoId }
  );

  const gerarMutation = trpc.peticoes.gerar.useMutation({
    onSuccess: (data) => {
      utils.peticoes.listar.invalidate({ processoId, tipoProcesso });
      setGerandoNova(false);
      setTipoPeticaoSelecionado("");
      setInstrucoes("");
      setExpandidoId(data.id);
      toast.success("Petição gerada com sucesso!");
    },
    onError: (err) => {
      setGerandoNova(false);
      toast.error("Erro ao gerar petição: " + err.message);
    },
  });

  const atualizarMutation = trpc.peticoes.atualizar.useMutation({
    onSuccess: () => {
      utils.peticoes.listar.invalidate({ processoId, tipoProcesso });
      setEditandoId(null);
      toast.success("Petição atualizada.");
    },
  });

  const excluirMutation = trpc.peticoes.excluir.useMutation({
    onSuccess: () => {
      utils.peticoes.listar.invalidate({ processoId, tipoProcesso });
      toast.success("Petição excluída.");
    },
  });

  const handleGerar = () => {
    if (!tipoPeticaoSelecionado) {
      toast.error("Selecione o tipo de petição.");
      return;
    }
    setGerandoNova(true);
    gerarMutation.mutate({
      processoId,
      tipoProcesso,
      numeroProceso: numeroProcesso,
      tipoPeticao: tipoPeticaoSelecionado,
      contexto: contextoAnalise,
      instrucoes: instrucoes || undefined,
    });
  };

  const handleCopiar = (conteudo: string) => {
    navigator.clipboard.writeText(conteudo);
    toast.success("Petição copiada para a área de transferência!");
  };

  const handleBaixar = (titulo: string, conteudo: string) => {
    const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${titulo.replace(/[^a-zA-Z0-9\s]/g, "").trim()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Petição baixada!");
  };

  const handleSalvarEdicao = (id: number) => {
    atualizarMutation.mutate({ id, conteudo: conteudoEditado });
  };

  const handleMarcarStatus = (id: number, status: "rascunho" | "revisada" | "finalizada") => {
    atualizarMutation.mutate({ id, status });
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Cabeçalho */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-700/50">
        <Scale className="h-4 w-4 text-amber-400" />
        <h4 className="text-sm font-semibold text-slate-200">Gerador de Petições com IA</h4>
        <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">
          {peticoes.length} gerada{peticoes.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Alertas de urgência identificados pela IA */}
      {urgencias && urgencias.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-xs font-semibold text-red-400">Peticionamento Urgente Identificado pela IA</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {urgencias.map((u, i) => (
              <Badge key={i} className="text-xs bg-red-500/20 text-red-300 border-red-500/30">{u}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Formulário de geração */}
      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Gerar Nova Petição
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tipo de Peça Processual</label>
            <Select
              value={tipoPeticaoSelecionado}
              onValueChange={(v) => setTipoPeticaoSelecionado(v as TipoPeticao)}
            >
              <SelectTrigger className="h-8 text-xs bg-slate-900/50 border-slate-700 text-slate-200">
                <SelectValue placeholder="Selecione o tipo de petição..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {TIPOS_PETICAO.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="text-xs text-slate-200 focus:bg-slate-800">
                    <div className="flex items-center gap-2">
                      {t.urgente && <span className="text-red-400">⚡</span>}
                      <div>
                        <div className="font-medium">{t.label}</div>
                        <div className="text-slate-500 text-[10px]">{t.descricao}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Instruções Adicionais (opcional)</label>
            <Textarea
              value={instrucoes}
              onChange={(e) => setInstrucoes(e.target.value)}
              placeholder="Ex: Enfatizar a nulidade da CDA por ausência de processo administrativo. Incluir pedido de tutela de urgência..."
              className="text-xs bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-600 min-h-[70px] resize-none"
            />
          </div>

          <Button
            onClick={handleGerar}
            disabled={gerandoNova || !tipoPeticaoSelecionado}
            className="w-full h-8 text-xs bg-amber-600 hover:bg-amber-500 text-white gap-2"
          >
            {gerandoNova ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Gerando petição com IA...</>
            ) : (
              <><Sparkles className="h-3.5 w-3.5" /> Gerar Petição com IA</>
            )}
          </Button>
          {gerandoNova && (
            <p className="text-xs text-slate-500 text-center">
              A IA está redigindo a petição completa. Isso pode levar 15–30 segundos...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Lista de petições geradas */}
      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
          <Loader2 className="h-3 w-3 animate-spin" /> Carregando petições...
        </div>
      )}

      {!isLoading && peticoes.length === 0 && (
        <div className="text-xs text-slate-500 text-center py-4 border border-dashed border-slate-700/50 rounded-lg">
          Nenhuma petição gerada ainda. Use o formulário acima para criar a primeira.
        </div>
      )}

      {peticoes.map((p) => (
        <Card key={p.id} className="bg-slate-800/30 border-slate-700/40">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <FileText className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200 truncate">{p.titulo}</span>
                  <Badge className={`text-[10px] ${STATUS_CORES[p.status]}`}>{p.status}</Badge>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {new Date(p.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm" variant="ghost"
                  className="h-6 w-6 p-0 text-slate-400 hover:text-slate-200"
                  onClick={() => setExpandidoId(expandidoId === p.id ? null : p.id)}
                  title={expandidoId === p.id ? "Recolher" : "Expandir"}
                >
                  {expandidoId === p.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  size="sm" variant="ghost"
                  className="h-6 w-6 p-0 text-slate-400 hover:text-blue-400"
                  onClick={() => handleCopiar(p.conteudo)}
                  title="Copiar"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  size="sm" variant="ghost"
                  className="h-6 w-6 p-0 text-slate-400 hover:text-green-400"
                  onClick={() => handleBaixar(p.titulo, p.conteudo)}
                  title="Baixar .txt"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  size="sm" variant="ghost"
                  className="h-6 w-6 p-0 text-slate-400 hover:text-amber-400"
                  onClick={() => { setEditandoId(p.id); setConteudoEditado(p.conteudo); setExpandidoId(p.id); }}
                  title="Editar"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm" variant="ghost"
                  className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                  onClick={() => excluirMutation.mutate({ id: p.id })}
                  title="Excluir"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {/* Botões de status */}
            <div className="flex gap-1 mt-2 flex-wrap">
              {(["rascunho", "revisada", "finalizada"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => handleMarcarStatus(p.id, s)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    p.status === s
                      ? STATUS_CORES[s] + " font-semibold"
                      : "border-slate-700/50 text-slate-600 hover:text-slate-400"
                  }`}
                >
                  {s === "rascunho" ? "Rascunho" : s === "revisada" ? "Revisada" : "Finalizada"}
                </button>
              ))}
              {p.status === "finalizada" && (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400 ml-1" />
              )}
            </div>
          </CardHeader>

          {expandidoId === p.id && (
            <CardContent className="px-4 pb-4">
              {editandoId === p.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={conteudoEditado}
                    onChange={(e) => setConteudoEditado(e.target.value)}
                    className="text-xs bg-slate-900/70 border-slate-700 text-slate-200 min-h-[400px] font-mono leading-relaxed resize-y"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-green-600 hover:bg-green-500 text-white gap-1"
                      onClick={() => handleSalvarEdicao(p.id)}
                      disabled={atualizarMutation.isPending}
                    >
                      {atualizarMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                      Salvar Edição
                    </Button>
                    <Button
                      size="sm" variant="ghost"
                      className="h-7 text-xs text-slate-400"
                      onClick={() => setEditandoId(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700/30">
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {p.conteudo}
                  </pre>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
