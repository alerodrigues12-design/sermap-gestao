/**
 * DataJud Monitor Service
 * 
 * Consulta periodicamente a API Pública do DataJud (CNJ) para detectar
 * novas movimentações processuais e gerar notificações no site.
 * 
 * Executa a cada 30 minutos quando o servidor está rodando.
 */

import { getDb } from "./db";
import { processos, movimentacoes, notificacoes } from "../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import { ENV } from "./_core/env";

// API Key pública do DataJud (CNJ) - será configurada via variável de ambiente
// Obtenha a chave em: https://datajud-wiki.cnj.jus.br/api-publica/acesso/
const DATAJUD_PUBLIC_API_KEY = ""; // Será preenchida via ENV ou webdev_request_secrets

// Mapeamento de segmento de justiça para índice da API DataJud
function getApiIndex(numero: string, sistema: string): string {
  // Extrair o segmento do número CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO
  // J = segmento de justiça (posição 14 no número sem pontuação)
  const clean = numero.replace(/[^0-9]/g, "");
  
  // Segmento de justiça (dígito na posição 13, 0-indexed)
  const segmento = clean.length >= 14 ? clean[13] : "";
  // Tribunal (posições 14-15)
  const tribunal = clean.length >= 16 ? clean.substring(14, 16) : "";
  
  // eSAJ de SP - usar TJSP
  if (sistema === "esaj") {
    return "api_publica_tjsp";
  }
  
  // Remove leading zero from tribunal code for API index
  const tribunalNum = parseInt(tribunal, 10).toString();
  
  switch (segmento) {
    case "1": // STF
      return "api_publica_stf";
    case "2": // CNJ
      return "api_publica_cnj";
    case "3": // STJ
      return "api_publica_stj";
    case "4": // Justiça Federal (TRF1, TRF2, etc - sem zero à esquerda)
      return `api_publica_trf${tribunalNum}`;
    case "5": // Justiça do Trabalho (TRT regional, não TST)
      return `api_publica_trt${tribunalNum}`;
    case "6": // Justiça Eleitoral
      return `api_publica_tse`;
    case "7": // Justiça Militar
      return `api_publica_stm`;
    case "8": // Justiça Estadual
      return `api_publica_tj${getEstadoSigla(tribunal)}`;
    case "9": // Justiça Militar Estadual
      return `api_publica_tjm${getEstadoSigla(tribunal)}`;
    default:
      return "api_publica_tst"; // fallback
  }
}

function getEstadoSigla(tribunalCode: string): string {
  const map: Record<string, string> = {
    "01": "ac", "02": "al", "03": "ap", "04": "am", "05": "ba",
    "06": "ce", "07": "df", "08": "es", "09": "go", "10": "ma",
    "11": "mt", "12": "ms", "13": "mg", "14": "pa", "15": "pb",
    "16": "pe", "17": "pi", "18": "pr", "19": "rj", "20": "rn",
    "21": "rs", "22": "ro", "23": "rr", "24": "sc", "25": "se",
    "26": "sp", "27": "to",
  };
  return map[tribunalCode] || "sp";
}

interface DataJudMovimento {
  codigo: number;
  nome: string;
  dataHora: string;
  complementosTabelados?: Array<{
    codigo: number;
    valor: number;
    nome: string;
    descricao: string;
  }>;
  orgaoJulgador?: {
    codigo: string;
    nome: string;
  };
}

interface DataJudHit {
  _source: {
    numeroProcesso: string;
    classe: { codigo: number; nome: string };
    sistema: { codigo: number; nome: string };
    tribunal: string;
    dataHoraUltimaAtualizacao: string;
    movimentos: DataJudMovimento[];
  };
}

async function consultarProcessoDataJud(
  numero: string,
  apiIndex: string,
  apiKey: string
): Promise<DataJudHit | null> {
  const cleanNumber = numero.replace(/[^0-9]/g, "");
  
  try {
    const response = await fetch(
      `https://api-publica.datajud.cnj.jus.br/${apiIndex}/_search`,
      {
        method: "POST",
        headers: {
          "Authorization": `APIKey ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          size: 1,
          query: {
            match: {
              numeroProcesso: cleanNumber,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn(`[DataJud] API retornou ${response.status} para ${numero} no índice ${apiIndex}`);
      return null;
    }

    const data = await response.json();
    
    if (data.hits?.hits?.length > 0) {
      return data.hits.hits[0] as DataJudHit;
    }
    
    return null;
  } catch (error) {
    console.error(`[DataJud] Erro ao consultar ${numero}:`, error);
    return null;
  }
}

async function getUltimaMovimentacaoSalva(processoId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select({ dataMovimentacao: movimentacoes.dataMovimentacao })
    .from(movimentacoes)
    .where(eq(movimentacoes.processoId, processoId))
    .orderBy(desc(movimentacoes.dataMovimentacao))
    .limit(1);
  
  return result.length > 0 ? result[0].dataMovimentacao : null;
}

async function salvarNovasMovimentacoes(
  processoId: number,
  processoNumero: string,
  novosMovimentos: DataJudMovimento[]
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  let count = 0;
  
  for (const mov of novosMovimentos) {
    const complemento = mov.complementosTabelados
      ?.map(c => c.nome)
      .join(", ") || null;
    
    const orgao = mov.orgaoJulgador?.nome || null;
    
    await db.insert(movimentacoes).values({
      processoId,
      dataMovimentacao: mov.dataHora,
      descricao: mov.nome,
      complemento: [complemento, orgao ? `Órgão: ${orgao}` : null].filter(Boolean).join(" | "),
      fonte: "datajud",
      lida: false,
    });
    count++;
  }
  
  // Criar notificação se houve novas movimentações
  if (count > 0) {
    await db.insert(notificacoes).values({
      processoId,
      titulo: `Nova movimentação: ${processoNumero}`,
      mensagem: `Detectada(s) ${count} nova(s) movimentação(ões) no processo ${processoNumero}. Última: ${novosMovimentos[novosMovimentos.length - 1]?.nome || "N/A"}`,
      tipo: "movimentacao",
      lida: false,
    });
  }
  
  return count;
}

export async function executarMonitoramento(): Promise<{
  processosConsultados: number;
  novasMovimentacoes: number;
  erros: number;
}> {
  const apiKey = ENV.datajudApiKey || DATAJUD_PUBLIC_API_KEY;
  
  if (!apiKey) {
    console.warn("[DataJud Monitor] API Key não configurada. Monitoramento desativado.");
    return { processosConsultados: 0, novasMovimentacoes: 0, erros: 0 };
  }
  
  const db = await getDb();
  if (!db) {
    console.warn("[DataJud Monitor] Banco de dados não disponível.");
    return { processosConsultados: 0, novasMovimentacoes: 0, erros: 0 };
  }
  
  console.log("[DataJud Monitor] Iniciando monitoramento de processos...");
  
  const todosProcessos = await db.select().from(processos);
  
  let processosConsultados = 0;
  let totalNovasMovimentacoes = 0;
  let erros = 0;
  
  for (const processo of todosProcessos) {
    try {
      const apiIndex = getApiIndex(processo.numero, processo.sistema);
      const resultado = await consultarProcessoDataJud(processo.numero, apiIndex, apiKey);
      
      processosConsultados++;
      
      if (!resultado) {
        // Tentar índice alternativo (TST para trabalhistas, ou TRT com número diferente)
        if (processo.tipo === "trabalhista") {
          // Tentar TST como fallback
          const altIndex = "api_publica_tst";
          const altResultado = await consultarProcessoDataJud(processo.numero, altIndex, apiKey);
          if (altResultado) {
            const movimentosApi = altResultado._source.movimentos || [];
            const ultimaSalva = await getUltimaMovimentacaoSalva(processo.id);
            
            const novos = ultimaSalva
              ? movimentosApi.filter(m => m.dataHora > ultimaSalva)
              : movimentosApi.slice(-5); // Se nunca consultou, pegar últimas 5
            
            if (novos.length > 0) {
              const count = await salvarNovasMovimentacoes(processo.id, processo.numero, novos);
              totalNovasMovimentacoes += count;
            }
          }
        }
        continue;
      }
      
      const movimentosApi = resultado._source.movimentos || [];
      const ultimaSalva = await getUltimaMovimentacaoSalva(processo.id);
      
      // Filtrar apenas movimentações mais recentes que a última salva
      const novos = ultimaSalva
        ? movimentosApi.filter(m => m.dataHora > ultimaSalva)
        : movimentosApi.slice(-5); // Se nunca consultou, pegar últimas 5
      
      if (novos.length > 0) {
        const count = await salvarNovasMovimentacoes(processo.id, processo.numero, novos);
        totalNovasMovimentacoes += count;
        console.log(`[DataJud Monitor] ${processo.numero}: ${count} nova(s) movimentação(ões)`);
      }
      
      // Rate limiting - esperar 500ms entre consultas para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`[DataJud Monitor] Erro no processo ${processo.numero}:`, error);
      erros++;
    }
  }
  
  console.log(`[DataJud Monitor] Concluído: ${processosConsultados} consultados, ${totalNovasMovimentacoes} novas movimentações, ${erros} erros`);
  
  // Salvar timestamp da última execução
  const db2 = await getDb();
  if (db2) {
    const now = new Date().toISOString();
    const existing = await db2.select().from(
      (await import("../drizzle/schema")).systemConfig
    ).where(eq(
      (await import("../drizzle/schema")).systemConfig.chave,
      "ultima_consulta_datajud"
    )).limit(1);
    
    if (existing.length > 0) {
      await db2.update(
        (await import("../drizzle/schema")).systemConfig
      ).set({ valor: now }).where(eq(
        (await import("../drizzle/schema")).systemConfig.chave,
        "ultima_consulta_datajud"
      ));
    } else {
      await db2.insert(
        (await import("../drizzle/schema")).systemConfig
      ).values({ chave: "ultima_consulta_datajud", valor: now });
    }
  }
  
  return { processosConsultados, novasMovimentacoes: totalNovasMovimentacoes, erros };
}

// Intervalo de monitoramento: 30 minutos
const MONITOR_INTERVAL = 30 * 60 * 1000;

let monitorInterval: NodeJS.Timeout | null = null;

export function startDataJudMonitor() {
  const hasKey = ENV.datajudApiKey || DATAJUD_PUBLIC_API_KEY;
  if (!hasKey) {
    console.log("[DataJud Monitor] API Key do DataJud não configurada. Para ativar o monitoramento automático, configure a chave via webdev_request_secrets ou defina DATAJUD_API_KEY no .env");
    console.log("[DataJud Monitor] Obtenha a chave em: https://datajud-wiki.cnj.jus.br/api-publica/acesso/");
    return;
  }
  
  console.log("[DataJud Monitor] Monitor iniciado. Intervalo: 30 minutos.");
  
  // Executar primeira consulta após 60 segundos (dar tempo do servidor iniciar)
  setTimeout(async () => {
    try {
      await executarMonitoramento();
    } catch (error) {
      console.error("[DataJud Monitor] Erro na primeira execução:", error);
    }
  }, 60_000);
  
  // Agendar execuções periódicas
  monitorInterval = setInterval(async () => {
    try {
      await executarMonitoramento();
    } catch (error) {
      console.error("[DataJud Monitor] Erro na execução periódica:", error);
    }
  }, MONITOR_INTERVAL);
}

export function stopDataJudMonitor() {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
    console.log("[DataJud Monitor] Monitor parado.");
  }
}
