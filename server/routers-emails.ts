import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getEmails,
  getEmailsFiltered,
  getEmailById,
  insertEmail,
  updateEmail,
  deleteEmail,
} from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new Error("Acesso restrito. Apenas administradores podem acessar esta funcionalidade.");
  }
  return next({ ctx });
});

export const emailsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role === "admin") {
      return getEmails();
    }
    return [];
  }),
  filtered: protectedProcedure
    .input(z.object({
      remetente: z.string().optional(),
      categoria: z.enum(["proposta", "contrato", "comunicacao", "importante", "outros"]).optional(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      if (ctx.user.role === "admin") {
        return getEmailsFiltered(input);
      }
      return [];
    }),
  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role === "admin") {
        return getEmailById(input.id);
      }
      return null;
    }),
  create: adminProcedure
    .input(z.object({
      remetente: z.string().min(1),
      destinatario: z.string().min(1),
      assunto: z.string().min(1),
      conteudo: z.string().min(1),
      categoria: z.enum(["proposta", "contrato", "comunicacao", "importante", "outros"]).default("outros"),
      dataEmail: z.string().min(1),
      arquivoUrl: z.string().optional(),
      arquivoKey: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await insertEmail({
        remetente: input.remetente,
        destinatario: input.destinatario,
        assunto: input.assunto,
        conteudo: input.conteudo,
        categoria: input.categoria,
        dataEmail: input.dataEmail,
        arquivoUrl: input.arquivoUrl || null,
        arquivoKey: input.arquivoKey || null,
        confidencial: true,
      });
      return { success: true };
    }),
  uploadWithFile: adminProcedure
    .input(z.object({
      remetente: z.string().min(1),
      destinatario: z.string().min(1),
      assunto: z.string().min(1),
      conteudo: z.string().min(1),
      categoria: z.enum(["proposta", "contrato", "comunicacao", "importante", "outros"]).default("outros"),
      dataEmail: z.string().min(1),
      fileBase64: z.string(),
      fileName: z.string(),
      mimeType: z.string(),
    }))
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const fileKey = `emails/${nanoid()}-${input.fileName}`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType);
      await insertEmail({
        remetente: input.remetente,
        destinatario: input.destinatario,
        assunto: input.assunto,
        conteudo: input.conteudo,
        categoria: input.categoria,
        dataEmail: input.dataEmail,
        arquivoUrl: url,
        arquivoKey: fileKey,
        confidencial: true,
      });
      return { success: true, url };
    }),
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      remetente: z.string().optional(),
      destinatario: z.string().optional(),
      assunto: z.string().optional(),
      conteudo: z.string().optional(),
      categoria: z.enum(["proposta", "contrato", "comunicacao", "importante", "outros"]).optional(),
      dataEmail: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await updateEmail(id, updates);
      return { success: true };
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteEmail(input.id);
      return { success: true };
    }),
});
