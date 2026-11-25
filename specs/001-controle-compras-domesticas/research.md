# Pesquisa e decisões técnicas

**Feature**: Sistema de Controle de Compras Domésticas  
**Data**: 2026-11-24  
**Escopo**: decisões técnicas para o planejamento; nenhuma integração externa de IA é necessária no MVP.

## 1. Runtime e versões

**Decisão**: Usar Node.js 24 LTS e TypeScript em modo estrito. Fixar as versões exatas no lockfile quando o plano for aprovado. Usar Next.js 16.x com App Router, NestJS 12.x e Mongoose 9.x, verificando compatibilidade de dependências no início da implementação.

**Rationale**: Node.js 24 permanece em uma linha LTS suportada. Next.js 16 está em Active LTS, NestJS 12 documenta suporte a Node 20.19+ ou 22.12+, e Mongoose 9 é a versão atual documentada. Node 24 satisfaz os requisitos indicados e evita adotar uma linha recém-promovida antes de confirmar a compatibilidade do conjunto.

**Alternatives considered**: Node.js 26 LTS, por ser uma linha mais nova, e NestJS 11/Mongoose 8, por maturidade mais longa. Preferir Node 24 com as versões atuais compatíveis, sujeito à verificação do lockfile.

**Fontes**: [Node.js releases](https://nodejs.org/en/about/previous-releases), [Next.js support policy](https://nextjs.org/support-policy), [Next.js 16.2](https://nextjs.org/blog/next-16-2), [NestJS version compatibility](https://docs.nestjs.com/faq/versions), [Mongoose version support](https://mongoosejs.com/docs/version-support.html).

## 2. Monorepo e fronteiras de pacotes

**Decisão**: Criar um workspace pnpm com apps e pacotes internos. Usar o protocolo workspace para dependências locais.

**Rationale**: O pnpm define workspaces por pnpm-workspace.yaml e o protocolo workspace impede que uma dependência interna seja substituída silenciosamente por uma publicação do registry. Os apps ficam isolados por responsabilidade; contratos gerados e primitivas puras podem ser compartilhados.

**Alternatives considered**: Um único pacote com frontend e backend acoplados, ou workspaces separados sem pacotes compartilhados. A estrutura multi-app atende à separação solicitada e permite reutilização sem compartilhar schemas de persistência.

**Estrutura proposta**:
- apps/web: Next.js, rotas, telas, formulários e acesso à API.
- apps/api: NestJS, módulos de domínio, REST, validação e persistência.
- packages/ui: componentes shadcn/ui compartilhados, sem lógica de negócio.
- packages/domain: valores monetários, quantidades, unidades e regras puras compartilháveis.
- packages/api-client: tipos/cliente gerados da definição OpenAPI.
- packages/config-typescript e packages/config-eslint: configurações comuns, sem dependências de runtime.

**Fontes**: [pnpm workspaces](https://pnpm.io/workspaces/), [shadcn/ui em monorepos](https://ui.shadcn.com/docs/monorepo).

## 3. Frontend e comportamento de dados

**Decisão**: App Router; layouts e páginas como Server Components por padrão. Usar Client Components apenas para formulários, filtros interativos, checklist, carrinho e gráficos. TanStack Query controla cache e mutações nas áreas interativas.

**Rationale**: Server Components reduzem JavaScript enviado ao navegador e podem carregar dados iniciais no servidor. Em telas que usam TanStack Query, criar um QueryClient por requisição no servidor, pré-carregar/hidratar quando necessário e invalidar somente as consultas afetadas após mutações. Saldos, estoque e compras usam leituras sem cache compartilhado entre usuários; não reutilizar estado mutável em escopo de módulo.

**Alternatives considered**: Transformar toda a aplicação em Client Components ou usar somente cache do Next. A abordagem mista reduz bundle e mantém atualizações explícitas para dados financeiros mutáveis.

**Decisão de UI**: shadcn/ui em packages/ui e Tailwind mobile-first. React Hook Form com Zod para formulários; a validação visual não substitui a validação NestJS. Recharts fica em componentes carregados apenas nas telas de análise e cada gráfico tem resumo tabular/textual equivalente.

**Fontes**: [Next.js App Router](https://nextjs.org/docs/app), [Server e Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [TanStack Query SSR](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr), [React Hook Form](https://react-hook-form.com/get-started), [Zod](https://zod.dev/basics), [Tailwind responsive design](https://tailwindcss.com/docs/responsive-design), [Recharts ResponsiveContainer](https://recharts.github.io/en-US/api/ResponsiveContainer/).

## 4. API, módulos NestJS e validação

**Decisão**: Aplicação NestJS em módulos de domínio, controllers REST finos, services/use cases para regras e repositories para acesso Mongoose. Publicar a API sob /api/v1 e gerar OpenAPI/Swagger a partir dos controllers e DTOs. Gerar o cliente TypeScript do frontend a partir do contrato versionado.

**Rationale**: O NestJS encapsula providers por módulo e integra Mongoose. ValidationPipe com whitelist, forbidNonWhitelisted e transform rejeita propriedades não declaradas e valida entradas antes dos casos de uso. SwaggerModule gera a definição OpenAPI. Na produção, a UI e os endpoints JSON/YAML do Swagger ficam desabilitados ou protegidos explicitamente, pois guards globais não os protegem automaticamente.

**Alternatives considered**: Acesso aos modelos diretamente nos controllers, contrato duplicado manualmente no frontend, ou expor Swagger sem restrição em produção. As alternativas aumentam acoplamento, divergência e exposição de documentação interna.

**Fontes**: [NestJS modules](https://docs.nestjs.com/modules), [NestJS MongoDB/Mongoose](https://docs.nestjs.com/data/mongodb), [NestJS validation](https://docs.nestjs.com/techniques/validation), [NestJS OpenAPI](https://docs.nestjs.com/openapi/introduction).

## 5. Dinheiro, quantidades e persistência

**Decisão**: Dinheiro trafega e persiste como inteiro de centavos, validado como inteiro seguro. Quantidades trafegam como texto decimal canônico e persistem como Decimal128, limitadas a 12 algarismos inteiros e 15 casas decimais. O pacote `decimal.js` executa multiplicações e conversões com 60 algarismos significativos; conversões que não cabem exatamente nos 34 algarismos do Decimal128 são rejeitadas.

**Rationale**: Os centavos inteiros evitam frações monetárias em armazenamento e soma. A validação de inteiro seguro mantém o valor exato no runtime JavaScript e no BSON numérico para o escopo doméstico definido. Quantidades fracionadas podem exceder a precisão decimal binária de um Number; Decimal128 e entrada textual preservam o valor. `decimal.js` oferece aritmética decimal configurável. A precisão de 60 cobre produtos dos limites definidos e qualquer saída que exceda a precisão persistível do Decimal128 falha explicitamente. Na linha de compra, preço em centavos multiplicado por quantidade decimal é arredondado uma vez por linha, conforme BR-003.

**Alternatives considered**: Reais em ponto flutuante, rejeitado por risco de erro de arredondamento; dinheiro em Decimal128 ou BSON Long/BigInt, opções exatas mas que adicionam conversão/serialização sem benefício dentro do limite seguro adotado; quantidades em Number, rejeitado por precisão e conversões fracionadas; aritmética binária nativa, rejeitada para os cálculos de domínio.

**Unidade canônica**: Persistir quantidade de estoque na unidade-base compatível da apresentação: gramas, mililitros ou unidades. Entrada em fração de pacote é convertida usando conteúdo cadastrado; apresentação e quantidade digitada também permanecem no registro de conferência/compra para auditoria e exibição. Não converter dimensões incompatíveis nem presumir conteúdo ausente.

**Fontes**: [MongoDB monetary data](https://www.mongodb.com/docs/manual/tutorial/model-monetary-data/), [MongoDB BSON types](https://www.mongodb.com/docs/manual/reference/bson-types/), [MongoDB schema validation](https://www.mongodb.com/docs/manual/core/schema-validation/), [Mongoose SchemaTypes](https://mongoosejs.com/docs/schematypes.html), [JavaScript safe integers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger), [decimal.js API](https://mikemcl.github.io/decimal.js/).

## 6. Consistência entre compra, estoque e orçamento

**Decisão**: Finalizar, corrigir ou cancelar uma compra numa transação MongoDB que inclua estado da compra, itens, movimentos de estoque, ledger do cartão, observações de preço e eventos de auditoria. Aplicar chave idempotente e índices únicos para tornar reenvios seguros.

**Rationale**: MongoDB fornece transações ACID multi-documento para replica sets e clusters sharded. Uma falha em qualquer escrita deve reverter o conjunto. A transação fica curta e não executa operações paralelas no mesmo session. O Docker Compose local configura um replica set de nó único; o ambiente de produção deve usar uma configuração suportada para transações e disponibilidade.

**Alternatives considered**: Várias gravações sem transação ou compensações após falha. Ambas permitem que estoque, saldo e compra discordem. Microserviços e saga são desnecessários para o volume e escopo do MVP.

**Fluxo de finalização**: verificar estado draft, totais e soma das formas de pagamento; dentro da sessão, ler/atualizar condicionalmente o período do orçamento, impedir gasto de cartão acima do saldo, finalizar a compra, criar movimentos de estoque e orçamento e registrar preços. Só retornar sucesso após commit. Reenvio com a mesma chave idempotente retorna o resultado já finalizado.

**Fontes**: [MongoDB transactions](https://www.mongodb.com/docs/manual/core/transactions/), [MongoDB transaction production considerations](https://www.mongodb.com/docs/manual/core/transactions-production-consideration/), [Mongoose transactions](https://mongoosejs.com/docs/transactions.html), [MongoDB unique indexes](https://www.mongodb.com/docs/manual/core/index-unique/).

## 7. Análise histórica e extensibilidade

**Decisão**: O MVP calcula sugestões com regras determinísticas e estatísticas sobre compras e conferências confirmadas. Não consulta serviços externos de IA. Interfaces de domínio isolam a estratégia de sugestão e os adaptadores futuros de captura.

**Rationale**: A regra inicial é auditável e explicável. Uma sugestão mostra suas entradas e confiança/insuficiência de dados; uma pessoa confirma todas as mudanças. Futuras fontes de OCR, voz ou IA devem produzir um rascunho canônico de compra/estoque, nunca gravar saldos diretamente.

**Alternatives considered**: Exigir provedor de IA externo ou permitir que uma sugestão altere estoque, compra ou orçamento automaticamente. Ambos elevam custo/risco e contradizem o escopo do MVP.

**Fontes**: As regras e limites de histórico vêm da especificação aprovada, BR-015 a BR-023; não existe dependência externa neste MVP.

## 8. Testes e execução local

**Decisão**: Jest como runner unitário e de integração, Supertest para HTTP NestJS e Playwright para testes ponta a ponta. Usar MongoDB real em replica set nos testes de integração de transações; usar mocks de repositories nos unitários. Docker Compose usa healthcheck e service_healthy para aguardar a prontidão do MongoDB.

**Rationale**: NestJS fornece TestingModule e integração tradicional com Jest. Next.js documenta Jest para componentes, mas fluxos com Server Components assíncronos devem ser verificados via E2E. Playwright pode iniciar os servidores e aguardar prontidão antes dos cenários.

**Alternatives considered**: Vitest como runner único (válido, mas exige configurar a integração NestJS por fora do caminho padrão) ou somente mocks/servidor Mongo standalone (não prova atomicidade multi-documento).

**Fontes**: [NestJS testing](https://docs.nestjs.com/fundamentals/testing), [Next.js Jest guide](https://nextjs.org/docs/app/guides/testing/jest), [Playwright webServer](https://playwright.dev/docs/test-webserver), [MongoDB transactions](https://www.mongodb.com/docs/manual/core/transactions/), [Docker Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/).

## 9. Premissas de produto mantidas no planejamento

- O período de orçamento segue a data de recarga descrita na especificação; a configuração de acúmulo permanece explícita. Para a primeira configuração, a interface solicita a escolha antes de criar o período, sem presumir acúmulo.
- A lista de compras recebe prévias de redução, adiamento ou apresentação alternativa sem alterar seus itens até o aceite explícito. Compra parcial associa linhas por id estável; quantidades não compradas permanecem pendentes e podem ser completadas em compras seguintes.
- Correções e cancelamentos mantêm o registro original auditável, corrigem o período original para relatórios e lançam movimentação compensatória no saldo vigente quando o período já foi fechado. O plano propõe que um saldo negativo por correção não bloqueie a correção e seja levado ao próximo período mesmo com o acúmulo de sobras desativado; confirmar a política antes de gerar tarefas.
- A arquitetura considera um único domicílio no MVP; os documentos carregam householdId desde o início para isolamento, sem compartilhar acesso familiar.
- Uma sessão autenticada de proprietário protege dados pessoais/financeiros. O plano não inclui cadastro público nem compartilhamento familiar; provisionamento da primeira pessoa proprietária ocorre no bootstrap de implantação.
- Nenhum código de aplicação foi gerado; estas decisões são parte do desenho submetido à aprovação.
