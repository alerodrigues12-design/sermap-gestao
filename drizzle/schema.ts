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
  htmlContent: text("htmlContent"),
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

// Pendências e Recados
export const recados = mysqlTable("recados", {
  id: int("id").autoincrement().primaryKey(),
  autorId: int("autorId").notNull(),
  autorNome: varchar("autorNome", { length: 255 }),
  tipo: mysqlEnum("tipo", ["pendencia", "recado", "solicitacao", "atualizacao"]).default("recado").notNull(),
  prioridade: mysqlEnum("prioridade", ["alta", "media", "baixa"]).default("media").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem").notNull(),
  status: mysqlEnum("status", ["aberto", "em_andamento", "concluido"]).default("aberto").notNull(),
  processoRelacionado: varchar("processoRelacionado", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Recado = typeof recados.$inferSelect;
export type InsertRecado = typeof recados.$inferInsert;

// Configurações do sistema
export const systemConfig = mysqlTable("systemConfig", {
  id: int("id").autoincrement().primaryKey(),
  chave: varchar("chave", { length: 100 }).notNull().unique(),
  valor: text("valor"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemConfig = typeof systemConfig.$inferSelect;

// E-mails Importantes
export const emails = mysqlTable("emails", {
  id: int("id").autoincrement().primaryKey(),
  remetente: varchar("remetente", { length: 255 }).notNull(),
  destinatario: varchar("destinatario", { length: 255 }).notNull(),
  assunto: varchar("assunto", { length: 500 }).notNull(),
  conteudo: text("conteudo").notNull(),
  categoria: mysqlEnum("categoria", ["proposta", "contrato", "comunicacao", "importante", "outros"]).default("outros"),
  dataEmail: varchar("dataEmail", { length: 20 }).notNull(),
  arquivoUrl: text("arquivoUrl"),
  arquivoKey: varchar("arquivoKey", { length: 500 }),
  confidencial: boolean("confidencial").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Email = typeof emails.$inferSelect;
export type InsertEmail = typeof emails.$inferInsert;

// Plano de Ação
export const planoAcao = mysqlTable("planoAcao", {
  id: int("id").autoincrement().primaryKey(),
  numero: int("numero").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  status: mysqlEnum("status", ["nao_iniciado", "em_andamento", "concluido", "bloqueado"]).default("nao_iniciado").notNull(),
  dataPrevista: varchar("dataPrevista", { length: 20 }),
  dataFinalizada: varchar("dataFinalizada", { length: 20 }),
  responsavel: varchar("responsavel", { length: 255 }),
  percentualConclusao: int("percentualConclusao").default(0),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlanoAcao = typeof planoAcao.$inferSelect;
export type InsertPlanoAcao = typeof planoAcao.$inferInsert;


// Governança Corporativa - Documentos
export const governancaDocumentos = mysqlTable("governancaDocumentos", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  tipo: mysqlEnum("tipo", ["politica", "procedimento", "norma", "resolucao", "estatuto", "regimento", "outro"]).notNull(),
  versao: int("versao").default(1),
  status: mysqlEnum("status", ["rascunho", "em_aprovacao", "aprovado", "arquivado"]).default("rascunho").notNull(),
  documentoUrl: text("documentoUrl"),
  documentoKey: varchar("documentoKey", { length: 500 }),
  dataCriacao: varchar("dataCriacao", { length: 20 }).notNull(),
  dataAprovacao: varchar("dataAprovacao", { length: 20 }),
  responsavel: varchar("responsavel", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GovernancaDocumento = typeof governancaDocumentos.$inferSelect;
export type InsertGovernancaDocumento = typeof governancaDocumentos.$inferInsert;

// Governança Corporativa - Reuniões
export const governancaReunioes = mysqlTable("governancaReunioes", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  dataReuniao: varchar("dataReuniao", { length: 20 }).notNull(),
  horaReuniao: varchar("horaReuniao", { length: 10 }).notNull(),
  local: varchar("local", { length: 255 }),
  linkGoogleMeet: text("linkGoogleMeet"),
  status: mysqlEnum("status", ["agendada", "em_andamento", "concluida", "cancelada"]).default("agendada").notNull(),
  responsavel: varchar("responsavel", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GovernancaReuniao = typeof governancaReunioes.$inferSelect;
export type InsertGovernancaReuniao = typeof governancaReunioes.$inferInsert;

// Governança Corporativa - Participantes de Reuniões
export const governancaParticipantes = mysqlTable("governancaParticipantes", {
  id: int("id").autoincrement().primaryKey(),
  reuniaoId: int("reuniaoId").notNull().references(() => governancaReunioes.id),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  cargo: varchar("cargo", { length: 255 }),
  confirmacao: mysqlEnum("confirmacao", ["pendente", "confirmado", "recusado"]).default("pendente"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GovernancaParticipante = typeof governancaParticipantes.$inferSelect;
export type InsertGovernancaParticipante = typeof governancaParticipantes.$inferInsert;

// Governança Corporativa - Atas
export const governancaAtas = mysqlTable("governancaAtas", {
  id: int("id").autoincrement().primaryKey(),
  reuniaoId: int("reuniaoId").notNull().references(() => governancaReunioes.id),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  conteudo: text("conteudo"),
  ataUrl: text("ataUrl"),
  ataKey: varchar("ataKey", { length: 500 }),
  dataAta: varchar("dataAta", { length: 20 }).notNull(),
  responsavel: varchar("responsavel", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GovernancaAta = typeof governancaAtas.$inferSelect;
export type InsertGovernancaAta = typeof governancaAtas.$inferInsert;

// Governança Corporativa - Gravações
export const governancaGravacoes = mysqlTable("governancaGravacoes", {
  id: int("id").autoincrement().primaryKey(),
  reuniaoId: int("reuniaoId").notNull().references(() => governancaReunioes.id),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  linkGravacao: text("linkGravacao").notNull(),
  duracao: varchar("duracao", { length: 20 }),
  dataGravacao: varchar("dataGravacao", { length: 20 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GovernancaGravacao = typeof governancaGravacoes.$inferSelect;
export type InsertGovernancaGravacao = typeof governancaGravacoes.$inferInsert;

// Governança Corporativa - Assinaturas Eletrônicas
export const governancaAssinaturas = mysqlTable("governancaAssinaturas", {
  id: int("id").autoincrement().primaryKey(),
  documentoId: int("documentoId").notNull().references(() => governancaDocumentos.id),
  signatario: varchar("signatario", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  status: mysqlEnum("status", ["pendente", "assinado", "recusado"]).default("pendente").notNull(),
  dataAssinatura: varchar("dataAssinatura", { length: 20 }),
  linkAutentique: text("linkAutentique"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GovernancaAssinatura = typeof governancaAssinaturas.$inferSelect;
export type InsertGovernancaAssinatura = typeof governancaAssinaturas.$inferInsert;

// Log de acessos ao Plano Estratégico
export const accessLog = mysqlTable("accessLog", {
  id: int("id").autoincrement().primaryKey(),
  perfil: varchar("perfil", { length: 50 }).notNull(),       // ex: "Ale", "Sheila", "Conselho"
  nivelAcesso: varchar("nivelAcesso", { length: 50 }).notNull(), // ex: "completo", "visitante"
  ip: varchar("ip", { length: 100 }),
  userAgent: text("userAgent"),
  pagina: varchar("pagina", { length: 100 }).default("plano-estrategico"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AccessLog = typeof accessLog.$inferSelect;
export type InsertAccessLog = typeof accessLog.$inferInsert;

// Processos Pessoa Física — Sheila Soares
export const processosPF = mysqlTable("processosPF", {
  id: int("id").autoincrement().primaryKey(),
  numero: varchar("numero", { length: 60 }).notNull(),
  tribunal: varchar("tribunal", { length: 300 }).notNull(),
  assunto: text("assunto"),
  valor: varchar("valor", { length: 50 }),
  partes: text("partes"),
  status: mysqlEnum("status", ["ativo", "arquivado", "extinto", "a_verificar"]).default("a_verificar").notNull(),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProcessoPF = typeof processosPF.$inferSelect;
export type InsertProcessoPF = typeof processosPF.$inferInsert;
