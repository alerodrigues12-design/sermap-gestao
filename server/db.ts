import { eq, desc, and, sql, like, or, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, processos, movimentacoes, passivoTributario, simulacoes, documentos, notificacoes, timelineItems, systemConfig, recados, emails, planoAcao, governancaDocumentos, governancaReunioes, governancaParticipantes, governancaAtas, governancaGravacoes, governancaAssinaturas } from "../drizzle/schema";
import type { InsertRecado, InsertPlanoAcao, InsertGovernancaDocumento, InsertGovernancaReuniao, InsertGovernancaParticipante, InsertGovernancaAta, InsertGovernancaGravacao, InsertGovernancaAssinatura } from "../drizzle/schema";
import type { InsertProcesso, InsertMovimentacao } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// === AUTH LOCAL ===
export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSystemConfig(chave: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(systemConfig).where(eq(systemConfig.chave, chave)).limit(1);
  return result.length > 0 ? result[0]?.valor : undefined;
}

export async function setSystemConfig(chave: string, valor: string) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(systemConfig).where(eq(systemConfig.chave, chave)).limit(1);
  if (existing.length > 0) {
    await db.update(systemConfig).set({ valor }).where(eq(systemConfig.chave, chave));
  } else {
    await db.insert(systemConfig).values({ chave, valor });
  }
}

// === PROCESSOS ===
export async function getAllProcessos(tipo?: string) {
  const db = await getDb();
  if (!db) return [];
  if (tipo) {
    return db.select().from(processos).where(eq(processos.tipo, tipo as any)).orderBy(asc(processos.numero));
  }
  return db.select().from(processos).orderBy(asc(processos.tipo), asc(processos.numero));
}

export async function getProcessoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(processos).where(eq(processos.id, id)).limit(1);
  return result[0];
}

export async function getProcessosComPerdaPrazo() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(processos).where(eq(processos.perdaPrazo, true));
}

export async function getProcessosSummary() {
  const db = await getDb();
  if (!db) return { total: 0, trabalhistas: 0, civeis: 0, tributarios: 0, execucoesFiscais: 0, perdaPrazo: 0, valorTotalTrabalhista: 0, valorTotalCivel: 0 };
  
  const all = await db.select().from(processos);
  const trabalhistas = all.filter(p => p.tipo === 'trabalhista');
  const civeis = all.filter(p => p.tipo === 'civel');
  const tributarios = all.filter(p => p.tipo === 'tributario');
  const execucoes = all.filter(p => p.tipo === 'execucao_fiscal');
  const perdaPrazo = all.filter(p => p.perdaPrazo);
  
  const valorTrabalhista = trabalhistas.reduce((sum, p) => sum + parseFloat(p.valorCondenacao || '0'), 0);
  const valorCivel = [...civeis, ...tributarios, ...execucoes].reduce((sum, p) => sum + parseFloat(p.valorSentenca || p.valorCondenacao || '0'), 0);
  
  return {
    total: all.length,
    trabalhistas: trabalhistas.length,
    civeis: civeis.length + tributarios.length + execucoes.length,
    tributarios: tributarios.length,
    execucoesFiscais: execucoes.length,
    perdaPrazo: perdaPrazo.length,
    valorTotalTrabalhista: valorTrabalhista,
    valorTotalCivel: valorCivel,
  };
}

// === MOVIMENTAÇÕES ===
export async function getMovimentacoesByProcesso(processoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(movimentacoes).where(eq(movimentacoes.processoId, processoId)).orderBy(desc(movimentacoes.createdAt));
}

export async function getMovimentacoesRecentes(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  const movs = await db.select().from(movimentacoes).orderBy(desc(movimentacoes.createdAt)).limit(limit);
  // Join with processo info
  const result = [];
  for (const mov of movs) {
    const proc = await getProcessoById(mov.processoId);
    result.push({ ...mov, processo: proc });
  }
  return result;
}

export async function getMovimentacoesNaoLidas() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(movimentacoes).where(eq(movimentacoes.lida, false));
  return result[0]?.count || 0;
}

export async function marcarMovimentacaoLida(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(movimentacoes).set({ lida: true }).where(eq(movimentacoes.id, id));
}

export async function marcarTodasMovimentacoesLidas() {
  const db = await getDb();
  if (!db) return;
  await db.update(movimentacoes).set({ lida: true }).where(eq(movimentacoes.lida, false));
}

export async function insertMovimentacao(mov: InsertMovimentacao) {
  const db = await getDb();
  if (!db) return;
  await db.insert(movimentacoes).values(mov);
}

// === PASSIVO TRIBUTÁRIO ===
export async function getPassivoTributario() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(passivoTributario);
}

// === SIMULAÇÕES ===
export async function getSimulacoes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(simulacoes);
}

// === DOCUMENTOS ===
export async function getDocumentos(confidencial?: boolean) {
  const db = await getDb();
  if (!db) return [];
  if (confidencial !== undefined) {
    return db.select().from(documentos).where(eq(documentos.confidencial, confidencial)).orderBy(desc(documentos.createdAt));
  }
  return db.select().from(documentos).orderBy(desc(documentos.createdAt));
}

export async function insertDocumento(doc: typeof documentos.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(documentos).values(doc);
}

export async function deleteDocumento(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(documentos).where(eq(documentos.id, id));
}

// === NOTIFICAÇÕES ===
export async function getNotificacoes(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notificacoes).orderBy(desc(notificacoes.createdAt)).limit(limit);
}

export async function getNotificacoesNaoLidas() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(notificacoes).where(eq(notificacoes.lida, false));
  return result[0]?.count || 0;
}

export async function marcarNotificacaoLida(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notificacoes).set({ lida: true }).where(eq(notificacoes.id, id));
}

export async function marcarTodasNotificacoesLidas() {
  const db = await getDb();
  if (!db) return;
  await db.update(notificacoes).set({ lida: true }).where(eq(notificacoes.lida, false));
}

// === RECADOS / PENDÊNCIAS ===
export async function getRecados(status?: string) {
  const db = await getDb();
  if (!db) return [];
  if (status && status !== 'todos') {
    return db.select().from(recados).where(eq(recados.status, status as any)).orderBy(desc(recados.createdAt));
  }
  return db.select().from(recados).orderBy(desc(recados.createdAt));
}

export async function getRecadosAbertos() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(recados).where(eq(recados.status, 'aberto'));
  return result[0]?.count || 0;
}

export async function insertRecado(recado: InsertRecado) {
  const db = await getDb();
  if (!db) return;
  await db.insert(recados).values(recado);
}

export async function updateRecadoStatus(id: number, status: 'aberto' | 'em_andamento' | 'concluido') {
  const db = await getDb();
  if (!db) return;
  await db.update(recados).set({ status }).where(eq(recados.id, id));
}

export async function deleteRecado(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(recados).where(eq(recados.id, id));
}

// === TIMELINE ===
export async function getTimeline() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(timelineItems).orderBy(asc(timelineItems.ordem));
}

// === EMAILS ===
export async function getEmails() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emails).orderBy(desc(emails.dataEmail));
}

export async function getEmailsFiltered(filtro?: { remetente?: string; categoria?: string; dataInicio?: string; dataFim?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (filtro?.remetente) {
    conditions.push(like(emails.remetente, `%${filtro.remetente}%`));
  }
  if (filtro?.categoria) {
    conditions.push(eq(emails.categoria, filtro.categoria as any));
  }
  if (filtro?.dataInicio) {
    conditions.push(sql`${emails.dataEmail} >= ${filtro.dataInicio}`);
  }
  if (filtro?.dataFim) {
    conditions.push(sql`${emails.dataEmail} <= ${filtro.dataFim}`);
  }
  
  const query = conditions.length > 0 ? db.select().from(emails).where(and(...conditions)) : db.select().from(emails);
  return query.orderBy(desc(emails.dataEmail));
}

export async function getEmailById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(emails).where(eq(emails.id, id)).limit(1);
  return result[0];
}

export async function insertEmail(email: typeof emails.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(emails).values(email);
}

export async function updateEmail(id: number, updates: Partial<typeof emails.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(emails).set(updates).where(eq(emails.id, id));
}

export async function deleteEmail(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(emails).where(eq(emails.id, id));
}


// === PLANO DE AÇÃO ===
export async function getPlanoAcao() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(planoAcao).orderBy(asc(planoAcao.numero));
}

export async function getPlanoAcaoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(planoAcao).where(eq(planoAcao.id, id)).limit(1);
  return result[0];
}

export async function insertPlanoAcao(item: InsertPlanoAcao) {
  const db = await getDb();
  if (!db) return;
  await db.insert(planoAcao).values(item);
}

export async function updatePlanoAcao(id: number, updates: Partial<InsertPlanoAcao>) {
  const db = await getDb();
  if (!db) return;
  await db.update(planoAcao).set(updates).where(eq(planoAcao.id, id));
}

export async function deletePlanoAcao(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(planoAcao).where(eq(planoAcao.id, id));
}


// === GOVERNANÇA CORPORATIVA - DOCUMENTOS ===
export async function getGovernancaDocumentos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(governancaDocumentos).orderBy(desc(governancaDocumentos.dataCriacao));
}
export async function insertGovernancaDocumento(doc: InsertGovernancaDocumento) {
  const db = await getDb();
  if (!db) return;
  await db.insert(governancaDocumentos).values(doc);
}
export async function updateGovernancaDocumento(id: number, updates: Partial<InsertGovernancaDocumento>) {
  const db = await getDb();
  if (!db) return;
  await db.update(governancaDocumentos).set(updates).where(eq(governancaDocumentos.id, id));
}
export async function deleteGovernancaDocumento(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(governancaDocumentos).where(eq(governancaDocumentos.id, id));
}

// === GOVERNANÇA CORPORATIVA - REUNIÕES ===
export async function getGovernancaReunioes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(governancaReunioes).orderBy(desc(governancaReunioes.dataReuniao));
}
export async function getGovernancaReuniao(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(governancaReunioes).where(eq(governancaReunioes.id, id)).limit(1);
  return result[0];
}
export async function insertGovernancaReuniao(reuniao: InsertGovernancaReuniao) {
  const db = await getDb();
  if (!db) return;
  await db.insert(governancaReunioes).values(reuniao);
}
export async function updateGovernancaReuniao(id: number, updates: Partial<InsertGovernancaReuniao>) {
  const db = await getDb();
  if (!db) return;
  await db.update(governancaReunioes).set(updates).where(eq(governancaReunioes.id, id));
}
export async function deleteGovernancaReuniao(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(governancaReunioes).where(eq(governancaReunioes.id, id));
}

// === GOVERNANÇA CORPORATIVA - PARTICIPANTES ===
export async function getGovernancaParticipantes(reuniaoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(governancaParticipantes).where(eq(governancaParticipantes.reuniaoId, reuniaoId));
}
export async function insertGovernancaParticipante(participante: InsertGovernancaParticipante) {
  const db = await getDb();
  if (!db) return;
  await db.insert(governancaParticipantes).values(participante);
}
export async function updateGovernancaParticipante(id: number, updates: Partial<InsertGovernancaParticipante>) {
  const db = await getDb();
  if (!db) return;
  await db.update(governancaParticipantes).set(updates).where(eq(governancaParticipantes.id, id));
}
export async function deleteGovernancaParticipante(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(governancaParticipantes).where(eq(governancaParticipantes.id, id));
}

// === GOVERNANÇA CORPORATIVA - ATAS ===
export async function getGovernancaAtas(reuniaoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(governancaAtas).where(eq(governancaAtas.reuniaoId, reuniaoId));
}
export async function insertGovernancaAta(ata: InsertGovernancaAta) {
  const db = await getDb();
  if (!db) return;
  await db.insert(governancaAtas).values(ata);
}
export async function updateGovernancaAta(id: number, updates: Partial<InsertGovernancaAta>) {
  const db = await getDb();
  if (!db) return;
  await db.update(governancaAtas).set(updates).where(eq(governancaAtas.id, id));
}
export async function deleteGovernancaAta(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(governancaAtas).where(eq(governancaAtas.id, id));
}

// === GOVERNANÇA CORPORATIVA - GRAVAÇÕES ===
export async function getGovernancaGravacoes(reuniaoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(governancaGravacoes).where(eq(governancaGravacoes.reuniaoId, reuniaoId));
}
export async function insertGovernancaGravacao(gravacao: InsertGovernancaGravacao) {
  const db = await getDb();
  if (!db) return;
  await db.insert(governancaGravacoes).values(gravacao);
}
export async function updateGovernancaGravacao(id: number, updates: Partial<InsertGovernancaGravacao>) {
  const db = await getDb();
  if (!db) return;
  await db.update(governancaGravacoes).set(updates).where(eq(governancaGravacoes.id, id));
}
export async function deleteGovernancaGravacao(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(governancaGravacoes).where(eq(governancaGravacoes.id, id));
}

// === GOVERNANÇA CORPORATIVA - ASSINATURAS ===
export async function getGovernancaAssinaturas(documentoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(governancaAssinaturas).where(eq(governancaAssinaturas.documentoId, documentoId));
}
export async function insertGovernancaAssinatura(assinatura: InsertGovernancaAssinatura) {
  const db = await getDb();
  if (!db) return;
  await db.insert(governancaAssinaturas).values(assinatura);
}
export async function updateGovernancaAssinatura(id: number, updates: Partial<InsertGovernancaAssinatura>) {
  const db = await getDb();
  if (!db) return;
  await db.update(governancaAssinaturas).set(updates).where(eq(governancaAssinaturas.id, id));
}
export async function deleteGovernancaAssinatura(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(governancaAssinaturas).where(eq(governancaAssinaturas.id, id));
}
