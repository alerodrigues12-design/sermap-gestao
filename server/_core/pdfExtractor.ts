/**
 * Extrator de texto de PDFs para análise por IA
 * Utiliza pdfjs-dist para extrair conteúdo de PDFs
 */

import * as pdfjsLib from "pdfjs-dist";

// Configurar worker do PDF.js
if (typeof window === "undefined") {
  // Node.js environment
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface PDFTextExtraction {
  totalPages: number;
  text: string;
  pageTexts: string[];
}

/**
 * Extrai texto de um PDF a partir de uma URL
 * Retorna o texto completo e texto por página
 */
export async function extractTextFromPDF(pdfUrl: string): Promise<PDFTextExtraction> {
  try {
    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    const totalPages = pdf.numPages;
    const pageTexts: string[] = [];
    let fullText = "";

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      
      pageTexts.push(pageText);
      fullText += `\n--- Página ${pageNum} ---\n${pageText}`;
    }

    return {
      totalPages,
      text: fullText,
      pageTexts,
    };
  } catch (error) {
    console.error("[PDFExtractor] Erro ao extrair texto:", error);
    throw new Error(`Falha ao extrair texto do PDF: ${error instanceof Error ? error.message : "erro desconhecido"}`);
  }
}

/**
 * Divide um PDF em chunks de páginas
 * Cada chunk contém um intervalo de páginas
 */
export function createPageChunks(
  totalPages: number,
  pageTexts: string[],
  pagesPerChunk: number = 50
): Array<{ pageStart: number; pageEnd: number; text: string }> {
  const chunks = [];
  
  for (let i = 0; i < totalPages; i += pagesPerChunk) {
    const pageStart = i + 1;
    const pageEnd = Math.min(i + pagesPerChunk, totalPages);
    const chunkText = pageTexts
      .slice(i, i + pagesPerChunk)
      .map((text, idx) => `--- Página ${pageStart + idx} ---\n${text}`)
      .join("\n\n");

    chunks.push({
      pageStart,
      pageEnd,
      text: chunkText,
    });
  }

  return chunks;
}

/**
 * Gera um prompt para análise de um chunk específico
 */
export function generateChunkPrompt(
  chunk: { pageStart: number; pageEnd: number; text: string },
  chunkNumber: number,
  totalChunks: number,
  isFirstChunk: boolean,
  isLastChunk: boolean
): string {
  let prompt = `CHUNK ${chunkNumber}/${totalChunks} (Páginas ${chunk.pageStart}-${chunk.pageEnd})\n\n`;

  if (isFirstChunk) {
    prompt += `IMPORTANTE: Este é o PRIMEIRO chunk do documento. Extraia TODAS as informações iniciais encontradas:\n`;
    prompt += `- Número do processo\n`;
    prompt += `- Partes (autor, réu, advogados)\n`;
    prompt += `- Tribunal e vara\n`;
    prompt += `- Data de distribuição\n`;
    prompt += `- Tipo e valor da causa\n`;
    prompt += `- Primeiras movimentações\n\n`;
  } else if (isLastChunk) {
    prompt += `IMPORTANTE: Este é o ÚLTIMO chunk do documento. Certifique-se de incluir:\n`;
    prompt += `- Todas as movimentações finais\n`;
    prompt += `- Status processual atual\n`;
    prompt += `- Prazos pendentes\n`;
    prompt += `- Últimas decisões ou sentenças\n\n`;
  } else {
    prompt += `Este é um chunk intermediário. Extraia TODAS as movimentações, eventos e informações relevantes deste intervalo.\n\n`;
  }

  prompt += `Conteúdo do PDF:\n\n${chunk.text}\n\n`;
  prompt += `Retorne um JSON com a mesma estrutura solicitada, focando APENAS nas informações presentes neste chunk.`;

  return prompt;
}
