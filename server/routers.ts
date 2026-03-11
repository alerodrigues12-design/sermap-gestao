import { COOKIE_NAME } from "@shared/const"; // Already imported at top
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { emailsRouter } from "./routers-emails";
import { governancaRouter } from "./routers-governanca";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getAllProcessos,
  getProcessoById,
  getProcessosComPerdaPrazo,
  getProcessosSummary,
  getMovimentacoesByProcesso,
  getMovimentacoesRecentes,
  getMovimentacoesNaoLidas,
  marcarMovimentacaoLida,
  marcarTodasMovimentacoesLidas,
  getPassivoTributario,
  getSimulacoes,
  getDocumentos,
  insertDocumento,
  deleteDocumento,
  getNotificacoes,
  getNotificacoesNaoLidas,
  marcarNotificacaoLida,
  marcarTodasNotificacoesLidas,
  getTimeline,
  getDb,
  insertMovimentacao,
  getSystemConfig,
  getRecados,
  getRecadosAbertos,
  insertRecado,
  updateRecadoStatus,
  deleteRecado,
  getEmails,
  getEmailsFiltered,
  getEmailById,
  insertEmail,
  updateEmail,
  deleteEmail,
  getPlanoAcao,
  getPlanoAcaoById,
  insertPlanoAcao,
  updatePlanoAcao,
  deletePlanoAcao,
} from "./db";
import { createHash } from "crypto";
import { processos, movimentacoes, notificacoes, emails, planoAcao, accessLog, processosPF, processoAnexos } from "../drizzle/schema";
import { invokeLLM } from "./_core/llm";
import type { InsertEmail } from "../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { executarMonitoramento } from "./datajudMonitor";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new Error("Acesso restrito. Apenas administradores podem acessar esta funcionalidade.");
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Dashboard summary
  dashboard: router({
    summary: protectedProcedure.query(async () => {
      return getProcessosSummary();
    }),
    movimentacoesRecentes: protectedProcedure.query(async () => {
      return getMovimentacoesRecentes(10);
    }),
    notificacoesCount: protectedProcedure.query(async () => {
      const movNaoLidas = await getMovimentacoesNaoLidas();
      const notNaoLidas = await getNotificacoesNaoLidas();
      return { movimentacoes: movNaoLidas, notificacoes: notNaoLidas, total: movNaoLidas + notNaoLidas };
    }),
  }),

  // Processos
  processos: router({
    list: protectedProcedure
      .input(z.object({ tipo: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getAllProcessos(input?.tipo);
      }),
    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getProcessoById(input.id);
      }),
    perdaPrazo: protectedProcedure.query(async () => {
      return getProcessosComPerdaPrazo();
    }),
    movimentacoes: protectedProcedure
      .input(z.object({ processoId: z.number() }))
      .query(async ({ input }) => {
        return getMovimentacoesByProcesso(input.processoId);
      }),
  }),

  // Passivo Tributário
  tributario: router({
    passivo: protectedProcedure.query(async () => {
      return getPassivoTributario();
    }),
    simulacoes: protectedProcedure.query(async () => {
      return getSimulacoes();
    }),
  }),

  // Documentos (admin-only for confidenciais)
  documentos: router({
    verifyPassword: protectedProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ input }) => {
        const storedHash = await getSystemConfig("senha_documentos");
        if (!storedHash) {
          throw new Error("Senha de documentos não configurada.");
        }
        const hashedInput = createHash("sha256").update(input.password).digest("hex");
        if (storedHash !== hashedInput) {
          throw new Error("Senha incorreta.");
        }
        return { success: true };
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") {
        return getDocumentos();
      }
      return getDocumentos(false);
    }),
    upload: adminProcedure
      .input(z.object({
        titulo: z.string(),
        descricao: z.string().optional(),
        categoria: z.enum(["contrato", "honorarios", "procuracao", "outros"]),
        confidencial: z.boolean().default(true),
        fileBase64: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.fileBase64, "base64");
        const fileKey = `documentos/${nanoid()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        await insertDocumento({
          titulo: input.titulo,
          descricao: input.descricao || null,
          categoria: input.categoria,
          confidencial: input.confidencial,
          fileUrl: url,
          fileKey: fileKey,
        });
        return { success: true, url };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteDocumento(input.id);
        return { success: true };
      }),
  }),

  // Notificações
  notificacoes: router({
    list: protectedProcedure.query(async () => {
      return getNotificacoes();
    }),
    naoLidas: protectedProcedure.query(async () => {
      return getNotificacoesNaoLidas();
    }),
    marcarLida: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await marcarNotificacaoLida(input.id);
        return { success: true };
      }),
    marcarTodasLidas: protectedProcedure.mutation(async () => {
      await marcarTodasNotificacoesLidas();
      return { success: true };
    }),
  }),

  // Movimentações
  movimentacoes: router({
    recentes: protectedProcedure.query(async () => {
      return getMovimentacoesRecentes(20);
    }),
    naoLidas: protectedProcedure.query(async () => {
      return getMovimentacoesNaoLidas();
    }),
    marcarLida: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await marcarMovimentacaoLida(input.id);
        return { success: true };
      }),
    marcarTodasLidas: protectedProcedure.mutation(async () => {
      await marcarTodasMovimentacoesLidas();
      return { success: true };
    }),
  }),

  // Recados / Pendências
  recados: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getRecados(input?.status);
      }),
    abertos: protectedProcedure.query(async () => {
      return getRecadosAbertos();
    }),
    create: adminProcedure
      .input(z.object({
        tipo: z.enum(["pendencia", "recado", "solicitacao", "atualizacao"]),
        prioridade: z.enum(["alta", "media", "baixa"]),
        titulo: z.string().min(1),
        mensagem: z.string().min(1),
        processoRelacionado: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await insertRecado({
          autorId: ctx.user.id,
          autorNome: ctx.user.name || "Administrador",
          tipo: input.tipo,
          prioridade: input.prioridade,
          titulo: input.titulo,
          mensagem: input.mensagem,
          processoRelacionado: input.processoRelacionado || null,
        });
        return { success: true };
      }),
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["aberto", "em_andamento", "concluido"]),
      }))
      .mutation(async ({ input }) => {
        await updateRecadoStatus(input.id, input.status);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteRecado(input.id);
        return { success: true };
      }),
  }),

  // E-mails Importantes
  emails: emailsRouter,

  // Timeline
  timeline: router({
    list: protectedProcedure.query(async () => {
      return getTimeline();
    }),
  }),

  // DataJud Monitor
  datajud: router({
    status: protectedProcedure.query(async () => {
      const ultimaConsulta = await getSystemConfig("ultima_consulta_datajud");
      return {
        apiKeyConfigurada: true, // Chave pública do DataJud está embutida no sistema
        ultimaConsulta: ultimaConsulta || null,
      };
    }),
     executarAgora: adminProcedure.mutation(async () => {
      const resultado = await executarMonitoramento();
      return resultado;
    }),
  }),
  // Plano de Ação
  planoAcao: router({
    list: protectedProcedure.query(async () => {
      return getPlanoAcao();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getPlanoAcaoById(input.id);
      }),
    create: adminProcedure
      .input(z.object({
        numero: z.number(),
        titulo: z.string(),
        descricao: z.string().optional(),
        status: z.enum(["nao_iniciado", "em_andamento", "concluido", "bloqueado"]).default("nao_iniciado"),
        dataPrevista: z.string().optional(),
        dataFinalizada: z.string().optional(),
        responsavel: z.string().optional(),
        percentualConclusao: z.number().default(0),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await insertPlanoAcao(input);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        titulo: z.string().optional(),
        descricao: z.string().optional(),
        status: z.enum(["nao_iniciado", "em_andamento", "concluido", "bloqueado"]).optional(),
        dataPrevista: z.string().optional(),
        dataFinalizada: z.string().optional(),
        responsavel: z.string().optional(),
        percentualConclusao: z.number().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updatePlanoAcao(id, updates);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deletePlanoAcao(input.id);
        return { success: true };
      }),
  }),
  // Governança Corporativa
  governanca: governancaRouter,

  // Log de Acessos ao Plano Estratégico
  accessLog: router({
    registrar: publicProcedure
      .input(z.object({
        perfil: z.string(),
        nivelAcesso: z.string(),
        userAgent: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return { ok: false };
        const ip = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
          || (ctx.req.socket as any)?.remoteAddress
          || "desconhecido";
        await db.insert(accessLog).values({
          perfil: input.perfil,
          nivelAcesso: input.nivelAcesso,
          ip,
          userAgent: input.userAgent || null,
          pagina: "plano-estrategico",
        });
        return { ok: true };
      }),

    listar: publicProcedure
      .input(z.object({
        senha: z.string(),
      }))
      .query(async ({ input }) => {
        // Apenas quem tem a senha de documentos pode ver os logs
        const SENHA_HASH = createHash("sha256").update("docs2026@").digest("hex");
        const inputHash = createHash("sha256").update(input.senha).digest("hex");
        if (inputHash !== SENHA_HASH) {
          throw new Error("Senha incorreta.");
        }
        const db = await getDb();
        if (!db) return [];
        const logs = await db
          .select()
          .from(accessLog)
          .orderBy(desc(accessLog.createdAt))
          .limit(200);
        return logs;
      }),
  }),

  // Upload e análise jurídica IA de processos
  processoAnexos: router({
    // Listar anexos de um processo
    listar: publicProcedure
      .input(z.object({ processoId: z.number(), tipoProcesso: z.enum(["trabalhista", "civel", "pf"]) }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(processoAnexos)
          .where(eq(processoAnexos.processoId, input.processoId))
          .orderBy(desc(processoAnexos.createdAt));
      }),

    // Upload de PDF para S3 e registro no banco
    upload: publicProcedure
      .input(z.object({
        processoId: z.number(),
        tipoProcesso: z.enum(["trabalhista", "civel", "pf"]),
        nomeArquivo: z.string(),
        fileBase64: z.string(),
        tamanho: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB indisponível");
        const fileBuffer = Buffer.from(input.fileBase64, "base64");
        const suffix = nanoid(8);
        const fileKey = `processos/${input.tipoProcesso}/${input.processoId}/${suffix}-${input.nomeArquivo}`;
        const { url } = await storagePut(fileKey, fileBuffer, "application/pdf");
        const [result] = await db.insert(processoAnexos).values({
          processoId: input.processoId,
          tipoProcesso: input.tipoProcesso,
          nomeArquivo: input.nomeArquivo,
          fileKey,
          fileUrl: url,
          tamanho: input.tamanho ?? fileBuffer.length,
          analiseStatus: "pendente",
        });
        const insertId = (result as any).insertId;
        return { ok: true, id: insertId, url };
      }),

    // Análise jurídica com IA
    analisar: publicProcedure
      .input(z.object({ anexoId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB indisponível");
        // Buscar o anexo
        const [anexo] = await db.select().from(processoAnexos).where(eq(processoAnexos.id, input.anexoId));
        if (!anexo) throw new Error("Anexo não encontrado");
        // Marcar como processando
        await db.update(processoAnexos).set({ analiseStatus: "processando" }).where(eq(processoAnexos.id, input.anexoId));
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `Você é um especialista jurídico brasileiro com foco em direito tributário, trabalhista e cível. Analise o processo judicial anexado e forneça uma análise jurídica completa e estratégica em formato JSON. Seja detalhado e técnico. Identifique TODAS as possibilidades de defesa, nulidades processuais e estratégias.`,
              },
              {
                role: "user",
                content: [
                  {
                    type: "file_url",
                    file_url: { url: anexo.fileUrl, mime_type: "application/pdf" },
                  },
                  {
                    type: "text",
                    text: `Analise este processo judicial e retorne um JSON com a seguinte estrutura:\n{\n  "resumo": "resumo executivo do processo em 2-3 parágrafos",\n  "partes": { "autor": "nome", "reu": "nome", "advogados": [] },\n  "tipo": "tipo do processo",\n  "valor": "valor da causa",\n  "tribunal": "tribunal e vara",\n  "linhaDoTempo": [{ "data": "DD/MM/AAAA", "evento": "descrição do evento", "tipo": "citacao|decisao|recurso|audiencia|sentenca|outro" }],\n  "nulidades": [{ "tipo": "nome da nulidade", "descricao": "descrição detalhada", "fundamentoLegal": "artigo/lei", "probabilidadeExito": "alta|media|baixa" }],\n  "estrategiasDefesa": [{ "nome": "nome da estratégia", "descricao": "como aplicar", "fundamentoLegal": "base legal", "prioridade": "urgente|alta|media|baixa", "probabilidadeExito": "alta|media|baixa" }],\n  "riscos": [{ "descricao": "descrição do risco", "nivel": "alto|medio|baixo", "impacto": "impacto financeiro ou processual" }],\n  "recomendacoes": ["recomendação 1", "recomendação 2"],\n  "excecaoPreExecutividade": { "cabivel": true/false, "argumentos": ["argumento 1", "argumento 2"], "urgencia": "imediata|breve|pode aguardar" },\n  "avaliacaoGeral": { "risco": "alto|medio|baixo", "chancesDefesa": "alta|media|baixa", "prioridade": "urgente|alta|media|baixa" }\n}`,
                  },
                ],
              },
            ],
            response_format: { type: "json_object" },
          });
          const analise = response.choices[0].message.content as string;
          await db.update(processoAnexos)
            .set({ analiseStatus: "concluida", analiseResultado: analise })
            .where(eq(processoAnexos.id, input.anexoId));
          return { ok: true, analise: JSON.parse(analise) };
        } catch (err) {
          await db.update(processoAnexos).set({ analiseStatus: "erro" }).where(eq(processoAnexos.id, input.anexoId));
          throw err;
        }
      }),

    // Excluir anexo
    excluir: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { ok: false };
        await db.delete(processoAnexos).where(eq(processoAnexos.id, input.id));
        return { ok: true };
      }),
  }),

  processosPF: router({
    listar: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(processosPF).orderBy(processosPF.id);
    }),
    atualizar: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["ativo", "arquivado", "extinto", "a_verificar"]),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { ok: false };
        await db.update(processosPF)
          .set({ status: input.status, observacoes: input.observacoes || null })
          .where(eq(processosPF.id, input.id));
        return { ok: true };
      }),
  }),
});
export type AppRouter = typeof appRouter;
