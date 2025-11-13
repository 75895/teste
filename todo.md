# Silvess - Restaurant Management System - TODO

## Fase 1: Design de Ativos Visuais
- [x] Criar ícone com logo dourada e fundo preto
- [x] Definir paleta de cores e design system

## Fase 2: Arquitetura e Estrutura de Dados
- [x] Definir schema de banco de dados completo
- [x] Criar tabelas de usuários com roles (admin, operador, garçom)
- [x] Criar tabelas de produtos e categorias
- [x] Criar tabelas de pedidos e itens de pedido
- [x] Criar tabelas de mesas e status
- [x] Criar tabelas de estoque e movimentações
- [x] Criar tabelas de clientes e histórico
- [x] Criar tabelas de caixa e fechamentos
- [x] Criar tabelas de fornecedores e compras
- [x] Criar tabelas de promoções e descontos
- [x] Criar tabelas de documentos fiscais
- [x] Criar tabelas de auditoria e logs
- [x] Criar tabelas de integração iFood
- [x] Definir relacionamentos entre tabelas
- [x] Executar migrações do banco de dados
- [x] Criar helpers de banco de dados
- [x] Criar procedimentos tRPC básicos

## Fase 3: Integração iFood e Módulo de Pedidos
- [x] Criar módulo de integração com iFood (server/ifood.ts)
- [x] Implementar OAuth com iFood
- [x] Criar funções para processar pedidos do iFood
- [x] Implementar atualização de status de pedidos
- [x] Criar função para sincronizar menu
- [ ] Criar endpoints tRPC para iFood
- [ ] Criar interface para visualizar pedidos iFood
- [ ] Implementar webhook para receber pedidos iFood

## Fase 4: Módulos de Gerenciamento
- [x] Desenvolver módulo de PDV (Ponto de Venda)
- [x] Implementar busca de produtos por código/nome
- [ ] Implementar leitor de código de barras
- [x] Implementar múltiplos meios de pagamento (dinheiro, cartão, PIX)
- [ ] Desenvolver módulo de controle de estoque
- [ ] Implementar baixa automática de estoque por venda
- [ ] Implementar contagem cíclica e ajustes
- [x] Desenvolver módulo de cardápio
- [x] Implementar categorias de produtos
- [x] Implementar preços e promoções
- [ ] Desenvolver módulo financeiro
- [ ] Implementar fluxo de caixa
- [ ] Implementar contas a pagar e receber
- [x] Implementar relatórios financeiros
- [ ] Desenvolver módulo de gestão de funcionários
- [x] Implementar permissões por perfil
- [x] Implementar auditoria de ações
- [ ] Desenvolver módulo de clientes
- [ ] Implementar histórico de compras
- [ ] Implementar programa de fidelidade
- [ ] Desenvolver módulo de fornecedores
- [ ] Implementar pedidos de compra
- [ ] Implementar recebimento de mercadorias

## Fase 5: Controle de Acesso e Interface Mobile
- [x] Implementar sistema de roles (admin, operador, garçom)
- [x] Implementar autenticação e autorização
- [x] Criar dashboard para administrador
- [x] Criar interface para operador de caixa
- [x] Criar interface mobile para garçom
- [x] Implementar visualização de mesas
- [x] Implementar abertura de mesas
- [x] Implementar lançamento de pedidos por mesa
- [x] Implementar responsividade para mobile
- [ ] Implementar modo offline para garçom
- [ ] Sincronizar dados quando voltar online

## Fase 6: Funcionalidades Adicionais
- [ ] Implementar emissão de NFC-e/cupom fiscal
- [ ] Implementar integração com impressora térmica
- [ ] Implementar integração com balança
- [ ] Implementar relatórios e dashboards
- [ ] Implementar exportação de dados (CSV/PDF)
- [ ] Implementar backup automático
- [ ] Implementar logs centralizados
- [ ] Implementar 2FA opcional
- [ ] Implementar operação offline com sincronização

## Fase 7: Documentação e Testes
- [ ] Documentar API REST
- [ ] Documentar manual de uso
- [ ] Documentar guia de instalação
- [ ] Criar testes unitários
- [ ] Criar testes de integração
- [ ] Criar testes E2E
- [ ] Testar performance
- [ ] Testar segurança

## Fase 8: Deploy e Entrega
- [ ] Containerizar com Docker
- [ ] Configurar CI/CD
- [ ] Fazer deploy em produção
- [ ] Criar documentação final
- [ ] Entregar ícone e software ao usuário


## Bugs Encontrados
- [x] Dashboard com design feio - precisa melhorar visual
- [x] PDV inacessível - problema de navegação
- [x] Corrigir sidebar do DashboardLayout
- [x] Melhorar responsividade mobile
- [x] Conectar botões de ação do dashboard às rotas corretas
- [x] Botões de ação do dashboard agora funcionam corretamente
- [x] Melhorar design da página de Relatórios (gráficos, tabelas, filtros avançados)
- [x] Implementar funcionalidade completa de Mesas (abrir, fechar, lançar comanda, observações)
- [x] Criar dados de teste (mesas, produtos, restaurante)
- [x] Criar aba de Ficha Técnica com gramatura/medida
- [x] Implementar controle automático de estoque por gramatura
- [x] Criar interface para editar fichas técnicas


## Fase 6: Sistema de Almoxarifado Completo
- [x] Criar tabelas de almoxarifado e centros de custo no banco
- [x] Implementar Almoxarifado Central
- [x] Implementar Centros de Custo (Restaurante SS, Cozinha SS)
- [x] Criar aba de entrada de produtos no almoxarifado
- [x] Criar aba de requisições entre centros de custo
- [x] Implementar controle de acesso para requisições (apenas admin)
- [x] Criar aba de edição de produtos e insumos
- [x] Implementar produtos feitos na casa (Molhos, preparos, etc)
- [x] Criar aba de insumos 1:1 (bebidas, etc)
- [ ] Integrar baixa automática de estoque quando item é vendido
- [x] Criar dashboard de requisições para admin
- [x] Implementar rastreamento de movimentações de estoque
- [ ] Criar relatórios de entrada/saída por centro de custo

## Fase 7: Correções e Melhorias de Produtos/Insumos
- [x] Corrigir criação de produtos com código começando em 2000
- [x] Corrigir criação de insumos com código começando em 1000 e em CAIXA ALTA
- [x] Adicionar busca por código e descrição em todas as páginas de produtos/insumos
- [x] Integrar baixa automática de estoque quando pedido é finalizado
