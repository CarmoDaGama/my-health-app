# Implementação de Validações de Usuário

## 📋 Validações Implementadas

### 1. **Validação de Usuário Ativo (`isActive`)**

#### Requisito
- Usuários com `isActive: false`, `null` ou `undefined` não podem fazer login
- Deve mostrar mensagem explicativa do motivo

#### Implementação

**Tipos atualizados (`types/index.ts`):**
```typescript
export interface BaseUser {
  // ... outros campos
  isActive: boolean; // Se false/null/undefined, usuário não pode fazer login
  isVerified?: boolean; // Para profissionais/instituições
}
```

**Validação no login (`services/auth-firebase.ts`):**
```typescript
// Validate if user is active
if (userData.isActive === false || userData.isActive === null || userData.isActive === undefined) {
  // Sign out the user immediately since account is inactive
  await signOut(auth);
  return {
    success: false,
    error: 'Sua conta foi desativada. Entre em contato com o suporte para assistência.'
  };
}
```

**Valores padrão no registro:**
- Novos usuários: `isActive: true` (ativo por padrão)

#### Mensagens de Erro
- **Português:** "Sua conta foi desativada. Entre em contato com o suporte para assistência."
- **Inglês:** "Your account has been deactivated. Please contact support for assistance."

---

### 2. **Validação de Usuário Verificado (`isVerified`)**

#### Requisito
- Profissionais e instituições com `isVerified: false`, `null` ou `undefined` não aparecem na aplicação para outros usuários
- Aplicação apenas a usuários dos tipos `PROFESSIONAL` e `INSTITUTION`

#### Implementação

**Filtro nas consultas (`services/api-firebase.ts`):**
```typescript
// IMPORTANTE: Filtrar apenas serviços verificados para profissionais e instituições
// Profissionais e instituições não verificados não aparecem na busca
constraints.push(where('verified', '==', true));
```

**Métodos atualizados:**
- `getAllServices()` - Lista geral de serviços
- `searchServices()` - Busca de serviços
- `getNearbyServices()` - Serviços próximos (usa getAllServices)

**Valores padrão no registro:**
- Usuários normais: `isVerified: true` (verificados automaticamente)
- Profissionais/Instituições: `isVerified: false` (requerem verificação manual)

#### Banner de Aviso
**Componente criado:** `components/common/UserStatusBanner.tsx`
- Mostra aviso para profissionais/instituições não verificados
- Aparece no perfil do usuário
- Não aparece para usuários normais ou convidados

#### Mensagens de Aviso
- **Português:** "Sua conta profissional ainda não foi verificada e não aparecerá nas buscas."
- **Inglês:** "Your professional account is not yet verified and will not appear in searches."

---

## 🛠️ Arquivos Modificados

### Tipos e Interfaces
- `types/index.ts` - Adicionados campos `isActive` e `isVerified`

### Serviços de Autenticação
- `services/auth-firebase.ts` - Validação no login e valores padrão no registro

### Serviços de API
- `services/api-firebase.ts` - Filtros para usuários verificados

### Interface de Usuário
- `screens/UserProfileScreen.tsx` - Banner de status adicionado
- `components/common/UserStatusBanner.tsx` - Novo componente de aviso

### Utilitários
- `utils/userValidations.ts` - Funções auxiliares de validação
- `utils/i18n.ts` - Mensagens de erro e aviso em PT/EN

---

## 🔧 Fluxo de Funcionamento

### Fluxo de Login
1. Usuário insere credenciais
2. Firebase Auth valida email/senha
3. **Sistema verifica `isActive`**
4. Se inativo → Logout automático + mensagem de erro
5. Se ativo → Login bem-sucedido

### Fluxo de Busca de Serviços
1. Usuário busca profissionais/instituições
2. **Sistema filtra apenas `verified: true`**
3. Profissionais/instituições não verificados não aparecem
4. Lista apenas serviços verificados

### Fluxo de Registro
1. Usuário se registra
2. **Sistema define valores padrão:**
   - `isActive: true` (todos os tipos)
   - `isVerified: true` (apenas usuários normais)
   - `isVerified: false` (profissionais e instituições)

### Fluxo de Aviso
1. Profissional/instituição acessa perfil
2. **Sistema verifica `isVerified`**
3. Se não verificado → Mostra banner de aviso
4. Banner inclui botão para contato com suporte

---

## 🎯 Casos de Uso

### Caso 1: Usuário Inativo Tenta Fazer Login
```
Entrada: Email/senha de usuário com isActive: false
Resultado: "Sua conta foi desativada. Entre em contato com o suporte para assistência."
Status: Login negado
```

### Caso 2: Profissional Não Verificado
```
Entrada: Busca por profissionais
Resultado: Profissional não aparece na lista
Status: Filtrado automaticamente
```

### Caso 3: Instituição Não Verificada
```
Entrada: Busca por clínicas
Resultado: Clínica não aparece na lista
Status: Filtrado automaticamente
```

### Caso 4: Aviso de Verificação
```
Entrada: Profissional não verificado acessa perfil
Resultado: Banner amarelo com aviso e botão de contato
Status: Informativo, não bloqueia o uso
```

---

## ✅ Resumo das Validações

| Campo | Tipo de Usuário | Valor Padrão | Comportamento |
|-------|----------------|--------------|---------------|
| `isActive` | Todos | `true` | Controla se pode fazer login |
| `isVerified` | Normal | `true` | Não aplicável |
| `isVerified` | Profissional | `false` | Controla visibilidade na busca |
| `isVerified` | Instituição | `false` | Controla visibilidade na busca |

**Importante:** As validações são complementares e independentes:
- `isActive` afeta o **login**
- `isVerified` afeta a **visibilidade na aplicação**