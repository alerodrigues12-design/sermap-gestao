/**
 * Serviço para integração com Autentique
 * Permite enviar documentos para assinatura digital
 */

import axios from "axios";
import { ENV } from "./env";

const AUTENTIQUE_API_URL = "https://api.autentique.com.br/v2";
const AUTENTIQUE_API_KEY = ENV.AUTENTIQUE_API_KEY;

interface AutontiqueSignerConfig {
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  birthdate?: string;
}

interface AutontiqueDocumentConfig {
  title: string;
  signers: AutontiqueSignerConfig[];
  file: Buffer; // Conteúdo do PDF em bytes
  redirectUrl?: string;
}

interface AutontiqueResponse {
  status: "success" | "error";
  documentId?: string;
  signingUrl?: string;
  message?: string;
}

/**
 * Envia um documento para assinatura via Autentique
 */
export async function enviarDocumentoParaAssinatura(
  config: AutontiqueDocumentConfig
): Promise<AutontiqueResponse> {
  try {
    if (!AUTENTIQUE_API_KEY) {
      throw new Error("Chave de API do Autentique não configurada");
    }

    // Converter Buffer para base64
    const fileBase64 = config.file.toString("base64");

    // Preparar dados para envio
    const formData = new FormData();
    formData.append("title", config.title);
    formData.append("signers", JSON.stringify(config.signers));
    formData.append("file", new Blob([config.file]), "documento.pdf");
    
    if (config.redirectUrl) {
      formData.append("redirect_url", config.redirectUrl);
    }

    // Enviar para Autentique
    const response = await axios.post(
      `${AUTENTIQUE_API_URL}/documents`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${AUTENTIQUE_API_KEY}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.status === "success") {
      return {
        status: "success",
        documentId: response.data.document_id,
        signingUrl: response.data.signing_url,
        message: "Documento enviado para assinatura com sucesso",
      };
    } else {
      throw new Error(response.data.message || "Erro ao enviar documento");
    }
  } catch (error) {
    console.error("[AutontiqueService] Erro ao enviar documento:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Verifica o status de um documento em assinatura
 */
export async function verificarStatusDocumento(
  documentId: string
): Promise<{
  status: string;
  signers: Array<{
    name: string;
    email: string;
    status: "pending" | "signed" | "declined";
    signedAt?: string;
  }>;
}> {
  try {
    if (!AUTENTIQUE_API_KEY) {
      throw new Error("Chave de API do Autentique não configurada");
    }

    const response = await axios.get(
      `${AUTENTIQUE_API_URL}/documents/${documentId}`,
      {
        headers: {
          Authorization: `Bearer ${AUTENTIQUE_API_KEY}`,
        },
      }
    );

    return {
      status: response.data.status,
      signers: response.data.signers || [],
    };
  } catch (error) {
    console.error("[AutontiqueService] Erro ao verificar status:", error);
    throw error;
  }
}

/**
 * Baixa o documento assinado
 */
export async function baixarDocumentoAssinado(
  documentId: string
): Promise<Buffer> {
  try {
    if (!AUTENTIQUE_API_KEY) {
      throw new Error("Chave de API do Autentique não configurada");
    }

    const response = await axios.get(
      `${AUTENTIQUE_API_URL}/documents/${documentId}/download`,
      {
        headers: {
          Authorization: `Bearer ${AUTENTIQUE_API_KEY}`,
        },
        responseType: "arraybuffer",
      }
    );

    return Buffer.from(response.data);
  } catch (error) {
    console.error("[AutontiqueService] Erro ao baixar documento:", error);
    throw error;
  }
}

/**
 * Cancela um documento em assinatura
 */
export async function cancelarDocumento(documentId: string): Promise<boolean> {
  try {
    if (!AUTENTIQUE_API_KEY) {
      throw new Error("Chave de API do Autentique não configurada");
    }

    await axios.delete(
      `${AUTENTIQUE_API_URL}/documents/${documentId}`,
      {
        headers: {
          Authorization: `Bearer ${AUTENTIQUE_API_KEY}`,
        },
      }
    );

    return true;
  } catch (error) {
    console.error("[AutontiqueService] Erro ao cancelar documento:", error);
    return false;
  }
}
