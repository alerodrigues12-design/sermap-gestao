/**
 * Lógica de análise de PDFs com suporte a chunking
 * Exporta a função de análise que será usada no router
 */

import { invokeLLM } from "./_core/llm";
import { shouldChunkPDF, mergeChunkAnalyses } from "./_core/pdfProcessor";
import { extractTextFromPDF, createPageChunks, generateChunkPrompt } from "./_core/pdfExtractor";

const systemPrompt = `Você é um especialista jurídico brasileiro sênior com profundo conhecimento em direito tributário, trabalhista, cível e processual. Sua missão é analisar processos judiciais com máximo rigor técnico e extrair TODAS as informações relevantes para uma advogada tributarista que precisa tomar decisões estratégicas sem ler o processo inteiro. Seja extremamente detalhado na linha do tempo — extraia CADA movimentação, petição, despacho, decisão, intimação, recurso, audiência e prazo que encontrar no documento. A linha do tempo é a parte mais importante da análise.`;

const jsonStructurePrompt = `Retorne um JSON com a seguinte estrutura. A linha do tempo deve conter TODAS as movimentações encontradas no documento, sem exceção:
{
  "resumo": "resumo executivo detalhado do processo em 3-4 parágrafos: origem, pedidos, situação atual e perspectiva",
  "partes": { "autor": "nome completo", "reu": "nome completo", "advogadoAutor": "nome e OAB", "advogadoReu": "nome e OAB" },
  "tipo": "tipo e subtipo do processo (ex: Reclamação Trabalhista - Vínculo Empregatício)",
  "valor": "valor da causa em reais",
  "tribunal": "tribunal, vara e cidade",
  "numeroProcesso": "número CNJ do processo",
  "dataDistribuicao": "DD/MM/AAAA",
  "situacaoAtual": "descrição da situação processual atual",
  "linhaDoTempo": [
    {
      "data": "DD/MM/AAAA",
      "evento": "descrição COMPLETA e detalhada do evento/movimentação",
      "tipo": "distribuicao|citacao|contestacao|audiencia|pericia|decisao|sentenca|recurso|acordao|penhora|leilao|intimacao|peticao|despacho|prazo|outro",
      "importancia": "critica|alta|media|baixa",
      "prazoVencido": true,
      "observacao": "observação técnica sobre este evento se relevante"
    }
  ],
  "nulidades": [{ "tipo": "nome da nulidade", "descricao": "descrição técnica detalhada", "fundamentoLegal": "artigo/lei/súmula", "probabilidadeExito": "alta|media|baixa", "observacao": "como arguir" }],
  "estrategiasDefesa": [{ "nome": "nome da estratégia", "descricao": "como aplicar na prática", "fundamentoLegal": "base legal completa", "prioridade": "urgente|alta|media|baixa", "probabilidadeExito": "alta|media|baixa", "prazoParaAcao": "imediato|curto prazo|médio prazo" }],
  "riscos": [{ "descricao": "descrição do risco", "nivel": "alto|medio|baixo", "impacto": "impacto financeiro ou processual estimado" }],
  "recomendacoes": ["recomendação estratégica detalhada 1", "recomendação 2"],
  "excecaoPreExecutividade": { "cabivel": true, "argumentos": ["argumento técnico 1", "argumento 2"], "urgencia": "imediata|breve|pode aguardar", "fundamentacao": "fundamentação legal" },
  "prescricao": { "ocorreu": true, "dataOcorrencia": "DD/MM/AAAA ou null", "observacao": "análise da prescrição" },
  "avaliacaoGeral": { "risco": "alto|medio|baixo", "chancesDefesa": "alta|media|baixa", "prioridade": "urgente|alta|media|baixa", "resumoEstrategico": "parágrafo com a avaliação estratégica geral" }
}`;

/**
 * Tenta análise com retry e timeout progressivo
 */
async function tentarAnalise(
  llmMessages: any[],
  tentativa: number = 1,
  maxTentativas: number = 5
): Promise<string> {
  try {
    console.log(`[AnaliseIA] Iniciando tentativa ${tentativa}/${maxTentativas}`);
    const response = await invokeLLM({
      messages: llmMessages,
      response_format: { type: "json_object" },
      maxTokens: 32768,
    });
    const content = response?.choices?.[0]?.message?.content;
    const contentStr = typeof content === "string" ? content : null;

    if (!contentStr || contentStr.trim() === "") {
      console.warn(`[AnaliseIA] Resposta vazia na tentativa ${tentativa}/${maxTentativas}`);
      if (tentativa < maxTentativas) {
        // Timeouts progressivos: 5s, 15s, 30s, 45s, 60s
        const waitTimes = [5000, 15000, 30000, 45000, 60000];
        const waitTime = waitTimes[tentativa - 1] || 60000;
        console.log(`[AnaliseIA] Aguardando ${waitTime}ms antes de retentar...`);
        await new Promise((r) => setTimeout(r, waitTime));
        return tentarAnalise(llmMessages, tentativa + 1, maxTentativas);
      }
      throw new Error(
        `A IA não retornou conteúdo após ${tentativa} tentativas. O arquivo PDF pode ser muito grande, estar corrompido ou em formato não suportado. Tente dividir o PDF em partes menores (máximo 50 páginas por arquivo).`
      );
    }
    console.log(`[AnaliseIA] Resposta recebida com sucesso na tentativa ${tentativa}`);
    return contentStr;
  } catch (err) {
    console.error(`[AnaliseIA] Erro na tentativa ${tentativa}:`, err);
    if (tentativa < maxTentativas) {
      // Timeouts progressivos: 5s, 15s, 30s, 45s, 60s
      const waitTimes = [5000, 15000, 30000, 45000, 60000];
      const waitTime = waitTimes[tentativa - 1] || 60000;
      console.log(`[AnaliseIA] Aguardando ${waitTime}ms antes de retentar após erro...`);
      await new Promise((r) => setTimeout(r, waitTime));
      return tentarAnalise(llmMessages, tentativa + 1, maxTentativas);
    }
    throw err;
  }
}

/**
 * Analisa um PDF inteiro com suporte a chunking automático
 */
export async function analisarProcessoPDF(
  pdfUrl: string,
  pdfSizeBytes: number,
  anexoId: number
): Promise<any> {
  const pdfSizeMB = pdfSizeBytes / (1024 * 1024);
  const chunkSize = shouldChunkPDF(pdfSizeBytes);

  console.log(`[AnaliseIA] Iniciando análise do PDF ${anexoId} (${pdfSizeMB.toFixed(2)}MB)`);

  if (!chunkSize) {
    // PDF pequeno - análise direta
    console.log(`[AnaliseIA] PDF pequeno. Processando direto sem chunking.`);
    const llmMessages = [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      {
        role: "user" as const,
        content: [
          {
            type: "file_url" as const,
            file_url: { url: pdfUrl, mime_type: "application/pdf" as const },
          },
          {
            type: "text" as const,
            text: `Analise este processo judicial COMPLETO e ${jsonStructurePrompt}`,
          },
        ],
      },
    ];

    const analiseStr = await tentarAnalise(llmMessages);
    return JSON.parse(analiseStr);
  }

  // PDF grande - análise com chunking
  console.log(
    `[AnaliseIA] PDF grande detectado (${pdfSizeMB.toFixed(2)}MB). Será dividido em chunks de ~${chunkSize} páginas.`
  );

  try {
    // Extrair texto do PDF
    console.log(`[AnaliseIA] Extraindo texto do PDF...`);
    const extraction = await extractTextFromPDF(pdfUrl);
    console.log(`[AnaliseIA] PDF contém ${extraction.totalPages} páginas`);

    // Criar chunks
    const chunks = createPageChunks(extraction.totalPages, extraction.pageTexts, chunkSize);
    console.log(`[AnaliseIA] PDF dividido em ${chunks.length} chunks`);

    // Analisar cada chunk
    const analyses: any[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const isFirst = i === 0;
      const isLast = i === chunks.length - 1;

      console.log(
        `[AnaliseIA] Analisando chunk ${i + 1}/${chunks.length} (páginas ${chunk.pageStart}-${chunk.pageEnd})`
      );

      const chunkPrompt = generateChunkPrompt(chunk, i + 1, chunks.length, isFirst, isLast);
      const llmMessages = [
        {
          role: "system" as const,
          content: systemPrompt,
        },
        {
          role: "user" as const,
          content: [
            {
              type: "text" as const,
              text: `${chunkPrompt}\n\n${jsonStructurePrompt}`,
            },
          ],
        },
      ];

      const analiseStr = await tentarAnalise(llmMessages, 1, 3); // Menos tentativas para chunks
      const analiseObj = JSON.parse(analiseStr);
      analyses.push(analiseObj);

      // Aguardar um pouco entre chunks para não sobrecarregar a API
      if (!isLast) {
        console.log(`[AnaliseIA] Aguardando 2 segundos antes do próximo chunk...`);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    // Mesclar análises
    console.log(`[AnaliseIA] Mesclando análises dos ${chunks.length} chunks...`);
    const analiseConsolidada = mergeChunkAnalyses(analyses);

    console.log(`[AnaliseIA] Análise consolidada concluída com sucesso!`);
    return analiseConsolidada;
  } catch (error) {
    console.error(`[AnaliseIA] Erro ao processar PDF com chunking:`, error);
    throw error;
  }
}
