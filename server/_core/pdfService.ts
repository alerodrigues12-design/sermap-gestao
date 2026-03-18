/**
 * Serviço para geração de PDF a partir de HTML
 */

import { convert } from "html-pdf-node";
import { ENV } from "./env";

interface PdfOptions {
  format?: "A4" | "Letter";
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  landscape?: boolean;
}

/**
 * Converte HTML para PDF
 */
export async function htmlParaPdf(
  htmlContent: string,
  opcoes?: PdfOptions
): Promise<{
  sucesso: boolean;
  pdf?: Buffer;
  erro?: string;
}> {
  try {
    console.log("[PdfService] Iniciando conversão HTML para PDF...");

    const options = {
      format: opcoes?.format || "A4",
      margin: {
        top: opcoes?.margin?.top || "10mm",
        right: opcoes?.margin?.right || "10mm",
        bottom: opcoes?.margin?.bottom || "10mm",
        left: opcoes?.margin?.left || "10mm",
      },
      printBackground: opcoes?.printBackground !== false,
      landscape: opcoes?.landscape || false,
    };

    // Usar html-pdf-node para conversão
    const file = { content: htmlContent };
    const pdfBuffer = await convert(options, file);

    console.log("[PdfService] PDF gerado com sucesso");

    return {
      sucesso: true,
      pdf: pdfBuffer,
    };
  } catch (error) {
    const mensagemErro = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[PdfService] Erro ao gerar PDF:", error);
    return {
      sucesso: false,
      erro: mensagemErro,
    };
  }
}

/**
 * Converte HTML para PDF com logo e cabeçalho customizado
 */
export async function htmlParaPdfComCabecalho(
  htmlContent: string,
  logoUrl?: string,
  titulo?: string,
  opcoes?: PdfOptions
): Promise<{
  sucesso: boolean;
  pdf?: Buffer;
  erro?: string;
}> {
  try {
    // Adicionar cabeçalho e rodapé ao HTML
    const htmlComCabecalho = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page {
            margin: 2cm;
            @bottom-center {
              content: "Página " counter(page) " de " counter(pages);
              font-size: 10px;
              color: #999;
            }
          }
          body {
            font-family: Arial, sans-serif;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 10px;
          }
          .header-logo {
            max-width: 150px;
            max-height: 60px;
          }
          .header-title {
            text-align: center;
            flex: 1;
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${logoUrl ? `<img src="${logoUrl}" class="header-logo" alt="Logo">` : ""}
          <div class="header-title">${titulo || "Documento"}</div>
        </div>
        ${htmlContent}
      </body>
      </html>
    `;

    return htmlParaPdf(htmlComCabecalho, opcoes);
  } catch (error) {
    const mensagemErro = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[PdfService] Erro ao gerar PDF com cabeçalho:", error);
    return {
      sucesso: false,
      erro: mensagemErro,
    };
  }
}
