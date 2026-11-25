# Guia de validação após implementação

Este roteiro registra os comandos e fluxos de aceite esperados para a feature. O monorepo ainda não foi implementado; portanto, os comandos abaixo são planejamento e não foram executados.

## Pré-requisitos previstos

- Node.js 24 LTS e Corepack habilitado.
- pnpm fixado no campo `packageManager` da raiz.
- Docker Engine com Docker Compose.
- Arquivo `.env` criado a partir de `.env.example`, com segredos locais e URI MongoDB do replica set `rs0`.
- Primeiro usuário proprietário provisionado pelo procedimento administrativo de bootstrap; o sistema não oferece cadastro público.

## Inicialização prevista

```powershell
corepack enable
pnpm install --frozen-lockfile
docker compose up -d mongo
pnpm dev
```

O serviço MongoDB deve ficar saudável e inicializar o replica set de nó único antes de a API abrir conexões. A API e o ambiente de integração devem usar transações reais, não um modo alternativo sem transação.

## Verificações de qualidade previstas

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm build
```

Os nomes acima são scripts pretendidos da raiz do workspace. A etapa de implementação deve alinhá-los aos pacotes, documentar variáveis de ambiente e manter o contrato OpenAPI sincronizado com os DTOs e o cliente TypeScript.

## Fluxos de negócio de referência

1. **Configurar o orçamento:** no primeiro acesso, configurar crédito recorrente padrão de R$ 700,00, dia de recarga e escolha explícita sobre acumular saldo. Datas inexistentes em meses curtos usam o último dia daquele mês. Uma alteração recorrente vale a partir do período seguinte.
2. **Conferir estoque fracionado:** cadastrar uma apresentação de 1,6 kg e confirmar 0,5 pacote; o estoque agregado aumenta em 800 g. O histórico conserva o valor e a apresentação informados. Linhas omitidas em uma conferência parcial permanecem inalteradas.
3. **Gerar lista:** com estoque conhecido e dados suficientes, revisar quantidade, preço estimado e motivo de cada sugestão. Sem estoque conferido ou base suficiente, indicar a lacuna em vez de assumir zero ou inventar valores. Se o total exceder o saldo, consultar opções de adequação e comprovar que a prévia não muda a lista; só uma edição aceita explicitamente aplica a opção.
4. **Registrar compra parcial:** vincular linhas de compra aos itens de lista. Itens não adquiridos permanecem pendentes; quantidade adquirida menor que a quantidade desejada deixa o restante pendente. Nenhum item pendente afeta estoque ou orçamento. Uma divisão de R$ 250,00 no cartão sobre saldo de R$ 700,00 resulta em saldo de R$ 450,00.
5. **Proteger o saldo:** impedir a finalização quando a parcela do cartão exceder o disponível. Uma alocação explícita a outro meio de pagamento pode cobrir a diferença. Reenvio com a mesma chave de idempotência não cria gasto nem entrada de estoque duplicados.
6. **Corrigir ou cancelar:** manter a compra e movimentos originais auditáveis, registrar deltas compensatórios e atualizar o saldo e o estoque de forma atômica. Se o estorno fizer o estoque ficar negativo, solicitar reconciliação explícita. Após o fechamento do período, corrigir o histórico de origem e registrar compensação no saldo vigente; um débito maior que o saldo mostra saldo negativo e bloqueia novas alocações ao cartão até haver crédito suficiente. No desenho proposto, esse déficit é levado ao período seguinte mesmo que o acúmulo de sobra positiva esteja desligado.
7. **Provar rollback e concorrência:** falha em qualquer gravação da finalização deixa compra, ledger, projeção de estoque, preço e auditoria sem efeitos parciais. Duas finalizações concorrentes não podem consumir o mesmo saldo.
8. **Virada do período:** validar recarga configurada no dia 31 durante mês curto; sobras positivas seguem a escolha de acúmulo, e déficit por correção segue a política aprovada sem ser apagado.

## Critério de conclusão da feature

Considerar a feature pronta quando os fluxos acima passarem nos testes unitários, de integração com MongoDB replica set e Playwright, os contratos e o cliente não apresentarem drift, e lint, typecheck e builds de web/API estiverem aprovados. A revisão deve confirmar a documentação em português, acessibilidade/responsividade e trilha de alterações.
