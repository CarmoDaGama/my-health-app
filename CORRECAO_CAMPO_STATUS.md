# 🔧 CORREÇÃO: Campo de Status dos Serviços de Saúde

## 📝 Mudança Implementada

**Campo correto:** `status` com valores `"active"` | `"suspended"`  
**Campo anterior:** `verified` com valores `true` | `false`

## 🛠️ Ajustes Realizados

### 1. **Tipo HealthService Atualizado**
```typescript
export interface HealthService {
  // ... outros campos
  status?: 'active' | 'suspended'; // Status do serviço - suspensos não aparecem na busca
}
```

### 2. **Lógica de Filtro Corrigida**
```typescript
// ANTES (incorreto):
const isVerified = data.verified !== undefined ? data.verified : true;
if (!isVerified) { /* ocultar */ }

// DEPOIS (correto):
const serviceStatus = data.status !== undefined ? data.status : 'active';
if (serviceStatus === 'suspended') { /* ocultar */ }
```

### 3. **Processo de Registro Atualizado**
- **Novos profissionais/instituições:** `status: 'suspended'` (até aprovação)
- **Serviços existentes:** `status: 'active'` (assumir como válidos)

### 4. **Traduções Atualizadas**
- **Português:** "Serviço Suspenso" / "Seu serviço profissional está suspenso..."
- **Inglês:** "Service Suspended" / "Your professional service is suspended..."

## 📋 Estados dos Serviços

| Status | Comportamento | Casos de Uso |
|--------|---------------|--------------|
| `active` | Aparece nas buscas | Serviços aprovados e funcionais |
| `suspended` | Oculto das buscas | Serviços pendentes de aprovação ou suspensos por violação |

## 🔄 Migração de Dados

### Script de Migração
```bash
node scripts/migrate-add-status-field.js
```

**Funcionalidade:**
- Adiciona campo `status: 'active'` aos serviços existentes sem o campo
- Mantém compatibilidade com dados antigos
- Log detalhado do processo

### Comportamento Inteligente
- **Serviços sem campo `status`:** Assumidos como `'active'`
- **Novos serviços de profissionais/instituições:** `'suspended'` por padrão
- **Serviços estáticos (hospitais, clínicas):** Sempre `'active'`

## 🧪 Como Testar

### 1. Verificar Serviços Existentes
```bash
node scripts/test-services-visibility.js
```

### 2. Testar Novo Registro
1. Registrar como profissional/instituição
2. Verificar que o serviço não aparece na busca
3. Verificar banner de aviso no perfil

### 3. Verificar Filtro no App
- Serviços com `status: 'active'` → Aparecem
- Serviços com `status: 'suspended'` → Ocultos
- Serviços sem campo `status` → Aparecem (compatibilidade)

## ✅ Resultado Esperado

- ✅ **Serviços existentes:** Continuam aparecendo normalmente
- ✅ **Novos profissionais:** Status `suspended`, ficam ocultos até aprovação
- ✅ **Novas instituições:** Status `suspended`, ficam ocultas até aprovação
- ✅ **Banner de aviso:** Mostra para serviços suspensos
- ✅ **Compatibilidade:** Funciona com dados antigos e novos

## 🔍 Logs de Debug

```
📄 Processando documento: [ID]
🚫 Serviço [Nome] suspenso - ocultando
✅ Processados X serviços com sucesso
```

## 📁 Arquivos Modificados

- `types/index.ts` - Tipo HealthService com campo `status`
- `services/api-firebase.ts` - Filtro inteligente por status
- `services/auth-firebase.ts` - Novos registros com status suspenso
- `utils/userValidations.ts` - Funções para validação de status
- `components/common/UserStatusBanner.tsx` - Banner para serviços suspensos
- `utils/i18n.ts` - Traduções atualizadas
- `scripts/migrate-add-status-field.js` - Migração para campo status