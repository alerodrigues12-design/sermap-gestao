# SERMAP Gestão Estratégica - TODO

## Infraestrutura
- [x] Schema do banco de dados (processos, movimentações, documentos, notificações)
- [x] Identidade visual (cores, fontes, logos)
- [x] Estrutura de navegação com DashboardLayout

## Backend
- [x] Routers tRPC para processos trabalhistas
- [x] Routers tRPC para processos cíveis/tributários
- [x] Routers tRPC para módulo tributário (passivo PGFN)
- [x] Routers tRPC para documentos confidenciais
- [x] Routers tRPC para notificações
- [x] Routers tRPC para dashboard (resumos e totalizadores)
- [x] Seed de dados dos 46 processos da planilha
- [x] Integração com API DataJud (consulta periódica)
- [x] Sistema de controle de acesso (admin vs conselheiro)

## Frontend - Dashboard
- [x] Visão geral do passivo total (trabalhista + tributário + cível)
- [x] Gráficos de distribuição por tipo de processo
- [x] Status críticos em destaque
- [x] Timeline horizontal dos 90 dias de gestão
- [x] Badge/contador de novas movimentações

## Frontend - Processos Trabalhistas
- [x] Tabela com 20 processos do PJe
- [x] Filtros por local/status
- [x] Destaque visual vermelho/laranja para perda de prazo
- [x] Valores de condenação totalizados

## Frontend - Processos Cíveis/Tributários
- [x] Tabela com 26 processos (PJe e eSAJ)
- [x] Filtros por tribunal/tipo/status
- [x] Indicação clara de processos eSAJ de São Paulo
- [x] Valores totalizados

## Frontend - Módulo Tributário
- [x] Passivo federal PGFN (R$ 3.827.799,69)
- [x] Simulações de transação (Opção 1 e 2)
- [x] Detalhamento por inscrição (principal, multa, juros, encargos)
- [x] Gráficos visuais do passivo

## Frontend - Seção Investidores
- [x] Apresentação da situação atual
- [x] Plano de ação dos 90 dias
- [x] Organização do passivo como diferencial

## Frontend - Documentos Confidenciais
- [x] Seção protegida (apenas admin)
- [x] Upload/visualização de documentos
- [x] Bloqueio para conselheiros

## Frontend - Notificações
- [x] Sistema de alertas de movimentações DataJud
- [x] Histórico de alertas com data/hora/processo

## Identidade Visual
- [x] Logos SERMAP e Alessandra Hoffmann
- [x] Paleta profissional (laranja SERMAP + verde oliva Ale)
- [x] Design responsivo e moderno

## Testes
- [x] Testes unitários das rotas principais (20 testes passando)

## Login com Usuário/Senha
- [x] Substituir OAuth por login com usuário e senha próprio
- [x] Criar tela de login com campos de usuário e senha
- [x] Implementar autenticação no backend com JWT
- [x] Criar credenciais padrão (admin para Sheila/Ale, conselheiro para demais)
- [x] Senha adicional para acessar seção de Documentos Confidenciais
- [x] Testes unitários do novo sistema de autenticação

## Pendências e Recados
- [x] Criar tabela de recados/pendências no banco de dados
- [x] Criar endpoints tRPC para CRUD de recados
- [x] Criar página de Pendências e Recados no frontend
- [x] Adicionar navegação na sidebar para a nova seção
- [x] Testes vitest para os novos endpoints

## Propostas Formais
- [x] Redigir Proposta 1: Gestão de Processos Judiciais
- [x] Redigir Proposta 2: Gestão do Passivo Tributário
- [x] Incluir propostas como documentos confidenciais no site
- [x] Testar visualização das propostas na seção de documentos

## Ativação API DataJud e Monitoramento Automático
- [x] Implementar sistema de monitoramento DataJud no servidor
- [x] Job de monitoramento rodando a cada 30 minutos
- [x] Consulta periódica de todos os 46 processos
- [x] Detecção de novas movimentações e salvamento no banco
- [x] Sistema de notificações automáticas no site
- [x] Página de status do DataJud com instruções
- [ ] PENDENTE: Obter API Key correta do CNJ (https://datajud-wiki.cnj.jus.br/api-publica/acesso/) e ativar

## Ajustes - Remoção de Duplicação de Passivo
- [x] Remover 2 execuções fiscais (PGFN judicializadas) do total de cíveis
- [x] Atualizar total de cíveis de R$ 3.913.342,36 para R$ 579.152,07
- [x] Atualizar passivo total geral

## Integração de Débitos Não Transferidos para PGFN
- [x] Extrair valores dos PDFs de débitos previdenciários (R$ 398.621,04)
- [x] Extrair valores dos PDFs de débitos não tributários (R$ 58.056,57)
- [x] Calcular novo total do passivo tributário consolidado (R$ 4.284.477,30)
- [x] Atualizar página de Passivo Tributário com composição detalhada
- [x] Adicionar 4 PDFs como documentos confidenciais para referência
- [x] Documentar que estes valores ainda não foram transferidos para PGFN

## Seção de E-mails Importantes
- [x] Criar tabela de e-mails no banco de dados
- [x] Criar endpoints tRPC para CRUD de e-mails
- [x] Criar página de E-mails Importantes no frontend
- [x] Integrar e-mails aos Documentos Confidenciais
- [x] Adicionar filtros por remetente, data e assunto
- [x] Implementar visualização inline de e-mails
- [x] Testes unitários para os novos endpoints (7 testes passando)


## Processos Adicionados
- [x] Processo urgente 0500008-92.2019.8.05.0080 (4ª Vara Cível de Feira de Santana - BA) - Risco Alto


## Sincronização de Processos da Lista Excel
- [x] Todos os 26 processos da lista Excel inseridos no banco de dados
- [x] Processos com risco alto marcados como "grave" (direcionamento à Sheila)
- [x] Informações completas incluídas: número, órgão, autor, réu, assunto, observações, valor, status
- [x] Dashboard atualizado com novos totais: 22 trabalhistas, 39 cíveis/tributários
- [x] Passivo total estimado recalculado: R$ 6.932.861,39


## Correções e Destaque Visual
- [x] Corrigidas informações do processo 0500008-92.2019.8.05.0080 (Banco do Brasil vs Sermap/Sheila)
- [x] Valor atualizado para R$ 607.786,48
- [x] Implementado destaque visual (fundo vermelho) para processos com direcionamento à Sheila
- [x] Ícone de alerta em vermelho para processos graves
- [x] Passivo total recalculado: R$ 8.123.434,35

- [x] Removida duplicação do processo 0500008-92.2019.8.05.0080
- [x] Passivo total corrigido: R$ 7.515.647,87


## Plano de Ação
- [ ] Criar página de Plano de Ação com status de entregas
- [ ] Integrar ao dashboard e menu lateral

- [x] Página de Plano de Ação criada e integrada ao menu
- [x] Parte 1 - Levantamento Completo de Passivo marcada como concluída
- [x] Data prevista: 15/02/2026
- [x] Data finalizada: 24/02/2026
- [x] Responsável: Alessandra Hoffmann
- [x] Percentual de conclusão: 100%

## NDA Preenchível- [x] Criar página NDA com campos preenchiíveis e geração de PDF
- [x] Integrar ao menu lateral e rotas
