/**
 * Utilitário para processar PDFs grandes dividindo-os em chunks
 * Evita timeouts ao processar PDFs maiores que 15MB
 */

export interface PDFChunk {
  pageStart: number;
  pageEnd: number;
  content: string;
}

/**
 * Calcula se um PDF deve ser dividido em chunks
 * Retorna o número de páginas por chunk, ou null se não precisa dividir
 */
export function shouldChunkPDF(fileSizeBytes: number, estimatedPageCount?: number): number | null {
  // Se PDF > 15MB, dividir em chunks
  const SIZE_THRESHOLD = 15 * 1024 * 1024; // 15MB
  
  if (fileSizeBytes > SIZE_THRESHOLD) {
    // Estimar ~50KB por página em média
    const estimatedPages = estimatedPageCount || Math.ceil(fileSizeBytes / 50000);
    
    // Se > 100 páginas, dividir em chunks de ~50 páginas cada
    if (estimatedPages > 100) {
      return 50;
    }
    // Se > 50 páginas, dividir em chunks de ~30 páginas
    if (estimatedPages > 50) {
      return 30;
    }
  }
  
  return null;
}

/**
 * Gera instruções para análise de chunk de PDF
 * Útil para manter contexto ao analisar partes de um documento
 */
export function generateChunkAnalysisPrompt(
  chunkNumber: number,
  totalChunks: number,
  pageStart: number,
  pageEnd: number,
  isFirstChunk: boolean,
  isLastChunk: boolean
): string {
  let prompt = `Este é o chunk ${chunkNumber}/${totalChunks} do documento (páginas ${pageStart}-${pageEnd}).\n\n`;
  
  if (isFirstChunk) {
    prompt += `IMPORTANTE: Este é o PRIMEIRO chunk. Extraia TODAS as informações iniciais: número do processo, partes, tribunal, data de distribuição, etc.\n\n`;
  }
  
  if (isLastChunk) {
    prompt += `IMPORTANTE: Este é o ÚLTIMO chunk. Certifique-se de incluir TODAS as informações finais: últimas movimentações, status atual, prazos pendentes.\n\n`;
  }
  
  if (!isFirstChunk && !isLastChunk) {
    prompt += `IMPORTANTE: Este é um chunk intermediário. Extraia TODAS as movimentações e eventos deste intervalo de páginas.\n\n`;
  }
  
  prompt += `Mantenha o mesmo formato JSON de resposta, mas foque APENAS nas informações presentes neste chunk.`;
  
  return prompt;
}

/**
 * Mescla múltiplas análises de chunks em uma análise consolidada
 * Combina linhas do tempo, riscos, estratégias, etc.
 */
export function mergeChunkAnalyses(analyses: any[]): any {
  if (analyses.length === 0) return {};
  if (analyses.length === 1) return analyses[0];
  
  const merged: any = {
    resumo: analyses[0]?.resumo || "",
    partes: analyses[0]?.partes || {},
    tipo: analyses[0]?.tipo || "",
    valor: analyses[0]?.valor || "",
    tribunal: analyses[0]?.tribunal || "",
    numeroProcesso: analyses[0]?.numeroProcesso || "",
    dataDistribuicao: analyses[0]?.dataDistribuicao || "",
    situacaoAtual: analyses[analyses.length - 1]?.situacaoAtual || "",
    linhaDoTempo: [],
    nulidades: [],
    estrategiasDefesa: [],
    riscos: [],
    recomendacoes: [],
    excecaoPreExecutividade: analyses[0]?.excecaoPreExecutividade || {},
    prescricao: analyses[0]?.prescricao || {},
    avaliacaoGeral: analyses[analyses.length - 1]?.avaliacaoGeral || {},
  };
  
  // Mesclar linhas do tempo (remover duplicatas por data + evento)
  const timelineMap = new Map<string, any>();
  analyses.forEach(analysis => {
    if (analysis.linhaDoTempo && Array.isArray(analysis.linhaDoTempo)) {
      analysis.linhaDoTempo.forEach((item: any) => {
        const key = `${item.data}|${item.evento}`;
        if (!timelineMap.has(key)) {
          timelineMap.set(key, item);
        }
      });
    }
  });
  merged.linhaDoTempo = Array.from(timelineMap.values())
    .sort((a, b) => new Date(a.data.split('/').reverse().join('-')).getTime() - 
                     new Date(b.data.split('/').reverse().join('-')).getTime());
  
  // Mesclar nulidades (remover duplicatas por tipo)
  const nulityMap = new Map<string, any>();
  analyses.forEach(analysis => {
    if (analysis.nulidades && Array.isArray(analysis.nulidades)) {
      analysis.nulidades.forEach((item: any) => {
        if (!nulityMap.has(item.tipo)) {
          nulityMap.set(item.tipo, item);
        }
      });
    }
  });
  merged.nulidades = Array.from(nulityMap.values());
  
  // Mesclar estratégias de defesa (remover duplicatas por nome)
  const strategyMap = new Map<string, any>();
  analyses.forEach(analysis => {
    if (analysis.estrategiasDefesa && Array.isArray(analysis.estrategiasDefesa)) {
      analysis.estrategiasDefesa.forEach((item: any) => {
        if (!strategyMap.has(item.nome)) {
          strategyMap.set(item.nome, item);
        }
      });
    }
  });
  merged.estrategiasDefesa = Array.from(strategyMap.values());
  
  // Mesclar riscos (remover duplicatas por descrição)
  const riskMap = new Map<string, any>();
  analyses.forEach(analysis => {
    if (analysis.riscos && Array.isArray(analysis.riscos)) {
      analysis.riscos.forEach((item: any) => {
        if (!riskMap.has(item.descricao)) {
          riskMap.set(item.descricao, item);
        }
      });
    }
  });
  merged.riscos = Array.from(riskMap.values());
  
  // Mesclar recomendações (remover duplicatas)
  const recSet = new Set<string>();
  analyses.forEach(analysis => {
    if (analysis.recomendacoes && Array.isArray(analysis.recomendacoes)) {
      analysis.recomendacoes.forEach((rec: string) => recSet.add(rec));
    }
  });
  merged.recomendacoes = Array.from(recSet);
  
  return merged;
}
