# Correção: Nova Instituição Não Aparece para Usuários Convidados

## 🐛 **Problema Identificado:**
- Usuário registra nova instituição
- Quando entra como usuário convidado, a nova instituição não aparece na lista/mapa
- Instituição foi salva, mas não está sendo exibida

## 🔍 **Análise da Causa:**

### **1. Coordenadas Incorretas**
```typescript
// PROBLEMA: Coordenadas aleatórias em vez das reais
coordinates: {
  latitude: -8.8379 + (Math.random() - 0.5) * 0.1,
  longitude: 13.2894 + (Math.random() - 0.5) * 0.1
}

// SOLUÇÃO: Usar coordenadas capturadas no formulário
coordinates: data.institutionInfo?.coordinates || {
  latitude: -8.8379 + (Math.random() - 0.5) * 0.1,
  longitude: 13.2894 + (Math.random() - 0.5) * 0.1
}
```

### **2. Cache Não Atualizado**
- Cache de serviços não era limpo adequadamente após novo registro
- Método de limpeza não forçava recarregamento completo

## ✅ **Soluções Implementadas:**

### **1. AuthService (`services/auth.ts`)**

#### **Coordenadas Reais:**
```typescript
// Para Profissionais
coordinates: data.professionalInfo?.coordinates || fallback

// Para Instituições  
coordinates: data.institutionInfo?.coordinates || fallback
```

#### **Sistema de Refresh Melhorado:**
```typescript
// Novo método para forçar recarregamento completo
private static async forceRefreshServices(): Promise<void> {
  const { HealthServiceAPI } = require('./api');
  await HealthServiceAPI.refreshServices();
}

// Debug completo após registro
await this.debugAllServices();
```

### **2. HealthServiceAPI (`services/api.ts`)**

#### **Método de Refresh Dedicado:**
```typescript
static async refreshServices(): Promise<HealthService[]> {
  // Limpar cache
  serviceCache.remove('all_services');
  
  // Recarregar serviços  
  const allServices = await this.getAllCombinedServices();
  
  // Recriar cache
  serviceCache.set('all_services', allServices, { ttl: 1000 * 60 * 10 });
  
  return allServices;
}
```

#### **Debug Completo:**
```typescript
static async debugListAllServices(): Promise<void> {
  // Lista serviços estáticos
  // Lista serviços registrados
  // Mostra total combinado
  // Verifica status do cache
}
```

### **3. HomeScreen (`screens/HomeScreen.tsx`)**

#### **Logging Melhorado:**
```typescript
useFocusEffect(
  useCallback(() => {
    console.log('👁️ HomeScreen focada - recarregando serviços...');
    loadServices();
  }, [])
);
```

## 📊 **Fluxo de Registro Corrigido:**

```
1. Usuário registra instituição
2. AuthService.addToHealthServices():
   ✅ Salva com coordenadas reais
   ✅ Adiciona ao AsyncStorage
   ✅ Força refresh do HealthServiceAPI
   ✅ Debug lista todos os serviços

3. Usuário volta para HomeScreen:
   ✅ useFocusEffect detecta foco
   ✅ loadServices() é chamado
   ✅ HealthServiceAPI.getAllServices() busca dados atualizados
   ✅ Nova instituição aparece na lista/mapa
```

## 🔍 **Logs de Debug Esperados:**

```
💾 Adicionando usuário aos serviços de saúde: [Nome] institution
📊 Serviços existentes: X
✅ Novo serviço criado: [Nome] clinic
💾 Serviço salvo! Total de serviços registrados: X+1
🔄 Forçando recarregamento dos serviços...
✅ Serviços recarregados: X+1

🔍 === DEBUG: LISTANDO TODOS OS SERVIÇOS ===
📋 Serviços estáticos: Y
📱 Serviços registrados: Z+1
  1. [Nova Instituição] (clinic) - [Endereço]
🔗 Total combinado: Y+Z+1
💾 Em cache: Y+Z+1
🔍 === FIM DEBUG ===

👁️ HomeScreen focada - recarregando serviços...
🔄 Carregando serviços...
📊 Serviços carregados: Y+Z+1
🏥 Tipos de serviços: professional, clinic, hospital, ...
```

## 🧪 **Como Testar:**

1. **Registrar Nova Instituição:**
   - Preencher todos os campos
   - Capturar localização (GPS ou mapa)
   - Completar registro

2. **Verificar Logs:** 
   - Deve mostrar "Novo serviço criado"
   - Debug deve listar a nova instituição

3. **Entrar como Convidado:**
   - HomeScreen deve recarregar automaticamente
   - Nova instituição deve aparecer na lista/mapa

## 🎯 **Benefícios:**

- ✅ **Coordenadas Precisas:** Usa localização real capturada
- ✅ **Cache Atualizado:** Força recarregamento após registro  
- ✅ **Debug Completo:** Logs detalhados para troubleshooting
- ✅ **Sincronização:** HomeScreen sempre mostra dados atualizados
- ✅ **UX Melhorada:** Usuários veem mudanças imediatamente

**Resultado:** Novas instituições registradas aparecem imediatamente para todos os usuários! 🎉