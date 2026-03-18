/**
 * Serviço para geração automática de ata de reunião usando IA
 */

import { invokeLLM } from "./llm";

export interface AtaGerada {
  titulo: string;
  dataReuniao: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  participantes: Array<{
    nome: string;
    email: string;
    cargo?: string;
  }>;
  resumoExecutivo: string;
  pontosPrincipais: Array<{
    titulo: string;
    descricao: string;
    responsavel?: string;
    prazo?: string;
  }>;
  decisoes: Array<{
    descricao: string;
    votacao?: string;
    resultado?: string;
  }>;
  acoesPendentes: Array<{
    descricao: string;
    responsavel: string;
    prazo: string;
    prioridade: "alta" | "media" | "baixa";
  }>;
  proximaReuniao?: {
    data: string;
    hora: string;
    pauta?: string;
  };
  observacoes?: string;
}

/**
 * Gera uma ata a partir da transcrição de uma reunião
 */
export async function gerarAtaDeTranscricao(
  reuniaoInfo: {
    titulo: string;
    dataReuniao: string;
    horaInicio: string;
    horaFim: string;
    local: string;
    participantes: Array<{
      nome: string;
      email: string;
      cargo?: string;
    }>;
  },
  transcricao: string
): Promise<AtaGerada> {
  const systemPrompt = `Você é um especialista em redação de atas corporativas e jurídicas. 
Sua tarefa é analisar a transcrição de uma reunião e gerar uma ata profissional, bem estruturada e completa.
A ata deve ser clara, concisa e incluir todos os pontos importantes discutidos.
Retorne a ata em formato JSON estruturado.`;

  const userPrompt = `Gere uma ata profissional baseada na seguinte reunião:

INFORMAÇÕES DA REUNIÃO:
- Título: ${reuniaoInfo.titulo}
- Data: ${reuniaoInfo.dataReuniao}
- Hora Início: ${reuniaoInfo.horaInicio}
- Hora Fim: ${reuniaoInfo.horaFim}
- Local: ${reuniaoInfo.local}
- Participantes: ${reuniaoInfo.participantes.map((p) => `${p.nome}${p.cargo ? ` (${p.cargo})` : ""}`).join(", ")}

TRANSCRIÇÃO DA REUNIÃO:
${transcricao}

Retorne um JSON com a seguinte estrutura:
{
  "titulo": "Título da Ata",
  "dataReuniao": "DD/MM/AAAA",
  "horaInicio": "HH:MM",
  "horaFim": "HH:MM",
  "local": "Local da reunião",
  "participantes": [
    {
      "nome": "Nome do participante",
      "email": "email@example.com",
      "cargo": "Cargo (opcional)"
    }
  ],
  "resumoExecutivo": "Resumo executivo da reunião em 2-3 parágrafos",
  "pontosPrincipais": [
    {
      "titulo": "Título do ponto",
      "descricao": "Descrição detalhada do ponto discutido",
      "responsavel": "Responsável (opcional)",
      "prazo": "Prazo (opcional)"
    }
  ],
  "decisoes": [
    {
      "descricao": "Descrição da decisão",
      "votacao": "Resultado da votação (se houver)",
      "resultado": "Resultado/Conclusão"
    }
  ],
  "acoesPendentes": [
    {
      "descricao": "Descrição da ação",
      "responsavel": "Nome do responsável",
      "prazo": "DD/MM/AAAA",
      "prioridade": "alta|media|baixa"
    }
  ],
  "proximaReuniao": {
    "data": "DD/MM/AAAA (opcional)",
    "hora": "HH:MM (opcional)",
    "pauta": "Pauta proposta (opcional)"
  },
  "observacoes": "Observações gerais (opcional)"
}`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: { type: "json_object" },
      maxTokens: 4096,
    });

    const content = response?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Nenhuma resposta recebida da IA");

    const ata = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));
    return ata as AtaGerada;
  } catch (error) {
    console.error("[AtaGenerator] Erro ao gerar ata:", error);
    throw new Error(`Erro ao gerar ata: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
  }
}

/**
 * Converte a ata JSON para HTML formatado
 */
export function converterAtaParaHtml(ata: AtaGerada): string {
  const dataAtual = new Date().toLocaleDateString("pt-BR");
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ata.titulo}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #2c3e50;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      color: #2c3e50;
      font-size: 28px;
    }
    .header p {
      margin: 5px 0;
      color: #666;
      font-size: 14px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
    }
    .info-label {
      font-weight: bold;
      color: #2c3e50;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .info-value {
      color: #555;
      font-size: 14px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      color: #2c3e50;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
      margin-bottom: 15px;
      font-size: 18px;
    }
    .section h3 {
      color: #34495e;
      margin-top: 15px;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .participantes-list {
      list-style: none;
      padding: 0;
    }
    .participantes-list li {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }
    .participantes-list li:last-child {
      border-bottom: none;
    }
    .ponto {
      background-color: #f9f9f9;
      padding: 15px;
      margin-bottom: 10px;
      border-left: 4px solid #3498db;
      border-radius: 3px;
    }
    .ponto-titulo {
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 5px;
    }
    .ponto-descricao {
      color: #555;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .ponto-meta {
      font-size: 12px;
      color: #999;
    }
    .acao {
      background-color: #fff3cd;
      padding: 15px;
      margin-bottom: 10px;
      border-left: 4px solid #ffc107;
      border-radius: 3px;
    }
    .acao-titulo {
      font-weight: bold;
      color: #856404;
      margin-bottom: 5px;
    }
    .acao-prioridade {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: bold;
      margin-left: 10px;
    }
    .prioridade-alta {
      background-color: #f8d7da;
      color: #721c24;
    }
    .prioridade-media {
      background-color: #fff3cd;
      color: #856404;
    }
    .prioridade-baixa {
      background-color: #d1ecf1;
      color: #0c5460;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
    .resumo {
      background-color: #e8f4f8;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
      line-height: 1.8;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${ata.titulo}</h1>
      <p>Ata de Reunião</p>
      <p>Gerada em ${dataAtual}</p>
    </div>

    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Data da Reunião</span>
        <span class="info-value">${ata.dataReuniao}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Horário</span>
        <span class="info-value">${ata.horaInicio} - ${ata.horaFim}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Local</span>
        <span class="info-value">${ata.local}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Participantes</span>
        <span class="info-value">${ata.participantes.length} pessoas</span>
      </div>
    </div>

    ${ata.resumoExecutivo ? `
    <div class="section">
      <h2>Resumo Executivo</h2>
      <div class="resumo">${ata.resumoExecutivo}</div>
    </div>
    ` : ""}

    <div class="section">
      <h2>Participantes</h2>
      <ul class="participantes-list">
        ${ata.participantes.map((p) => `
          <li>
            <strong>${p.nome}</strong>${p.cargo ? ` - ${p.cargo}` : ""}
            <br>
            <small>${p.email}</small>
          </li>
        `).join("")}
      </ul>
    </div>

    ${ata.pontosPrincipais && ata.pontosPrincipais.length > 0 ? `
    <div class="section">
      <h2>Pontos Principais Discutidos</h2>
      ${ata.pontosPrincipais.map((p) => `
        <div class="ponto">
          <div class="ponto-titulo">${p.titulo}</div>
          <div class="ponto-descricao">${p.descricao}</div>
          ${p.responsavel || p.prazo ? `
            <div class="ponto-meta">
              ${p.responsavel ? `Responsável: ${p.responsavel}` : ""}
              ${p.responsavel && p.prazo ? " | " : ""}
              ${p.prazo ? `Prazo: ${p.prazo}` : ""}
            </div>
          ` : ""}
        </div>
      `).join("")}
    </div>
    ` : ""}

    ${ata.decisoes && ata.decisoes.length > 0 ? `
    <div class="section">
      <h2>Decisões Tomadas</h2>
      ${ata.decisoes.map((d) => `
        <div class="ponto">
          <div class="ponto-titulo">${d.descricao}</div>
          ${d.votacao ? `<div class="ponto-meta">Votação: ${d.votacao}</div>` : ""}
          ${d.resultado ? `<div class="ponto-descricao"><strong>Resultado:</strong> ${d.resultado}</div>` : ""}
        </div>
      `).join("")}
    </div>
    ` : ""}

    ${ata.acoesPendentes && ata.acoesPendentes.length > 0 ? `
    <div class="section">
      <h2>Ações Pendentes</h2>
      ${ata.acoesPendentes.map((a) => `
        <div class="acao">
          <div class="acao-titulo">
            ${a.descricao}
            <span class="acao-prioridade prioridade-${a.prioridade}">${a.prioridade.toUpperCase()}</span>
          </div>
          <div class="ponto-meta">
            Responsável: <strong>${a.responsavel}</strong> | Prazo: <strong>${a.prazo}</strong>
          </div>
        </div>
      `).join("")}
    </div>
    ` : ""}

    ${ata.proximaReuniao ? `
    <div class="section">
      <h2>Próxima Reunião</h2>
      <div class="ponto">
        <div class="ponto-meta">
          ${ata.proximaReuniao.data ? `Data: ${ata.proximaReuniao.data}` : ""}
          ${ata.proximaReuniao.data && ata.proximaReuniao.hora ? " | " : ""}
          ${ata.proximaReuniao.hora ? `Hora: ${ata.proximaReuniao.hora}` : ""}
        </div>
        ${ata.proximaReuniao.pauta ? `<div class="ponto-descricao"><strong>Pauta:</strong> ${ata.proximaReuniao.pauta}</div>` : ""}
      </div>
    </div>
    ` : ""}

    ${ata.observacoes ? `
    <div class="section">
      <h2>Observações</h2>
      <div class="resumo">${ata.observacoes}</div>
    </div>
    ` : ""}

    <div class="footer">
      <p>Esta ata foi gerada automaticamente pelo sistema SERMAP Gestão</p>
      <p>Documento confidencial - Acesso restrito</p>
    </div>
  </div>
</body>
</html>
  `;
}
