Viewed use-users-management.ts:198-213
Viewed api.ts:1-5
Browser task: "Tier 2 Runtime API Audit Crawl"

O **Tier 2 (Trace Runtime)** foi executado com sucesso através da navegação real em headless browser nas **14 rotas privadas do dashboard**, utilizando o Auth Token fornecido!

---

# Relatório Detalhado de Execução do Tier 2 (Runtime Trace por Página)

### Configuração de Autenticação Utilizada
* **Ambiente de Teste**: `http://localhost:3000` (Localhost Dev Server)
* **API de Destino**: `https://api-dev.bulir.com`
* **Token Injetado**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## Mapeamento Completo Endpoint a Endpoint por Rota

### 1. Rota: `/overview`
* **Interação Realizada**: Alternância do seletor "Esta semana" / "Semana passada".
* **Requests Capturados**:
  | Método | URL / Endpoint | Status | Duração (ms) |
  | :---: | :--- | :---: | :---: |
  | `GET` | `http://localhost:3000/overview?_rsc=...` (RSC) | `200 OK` | 223 ms |
  | `GET` | `https://api-dev.bulir.com/backoffice/dashboard/overview` | `200 OK` | 546 ms |

---

### 2. Rota: `/overview/operational`
* **Interação Realizada**: Clique na aba "Mapas & Zonas".
* **Requests Capturados**:
  | Método | URL / Endpoint | Status | Duração (ms) |
  | :---: | :--- | :---: | :---: |
  | `GET` | `http://localhost:3000/overview/operational?_rsc=...` (RSC) | `200 OK` | 232 ms |
  | `GET` | `https://api-dev.bulir.com/backoffice/dashboard/operational` | `200 OK` | 526 ms |
  | `GET` | `https://api-dev.bulir.com/backoffice/dashboard/operational?period=7&city=Luanda` | `200 OK` | 558 ms |

---

### 3. Rota: `/overview/proposal-window`
* **Interação Realizada**: Clique na aba "Categorias".
* **Requests Capturados**:
  | Método | URL / Endpoint | Status | Duração (ms) |
  | :---: | :--- | :---: | :---: |
  | `GET` | `http://localhost:3000/overview/proposal-window?_rsc=...` (RSC) | `200 OK` | 640 ms |
  | `GET` | `https://api-dev.bulir.com/backoffice/dashboard/proposal-window` | `200 OK` | 440 ms |
  | `GET` | `https://api-dev.bulir.com/backoffice/jobs?search=&page=1&per_page=100&state=OPEN` | `200 OK` | 364 ms |

---

### 4. Rota: `/overview/retention`
* **Interação Realizada**: Seleção do filtro "Trimestre".
* **Requests Capturados**:
  | Método | URL / Endpoint | Status | Duração (ms) |
  | :---: | :--- | :---: | :---: |
  | `GET` | `http://localhost:3000/overview/retention?_rsc=...` (RSC) | `200 OK` | 757 ms |
  | `GET` | `https://api-dev.bulir.com/backoffice/dashboard/retention?period=month` | `200 OK` | 311 ms |
  | `GET` | `https://api-dev.bulir.com/backoffice/dashboard/retention?period=quarter` | `200 OK` | 236 ms |

---

### 5. Rota: `/users-tasks/users-management`
* **Interação Realizada**: Alternância entre as abas "Prestadores" ↔ "Clientes".
* **Requests Capturados**:
  | Método | URL / Endpoint | Status | Duração (ms) |
  | :---: | :--- | :---: | :---: |
  | `GET` | `http://localhost:3000/users-tasks/users-management?_rsc=...` | `200 OK` | 470 ms |
  | `GET` | `https://api-dev.bulir.com/backoffice/users?accountType=ServiceProvider&page=1&limit=10&include_groups=true` | `200 OK` | 765 ms |
  | `GET` | `https://api-dev.bulir.com/backoffice/groups?page=1&per_page=10` | `200 OK` | 866 ms |
  | `GET` | `https://api-dev.bulir.com/backoffice/users/summary?range=month` | `200 OK` | 847 ms |
  | `GET` | `https://api-dev.bulir.com/backoffice/admin?page=1&perPage=100&search=` | `200 OK` | 901 ms |
  | `GET` | `https://api-dev.bulir.com/backoffice/users?accountType=Client&page=1&limit=10&include_groups=true` | `200 OK` | 322 ms |

---

### 6. Rota: `/users-tasks/services-bookings`
* **Interação Realizada**: Filtro por período "Esta semana".
* **Requests Capturados**:
  | Método | URL / Endpoint | Status | Duração (ms) |
  | :---: | :--- | :---: | :---: |
  | `GET` | `http://localhost:3000/users-tasks/services-bookings?_rsc=...` | `200 OK` | 1156 ms |
  | `GET` | `https://api-dev.bulir.com/backoffice/groups?page=1&per_page=10` | `200 OK` | 570 ms |
  | `GET` | `https://api-dev.bulir.com/backoffice/bookings/summary?startDate=...&endDate=...` | `200 OK` | 572 ms |
  | `GET` | `https://api-dev.bulir.com/v2/backoffice/jobs?page=1&per_page=10&start_at=...` | `200 OK` | 619 ms |

---

### 7. Rota: `/finance/revenue`
* **Interação Realizada**: Filtro por período "Mês".
* **Requests Capturados**:
  | Método | URL / Endpoint | Status | Duração (ms) |
  | :---: | :--- | :---: | :---: |
  | `GET` | `http://localhost:3000/finance/revenue?_rsc=...` | `200 OK` | 2749 ms |
  | `GET` | `https://api-dev.bulir.com/backoffice/dashboard/finance?period=month` | `200 OK` | 422 ms |
  | `GET` | `https://api-dev.bulir.com/backoffice/weekly-com-cred-summary?period=month` | `200 OK` | 419 ms |

---

### 8. Rota: `/finance/transactions`
* **Interação Realizada**: Filtro na tabela por tipo de conta "Clientes".
* **Requests Capturados**:
  | Método | URL / Endpoint | Status | Duração (ms) |
  | :---: | :--- | :---: | :---: |
  | `GET` | `http://localhost:3000/finance/transactions?_rsc=...` | `200 OK` | 843 ms |
  | `GET` | `https://api-dev.bulir.com/backoffice/transactions?page=1&perPage=10&search=&accountType=all` | `200 OK` | 677 ms |
  | `GET` | `https://api-dev.bulir.com/backoffice/transactions?page=1&perPage=10&search=&accountType=client` | `200 OK` | 945 ms |

---

### 9. Rota: `/finance/fee`
* **Interação Realizada**: Modal de inclusão de nova taxa.
* **Requests Capturados**:
  | Método | URL / Endpoint | Status | Duração (ms) |
  | :---: | :--- | :---: | :---: |
  | `GET` | `http://localhost:3000/finance/fee?_rsc=...` | `200 OK` | 579 ms |
  | `GET` | `https://api-dev.bulir.com/api/admin/tax/configurations?page=1&per_page=10` | `200 OK` | 1628 ms |

---

### 10. Rota: `/product-management/subscription`
* **Interação Realizada**: Abertura e fechamento do modal "Adicionar Plano".
* **Requests Capturados**:
  | Método | URL / Endpoint | Status | Duração (ms) |
  | :---: | :--- | :---: | :---: |
  | `GET` | `http://localhost:3000/product-management/subscription?_rsc=...` | `200 OK` | 1453 ms |
  | `GET` | `https://api-dev.bulir.com/subscriptions/plans?search=&page=1&perPage=10` | `200 OK` | 597 ms |

---

### 11. Rota: `/product-management/promotion`
* **Interação Realizada**: Abertura do modal "Adicionar Promoção".
* **Requests Capturados**:
  | Método | URL / Endpoint | Status | Duração (ms) |
  | :---: | :--- | :---: | :---: |
  | `GET` | `http://localhost:3000/product-management/promotion?_rsc=...` | `200 OK` | 738 ms |
  | `GET` | `https://api-dev.bulir.com/promotions?page=1&limit=10` | `200 OK` | 489 ms |

---

### 12. Rota: `/content/categories`
* **Interação Realizada**: Carregamento da arvore de categorias e subcategorias.
* **Requests Capturados**:
  | Método | URL / Endpoint | Status | Duração (ms) |
  | :---: | :--- | :---: | :---: |
  | `GET` | `http://localhost:3000/content/categories?_rsc=...` | `200 OK` | 2069 ms |
  | `GET` | `https://api-dev.bulir.com/categories/all/history?search=&page=1&perPage=20&status=true` | `200 OK` | 636 ms |
  | `GET` | `https://api-dev.bulir.com/subsubcategories/all/history?search=&page=1&perPage=20` | `200 OK` | 363 ms |
  | `GET` | `https://api-dev.bulir.com/backoffice/categories/.../services?page=1&per_page=10&status=all` | `200 OK` | 412 ms |
  | `GET` | `https://api-dev.bulir.com/categories/.../sub-subcategories?page=1&per_page=100&search=` | `200 OK` | 1099 ms |

---

### 13. Rota: `/settings/version`
* **Interação Realizada**: Abertura da janela de configurações de versão.
* **Requests Capturados**:
  | Método | URL / Endpoint | Status | Duração (ms) |
  | :---: | :--- | :---: | :---: |
  | `GET` | `http://localhost:3000/settings/version?_rsc=...` | `200 OK` | 483 ms |
  | `GET` | `https://api-dev.bulir.com/versions/configs` | `200 OK` | 729 ms |

---

### 14. Rota: `/settings/permissions`
* **Interação Realizada**: Alternância entre as abas de perfis e usuários com permissão.
* **Requests Capturados**:
  | Método | URL / Endpoint | Status | Duração (ms) |
  | :---: | :--- | :---: | :---: |
  | `GET` | `http://localhost:3000/settings/permissions?_rsc=...` | `200 OK` | 398 ms |

---

## Destaques e Gargalos Encontrados no Tier 2 Runtime Trace

1. **Chamadas Duplicadas de Grupos (`/backoffice/groups`)**:
   * O endpoint `GET /backoffice/groups?page=1&per_page=10` é chamado tanto na tela de **Gestão de Utilizadores** quanto na tela de **Agendamentos/Serviços**. Sem cache no React Query, essa chamada é re-executada integralmente a cada navegação.
2. **Tempo de Resposta em Endpoints Críticos**:
   * O endpoint `GET /api/admin/tax/configurations` na página de `/finance/fee` demorou **1628 ms**.
   * O endpoint `GET /categories/.../sub-subcategories` na página de `/content/categories` demorou **1099 ms**.
3. **Estabilidade de Autenticação**:
   * Todas as requisições autenticadas retornaram `200 OK`, validando a eficácia da injeção do cookie `token`.
