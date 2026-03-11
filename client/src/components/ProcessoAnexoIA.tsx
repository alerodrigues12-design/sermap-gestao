import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Upload, FileText, Brain, Clock, AlertTriangle, Shield,
  ChevronDown, ChevronUp, Trash2, Loader2, CheckCircle2,
  XCircle, Scale, TrendingUp, AlertCircle, FileSearch
} from "lucide-react";

type TipoProcesso = "trabalhista" | "civel" | "pf";

interface Props {
  processoId: number;
  tipoProcesso: TipoProcesso;
  numeroProcesso?: string;
}

interface AnaliseIA {
  resumo?: string;
  partes?: { autor?: string; reu?: string; advogados?: string[] };
  tipo?: string;
  valor?: string;
  tribunal?: string;
  linhaDoTempo?: Array<{ data: string; evento: string; tipo: string }>;
  nulidades?: Array<{ tipo: string; descricao: string; fundamentoLegal: string; probabilidadeExito: string }>;
  estrategiasDefesa?: Array<{ nome: string; descricao: string; fundamentoLegal: string; prioridade: string; probabilidadeExito: string }>;
  riscos?: Array<{ descricao: string; nivel: string; impacto: string }>;
  recomendacoes?: string[];
  excecaoPreExecutividade?: { cabivel: boolean; argumentos: string[]; urgencia: string };
  avaliacaoGeral?: { risco: string; chancesDefesa: string; prioridade: string };
}

const corProbabilidade = (p: string) => {
  if (p === "alta") return "bg-green-500/20 text-green-400 border-green-500/30";
  if (p === "media") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-red-500/20 text-red-400 border-red-500/30";
};

const corRisco = (r: string) => {
  if (r === "alto") return "bg-red-500/20 text-red-400 border-red-500/30";
  if (r === "medio") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-green-500/20 text-green-400 border-green-500/30";
};

const corPrioridade = (p: string) => {
  if (p === "urgente") return "bg-red-500/20 text-red-400 border-red-500/30";
  if (p === "alta") return "bg-orange-500/20 text-orange-400 border-orange-500/30";
  if (p === "media") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-slate-500/20 text-slate-400 border-slate-500/30";
};

const iconeTipoEvento = (tipo: string) => {
  if (tipo === "citacao") return "📬";
  if (tipo === "decisao") return "⚖️";
  if (tipo === "recurso") return "📋";
  if (tipo === "audiencia") return "🎤";
  if (tipo === "sentenca") return "🔨";
  return "📌";
};

export function ProcessoAnexoIA({ processoId, tipoProcesso, numeroProcesso }: Props) {
  const [uploading, setUploading] = useState(false);
  const [analisando, setAnalisando] = useState<number | null>(null);
  const [analiseAberta, setAnaliseAberta] = useState<number | null>(null);
  const [secaoAberta, setSecaoAberta] = useState<string>("resumo");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const { data: anexos = [], isLoading } = trpc.processoAnexos.listar.useQuery({
    processoId,
    tipoProcesso,
  });

  const uploadMutation = trpc.processoAnexos.upload.useMutation({
    onSuccess: () => {
      utils.processoAnexos.listar.invalidate({ processoId, tipoProcesso });
      toast.success("PDF enviado com sucesso!");
    },
    onError: (err) => toast.error("Erro no upload: " + err.message),
  });

  const analisarMutation = trpc.processoAnexos.analisar.useMutation({
    onSuccess: (data, variables) => {
      utils.processoAnexos.listar.invalidate({ processoId, tipoProcesso });
      setAnalisando(null);
      setAnaliseAberta(variables.anexoId);
      toast.success("Análise jurídica concluída!");
    },
    onError: (err) => {
      setAnalisando(null);
      toast.error("Erro na análise: " + err.message);
    },
  });

  const excluirMutation = trpc.processoAnexos.excluir.useMutation({
    onSuccess: () => {
      utils.processoAnexos.listar.invalidate({ processoId, tipoProcesso });
      toast.success("Anexo removido.");
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Apenas arquivos PDF são aceitos.");
      return;
    }
    if (file.size > 16 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Limite: 16MB.");
      return;
    }
    setUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const base64 = btoa(Array.from(uint8, (b) => String.fromCharCode(b)).join(""));
      await uploadMutation.mutateAsync({
        processoId,
        tipoProcesso,
        nomeArquivo: file.name,
        fileBase64: base64,
        tamanho: file.size,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAnalisar = async (anexoId: number) => {
    setAnalisando(anexoId);
    await analisarMutation.mutateAsync({ anexoId });
  };

  const renderAnalise = (analise: AnaliseIA) => (
    <div className="space-y-3 mt-4">
      {/* Avaliação Geral */}
      {analise.avaliacaoGeral && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700/50">
            <div className="text-xs text-slate-400 mb-1">Risco Geral</div>
            <Badge className={`text-xs ${corRisco(analise.avaliacaoGeral.risco)}`}>
              {analise.avaliacaoGeral.risco?.toUpperCase()}
            </Badge>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700/50">
            <div className="text-xs text-slate-400 mb-1">Chances de Defesa</div>
            <Badge className={`text-xs ${corProbabilidade(analise.avaliacaoGeral.chancesDefesa)}`}>
              {analise.avaliacaoGeral.chancesDefesa?.toUpperCase()}
            </Badge>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700/50">
            <div className="text-xs text-slate-400 mb-1">Prioridade</div>
            <Badge className={`text-xs ${corPrioridade(analise.avaliacaoGeral.prioridade)}`}>
              {analise.avaliacaoGeral.prioridade?.toUpperCase()}
            </Badge>
          </div>
        </div>
      )}

      {/* Navegação por seções */}
      <div className="flex flex-wrap gap-1 border-b border-slate-700/50 pb-2">
        {[
          { key: "resumo", label: "Resumo", icon: FileText },
          { key: "timeline", label: "Linha do Tempo", icon: Clock },
          { key: "nulidades", label: `Nulidades (${analise.nulidades?.length ?? 0})`, icon: AlertTriangle },
          { key: "defesa", label: `Defesas (${analise.estrategiasDefesa?.length ?? 0})`, icon: Shield },
          { key: "riscos", label: "Riscos", icon: AlertCircle },
          { key: "excecao", label: "Exceção Pré-Exec.", icon: Scale },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSecaoAberta(key)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              secaoAberta === key
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
            }`}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Resumo */}
      {secaoAberta === "resumo" && (
        <div className="space-y-3">
          {analise.resumo && (
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
              <p className="text-sm text-slate-300 leading-relaxed">{analise.resumo}</p>
            </div>
          )}
          {analise.partes && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                <div className="text-xs text-slate-400 mb-1">Autor / Reclamante</div>
                <div className="text-sm text-slate-200">{analise.partes.autor || "—"}</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                <div className="text-xs text-slate-400 mb-1">Réu / Reclamado</div>
                <div className="text-sm text-slate-200">{analise.partes.reu || "—"}</div>
              </div>
            </div>
          )}
          {analise.recomendacoes && analise.recomendacoes.length > 0 && (
            <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
              <div className="text-xs text-amber-400 font-semibold mb-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> RECOMENDAÇÕES ESTRATÉGICAS
              </div>
              <ul className="space-y-1">
                {analise.recomendacoes.map((r, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">→</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Linha do Tempo */}
      {secaoAberta === "timeline" && (
        <div className="space-y-2">
          {(analise.linhaDoTempo ?? []).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Nenhum evento identificado.</p>
          ) : (
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-700" />
              {analise.linhaDoTempo!.map((ev, i) => (
                <div key={i} className="relative mb-3">
                  <div className="absolute -left-4 top-1 w-3 h-3 rounded-full bg-slate-600 border border-slate-500 flex items-center justify-center text-[8px]">
                    {iconeTipoEvento(ev.tipo)}
                  </div>
                  <div className="bg-slate-800/30 rounded-lg p-2.5 border border-slate-700/30 ml-2">
                    <div className="text-xs text-amber-400 font-mono mb-0.5">{ev.data}</div>
                    <div className="text-sm text-slate-200">{ev.evento}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nulidades */}
      {secaoAberta === "nulidades" && (
        <div className="space-y-2">
          {(analise.nulidades ?? []).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Nenhuma nulidade identificada.</p>
          ) : (
            analise.nulidades!.map((n, i) => (
              <div key={i} className="bg-slate-800/30 rounded-lg p-3 border border-red-500/20">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="text-sm font-semibold text-red-300 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> {n.tipo}
                  </div>
                  <Badge className={`text-xs shrink-0 ${corProbabilidade(n.probabilidadeExito)}`}>
                    {n.probabilidadeExito}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 mb-1">{n.descricao}</p>
                <div className="text-xs text-slate-500 font-mono">Base legal: {n.fundamentoLegal}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Estratégias de Defesa */}
      {secaoAberta === "defesa" && (
        <div className="space-y-2">
          {(analise.estrategiasDefesa ?? []).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Nenhuma estratégia identificada.</p>
          ) : (
            analise.estrategiasDefesa!.map((e, i) => (
              <div key={i} className="bg-slate-800/30 rounded-lg p-3 border border-green-500/20">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="text-sm font-semibold text-green-300 flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" /> {e.nome}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Badge className={`text-xs ${corPrioridade(e.prioridade)}`}>{e.prioridade}</Badge>
                    <Badge className={`text-xs ${corProbabilidade(e.probabilidadeExito)}`}>{e.probabilidadeExito}</Badge>
                  </div>
                </div>
                <p className="text-xs text-slate-300 mb-1">{e.descricao}</p>
                <div className="text-xs text-slate-500 font-mono">Base legal: {e.fundamentoLegal}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Riscos */}
      {secaoAberta === "riscos" && (
        <div className="space-y-2">
          {(analise.riscos ?? []).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Nenhum risco identificado.</p>
          ) : (
            analise.riscos!.map((r, i) => (
              <div key={i} className="bg-slate-800/30 rounded-lg p-3 border border-orange-500/20">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="text-sm text-orange-300 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {r.descricao}
                  </div>
                  <Badge className={`text-xs shrink-0 ${corRisco(r.nivel)}`}>{r.nivel}</Badge>
                </div>
                <div className="text-xs text-slate-400">Impacto: {r.impacto}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Exceção de Pré-Executividade */}
      {secaoAberta === "excecao" && analise.excecaoPreExecutividade && (
        <div className={`rounded-lg p-4 border ${analise.excecaoPreExecutividade.cabivel ? "bg-green-500/10 border-green-500/30" : "bg-slate-800/30 border-slate-700/30"}`}>
          <div className="flex items-center gap-2 mb-3">
            <Scale className="h-4 w-4 text-green-400" />
            <span className="text-sm font-semibold text-slate-200">Exceção de Pré-Executividade</span>
            <Badge className={analise.excecaoPreExecutividade.cabivel ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-slate-500/20 text-slate-400"}>
              {analise.excecaoPreExecutividade.cabivel ? "CABÍVEL" : "NÃO CABÍVEL"}
            </Badge>
            {analise.excecaoPreExecutividade.cabivel && (
              <Badge className={`ml-auto ${corPrioridade(analise.excecaoPreExecutividade.urgencia)}`}>
                {analise.excecaoPreExecutividade.urgencia}
              </Badge>
            )}
          </div>
          {analise.excecaoPreExecutividade.argumentos?.length > 0 && (
            <ul className="space-y-1">
              {analise.excecaoPreExecutividade.argumentos.map((arg, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-green-400 mt-0.5 shrink-0">✓</span> {arg}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <FileSearch className="h-4 w-4 text-amber-400" />
          Análise Jurídica com IA
        </h4>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            {uploading ? "Enviando..." : "Anexar PDF"}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
          <Loader2 className="h-3 w-3 animate-spin" /> Carregando anexos...
        </div>
      )}

      {!isLoading && anexos.length === 0 && (
        <div className="text-xs text-slate-500 text-center py-4 border border-dashed border-slate-700/50 rounded-lg">
          Nenhum PDF anexado. Faça upload do processo completo para análise com IA.
        </div>
      )}

      {anexos.map((anexo) => {
        const analise: AnaliseIA | null = anexo.analiseResultado
          ? (() => { try { return JSON.parse(anexo.analiseResultado); } catch { return null; } })()
          : null;
        const estaAberto = analiseAberta === anexo.id;

        return (
          <Card key={anexo.id} className="bg-slate-800/40 border-slate-700/50">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-300 truncate">{anexo.nomeArquivo}</span>
                  {anexo.tamanho && (
                    <span className="text-xs text-slate-500 shrink-0">
                      ({(anexo.tamanho / 1024).toFixed(0)} KB)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {/* Status badge */}
                  {anexo.analiseStatus === "pendente" && (
                    <Badge className="text-xs bg-slate-700/50 text-slate-400 border-slate-600/50">Pendente</Badge>
                  )}
                  {anexo.analiseStatus === "processando" && (
                    <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30 flex items-center gap-1">
                      <Loader2 className="h-2.5 w-2.5 animate-spin" /> Analisando...
                    </Badge>
                  )}
                  {anexo.analiseStatus === "concluida" && (
                    <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Análise pronta
                    </Badge>
                  )}
                  {anexo.analiseStatus === "erro" && (
                    <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1">
                      <XCircle className="h-2.5 w-2.5" /> Erro
                    </Badge>
                  )}

                  {/* Botão analisar */}
                  {(anexo.analiseStatus === "pendente" || anexo.analiseStatus === "erro") && (
                    <Button
                      size="sm"
                      className="h-6 text-xs px-2 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
                      onClick={() => handleAnalisar(anexo.id)}
                      disabled={analisando === anexo.id}
                    >
                      {analisando === anexo.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <><Brain className="h-3 w-3 mr-1" /> Analisar com IA</>
                      )}
                    </Button>
                  )}

                  {/* Ver/ocultar análise */}
                  {analise && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-slate-400 hover:text-slate-200"
                      onClick={() => setAnaliseAberta(estaAberto ? null : anexo.id)}
                    >
                      {estaAberto ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </Button>
                  )}

                  {/* Link para o PDF */}
                  <a
                    href={anexo.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-6 w-6 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
                    title="Abrir PDF"
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </a>

                  {/* Excluir */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-slate-500 hover:text-red-400"
                    onClick={() => excluirMutation.mutate({ id: anexo.id })}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {estaAberto && analise && (
              <CardContent className="p-3 pt-0">
                {renderAnalise(analise)}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
