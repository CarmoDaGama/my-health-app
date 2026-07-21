# Relatório de Auditoria Tier 3 — Verificação de Uso da Resposta e Redundâncias de Tráfego

---

## 1. Resumo Executivo da Auditoria Tier 3
Após o mapeamento em tempo de execução realizado no **Tier 2**, a auditoria **Tier 3** avaliou detalhadamente como os dados retornados por cada endpoint são consumidos nas páginas do Backoffice (Next.js 16 + TanStack Query 5).

### Principais Achados de Performance e Arquitetura:
1. **Over-fetching Severo**:
   - **Rota `/users-tasks/users-management`**: O endpoint `GET /backoffice/users` devolve DTOs com sub-estruturas extensas (`addresses`, `documents`, `reviews`, `userStats`, `groups`). No entanto, a tabela principal renderiza apenas 5 colunas básicas (*Nome, E-mail, Tipo de Conta, Estado, Ações*).
2. **Gerenciamento Imperativo de Estado vs. TanStack Query**:
   - Em rotas cruciais como `/users-tasks/users-management` e `/finance/revenue`, o carregamento de dados é manipulado via `useEffect` + `useState` + `useCallback` imperativos. Isso desativa os mecanismos de cache do React Query, forçando requisições de rede completas a cada troca de aba ou filtro.
3. **Chamadas Sequenciais Desnecessárias (Waterfalls em `useEffect`)**:
   - Em `/finance/revenue`, existem dois `useEffect` separados escutando a mesma dependência (`timeRange`), disparando `getFinanceDashboard` e `getWeeklyComCredSummary` em ciclos de renderização distintos.
4. **Requisições Globais Redundantes**:
   - O endpoint `GET /backoffice/groups?page=1&per_page=10` é disparado de forma independente nas telas de Utilizadores e de Agendamentos sem reaproveitamento de chave de cache única.

---

## 2. Análise Detalhada Endpoint por Endpoint / Rota

### Rota 1: `/overview`
* **Endpoints Disparados**:
  * `GET /backoffice/dashboard/overview`
* **Análise de Consumo dos Dados**:
  * **Payload Retornado**: Objeto envelopado `ApiValueResponse<DashboardOverviewResponse>` contendo estatísticas operacionais gerais (`topStats`), totais de receitas, métricas de crescimento e resumo de alertas.
  * **Renderização na UI**: O hook [`useDashboardOverview`](file:///c:/Users/CarmoGama/Desktop/Projects/backoffice/src/app/(private)/(dashboard)/overview/hooks/use-dashboard-overview.ts) extrai apenas `response?.value?.topStats` para renderizar os 4 cards da página.
  * **Diagnóstico**: **Over-fetching Moderado**. O backend retorna dados estendidos que não são consumidos nesta rota específica.
  * **Status de Cache**: Excelente. Configurado `staleTime: 5 * 60 * 1000` (5 min), evitando refetch storms.

---

### Rota 2: `/overview/operational`
* **Endpoints Disparados**:
  * `GET /backoffice/dashboard/operational`
  * `GET /backoffice/dashboard/operational?period=7&city=Luanda`
* **Análise de Consumo dos Dados**:
  * **Payload Retornado**: Métricas de solicitações ativas, concluídas, expiradas, em disputa e geodistribuição por cidade/bairro.
  * **Renderização na UI**: Todos os campos de `operationalStats` são consumidos pelos gráficos de radar, barras de demandas e mapa.
  * **Diagnóstico**: **Redundância de Gatilho**. A página utiliza um `useEffect` imperativo combinado a um `useQuery` de localizações, gerando duplicidade no primeiro carregamento.

---

### Rota 3: `/overview/proposal-window`
* **Endpoints Disparados**:
  * `GET /backoffice/dashboard/proposal-window`
  * `GET /backoffice/jobs?search=&page=1&per_page=100&state=OPEN`
* **Análise de Consumo dos Dados**:
  * **Payload Retornado**: Estatísticas de janelas de proposta e lista estendida de 100 jobs abertos.
  * **Renderização na UI**: Os jobs abertos são filtrados localmente para montar o indicador de propostas por categoria.
  * **Diagnóstico**: **Over-fetching Gravíssimo**. Trazer 100 objetos completos de `jobs` (com DTOs de cliente, endereço e subcategorias) apenas para contar a distribuição na UI sobrecarrega a rede (14.3 KB por chamada). O ideal é retornar uma agregação do backend.

---

### Rota 4: `/overview/retention`
* **Endpoints Disparados**:
  * `GET /backoffice/dashboard/retention?period=month`
  * `GET /backoffice/dashboard/retention?period=quarter`
* **Análise de Consumo dos Dados**:
  * **Payload Retornado**: Taxas de retenção de clientes e prestadores por coorte mensal/trimestral.
  * **Renderização na UI**: 100% dos dados são renderizados na matriz e nos gráficos.
  * **Diagnóstico**: **Uso Eficiente**. O payload é leve (600 bytes) e totalmente consumido.

---

### Rota 5: `/users-tasks/users-management`
* **Endpoints Disparados**:
  * `GET /backoffice/users?accountType=ServiceProvider&page=1&limit=10&include_groups=true`
  * `GET /backoffice/groups?page=1&per_page=10`
  * `GET /backoffice/users/summary?range=month`
  * `GET /backoffice/admin?page=1&perPage=100&search=`
* **Análise de Consumo dos Dados**:
  * **Payload Retornado**: Lista de utilizadores com objetos internos de endereço, estatísticas do prestador e grupos atribuídos.
  * **Renderização na UI**: A tabela renderiza apenas: Nome, E-mail, Tipo de Conta, Estado e Data de Registo.
  * **Diagnóstico**: **Over-fetching & Falta de Cache**.
    * A listagem traz estruturas pesadas que só deveriam ser carregadas ao abrir o `ProfileSheet`.
    * O gerenciamento de requisições é feito via `useEffect` imperativo em `use-users-management.ts`, anulando o cache do React Query.

---

### Rota 6: `/users-tasks/services-bookings`
* **Endpoints Disparados**:
  * `GET /backoffice/bookings/summary?startDate=...&endDate=...`
  * `GET /v2/backoffice/jobs?page=1&per_page=10&start_at=...`
* **Análise de Consumo dos Dados**:
  * **Payload Retornado**: Sumário de agendamentos e lista da versão 2 de jobs.
  * **Renderização na UI**: A tabela de serviços renderiza status, código de referência, data de trabalho, preço final e ação de detalhes.
  * **Diagnóstico**: **Uso Adequado dos Dados v2**. A DTO `/v2/backoffice/jobs` já envia uma estrutura enxuta `V2JobListBooking` (sem o bloco `financial` estendido do detalhe).

---

### Rota 7: `/finance/revenue`
* **Endpoints Disparados**:
  * `GET /backoffice/dashboard/finance?period=month`
  * `GET /backoffice/weekly-com-cred-summary?period=month`
* **Análise de Consumo dos Dados**:
  * **Payload Retornado**: Métricas financeiras e dados semanais de comissão vs créditos.
  * **Renderização na UI**: Consumidos nos gráficos e cards superiores.
  * **Diagnóstico**: **Waterfall em `useEffect`**. Dois efeitos independentes escutam `timeRange`, realizando chamadas sequenciais em instantes diferentes do ciclo de vida do componente.

---

### Rota 8: `/finance/transactions`
* **Endpoints Disparados**:
  * `GET /backoffice/transactions?page=1&perPage=10&search=&accountType=all`
* **Análise de Consumo dos Dados**:
  * **Payload Retornado**: Lista de transações financeiras.
  * **Renderização na UI**: Consumido integralmente na tabela.
  * **Diagnóstico**: **Eficiente**.

---

### Rota 9: `/finance/fee`
* **Endpoints Disparados**:
  * `GET /api/admin/tax/configurations?page=1&per_page=10`
* **Análise de Consumo dos Dados**:
  * **Payload Retornado**: Configurações de taxas.
  * **Renderização na UI**: Exibido na tabela de gestão de taxas.
  * **Diagnóstico**: **Latência Alta**. O backend demorou 1628 ms para responder este endpoint, embora o payload seja pequeno.

---

### Rotas 10 & 11: `/product-management/subscription` e `/promotion`
* **Endpoints Disparados**:
  * `GET /subscriptions/plans`
  * `GET /promotions`
* **Análise de Consumo dos Dados**:
  * **Payload Retornado**: Planos de assinatura e códigos promocionais ativos.
  * **Renderização na UI**: Exibidos em cards/tabelas de gestão de produto.
  * **Diagnóstico**: **Uso Correto**.

---

### Rota 12: `/content/categories`
* **Endpoints Disparados**:
  * `GET /categories/all/history?search=&page=1&perPage=20&status=true`
  * `GET /subsubcategories/all/history?search=&page=1&perPage=20`
  * `GET /backoffice/categories/{id}/services?page=1&per_page=10&status=all`
  * `GET /categories/{id}/sub-subcategories?page=1&per_page=100&search=`
* **Análise de Consumo dos Dados**:
  * **Payload Retornado**: Árvore hierárquica completa de Categorias → Subcategorias → Sub-subcategorias → Serviços.
  * **Renderização na UI**: Utilizado na barra lateral de navegação de categorias e na tabela central de serviços.
  * **Diagnóstico**: **Múltiplos Triggers por Navegação**. Ao clicar em uma categoria, a página dispara 3 requisições filhas em cadeia.

---

## 3. Matriz de Achados por Gravidade

| Gravidade | Rota | Problema Encontrado | Causa Raiz | Impacto |
| :---: | :--- | :--- | :--- | :--- |
| **ALTA** | `/overview/proposal-window` | Over-fetching de 100 jobs completos para calcular totais por categoria | Busca de lista não agregada no frontend | Tráfego desnecessário de ~14 KB por requisição e desaceleração do render |
| **ALTA** | `/users-tasks/users-management` | Falta de cache no React Query para a tabela principal de utilizadores | Uso de `useEffect` imperativo com `useState` local | Re-fetch completo a cada clique em abas ou filtros sem aproveitar memória |
| **MÉDIA** | `/finance/revenue` | Chamadas em Waterfall de endpoints em dois `useEffect` separados | Efeitos desalinhados escutando `timeRange` | Aumento no tempo total para renderização completa dos gráficos |
| **MÉDIA** | `/users-tasks/users-management` | Over-fetching de DTOs de perfil em tabelas simples | Backend envia todas as relações no endpoint genérico | Retorno de dados não exibidos na listagem |
| **BAIXA** | `/finance/fee` | Latência elevada do endpoint de taxas (1628 ms) | Processamento interno no backend | Atraso percebido pelo usuário ao abrir a página |

---
