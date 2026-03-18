import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { getDb } from "../db";
import { reunioes } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export const reunioesRouter = router({
  // Criar nova reunião
  criar: publicProcedure
    .input(
      z.object({
        titulo: z.string().min(1),
        descricao: z.string().optional(),
        dataReuniao: z.string(), // DD/MM/AAAA
        horaInicio: z.string().optional(), // HH:MM
        local: z.string().optional(),
        participantes: z.array(z.object({
          nome: z.string(),
          email: z.string().email(),
          cargo: z.string().optional(),
        })).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB indisponível");

      // Gerar ID único para a sala Jitsi
      const jitsiRoomId = `sermapgestao-${nanoid(8)}`;
      const jitsiLink = `https://meet.jitsi.org/${jitsiRoomId}`;

      const result = await db.insert(reunioes).values({
        titulo: input.titulo,
        descricao: input.descricao,
        dataReuniao: input.dataReuniao,
        horaInicio: input.horaInicio,
        local: input.local,
        jitsiRoomId,
        jitsiLink,
        status: "agendada",
        participantes: input.participantes ? JSON.stringify(input.participantes) : null,
        responsavel: "Alessandra", // TODO: pegar do contexto de usuário
      });

      return {
        id: result[0].insertId,
        jitsiLink,
        jitsiRoomId,
      };
    }),

  // Listar todas as reuniões
  listar: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const resultado = await db
      .select()
      .from(reunioes)
      .orderBy(desc(reunioes.createdAt));

    return resultado.map((r) => ({
      ...r,
      participantes: r.participantes ? JSON.parse(r.participantes) : [],
      emailsEnviados: r.emailsEnviados ? JSON.parse(r.emailsEnviados) : [],
      assinaturasAutentique: r.assinaturasAutentique ? JSON.parse(r.assinaturasAutentique) : [],
    }));
  }),

  // Obter reunião por ID
  obter: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB indisponível");

      const [reuniao] = await db
        .select()
        .from(reunioes)
        .where(eq(reunioes.id, input.id));

      if (!reuniao) throw new Error("Reunião não encontrada");

      return {
        ...reuniao,
        participantes: reuniao.participantes ? JSON.parse(reuniao.participantes) : [],
        emailsEnviados: reuniao.emailsEnviados ? JSON.parse(reuniao.emailsEnviados) : [],
        assinaturasAutentique: reuniao.assinaturasAutentique ? JSON.parse(reuniao.assinaturasAutentique) : [],
        ataGerada: reuniao.ataGerada ? JSON.parse(reuniao.ataGerada) : null,
      };
    }),

  // Atualizar status da reunião
  atualizarStatus: publicProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["agendada", "em_andamento", "concluida", "cancelada"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB indisponível");

      await db
        .update(reunioes)
        .set({ status: input.status })
        .where(eq(reunioes.id, input.id));

      return { ok: true };
    }),

  // Iniciar reunião (muda status para em_andamento)
  iniciar: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB indisponível");

      const [reuniao] = await db
        .select()
        .from(reunioes)
        .where(eq(reunioes.id, input.id));

      if (!reuniao) throw new Error("Reunião não encontrada");

      await db
        .update(reunioes)
        .set({ 
          status: "em_andamento",
          horaInicio: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        })
        .where(eq(reunioes.id, input.id));

      return { 
        ok: true,
        jitsiLink: reuniao.jitsiLink,
      };
    }),

  // Finalizar reunião e gerar ata
  finalizar: publicProcedure
    .input(
      z.object({
        id: z.number(),
        horaFim: z.string(), // HH:MM
        gravacaoUrl: z.string().optional(),
        transcricao: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB indisponível");

      const [reuniao] = await db
        .select()
        .from(reunioes)
        .where(eq(reunioes.id, input.id));

      if (!reuniao) throw new Error("Reunião não encontrada");

      // Atualizar reunião
      await db
        .update(reunioes)
        .set({
          status: "concluida",
          horaFim: input.horaFim,
          gravacaoUrl: input.gravacaoUrl,
          transcricao: input.transcricao,
        })
        .where(eq(reunioes.id, input.id));

      return { ok: true };
    }),

  // Deletar reunião
  deletar: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB indisponível");

      await db.delete(reunioes).where(eq(reunioes.id, input.id));

      return { ok: true };
    }),
});
