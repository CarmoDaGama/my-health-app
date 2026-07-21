# Relatório  Tier 1

## 1. Sumário Executivo
- **Total de Páginas Auditadas no Escopo**: 24 rotas sob `/app/(private)/(dashboard)/**`
- **Total de Recursos HTTP Auditados**: 78 funções exportadas em `src/services/http/**`
- **Recursos UNUSED (Código Morto - Tier 1)**: **15 recursos identificados**
- **Ocorrências de Duplicação / Redundância de Módulos**: 2 casos (funções declaradas em 2 arquivos diferentes)
- **Status do Interceptor Dev-Only (Tier 2)**: **Ativo e operacional em `client.ts`**

---

## 2. Tier 1: Tabela de Resources HTTP / Hooks Mortos (Candidatos à Remoção)

Estes recursos possuem declaração em `src/services/http/**`, mas **zero imports** no restante de todo o projeto `src/`:

| # | Nome da Função | Arquivo de Origem | Diagnóstico | Recomendação |
|---|---|---|---|---|
| 1 | `getEachUser` | `src/services/http/users/user.resources.ts` | Substituído por `getUserDetail` |  Remover |
| 2 | `getInquires` | `src/services/http/users/user.resources.ts` | Endpoint de inquéritos legado sem tela consumidora |  Remover |
| 3 | `getFinanceSummary` | `src/services/http/revenue/revenue.resources.ts` & `dashboard.resources.ts` | **Duplicado em 2 arquivos** e nunca importado |  Remover de ambos |
| 4 | `getWeeklyBookingsSummary` | `src/services/http/dashboard/dashboard.resources.ts` | Substituído por `getWeeklyBookings` |  Remover |
| 5 | `getCategoryBookingPercentage` | `src/services/http/dashboard/dashboard.resources.ts` | Métricas legadas não renderizadas em dashboard |  Remover |
| 6 | `fetchBookingWeeklyStates` | `src/services/http/dashboard/dashboard.resources.ts` | Função de gráficos antigos sem uso |  Remover |
| 7 | `getIncomeTransactions` | `src/services/http/dashboard/dashboard.resources.ts` | Transações de receita consumidas via `revenue.resources.ts` |  Remover |
| 8 | `getExpenseTransactions` | `src/services/http/dashboard/dashboard.resources.ts` | Transações de despesa sem consumo na UI |  Remover |
| 9 | `getMonthlySubscriptionStats` | `src/services/http/dashboard/dashboard.resources.ts` | Estatísticas mensais sem uso nas telas |  Remover |
| 10 | `getcategoryById` | `src/services/http/content/content.resources.ts` | Leitura individual de categoria não utilizada |  Remover |
| 11 | `getSubCategoryById` | `src/services/http/content/content.resources.ts` | Leitura individual de subcategoria não utilizada |  Remover |
| 12 | `getServicesBySubcategory` | `src/services/http/content/content.resources.ts` | Substituído por `getServicesByCategory` |  Remover |
| 13 | `getServicesBySubSubcategory` | `src/services/http/content/content.resources.ts` | Substituído por `getServicesByCategory` |  Remover |
| 14 | `getServicesBySubCategoryId` | `src/services/http/content/content.resources.ts` | Legado sem uso |  Remover |
| 15 | `AddPromotionsPlans` | `src/services/http/product/product.resources.ts` | **Duplicado**: o app consome apenas a versão em `user.resources.ts` |  Limpar duplicata |
