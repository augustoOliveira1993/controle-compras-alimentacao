# Implementation Plan: Controle de Compras Domésticas

**Branch**: 001-controle-compras-domesticas | **Date**: 2026-11-24 | **Spec**: [spec.md](spec.md)

**Input**: Especificação funcional do sistema de compras, estoque residencial e orçamento do cartão alimentação.

## Summary

Planejar um monólito modular em monorepo pnpm, com Next.js App Router como interface e NestJS como API REST. MongoDB/Mongoose guarda catálogo, conferências, estoque, listas, compras, preços, períodos e movimentos financeiros. A finalização de uma compra é uma única transação que atualiza compra, saldo do cartão, estoque, observações de preço e auditoria. Dinheiro usa inteiros em centavos; quantidades fracionadas usam Decimal128 e unidade-base compatível. As sugestões iniciais são determinísticas, explicáveis e baseadas apenas em histórico confirmado.

A aplicação começa como uma instalação para um único domicílio e uma pessoa proprietária. O desenho mantém fronteiras de integração para futura leitura de notas fiscais, voz e IA, sem exigir serviços externos no MVP. O planejamento termina em revisão e aprovação; nenhum código de aplicação ou tarefa de implementação é iniciado neste comando.

## Technical Context

**Language/Version**: TypeScript 6.x em modo estrito; Node.js 24 LTS. Versões exatas fixadas no lockfile após aprovação.

**Primary Dependencies**: pnpm workspaces; Next.js 16.x App Router; React; Tailwind CSS; shadcn/ui; TanStack Query; React Hook Form; Zod; Recharts; NestJS 12.x; Mongoose 9.x; decimal.js; @nestjs/swagger; class-validator; class-transformer; Jest; React Testing Library; Supertest; Playwright.

**Storage**: MongoDB 8.x em replica set. Docker Compose local usa replica set de nó único; implantação com requisito de disponibilidade usa replica set apropriado.

**Testing**: Jest para testes unitários, integração e componentes; Supertest para contratos HTTP; Playwright para E2E; MongoDB real em replica set para provar transações.

**Target Platform**: Navegadores atuais em celular e computador; processos Node.js em contêineres Docker Compose.

**Project Type**: Aplicação web full-stack em monorepo com frontend Next.js e backend NestJS modular.

**Performance Goals**: Busca de produtos e abertura das telas principais em até 2 segundos em pelo menos 95% das consultas, com referência de 500 produtos e 1.000 compras. Cálculos monetários exatos até o centavo.

**Constraints**: pt-BR e BRL; valor monetário em centavos inteiros dentro do limite seguro do runtime; quantidade em decimal exato; backend autoritativo nas validações; compra, estoque e ledger atualizados atomicamente; registros históricos preservados; nenhum preço externo ou serviço de IA obrigatório.

**Scale/Scope**: Uma pessoa proprietária e um domicílio no MVP; cadastro, estoque, orçamento, compras parciais, histórico de preços, sugestões, painel e fluxos móveis descritos na especificação.

## Constitution Check

**Gate antes da pesquisa: PASS**

- SDD: esta etapa gera pesquisa, plano, modelo de dados, contratos e guia de validação antes de qualquer implementação.
- Clean Code, SOLID e separação de responsabilidades: monólito modular por domínio, controllers finos, services/use cases e repositories.
- TypeScript estrito e componentes reutilizáveis: compartilhamento limitado a domínio puro, UI e cliente de API gerado.
- Idioma e moeda: interface pt-BR e valores BRL.
- Quantidade e precisão: Decimal128 para quantidades; centavos inteiros para dinheiro e arredondamento de linha explícito.
- Validação: Zod no frontend para feedback; DTOs e validação NestJS no backend antes de persistir.
- Segurança: sessão autenticada de proprietário, isolamento por householdId e Swagger restrito em produção.
- Testes e documentação: Jest, Supertest, Playwright, OpenAPI e artefatos Spec Kit.
- Histórico: ledger, movimentos de estoque, revisões de compra e eventos de auditoria append-only.

Não há exceção constitucional proposta.

## Project Structure

### Documentação desta feature

- specs/001-controle-compras-domesticas/plan.md — este plano
- specs/001-controle-compras-domesticas/research.md — decisões e pesquisa oficial
- specs/001-controle-compras-domesticas/data-model.md — entidades, schemas, índices e invariantes
- specs/001-controle-compras-domesticas/contracts/openapi.yaml — contrato REST versionado
- specs/001-controle-compras-domesticas/quickstart.md — validação executável após a implementação
- specs/001-controle-compras-domesticas/tasks.md — reservado para $speckit-tasks após aprovação

### Código-fonte proposto

- apps/web — aplicação Next.js App Router, rotas, layouts e telas.
- apps/api — aplicação NestJS, módulos de domínio, DTOs, controllers, services e repositories.
- packages/domain — tipos e funções puras para centavos, quantidades, unidades e regras estatísticas.
- packages/ui — componentes visuais acessíveis derivados de shadcn/ui.
- packages/api-client — cliente e tipos TypeScript gerados do OpenAPI.
- packages/config-typescript — configurações compartilhadas de TypeScript estrito.
- packages/config-eslint — regras de lint compartilhadas.
- compose.yaml — frontend, API, MongoDB replica set e inicialização/healthchecks.
- pnpm-workspace.yaml — fronteiras do workspace.

**Structure Decision**: Dois apps em um workspace pnpm. O frontend não importa schemas Mongoose nem services NestJS. O contrato OpenAPI gera o cliente de transporte; o pacote domain não importa frameworks e contém apenas cálculos reutilizáveis. Esta separação atende ao monólito modular sem criar serviços distribuídos.

### Repositórios por domínio

Repositories encapsulam consultas e persistência Mongoose. Services recebem interfaces, não modelos Mongoose; consultas que participam de uma operação atômica recebem a mesma sessão da Unit of Work.

| Domínio | Repositórios propostos | Limite principal |
|---|---|---|
| Identity | `UsersRepository`, `HouseholdsRepository`, `SessionsRepository` | Resolver identidade e escopo autenticado; nunca aceitar `householdId` do cliente |
| Catalog | `CategoriesRepository`, `ProductsRepository`, `PresentationsRepository`, `StoresRepository` | Unicidade por domicílio e preservação de registros inativados |
| Inventory | `InventoryChecksRepository`, `InventoryBalancesRepository`, `StockMovementsRepository` | Balanço é projeção; movimentos e conferências são histórico |
| ShoppingLists | `ShoppingListsRepository` | Guardar snapshot da justificativa, aplicar revisão otimista e atualizar vínculo de compra atomicamente |
| Budget | `BudgetSettingsRepository`, `BudgetPeriodsRepository`, `BudgetLedgerRepository`, `BudgetAlertsRepository` | Ledger append-only; saldo projetado e reservado na mesma transação |
| Purchases | `PurchasesRepository`, `PurchaseCorrectionsRepository`, `PurchaseItemsRepository` | Compra e revisões preservam origem e suportam idempotência |
| Pricing | `PriceObservationsRepository` | Excluir observações invalidadas das estatísticas sem apagá-las |
| Audit | `AuditEventsRepository` | Eventos append-only sem segredos ou credenciais |

Os DTOs de transporte ficam junto aos controllers e validam formato/limites; os tipos e regras de domínio ficam em `packages/domain`. Mapeadores convertem DTOs em comandos de aplicação e documentos em respostas, impedindo que schemas Mongoose vazem para a API.

### Segurança, sessão e validação

- Sessão opaca armazenada no MongoDB; persistir somente o hash do token e entregar o token em cookie `HttpOnly`, `Secure` em produção e `SameSite=Lax`. Logout e expiração revogam a sessão no servidor.
- A aplicação obtém token por `GET /auth/csrf`; requisições autenticadas enviam `X-CSRF-Token`, conferido com o cookie CSRF e com o cabeçalho `Origin`. CORS aceita somente origens configuradas. Todas as queries usam `householdId` da sessão e as respostas não expõem hashes, dados de autenticação ou campos internos.
- Hash de senha com Argon2id e parâmetros de custo configuráveis; limitar tentativas de login, configurar cabeçalhos de segurança e usar TLS em produção. Segredos ficam em variáveis/secret store, nunca no repositório nem nos logs.
- Produção exige criptografia em repouso e backups criptografados com rotina de restauração documentada; o Compose local usa credenciais de desenvolvimento sem dados reais.
- No frontend, Zod valida e normaliza entradas para feedback. No backend, DTOs `class-validator` com `ValidationPipe` global, `whitelist` e `forbidNonWhitelisted` são a autoridade antes do service. Regras de domínio são revalidadas no service.
- Swagger e o documento OpenAPI ficam desabilitados ou protegidos em produção; login, CORS, CSRF, escopo de domicílio, limite de tentativas e ausência de segredos nos logs fazem parte dos testes de integração.

## Arquitetura

### Limites do backend

Cada módulo possui controllers, DTOs, services/use cases, repositories e schemas Mongoose próximos do domínio. Controllers traduzem HTTP e não calculam regras financeiras. Services aplicam regras e dependem de interfaces de repository. Apenas interfaces explicitamente exportadas podem ser usadas por outro módulo.

| Módulo NestJS | Responsabilidade | Controllers e serviços principais |
|---|---|---|
| IdentityModule | Sessão da pessoa proprietária e contexto do domicílio | AuthController, SessionService, HouseholdScopeGuard |
| CatalogModule | Categorias, produtos e apresentações | CategoriesController, ProductsController, CategoriesService, ProductsService |
| InventoryModule | Conferências, prévia textual, saldo agregado e movimentos | InventoryController, InventoryCheckService, InventoryParserService, InventoryBalanceService |
| ShoppingListsModule | Geração, edição, prioridades, pendências, justificativas e opções de adequação ao orçamento | ShoppingListsController, ShoppingListGeneratorService, BudgetFitAdvisor |
| BudgetModule | Configuração de ciclo, períodos, créditos, ajustes, alertas e ledger | BudgetController, BudgetService, BudgetPeriodService |
| PurchasesModule | Rascunho, carrinho, finalização, correção e cancelamento | PurchasesController, PurchaseLifecycleService |
| PricingModule | Observações e comparação histórica de preços | PricesController, PricingAnalyticsService |
| InsightsModule | Recorrência, consumo e regras estatísticas | InsightsController, InsightsService, ReplenishmentStrategy |
| DashboardModule | Consultas agregadas para o painel | DashboardController, DashboardQueryService |
| AuditModule | Eventos imutáveis e consulta de alterações relevantes | AuditController, AuditService, AuditEventsRepository |
| PersistenceModule | Conexão Mongoose, schemas e Unit of Work Mongo | MongoUnitOfWork, session provider |

Schemas, repositories e DTOs ficam no módulo que os possui. Nenhum controller acessa modelo Mongoose diretamente. O caso de uso de compra recebe uma Unit of Work para passar a mesma sessão Mongo a todos os repositories envolvidos.

### Consistência de compra, estoque e orçamento

1. Criar e editar carrinho não altera saldo nem estoque.
2. Finalizar exige chave Idempotency-Key, compra em estado DRAFT, totais iguais à soma de subtotais e alocações de pagamento iguais ao total.
3. Em uma sessão Mongo, validar período, saldo do cartão e quantidade/unidade de cada linha. Estimativas de elegibilidade ao cartão não tratam uma apresentação UNKNOWN como elegível; a alocação efetivamente paga é informada e confirmada pela pessoa.
4. A atualização condicional do BudgetPeriod reserva a parcela do cartão sem permitir saldo negativo concorrente.
5. Na mesma transação, mudar compra para FINALIZED, gravar PurchaseItems, inserir BudgetLedgerEntry, ajustar InventoryBalance, inserir StockMovement, atualizar os itens de lista referenciados, criar PriceObservation e AuditEvent.
6. Fazer commit somente se todas as gravações forem válidas. Falha ou conflito aborta tudo. Reenvio com a mesma chave idempotente devolve o resultado já confirmado.
7. Correção/cancelamento mantém revisão original e acrescenta deltas compensatórios. Relatórios corrigem o período de origem; períodos fechados recebem compensação no saldo vigente mesmo que isso gere saldo corrente negativo. Correções não são bloqueadas por esse saldo; novas compras limitam a alocação FOOD_CARD a max(0, saldo corrente). Se uma linha de lista associada for estornada, o vínculo retorna a quantidade correspondente ao estado pendente na mesma transação.
8. Se o estorno de estoque ultrapassar o saldo físico registrado, exigir reconciliação explícita em vez de esconder uma quantidade negativa.

MongoDB multi-document transactions exige replica set ou cluster sharded; portanto o Compose e os testes de integração usam replica set. As operações dentro da mesma transação permanecem sequenciais, curtas e sem Promise.all.

### Aprendizado inicial

- Regras puras em packages/domain: cálculo de saldo/alertas, conversão de unidade, arredondamento comercial e estatísticas.
- Product history usa somente compras finalizadas e conferências confirmadas; correções/cancelamentos ajustam a origem estatística.
- Frequência/intervalo exigem três compras em datas distintas; médias de preço exigem duas observações comparáveis.
- Consumo entre conferências usa estoque inicial + compras válidas − estoque final; resultado negativo vira divergência.
- A sugestão de quantidade parte do alvo menos estoque conhecido e pode incluir consumo projetado até o próximo intervalo médio. A explicação mostra os dados e códigos de regra usados.
- O serviço de adequação ao orçamento retorna propostas de redução, adiamento ou apresentação alternativa como prévia sem efeitos colaterais. A aplicação da mudança exige uma mutação explícita e revisionada da lista por decisão da pessoa.
- Sem base suficiente, a resposta é insuficiente/não conferida; não inventar preço ou quantidade.
- ReplenishmentStrategy é uma fronteira para futuras estratégias. Um futuro adaptador de IA só sugere um rascunho e nunca confirma compra, estoque ou orçamento.
- Futuros adapters ReceiptCapture e VoiceEntry convertem OCR/voz para os mesmos DTOs canônicos de rascunho. A confirmação humana continua obrigatória.

## Interface e experiência

### Telas e rotas Next.js

| Rota | Tela e objetivo |
|---|---|
| /sign-in | Acesso da pessoa proprietária; sem cadastro público |
| /dashboard | Saldo, gasto, alertas e ações prioritárias do domicílio |
| /products | Catálogo, filtros, apresentações e estado ativo |
| /products/new | Cadastro de produto e apresentação |
| /products/[productId] | Detalhe, histórico, estoque agregado e edições |
| /categories | Categorias iniciais e personalizadas |
| /inventory | Saldo conhecido, itens não conferidos e início de contagem |
| /inventory/checks/new | Contagem manual ou entrada textual revisável |
| /inventory/checks | Histórico de conferências |
| /shopping-lists | Listas atuais e anteriores |
| /shopping-lists/new | Geração baseada em estoque, histórico e saldo |
| /shopping-lists/[listId] | Ajustes, justificativas, comparação de orçamento e checklist |
| /budget | Configuração do crédito, recarga, acúmulo e períodos |
| /budget/periods/[periodId] | Extrato, créditos, ajustes, alertas e histórico |
| /purchases/new | Carrinho/compra; permite finalizar somente itens adquiridos |
| /purchases/[purchaseId] | Compra, pagamentos, correções e cancelamento |
| /prices | Comparação por produto, apresentação e supermercado |
| /prices/[presentationId] | Evolução, média e observações da apresentação |
| /history | Alterações relevantes e movimentações recentes, com filtros por entidade e período |

As páginas/layouts são Server Components por padrão. Client Components ficam em campos interativos, filtros, checklist, carrinho e visualizações. Dados financeiros por usuário não usam cache compartilhado. React Query recebe um QueryClient por requisição na hidratação SSR; mutações invalidam orçamento, estoque, compra, lista e painel afetados.

### Componentes reutilizáveis

- AppShell, DesktopSidebar, MobileNavigation, PageHeader, PeriodSelector.
- CurrencyAmount, CurrencyInput, QuantityInput, UnitSelector, PriceComparison.
- ProductSearch, ProductPresentationPicker, PriorityBadge, CardEligibilityBadge.
- DataToolbar, ResponsiveRecordTable, MobileRecordList, Pagination.
- InventoryCountEditor, InventoryTextReview, AmbiguousProductMatcher, ConfirmationDialog.
- ShoppingListItem, SuggestionReason, BudgetProgress, BudgetConflictPanel, ShoppingChecklist.
- PurchaseLineEditor, PaymentSplitEditor, LivePurchaseTotal, PurchaseCorrectionDialog.
- EmptyState, ErrorState, LoadingSkeleton, InsufficientHistoryState, UnknownStockState.
- AccessibleChart com resumo tabular equivalente.

Composição específica das jornadas permanece em apps/web; packages/ui oferece primitivos, sem boolean props excessivas nem regras de domínio. Formulários usam React Hook Form + Zod, rótulos visíveis, helper text, mensagens ligadas ao campo e estados de envio/erro/desabilitado.

### Direção responsiva e estados

- Abaixo de 640 px: navegação compacta; listas e tabelas viram registros empilhados; ação principal fica acessível na parte inferior; alvos de toque utilizáveis.
- Entre 640 e 1024 px: toolbar quebra em linhas e tabelas mantêm apenas colunas necessárias.
- Acima de 1024 px: tabela para comparação, barra lateral e painéis de detalhe sem esticar conteúdo.
- Recharts é carregado somente nas áreas de análise do painel; dados do gráfico também são oferecidos em tabela/resumo para teclado e leitor de tela.
- Todos os fluxos cobrem estados carregando, vazio, erro recuperável, sem histórico, estoque desconhecido, texto ambíguo, limite excedido, conflito 409, foco visível e confirmação.
- Cor nunca é o único sinal de status; moeda e datas respeitam pt-BR; não armazenar estado de saldo/estoque em localStorage.

## Contratos REST

O contrato completo e schemas ficam em [contracts/openapi.yaml](contracts/openapi.yaml). Prefixo /api/v1; JSON UTF-8; moeda em amountCents inteiro; quantidades em strings decimais canônicas; datas ISO-8601. Listagens usam page e pageSize, com limite máximo de 100.

| Grupo | Endpoints principais | Controller |
|---|---|---|
| Sessão | GET /auth/csrf; POST/GET/DELETE /auth/session | AuthController |
| Categorias | GET/POST /categories; GET/PATCH /categories/{id} | CategoriesController |
| Produtos | GET/POST /products; GET/PATCH /products/{id}; POST/PATCH apresentações | ProductsController |
| Estoque | GET /inventory; GET /inventory/{productId}/movements; POST /inventory/check-previews; POST /inventory/checks; GET /inventory/checks | InventoryController |
| Listas | GET/POST /shopping-lists; POST /shopping-lists/generate; GET/PATCH /shopping-lists/{id}; POST /shopping-lists/{id}/budget-options | ShoppingListsController |
| Orçamento | GET /budget/current; GET /budget/periods; GET /budget/periods/{id}; PUT /budget/settings; POST /budget/credits; POST /budget/adjustments | BudgetController |
| Compras | GET/POST /purchases; GET/PATCH /purchases/{id}; GET /purchases/{id}/history; POST finalize/corrections/cancel | PurchasesController |
| Preços/insights | GET /prices/compare; GET /insights/products/{id} | PricesController; InsightsController |
| Painel | GET /dashboard | DashboardController |
| Auditoria | GET /audit/events | AuditController |

DTOs de entrada: CreateSessionDto, CreateCategoryDto, CreateProductDto, UpdateProductDto, CreatePresentationDto, UpdatePresentationDto, InventoryTextPreviewDto, ConfirmInventoryCheckDto, GenerateShoppingListDto, CreateShoppingListDto, UpdateShoppingListDto, BudgetOptionsDto, BudgetSettingsDto, BudgetCreditDto, BudgetAdjustmentDto, CreatePurchaseDraftDto, UpdatePurchaseDraftDto, FinalizePurchaseDto, CorrectPurchaseDto, CancelPurchaseDto, PurchaseQueryDto e AuditEventsQueryDto.

Respostas usam Problem Details com código estável para validação, autenticação, not-found e conflitos. Conflitos de versão, saldo insuficiente e chave de idempotência incompatível retornam 409 sem movimento parcial. Swagger UI e arquivos JSON/YAML ficam disponíveis em desenvolvimento e teste; produção desabilita ou protege os três endpoints de documentação.

## Estratégia de testes e critérios de qualidade

| Camada | Ferramenta | Cenários obrigatórios |
|---|---|---|
| Unitária de domínio | Jest | Centavos, HALF_UP, soma de pagamentos, conversão decimal, frequência, consumo, limiares e lista sem dados |
| Componentes | Jest + React Testing Library | Formulários acessíveis, validação Zod, estados vazio/erro/desabilitado e comportamento mobile |
| Integração API | Jest + Supertest + MongoDB replica set | DTO/Swagger, índices, sessão/CSRF, autorização por domicílio, transação/rollback, idempotência, correções e concorrência |
| Contrato | Swagger/OpenAPI + cliente gerado | Regeneração sem drift, schemas de centavos/string decimal, Problem Details e testes de compatibilidade |
| E2E | Playwright | Configurar R$ 700, conferir 0,5 pacote, gerar lista, testar opções de orçamento sem mutação, compra parcial por item/quantidade, pagamento dividido, rejeição acima do saldo, corrigir/cancelar e usar celular |
| Desempenho | execução com base de referência | 500 produtos e 1.000 compras; p95 <= 2 s para busca e abertura das telas definidas pela especificação |

Critérios de merge após implementação: lint; typecheck estrito; Jest unitário e integração; teste de contrato; Playwright dos fluxos críticos; build de web e API; revisão do OpenAPI e da documentação. As mudanças de comportamento atualizam spec, guia rápido e decisões de domínio. Nesta etapa nenhum desses comandos foi executado porque o código ainda não foi implementado.

Cada nova capacidade deverá passar por `specify → clarify → plan → aprovação → tasks → implement → analyze/converge`. Alterações de escopo retornam à especificação e à revisão do plano; a implementação só começa após aprovação explícita dos artefatos aplicáveis.

## Decisões do desenho que a aprovação deve confirmar

1. Configuração inicial solicita se saldo remanescente acumula; não assume um padrão silencioso.
2. Compra parcial é modelada por linha e quantidade: as linhas compradas são ligadas por id estável à lista, quantidades menores deixam saldo da linha pendente e correções/cancelamentos restauram a quantidade. Esta interpretação precisa ser confirmada.
3. Estoque é guardado por produto em unidade-base; contagem em fração de embalagem converte pelo conteúdo cadastrado e conserva a unidade digitada no histórico.
4. O MVP requer sessão de uma pessoa proprietária; o primeiro acesso é provisionado no bootstrap, sem cadastro público.
5. Compra corrigida mantém revisão original, corrige relatórios de origem e usa compensação para o saldo corrente após fechamento do período.
6. Débitos compensatórios podem deixar o saldo corrente negativo para refletir a correção; novas compras não podem usar mais que zero de saldo disponível. Confirmar se este comportamento atende ao acompanhamento esperado.
7. A configuração de acúmulo se aplica a sobras positivas; uma dívida decorrente de correção permanece no próximo período mesmo com o acúmulo de saldo desativado. Esta política evita apagar saldo negativo, mas deve ser aprovada junto com o tratamento de correções.

## Constitution Check

**Reavaliação após o desenho: PASS**

A arquitetura permanece modular, tipada e testável. Nenhum controlador altera saldo ou estoque sem o caso de uso transacional. Valores monetários são centavos inteiros; quantidades usam unidade-base e Decimal128. Validação ocorre na interface e novamente no backend. Acessibilidade, pt-BR, mobile-first, segurança, histórico, documentação e testes aparecem em telas, contratos, modelo de dados e critérios de qualidade. Os conectores futuros ficam atrás de fronteiras sem dependências obrigatórias no MVP.

## Complexity Tracking

Nenhuma violação constitucional identificada; não há exceções a justificar.
