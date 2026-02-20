import { drizzle } from "drizzle-orm/mysql2";
import dotenv from "dotenv";
dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

// Helper to run raw SQL using drizzle's sql template
import { sql as rawSql } from "drizzle-orm";

async function run(query, params = []) {
  // Build parameterized query
  let finalQuery = query;
  const chunks = query.split('?');
  if (params.length > 0) {
    const parts = [];
    for (let i = 0; i < chunks.length; i++) {
      parts.push(rawSql.raw(chunks[i]));
      if (i < params.length) {
        parts.push(rawSql`${params[i]}`);
      }
    }
    await db.execute(rawSql.join(parts, rawSql.raw('')));
  } else {
    await db.execute(rawSql.raw(query));
  }
}

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await run("DELETE FROM notificacoes");
  await run("DELETE FROM movimentacoes");
  await run("DELETE FROM documentos");
  await run("DELETE FROM simulacoes");
  await run("DELETE FROM passivoTributario");
  await run("DELETE FROM timelineItems");
  await run("DELETE FROM processos");

  // === PROCESSOS TRABALHISTAS ===
  const trabalhistas = [
    { numero: "0001245-07.2016.5.05.0193", local: "Feira de Santana/BA", orgao: "2ª Vara do Trabalho FSA", reclamante: "GEOVANE PEREIRA SANTOS", assunto: "Verbas rescisórias", valorCondenacao: 10000, status: "Execução - Processo suspenso até leilão do centro de operações", perdaPrazo: false, observacoes: "Condenação da SERMAP ao pagamento de verbas rescisórias. Solicitado reserva de crédito nos autos do proc. 0000141-18.2021.5.05.0196." },
    { numero: "0000778-17.2017.5.05.0193", local: "Feira de Santana/BA", orgao: "3ª Vara do Trabalho FSA", reclamante: "VAGNER BRUM SILVEIRA", assunto: "Verbas rescisórias + danos morais", valorCondenacao: 139049.25, status: "Execução - valores bloqueados via Sisbajud", perdaPrazo: false, observacoes: "Condenação da SERMAP. Valores bloqueados via Sisbajud. Transferidos R$ 139.049,25 para proc. 0000706-88.2018.5.19.0004." },
    { numero: "0000972-43.2019.5.05.0194", local: "Feira de Santana/BA", orgao: "4ª Vara do Trabalho FSA", reclamante: "GEOVANE PEREIRA SANTOS", assunto: "Cumprimento de sentença", valorCondenacao: 10000, status: "Execução - aguardando hasta pública", perdaPrazo: false, observacoes: "Cumprimento de sentença do proc. 0001245-07.2016.5.05.0193." },
    { numero: "0000261-68.2018.5.05.0193", local: "Feira de Santana/BA", orgao: "3ª Vara do Trabalho FSA", reclamante: "CARLOS MAGNO SANTOS DA SILVA", assunto: "Verbas rescisórias + danos morais", valorCondenacao: 15000, status: "Execução - Processo suspenso até leilão do centro de operações", perdaPrazo: false, observacoes: "Condenação da SERMAP. Solicitado reserva de crédito nos autos do proc. 0000141-18.2021.5.05.0196." },
    { numero: "0000262-53.2018.5.05.0193", local: "Feira de Santana/BA", orgao: "3ª Vara do Trabalho FSA", reclamante: "JOSÉ CARLOS ROQUE", assunto: "Verbas rescisórias", valorCondenacao: 20000, status: "Execução - Processo suspenso até leilão do centro de operações", perdaPrazo: false, observacoes: "Condenação da SERMAP. Solicitado reserva de crédito nos autos do proc. 0000141-18.2021.5.05.0196." },
    { numero: "0000263-38.2018.5.05.0193", local: "Feira de Santana/BA", orgao: "3ª Vara do Trabalho FSA", reclamante: "EDVALDO SANTOS DA SILVA", assunto: "Verbas rescisórias", valorCondenacao: 12000, status: "Execução - Processo suspenso até leilão do centro de operações", perdaPrazo: false, observacoes: "Condenação da SERMAP. Solicitado reserva de crédito nos autos do proc. 0000141-18.2021.5.05.0196." },
    { numero: "0000264-23.2018.5.05.0193", local: "Feira de Santana/BA", orgao: "3ª Vara do Trabalho FSA", reclamante: "FÁBIO SANTOS SILVA", assunto: "Verbas rescisórias + danos morais", valorCondenacao: 18000, status: "Execução - Processo suspenso até leilão do centro de operações", perdaPrazo: false, observacoes: "Condenação da SERMAP. Solicitado reserva de crédito nos autos do proc. 0000141-18.2021.5.05.0196." },
    { numero: "0000551-92.2017.5.05.0193", local: "Feira de Santana/BA", orgao: "3ª Vara do Trabalho FSA", reclamante: "VAGNER BRUM SILVEIRA", assunto: "Verbas rescisórias + danos morais", valorCondenacao: 520671.9, status: "Execução - aguardando hasta pública 03/03", perdaPrazo: false, observacoes: "Condenação da SERMAP. Bem penhorado: lote 03 em Tietê, matrícula 13.655." },
    { numero: "0000552-77.2017.5.05.0193", local: "Feira de Santana/BA", orgao: "3ª Vara do Trabalho FSA", reclamante: "ANDRÉ VITAL BASTOS DONATO", assunto: "Verbas rescisórias", valorCondenacao: 315548.66, status: "Execução - solicitado reserva de crédito (suspenso até leilão)", perdaPrazo: false, observacoes: "Solicitado reserva de crédito nos autos do processo do centro de operações." },
    { numero: "0000141-18.2021.5.05.0196", local: "Feira de Santana/BA", orgao: "Vara do Trabalho Alagoinhas", reclamante: "VAGNER BRUM SILVEIRA", assunto: "Cumprimento de sentença - Centro de Operações", valorCondenacao: 378046.22, status: "Aguardando leilão - SERMAP PERDEU PRAZO", perdaPrazo: true, observacoes: "Deferida a reavaliação do centro de operações. Nova avaliação judicial em R$ 4.500.000,00. Determinada a inclusão em hasta pública. SERMAP PERDEU PRAZO para impugnação." },
    { numero: "0001100-45.2017.5.05.0194", local: "Feira de Santana/BA", orgao: "4ª Vara do Trabalho FSA", reclamante: "MARCOS SOUZA", assunto: "Verbas rescisórias", valorCondenacao: 25000, status: "Execução - aguardando hasta do centro de operações", perdaPrazo: false, observacoes: "Condenação da SERMAP. Aguardando hasta do centro de operações." },
    { numero: "0000350-12.2018.5.04.0122", local: "Rio Grande/RS", orgao: "Vara do Trabalho Rio Grande", reclamante: "PAULO ROBERTO SILVA", assunto: "Verbas rescisórias + insalubridade", valorCondenacao: 35000, status: "Execução - processo suspenso", perdaPrazo: false, observacoes: "Condenação da SERMAP. Processo suspenso aguardando localização de bens." },
    { numero: "0000456-78.2017.5.06.0311", local: "Escada/PE", orgao: "Vara do Trabalho Escada", reclamante: "ANTONIO CARLOS FERREIRA", assunto: "Verbas rescisórias", valorCondenacao: 10786.68, status: "Processo Suspenso - Correndo prazo prescricional", perdaPrazo: false, observacoes: "Juízo determina que reclamante informe meios para satisfação do crédito sob pena de prescrição intercorrente." },
    { numero: "0000789-34.2017.5.06.0312", local: "Caruaru/PE", orgao: "Vara do Trabalho Caruaru", reclamante: "RICARDO OLIVEIRA", assunto: "Verbas rescisórias + horas extras", valorCondenacao: 22000, status: "Execução - aguardando localização de bens", perdaPrazo: true, observacoes: "SERMAP perdeu prazo para contestação. Condenação por revelia." },
    { numero: "0016691-27.2018.5.16.0022", local: "São Luís/MA", orgao: "22ª Vara do Trabalho São Luís", reclamante: "JOÃO VICTOR ARAÚJO MARTINS", assunto: "Verbas rescisórias", valorCondenacao: 43805.48, status: "Aguardando hasta do centro de operações 03 de março", perdaPrazo: false, observacoes: "Pedido de desconsideração da personalidade jurídica. Processo sobrestado para aguardar expropriação do imóvel." },
    { numero: "0000706-88.2018.5.19.0004", local: "Maceió/AL", orgao: "4ª Vara do Trabalho Maceió", reclamante: "VAGNER BRUM SILVEIRA", assunto: "Verbas rescisórias + danos morais", valorCondenacao: 520671.9, status: "Aguardando hasta pública 03/03", perdaPrazo: false, observacoes: "R$ 35.933,90 levantados. R$ 139.049,25 recebidos. Bem penhorado: lote 03 em Tietê." },
    { numero: "0000038-31.2020.5.19.0010", local: "Maceió/AL", orgao: "10ª Vara do Trabalho Maceió", reclamante: "ANDRÉ VITAL BASTOS DONATO", assunto: "Verbas rescisórias", valorCondenacao: 315548.66, status: "Execução - solicitado reserva de crédito (suspenso até leilão)", perdaPrazo: false, observacoes: "Solicitado reserva de crédito nos autos do processo do centro de operações." },
    { numero: "0001234-56.2018.5.15.0057", local: "Tietê/SP", orgao: "Vara do Trabalho Tietê", reclamante: "MARIA SILVA", assunto: "Verbas rescisórias", valorCondenacao: 15000, status: "Execução - aguardando localização de bens", perdaPrazo: true, observacoes: "SERMAP perdeu prazo para recurso. Trânsito em julgado." },
    { numero: "0002345-67.2019.5.02.0001", local: "São Paulo/SP", orgao: "1ª Vara do Trabalho São Paulo", reclamante: "CARLOS EDUARDO", assunto: "Verbas rescisórias + danos morais", valorCondenacao: 28000, status: "Execução - processo suspenso", perdaPrazo: true, observacoes: "SERMAP perdeu prazo para impugnação aos cálculos." },
    { numero: "0003456-78.2019.5.02.0002", local: "São Paulo/SP", orgao: "2ª Vara do Trabalho São Paulo", reclamante: "FERNANDA OLIVEIRA", assunto: "Verbas rescisórias", valorCondenacao: 18000, status: "Execução - aguardando localização de bens", perdaPrazo: false, observacoes: "Processo em fase de execução. Aguardando localização de bens." },
  ];

  for (const p of trabalhistas) {
    await run(
      `INSERT INTO processos (numero, tipo, sistema, orgao, local, autor, reu, assunto, valorCondenacao, status, perdaPrazo, observacoes) VALUES (?, 'trabalhista', 'pje', ?, ?, ?, 'SERMAP Engenharia LTDA', ?, ?, ?, ?, ?)`,
      [p.numero, p.orgao, p.local, p.reclamante, p.assunto, p.valorCondenacao, p.status, p.perdaPrazo ? 1 : 0, p.observacoes]
    );
  }
  console.log(`Inserted ${trabalhistas.length} processos trabalhistas`);

  // === PROCESSOS CÍVEIS/TRIBUTÁRIOS ===
  const civeis = [
    { numero: "0513452-66.2017.8.05.0080", orgao: "7ª Vara Cível FSA", local: "Feira de Santana/BA", autor: "SERMAP", reu: "Itaú", assunto: "Ação de restituição - estelionato", valorSentenca: 73350.16, status: "SERMAP perdeu o prazo para indicar novo endereço da parte ré", tipo: "civel", sistema: "pje", perdaPrazo: true, observacoes: "Pedido de bloqueio de R$ 73.350,16. Juízo determinou pagamento de diligência." },
    { numero: "0503395-86.2017.8.05.0080", orgao: "1ª Vara Cível FSA", local: "Feira de Santana/BA", autor: "SERMAP", reu: "Arnaldo", assunto: "Reintegração de posse", valorSentenca: 0, status: "Processo com prazo ABERTO para manifestação", tipo: "civel", sistema: "pje", perdaPrazo: true, observacoes: "Juntada petição para impulsionamento do feito." },
    { numero: "8027713-10.2024.8.05.0080", orgao: "7ª Vara Cível FSA", local: "Feira de Santana/BA", autor: "Sheila", reu: "Desconhecido", assunto: "Reintegração de posse", valorSentenca: 10000, status: "Sheila perdeu prazo para emendar a inicial", tipo: "civel", sistema: "pje", perdaPrazo: true, observacoes: "SHEILA Perdeu o prazo para emendar a inicial." },
    { numero: "8005202-23.2021.8.05.0080", orgao: "1ª Vara Cível FSA", local: "Feira de Santana/BA", autor: "José Carlos Roque", reu: "SERMAP", assunto: "Transferência de imóveis - cumprimento de sentença arbitral", valorSentenca: 0, status: "Processo em segredo de justiça", tipo: "civel", sistema: "pje", perdaPrazo: false, observacoes: "Transferência dos imóveis: terreno centenário (mat. 29.781) e Lagoa Salgada (mat. 12.193)." },
    { numero: "1000605-13.2018.4.01.3304", orgao: "2ª Vara Federal FSA", local: "Feira de Santana/BA", autor: "José Carlos Roque / Maria Cristina", reu: "Sheila / SERMAP / Caixa", assunto: "Ação de exoneração de garantia pessoal", valorSentenca: 0, status: "Recurso remetido ao tribunal superior - aguardando decisão", tipo: "civel", sistema: "pje", perdaPrazo: false, observacoes: "Julgado improcedente. Autor condenado ao pagamento de custas e honorários." },
    { numero: "1056834-34.2020.4.01.3300", orgao: "8ª Vara de Execução Fiscal SSA", local: "Salvador/BA", autor: "Fazenda Nacional", reu: "SERMAP", assunto: "Execução fiscal - IRPJ + CSLL", valorSentenca: 3037720.20, status: "Pedido de redirecionamento contra a Sheila", tipo: "execucao_fiscal", sistema: "pje", perdaPrazo: true, observacoes: "SERMAP citada por edital - decorrido prazo. Execução fiscal principal (IRPJ + CSLL)." },
    { numero: "1009959-35.2022.4.01.3300", orgao: "19ª Vara de Execução Fiscal SSA", local: "Salvador/BA", autor: "Fazenda Nacional", reu: "SERMAP", assunto: "Execução fiscal", valorSentenca: 296470.09, status: "Pedido de redirecionamento contra a Sheila", tipo: "execucao_fiscal", sistema: "pje", perdaPrazo: false, observacoes: "Citação inexitosa. União requereu suspensão. Processo suspenso por 01 ano." },
    { numero: "0008810-29.2010.4.01.3304", orgao: "3ª VFC FSA", local: "Feira de Santana/BA", autor: "SERMAP", reu: "União / Fazenda Nacional", assunto: "IRPJ - aplicação da alíquota de 8%", valorSentenca: 4507.20, status: "Suspensão temporária", tipo: "tributario", sistema: "pje", perdaPrazo: true, observacoes: "Processo extinto sem resolução por abandono da causa. SERMAP condenada em custas. Processo suspenso por 01 ano em 07/03/2024." },
    { numero: "1001316-89.2020.8.26.0629", orgao: "Setor de Execuções Fiscais Tietê", local: "Tietê/SP", autor: "Prefeitura de Tietê", reu: "SERMAP", assunto: "Cobrança de IPTU", valorSentenca: 4181.68, status: "Pedido de suspensão por 180 dias (já transcorridos)", tipo: "execucao_fiscal", sistema: "esaj", perdaPrazo: false, observacoes: "SERMAP não localizada para citação. Juízo determinou pesquisa via SISBAJUD." },
    { numero: "0500844-32.2019.8.05.0080", orgao: "Vara Cível FSA", local: "Feira de Santana/BA", autor: "Terceiro", reu: "SERMAP", assunto: "Cobrança", valorSentenca: 45000, status: "Em andamento", tipo: "civel", sistema: "pje", perdaPrazo: false, observacoes: "Processo de cobrança em andamento." },
    { numero: "0500841-90.2019.8.05.0080", orgao: "Vara Cível FSA", local: "Feira de Santana/BA", autor: "Terceiro", reu: "SERMAP", assunto: "Cobrança", valorSentenca: 38000, status: "Em andamento", tipo: "civel", sistema: "pje", perdaPrazo: false, observacoes: "Processo de cobrança em andamento." },
    { numero: "0500846-02.2019.8.05.0080", orgao: "Vara Cível FSA", local: "Feira de Santana/BA", autor: "Terceiro", reu: "SERMAP", assunto: "Cobrança", valorSentenca: 52000, status: "Em andamento", tipo: "civel", sistema: "pje", perdaPrazo: false, observacoes: "Processo de cobrança em andamento." },
    { numero: "0500865-67.2019.8.05.0080", orgao: "Vara Cível FSA", local: "Feira de Santana/BA", autor: "Terceiro", reu: "SERMAP", assunto: "Cobrança", valorSentenca: 35000, status: "Em andamento", tipo: "civel", sistema: "pje", perdaPrazo: false, observacoes: "Processo de cobrança em andamento." },
    { numero: "1014804-78.2018.8.26.0016", orgao: "2ª Vara do Juizado Especial Cível", local: "São Paulo/SP", autor: "José Carlos Roque", reu: "Sheila", assunto: "Indenização por danos morais", valorSentenca: 2500, status: "Execução de Sentença - sem movimentação desde 2023", tipo: "civel", sistema: "esaj", perdaPrazo: false, observacoes: "Sentença procedente. Indenização por dano moral." },
    { numero: "0009684-66.2021.8.26.0016", orgao: "2ª Vara do Juizado Especial Cível", local: "São Paulo/SP", autor: "José Carlos Roque", reu: "Sheila", assunto: "Cumprimento de sentença proc. 1014804-78.2018.8.26.0016", valorSentenca: 4092, status: "Execução de Sentença - pedido de penhora de veículos", tipo: "civel", sistema: "esaj", perdaPrazo: false, observacoes: "Cumprimento de sentença do proc. 1014804-78.2018.8.26.0016." },
    { numero: "0500848-55.2020.8.05.0080", orgao: "Vara Cível FSA", local: "Feira de Santana/BA", autor: "Terceiro", reu: "SERMAP", assunto: "Indenização", valorSentenca: 25000, status: "Em andamento", tipo: "civel", sistema: "pje", perdaPrazo: false, observacoes: "Processo de indenização em andamento." },
    { numero: "0500849-40.2020.8.05.0080", orgao: "Vara Cível FSA", local: "Feira de Santana/BA", autor: "Terceiro", reu: "SERMAP", assunto: "Cobrança", valorSentenca: 18500, status: "Em andamento", tipo: "civel", sistema: "pje", perdaPrazo: false, observacoes: "Processo de cobrança em andamento." },
    { numero: "0500850-25.2020.8.05.0080", orgao: "Vara Cível FSA", local: "Feira de Santana/BA", autor: "Terceiro", reu: "SERMAP", assunto: "Cobrança", valorSentenca: 22000, status: "Em andamento", tipo: "civel", sistema: "pje", perdaPrazo: false, observacoes: "Processo de cobrança em andamento." },
    { numero: "0500851-10.2020.8.05.0080", orgao: "Vara Cível FSA", local: "Feira de Santana/BA", autor: "Terceiro", reu: "SERMAP", assunto: "Indenização por danos materiais", valorSentenca: 30000, status: "Em andamento", tipo: "civel", sistema: "pje", perdaPrazo: false, observacoes: "Processo de indenização em andamento." },
    { numero: "0500852-92.2020.8.05.0080", orgao: "Vara Cível FSA", local: "Feira de Santana/BA", autor: "Terceiro", reu: "SERMAP", assunto: "Cobrança", valorSentenca: 15000, status: "Em andamento", tipo: "civel", sistema: "pje", perdaPrazo: false, observacoes: "Processo de cobrança em andamento." },
    { numero: "0500853-77.2020.8.05.0080", orgao: "Vara Cível FSA", local: "Feira de Santana/BA", autor: "Terceiro", reu: "SERMAP", assunto: "Cobrança", valorSentenca: 19500, status: "Em andamento", tipo: "civel", sistema: "pje", perdaPrazo: false, observacoes: "Processo de cobrança em andamento." },
    { numero: "0500854-62.2020.8.05.0080", orgao: "Vara Cível FSA", local: "Feira de Santana/BA", autor: "Terceiro", reu: "SERMAP", assunto: "Indenização", valorSentenca: 28000, status: "Em andamento", tipo: "civel", sistema: "pje", perdaPrazo: false, observacoes: "Processo de indenização em andamento." },
    { numero: "0500855-47.2020.8.05.0080", orgao: "Vara Cível FSA", local: "Feira de Santana/BA", autor: "Terceiro", reu: "SERMAP", assunto: "Cobrança", valorSentenca: 16000, status: "Em andamento", tipo: "civel", sistema: "pje", perdaPrazo: false, observacoes: "Processo de cobrança em andamento." },
    { numero: "0500856-32.2020.8.05.0080", orgao: "Vara Cível FSA", local: "Feira de Santana/BA", autor: "Terceiro", reu: "SERMAP", assunto: "Cobrança", valorSentenca: 21000, status: "Em andamento", tipo: "civel", sistema: "pje", perdaPrazo: false, observacoes: "Processo de cobrança em andamento." },
    { numero: "1023456-78.2020.8.26.0100", orgao: "Vara Cível São Paulo", local: "São Paulo/SP", autor: "Terceiro", reu: "SERMAP", assunto: "Cobrança", valorSentenca: 80521.03, status: "Execução de sentença - perdas e danos", tipo: "civel", sistema: "esaj", perdaPrazo: false, observacoes: "Prazo para exequente informar se deseja converter ação em perdas e danos." },
    { numero: "1034567-89.2021.8.26.0100", orgao: "Vara Cível São Paulo", local: "São Paulo/SP", autor: "Terceiro", reu: "SERMAP", assunto: "Indenização", valorSentenca: 35000, status: "Em andamento", tipo: "civel", sistema: "esaj", perdaPrazo: false, observacoes: "Processo de indenização em andamento no eSAJ." },
  ];

  for (const p of civeis) {
    await run(
      `INSERT INTO processos (numero, tipo, sistema, orgao, local, autor, reu, assunto, valorSentenca, status, perdaPrazo, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.numero, p.tipo, p.sistema, p.orgao, p.local, p.autor, p.reu, p.assunto, p.valorSentenca, p.status, p.perdaPrazo ? 1 : 0, p.observacoes]
    );
  }
  console.log(`Inserted ${civeis.length} processos cíveis/tributários`);

  // === PASSIVO TRIBUTÁRIO ===
  await run(
    `INSERT INTO passivoTributario (inscricao, tipo, natureza, situacao, dataInscricao, orgao, receita, processoJudicial, valorTotal, valorPrincipal, valorMulta, valorJuros, valorEncargo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ["50 6 20 017185-30", "Contribuição Social", "TRIBUTÁRIA", "ATIVA AJUIZADA", "08/05/2020", "RFB - Receita Federal do Brasil", "1804 - DIV.ATIVA-CONTRIBUICAO SOCIAL", "1056834-34.2020.4.01.3300", 998932.17, 183310.15, 137482.62, 511650.71, 166488.69]
  );
  await run(
    `INSERT INTO passivoTributario (inscricao, tipo, natureza, situacao, dataInscricao, orgao, receita, processoJudicial, valorTotal, valorPrincipal, valorMulta, valorJuros, valorEncargo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ["50 2 20 005103-09", "IRPJ", "TRIBUTÁRIA", "ATIVA AJUIZADA", "08/05/2020", "RFB - Receita Federal do Brasil", "3551 - DIV.ATIVA-IRPJ", "1056834-34.2020.4.01.3300", 2828867.52, 519088.14, 389316.11, 1448985.35, 471477.92]
  );
  console.log("Inserted passivo tributário");

  // === SIMULAÇÕES ===
  await run(
    `INSERT INTO simulacoes (nome, edital, modalidade, totalSemDesconto, desconto, totalAPagar, prestacoes, valorEntrada, qtdEntrada, valorParcela, qtdParcelas, dataAdesao, viavel, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ["Opção 1 - Demais Débitos (120 prestações)", "PGDAU N 11/2025, Prorrogado pelo Edital PGDAU N 01/2026", "Demais Débitos - Demais Pessoas Jurídicas - Até 120 Prestações - Redução Até 65%", 3827799.69, 2338785.59, 1489014.10, 120, 38277.99, 6, 11046.89, 114, "29/05/2026", false, "Inclui todas as 6 dívidas. Inviável no momento atual da empresa."]
  );
  await run(
    `INSERT INTO simulacoes (nome, edital, modalidade, totalSemDesconto, desconto, totalAPagar, prestacoes, valorEntrada, qtdEntrada, valorParcela, qtdParcelas, dataAdesao, viavel, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ["Opção 2 - Demais Débitos (6 prestações)", "PGDAU N 11/2025, Prorrogado pelo Edital PGDAU N 01/2026", "Demais Débitos - Demais Pessoas Jurídicas - Redução Até 65% - Sem Entrada", 58056.57, 21814.90, 36241.67, 6, 0, 0, 6040.27, 6, "29/05/2026", false, "Apenas débitos menores. Parcelas de R$ 6.040,27."]
  );
  await run(
    `INSERT INTO simulacoes (nome, edital, modalidade, totalSemDesconto, desconto, totalAPagar, prestacoes, valorEntrada, qtdEntrada, valorParcela, qtdParcelas, dataAdesao, viavel, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ["Opção 1 - Previdenciário (60 meses)", "PGDAU N 11/2025, Prorrogado pelo Edital PGDAU N 01/2026", "Previdenciário - Demais Pessoas Jurídicas - Até 60 Meses - Redução Até 65%", 398621.04, 207253.10, 191367.94, 60, 3986.21, 6, 3100.93, 54, "29/05/2026", false, "Débitos previdenciários. Entrada 6x R$ 3.986,21 + 54x R$ 3.100,93."]
  );
  console.log("Inserted simulações");

  // === TIMELINE 90 DIAS ===
  const timeline = [
    { titulo: "Diagnóstico Inicial", descricao: "Levantamento completo de todos os processos, passivos e situação fiscal da empresa", dataInicio: "2026-02-20", dataFim: "2026-03-05", status: "em_andamento", ordem: 1 },
    { titulo: "Mapeamento de Riscos", descricao: "Identificação de processos críticos, prazos em aberto e riscos de penhora/bloqueio", dataInicio: "2026-03-01", dataFim: "2026-03-15", status: "em_andamento", ordem: 2 },
    { titulo: "Estratégia de Proteção Patrimonial", descricao: "Elaboração de estratégias para impedir que execuções atinjam bens pessoais da sócia", dataInicio: "2026-03-10", dataFim: "2026-03-25", status: "pendente", ordem: 3 },
    { titulo: "Gestão do Passivo Tributário", descricao: "Análise de viabilidade de transações, acordos individuais e negociações com procuradorias", dataInicio: "2026-03-15", dataFim: "2026-04-15", status: "pendente", ordem: 4 },
    { titulo: "Acompanhamento Processual", descricao: "Monitoramento contínuo de todas as movimentações processuais e cumprimento de prazos", dataInicio: "2026-02-20", dataFim: "2026-05-20", status: "em_andamento", ordem: 5 },
    { titulo: "Organização para Investidores", descricao: "Estruturação do cenário jurídico e fiscal para apresentação a potenciais investidores", dataInicio: "2026-04-01", dataFim: "2026-05-01", status: "pendente", ordem: 6 },
    { titulo: "Relatório Final e Transição", descricao: "Entrega do relatório consolidado com resultados alcançados e recomendações futuras", dataInicio: "2026-05-01", dataFim: "2026-05-20", status: "pendente", ordem: 7 },
  ];

  for (const t of timeline) {
    await run(
      `INSERT INTO timelineItems (titulo, descricao, dataInicio, dataFim, status, ordem) VALUES (?, ?, ?, ?, ?, ?)`,
      [t.titulo, t.descricao, t.dataInicio, t.dataFim, t.status, t.ordem]
    );
  }
  console.log("Inserted timeline items");

  // === NOTIFICAÇÕES INICIAIS ===
  await run(
    `INSERT INTO notificacoes (titulo, mensagem, tipo) VALUES (?, ?, ?)`,
    ["Plataforma Ativada", "A plataforma de gestão estratégica SERMAP foi ativada. Todos os processos foram cadastrados e o monitoramento está em andamento.", "info"]
  );
  await run(
    `INSERT INTO notificacoes (titulo, mensagem, tipo) VALUES (?, ?, ?)`,
    ["Hasta Pública Agendada - 03/03/2026", "O leilão do Centro de Operações está agendado para 03/03/2026. Processos vinculados: 0000141-18.2021.5.05.0196, 0000706-88.2018.5.19.0004.", "alerta"]
  );
  await run(
    `INSERT INTO notificacoes (titulo, mensagem, tipo) VALUES (?, ?, ?)`,
    ["Prazo de Adesão - Transação PGFN", "O prazo para adesão à transação tributária (Edital PGDAU N 01/2026) encerra em 29/05/2026.", "prazo"]
  );

  console.log("Seed completed successfully!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
