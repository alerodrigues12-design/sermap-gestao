import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";
dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

// Proposta 1 - Gestão de Processos Judiciais
const proposta1Html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Proposta de Prestação de Serviços - Gestão de Processos Judiciais</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; color: #2d2d2d; line-height: 1.7; background: #faf8f5; }
  .container { max-width: 800px; margin: 0 auto; padding: 40px 50px; background: white; }
  .header { text-align: center; border-bottom: 3px solid #4a5a3a; padding-bottom: 30px; margin-bottom: 35px; }
  .header img { height: 60px; margin-bottom: 15px; }
  .header h1 { font-family: 'Playfair Display', serif; font-size: 22px; color: #4a5a3a; font-weight: 700; letter-spacing: 0.5px; }
  .header .subtitle { font-size: 13px; color: #888; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px; }
  .section { margin-bottom: 28px; }
  .section h2 { font-family: 'Playfair Display', serif; font-size: 16px; color: #4a5a3a; border-left: 4px solid #c8956c; padding-left: 12px; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 1px; }
  .section p { font-size: 14px; text-align: justify; margin-bottom: 10px; }
  .parties { background: #f8f6f3; border-radius: 8px; padding: 20px; margin-bottom: 25px; }
  .parties .party { margin-bottom: 12px; }
  .parties .party-label { font-weight: 600; color: #4a5a3a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
  .parties .party-name { font-size: 14px; font-weight: 500; }
  .parties .party-detail { font-size: 12px; color: #666; }
  .clause { margin-bottom: 18px; }
  .clause-title { font-weight: 600; font-size: 14px; color: #333; margin-bottom: 6px; }
  .clause p { font-size: 13.5px; }
  .highlight-box { background: linear-gradient(135deg, #4a5a3a 0%, #5d7048 100%); color: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
  .highlight-box h3 { font-family: 'Playfair Display', serif; font-size: 15px; margin-bottom: 10px; }
  .highlight-box p { font-size: 13px; opacity: 0.95; }
  .signatures { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 20px; }
  .sig-block { text-align: center; width: 45%; }
  .sig-line { border-top: 1px solid #333; padding-top: 8px; margin-top: 50px; }
  .sig-name { font-weight: 600; font-size: 13px; }
  .sig-detail { font-size: 11px; color: #666; }
  .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 11px; color: #999; }
  .date-location { text-align: right; font-size: 13px; color: #666; margin-bottom: 25px; }
  ol { padding-left: 20px; }
  ol li { font-size: 13.5px; margin-bottom: 8px; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>PROPOSTA DE PRESTAÇÃO DE SERVIÇOS</h1>
    <div class="subtitle">Gestão Estratégica de Processos Judiciais</div>
  </div>

  <div class="date-location">
    Salvador/BA, 20 de fevereiro de 2026.
  </div>

  <div class="parties">
    <div class="party">
      <div class="party-label">Contratante</div>
      <div class="party-name">SERMAP ENGENHARIA LTDA</div>
      <div class="party-detail">CNPJ: 34.060.681/0001-03</div>
      <div class="party-detail">Representada por sua sócia-administradora, Sra. Sheila</div>
    </div>
    <div class="party" style="margin-bottom:0">
      <div class="party-label">Contratada</div>
      <div class="party-name">ALESSANDRA CONSULTORIA ESTRATÉGICA LTDA</div>
      <div class="party-detail">CNPJ: 61.416.957/0001-08</div>
      <div class="party-detail">Representada por Alessandra Hoffmann — Consultora Tributária Estratégica</div>
    </div>
  </div>

  <div class="section">
    <h2>1. Do Objeto</h2>
    <div class="clause">
      <p>A presente proposta tem por objeto a prestação de serviços de <strong>gestão estratégica e acompanhamento dos processos judiciais</strong> em trâmite perante os diversos tribunais do país, envolvendo a SERMAP ENGENHARIA LTDA como parte, pelo prazo de <strong>90 (noventa) dias</strong>, contados a partir da assinatura do respectivo contrato.</p>
    </div>
  </div>

  <div class="section">
    <h2>2. Do Escopo dos Serviços</h2>
    <div class="clause">
      <p>A CONTRATADA se compromete a realizar os seguintes serviços:</p>
      <ol>
        <li><strong>Acompanhamento processual completo</strong> de todos os processos judiciais da SERMAP, incluindo processos trabalhistas, cíveis e de execução fiscal, mediante monitoramento contínuo das movimentações processuais nos sistemas PJe e eSAJ;</li>
        <li><strong>Elaboração de estratégias processuais</strong> para cada caso, com análise de risco, prognóstico e definição de linhas de atuação;</li>
        <li><strong>Elaboração de petições e peças processuais</strong> necessárias à defesa dos interesses da SERMAP, as quais serão assinadas por profissional habilitado(a) indicado(a) pela Sra. Sheila ou, na falta desta indicação, por profissional indicado(a) pela CONTRATADA;</li>
        <li><strong>Relatórios periódicos</strong> de acompanhamento, com atualização de status, movimentações relevantes e recomendações estratégicas, disponibilizados em plataforma digital exclusiva;</li>
        <li><strong>Gestão de prazos e alertas</strong>, com sistema automatizado de monitoramento para evitar perdas de prazo e garantir a tempestividade das manifestações processuais.</li>
      </ol>
    </div>
  </div>

  <div class="section">
    <h2>3. Das Condições de Execução</h2>
    <div class="clause">
      <p><strong>3.1.</strong> As petições elaboradas pela CONTRATADA serão assinadas por advogado(a) regularmente inscrito(a) na OAB, indicado(a) preferencialmente pela CONTRATANTE. Na ausência de indicação, a CONTRATADA indicará profissional de sua confiança para a subscrição das peças.</p>
      <p><strong>3.2.</strong> Eventuais custos processuais, incluindo custas judiciais, honorários periciais, diligências e demais despesas inerentes ao andamento dos processos, serão de responsabilidade da CONTRATANTE (SERMAP ENGENHARIA LTDA).</p>
      <p><strong>3.3.</strong> A CONTRATADA se compromete a buscar soluções que <strong>não comprometam o caixa pessoal</strong> da Sra. Sheila, priorizando estratégias que minimizem desembolsos imediatos e que sejam compatíveis com a realidade financeira atual da empresa.</p>
    </div>
  </div>

  <div class="highlight-box">
    <h3>4. Da Contrapartida</h3>
    <p>Em razão do comprometimento da CONTRATADA com a reestruturação e gestão estratégica dos processos judiciais da SERMAP, e considerando o caráter colaborativo desta parceria, a contrapartida pelos serviços prestados será a <strong>indicação, pela Sra. Sheila, de no mínimo 04 (quatro) potenciais clientes</strong> para atendimento de consultoria pela CONTRATADA, preferencialmente empresas com passivo tributário ou necessidade de planejamento tributário.</p>
    <p style="margin-top: 10px;">As indicações deverão ser realizadas ao longo do período de vigência do contrato ou em até 30 (trinta) dias após seu encerramento.</p>
  </div>

  <div class="section">
    <h2>5. Do Prazo</h2>
    <div class="clause">
      <p>O presente contrato terá vigência de <strong>90 (noventa) dias</strong>, podendo ser prorrogado por igual período mediante acordo entre as partes, formalizado por escrito.</p>
    </div>
  </div>

  <div class="section">
    <h2>6. Da Confidencialidade</h2>
    <div class="clause">
      <p>As partes se comprometem a manter sigilo absoluto sobre todas as informações obtidas em razão da execução dos serviços objeto desta proposta, incluindo dados processuais, financeiros, estratégicos e quaisquer outros que venham a ter conhecimento, sob pena de responsabilização civil e criminal.</p>
    </div>
  </div>

  <div class="section">
    <h2>7. Da Rescisão</h2>
    <div class="clause">
      <p>O contrato poderá ser rescindido por qualquer das partes, mediante comunicação por escrito com antecedência mínima de 15 (quinze) dias, sem ônus para a parte que rescindir, ressalvadas as obrigações já assumidas até a data da rescisão.</p>
    </div>
  </div>

  <div class="section">
    <h2>8. Das Disposições Gerais</h2>
    <div class="clause">
      <p><strong>8.1.</strong> A CONTRATADA atuará com total independência técnica na condução das estratégias processuais, submetendo à CONTRATANTE as decisões que envolvam riscos relevantes ou desembolsos financeiros.</p>
      <p><strong>8.2.</strong> Fica eleito o foro da Comarca de Salvador/BA para dirimir quaisquer controvérsias oriundas da presente proposta.</p>
    </div>
  </div>

  <div class="signatures">
    <div class="sig-block">
      <div class="sig-line">
        <div class="sig-name">SERMAP ENGENHARIA LTDA</div>
        <div class="sig-detail">CNPJ: 34.060.681/0001-03</div>
        <div class="sig-detail">Sra. Sheila — Sócia-Administradora</div>
      </div>
    </div>
    <div class="sig-block">
      <div class="sig-line">
        <div class="sig-name">ALESSANDRA CONSULTORIA ESTRATÉGICA LTDA</div>
        <div class="sig-detail">CNPJ: 61.416.957/0001-08</div>
        <div class="sig-detail">Alessandra Hoffmann — Consultora</div>
      </div>
    </div>
  </div>

  <div class="footer">
    Alessandra Hoffmann — Consultoria Estratégica | CNPJ 61.416.957/0001-08 | (11) 97127-1806
  </div>
</div>
</body>
</html>`;

// Proposta 2 - Gestão do Passivo Tributário
const proposta2Html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Proposta de Prestação de Serviços - Gestão do Passivo Tributário</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; color: #2d2d2d; line-height: 1.7; background: #faf8f5; }
  .container { max-width: 800px; margin: 0 auto; padding: 40px 50px; background: white; }
  .header { text-align: center; border-bottom: 3px solid #4a5a3a; padding-bottom: 30px; margin-bottom: 35px; }
  .header h1 { font-family: 'Playfair Display', serif; font-size: 22px; color: #4a5a3a; font-weight: 700; letter-spacing: 0.5px; }
  .header .subtitle { font-size: 13px; color: #888; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px; }
  .section { margin-bottom: 28px; }
  .section h2 { font-family: 'Playfair Display', serif; font-size: 16px; color: #4a5a3a; border-left: 4px solid #c8956c; padding-left: 12px; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 1px; }
  .section p { font-size: 14px; text-align: justify; margin-bottom: 10px; }
  .parties { background: #f8f6f3; border-radius: 8px; padding: 20px; margin-bottom: 25px; }
  .parties .party { margin-bottom: 12px; }
  .parties .party-label { font-weight: 600; color: #4a5a3a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
  .parties .party-name { font-size: 14px; font-weight: 500; }
  .parties .party-detail { font-size: 12px; color: #666; }
  .clause { margin-bottom: 18px; }
  .clause p { font-size: 13.5px; }
  .value-table { width: 100%; border-collapse: collapse; margin: 15px 0; border-radius: 8px; overflow: hidden; }
  .value-table th { background: #4a5a3a; color: white; padding: 10px 15px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  .value-table td { padding: 10px 15px; border-bottom: 1px solid #eee; font-size: 13px; }
  .value-table tr:last-child td { border-bottom: none; }
  .value-table .total-row { background: #f8f6f3; font-weight: 600; }
  .highlight-box { background: linear-gradient(135deg, #4a5a3a 0%, #5d7048 100%); color: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
  .highlight-box h3 { font-family: 'Playfair Display', serif; font-size: 15px; margin-bottom: 10px; }
  .highlight-box p { font-size: 13px; opacity: 0.95; margin-bottom: 8px; }
  .fee-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
  .fee-card { background: rgba(255,255,255,0.15); border-radius: 8px; padding: 15px; border: 1px solid rgba(255,255,255,0.2); }
  .fee-card .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
  .fee-card .value { font-size: 18px; font-weight: 700; margin-top: 4px; }
  .fee-card .desc { font-size: 11px; opacity: 0.7; margin-top: 4px; }
  .signatures { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 20px; }
  .sig-block { text-align: center; width: 45%; }
  .sig-line { border-top: 1px solid #333; padding-top: 8px; margin-top: 50px; }
  .sig-name { font-weight: 600; font-size: 13px; }
  .sig-detail { font-size: 11px; color: #666; }
  .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 11px; color: #999; }
  .date-location { text-align: right; font-size: 13px; color: #666; margin-bottom: 25px; }
  .note-box { background: #fff8f0; border: 1px solid #f0d8b8; border-radius: 8px; padding: 15px; margin: 15px 0; }
  .note-box p { font-size: 12.5px; color: #8b6914; }
  ol { padding-left: 20px; }
  ol li { font-size: 13.5px; margin-bottom: 8px; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>PROPOSTA DE PRESTAÇÃO DE SERVIÇOS</h1>
    <div class="subtitle">Gestão Estratégica do Passivo Tributário Federal</div>
  </div>

  <div class="date-location">
    Salvador/BA, 20 de fevereiro de 2026.
  </div>

  <div class="parties">
    <div class="party">
      <div class="party-label">Contratante</div>
      <div class="party-name">SERMAP ENGENHARIA LTDA</div>
      <div class="party-detail">CNPJ: 34.060.681/0001-03</div>
      <div class="party-detail">Representada por sua sócia-administradora, Sra. Sheila</div>
    </div>
    <div class="party" style="margin-bottom:0">
      <div class="party-label">Contratada</div>
      <div class="party-name">ALESSANDRA CONSULTORIA ESTRATÉGICA LTDA</div>
      <div class="party-detail">CNPJ: 61.416.957/0001-08</div>
      <div class="party-detail">Representada por Alessandra Hoffmann — Consultora Tributária Estratégica</div>
    </div>
  </div>

  <div class="section">
    <h2>1. Do Objeto</h2>
    <div class="clause">
      <p>A presente proposta tem por objeto a prestação de serviços de <strong>gestão estratégica do passivo tributário federal</strong> da SERMAP ENGENHARIA LTDA junto à Procuradoria-Geral da Fazenda Nacional (PGFN), incluindo o acompanhamento das inscrições em dívida ativa, análise de viabilidade de transações tributárias, negociações diretas e elaboração de estratégias para redução do passivo.</p>
    </div>
  </div>

  <div class="section">
    <h2>2. Do Passivo Tributário Atual</h2>
    <div class="clause">
      <p>A SERMAP ENGENHARIA LTDA possui atualmente o seguinte passivo tributário federal inscrito na Dívida Ativa da União, vinculado ao processo de execução fiscal nº 1056834-34.2020.4.01.3300 (8ª Vara Federal de Salvador/BA):</p>
    </div>

    <table class="value-table">
      <thead>
        <tr>
          <th>Inscrição</th>
          <th>Tributo</th>
          <th>Valor Consolidado</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>50 6 20 017185-30</td>
          <td>CSLL — Contribuição Social sobre o Lucro Líquido</td>
          <td>R$ 998.932,17</td>
        </tr>
        <tr>
          <td>50 2 20 005103-09</td>
          <td>IRPJ — Imposto de Renda Pessoa Jurídica</td>
          <td>R$ 2.828.867,52</td>
        </tr>
        <tr class="total-row">
          <td colspan="2"><strong>TOTAL DO PASSIVO FEDERAL</strong></td>
          <td><strong>R$ 3.827.799,69</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="note-box">
      <p><strong>Nota:</strong> Os valores acima incluem principal, multa, juros e encargos legais, conforme consolidação da PGFN. Ambas as inscrições referem-se a débitos de IRPJ e CSLL relativos ao exercício de 2007.</p>
    </div>
  </div>

  <div class="section">
    <h2>3. Do Escopo dos Serviços</h2>
    <div class="clause">
      <p>A CONTRATADA se compromete a realizar os seguintes serviços:</p>
      <ol>
        <li><strong>Análise detalhada do passivo tributário</strong>, incluindo verificação de prescrição, decadência, legalidade dos encargos e possibilidade de revisão dos valores inscritos;</li>
        <li><strong>Acompanhamento das execuções fiscais</strong> em trâmite, com monitoramento de movimentações e elaboração de estratégias defensivas para proteção patrimonial;</li>
        <li><strong>Gestão de negociações</strong> com a PGFN, incluindo análise de editais de transação, simulações de parcelamento e negociação direta quando viável;</li>
        <li><strong>Elaboração de estratégias de redução do passivo</strong>, incluindo teses jurídicas aplicáveis, pedidos de revisão administrativa e eventuais medidas judiciais;</li>
        <li><strong>Proteção patrimonial</strong>, com atuação preventiva para impedir que as execuções fiscais atinjam os bens pessoais da Sra. Sheila e os ativos remanescentes da empresa;</li>
        <li><strong>Relatórios periódicos</strong> com atualização do cenário tributário, valores atualizados e recomendações estratégicas.</li>
      </ol>
    </div>
  </div>

  <div class="highlight-box">
    <h3>4. Dos Honorários</h3>
    <p>Os honorários pela prestação dos serviços descritos nesta proposta serão calculados conforme as seguintes condições:</p>
    
    <div class="fee-grid">
      <div class="fee-card">
        <div class="label">Êxito na Redução</div>
        <div class="value">10%</div>
        <div class="desc">Sobre o valor efetivamente reduzido do passivo, quando obtido por meio de negociação direta com a PGFN, tese jurídica aceita ou qualquer estratégia conduzida pela CONTRATADA.</div>
      </div>
      <div class="fee-card">
        <div class="label">Honorário Mínimo</div>
        <div class="value">R$ 12.000</div>
        <div class="desc">Caso ao final do período contratado não haja nenhuma redução efetiva do passivo, o valor devido pelos serviços de gestão será de R$ 12.000,00 (doze mil reais).</div>
      </div>
    </div>

    <p><strong>Observação importante:</strong> Reduções obtidas exclusivamente por meio de transação tributária via sistema Regularize da PGFN (editais de transação por adesão), cujos descontos são automaticamente calculados pelo sistema sem trabalho efetivo da CONTRATADA, <strong>não geram direito a honorários de êxito</strong>. Os honorários de 10% incidem apenas sobre reduções obtidas por negociação direta, acordo individual com a Procuradoria, ou aceitação de tese jurídica elaborada pela CONTRATADA.</p>
  </div>

  <div class="section">
    <h2>5. Das Condições de Pagamento</h2>
    <div class="clause">
      <p><strong>5.1.</strong> Os honorários de êxito (10% do valor reduzido) serão devidos no momento da efetiva homologação da redução, podendo ser parcelados em até 3 (três) vezes, conforme acordo entre as partes.</p>
      <p><strong>5.2.</strong> O honorário mínimo de R$ 12.000,00 (doze mil reais), caso aplicável, será devido ao término do período contratado, podendo ser parcelado em até 4 (quatro) vezes mensais.</p>
      <p><strong>5.3.</strong> Os valores serão pagos mediante emissão de Nota Fiscal pela CONTRATADA.</p>
    </div>
  </div>

  <div class="section">
    <h2>6. Do Prazo</h2>
    <div class="clause">
      <p>A presente proposta tem vigência vinculada ao contrato de gestão de processos judiciais, com prazo inicial de <strong>90 (noventa) dias</strong>, podendo ser prorrogado por acordo entre as partes. A gestão do passivo tributário poderá demandar prazo superior, conforme a complexidade das negociações e estratégias adotadas.</p>
    </div>
  </div>

  <div class="section">
    <h2>7. Da Confidencialidade</h2>
    <div class="clause">
      <p>As partes se comprometem a manter sigilo absoluto sobre todas as informações obtidas em razão da execução dos serviços objeto desta proposta, incluindo dados tributários, financeiros, estratégicos e quaisquer outros que venham a ter conhecimento.</p>
    </div>
  </div>

  <div class="section">
    <h2>8. Das Disposições Gerais</h2>
    <div class="clause">
      <p><strong>8.1.</strong> A CONTRATADA atuará com total independência técnica na condução das estratégias tributárias, submetendo à CONTRATANTE as decisões que envolvam riscos relevantes ou compromissos financeiros.</p>
      <p><strong>8.2.</strong> Eventuais custos com certidões, cópias, diligências e demais despesas administrativas serão de responsabilidade da CONTRATANTE.</p>
      <p><strong>8.3.</strong> Fica eleito o foro da Comarca de Salvador/BA para dirimir quaisquer controvérsias oriundas da presente proposta.</p>
    </div>
  </div>

  <div class="signatures">
    <div class="sig-block">
      <div class="sig-line">
        <div class="sig-name">SERMAP ENGENHARIA LTDA</div>
        <div class="sig-detail">CNPJ: 34.060.681/0001-03</div>
        <div class="sig-detail">Sra. Sheila — Sócia-Administradora</div>
      </div>
    </div>
    <div class="sig-block">
      <div class="sig-line">
        <div class="sig-name">ALESSANDRA CONSULTORIA ESTRATÉGICA LTDA</div>
        <div class="sig-detail">CNPJ: 61.416.957/0001-08</div>
        <div class="sig-detail">Alessandra Hoffmann — Consultora</div>
      </div>
    </div>
  </div>

  <div class="footer">
    Alessandra Hoffmann — Consultoria Estratégica | CNPJ 61.416.957/0001-08 | (11) 97127-1806
  </div>
</div>
</body>
</html>`;

async function main() {
  try {
    // Insert Proposta 1 as document
    await db.execute(sql`INSERT INTO documentos (titulo, descricao, categoria, confidencial, fileUrl, fileKey) VALUES (
      'Proposta — Gestão de Processos Judiciais',
      'Proposta de prestação de serviços para gestão estratégica dos processos judiciais da SERMAP, incluindo acompanhamento, petições e estratégias. Contrapartida: indicação de 4 clientes.',
      'contrato',
      true,
      NULL,
      'proposta-processos-judiciais'
    )`);
    console.log("✅ Proposta 1 (Processos Judiciais) inserida");

    // Insert Proposta 2 as document
    await db.execute(sql`INSERT INTO documentos (titulo, descricao, categoria, confidencial, fileUrl, fileKey) VALUES (
      'Proposta — Gestão do Passivo Tributário PGFN',
      'Proposta de prestação de serviços para gestão estratégica do passivo tributário federal (PGFN) da SERMAP. Honorários: 10% do valor reduzido ou R$ 12.000 mínimo.',
      'honorarios',
      true,
      NULL,
      'proposta-passivo-tributario'
    )`);
    console.log("✅ Proposta 2 (Passivo Tributário) inserida");

    console.log("\n✅ Ambas as propostas inseridas como documentos confidenciais!");
    process.exit(0);
  } catch (err) {
    console.error("Erro:", err);
    process.exit(1);
  }
}

main();
