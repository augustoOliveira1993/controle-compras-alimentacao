# Modelo de dados e consistência

**Persistência**: MongoDB com Mongoose.  
**Escopo de isolamento**: todo documento de negócio carrega householdId. O MVP tem um único domicílio e uma pessoa proprietária; a chave de domicílio cria isolamento e deixa futura participação familiar possível sem compartilhar coleções.

## Tipos e convenções

| Conceito | Representação | Validação |
|---|---|---|
| Identificadores | ObjectId | Validar presença e existência no domicílio autorizado |
| Dinheiro | number inteiro em centavos | Number.isSafeInteger, não negativo quando valor de entrada; máximo 2^53−1 |
| Quantidade | Decimal128 no MongoDB; texto decimal canônico na API | Até 12 algarismos inteiros e 15 casas decimais; positiva para compra, não negativa em conferência; conversão decimal exata |
| Unidade-base | g, ml ou un | Conversão apenas dentro da mesma dimensão; fatores conhecidos, como kg para g |
| Datas de operação | instante UTC e data civil local do período | Período e recarga avaliados pelo calendário America/Sao_Paulo |
| Valores derivados | projeções apoiadas por movimentos e registros de origem | Reconciliáveis a partir do ledger, compras e conferências |

A API usa centavos inteiros para todo valor financeiro. Aritmética decimal em `decimal.js` usa precisão de 60 algarismos significativos para manter produtos exatos dentro dos limites de entrada; antes de persistir, resultados Decimal128 são rejeitados se excederem 34 algarismos significativos ou não puderem ser representados sem arredondamento. O preço unitário em centavos multiplicado por quantidade Decimal128 é arredondado uma vez por metade para cima no subtotal da linha. Totais são somas inteiras de subtotais, validados como inteiros seguros. Quantidades chegam como strings decimais para evitar interpretação binária prematura.

Apresentações guardam conteúdo e unidade comercial, além da dimensão e unidade-base. Uma entrada de 0,5 pacote de 1,6 kg pode ser normalizada para 800 g. A entrada original, o conteúdo de embalagem e a unidade escolhida permanecem registrados para exibição e auditoria.

## Relacionamentos

| Origem | Relação | Destino |
|---|---|---|
| Household | 1:N | User, Category, Product, ProductPresentation, Store, BudgetPeriod |
| User | 1:N | Session |
| Product | 1:N | ProductPresentation |
| Category | 1:N hierárquica | Subcategory e Product |
| Household + Product | 1:1 atual | InventoryBalance agregado em unidade-base |
| InventoryCheck | 1:N embutido | InventoryCheckLine |
| InventoryBalance | 1:N | StockMovement |
| ShoppingList | 1:N embutido | ShoppingListItem |
| ShoppingListItem | 1:N opcional | PurchaseItem de compras parciais |
| BudgetSettings | 1:1 | Household |
| BudgetPeriod | 1:N | BudgetLedgerEntry e BudgetAlert |
| Purchase | 1:N | PurchaseItem, PaymentAllocation, PurchaseCorrection |
| PurchaseItem | 1:1 | PriceObservation vigente |
| Household | 1:N | AuditEvent |

## Coleções e schemas Mongoose

### Household

- Campos: name, locale fixo pt-BR, currency fixo BRL, ownerUserId, createdAt.
- Relações: raiz lógica de todos os registros de negócio.
- Índices: ownerUserId único no MVP; índice de leitura por _id.
- Regras: não aceitar householdId fornecido pelo cliente; obter do contexto autenticado.

### User

- Campos: email, emailNormalized, passwordHash, householdId, role OWNER, active, createdAt, updatedAt.
- Índices: emailNormalized único; householdId + active.
- Regras: nenhum cadastro público ou compartilhamento familiar no MVP. O primeiro proprietário é provisionado no bootstrap de implantação. Nunca devolver passwordHash.

### Session

- Campos: userId, householdId, tokenHash, createdAt, expiresAt, revokedAt opcional, lastSeenAt.
- Índices: tokenHash único; userId + expiresAt; índice TTL sobre expiresAt para limpeza após expiração.
- Regras: o token bruto existe somente no cookie do navegador e nunca é persistido; logout e revogação invalidam a sessão no servidor.

### Category

- Campos: householdId, name, normalizedName, parentId opcional, status, isSeeded.
- Índices: householdId + parentId + normalizedName único; householdId + status + normalizedName para listagem.
- Regras: categorias iniciais são semeadas de forma idempotente. Categoria usada por produto não é apagada fisicamente; pode ser inativada.

### Product

- Campos: householdId, name, normalizedName, categoryId, subcategoryId opcional, quantityDimension WEIGHT | VOLUME | COUNT, baseUnit g | ml | un, priority HIGH | MEDIUM | LOW, recurrencePreference AUTO | RECURRING | OCCASIONAL, status ACTIVE | INACTIVE, minimumHomeQuantity Decimal128 opcional, usualPurchaseQuantity Decimal128 opcional, notes, createdAt, updatedAt.
- Índices: householdId + status + normalizedName; householdId + categoryId + status; busca textual limitada a nome e observações.
- Regras: quantidade mínima e habitual usam a unidade-base do produto. Marca e tamanho ficam na apresentação. Inativar preserva histórico.

### ProductPresentation

- Campos: householdId, productId, brand opcional, normalizedBrand, packageContent Decimal128 opcional, packageUnit, baseUnitsPerPackage Decimal128 opcional, cardEligibility ELIGIBLE | INELIGIBLE | UNKNOWN, status, createdAt, updatedAt.
- Índices: householdId + productId + normalizedBrand + packageContent + packageUnit único para identidade exata; householdId + productId + status.
- Regras: packageUnit e baseUnitsPerPackage convertem para a unidade-base do produto. Marca e embalagem distintas são variantes válidas. Correspondência aproximada apenas alerta possível duplicado; identidade exata é rejeitada como duplicada. Conversão de peso para volume é proibida sem regra explícita.

### Store

- Campos: householdId, name, normalizedName, status, notes opcionais.
- Índices: householdId + normalizedName único; householdId + status.
- Regras: supermercado digitado pode criar uma sugestão de Store após confirmação; não há catálogo externo de lojas.

### BudgetSettings

- Campos: householdId, monthlyCreditCents default 70000, rechargeDay 1–31, carryoverEnabled boolean obrigatório após configuração inicial, effectiveFrom, updatedAt.
- Índice: householdId único.
- Regras: mudança recorrente vale a partir do próximo período. No primeiro uso, a interface solicita se o saldo acumula, sem impor um padrão.

### BudgetPeriod

- Campos: householdId, startDate, endDate, monthlyCreditCents, openingCarryoverCents assinado, totalAvailableCents assinado, cardSpentCents, currentBalanceCents assinado, status OPEN | CLOSED, version, createdAt, closedAt.
- Índices: householdId + startDate único; householdId + status + startDate; índice único parcial em householdId quando status = OPEN, para garantir um só período corrente.
- Regras: abertura sob demanda e idempotente; uma única janela ativa por domicílio. Totais são inteiros de centavos. Ledger é a fonte de auditoria; currentBalance é a soma assinada do ledger e os campos derivados são projeções atualizadas na mesma transação. Sobra positiva só acumula quando carryoverEnabled; saldo negativo originado por correção é levado ao próximo período como débito para não apagar histórico financeiro. Correções de período fechado são sempre registradas mesmo quando deixam saldo corrente negativo; novas compras limitam gasto no cartão a max(0, currentBalanceCents). Esta política de déficit requer aprovação.

### BudgetLedgerEntry

- Campos: householdId, budgetPeriodId, type MONTHLY_CREDIT | EXTRA_CREDIT | ADJUSTMENT | PURCHASE_SPEND | CORRECTION, direction CREDIT | DEBIT, amountCents positivo, sourcePurchaseId opcional, sourceCorrectionId opcional, idempotencyKey, occurredAt, note opcional.
- Índices: householdId + budgetPeriodId + occurredAt desc; householdId + sourcePurchaseId + type único parcial para PURCHASE_SPEND; householdId + sourceCorrectionId único parcial quando sourceCorrectionId existe; householdId + idempotencyKey único.
- Regras: somente a parcela FOOD_CARD de um pagamento gera PURCHASE_SPEND. PIX, dinheiro e outros métodos não reduzem o saldo do cartão. Ledger não é apagado; correções são novas entradas.

### BudgetAlert

- Campos: householdId, budgetPeriodId, thresholdPercent 80 | 90 | 100, crossedAt, spentCentsAtCrossing, totalAvailableCentsAtCrossing.
- Índice único: budgetPeriodId + thresholdPercent.
- Regras: gravar na primeira travessia do limiar; novos créditos não apagam o alerta já apresentado.

### InventoryCheck e InventoryCheckLine

- InventoryCheck: householdId, state DRAFT | CONFIRMED | CANCELLED, source MANUAL | FREE_TEXT, confirmedAt, createdAt, parserReviewStatus opcional.
- InventoryCheckLine: productId opcional para item desconhecido, presentationId opcional para conversão/atribuição de marca, rawText opcional, enteredQuantity Decimal128, enteredUnit, baseQuantity Decimal128 quando conversível, matchingStatus MATCHED | AMBIGUOUS | UNKNOWN, confirmed.
- Índices: householdId + confirmedAt desc; householdId + state + createdAt.
- Regras: estoque é agregado por produto na unidade-base; presentationId registra qual embalagem foi contada quando conhecida. A conferência atualiza somente linhas confirmadas; omissões não criam saldo zero. Texto livre cria prévia revisável; jamais grava estoque sozinho.

### InventoryBalance

- Campos: householdId, productId, baseQuantity Decimal128, baseUnit, lastConfirmedAt, lastMovementAt, version.
- Índice único: householdId + productId; índice householdId + lastMovementAt.
- Regras: saldo agrega apresentações compatíveis do mesmo produto. A projeção atual não substitui StockMovement ou InventoryCheck. Lista não trata estoque desconhecido como zero.

### StockMovement

- Campos: householdId, productId, presentationId opcional, kind PURCHASE_IN | STOCK_CHECK_ADJUSTMENT | PURCHASE_CORRECTION | MANUAL_ADJUSTMENT, deltaBaseQuantity Decimal128 assinado, sourceType, sourceId, sourceLineId opcional, occurredAt, actorId.
- Índices: householdId + productId + occurredAt desc; householdId + sourceType + sourceId + sourceLineId + kind único quando sourceLineId existe (índice único parcial).
- Regras: movimento é append-only. Alteração de compra adiciona correção; não reescreve movimento anterior. Se estorno de compra implicar saldo físico negativo, a operação exige reconciliação de estoque explícita em vez de ocultar a divergência.

### ShoppingList e ShoppingListItem

- ShoppingList: householdId, state DRAFT | ACTIVE | COMPLETED, budgetPeriodId, generatedAt, revision, createdAt, updatedAt, sourceInventoryCheckId opcional, estimatedTotalCents opcional.
- ShoppingListItem: subdocumento com id estável; productId e suggestedPresentationId opcionais, rawName opcional, state SUGGESTED | SELECTED | PARTIALLY_PURCHASED | PURCHASED | DEFERRED | REMOVED, quantityAtHomeBase Decimal128 opcional, suggestedBaseQuantity Decimal128 opcional, chosenPackageQuantity Decimal128 opcional, purchasedBaseQuantity Decimal128 opcional, remainingBaseQuantity Decimal128 opcional, baseUnit, lastPriceCents opcional, estimatedUnitPriceCents opcional, estimatedSubtotalCents opcional, priority, rationaleCodes, rationaleText, manualOverride.
- Índices: householdId + state + createdAt desc; householdId + budgetPeriodId + createdAt desc.
- Índices: além dos índices do agregado, buscar referências a itens de lista e impor unicidade de item por compra, permitindo que várias compras cubram quantidades parciais ao longo do tempo.
- Regras: edição manual fica preservada na lista. A lista guarda snapshot da justificativa e do preço estimado usados. Opções de adequação ao orçamento são prévias sem mutação; alterações só são persistidas após aceite explícito. Na compra parcial, PurchaseItem referencia o id do item da lista; somente itens e quantidades efetivamente adquiridos são movimentados. Quantidade parcialmente adquirida atualiza purchasedBaseQuantity e remainingBaseQuantity, mantendo o restante como pendente. Correção/cancelamento restaura a quantidade pendente na mesma transação. Preço estimado é por apresentação selecionada; comparação entre apresentações normaliza para a unidade-base.

### Purchase e PurchaseItem

- Purchase: householdId, state DRAFT | FINALIZED | CORRECTED | CANCELLED, purchaseDate, storeId, sourceShoppingListId opcional, subtotalCents, totalDiscountCents, totalCents, paymentAllocations, idempotencyKey opcional antes da finalização, revision, createdAt, finalizedAt, cancelledAt opcional.
- PurchaseItem: householdId, purchaseId, lineNumber, productId, presentationId, sourceShoppingListItemId opcional, quantity Decimal128 na unidade comercial, enteredUnit, baseQuantity Decimal128, unitPriceCents, discountCents, subtotalCents, storeId, occurredAt.
- PaymentAllocation: method FOOD_CARD | CASH | DEBIT | CREDIT | PIX | OTHER, amountCents.
- Índices Purchase: householdId + idempotencyKey único e parcial (a chave só é gravada ao finalizar); householdId + state + purchaseDate desc; householdId + sourceShoppingListId.
- Índices PurchaseItem: purchaseId + lineNumber único; purchaseId + sourceShoppingListItemId único parcial; householdId + sourceShoppingListItemId + occurredAt para buscar compras parciais relacionadas; householdId + productId + occurredAt desc; householdId + storeId + occurredAt desc.
- Regras: soma de subtotais = totalCents; soma das alocações de pagamento = totalCents; gasto FOOD_CARD <= saldo dentro da transação. Itens de compra são fonte de verdade do preço observado.

### PurchaseCorrection

- Campos: householdId, purchaseId, type EDIT | CANCEL, reason, beforeRevision, afterRevision, itemDeltas, paymentDeltas, occurredAt, actorId.
- Índices: householdId + purchaseId + occurredAt; purchaseId + afterRevision único.
- Regras: manter compra original e histórico de revisão. Corrigir os relatórios do período de origem; depois do fechamento, registrar movimento compensatório no período corrente sem apagar a origem.

### PriceObservation

- Campos: householdId, purchaseId, purchaseItemId, productId, presentationId, storeId, observedAt, netPriceCents, normalizedUnitPrice Decimal128, normalizedUnit, valid.
- Índices: purchaseItemId único; householdId + presentationId + storeId + observedAt desc; householdId + productId + normalizedUnit + observedAt desc.
- Regras: criada na mesma transação da compra finalizada. `normalizedUnitPrice` é derivado e arredondado a 12 casas decimais por metade para cima; `netPriceCents` e a quantidade-base permanecem como origem exata. Correção atualiza a projeção e mantém o evento de auditoria; cancelamento invalida a observação, sem apagá-la. Médias/tendências ignoram registros inválidos.

### AuditEvent

- Campos: householdId, actorId, entityType, entityId, action, beforeSummary, afterSummary, source, occurredAt, correlationId.
- Índices: householdId + entityType + entityId + occurredAt desc; householdId + occurredAt desc.
- Regras: armazenar apenas campos necessários à trilha; nunca gravar segredos, credenciais ou número do cartão.

## Análise e cálculo

- Quantidade média por compra: média aritmética de quantidades compradas válidas em unidade-base; excluir compras corrigidas/canceladas.
- Intervalo e frequência: calcular com pelo menos três datas de compra distintas; sugerir recorrência automaticamente, mantendo preferência manual.
- Produto novo: primeira compra confirmada da apresentação.
- Produto possivelmente não comprado: sem compra por mais de duas vezes o intervalo médio observado.
- Preço médio por apresentação: média aritmética das observações válidas comparáveis; comparação entre tamanhos usa preço por unidade-base. Valores médios exibidos em centavos são arredondados uma vez por metade para cima; ordenação usa a métrica normalizada de precisão decimal.
- Consumo entre conferências: quantidade inicial + entradas de compra válidas − quantidade final. Resultado negativo indica divergência, não consumo negativo.
- Lista: quantidade-base inicia na diferença positiva entre quantidade-alvo e estoque conhecido; consumo histórico suficiente pode elevar o alvo para cobrir uso até o próximo intervalo médio. Cada ajuste gera código e texto de justificativa.

## Transições e invariantes

| Entidade | Transição | Efeito permitido |
|---|---|---|
| InventoryCheck | DRAFT → CONFIRMED | Atualizar somente apresentações nas linhas confirmadas e registrar ajustes de estoque |
| ShoppingList | DRAFT → ACTIVE | Habilitar edição/seleção; não altera saldo ou estoque |
| ShoppingListItem | SELECTED → PARTIALLY_PURCHASED → PURCHASED | Cada finalização soma a quantidade comprada; o restante continua pendente até zerar |
| Purchase | DRAFT → FINALIZED | Uma transação grava compra, ledger, estoque, preços e auditoria |
| Purchase | FINALIZED → CORRECTED | Criar revisão e deltas compensatórios, mantendo a revisão anterior |
| Purchase | FINALIZED → CANCELLED | Estornar saldo/estoque e invalidar preço de origem, com trilha auditável |
| BudgetPeriod | OPEN → CLOSED | Fechar após início do próximo ciclo; correções posteriores permanecem rastreáveis |

Invariantes:
- Uma compra não pode ter linhas sem apresentação reconhecida no momento da finalização.
- Não confirmar a mesma chave idempotente duas vezes.
- Estoque, ledger, compra e preço são commitados juntos ou nenhum deles é commitado.
- Se saldo disponível não cobre a parcela do cartão, abortar a transação e retornar conflito recuperável.
- Consultas e mutações sempre filtram por householdId obtido da sessão; não confiar em identificador de domicílio enviado no corpo.
- Atualizações concorrentes de períodos, listas ou balanços usam version/revision otimista; conflito retorna 409 para nova leitura/confirmação.
