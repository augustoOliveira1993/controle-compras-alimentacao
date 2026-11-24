<!-- Sync Impact Report
Version change: template sem versão definida → 1.0.0
Modified principles:
- PRINCIPLE_1_NAME → I. Desenvolvimento orientado a especificações (SDD)
- PRINCIPLE_2_NAME → II. Código limpo, modularidade e tipagem estrita
- PRINCIPLE_3_NAME → III. Experiência em português e mobile-first
- PRINCIPLE_4_NAME → IV. Integridade de quantidades e valores financeiros
- PRINCIPLE_5_NAME → V. Segurança, qualidade e rastreabilidade
Added sections:
- Restrições de Domínio e Dados (substitui SECTION_2_NAME)
- Fluxo de Desenvolvimento e Qualidade (substitui SECTION_3_NAME)
Removed sections: Nenhuma.
Follow-up TODOs: Nenhum.
-->

# Constituição do Sistema de Controle Doméstico de Compras, Estoque e Orçamento

## Core Principles

### I. Desenvolvimento orientado a especificações (SDD)
Toda funcionalidade nova deve seguir o fluxo Spec Kit: especificação com `$speckit-specify`, planejamento com `$speckit-plan`, decomposição em tarefas com `$speckit-tasks` e implementação com `$speckit-implement`. A implementação só começa quando os artefatos aplicáveis definirem comportamento, critérios de aceite, decisões técnicas e tarefas verificáveis. Mudanças de escopo devem atualizar esses artefatos antes da continuação do trabalho. Isso mantém requisitos, decisões e entrega alinhados.

### II. Código limpo, modularidade e tipagem estrita
O código deve seguir Clean Code, SOLID e separação de responsabilidades. Módulos devem ter limites e propósitos claros, permanecer organizados e facilitar manutenção; componentes de interface devem ser reutilizáveis quando houver comportamento ou apresentação compartilhados. TypeScript deve operar com verificação estrita, e o uso de `any` deve ser evitado e justificado quando inevitável. Essas regras reduzem acoplamento e tornam mudanças mais seguras.

### III. Experiência em português e mobile-first
Toda interface voltada ao usuário deve usar português do Brasil, apresentar valores monetários em reais (BRL) e oferecer fluxos intuitivos para compras, estoque residencial e orçamento mensal. A experiência deve ser mobile-first, responsiva em diferentes tamanhos de tela e acessível por teclado e tecnologias assistivas. Formatos de moeda, números e datas devem respeitar os padrões locais.

### IV. Integridade de quantidades e valores financeiros
O domínio deve aceitar quantidades inteiras e fracionadas, preservar sua precisão e associá-las a unidades explícitas. Cálculos monetários não devem depender de ponto flutuante binário: valores devem usar unidades monetárias inteiras ou aritmética decimal exata, com regras de arredondamento definidas e aplicadas em pontos documentados. Dados devem ser validados no frontend para orientar o usuário e novamente no backend, que é a autoridade para persistência e regras de negócio.

### V. Segurança, qualidade e rastreabilidade
A proteção dos dados deve ser considerada em cada funcionalidade, com acesso restrito ao necessário e tratamento seguro de entradas, sessões e segredos. Mudanças devem incluir testes unitários, testes de integração e cobertura dos principais fluxos de negócio definidos na especificação. O histórico deve permitir rastrear alterações e movimentações de compras, estoque e orçamento. Documentação e artefatos de especificação devem acompanhar mudanças de comportamento.

## Restrições de Domínio e Dados

- Valores e totais devem permanecer consistentes em operações de compra, movimentação de estoque e consolidação do orçamento mensal; o arredondamento deve obedecer a uma regra explícita.
- Quantidades fracionadas não podem ser truncadas nem tratadas como inteiras. Conversões entre unidades exigem unidades compatíveis e regras explícitas.
- Validações de entrada e regras críticas de negócio devem ser executadas no backend mesmo quando houver validação equivalente no frontend.
- Dados pessoais e financeiros devem ser limitados ao necessário para o funcionamento do sistema e protegidos contra acesso ou alteração não autorizados.

## Fluxo de Desenvolvimento e Qualidade

- Cada funcionalidade deve ter critérios de aceite rastreáveis até a especificação e tarefas que cubram implementação, validações, testes e documentação aplicáveis.
- Os testes devem verificar cálculos financeiros, quantidades fracionadas, validações e os principais fluxos ponta a ponta do domínio conforme o escopo da funcionalidade.
- Alterações relevantes e movimentações de negócio devem produzir registros históricos consultáveis, sem apagar silenciosamente a trilha de auditoria.
- A documentação deve explicar comportamentos, regras de negócio e decisões que sejam necessárias para operar ou manter o sistema.

## Governance

Esta constituição orienta o desenvolvimento do sistema e prevalece sobre práticas locais incompatíveis. Toda proposta de alteração deve registrar a justificativa, avaliar o impacto nos princípios e nos artefatos Spec Kit, receber revisão dos responsáveis pelo projeto e atualizar esta constituição quando aprovada.

A versão segue SemVer: MAJOR para remoção ou redefinição incompatível de princípios; MINOR para novos princípios, seções ou expansão material de obrigações; PATCH para esclarecimentos e correções sem mudança semântica. Cada incremento deve manter o histórico da versão e a data de alteração.

A conformidade deve ser revisada na especificação, no planejamento, nas tarefas e na revisão das mudanças. Uma exceção temporária exige aprovação registrada, justificativa, impacto, mitigação e prazo de validade; exceções permanentes exigem emenda a esta constituição. Revisões devem confirmar critérios de aceite, validações, testes, segurança, precisão financeira, documentação e rastreabilidade pertinentes.

**Version**: 1.0.0 | **Ratified**: 2026-11-23 | **Last Amended**: 2026-11-23
