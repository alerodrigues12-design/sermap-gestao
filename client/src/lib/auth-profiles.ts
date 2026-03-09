// ─── Sistema Central de Autenticação ────────────────────────────────────────
// Perfis de acesso para o sistema SERMAP Gestão Estratégica
// Cada perfil define o que o usuário pode visualizar

export type Perfil = "ale" | "sheila" | "conselho" | "visitante" | "juridico";

export interface PerfilAcesso {
  login: string;
  senha: string;
  nome: string;
  perfil: Perfil;
  // Permissões
  acessoCompleto: boolean;
  verDocumentosConfidenciais: boolean;
  verValoresHoffmann: boolean;       // Plano Hoffmann com valores financeiros
  verPassivosFinanceiros: boolean;   // KPIs de passivo da SERMAP
  verPlanoEstrategico: boolean;
  abasPlanoEstrategico: string[];    // "all" ou lista de valores de abas
}

// ─── Definição dos Perfis ────────────────────────────────────────────────────

export const PERFIS: PerfilAcesso[] = [
  {
    login: "Ale",
    senha: "Ale2026",
    nome: "Alessandra Hoffmann",
    perfil: "ale",
    acessoCompleto: true,
    verDocumentosConfidenciais: true,
    verValoresHoffmann: true,
    verPassivosFinanceiros: true,
    verPlanoEstrategico: true,
    abasPlanoEstrategico: ["all"],
  },
  {
    login: "Sheila",
    senha: "Sermap26",
    nome: "Sheila — SERMAP",
    perfil: "sheila",
    acessoCompleto: true,
    verDocumentosConfidenciais: true,
    verValoresHoffmann: true,
    verPassivosFinanceiros: true,
    verPlanoEstrategico: true,
    abasPlanoEstrategico: ["all"],
  },
  {
    login: "Conselho",
    senha: "Conselho26",
    nome: "Conselho",
    perfil: "conselho",
    acessoCompleto: false,
    verDocumentosConfidenciais: false,   // Sem documentos confidenciais
    verValoresHoffmann: false,           // Sem valores do plano Hoffmann
    verPassivosFinanceiros: true,        // Pode ver passivos da SERMAP
    verPlanoEstrategico: true,
    abasPlanoEstrategico: ["diagnostico", "riscos", "pilares", "contencao", "blindagem", "cronograma", "gaps"],
  },
  {
    login: "Visitante",
    senha: "Visitante2026",
    nome: "Visitante",
    perfil: "visitante",
    acessoCompleto: false,
    verDocumentosConfidenciais: false,
    verValoresHoffmann: false,
    verPassivosFinanceiros: false,
    verPlanoEstrategico: true,
    abasPlanoEstrategico: ["pilares", "cronograma"],
  },
  {
    login: "Juridico",
    senha: "Jurid2026@",
    nome: "Visitante Jurídico",
    perfil: "juridico",
    acessoCompleto: false,
    verDocumentosConfidenciais: false,   // Sem confidenciais
    verValoresHoffmann: false,           // Sem valores financeiros
    verPassivosFinanceiros: false,       // Sem passivos com valores
    verPlanoEstrategico: true,
    abasPlanoEstrategico: ["diagnostico", "riscos", "pilares", "contencao", "blindagem", "cronograma", "gaps"],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function autenticar(login: string, senha: string): PerfilAcesso | null {
  const perfil = PERFIS.find(
    (p) =>
      p.login.toLowerCase() === login.trim().toLowerCase() &&
      p.senha === senha.trim()
  );
  return perfil ?? null;
}

// Senha para Documentos Confidenciais (usada diretamente na página)
export const SENHA_DOCS_CONFIDENCIAIS = "docs2026@";

// Todas as abas do Plano Estratégico
export const TODAS_ABAS = [
  { value: "diagnostico", label: "Diagnóstico" },
  { value: "riscos", label: "Mapa de Riscos" },
  { value: "pilares", label: "3 Pilares" },
  { value: "contencao", label: "Plano de Contenção" },
  { value: "blindagem", label: "Blindagem Patrimonial" },
  { value: "cronograma", label: "Cronograma" },
  { value: "gaps", label: "Gaps" },
  { value: "hoffmann", label: "Plano Hoffmann" },
];

export function getAbasVisiveis(perfil: PerfilAcesso) {
  if (perfil.abasPlanoEstrategico.includes("all")) return TODAS_ABAS;
  // Filtrar abas permitidas; Hoffmann só aparece se tiver permissão de valores
  return TODAS_ABAS.filter((a) => {
    if (a.value === "hoffmann" && !perfil.verValoresHoffmann) return false;
    return perfil.abasPlanoEstrategico.includes(a.value);
  });
}
