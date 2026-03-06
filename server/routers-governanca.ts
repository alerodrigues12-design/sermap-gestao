import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getGovernancaDocumentos,
  insertGovernancaDocumento,
  updateGovernancaDocumento,
  deleteGovernancaDocumento,
  getGovernancaReunioes,
  getGovernancaReuniao,
  insertGovernancaReuniao,
  updateGovernancaReuniao,
  deleteGovernancaReuniao,
  getGovernancaParticipantes,
  insertGovernancaParticipante,
  updateGovernancaParticipante,
  deleteGovernancaParticipante,
  getGovernancaAtas,
  insertGovernancaAta,
  updateGovernancaAta,
  deleteGovernancaAta,
  getGovernancaGravacoes,
  insertGovernancaGravacao,
  updateGovernancaGravacao,
  deleteGovernancaGravacao,
  getGovernancaAssinaturas,
  insertGovernancaAssinatura,
  updateGovernancaAssinatura,
  deleteGovernancaAssinatura,
} from "./db";
import { TRPCError } from "@trpc/server";

// ============================================================
// AUTENTIQUE INTEGRATION
// ============================================================
const AUTENTIQUE_API_URL = "https://api.autentique.com.br/v2/graphql";

async function getAutentiqueToken(): Promise<string> {
  const token = process.env.AUTENTIQUE_API_KEY;
  if (!token) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Chave da API do Autentique não configurada. Adicione AUTENTIQUE_API_KEY nas configurações do projeto.",
    });
  }
  return token;
}

async function enviarDocumentoAutentique(params: {
  nomeDocumento: string;
  signatarios: Array<{ nome?: string; email: string; acao?: string }>;
  pdfUrl: string;
  mensagem?: string;
}): Promise<{ documentoId: string; links: Array<{ email: string; link: string }> }> {
  const token = await getAutentiqueToken();

  // Baixar o PDF da URL
  const pdfResponse = await fetch(params.pdfUrl);
  if (!pdfResponse.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Não foi possível baixar o PDF para envio ao Autentique.",
    });
  }
  const pdfBuffer = await pdfResponse.arrayBuffer();

  const mutation = `
    mutation CreateDocumentMutation(
      $document: DocumentInput!,
      $signers: [SignerInput!]!,
      $file: Upload!
    ) {
      createDocument(
        document: $document,
        signers: $signers,
        file: $file
      ) {
        id
        name
        created_at
        signatures {
          public_id
          name
          email
          action { name }
          link { short_link }
        }
      }
    }
  `;

  const variables = {
    document: {
      name: params.nomeDocumento,
      message: params.mensagem || "Por favor, assine o documento enviado pela SERMAP Engenharia / Alessandra Hoffmann Consultoria.",
      reminder: "WEEKLY",
      refusable: true,
      new_signature_style: true,
    },
    signers: params.signatarios.map((s) => ({
      email: s.email,
      name: s.nome,
      action: s.acao || "SIGN",
    })),
  };

  // Montar multipart/form-data manualmente
  const boundary = `----FormBoundary${Date.now()}`;
  const encoder = new TextEncoder();

  const operationsPart = `--${boundary}\r\nContent-Disposition: form-data; name="operations"\r\n\r\n${JSON.stringify({ query: mutation, variables })}\r\n`;
  const mapPart = `--${boundary}\r\nContent-Disposition: form-data; name="map"\r\n\r\n${JSON.stringify({ "0": ["variables.file"] })}\r\n`;
  const filePart = `--${boundary}\r\nContent-Disposition: form-data; name="0"; filename="${params.nomeDocumento}.pdf"\r\nContent-Type: application/pdf\r\n\r\n`;
  const endPart = `\r\n--${boundary}--\r\n`;

  const operationsBytes = encoder.encode(operationsPart);
  const mapBytes = encoder.encode(mapPart);
  const fileHeaderBytes = encoder.encode(filePart);
  const fileBytes = new Uint8Array(pdfBuffer);
  const endBytes = encoder.encode(endPart);

  const totalLength = operationsBytes.length + mapBytes.length + fileHeaderBytes.length + fileBytes.length + endBytes.length;
  const body = new Uint8Array(totalLength);
  let offset = 0;
  body.set(operationsBytes, offset); offset += operationsBytes.length;
  body.set(mapBytes, offset); offset += mapBytes.length;
  body.set(fileHeaderBytes, offset); offset += fileHeaderBytes.length;
  body.set(fileBytes, offset); offset += fileBytes.length;
  body.set(endBytes, offset);

  const response = await fetch(AUTENTIQUE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    body: body,
  });

  const json = (await response.json()) as any;
  if (json.errors) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Erro Autentique: ${json.errors[0]?.message || "Erro desconhecido"}`,
    });
  }

  const doc = json.data?.createDocument;
  const links = (doc?.signatures || []).map((s: any) => ({
    email: s.email || "",
    link: s.link?.short_link || "",
  }));

  return { documentoId: doc?.id || "", links };
}

// ============================================================
// GOVERNANÇA ROUTER
// ============================================================
export const governancaRouter = router({
  // === DOCUMENTOS ===
  documentos: router({
    list: protectedProcedure.query(async () => {
      return getGovernancaDocumentos();
    }),

    create: adminProcedure
      .input(
        z.object({
          titulo: z.string().min(1),
          descricao: z.string().optional(),
          tipo: z.enum(["politica", "procedimento", "norma", "resolucao", "estatuto", "regimento", "outro"]),
          versao: z.number().default(1),
          status: z.enum(["rascunho", "em_aprovacao", "aprovado", "arquivado"]).default("rascunho"),
          documentoUrl: z.string().optional(),
          documentoKey: z.string().optional(),
          dataCriacao: z.string(),
          dataAprovacao: z.string().optional(),
          responsavel: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await insertGovernancaDocumento({
          titulo: input.titulo,
          descricao: input.descricao,
          tipo: input.tipo,
          versao: input.versao,
          status: input.status,
          documentoUrl: input.documentoUrl,
          documentoKey: input.documentoKey,
          dataCriacao: input.dataCriacao,
          dataAprovacao: input.dataAprovacao,
          responsavel: input.responsavel,
        });
        return { success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          titulo: z.string().optional(),
          descricao: z.string().optional(),
          tipo: z.enum(["politica", "procedimento", "norma", "resolucao", "estatuto", "regimento", "outro"]).optional(),
          versao: z.number().optional(),
          status: z.enum(["rascunho", "em_aprovacao", "aprovado", "arquivado"]).optional(),
          documentoUrl: z.string().optional(),
          documentoKey: z.string().optional(),
          dataAprovacao: z.string().optional(),
          responsavel: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateGovernancaDocumento(id, updates);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteGovernancaDocumento(input.id);
        return { success: true };
      }),

    // Enviar documento para assinatura via Autentique
    enviarParaAssinatura: adminProcedure
      .input(
        z.object({
          documentoId: z.number(),
          signatarios: z.array(
            z.object({
              nome: z.string().optional(),
              email: z.string().email(),
              acao: z.enum(["SIGN", "APPROVE", "SIGN_AS_A_WITNESS"]).default("SIGN"),
            })
          ),
          mensagem: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const documentos = await getGovernancaDocumentos();
        const doc = documentos.find((d) => d.id === input.documentoId);
        if (!doc) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Documento não encontrado." });
        }
        if (!doc.documentoUrl) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Documento sem arquivo PDF. Faça upload primeiro." });
        }

        const resultado = await enviarDocumentoAutentique({
          nomeDocumento: doc.titulo,
          signatarios: input.signatarios,
          pdfUrl: doc.documentoUrl,
          mensagem: input.mensagem,
        });

        // Registrar assinaturas no banco
        for (const sig of input.signatarios) {
          const linkInfo = resultado.links.find((l) => l.email === sig.email);
          await insertGovernancaAssinatura({
            documentoId: input.documentoId,
            signatario: sig.nome || sig.email,
            email: sig.email,
            status: "pendente",
            linkAutentique: linkInfo?.link || null,
          });
        }

        // Atualizar status do documento para em_aprovacao
        await updateGovernancaDocumento(input.documentoId, { status: "em_aprovacao" });

        return {
          success: true,
          documentoAutentiqueId: resultado.documentoId,
          links: resultado.links,
        };
      }),
  }),

  // === REUNIÕES ===
  reunioes: router({
    list: protectedProcedure.query(async () => {
      return getGovernancaReunioes();
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getGovernancaReuniao(input.id);
      }),

    create: adminProcedure
      .input(
        z.object({
          titulo: z.string().min(1),
          descricao: z.string().optional(),
          dataReuniao: z.string(),
          horaReuniao: z.string(),
          local: z.string().optional(),
          linkGoogleMeet: z.string().optional(),
          status: z.enum(["agendada", "em_andamento", "concluida", "cancelada"]).default("agendada"),
          responsavel: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        await insertGovernancaReuniao({
          titulo: input.titulo,
          descricao: input.descricao,
          dataReuniao: input.dataReuniao,
          horaReuniao: input.horaReuniao,
          local: input.local,
          linkGoogleMeet: input.linkGoogleMeet,
          status: input.status,
          responsavel: input.responsavel,
        });
        return { success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          titulo: z.string().optional(),
          descricao: z.string().optional(),
          dataReuniao: z.string().optional(),
          horaReuniao: z.string().optional(),
          local: z.string().optional(),
          linkGoogleMeet: z.string().optional(),
          status: z.enum(["agendada", "em_andamento", "concluida", "cancelada"]).optional(),
          responsavel: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateGovernancaReuniao(id, updates);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteGovernancaReuniao(input.id);
        return { success: true };
      }),
  }),

  // === PARTICIPANTES ===
  participantes: router({
    list: protectedProcedure
      .input(z.object({ reuniaoId: z.number() }))
      .query(async ({ input }) => {
        return getGovernancaParticipantes(input.reuniaoId);
      }),

    create: adminProcedure
      .input(
        z.object({
          reuniaoId: z.number(),
          nome: z.string().min(1),
          email: z.string().email(),
          cargo: z.string().optional(),
          confirmacao: z.enum(["pendente", "confirmado", "recusado"]).default("pendente"),
        })
      )
      .mutation(async ({ input }) => {
        await insertGovernancaParticipante({
          reuniaoId: input.reuniaoId,
          nome: input.nome,
          email: input.email,
          cargo: input.cargo,
          confirmacao: input.confirmacao,
        });
        return { success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          nome: z.string().optional(),
          email: z.string().email().optional(),
          cargo: z.string().optional(),
          confirmacao: z.enum(["pendente", "confirmado", "recusado"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateGovernancaParticipante(id, updates);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteGovernancaParticipante(input.id);
        return { success: true };
      }),
  }),

  // === ATAS ===
  atas: router({
    list: protectedProcedure
      .input(z.object({ reuniaoId: z.number() }))
      .query(async ({ input }) => {
        return getGovernancaAtas(input.reuniaoId);
      }),

    create: adminProcedure
      .input(
        z.object({
          reuniaoId: z.number(),
          titulo: z.string().min(1),
          conteudo: z.string().optional(),
          ataUrl: z.string().optional(),
          ataKey: z.string().optional(),
          dataAta: z.string(),
          responsavel: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        await insertGovernancaAta({
          reuniaoId: input.reuniaoId,
          titulo: input.titulo,
          conteudo: input.conteudo,
          ataUrl: input.ataUrl,
          ataKey: input.ataKey,
          dataAta: input.dataAta,
          responsavel: input.responsavel,
        });
        return { success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          titulo: z.string().optional(),
          conteudo: z.string().optional(),
          ataUrl: z.string().optional(),
          ataKey: z.string().optional(),
          dataAta: z.string().optional(),
          responsavel: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateGovernancaAta(id, updates);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteGovernancaAta(input.id);
        return { success: true };
      }),

    // Enviar ata para assinatura via Autentique
    enviarParaAssinatura: adminProcedure
      .input(
        z.object({
          ataUrl: z.string().url(),
          tituloAta: z.string(),
          signatarios: z.array(
            z.object({
              nome: z.string().optional(),
              email: z.string().email(),
              acao: z.enum(["SIGN", "APPROVE", "SIGN_AS_A_WITNESS"]).default("SIGN"),
            })
          ),
          mensagem: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const resultado = await enviarDocumentoAutentique({
          nomeDocumento: input.tituloAta,
          signatarios: input.signatarios,
          pdfUrl: input.ataUrl,
          mensagem: input.mensagem || `Por favor, assine a ata: ${input.tituloAta}`,
        });
        return {
          success: true,
          documentoAutentiqueId: resultado.documentoId,
          links: resultado.links,
        };
      }),
  }),

  // === GRAVAÇÕES ===
  gravacoes: router({
    list: protectedProcedure
      .input(z.object({ reuniaoId: z.number() }))
      .query(async ({ input }) => {
        return getGovernancaGravacoes(input.reuniaoId);
      }),

    create: adminProcedure
      .input(
        z.object({
          reuniaoId: z.number(),
          titulo: z.string().min(1),
          linkGravacao: z.string().url(),
          duracao: z.string().optional(),
          dataGravacao: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        await insertGovernancaGravacao({
          reuniaoId: input.reuniaoId,
          titulo: input.titulo,
          linkGravacao: input.linkGravacao,
          duracao: input.duracao,
          dataGravacao: input.dataGravacao,
        });
        return { success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          titulo: z.string().optional(),
          linkGravacao: z.string().url().optional(),
          duracao: z.string().optional(),
          dataGravacao: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateGovernancaGravacao(id, updates);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteGovernancaGravacao(input.id);
        return { success: true };
      }),
  }),

  // === ASSINATURAS ===
  assinaturas: router({
    list: protectedProcedure
      .input(z.object({ documentoId: z.number() }))
      .query(async ({ input }) => {
        return getGovernancaAssinaturas(input.documentoId);
      }),

    create: adminProcedure
      .input(
        z.object({
          documentoId: z.number(),
          signatario: z.string().min(1),
          email: z.string().email(),
          status: z.enum(["pendente", "assinado", "recusado"]).default("pendente"),
          dataAssinatura: z.string().optional(),
          linkAutentique: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await insertGovernancaAssinatura({
          documentoId: input.documentoId,
          signatario: input.signatario,
          email: input.email,
          status: input.status,
          dataAssinatura: input.dataAssinatura,
          linkAutentique: input.linkAutentique,
        });
        return { success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pendente", "assinado", "recusado"]).optional(),
          dataAssinatura: z.string().optional(),
          linkAutentique: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateGovernancaAssinatura(id, updates);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteGovernancaAssinatura(input.id);
        return { success: true };
      }),
  }),

  // === ENVIO NDA PARA AUTENTIQUE ===
  enviarNdaAutentique: adminProcedure
    .input(
      z.object({
        nomeDocumento: z.string(),
        pdfUrl: z.string().url(),
        signatarios: z.array(
          z.object({
            nome: z.string(),
            email: z.string().email(),
            acao: z.enum(["SIGN", "APPROVE", "SIGN_AS_A_WITNESS"]).default("SIGN"),
          })
        ),
        mensagem: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const resultado = await enviarDocumentoAutentique({
        nomeDocumento: input.nomeDocumento,
        signatarios: input.signatarios,
        pdfUrl: input.pdfUrl,
        mensagem: input.mensagem || "Por favor, assine o Acordo de Confidencialidade (NDA) enviado pela SERMAP Engenharia.",
      });
      return {
        success: true,
        documentoId: resultado.documentoId,
        links: resultado.links,
      };
    }),
});
