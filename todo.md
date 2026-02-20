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
- [x] Integração com API DataJud (consulta periódica via frontend polling)
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
