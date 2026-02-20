import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  username: varchar("username", { length: 100 }),
  password: varchar("password", { length: 255 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Processos judiciais (trabalhistas e cíveis/tributários)
export const processos = mysqlTable("processos", {
  id: int("id").autoincrement().primaryKey(),
  numero: varchar("numero", { length: 50 }).notNull(),
  tipo: mysqlEnum("tipo", ["trabalhista", "civel", "tributario", "execucao_fiscal"]).notNull(),
  sistema: mysqlEnum("sistema", ["pje", "esaj"]).default("pje").notNull(),
  orgao: varchar("orgao", { length: 255 }),
  local: varchar("local", { length: 255 }),
  autor: text("autor"),
  reu: text("reu"),
  assunto: text("assunto"),
  dataAutuacao: varchar("dataAutuacao", { length: 20 }),
  observacoes: text("observacoes"),
  valorCondenacao: decimal("valorCondenacao", { precision: 15, scale: 2 }),
  valorSentenca: decimal("valorSentenca", { precision: 15, scale: 2 }),
  status: text("status"),
  perdaPrazo: boolean("perdaPrazo").default(false),
  risco: mysqlEnum("risco", ["alto", "medio", "baixo", "indefinido"]).default("indefinido"),
  advogadoReclamante: text("advogadoReclamante"),
  enderecoReclamante: text("enderecoReclamante"),
  enderecoAdvogado: text("enderecoAdvogado"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Processo = typeof processos.$inferSelect;
export type InsertProcesso = typeof processos.$inferInsert;

// Movimentações processuais (DataJud)
export const movimentacoes = mysqlTable("movimentacoes", {
  id: int("id").autoincrement().primaryKey(),
  processoId: int("processoId").notNull(),
  dataMovimentacao: varchar("dataMovimentacao", { length: 30 }),
  descricao: text("descricao"),
  complemento: text("complemento"),
  fonte: varchar("fonte", { length: 50 }).default("datajud"),
  lida: boolean("lida").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Movimentacao = typeof movimentacoes.$inferSelect;
export type InsertMovimentacao = typeof movimentacoes.$inferInsert;

// Passivo tributário (PGFN)
export const passivoTributario = mysqlTable("passivoTributario", {
  id: int("id").autoincrement().primaryKey(),
  inscricao: varchar("inscricao", { length: 50 }).notNull(),
  tipo: varchar("tipo", { length: 100 }),
  natureza: varchar("natureza", { length: 100 }),
  situacao: varchar("situacao", { length: 100 }),
  dataInscricao: varchar("dataInscricao", { length: 20 }),
  orgao: varchar("orgao", { length: 200 }),
  receita: varchar("receita", { length: 200 }),
  processoJudicial: varchar("processoJudicial", { length: 100 }),
  valorTotal: decimal("valorTotal", { precision: 15, scale: 2 }),
  valorPrincipal: decimal("valorPrincipal", { precision: 15, scale: 2 }),
  valorMulta: decimal("valorMulta", { precision: 15, scale: 2 }),
  valorJuros: decimal("valorJuros", { precision: 15, scale: 2 }),
  valorEncargo: decimal("valorEncargo", { precision: 15, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PassivoTributario = typeof passivoTributario.$inferSelect;

// Simulações de transação
export const simulacoes = mysqlTable("simulacoes", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 200 }).notNull(),
  edital: varchar("edital", { length: 200 }),
  modalidade: varchar("modalidade", { length: 200 }),
  totalSemDesconto: decimal("totalSemDesconto", { precision: 15, scale: 2 }),
  desconto: decimal("desconto", { precision: 15, scale: 2 }),
  totalAPagar: decimal("totalAPagar", { precision: 15, scale: 2 }),
  prestacoes: int("prestacoes"),
  valorEntrada: decimal("valorEntrada", { precision: 15, scale: 2 }),
  qtdEntrada: int("qtdEntrada"),
  valorParcela: decimal("valorParcela", { precision: 15, scale: 2 }),
  qtdParcelas: int("qtdParcelas"),
  dataAdesao: varchar("dataAdesao", { length: 20 }),
  viavel: boolean("viavel").default(false),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Simulacao = typeof simulacoes.$inferSelect;

// Documentos confidenciais
export const documentos = mysqlTable("documentos", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  categoria: mysqlEnum("categoria", ["contrato", "honorarios", "procuracao", "outros"]).default("outros"),
  fileUrl: text("fileUrl"),
  fileKey: varchar("fileKey", { length: 500 }),
  confidencial: boolean("confidencial").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Documento = typeof documentos.$inferSelect;

// Notificações
export const notificacoes = mysqlTable("notificacoes", {
  id: int("id").autoincrement().primaryKey(),
  processoId: int("processoId"),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem"),
  tipo: mysqlEnum("tipo", ["movimentacao", "prazo", "alerta", "info"]).default("info"),
  lida: boolean("lida").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notificacao = typeof notificacoes.$inferSelect;

// Timeline dos 90 dias
export const timelineItems = mysqlTable("timelineItems", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  dataInicio: varchar("dataInicio", { length: 20 }),
  dataFim: varchar("dataFim", { length: 20 }),
  status: mysqlEnum("status", ["pendente", "em_andamento", "concluido"]).default("pendente"),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelineItem = typeof timelineItems.$inferSelect;

// Configurações do sistema
export const systemConfig = mysqlTable("systemConfig", {
  id: int("id").autoincrement().primaryKey(),
  chave: varchar("chave", { length: 100 }).notNull().unique(),
  valor: text("valor"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemConfig = typeof systemConfig.$inferSelect;
