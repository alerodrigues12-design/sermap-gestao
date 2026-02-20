import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
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
} from "./db";
import { processos, movimentacoes, notificacoes } from "../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

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

  // Timeline
  timeline: router({
    list: protectedProcedure.query(async () => {
      return getTimeline();
    }),
  }),
});

export type AppRouter = typeof appRouter;
