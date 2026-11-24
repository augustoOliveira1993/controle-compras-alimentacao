# Feature Specification: Sistema de Controle de Compras Domésticas

**Feature Branch**: Não criada (nenhum hook de branch configurado)

**Created**: 2026-11-23

**Status**: Draft

**Input**: Descrição funcional fornecida pelo usuário para controle de compras domésticas, estoque, planejamento e cartão alimentação.

**Objetivo**: Apoiar o planejamento e o registro das compras da casa, manter o estoque residencial e o orçamento do cartão alimentação atualizados e produzir sugestões explicáveis a partir do histórico registrado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar produtos e conferir o estoque (Priority: P1)

Como pessoa responsável pelas compras da casa, quero manter um catálogo de produtos e registrar o que ainda tenho em casa para evitar compras desnecessárias e identificar itens que precisam de reposição.

**Why this priority**: O catálogo e o estoque formam a base para produzir listas úteis e acompanhar o consumo.

**Independent Test**: Cadastrar produtos com diferentes apresentações, registrar manualmente e por texto um inventário parcial, confirmar a atualização e consultar o histórico de conferências.

**Acceptance Scenarios**:

1. **US1-C1 — Dado** uma instalação sem categorias personalizadas, **Quando** a pessoa abre o catálogo, **Então** encontra as categorias iniciais Alimentos, Carnes, Bebidas, Hortifruti, Limpeza, Higiene pessoal e Outros, e pode criar ou editar categorias.
2. **US1-C2 — Dado** um produto já cadastrado, **Quando** a pessoa cria uma apresentação com marca, unidade e tamanho, **Então** os dados do produto e sua prioridade, recorrência, quantidades de referência, preços e elegibilidade ao cartão ficam consultáveis; marcas ou tamanhos diferentes podem coexistir e uma apresentação equivalente é sinalizada como possível duplicado.
3. **US1-C3 — Dado** produtos cadastrados com unidades definidas, **Quando** a pessoa informa manualmente quantidades inteiras ou fracionadas, **Então** cada quantidade é associada à apresentação e unidade correspondentes e fica sujeita à confirmação antes de atualizar o estoque.
4. **US1-C4 — Dado** uma lista em texto livre com produtos reconhecidos e desconhecidos, **Quando** o sistema a interpreta, **Então** mostra os itens e quantidades reconhecidos para revisão, permite corrigir correspondências e sugere cadastrar os itens desconhecidos.
5. **US1-C5 — Dado** a revisão do inventário, **Quando** a pessoa confirma uma lista parcial, **Então** somente os itens apresentados são atualizados; os itens omitidos não passam a ter estoque zero e a conferência fica disponível no histórico.

### User Story 2 - Planejar uma lista de compras (Priority: P1)

Como pessoa que planeja as compras, quero receber sugestões com base no estoque, nas necessidades e no histórico para preparar uma compra compatível com as prioridades da casa e o saldo do cartão.

**Why this priority**: A lista reúne os dados de estoque, necessidades e orçamento em uma decisão prática de compra.

**Independent Test**: Com um catálogo, um inventário e um saldo previamente registrados, gerar uma lista, conferir a justificativa de cada sugestão, alterar quantidades e visualizar o efeito estimado no orçamento.

**Acceptance Scenarios**:

1. **US2-C1 — Dado** estoque conferido, quantidade mínima e histórico disponível, **Quando** a pessoa gera uma lista, **Então** a sugestão parte da diferença entre o estoque conhecido e a quantidade-alvo, explica quais dados influenciaram quantidade e prioridade e separa itens essenciais, recorrentes e opcionais.
2. **US2-C2 — Dado** uma lista gerada, **Quando** a pessoa adiciona, remove ou altera itens e quantidades, **Então** o sistema preserva as alterações e recalcula os subtotais e o total estimado.
3. **US2-C3 — Dado** um item sem histórico suficiente de preços, **Quando** ele aparece na lista, **Então** o preço estimado e o subtotal são identificados como indisponíveis, sem valores inventados.
4. **US2-C4 — Dado** uma lista cujo total estimado ultrapassa o saldo disponível, **Quando** a pessoa solicita opções de planejamento, **Então** o sistema informa o excedente e pode sugerir reduções, adiamentos de itens opcionais ou apresentações com menor preço histórico, sem modificar a lista até a pessoa aceitar cada mudança.
5. **US2-C5 — Dado** listas anteriores, **Quando** a pessoa consulta o histórico de listas, **Então** consegue abrir uma lista antiga sem substituir ou alterar o estoque atual.
6. **US2-C6 — Dado** um produto sem conferência de estoque confirmada, **Quando** a pessoa gera uma lista, **Então** o estoque aparece como não conferido e a quantidade não é calculada como se fosse zero.

### User Story 3 - Acompanhar o orçamento do cartão alimentação (Priority: P1)

Como pessoa responsável pelo orçamento doméstico, quero acompanhar créditos, gastos, saldo e alertas do cartão para decidir quanto ainda posso planejar para o período.

**Why this priority**: O limite inicial de R$ 700,00 e o saldo disponível condicionam o planejamento e a confirmação de compras.

**Independent Test**: Iniciar com o crédito padrão, registrar créditos e ajustes, acompanhar os limiares de uso e consultar o saldo em períodos com e sem acúmulo.

**Acceptance Scenarios**:

1. **US3-C1 — Dado** a configuração inicial, **Quando** a pessoa consulta o período ativo, **Então** o orçamento mensal é de R$ 700,00; ao alterar o valor recorrente, a nova configuração vale a partir do próximo período, salvo ajuste explícito no período atual.
2. **US3-C2 — Dado** uma data de recarga, créditos e ajustes registrados, **Quando** começa um novo período, **Então** o saldo inicial reflete os valores aplicáveis e, quando habilitado, o saldo acumulado do período anterior; a pessoa também consegue consultar saldos e movimentações de períodos passados.
3. **US3-C3 — Dado** gastos que cruzam 80%, 90% e 100% do valor disponível no período, **Quando** cada limiar é atingido, **Então** o sistema apresenta o alerta correspondente sem omitir o limiar atingido.
4. **US3-C4 — Dado** uma compra acima do saldo do cartão, **Quando** a pessoa tenta finalizá-la, **Então** o sistema não a confirma silenciosamente como paga pelo cartão e permite finalizar somente após explicitar uma divisão com outra forma de pagamento para a diferença.

### User Story 4 - Registrar e corrigir compras (Priority: P1)

Como pessoa que está comprando ou organizando os comprovantes, quero registrar os itens, preços e pagamentos de cada compra para atualizar o saldo, o estoque e o histórico sem duplicidades.

**Why this priority**: O registro real da compra fecha o ciclo entre lista planejada, gasto, estoque e aprendizado histórico.

**Independent Test**: Registrar duas compras no mesmo período, finalizar uma compra com pagamento dividido, conferir saldo e estoque e corrigir ou cancelar uma compra já finalizada.

**Acceptance Scenarios**:

1. **US4-C1 — Dado** uma lista com itens e preços estimados, **Quando** a pessoa informa data, supermercado, itens, quantidades, preços unitários, descontos, forma de pagamento e observações enquanto marca itens no carrinho, **Então** o sistema recalcula subtotais e total em tempo real e apresenta a diferença entre estimado e realizado.
2. **US4-C2 — Dado** saldo de cartão de R$ 700,00 e nenhuma outra movimentação no período, **Quando** a pessoa finaliza uma compra de R$ 250,00 paga integralmente com o cartão, **Então** o saldo disponível passa a R$ 450,00.
3. **US4-C3 — Dado** uma compra finalizada, **Quando** o sistema a processa, **Então** registra o pagamento, atualiza o estoque e o histórico de preços e compras uma única vez.
4. **US4-C4 — Dado** a repetição acidental da confirmação da mesma compra, **Quando** ela é reenviada, **Então** o sistema não duplica o gasto, a entrada em estoque nem os registros históricos.
5. **US4-C5 — Dado** uma compra finalizada que precisa de correção ou cancelamento, **Quando** a pessoa confirma a alteração, **Então** saldo e estoque são corrigidos, a compra original e a correção permanecem rastreáveis e os períodos fechados são reconciliados sem apagar o histórico.

### User Story 5 - Consultar histórico, recorrência e comparação de preços (Priority: P2)

Como pessoa que acompanha hábitos de compra, quero consultar padrões e preços observados para tomar decisões com base no histórico real e corrigir sugestões inadequadas.

**Why this priority**: As análises se tornam mais úteis conforme as compras e conferências são registradas, mas o cadastro, o orçamento e a compra continuam utilizáveis sem esse histórico.

**Independent Test**: Registrar compras em diferentes datas e supermercados, consultar as métricas de um produto com dados suficientes e de outro sem dados suficientes e corrigir uma sugestão.

**Acceptance Scenarios**:

1. **US5-C1 — Dado** preços comparáveis registrados para apresentações do mesmo produto em diferentes supermercados, **Quando** a pessoa compara preços, **Então** vê menor, maior, médio e último preço, variação percentual e estabelecimento com menor preço histórico.
2. **US5-C2 — Dado** compras registradas em datas e preços diferentes, **Quando** a pessoa consulta o histórico, **Então** vê produtos comprados pela primeira vez, frequência e intervalo médio quando houver pelo menos três compras, quantidades médias e variações de quantidade e preço; produtos recorrentes são indicados conforme as regras de negócio.
3. **US5-C3 — Dado** histórico insuficiente para calcular uma média ou tendência, **Quando** a pessoa abre a análise, **Então** a métrica aparece como insuficiente ou indisponível e não como um valor estimado sem base.
4. **US5-C4 — Dado** um produto recorrente sem compra por período superior ao seu intervalo habitual calculado, **Quando** a pessoa consulta os itens, **Então** o sistema o sinaliza como possivelmente não comprado recentemente, sem removê-lo do catálogo.
5. **US5-C5 — Dado** uma sugestão de quantidade ou padrão incorreta, **Quando** a pessoa corrige a sugestão, **Então** o valor corrigido passa a orientar as próximas sugestões e a origem da correção permanece identificável.

### User Story 6 - Acompanhar o painel e usar o sistema durante as compras (Priority: P2)

Como pessoa que consulta o planejamento em casa ou no supermercado, quero encontrar rapidamente o saldo, as pendências e a lista para agir pelo computador ou celular.

**Why this priority**: O painel e o acesso durante a compra apoiam o uso contínuo, depois que o fluxo principal de registrar estoque e compra está disponível.

**Independent Test**: Abrir o painel com movimentos registrados, conferir seus indicadores e usar busca, filtros, ordenação e checklist em um celular e em um computador.

**Acceptance Scenarios**:

1. **US6-C1 — Dado** orçamento, compras, estoque e preços registrados, **Quando** a pessoa abre o painel, **Então** encontra os indicadores definidos nos requisitos, atualizados de acordo com esses registros e com o período selecionado.
2. **US6-C2 — Dado** uma lista de compras aberta em um celular, **Quando** a pessoa pesquisa, filtra, ordena e marca itens, **Então** consegue consultar e registrar preços sem perder acesso às ações essenciais da lista.
3. **US6-C3 — Dado** dados de períodos anteriores, **Quando** a pessoa troca o período do painel, **Então** os valores apresentados correspondem ao período escolhido e o saldo atual não é alterado pela consulta.
4. **US6-C4 — Dado** produtos, estoques, listas e compras registrados, **Quando** a pessoa pesquisa, filtra e ordena cada área, **Então** encontra os registros correspondentes e pode usar o checklist nas listas.

### Edge Cases

- Uma conferência de estoque pode ser parcial; produtos omitidos mantêm o estado anterior e não são tratados como zero.
- Uma linha de texto pode corresponder a mais de um produto ou apresentação; o usuário escolhe a correspondência ou solicita novo cadastro.
- Um item desconhecido pode ter quantidade fracionada; a quantidade deve ser preservada enquanto o cadastro é revisado.
- Uma quantidade não pode ser convertida automaticamente entre unidades incompatíveis, como litros e quilogramas.
- Um produto pode ter preço atual sem preço médio calculável; o último preço pode ser exibido separadamente da média.
- Sem preço histórico comparável, o sistema não sugere preço, tendência ou supermercado mais barato.
- Apresentações incompatíveis não recebem comparação unitária como se fossem equivalentes.
- Uma data de recarga no dia 29, 30 ou 31 precisa produzir períodos válidos em meses mais curtos.
- Se o preço ou desconto informado gerar subtotal negativo, a linha deve ser rejeitada para correção.
- Um desconto não pode superar o valor bruto da respectiva linha.
- Um item elegível ao cartão pode ser configurado como não elegível, e a elegibilidade desconhecida não é presumida.
- Um gasto acima do saldo disponível exige pagamento dividido explícito; a parte externa ao cartão não reduz o saldo do cartão.
- Uma alteração de compra depois do fechamento do período deve manter trilha de correção e reconciliar o período afetado.
- Uma segunda confirmação da mesma compra não deve duplicar estoque, saldo ou histórico.
- Se o estoque calculado a partir de compras e conferências resultar negativo, o sistema sinaliza divergência e não a contabiliza como consumo negativo.
- Se não houver registros suficientes para identificar recorrência, frequência ou variação, o sistema mostra a insuficiência de dados.

## Requirements *(mandatory)*

### Escopo do MVP

O MVP inclui catálogo de produtos e categorias; conferência manual e por texto do estoque; geração e edição de listas; controle do orçamento e do cartão alimentação; registro, correção e cancelamento de compras; histórico e comparação de preços; indicadores do painel; busca, filtros, ordenação e checklist; uso em computadores e celulares.

Ficam fora do MVP as funcionalidades futuras citadas na descrição: leitura de nota fiscal, OCR, importação por fotografia, leitura de código de barras, entrada por áudio, assistente de compras com inteligência artificial, compartilhamento familiar, notificações de reposição e exportação para Excel ou PDF. O MVP não consulta preços externos nem efetua pagamentos; registra informações fornecidas pela pessoa.

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar inicialmente as categorias Alimentos, Carnes, Bebidas, Hortifruti, Limpeza, Higiene pessoal e Outros. (US1-C1)
- **FR-002**: O sistema DEVE permitir criar, editar e selecionar categorias e subcategorias. (US1-C1)
- **FR-003**: O sistema DEVE permitir cadastrar, editar, ativar e inativar produtos com nome, marca, categoria, subcategoria, unidade, peso ou volume da apresentação, quantidade mínima desejada, quantidade habitual, prioridade, condição recorrente ou eventual, último preço, preço médio e observações. (US1-C2)
- **FR-004**: O sistema DEVE permitir apresentações do mesmo produto com marcas e tamanhos de embalagem diferentes e DEVE alertar sobre possíveis cadastros duplicados com identidade equivalente. (US1-C2)
- **FR-005**: O sistema DEVE permitir marcar produtos ou apresentações como recorrentes ou eventuais e registrar ou corrigir essa classificação manualmente. (US1-C2; US5-C2)
- **FR-006**: O sistema DEVE permitir indicar se uma apresentação pode ser paga com o cartão alimentação, não pode ou ainda não teve elegibilidade confirmada. (US1-C2; US3-C4)
- **FR-007**: O sistema DEVE permitir registrar estoque selecionando produtos cadastrados ou informando uma lista de texto livre com vários produtos e quantidades. (US1-C3; US1-C4)
- **FR-008**: Ao interpretar texto livre, o sistema DEVE apresentar correspondências e quantidades para revisão, permitir corrigir itens reconhecidos e sugerir o cadastro dos itens desconhecidos. (US1-C4)
- **FR-009**: O sistema DEVE solicitar confirmação antes de aplicar uma conferência e atualizar somente os produtos apresentados nessa conferência. (US1-C3; US1-C5)
- **FR-010**: O sistema DEVE manter histórico consultável das conferências, incluindo data e quantidades confirmadas por produto. (US1-C5)
- **FR-011**: O sistema DEVE gerar listas considerando estoque conhecido, quantidade mínima, quantidade habitual, consumo e compras observados, recorrência, prioridade, itens adicionais informados, preços históricos e saldo disponível do cartão. Estoque não conferido deve ser apresentado como desconhecido, nunca como zero. (US2-C1; US2-C4; US2-C6)
- **FR-012**: O sistema DEVE permitir adicionar, remover e alterar produtos e quantidades sugeridas sem exigir que a pessoa aceite a sugestão original. (US2-C2)
- **FR-013**: Para cada item da lista, o sistema DEVE apresentar quantidade em casa ou estado não conferido, quantidade sugerida quando houver base suficiente, quantidade definida pela pessoa, último preço pago, preço estimado, subtotal estimado, prioridade e justificativa. (US2-C1; US2-C3; US2-C6)
- **FR-014**: O sistema DEVE separar itens essenciais, recorrentes e opcionais e DEVE permitir visualizar listas anteriores. (US2-C1; US2-C5)
- **FR-015**: Quando uma lista estimada ultrapassar o saldo disponível, o sistema DEVE informar o excedente e oferecer sugestões de redução, adiamento de itens opcionais ou apresentações com menor preço histórico, sem aplicar mudanças sem confirmação. (US2-C4)
- **FR-016**: O sistema DEVE exibir preço estimado somente quando existir histórico aplicável, usando preço da mesma apresentação ou preço unitário histórico compatível com a apresentação selecionada. (US2-C3)
- **FR-017**: O sistema DEVE iniciar com orçamento mensal de R$ 700,00 e permitir alterar o valor, configurar a data de recarga e consultar o saldo disponível. (US3-C1)
- **FR-018**: O sistema DEVE registrar créditos adicionais, ajustes de saldo e gastos e DEVE permitir consultar saldos e movimentações de períodos anteriores. (US3-C2)
- **FR-019**: O sistema DEVE permitir configurar se o saldo restante será acumulado no período seguinte. (US3-C2)
- **FR-020**: O sistema DEVE apresentar alertas ao atingir 80%, 90% e 100% do total disponibilizado para gastos no período. (US3-C3)
- **FR-021**: O sistema DEVE separar o valor pago com cartão alimentação de valores pagos por outras formas e DEVE permitir dividir um pagamento entre eles. (US3-C4; US4-C1)
- **FR-022**: O sistema DEVE permitir registrar várias compras no mesmo período ou mês do calendário, cada uma com data, supermercado, produtos, quantidades, preços unitários, descontos por item, subtotais, total, formas de pagamento e observações. (US4-C1)
- **FR-023**: Durante uma compra, o sistema DEVE permitir marcar itens adicionados ao carrinho, recalcular o total em tempo real e comparar os valores estimado e realizado. (US4-C1)
- **FR-024**: Ao finalizar uma compra, o sistema DEVE atualizar o saldo do cartão pela parcela paga com o cartão, atualizar o estoque e registrar o histórico de compras e preços. (US4-C2)
- **FR-025**: O sistema DEVE impedir que confirmações repetidas da mesma compra dupliquem gastos, entradas de estoque ou registros históricos. (US4-C3)
- **FR-026**: O sistema DEVE permitir editar ou cancelar uma compra finalizada e DEVE corrigir saldo e estoque mantendo rastreável o valor original e a correção. (US4-C4)
- **FR-027**: O sistema DEVE manter histórico de preços por produto, apresentação e supermercado. (US5-C1)
- **FR-028**: O sistema DEVE exibir menor preço, maior preço, preço médio, último preço, variação percentual, evolução e supermercado com menor preço histórico quando houver dados comparáveis. (US5-C1)
- **FR-029**: O sistema DEVE calcular comparações por unidade somente entre unidades compatíveis e apresentações comparáveis. (US5-C1)
- **FR-030**: O sistema DEVE identificar produtos comprados frequentemente, frequência, quantidade média, consumo médio entre conferências, intervalo médio de reposição, preço mais recente, preço médio, produtos novos, produtos possivelmente não comprados recentemente, variações de quantidades e variações de preços. (US5-C2; US5-C4)
- **FR-031**: O sistema DEVE permitir corrigir manualmente sugestões e classificações e DEVE distinguir a correção do dado observado em uma compra ou conferência. (US5-C5)
- **FR-032**: O sistema DEVE indicar quando o histórico é insuficiente e DEVE omitir preço, média, recorrência ou tendência que não possa ser sustentada pelos registros disponíveis. (US2-C3; US5-C3)
- **FR-033**: O painel DEVE apresentar orçamento mensal, saldo disponível, total gasto no período, percentual utilizado, valor previsto da próxima compra, saldo previsto após a próxima compra, gastos por categoria e supermercado, evolução mensal, produtos mais comprados, itens para reposição, produtos com aumento de preço, compras recentes e comparativo planejado versus realizado. (US6-C1)
- **FR-034**: O sistema DEVE oferecer busca, filtros e ordenação para catálogo, estoque, listas e histórico, além de checklist para usar listas de compras. (US6-C2; US6-C4)
- **FR-035**: O sistema DEVE permitir consultar a lista e registrar preços durante as compras em celulares e computadores. (US6-C2)

### Non-Functional Requirements

- **NFR-001**: Textos da interface, mensagens e formatos apresentados ao usuário DEVE usar português do Brasil, moeda BRL e formatos locais de números e datas.
- **NFR-002**: As tarefas principais DEVE permanecer utilizáveis em telas de celulares e computadores sem ocultar ações necessárias para consultar a lista e registrar uma compra.
- **NFR-003**: Os fluxos DEVE oferecer navegação compreensível por teclado, nomes acessíveis para controles e informação que não dependa exclusivamente de cor.
- **NFR-004**: Valores monetários e totais apresentados DEVE corresponder às regras de cálculo até o centavo e DEVE aplicar arredondamento de forma consistente e explícita.
- **NFR-005**: Dados pessoais e financeiros DEVE ser limitados ao necessário e protegidos contra consulta ou alteração por pessoas não autorizadas.
- **NFR-006**: O frontend deve validar os dados para orientar a pessoa e o backend deve reaplicar as regras críticas antes de persistir alterações.
- **NFR-007**: Alterações de estoque, compras, orçamento e pagamentos DEVE manter histórico consultável com data, origem e valores necessários para explicar a mudança.
- **NFR-008**: Com até 500 produtos e 1.000 compras registradas, busca de produtos e abertura das telas principais DEVE apresentar resultado em até 2 segundos em pelo menos 95% das consultas de referência.
- **NFR-009**: A lista DEVE manter disponíveis em celular as ações de consultar, marcar e alterar itens durante o uso no supermercado.

### Regras de Negócio

- **BR-001**: Quantidades podem ser inteiras ou fracionadas. Cada quantidade pertence a uma unidade explícita; conversões só são válidas entre unidades compatíveis e com regra conhecida.
- **BR-002**: Uma conferência parcial altera apenas produtos informados e confirmados. Omissão significa quantidade não conferida, nunca estoque zero.
- **BR-003**: Valores monetários são calculados com aritmética decimal exata. Cada subtotal de item é arredondado ao centavo por regra comercial de metade para cima; o total da compra soma esses subtotais arredondados.
- **BR-004**: O período mensal do cartão começa na data configurada de recarga e termina no dia anterior à recarga seguinte. Se o dia configurado não existir em um mês, a recarga ocorre no último dia daquele mês.
- **BR-005**: O saldo disponível é o saldo de abertura, somado a créditos e ajustes positivos e subtraído de gastos pagos pelo cartão e ajustes negativos. Pagamentos externos não reduzem esse saldo.
- **BR-006**: A mudança do valor mensal recorrente vale a partir do próximo período. Alterações no período atual são lançadas como ajuste explícito e ficam no histórico.
- **BR-007**: Se o acúmulo estiver habilitado, o saldo restante de um período compõe o saldo de abertura do próximo; se estiver desabilitado, o saldo remanescente não é transportado.
- **BR-008**: Os alertas de 80%, 90% e 100% usam como base o total disponibilizado para gastos no período: saldo transportado, crédito mensal e créditos e ajustes líquidos, antes de subtrair os gastos pagos pelo cartão.
- **BR-009**: Uma compra não pode ser confirmada integralmente como paga pelo cartão acima do saldo disponível. A finalização acima desse saldo exige confirmação explícita da parcela paga por outra forma.
- **BR-010**: Apresentação com elegibilidade desconhecida não é considerada elegível para estimativas de pagamento pelo cartão até que a pessoa confirme essa condição.
- **BR-011**: O total da compra corresponde à soma dos subtotais de item arredondados ao centavo. Descontos são lançados por item e não podem superar o valor bruto nem produzir subtotal negativo.
- **BR-012**: Carrinho em edição não movimenta saldo nem estoque; somente a finalização confirmada registra a compra.
- **BR-013**: Uma finalização repetida da mesma compra produz uma única movimentação de saldo, estoque e histórico.
- **BR-014**: A edição ou cancelamento gera correções rastreáveis. Se o período original já estiver fechado, a correção ajusta esse período no histórico e o saldo vigente por movimentação compensatória.
- **BR-015**: Um único preço observado permite mostrar o último preço; médias exigem pelo menos duas observações comparáveis. Variações exigem pelo menos dois preços comparáveis.
- **BR-016**: Frequência e intervalo médio de reposição só são calculados com ao menos três compras do produto, que fornecem dois intervalos observados. Com menos registros, a recorrência automática aparece como insuficiente; a pessoa pode definir manualmente um produto como recorrente ou eventual.
- **BR-017**: Um produto recorrente é sinalizado como possivelmente não comprado recentemente quando o tempo desde a última compra superar duas vezes seu intervalo médio de reposição calculado.
- **BR-018**: Consumo entre duas conferências é estimado por estoque inicial mais compras registradas no intervalo menos estoque final. Se o resultado for negativo, o intervalo é sinalizado como divergência e não como consumo.
- **BR-019**: Preço por unidade compara apresentações somente dentro de medidas compatíveis, como gramas com quilogramas ou mililitros com litros. Unidades incompatíveis não recebem equivalência automática.
- **BR-020**: Quantidades sugeridas podem ser alteradas pela pessoa; nenhuma sugestão remove ou compra produto automaticamente.
- **BR-021**: Quando houver quantidade mínima e estoque conhecido, a quantidade-base sugerida é a diferença positiva entre a quantidade-alvo e o estoque. Se não houver quantidade mínima, o sistema pode usar a quantidade habitual configurada ou a média histórica disponível como alvo. Consumo histórico suficiente pode elevar o alvo para cobrir o consumo esperado até o próximo intervalo médio de reposição; a justificativa deve indicar os dados usados.
- **BR-022**: Se o estoque não foi conferido ou não há quantidade-alvo nem histórico suficiente, o sistema não deve sugerir quantidade automaticamente; deve solicitar uma quantidade ou conferência.
- **BR-023**: Um produto é considerado novo no histórico quando sua primeira compra confirmada é registrada. A indicação de aumento de preço exige que o último preço unitário comparável seja maior que o preço comparável anterior.
- **BR-024**: Cada alerta de 80%, 90% e 100% é apresentado quando os gastos pagos pelo cartão cruzam pela primeira vez o respectivo limiar do período; créditos posteriores não apagam o registro de que o limiar já foi atingido.
- **BR-025**: O percentual de uso compara gastos pagos pelo cartão com o total disponibilizado para gastos no período, antes de subtrair esses gastos.

### Key Entities *(include if feature involves data)*

- **Produto**: identidade do item doméstico, nome, categoria, subcategoria, condição ativa, prioridade, quantidade mínima, quantidade habitual e observações.
- **Apresentação do produto**: marca, tamanho, unidade e volume ou peso da embalagem; elegibilidade ao cartão; ligação entre o produto e preços observados.
- **Categoria**: classificação inicial ou criada pela pessoa e suas subcategorias.
- **Conferência de estoque**: data, produtos apresentados, quantidades informadas, confirmação e histórico da situação observada.
- **Lista de compras**: período, itens sugeridos ou adicionados, quantidades, prioridades, preços estimados, justificativas e alterações da pessoa.
- **Compra e item da compra**: data, supermercado, quantidade, preço unitário, desconto, subtotal, total, pagamento e vínculo com as movimentações de estoque e orçamento.
- **Período do orçamento**: data de início e fim, valor mensal vigente, saldo de abertura, regras de acúmulo e resumo das movimentações.
- **Movimentação do orçamento**: crédito, gasto, ajuste ou correção, valor, data e origem.
- **Observação de preço**: preço efetivamente registrado, apresentação, supermercado e data.
- **Histórico de alteração**: valores anteriores e posteriores, data e origem de mudanças relevantes em compras, estoque e orçamento.
- **Sugestão e correção manual**: resultado sugerido a partir do histórico, justificativa, insuficiência de dados quando aplicável e correção informada pela pessoa.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos cenários de referência de saldo, créditos, pagamentos divididos, edições e cancelamentos, o saldo exibido coincide com o valor esperado até o centavo; no cenário de R$ 700,00 menos R$ 250,00, o resultado é R$ 450,00.
- **SC-002**: Em 100% dos cenários de conferência parcial, quantidades dos produtos omitidos permanecem inalteradas e nenhuma omissão é convertida em estoque zero.
- **SC-003**: Em 100% dos cenários sem histórico aplicável, o sistema identifica o preço, a média ou a tendência como indisponível, sem exibir valores inventados.
- **SC-004**: Em uma avaliação com pelo menos cinco pessoas representativas do uso doméstico, pelo menos quatro conseguem conferir até 20 itens e revisar uma lista sugerida sem ajuda, em até cinco minutos.
- **SC-005**: Em uma avaliação com pelo menos cinco pessoas, pelo menos quatro conseguem registrar e finalizar uma compra de até 10 itens em até três minutos, sem duplicar movimentos.
- **SC-006**: Em 100% dos cenários de referência, os avisos aparecem ao cruzar 80%, 90% e 100% do valor disponível no período.
- **SC-007**: Em 100% dos pares de apresentações com unidades compatíveis, o preço unitário comparado corresponde ao preço registrado dividido pelo conteúdo da embalagem; pares incompatíveis não são comparados.
- **SC-008**: Pelo menos 95% das consultas de busca e abertura das telas principais terminam em até dois segundos com o conjunto de referência de 500 produtos e 1.000 compras.
- **SC-009**: Em uma avaliação móvel com pelo menos cinco pessoas, pelo menos quatro conseguem consultar e marcar os itens de uma lista durante uma compra sem perder acesso às ações principais.
- **SC-010**: Em 100% dos cenários de correção ou cancelamento, a trilha histórica permite identificar a compra original e os ajustes de saldo e estoque decorrentes.
- **SC-011**: Em uma avaliação com pelo menos cinco pessoas, pelo menos quatro atribuem nota 4 ou 5, em escala de 1 a 5, à clareza e utilidade da lista e dos alertas de orçamento.

## Assumptions

- O MVP atende uma pessoa responsável por um único domicílio. Compartilhamento entre familiares permanece fora do escopo inicial.
- O período do cartão segue o ciclo entre recargas configurado, e datas inexistentes em meses curtos são ajustadas para o último dia do mês.
- O novo valor mensal recorrente se aplica a partir do próximo período; para mudar o orçamento ativo, a pessoa registra um ajuste explícito.
- O sistema registra pagamentos e saldo informados pela pessoa, mas não processa transações nem armazena credenciais ou número do cartão.
- Preços e supermercados são informados durante o registro de compras; não há consulta a preços externos no MVP.
- A marca pode ficar vazia para produtos sem marca e a subcategoria pode ficar vazia quando a pessoa não desejar maior detalhamento.
- A prioridade padrão é média; a pessoa pode selecionar alta ou baixa.
- Frequência e intervalo médio só são calculados após três compras do produto. A sinalização de ausência de compra usa o dobro do intervalo médio observado.
- O preço médio exige pelo menos duas observações comparáveis; o último preço pode ser mostrado com apenas uma.
- Para estimar preço de uma apresentação sem observação própria, o sistema usa preço unitário histórico da mesma família de produto apenas quando unidade e medida forem compatíveis; caso contrário, indica indisponibilidade.
- A interpretação da lista em texto livre produz sugestões revisáveis e depende da confirmação da pessoa; não substitui a conferência do estoque.
- Descontos são informados por item para manter rastreável o custo efetivo de cada produto.
- O resultado esperado dos cenários de aceitação é verificável com dados fornecidos pela pessoa e com o histórico registrado pelo sistema.