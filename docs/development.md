# Desenvolvimento

Use Node.js 24 e o pnpm fixado em package.json. Execute na raiz:

    corepack pnpm install --frozen-lockfile
    pnpm dev

A interface usa a porta 3000 e a API a porta 3001. Consulte /api/v1/health para verificar a API. Com Docker Engine e Compose, execute docker compose up --build -d e confira docker compose ps. O MongoDB usa rs0, volume dados e porta local 27117. A URI para o host está em .env.example. Dentro dos contêineres, o endereço é mongo:27017.

## Verificações

    pnpm lint
    pnpm typecheck
    pnpm build
    pnpm test
    pnpm test:integration
    pnpm exec playwright install chromium
    pnpm test:e2e

Os testes de integração carregam a API compilada. Na primeira execução o runner baixa o MongoDB 8.0.16 e inicia um replica set temporário. TEST_MONGODB_URI permite usar um replica set de teste existente. Cada teste de persistência cria e remove sua própria base. Playwright inicia os builds locais nas portas 43100 e 43101.

O provisionamento administrativo da pessoa proprietária está previsto em T021. A etapa inicial expõe a página de entrada e a rota de saúde.
