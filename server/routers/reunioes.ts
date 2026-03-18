import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
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

  // Gerar ata com IA
  gerarAta: publicProcedure
    .input(
      z.object({
        id: z.number(),
        transcricao: z.string(),
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

      try {
        const { gerarAtaDeTranscricao, converterAtaParaHtml } = await import("../_core/ataGenerator");
        const { htmlParaPdf } = await import("../_core/pdfService");

        // Gerar ata
        const ata = await gerarAtaDeTranscricao(
          {
            titulo: reuniao.titulo,
            dataReuniao: reuniao.dataReuniao,
            horaInicio: reuniao.horaInicio || "",
            horaFim: reuniao.horaFim || "",
            local: reuniao.local || "",
            participantes: reuniao.participantes ? JSON.parse(reuniao.participantes) : [],
          },
          input.transcricao
        );

        // Converter para HTML
        const ataHtml = converterAtaParaHtml(ata);

        // Converter para PDF
        const pdfResult = await htmlParaPdf(ataHtml);
        const ataPdf = pdfResult.pdf;

        // Salvar no banco
        await db
          .update(reunioes)
          .set({
            ataGerada: JSON.stringify(ata),
            ataHtml,
            ataUrl: "", // URL será preenchida após upload
          })
          .where(eq(reunioes.id, input.id));

        return {
          ok: true,
          ata,
          ataHtml,
          ataPdf: ataPdf ? ataPdf.toString("base64") : undefined,
        };
      } catch (error) {
        console.error("[ReunioesRouter] Erro ao gerar ata:", error);
        throw new Error(`Erro ao gerar ata: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      }
    }),

  // Enviar ata por email
  enviarAtaPorEmail: publicProcedure
    .input(
      z.object({
        id: z.number(),
        mensagem: z.string().optional(),
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
      if (!reuniao.ataHtml) throw new Error("Ata não foi gerada ainda");

      try {
        const { enviarEmailComAta } = await import("../_core/emailService");
        const { htmlParaPdf } = await import("../_core/pdfService");

        // Gerar PDF
        const pdfResult = await htmlParaPdf(reuniao.ataHtml);

        // Enviar email
        const resultado = await enviarEmailComAta({
          destinatarios: reuniao.participantes ? JSON.parse(reuniao.participantes) : [],
          titulo: reuniao.titulo,
          dataReuniao: reuniao.dataReuniao,
          ataHtml: reuniao.ataHtml,
          ataPdf: pdfResult.pdf,
          mensagem: input.mensagem,
        });

        // Atualizar lista de emails enviados
        const emailsAntigos = reuniao.emailsEnviados ? JSON.parse(reuniao.emailsEnviados) : [];
        const emailsNovos = [...emailsAntigos, ...resultado.emailsEnviados];

        await db
          .update(reunioes)
          .set({
            emailsEnviados: JSON.stringify(emailsNovos),
          })
          .where(eq(reunioes.id, input.id));

        return resultado;
      } catch (error) {
        console.error("[ReunioesRouter] Erro ao enviar email:", error);
        throw new Error(`Erro ao enviar email: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      }
    }),

  // Enviar ata para assinatura via Autentique
  enviarParaAssinatura: publicProcedure
    .input(
      z.object({
        id: z.number(),
        signatarios: z.array(
          z.object({
            nome: z.string(),
            email: z.string().email(),
            cpf: z.string().optional(),
          })
        ),
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
      if (!reuniao.ataHtml) throw new Error("Ata não foi gerada ainda");

      try {
        const { enviarDocumentoParaAssinatura } = await import("../_core/autentiqueService");
        const { htmlParaPdf } = await import("../_core/pdfService");

        // Gerar PDF
        const pdfResult = await htmlParaPdf(reuniao.ataHtml);
        if (!pdfResult.pdf) throw new Error("Erro ao gerar PDF");

        // Enviar para Autentique
        const resultado = await enviarDocumentoParaAssinatura({
          title: `Ata de Reunião - ${reuniao.titulo}`,
          signers: input.signatarios,
          file: pdfResult.pdf,
          redirectUrl: `${process.env.VITE_APP_URL || "https://www.sermapgestao.digital"}/reunioes/${input.id}`,
        });

        if (resultado.status === "success") {
          // Salvar ID do documento Autentique
          const assinaturasAnteriores = reuniao.assinaturasAutentique
            ? JSON.parse(reuniao.assinaturasAutentique)
            : [];

          await db
            .update(reunioes)
            .set({
              assinaturasAutentique: JSON.stringify([
                ...assinaturasAnteriores,
                {
                  documentId: resultado.documentId,
                  signingUrl: resultado.signingUrl,
                  criadoEm: new Date().toISOString(),
                },
              ]),
            })
            .where(eq(reunioes.id, input.id));
        }

        return resultado;
      } catch (error) {
        console.error("[ReunioesRouter] Erro ao enviar para assinatura:", error);
        throw new Error(
          `Erro ao enviar para assinatura: ${error instanceof Error ? error.message : "Erro desconhecido"}`
        );
      }
    }),
});
