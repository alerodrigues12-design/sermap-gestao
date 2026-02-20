import { eq, desc, and, sql, like, or, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, processos, movimentacoes, passivoTributario, simulacoes, documentos, notificacoes, timelineItems, systemConfig, recados } from "../drizzle/schema";
import type { InsertRecado } from "../drizzle/schema";
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
