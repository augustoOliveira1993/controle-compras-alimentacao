---
description: "Plano executável de implementação do sistema de compras domésticas"
---

# Tarefas: Controle de Compras Domésticas

**Entrada**: Artefatos em `specs/001-controle-compras-domesticas/`.

**Pré-requisitos**: `specs/001-controle-compras-domesticas/spec.md`, `specs/001-controle-compras-domesticas/plan.md`, `specs/001-controle-compras-domesticas/research.md`, `specs/001-controle-compras-domesticas/data-model.md`, `specs/001-controle-compras-domesticas/contracts/openapi.yaml` e `specs/001-controle-compras-domesticas/quickstart.md`.

**Testes**: Incluídos porque foram solicitados pelo usuário e são exigidos pela constituição do projeto. Escrever testes de cada história antes da implementação de seus módulos e comprovar os fluxos com a infraestrutura prevista.

**Organização**: tarefas agrupadas pelas seis histórias da especificação, após setup e fundação. A prioridade segue US1–US4 (P1) e depois US5–US6 (P2).

**Formato obrigatório**: `- [ ] T### [P?] [US#?] descrição com caminho de arquivo`.

Os itens abaixo incluem arquivos, dependências, critérios de aceite e de conclusão. `[P]` indica arquivos e trabalho que podem avançar em paralelo depois das dependências informadas.

## Fase 1: Setup e infraestrutura compartilhada

**Objetivo**: Inicializar o monorepo, as aplicações e os ambientes de desenvolvimento e teste.

- [X] T001 Criar o workspace pnpm e scripts de raiz em `package.json`, `pnpm-workspace.yaml` e `.npmrc`.
  - Arquivos: `package.json`, `pnpm-workspace.yaml`, `.npmrc`, `pnpm-lock.yaml`.
  - Dependências: —.
  - Critérios de aceitação: workspace lista `apps/*` e `packages/*`; scripts raiz reservam `dev`, `build`, `lint`, `typecheck`, `test`, `test:integration` e `test:e2e`.
  - Critérios de conclusão: Corepack/pnpm instala e reconhece todos os workspaces sem importar código de uma aplicação na outra.
- [X] T002 [P] Configurar TypeScript estrito, ESLint e regras compartilhadas em `packages/config-typescript/` e `packages/config-eslint/`.
  - Arquivos: `packages/config-typescript/tsconfig.base.json`, `packages/config-eslint/index.js`, `package.json` dos pacotes e apps.
  - Dependências: T001.
  - Critérios de aceitação: apps e pacotes estendem configs comuns com `strict`; lint rejeita imports proibidos e `any` sem justificativa.
  - Critérios de conclusão: cada workspace de código tem scripts `lint` e `typecheck` compatíveis com a configuração da raiz.
- [X] T003 [P] Inicializar Next.js App Router com TypeScript e Tailwind CSS em `apps/web/`.
  - Arquivos: `apps/web/package.json`, `apps/web/next.config.ts`, `apps/web/src/app/layout.tsx`, `apps/web/src/app/globals.css`, `apps/web/tsconfig.json`.
  - Dependências: T001, T002.
  - Critérios de aceitação: Next executa com App Router, fontes e estilos base, metadados em português e Tailwind responsivo.
  - Critérios de conclusão: a aplicação web compila sem depender de schemas Mongoose ou services NestJS.
- [X] T004 [P] Inicializar NestJS com TypeScript em `apps/api/`.
  - Arquivos: `apps/api/package.json`, `apps/api/src/main.ts`, `apps/api/src/app.module.ts`, `apps/api/tsconfig.json`.
  - Dependências: T001, T002.
  - Critérios de aceitação: API inicializa sob o prefixo `/api/v1` e carrega configurações por ambiente.
  - Critérios de conclusão: build do app API funciona isolado e não importa módulos da interface web.
- [X] T005 [P] Criar os pacotes internos de domínio, UI e cliente OpenAPI em `packages/`.
  - Arquivos: `packages/domain/package.json`, `packages/ui/package.json`, `packages/api-client/package.json`, respectivos `src/index.ts`.
  - Dependências: T001, T002.
  - Critérios de aceitação: imports usam `workspace:`; domínio não depende de frameworks; UI exporta componentes e api-client exporta o cliente gerado.
  - Critérios de conclusão: apps resolvem os três pacotes por aliases públicos definidos, sem importar arquivos internos por caminho relativo.
- [ ] T006 [P] Configurar MongoDB 8 em replica set local e serviços Docker Compose em `compose.yaml`.
  - Arquivos: `compose.yaml`, `docker/mongo/init-replica-set.js`, `apps/api/Dockerfile`, `apps/web/Dockerfile`.
  - Dependências: T001.
  - Critérios de aceitação: serviço `mongo` inicia `rs0`, tem healthcheck de prontidão e oferece URI para transações; containers web/API aguardam dependências saudáveis.
  - Critérios de conclusão: `docker compose up` deixa MongoDB pronto para transações multi-documento sem executar transações em modo standalone.
- [ ] T007 Configurar Jest, React Testing Library, Supertest e Playwright em `apps/` e `packages/`.
  - Arquivos: `jest.config.ts`, `apps/api/test/jest-e2e.json`, `apps/web/jest.config.ts`, `apps/web/playwright.config.ts`, scripts `package.json`.
  - Dependências: T003, T004, T005, T006.
  - Critérios de aceitação: há alvos separados para unitários, componentes, integração com Mongo replica set e E2E; Playwright inicia web e API e aguarda healthcheck.
  - Critérios de conclusão: cada runner descobre um teste de fumaça próprio e integração usa banco isolado.
- [ ] T008 [P] Documentar variáveis e inicialização local em `.env.example` e `README.md`.
  - Arquivos: `.env.example`, `README.md`, `docs/development.md`.
  - Dependências: T006, T007.
  - Critérios de aceitação: documenta Node 24, pnpm, Mongo `rs0`, bootstrap do proprietário, portas locais e scripts planejados, sem valores secretos.
  - Critérios de conclusão: passos do README correspondem ao Compose e podem ser executados em instalação limpa após implementação.

## Fase 2: Fundação compartilhada (bloqueia as histórias)

**Objetivo**: Preparar regras de precisão, persistência transacional, autenticação, validação e componentes reutilizáveis.

- [ ] T009 [P] Escrever testes unitários de centavos, arredondamento e quantidades em `packages/domain/test/`.
  - Arquivos: `packages/domain/test/money.test.ts`, `packages/domain/test/quantity.test.ts`, `packages/domain/test/units.test.ts`.
  - Dependências: T005, T007.
  - Critérios de aceitação: cobre `Number.isSafeInteger`, HALF_UP, soma em centavos, máximo de dígitos decimais, conversão de 0,5 pacote de 1,6 kg para 800 g e rejeição de unidades incompatíveis.
  - Critérios de conclusão: testes expressam casos válidos e inválidos antes da implementação de domínio.
- [ ] T010 Implementar primitivas exatas para dinheiro e quantidade em `packages/domain/src/`.
  - Arquivos: `packages/domain/src/money.ts`, `packages/domain/src/quantity.ts`, `packages/domain/src/units.ts`, `packages/domain/src/index.ts`.
  - Dependências: T009.
  - Critérios de aceitação: dinheiro permanece em centavos inteiros; `decimal.js` usa 60 algarismos de precisão; quantidades são canônicas, limitadas e nunca convertidas por `Number` binário.
  - Critérios de conclusão: T009 passa; resultados não representáveis exatamente em Decimal128 ou fora do inteiro seguro são rejeitados.
- [ ] T011 [P] Escrever testes de fundação HTTP, sessão, CSRF, isolamento e transações em `apps/api/test/`.
  - Arquivos: `apps/api/test/foundation/validation.e2e-spec.ts`, `apps/api/test/foundation/session.e2e-spec.ts`, `apps/api/test/foundation/household-scope.e2e-spec.ts`, `apps/api/test/foundation/transactions.e2e-spec.ts`.
  - Dependências: T006, T007.
  - Critérios de aceitação: tenta payload com campos extras, sessão ausente/expirada, CSRF inválido, `householdId` forjado e rollback por falha de escrita.
  - Critérios de conclusão: cenários são executáveis contra Mongo replica set e falham antes das implementações correspondentes.
- [ ] T012 Implementar conexão Mongoose, índices e Unit of Work em `apps/api/src/common/persistence/`.
  - Arquivos: `apps/api/src/common/persistence/persistence.module.ts`, `mongo-unit-of-work.ts`, `mongo-session.provider.ts`, `schema-options.ts`.
  - Dependências: T006, T011.
  - Critérios de aceitação: repositórios da mesma operação recebem a mesma sessão Mongo; operações da transação são sequenciais e curtas; índices são sincronizados em testes.
  - Critérios de conclusão: testes de rollback de T011 passam usando replica set real.
- [ ] T013 Implementar validação global, Problem Details e Swagger em `apps/api/src/common/http/`.
  - Arquivos: `apps/api/src/main.ts`, `apps/api/src/common/http/problem-details.filter.ts`, `validation.pipe.ts`, `swagger.ts`.
  - Dependências: T004, T011.
  - Critérios de aceitação: `ValidationPipe` usa `whitelist`, `forbidNonWhitelisted` e transformação controlada; erros usam códigos estáveis; `/api/v1` publica OpenAPI 3.1.
  - Critérios de conclusão: documentação Swagger funciona em desenvolvimento/teste e fica desabilitada ou protegida em produção.
- [ ] T014 Criar schemas e índices de Household, User e Session em `apps/api/src/modules/identity/schemas/`.
  - Arquivos: `household.schema.ts`, `user.schema.ts`, `session.schema.ts`, `identity.indexes.ts`.
  - Dependências: T012.
  - Critérios de aceitação: isolamento, unicidade de email/token e expiração de sessão correspondem ao modelo canônico.
  - Critérios de conclusão: campos e restrições são rastreáveis em `data-model.md`: Household.name, Household.locale, Household.currency, Household.ownerUserId, Household.createdAt; User.email, User.emailNormalized, User.passwordHash, User.householdId, User.role, User.active, User.createdAt, User.updatedAt; Session.userId, Session.householdId, Session.tokenHash, Session.createdAt, Session.expiresAt, Session.revokedAt, Session.lastSeenAt.
- [ ] T015 Implementar sessão, login, logout e bootstrap seguro em `apps/api/src/modules/identity/`.
  - Arquivos: `auth.controller.ts`, `session.service.ts`, `users.repository.ts`, `sessions.repository.ts`, `owner-bootstrap.service.ts`, `identity.module.ts`.
  - Dependências: T013, T014.
  - Critérios de aceitação: proprietário é provisionado administrativamente, senha usa Argon2id, cookie é HttpOnly/SameSite=Lax/Secure em produção, e rotas incluem `GET /auth/csrf` e `POST/GET/DELETE /auth/session`.
  - Critérios de conclusão: T011 passa para login, revogação, CSRF e proteção contra tentativas repetidas; nenhum segredo aparece em resposta ou log.
- [ ] T016 Implementar escopo por domicílio e controles de segurança em `apps/api/src/common/security/`.
  - Arquivos: `household-scope.guard.ts`, `csrf.guard.ts`, `origin.guard.ts`, `rate-limit.module.ts`, `security-headers.ts`.
  - Dependências: T015.
  - Critérios de aceitação: `householdId` vem somente da sessão; CORS aceita origens configuradas; mutações exigem token CSRF e origem válida.
  - Critérios de conclusão: T011 passa para acesso cruzado, CORS, sessão expirada e cabeçalhos de segurança.
- [ ] T017 Implementar auditoria append-only e consulta paginada em `apps/api/src/modules/audit/`.
  - Arquivos: `schemas/audit-event.schema.ts`, `audit-events.repository.ts`, `audit.service.ts`, `audit.controller.ts`, `audit.module.ts`.
  - Dependências: T012, T016.
  - Critérios de aceitação: `GET /audit/events` filtra por entidade/período, exige escopo de domicílio e exclui credenciais e segredos.
  - Critérios de conclusão: todos os campos seguem `data-model.md`: AuditEvent.householdId, AuditEvent.actorId, AuditEvent.entityType, AuditEvent.entityId, AuditEvent.action, AuditEvent.beforeSummary, AuditEvent.afterSummary, AuditEvent.source, AuditEvent.occurredAt, AuditEvent.correlationId; índices suportam paginação histórica.
- [ ] T018 Gerar cliente TypeScript e verificador de drift do OpenAPI em `packages/api-client/`.
  - Arquivos: `packages/api-client/openapi.config.ts`, `packages/api-client/src/generated/`, `packages/api-client/package.json`, `specs/001-controle-compras-domesticas/contracts/openapi.yaml`.
  - Dependências: T001, T005, T013.
  - Critérios de aceitação: tipos de requests/responses são gerados do contrato e incluem centavos inteiros, quantidades decimais string, cookie/CSRF e Problem Details.
  - Critérios de conclusão: comando de geração é reprodutível e CI detecta alterações não regeneradas.
- [ ] T019 Configurar autenticação web e TanStack Query por requisição em `apps/web/src/`.
  - Arquivos: `src/app/(auth)/sign-in/page.tsx`, `src/app/(app)/layout.tsx`, `src/lib/api/server.ts`, `src/lib/api/query-client.ts`, `src/lib/auth/session.ts`.
  - Dependências: T003, T015, T018.
  - Critérios de aceitação: SSR encaminha sessão/CSRF sem cache compartilhado; QueryClient é isolado por requisição; mutações invalidam queries relacionadas.
  - Critérios de conclusão: páginas privadas redirecionam sem sessão e não guardam saldo/estoque em `localStorage`.
- [ ] T020 Criar componentes UI reutilizáveis e formulários acessíveis em `packages/ui/src/`.
  - Arquivos: `currency-amount.tsx`, `currency-input.tsx`, `quantity-input.tsx`, `unit-selector.tsx`, `form-field.tsx`, `loading-state.tsx`, `error-state.tsx`, `empty-state.tsx`.
  - Dependências: T003, T005, T010.
  - Critérios de aceitação: componentes aceitam BRL/pt-BR, quantidades fracionadas, rótulos, foco visível e erros associados ao campo.
  - Critérios de conclusão: primitivos não carregam regras de negócio nem combinam variantes por excesso de boolean props.
- [ ] T021 Automatizar dados iniciais e bootstrap da pessoa proprietária em `apps/api/src/bootstrap/`.
  - Arquivos: `bootstrap.module.ts`, `seed.service.ts`, `owner-provisioning.command.ts`, `apps/api/Dockerfile`.
  - Dependências: T014, T015.
  - Critérios de aceitação: execução repetida é idempotente, cria somente domicílio/usuário configurados e nunca habilita cadastro público.
  - Critérios de conclusão: segredos vêm de ambiente/secret store e o guia descreve recuperação de falha sem duplicar o proprietário.
- [ ] T022 Configurar checagens de segurança, logs e pipeline em `.github/workflows/ci.yml`.
  - Arquivos: `.github/workflows/ci.yml`, `apps/api/src/common/observability/logger.ts`, `apps/api/src/common/security/`.
  - Dependências: T007, T013, T016.
  - Critérios de aceitação: pipeline roda lint, typecheck e suites por camada; logs removem tokens, senhas, número de cartão e dados não necessários.
  - Critérios de conclusão: Swagger é protegido em produção, segredos não são versionados e backup/restauração ficam como controles documentados.

**Checkpoint**: setup e fundação concluídos; histórias podem ser implementadas sem acoplamento entre web, domínio e persistência.

## Fase 3: US1 — Cadastro de produtos e conferência do estoque (P1)

**Objetivo**: Cadastrar catálogo doméstico e registrar conferências sem transformar ausência de informação em estoque zero.

- [ ] T023 [P] [US1] Escrever testes unitários de catálogo, unidades e conferência parcial em `packages/domain/test/`.
  - Arquivos: `packages/domain/test/catalog.test.ts`, `inventory-check.test.ts`, `inventory-matching.test.ts`.
  - Dependências: T009, T010.
  - Critérios de aceitação: cobre nomes normalizados, unidades incompatíveis, linhas ambíguas para revisão, quantidades fracionadas e conferência parcial que preserva itens omitidos.
  - Critérios de conclusão: casos positivos, negativos e limites estão documentados nos testes antes dos serviços da história.
- [ ] T024 [P] [US1] Escrever testes de integração dos contratos de catálogo e estoque em `apps/api/test/catalog-inventory/`.
  - Arquivos: `categories.e2e-spec.ts`, `products.e2e-spec.ts`, `presentations.e2e-spec.ts`, `inventory-checks.e2e-spec.ts`, `inventory-movements.e2e-spec.ts`.
  - Dependências: T011, T013, T014, T016.
  - Critérios de aceitação: verifica autenticação, validação, isolamento por domicílio, paginação, unidades, linha não reconhecida e conferência parcial em Mongo replica set.
  - Critérios de conclusão: fixtures criam dados isolados e cenários de falha ainda reproduzem comportamento esperado antes da implementação.
- [ ] T025 [P] [US1] Escrever fluxo E2E de cadastro e conferência em `apps/web/e2e/`.
  - Arquivos: `catalog-inventory.spec.ts`, `fixtures/household.ts`.
  - Dependências: T007, T024.
  - Critérios de aceitação: pessoa usuária cadastra produto e apresentação, informa estoque fracionado e confirma inventário com linha ambígua em revisão.
  - Critérios de conclusão: fluxo é independente, executável em viewport móvel e não supõe estoque zero para produtos omitidos.
- [ ] T026 [P] [US1] Criar schemas e índices de categorias, produtos e apresentações em `apps/api/src/modules/catalog/schemas/`.
  - Arquivos: `category.schema.ts`, `product.schema.ts`, `product-presentation.schema.ts`, `catalog.indexes.ts`.
  - Dependências: T012, T014.
  - Critérios de aceitação: índices únicos são limitados ao domicílio e referências inválidas ou inativas são rejeitadas.
  - Critérios de conclusão: seguir `data-model.md` — Category.householdId, Category.name, Category.normalizedName, Category.parentId, Category.status, Category.isSeeded; Product.householdId, Product.name, Product.normalizedName, Product.categoryId, Product.subcategoryId, Product.quantityDimension, Product.baseUnit, Product.priority, Product.recurrencePreference, Product.status, Product.minimumHomeQuantity, Product.usualPurchaseQuantity, Product.notes, Product.createdAt, Product.updatedAt; ProductPresentation.householdId, ProductPresentation.productId, ProductPresentation.brand, ProductPresentation.normalizedBrand, ProductPresentation.packageContent, ProductPresentation.packageUnit, ProductPresentation.baseUnitsPerPackage, ProductPresentation.cardEligibility, ProductPresentation.status, ProductPresentation.createdAt, ProductPresentation.updatedAt.
- [ ] T027 [US1] Criar schemas de conferência de estoque e linhas em `apps/api/src/modules/inventory/schemas/`.
  - Arquivos: `inventory-check.schema.ts`, `inventory-check-line.schema.ts`, `inventory.indexes.ts`.
  - Dependências: T012, T026.
  - Critérios de aceitação: conferências preservam texto original e estado de revisão; uma linha só altera saldo quando confirmada.
  - Critérios de conclusão: seguir `data-model.md` — InventoryCheck.householdId, InventoryCheck.state, InventoryCheck.source, InventoryCheck.confirmedAt, InventoryCheck.createdAt, InventoryCheck.parserReviewStatus; InventoryCheckLine.productId, InventoryCheckLine.presentationId, InventoryCheckLine.rawText, InventoryCheckLine.enteredQuantity, InventoryCheckLine.enteredUnit, InventoryCheckLine.baseQuantity, InventoryCheckLine.matchingStatus, InventoryCheckLine.confirmed; convenções de quantidade da seção “Tipos e convenções”.
- [ ] T028 [US1] Criar schemas e repositórios de saldo e movimentos de estoque em `apps/api/src/modules/inventory/`.
  - Arquivos: `schemas/inventory-balance.schema.ts`, `schemas/stock-movement.schema.ts`, `inventory-balance.repository.ts`, `stock-movements.repository.ts`.
  - Dependências: T012, T026, T027.
  - Critérios de aceitação: saldo atual é consultável por produto e domicílio; movimentos são append-only e apontam para origem rastreável.
  - Critérios de conclusão: seguir `data-model.md` — InventoryBalance.householdId, InventoryBalance.productId, InventoryBalance.baseQuantity, InventoryBalance.baseUnit, InventoryBalance.lastConfirmedAt, InventoryBalance.lastMovementAt, InventoryBalance.version; StockMovement.householdId, StockMovement.productId, StockMovement.presentationId, StockMovement.kind, StockMovement.deltaBaseQuantity, StockMovement.sourceType, StockMovement.sourceId, StockMovement.sourceLineId, StockMovement.occurredAt, StockMovement.actorId; convenções de Decimal128, escala e conversão da seção “Tipos e convenções”.
- [ ] T029 [US1] Implementar serviços de categorias, produtos, apresentações e busca em `apps/api/src/modules/catalog/`.
  - Arquivos: `categories.service.ts`, `products.service.ts`, `presentations.service.ts`, `catalog.repository.ts`, `catalog.module.ts`.
  - Dependências: T026, T024.
  - Critérios de aceitação: CRUD validado não permite duplicatas normalizadas no mesmo domicílio nem conversão entre dimensões incompatíveis; desativação preserva referências históricas.
  - Critérios de conclusão: testes de T024 passam para catálogo, busca, ordenação, paginação e isolamento.
- [ ] T030 [US1] Implementar conferência manual/textual e atualização transacional do estoque em `apps/api/src/modules/inventory/`.
  - Arquivos: `inventory-checks.service.ts`, `inventory-parser.service.ts`, `inventory-matching.service.ts`, `ports/inventory-input-parser.port.ts`, `ports/invoice-reader.port.ts`, `ports/voice-input.port.ts`, `inventory.controller.ts`, `inventory.module.ts`.
  - Dependências: T010, T027, T028, T024.
  - Critérios de aceitação: parser não confirma correspondências incertas; confirmação grava linha, saldo e movimento na mesma transação; conferência parcial não zera produtos ausentes.
  - Critérios de conclusão: teste de falha transacional não deixa linha confirmada sem saldo/movimento e testes de T023/T024 passam; os ports permitem futuros adapters de nota fiscal/voz sem exigir provedor externo no MVP.
- [ ] T031 [US1] Publicar DTOs e endpoints de catálogo e estoque em `apps/api/src/modules/catalog/` e `apps/api/src/modules/inventory/`.
  - Arquivos: `apps/api/src/modules/catalog/dto/`, `apps/api/src/modules/catalog/catalog.controller.ts`, `apps/api/src/modules/inventory/inventory.controller.ts`, `specs/001-controle-compras-domesticas/contracts/openapi.yaml`.
  - Dependências: T013, T029, T030.
  - Critérios de aceitação: rotas implementam contratos de categorias, produtos, apresentações, conferências e movimentos; paginação e erros seguem formato comum.
  - Critérios de conclusão: Swagger e cliente gerado refletem os contratos e T024 passa.
- [ ] T032 [US1] Implementar telas de catálogo e inventário em `apps/web/src/app/`.
  - Arquivos: `(app)/products/page.tsx`, `(app)/products/new/page.tsx`, `(app)/products/[productId]/page.tsx`, `(app)/categories/page.tsx`, `(app)/inventory/page.tsx`, `(app)/inventory/checks/new/page.tsx`, `components/catalog/`, `components/inventory/`.
  - Dependências: T018, T019, T020, T031.
  - Critérios de aceitação: formulários RHF/Zod exibem unidades compatíveis, quantidades fracionadas, busca, estados vazio/erro/carregamento e revisão manual de correspondências.
  - Critérios de conclusão: páginas responsivas e acessíveis; T025 passa e nenhuma tela interpreta ausência como zero.
- [ ] T033 [US1] Fechar documentação e checklist de aceite do catálogo e inventário em `specs/001-controle-compras-domesticas/`.
  - Arquivos: `specs/001-controle-compras-domesticas/quickstart.md`, `specs/001-controle-compras-domesticas/contracts/openapi.yaml`, `specs/001-controle-compras-domesticas/checklists/us1.md`.
  - Dependências: T031, T032.
  - Critérios de aceitação: exemplos cobrem criação de produto, unidade base, apresentação, conferência parcial e linha que exige revisão.
  - Critérios de conclusão: exemplos são compatíveis com DTOs e critérios da US1; checklist permite aceite independente da história.

## Fase 4: US2 — Geração e edição de listas inteligentes (P1)

**Objetivo**: Gerar uma lista explicável a partir do estoque e do histórico confiável, permitindo edição e simulação de orçamento sem mutações financeiras.

- [ ] T034 [P] [US2] Escrever testes unitários do gerador de listas e alternativas de orçamento em `packages/domain/test/`.
  - Arquivos: `shopping-list-generator.test.ts`, `budget-fit.test.ts`, `recommendation-rationale.test.ts`.
  - Dependências: T023, T010.
  - Critérios de aceitação: cobre item abaixo do mínimo, recorrência, prioridade, ausência de preço confiável, opção de ajuste de apresentação/quantidade e recomendação sem histórico suficiente.
  - Critérios de conclusão: cada sugestão tem rationale reproduzível e opções de orçamento são simulações sem escrita.
- [ ] T035 [P] [US2] Escrever testes de integração de listas e simulação em `apps/api/test/shopping-lists/`.
  - Arquivos: `generate-list.e2e-spec.ts`, `edit-list.e2e-spec.ts`, `budget-options.e2e-spec.ts`, `list-history.e2e-spec.ts`.
  - Dependências: T024, T031.
  - Critérios de aceitação: verifica escopo, revisão concorrente, itens sem preço, edição manual, histórico e ausência de alteração de saldo durante simulação.
  - Critérios de conclusão: testes cobrem contratos e persistência em replica set antes da implementação da história.
- [ ] T036 [P] [US2] Escrever fluxo E2E de geração e edição de lista em `apps/web/e2e/`.
  - Arquivos: `shopping-list.spec.ts`.
  - Dependências: T025, T035.
  - Critérios de aceitação: pessoa usuária gera lista, entende as justificativas, edita quantidade, remove item e visualiza alternativas que cabem no saldo.
  - Critérios de conclusão: cenário confirma que prévia não debita orçamento nem altera estoque.
- [ ] T037 [US2] Criar schemas e índices de listas e itens em `apps/api/src/modules/shopping-lists/schemas/`.
  - Arquivos: `shopping-list.schema.ts`, `shopping-list-item.schema.ts`, `shopping-lists.indexes.ts`.
  - Dependências: T012, T026, T027.
  - Critérios de aceitação: revisão e estados são persistidos; itens mantêm quantidade original, sugerida, escolhida, comprada e remanescente.
  - Critérios de conclusão: seguir `data-model.md` — ShoppingList.householdId, ShoppingList.state, ShoppingList.budgetPeriodId, ShoppingList.generatedAt, ShoppingList.revision, ShoppingList.createdAt, ShoppingList.updatedAt, ShoppingList.sourceInventoryCheckId, ShoppingList.estimatedTotalCents; ShoppingListItem.id, ShoppingListItem.productId, ShoppingListItem.suggestedPresentationId, ShoppingListItem.rawName, ShoppingListItem.state, ShoppingListItem.quantityAtHomeBase, ShoppingListItem.suggestedBaseQuantity, ShoppingListItem.chosenPackageQuantity, ShoppingListItem.purchasedBaseQuantity, ShoppingListItem.remainingBaseQuantity, ShoppingListItem.baseUnit, ShoppingListItem.lastPriceCents, ShoppingListItem.estimatedUnitPriceCents, ShoppingListItem.estimatedSubtotalCents, ShoppingListItem.priority, ShoppingListItem.rationaleCodes, ShoppingListItem.rationaleText, ShoppingListItem.manualOverride; convenções de dinheiro/quantidade em `data-model.md`.
- [ ] T038 [US2] Implementar repositórios e controle de revisão das listas em `apps/api/src/modules/shopping-lists/`.
  - Arquivos: `shopping-lists.repository.ts`, `shopping-list-items.repository.ts`, `list-revision.service.ts`.
  - Dependências: T037, T035.
  - Critérios de aceitação: atualizações usam revisão otimista, rejeitam edição obsoleta com conflito tratável e preservam histórico de listas anteriores.
  - Critérios de conclusão: testes de concorrência e histórico em T035 passam sem sobrescrita silenciosa.
- [ ] T039 [US2] Implementar gerador explicável com regras e estatística local em `apps/api/src/modules/shopping-lists/`.
  - Arquivos: `shopping-list-generator.service.ts`, `recommendation-rules.ts`, `consumption-baseline.port.ts`, `recommendation-strategy.port.ts`, `shopping-lists.module.ts`.
  - Dependências: T010, T028, T037, T038, T034.
  - Critérios de aceitação: combina saldo confirmado, mínimos, prioridade, recorrência e sinais históricos disponíveis; dados ausentes permanecem desconhecidos e não são apresentados como fatos.
  - Critérios de conclusão: testes determinísticos de T034 passam; regras são substituíveis por providers futuros sem integração externa obrigatória.
- [ ] T040 [US2] Implementar simulação de opções que cabem no saldo em `apps/api/src/modules/shopping-lists/`.
  - Arquivos: `budget-fit-advisor.service.ts`, `price-estimate.port.ts`, `shopping-list-options.dto.ts`.
  - Dependências: T034, T039, T050 (provider de saldo disponível).
  - Critérios de aceitação: estimativas usam somente preços observados comparáveis; alternativas preservam prioridades/restrições explícitas e nunca gravam compra, saldo ou estoque.
  - Critérios de conclusão: cenários sem preço retornam estado “sem estimativa confiável” e todas as saídas têm justificativa legível.
- [ ] T041 [US2] Publicar endpoints e DTOs de geração, consulta, edição e opções de listas em `apps/api/src/modules/shopping-lists/`.
  - Arquivos: `apps/api/src/modules/shopping-lists/shopping-lists.controller.ts`, `apps/api/src/modules/shopping-lists/dto/`, `specs/001-controle-compras-domesticas/contracts/openapi.yaml`.
  - Dependências: T013, T038, T039, T040, T051 (contrato de consulta do orçamento).
  - Critérios de aceitação: rotas seguem OpenAPI para gerar/listar/detalhar/editar e obter opções de orçamento com controle de revisão.
  - Critérios de conclusão: tipos do cliente são regeneráveis e T035 passa.
- [ ] T042 [US2] Implementar telas de listas e opções de orçamento em `apps/web/src/app/(app)/shopping-lists/`.
  - Arquivos: `page.tsx`, `new/page.tsx`, `[listId]/page.tsx`, `components/shopping-lists/`.
  - Dependências: T018, T020, T041, T051.
  - Critérios de aceitação: interface explica origem das sugestões, permite revisar/adicionar/remover/editar, informa dados desconhecidos e compara opções sem confirmar transações.
  - Critérios de conclusão: tela funciona em mobile e desktop com estados acessíveis; T036 passa.

## Fase 5: US3 — Cartão alimentação, saldo mensal e períodos (P1)

**Objetivo**: Exibir e manter créditos, gastos, ajustes, alertas, saldo e transições de período com regras aprovadas e rastreáveis.

- [ ] T043 [US3] Resolver e registrar a regra de saldo negativo no fechamento do período em `specs/001-controle-compras-domesticas/`.
  - Arquivos: `specs/001-controle-compras-domesticas/spec.md`, `specs/001-controle-compras-domesticas/plan.md`, `specs/001-controle-compras-domesticas/data-model.md`, `specs/001-controle-compras-domesticas/contracts/openapi.yaml`, `specs/001-controle-compras-domesticas/quickstart.md`.
  - Dependências: nenhuma tarefa técnica; exige decisão do usuário entre BR-007 e a proposta de transportar déficit por correção tardia documentada no modelo.
  - Critérios de aceitação: decisão explícita define interação entre carryover desativado, saldo negativo por correção posterior, dívida e período seguinte; exemplos numéricos cobrem saldo positivo e negativo.
  - Critérios de conclusão: decisão é aprovada pelo usuário e todos os artefatos passam a expressar uma única política; tarefa bloqueia somente rollover e efeitos de correções tardias.
- [ ] T044 [P] [US3] Escrever testes unitários de orçamento, período, carryover e alertas em `packages/domain/test/`.
  - Arquivos: `budget-period.test.ts`, `budget-ledger.test.ts`, `budget-alerts.test.ts`.
  - Dependências: T009, T010, T043.
  - Critérios de aceitação: testa crédito inicial, ajuste, gasto, saldo zero, limiares 80/90/100, arredondamento, virada do dia de recarga em mês curto, carryover e decisão de saldo negativo.
  - Critérios de conclusão: fórmulas e limites da política aprovada estão cobertos sem depender de banco ou relógio real.
- [ ] T045 [P] [US3] Escrever testes de integração de configuração, períodos e lançamentos em `apps/api/test/budget/`.
  - Arquivos: `budget-settings.e2e-spec.ts`, `budget-periods.e2e-spec.ts`, `budget-ledger.e2e-spec.ts`, `budget-concurrency.e2e-spec.ts`.
  - Dependências: T011, T013, T016, T043.
  - Critérios de aceitação: verifica idempotência do crédito, consistência de ledger/saldo, concorrência, isolamento, reabertura/correção tardia segundo a regra aprovada.
  - Critérios de conclusão: integrações usam replica set e provam rollback quando qualquer escrita financeira falha.
- [ ] T046 [P] [US3] Escrever fluxo E2E de orçamento e cartão alimentação em `apps/web/e2e/`.
  - Arquivos: `budget-period.spec.ts`.
  - Dependências: T007, T045.
  - Critérios de aceitação: pessoa usuária consulta período, saldo, crédito, gastos, ajustes, alertas e carryover; configurações são aplicadas ao próximo ciclo previsto.
  - Critérios de conclusão: fluxo verifica valores BRL formatados e não expõe saldos de outro domicílio.
- [ ] T047 [US3] Criar schemas, índices e repositórios de configurações e períodos em `apps/api/src/modules/budget/`.
  - Arquivos: `schemas/budget-settings.schema.ts`, `schemas/budget-period.schema.ts`, `budget-settings.repository.ts`, `budget-periods.repository.ts`, `budget.indexes.ts`.
  - Dependências: T012, T014, T043.
  - Critérios de aceitação: unicidade impede períodos duplicados por domicílio e data inicial; versões permitem atualização concorrente detectável.
  - Critérios de conclusão: seguir `data-model.md` — BudgetSettings.householdId, BudgetSettings.monthlyCreditCents, BudgetSettings.rechargeDay, BudgetSettings.carryoverEnabled, BudgetSettings.effectiveFrom, BudgetSettings.updatedAt; BudgetPeriod.householdId, BudgetPeriod.startDate, BudgetPeriod.endDate, BudgetPeriod.monthlyCreditCents, BudgetPeriod.openingCarryoverCents, BudgetPeriod.totalAvailableCents, BudgetPeriod.cardSpentCents, BudgetPeriod.currentBalanceCents, BudgetPeriod.status, BudgetPeriod.version, BudgetPeriod.createdAt, BudgetPeriod.closedAt; valores monetários são inteiros seguros em centavos.
- [ ] T048 [US3] Criar schemas e repositórios append-only de ledger e alertas em `apps/api/src/modules/budget/`.
  - Arquivos: `schemas/budget-ledger-entry.schema.ts`, `schemas/budget-alert.schema.ts`, `budget-ledger.repository.ts`, `budget-alerts.repository.ts`.
  - Dependências: T012, T047.
  - Critérios de aceitação: lançamentos têm origem/idempotência verificável e alertas guardam o snapshot que cruzou o limiar sem duplicatas.
  - Critérios de conclusão: seguir `data-model.md` — BudgetLedgerEntry.householdId, BudgetLedgerEntry.budgetPeriodId, BudgetLedgerEntry.type, BudgetLedgerEntry.direction, BudgetLedgerEntry.amountCents, BudgetLedgerEntry.sourcePurchaseId, BudgetLedgerEntry.sourceCorrectionId, BudgetLedgerEntry.idempotencyKey, BudgetLedgerEntry.occurredAt, BudgetLedgerEntry.note; BudgetAlert.householdId, BudgetAlert.budgetPeriodId, BudgetAlert.thresholdPercent, BudgetAlert.crossedAt, BudgetAlert.spentCentsAtCrossing, BudgetAlert.totalAvailableCentsAtCrossing; unicidade e valores monetários validados.
- [ ] T049 [US3] Implementar serviço de ciclo, crédito mensal e carryover em `apps/api/src/modules/budget/`.
  - Arquivos: `budget-period.service.ts`, `budget-cycle.service.ts`, `recharge-calendar.ts`, `budget.module.ts`.
  - Dependências: T047, T048, T044, T043.
  - Critérios de aceitação: cria períodos determinísticos pela data de recarga, limita dia em meses curtos, mantém snapshots e aplica carryover conforme política aprovada.
  - Critérios de conclusão: chamadas repetidas não duplicam períodos/créditos; mudança de configuração só afeta a data efetiva definida.
- [ ] T050 [US3] Implementar ajustes, lançamentos e alertas de saldo em `apps/api/src/modules/budget/`.
  - Arquivos: `budget-ledger.service.ts`, `budget-alerts.service.ts`, `budget-balance-calculator.ts`.
  - Dependências: T048, T049, T044.
  - Critérios de aceitação: ajuste exige motivo e auditoria; crédito/gasto/estorno são lançados uma vez; alertas cruzam limiares de 80%, 90% e 100% do disponível.
  - Critérios de conclusão: saldo materializado reconcilia com ledger em teste e todas as mutações são transacionais/idempotentes.
- [ ] T051 [US3] Publicar endpoints e DTOs de configurações, períodos, saldo e ajustes em `apps/api/src/modules/budget/`.
  - Arquivos: `apps/api/src/modules/budget/budget.controller.ts`, `apps/api/src/modules/budget/budget-settings.controller.ts`, `apps/api/src/modules/budget/dto/`, `specs/001-controle-compras-domesticas/contracts/openapi.yaml`.
  - Dependências: T013, T049, T050.
  - Critérios de aceitação: API atende leitura de período/histórico, configuração e ajuste com validação, proteção e contratos Swagger.
  - Critérios de conclusão: não aceita `householdId` do cliente como autorização e T045 passa.
- [ ] T052 [US3] Implementar telas do cartão alimentação e configuração de orçamento em `apps/web/src/app/(app)/budget/`.
  - Arquivos: `page.tsx`, `periods/[periodId]/page.tsx`, `components/budget/`, `components/settings/`.
  - Dependências: T018, T020, T051.
  - Critérios de aceitação: apresenta crédito, saldo, gastos, histórico, alertas e carryover com formatação BRL acessível; configuração explica quando passa a valer.
  - Critérios de conclusão: layout responsivo e estados de erro/vazio/loading; T046 passa.

## Fase 6: US4 — Compras, pagamentos parciais e correções (P1)

**Objetivo**: Registrar compras em rascunho, finalizar atomicamente estoque/preços/financeiro e permitir correções e cancelamentos auditáveis.

- [ ] T053 [US4] Resolver a semântica de compra parcial e vínculo com itens de lista em `specs/001-controle-compras-domesticas/`.
  - Arquivos: `specs/001-controle-compras-domesticas/spec.md`, `specs/001-controle-compras-domesticas/plan.md`, `specs/001-controle-compras-domesticas/data-model.md`, `specs/001-controle-compras-domesticas/contracts/openapi.yaml`, `specs/001-controle-compras-domesticas/quickstart.md`.
  - Dependências: nenhuma tarefa técnica; exige decisão do usuário sobre a regra de quantidades parciais já proposta no modelo e no quickstart.
  - Critérios de aceitação: decisão define se quantidade não comprada permanece pendente, como reabrir/revisar lista e como correções/devoluções restauram quantidade; cobre item comprado parcialmente e compra sem lista.
  - Critérios de conclusão: usuário aprova semântica e os cinco artefatos descrevem os mesmos estados e efeitos; bloqueia somente vínculo e reversão da lista.
- [ ] T054 [P] [US4] Escrever testes unitários de cálculo, divisão de pagamento e ciclo de compra em `packages/domain/test/`.
  - Arquivos: `purchase-calculation.test.ts`, `payment-allocation.test.ts`, `purchase-correction.test.ts`, `purchase-idempotency.test.ts`.
  - Dependências: T009, T010, T043, T053.
  - Critérios de aceitação: cobre quantidade decimal, preço/ desconto por linha, soma de subtotais, alocação de métodos igual ao total, correção, cancelamento e chave idempotente.
  - Critérios de conclusão: expectativas incluem casos de borda de arredondamento HALF_UP e resultado financeiro em centavos inteiros.
- [ ] T055 [P] [US4] Escrever testes de integração transacional de compras em `apps/api/test/purchases/`.
  - Arquivos: `purchase-draft.e2e-spec.ts`, `purchase-finalize.e2e-spec.ts`, `purchase-correction.e2e-spec.ts`, `purchase-cancel.e2e-spec.ts`, `purchase-concurrency.e2e-spec.ts`.
  - Dependências: T045, T031, T051, T053.
  - Critérios de aceitação: finalização grava compra, alocações, lançamentos, saldos, movimentos, observações de preço e auditoria em uma transação; falhas revertem tudo.
  - Critérios de conclusão: replica set verifica repetição idempotente, colisão, concorrência, compra parcial e efeitos de período fechado conforme decisões aprovadas.
- [ ] T056 [P] [US4] Escrever fluxo E2E de compra, pagamento dividido e correção em `apps/web/e2e/`.
  - Arquivos: `purchase-lifecycle.spec.ts`.
  - Dependências: T036, T046, T055.
  - Critérios de aceitação: pessoa usuária monta rascunho, altera item, aplica desconto, divide pagamento, finaliza e consulta/corrige ou cancela com motivo.
  - Critérios de conclusão: fluxo verifica saldo/estoque atualizados uma única vez e histórico legível após operação repetida.
- [ ] T057 [US4] Criar schema, índice e repositório de estabelecimentos em `apps/api/src/modules/purchases/`.
  - Arquivos: `schemas/store.schema.ts`, `stores.repository.ts`, `purchase.indexes.ts`.
  - Dependências: T012, T014.
  - Critérios de aceitação: nome normalizado é único por domicílio, busca funciona e referências históricas permanecem após desativação.
  - Critérios de conclusão: seguir `data-model.md` — Store.householdId, Store.name, Store.normalizedName, Store.status, Store.notes.
- [ ] T058 [US4] Criar schemas e repositórios de compra, itens e alocações em `apps/api/src/modules/purchases/`.
  - Arquivos: `schemas/purchase.schema.ts`, `schemas/purchase-item.schema.ts`, `schemas/payment-allocation.schema.ts`, `purchases.repository.ts`, `purchase-items.repository.ts`.
  - Dependências: T012, T026, T037, T047, T057.
  - Critérios de aceitação: estados e revisões são explícitos; total de pagamento deve reconciliar com total da compra e referências são escopadas ao domicílio.
  - Critérios de conclusão: seguir `data-model.md` — Purchase.householdId, Purchase.state, Purchase.purchaseDate, Purchase.storeId, Purchase.sourceShoppingListId, Purchase.subtotalCents, Purchase.totalDiscountCents, Purchase.totalCents, Purchase.paymentAllocations, Purchase.idempotencyKey, Purchase.revision, Purchase.createdAt, Purchase.finalizedAt, Purchase.cancelledAt; PurchaseItem.householdId, PurchaseItem.purchaseId, PurchaseItem.lineNumber, PurchaseItem.productId, PurchaseItem.presentationId, PurchaseItem.sourceShoppingListItemId, PurchaseItem.quantity, PurchaseItem.enteredUnit, PurchaseItem.baseQuantity, PurchaseItem.unitPriceCents, PurchaseItem.discountCents, PurchaseItem.subtotalCents, PurchaseItem.storeId, PurchaseItem.occurredAt; PaymentAllocation.method, PaymentAllocation.amountCents; convenções de centavos e quantidades em `data-model.md`.
- [ ] T059 [US4] Criar schemas e repositórios de correções e observações de preço em `apps/api/src/modules/purchases/` e `apps/api/src/modules/pricing/`.
  - Arquivos: `schemas/purchase-correction.schema.ts`, `purchase-corrections.repository.ts`, `schemas/price-observation.schema.ts`, `price-observations.repository.ts`.
  - Dependências: T012, T058.
  - Critérios de aceitação: correções são append-only e ligam revisões; preço normalizado guarda unidade comparável e pode ser invalidado sem apagar histórico.
  - Critérios de conclusão: seguir `data-model.md` — PurchaseCorrection.householdId, PurchaseCorrection.purchaseId, PurchaseCorrection.type, PurchaseCorrection.reason, PurchaseCorrection.beforeRevision, PurchaseCorrection.afterRevision, PurchaseCorrection.itemDeltas, PurchaseCorrection.paymentDeltas, PurchaseCorrection.occurredAt, PurchaseCorrection.actorId; PriceObservation.householdId, PriceObservation.purchaseId, PriceObservation.purchaseItemId, PriceObservation.productId, PriceObservation.presentationId, PriceObservation.storeId, PriceObservation.observedAt, PriceObservation.netPriceCents, PriceObservation.normalizedUnitPrice, PriceObservation.normalizedUnit, PriceObservation.valid.
- [ ] T060 [US4] Implementar ciclo transacional de rascunho, finalização, correção e cancelamento em `apps/api/src/modules/purchases/`.
  - Arquivos: `purchase-lifecycle.service.ts`, `purchase-calculation.service.ts`, `purchase-finalization.service.ts`, `purchase-correction.service.ts`, `purchase-cancellation.service.ts`, `purchase.module.ts`.
  - Dependências: T010, T028, T048, T050, T058, T059, T054, T055.
  - Critérios de aceitação: finalização em uma transação grava estoque, budget ledger, snapshots de saldo, preço e auditoria; correção/cancelamento emitem deltas compensatórios sem apagar eventos passados.
  - Critérios de conclusão: todo o conjunto passa atomicamente ou sofre rollback; idempotência evita dupla cobrança e dupla entrada em estoque; efeitos seguem regra aprovada para período fechado.
- [ ] T061 [US4] Publicar endpoints e DTOs do ciclo de compras em `apps/api/src/modules/purchases/`.
  - Arquivos: `apps/api/src/modules/purchases/purchases.controller.ts`, `apps/api/src/modules/purchases/purchase-history.controller.ts`, `apps/api/src/modules/purchases/dto/`, `specs/001-controle-compras-domesticas/contracts/openapi.yaml`.
  - Dependências: T013, T060.
  - Critérios de aceitação: API implementa rascunho, edição, finalização, correção, cancelamento e histórico com idempotência, revisão e erros de conflito.
  - Critérios de conclusão: Swagger/client refletem contratos e T055 passa integralmente.
- [ ] T062 [US4] Implementar telas de registrar, revisar e detalhar compras em `apps/web/src/app/(app)/purchases/`.
  - Arquivos: `new/page.tsx`, `[purchaseId]/page.tsx`, `components/purchases/`, `components/payment-allocation/`.
  - Dependências: T018, T020, T042, T052, T061.
  - Critérios de aceitação: interface aceita compras fora de lista, parcial, descontos, pagamentos divididos e confirmação explícita; correção/cancelamento pede motivo.
  - Critérios de conclusão: componentes exibem subtotais e centavos sem erro de arredondamento, informam sucesso/falha e T056 passa.
- [ ] T063 [US4] Aplicar quantidade comprada e remanescente nos itens da lista de forma atômica em `apps/api/src/modules/shopping-lists/`.
  - Arquivos: `shopping-list-purchase-sync.service.ts`, `shopping-list-items.repository.ts`, `shopping-lists.module.ts`.
  - Dependências: T038, T053, T060.
  - Critérios de aceitação: compra parcial, correção e cancelamento atualizam o vínculo de lista conforme estados aprovados, na mesma transação da operação financeira.
  - Critérios de conclusão: retries não acumulam quantidade duas vezes e cenários de rollback de T055/T056 passam.

## Fase 7: US5 — Preços e recomendações baseados no histórico (P2)

**Objetivo**: Aprender padrões domésticos e comparar preços usando observações verificáveis, expondo incerteza e permitindo correção manual.

- [ ] T064 [P] [US5] Escrever testes unitários de recorrência, consumo e comparabilidade de preços em `packages/domain/test/`.
  - Arquivos: `consumption-baseline.test.ts`, `recurrence.test.ts`, `price-comparison.test.ts`, `confidence-state.test.ts`.
  - Dependências: T023, T034, T054.
  - Critérios de aceitação: testa limiar mínimo de histórico, observações inválidas, unidades comparáveis, consumo negativo/divergente, sazonalidade simples e correção de sugestão.
  - Critérios de conclusão: resultados são determinísticos e indicam quando não há evidência suficiente para recomendação.
- [ ] T065 [P] [US5] Escrever testes de integração de preços e recomendações em `apps/api/test/insights-pricing/`.
  - Arquivos: `price-history.e2e-spec.ts`, `price-comparison.e2e-spec.ts`, `recommendations.e2e-spec.ts`, `manual-feedback.e2e-spec.ts`.
  - Dependências: T055, T031, T061.
  - Critérios de aceitação: verifica isolamento, filtros, apresentação/unidade comparável, estados sem amostra, validade de observação e persistência auditada de correção manual.
  - Critérios de conclusão: nenhum preço estimado é retornado como observado e nenhum serviço externo é exigido.
- [ ] T066 [P] [US5] Escrever fluxo E2E de comparação e ajuste de recomendação em `apps/web/e2e/`.
  - Arquivos: `prices-insights.spec.ts`.
  - Dependências: T056, T065.
  - Critérios de aceitação: pessoa usuária compara preços por apresentação/unidade, consulta padrão de consumo, visualiza nível de evidência e ajusta sugestão.
  - Critérios de conclusão: ajuste é persistido e o histórico continua identificando dado original e mudança manual.
- [ ] T067 [US5] Implementar análise estatística local de consumo e recorrência em `apps/api/src/modules/insights/`.
  - Arquivos: `consumption-analysis.service.ts`, `recurrence-analysis.service.ts`, `insights.repository.ts`, `insights.module.ts`.
  - Dependências: T028, T039, T060, T064.
  - Critérios de aceitação: calcula referências a partir de movimentos confirmados e compras finalizadas; reconhece correções/divergências e explicita tamanho da amostra e estado de confiança.
  - Critérios de conclusão: algoritmo não chama provedor externo, é coberto por T064 e expõe portas para futura estratégia alternativa.
- [ ] T068 [US5] Implementar histórico e comparação de preços observados em `apps/api/src/modules/pricing/`.
  - Arquivos: `price-history.service.ts`, `price-comparison.service.ts`, `price-comparability.ts`, `pricing.module.ts`.
  - Dependências: T059, T060, T064.
  - Critérios de aceitação: compara somente unidade/dimensão e apresentações compatíveis, permite filtros por período/loja e exclui observações inválidas de agregações.
  - Critérios de conclusão: resultados têm origem, data, unidade e quantidade de observações rastreáveis; T065 passa.
- [ ] T069 [US5] Implementar feedback manual em sugestões e registrar auditoria em `apps/api/src/modules/insights/`.
  - Arquivos: `recommendation-feedback.service.ts`, `insights.controller.ts`, `audit.service.ts`.
  - Dependências: T017, T067, T064.
  - Critérios de aceitação: alteração manual afeta somente preferência/quantidade futura, não reescreve eventos históricos nem compras; auditoria identifica ator e valores alterados.
  - Critérios de conclusão: seguir `data-model.md` — Product.usualPurchaseQuantity, Product.recurrencePreference e AuditEvent.householdId, AuditEvent.actorId, AuditEvent.entityType, AuditEvent.entityId, AuditEvent.action, AuditEvent.beforeSummary, AuditEvent.afterSummary, AuditEvent.source, AuditEvent.occurredAt, AuditEvent.correlationId; testes de autorização e auditoria passam.
- [ ] T070 [US5] Publicar endpoints e telas de preços e recomendações em `apps/api/src/modules/pricing/` e `apps/web/src/app/(app)/`.
  - Arquivos: `apps/api/src/modules/pricing/pricing.controller.ts`, `apps/api/src/modules/insights/insights.controller.ts`, `apps/web/src/app/(app)/prices/page.tsx`, `apps/web/src/app/(app)/prices/[presentationId]/page.tsx`, `apps/web/src/app/(app)/insights/page.tsx`, `apps/web/src/components/pricing/`, `apps/web/src/components/insights/`, `specs/001-controle-compras-domesticas/contracts/openapi.yaml`.
  - Dependências: T018, T020, T065, T067, T068, T069.
  - Critérios de aceitação: oferece comparativo, histórico e padrões de consumo com explicações, filtros e estado “histórico insuficiente”; feedback manual requer confirmação.
  - Critérios de conclusão: API documentada e interface responsiva; T066 passa sem afirmar precisão estatística além do suporte dos dados.

## Fase 8: US6 — Dashboard, navegação e histórico unificado (P2)

**Objetivo**: Reunir o estado financeiro e operacional, navegação responsiva, filtros e consulta do histórico de movimentações.

- [ ] T071 [P] [US6] Escrever testes de componentes para estados de dashboard, filtros e navegação em `apps/web/test/`.
  - Arquivos: `dashboard.test.tsx`, `period-selector.test.tsx`, `global-search.test.tsx`, `app-navigation.test.tsx`.
  - Dependências: T007, T020.
  - Critérios de aceitação: cobre períodos sem dados, erros, carregamento, filtros, teclado, foco, rótulos acessíveis e menu móvel.
  - Critérios de conclusão: componentes críticos têm testes de interação antes da implementação das telas da história.
- [ ] T072 [P] [US6] Escrever testes de integração dos agregados de dashboard e histórico em `apps/api/test/dashboard-history/`.
  - Arquivos: `dashboard.e2e-spec.ts`, `history.e2e-spec.ts`, `search-filters.e2e-spec.ts`.
  - Dependências: T007, T045, T055, T065, T017.
  - Critérios de aceitação: agregados reconciliam com saldos e eventos de origem, respeitam período/filtros/isolamento e não expõem dados sensíveis de auditoria.
  - Critérios de conclusão: consultas são validadas contra banco e erros de leitura são tratados sem mutar dados.
- [ ] T073 [P] [US6] Escrever fluxo E2E de visão geral e navegação em `apps/web/e2e/`.
  - Arquivos: `dashboard-navigation.spec.ts`, `history-search.spec.ts`.
  - Dependências: T007, T056, T066, T072.
  - Critérios de aceitação: navega pelos módulos, troca período, filtra histórico e confere os principais valores em viewport móvel e desktop.
  - Critérios de conclusão: fluxo confirma navegação por teclado e links diretos para telas de detalhe.
- [ ] T074 [US6] Implementar serviços e endpoints de agregação do dashboard em `apps/api/src/modules/dashboard/`.
  - Arquivos: `dashboard-query.service.ts`, `dashboard.controller.ts`, `dashboard.module.ts`, `dto/dashboard-summary.dto.ts`.
  - Dependências: T050, T060, T067, T068, T072.
  - Critérios de aceitação: agrega saldo, compras, alertas e itens prioritários do período solicitado sem duplicar lógica de domínio ou materializar dados derivados incorretamente.
  - Critérios de conclusão: dados reconciliam com módulos de origem e T072 passa para dashboard.
- [ ] T075 [US6] Implementar pesquisa e filtros paginados de domínio em `apps/api/src/modules/search/`.
  - Arquivos: `search.module.ts`, `search.service.ts`, `search.controller.ts`, `search-query.dto.ts`.
  - Dependências: T029, T038, T060, T017.
  - Critérios de aceitação: pesquisa respeita escopo de domicílio, limita campos expostos, paginação estável e filtros/ordenação permitidos por contrato.
  - Critérios de conclusão: índices e limites evitam varredura sem limite; T072 passa para busca e filtros.
- [ ] T076 [US6] Implementar dashboard web com gráficos e resumo financeiro em `apps/web/src/app/(app)/dashboard/`.
  - Arquivos: `page.tsx`, `components/dashboard/`, `components/charts/`, `components/period-selector.tsx`.
  - Dependências: T018, T020, T074.
  - Critérios de aceitação: gráficos Recharts têm alternativa textual, valores usam BRL, período é selecionável e conteúdo prioriza ações úteis sem ocultar alertas.
  - Critérios de conclusão: componentes se adaptam a telas pequenas e T071/T073 passam.
- [ ] T077 [US6] Implementar tela de histórico de movimentações e filtros em `apps/web/src/app/(app)/history/`.
  - Arquivos: `page.tsx`, `components/history/`, `apps/api/src/modules/audit/audit.controller.ts`.
  - Dependências: T017, T060, T068, T075.
  - Critérios de aceitação: lista compras, ajustes, mudanças de estoque e ações auditáveis por período/tipo/origem, com ligação para os registros disponíveis.
  - Critérios de conclusão: resumos omitem segredos e dados desnecessários; paginação e filtros não alteram registros históricos.
- [ ] T078 [US6] Completar shell de navegação e rotas dos módulos em `apps/web/src/app/(app)/`.
  - Arquivos: `layout.tsx`, `components/app-navigation.tsx`, `components/mobile-navigation.tsx`, `components/module-links.ts`.
  - Dependências: T032, T042, T052, T062, T070, T076, T077.
  - Critérios de aceitação: navegação contempla Dashboard, Produtos, Estoque doméstico, Listas, Compras, Cartão alimentação, Preços, Recomendações, Histórico e Configurações; Configurações aponta às preferências de orçamento previstas, sem criar domínio não especificado.
  - Critérios de conclusão: menu responsivo, foco e estados ativos acessíveis; todas as rotas implementadas têm ligação e T073 passa.

## Fase 9: Qualidade, segurança operacional e entrega

**Objetivo**: Concluir a qualidade transversal, capacidade operacional e rastreabilidade dos requisitos antes do aceite do MVP.

- [ ] T079 [P] Executar e registrar benchmarks de consultas críticas em `apps/api/test/performance/`.
  - Arquivos: `catalog-performance.e2e-spec.ts`, `purchase-history-performance.e2e-spec.ts`, `dashboard-performance.e2e-spec.ts`, `docs/performance.md`.
  - Dependências: T031, T061, T074, T075.
  - Critérios de aceitação: cargas de referência incluem 500 produtos e 1.000 compras e medem percentil 95; objetivo de resposta é até 2 s nas consultas definidas no plano.
  - Critérios de conclusão: resultados, ambiente, índices faltantes e desvios são documentados; índices/limites necessários são corrigidos antes do aceite.
- [ ] T080 [P] Revisar segurança, retenção, backup e restauração em `apps/api/`, `compose.yaml` e `docs/operations.md`.
  - Arquivos: `apps/api/src/common/security/`, `apps/api/src/common/observability/`, `compose.yaml`, `docs/operations.md`, `.github/workflows/ci.yml`.
  - Dependências: T016, T022, T051, T060.
  - Critérios de aceitação: documenta threat model básico, retenção, acesso a segredos, backup criptografado, restauração verificada, logs redigidos e proteção de Swagger/CSRF/CORS.
  - Critérios de conclusão: roteiro de restore testado em ambiente isolado e checklist de segurança sem credenciais reais versionadas.
- [ ] T081 [P] Consolidar documentação de produto, API e operação em `README.md`, `docs/` e `specs/001-controle-compras-domesticas/`.
  - Arquivos: `README.md`, `docs/development.md`, `docs/operations.md`, `docs/api.md`, `specs/001-controle-compras-domesticas/spec.md`, `specs/001-controle-compras-domesticas/plan.md`, `specs/001-controle-compras-domesticas/data-model.md`, `specs/001-controle-compras-domesticas/contracts/openapi.yaml`, `specs/001-controle-compras-domesticas/quickstart.md`.
  - Dependências: T033, T052, T061, T070, T078, T080.
  - Critérios de aceitação: documentação descreve arquitetura, inicialização, backup/restore, fluxos de compra/estoque/saldo, decisões aprovadas e rotas vigentes.
  - Critérios de conclusão: comandos/exemplos correspondem ao código e contrato gerado; documentos não deixam ambiguidades conhecidas sem decisão ou issue explícita.
- [ ] T082 Configurar gates finais de CI para qualidade e segurança em `.github/workflows/ci.yml`.
  - Arquivos: `.github/workflows/ci.yml`, `package.json`, configs dos workspaces.
  - Dependências: T007, T022, T079, T080.
  - Critérios de aceitação: pipeline executa lint, typecheck, unitários, integração, E2E, build e verificação de drift OpenAPI em jobs apropriados.
  - Critérios de conclusão: falha bloqueia merge em erro; execução não depende de segredo pessoal e publica artefatos de teste úteis.
- [ ] T083 Analisar consistência SDD e reconciliar tarefas restantes em `specs/001-controle-compras-domesticas/`.
  - Arquivos: `.specify/memory/constitution.md`, `specs/001-controle-compras-domesticas/spec.md`, `specs/001-controle-compras-domesticas/plan.md`, `specs/001-controle-compras-domesticas/tasks.md`, `specs/001-controle-compras-domesticas/data-model.md`, `specs/001-controle-compras-domesticas/contracts/openapi.yaml`, `specs/001-controle-compras-domesticas/quickstart.md`.
  - Dependências: T043, T053, T081, T082.
  - Critérios de aceitação: executar análise Spec Kit de consistência; cada requisito funcional/não funcional tem tarefa e evidência de aceite, e cada decisão pendente está resolvida ou registrada como bloqueio explícito.
  - Critérios de conclusão: lista de tarefas está completa e rastreável, nenhuma implementação contradiz a constituição e a aprovação do planejamento continua sendo o gate para iniciar código.

## Dependências e ordem de execução

- **Sequência base**: T001 → T002–T008 → T009–T022. T009 e T011 são testes escritos antes das primitivas e da infraestrutura de aplicação; T012–T022 completam a fundação.
- **MVP incremental**: US1 (T023–T033) habilita catálogo e estoque; US3 (T043–T052) habilita o cartão e saldo mensal; US2 (T034–T042) habilita listas apoiadas por catálogo/estoque e consulta de saldo; US4 (T053–T063) fecha o fluxo de compra e consistência. T039 pode avançar após US1, mas opções de orçamento e conclusão da US2 aguardam T050/T051. O MVP funcional é composto por essas quatro histórias, sujeito à aprovação dos gates T043 e T053.
- **P2**: US5 (T064–T070) depende de observações confiáveis de compras/estoque; US6 (T071–T078) consolida módulos já funcionais. T079–T083 são gates transversais de entrega.
- **Dependências centrais**: T030 depende dos schemas e testes US1; T039 depende de estoque e catálogo; T049–T050 dependem de política aprovada em T043; T060 depende de budget, estoque, catálogo e política de compra parcial em T053; T063 depende da decisão de T053; dashboard e analytics dependem dos eventos gerados por compras finalizadas.
- **Bloqueios delimitados**: não implementar rollover que trate saldo negativo sem T043 aprovado; não implementar sincronização de quantidades parciais/correções de lista sem T053 aprovado. Trabalho independente de infraestrutura, catálogo, histórico de preços e interfaces não afetadas pode avançar.

## Oportunidades de paralelização

- **Setup**: após T001/T002, T003, T004 e T006 podem avançar em paralelo; T005 também pode avançar após T002. T007 depende das aplicações e pacotes inicializados.
- **US1**: testes unitários, de API e E2E (T023–T025) são paralelos após os respectivos runners. A implementação de catálogo (T026/T029) e a de conferência (T027/T028/T030) podem ser divididas após alinhamento dos contratos; telas (T032) aguardam endpoints T031.
- **US2**: testes unitários/API/E2E (T034–T036) podem ser escritos em paralelo. Persistência/revisão (T037–T038) e algoritmo de geração/simulação (T039–T040) são frentes distintas depois dos tipos comuns.
- **US3**: após decisão T043, testes unitários, integração e E2E (T044–T046) podem avançar em paralelo; implementação de schema/configuração (T047) e documentação de UX pode ser separada, mas ciclo e ledger exigem os modelos.
- **US4**: depois de T053, testes de domínio/API/UI (T054–T056) podem avançar em paralelo. Store (T057), modelos de compra (T058) e revisão de contrato podem ser distribuídos; finalização (T060) espera todos os módulos que participam da transação.
- **US5**: testes unitários, integração e fluxo web (T064–T066) são paralelos; análise de consumo (T067) e comparativos de preço (T068) podem ser implementados em módulos separados.
- **US6**: testes (T071–T073) podem ser divididos; dashboard agregado (T074), pesquisa (T075) e componentes visuais (T076) são frentes separáveis após seus contratos.
- Uma tarefa só recebe `[P]` quando pode modificar arquivos distintos e avançar sem alterar os mesmos contratos/arquivos de uma tarefa concorrente.

### Exemplos de execução paralela por história

```text
US1: T023 + T024 + T025 (testes) → T026 + T027 (schemas) → T028 + T029 → T030 → T031 → T032 → T033
US2: T034 + T035 + T036 (testes) → T037 → T038; em paralelo após T037, T039 → T040 → T041 → T042
US3: T043 (decisão) → T044 + T045 + T046 (testes) → T047 → T048 → T049 → T050 → T051 → T052
US4: T053 (decisão) → T054 + T055 + T056 (testes) → T057 + T058 → T059 → T060 → T061 → T062 + T063
US5: T064 + T065 + T066 (testes) → T067 + T068; depois T069 → T070
US6: T071 + T072 + T073 (testes) → T074 + T075 → T076 + T077 → T078
```

## Estratégia de implementação incremental

1. **Base executável**: configurar workspace, Mongo replica set, contratos, validação, autenticação, escopo do domicílio, auditoria e regras exatas de dinheiro/quantidade.
2. **Primeiro slice utilizável**: concluir US1 para cadastrar catálogo e conferir estoque manualmente, com histórico de movimentos.
3. **MVP de saldo e decisão de compra**: concluir US3 e então US2 para consultar crédito e gerar/editar lista explicável com prévias sem mutação; a geração básica de sugestões pode ser desenvolvida em paralelo após US1.
4. **Fechar ciclo de valor**: concluir US4 para registrar compra e manter saldo, estoque, preços, lista e histórico consistentes em transação.
5. **Ampliar aprendizado e visibilidade**: implementar US5 e US6 depois de existir histórico confiável; preservar “dados insuficientes” como resultado válido.
6. **Aceite operacional**: concluir performance, segurança, backup/restore, documentação, CI e análise SDD antes do gate de implementação/aprovação previsto no planejamento.

## Notas

- O escopo desta lista é planejamento; nenhuma tarefa implementa código nesta etapa.
- A checklist de tarefa fica desmarcada até execução e evidência dos critérios de conclusão.
- Os campos dos schemas devem seguir `data-model.md`; as referências incluídas em cada tarefa mantêm rastreabilidade sem redefinir constraints nesta lista.
- Tecnologias e decisões de arquitetura permanecem as aprovadas em `plan.md`; mudança de regra exige atualizar especificação, modelo, contratos e tarefas pelo fluxo Spec Kit.

