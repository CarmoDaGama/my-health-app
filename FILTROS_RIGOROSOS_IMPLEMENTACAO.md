# 🔒 FILTROS RIGOROSOS: Profissionais e Instituições

## 🎯 Objetivo

Garantir que **APENAS** profissionais e instituições **ativos E verificados** sejam visíveis no mapa e nas listagens de categorias.

## 🔍 Critérios de Filtro

### Para Profissionais e Instituições:
- ✅ **Status:** `active` (obrigatório)
- ✅ **Verificado:** `verified: true` (obrigatório)
- ❌ **Suspensos:** `status: 'suspended'` (ocultos)
- ❌ **Não verificados:** `verified: false` (ocultos)

### Para Outros Serviços (hospitais, clínicas, farmácias):
- ✅ **Sempre visíveis** (assumidos como válidos)
- 🔄 **Compatibilidade:** Se não têm campos, assumir como ativos

## 🛠️ Implementação

### 1. **Métodos com Filtros Aplicados**

Todos os métodos de busca aplicam o filtro rigoroso:

```typescript
// FILTRO RIGOROSO PARA PROFISSIONAIS E INSTITUIÇÕES
const serviceStatus = data.status !== undefined ? data.status : 'active';
const isVerified = data.verified !== undefined ? data.verified : true;

// Para profissionais e instituições, aplicar filtro rigoroso
if (data.type === 'professional' || data.serviceType === 'professional' || 
    data.type === 'institution' || data.serviceType === 'institution') {
  
  // Serviço deve estar ativo E verificado
  if (serviceStatus !== 'active' || !isVerified) {
    return; // Pular este serviço
  }
}
```

### 2. **Métodos Atualizados**

#### `services/api-firebase.ts`
- ✅ `getAllServices()` - Lista geral com filtros
- ✅ `searchServices()` - Busca com filtros
- ✅ `getServicesByType()` - Filtro por tipo
- ✅ `getNearbyServices()` - Herda filtros do getAllServices
- ⚠️ `getUserServices()` - SEM filtros (usuário vê seus próprios serviços)

#### `services/api.ts`
- ✅ `getFirestoreServices()` - Filtros aplicados na fonte

### 3. **Regras de Negócio**

| Tipo de Serviço | Status | Verificado | Visível? |
|-----------------|--------|------------|----------|
| Professional | `active` | `true` | ✅ SIM |
| Professional | `active` | `false` | ❌ NÃO |
| Professional | `suspended` | `true` | ❌ NÃO |
| Professional | `suspended` | `false` | ❌ NÃO |
| Institution | `active` | `true` | ✅ SIM |
| Institution | `active` | `false` | ❌ NÃO |
| Institution | `suspended` | `true` | ❌ NÃO |
| Institution | `suspended` | `false` | ❌ NÃO |
| Hospital/Clinic | qualquer | qualquer | ✅ SIM |

### 4. **Compatibilidade com Dados Antigos**

```typescript
// Se não tem campo status, assumir como ativo
const serviceStatus = data.status !== undefined ? data.status : 'active';

// Se não tem campo verified, assumir como verificado
const isVerified = data.verified !== undefined ? data.verified : true;
```

## 🧪 Como Testar

### 1. **Script de Teste Completo**
```bash
node scripts/test-service-filters.js
```

**O que testa:**
- ✅ Nenhum serviço suspenso aparece
- ✅ Nenhum serviço não verificado aparece
- ✅ Contagem por tipo e status
- ✅ Análise detalhada dos primeiros resultados

### 2. **Teste Manual no App**
1. **Registrar como profissional** (fica `suspended` + `verified: false`)
2. **Verificar que NÃO aparece** na busca de profissionais
3. **Aprovar o serviço** (tornar `active` + `verified: true`)
4. **Verificar que APARECE** na busca

### 3. **Resultados Esperados**
```
✅ SUCESSO: Todos os filtros estão funcionando corretamente!
   - Nenhum serviço suspenso foi retornado
   - Nenhum serviço não verificado foi retornado
📊 Total de prof/instituições visíveis: X
```

## 🔄 Fluxo de Aprovação

### 1. **Novo Registro**
```
Profissional/Instituição se registra
↓
status: 'suspended'
verified: false
↓
NÃO aparece nas buscas
↓
Admin aprova
↓
status: 'active'
verified: true
↓
APARECE nas buscas
```

### 2. **Suspensão**
```
Serviço ativo é reportado
↓
Admin investiga
↓
status: 'suspended'
↓
NÃO aparece mais nas buscas
↓
Problema resolvido
↓
status: 'active'
↓
VOLTA a aparecer nas buscas
```

## ⚠️ Importantes

### **Exceções aos Filtros:**
1. **`getUserServices()`** - Usuário vê seus próprios serviços independente do status
2. **Hospitais/Clínicas/Farmácias** - Sempre visíveis (assumidos como estabelecimentos válidos)
3. **Dados sem campos** - Assumidos como válidos para compatibilidade

### **Logs de Debug:**
```
🚫 Serviço [Nome] filtrado - Status: suspended, Verificado: false
✅ Processados X serviços com sucesso
```

### **Performance:**
- Filtros aplicados no código (não no Firestore) para compatibilidade
- Considerar migração futura para filtros nativos do Firestore

## 🚀 Benefícios

- ✅ **Segurança:** Apenas serviços aprovados são visíveis
- ✅ **Qualidade:** Filtro de verificação garante legitimidade
- ✅ **Controle:** Admins podem suspender serviços problemáticos
- ✅ **Compatibilidade:** Funciona com dados existentes
- ✅ **Flexibilidade:** Fácil de ajustar critérios no futuro