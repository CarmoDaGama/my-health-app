# 🚀 Quick Start - Sistema de Aprovação de Profissionais

## ⚡ Configuração Rápida (5 minutos)

### 1️⃣ Obter Service Account Key

```bash
# 1. Acesse: https://console.firebase.google.com
# 2. Vá em: Project Settings > Service Accounts
# 3. Clique: "Generate New Private Key"
# 4. Salve em: my-health-app/scripts/serviceAccountKey.json
```

### 2️⃣ Definir Super Admin

```bash
cd my-health-app

# Instalar dependência (primeira vez)
npm install firebase-admin

# Definir você como super admin (use seu email do Firebase Auth)
node scripts/set-super-admin.js set seu-email@exemplo.com
```

Saída esperada:
```
✅ Firebase Admin inicializado
✅ Usuário encontrado: abc123
✅ Custom Claims definidos com sucesso!
✅ Documento criado com sucesso!
✅ Log registrado!

✨ SUCESSO! ✨
👤 Usuário: seu-email@exemplo.com
👑 Role: Super Admin
```

### 3️⃣ Adicionar Rotas (se ainda não foi feito)

Edite `navigation/AppNavigator.tsx`:

```typescript
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminPendingServicesScreen from '../screens/AdminPendingServicesScreen';
import AdminManageRolesScreen from '../screens/AdminManageRolesScreen';

// Dentro do Stack.Navigator, adicione:
<Stack.Screen 
  name="AdminDashboard" 
  component={AdminDashboardScreen}
  options={{ title: 'Painel Admin' }}
/>
<Stack.Screen 
  name="AdminPendingServices" 
  component={AdminPendingServicesScreen}
  options={{ title: 'Serviços Pendentes' }}
/>
<Stack.Screen 
  name="AdminManageRoles" 
  component={AdminManageRolesScreen}
  options={{ title: 'Gerenciar Roles' }}
/>
```

### 4️⃣ Adicionar Botão de Acesso

Edite `screens/ProfileScreen.tsx` (ou onde preferir):

```typescript
import { useState, useEffect } from 'react';
import { isCurrentUserAdmin } from '../services/roles-client';

// No componente:
const [isAdmin, setIsAdmin] = useState(false);

useEffect(() => {
  isCurrentUserAdmin().then(setIsAdmin);
}, []);

// No JSX, adicione:
{isAdmin && (
  <TouchableOpacity 
    style={styles.adminButton}
    onPress={() => navigation.navigate('AdminDashboard')}
  >
    <Ionicons name="shield-checkmark" size={24} color="#fff" />
    <Text style={styles.adminButtonText}>Painel Admin</Text>
  </TouchableOpacity>
)}
```

Estilos sugeridos:
```typescript
adminButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#2E7D32',
  padding: 16,
  borderRadius: 8,
  gap: 8,
},
adminButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
```

### 5️⃣ Testar

```bash
# 1. Faça logout no app
# 2. Faça login novamente (para atualizar token com Custom Claims)
# 3. Veja o botão "Painel Admin" aparecer
# 4. Clique e explore!
```

---

## 📱 Como Usar

### Dashboard Admin
1. Abra o app
2. Faça login com conta super admin
3. Toque em "Painel Admin"
4. Veja estatísticas de serviços pendentes

### Aprovar Profissional
1. Dashboard > "Serviços Pendentes"
2. Veja lista de profissionais aguardando
3. Toque em "Aprovar" no card
4. (Opcional) Adicione notas
5. Confirme
6. ✅ Profissional aprovado!

### Rejeitar Profissional
1. Dashboard > "Serviços Pendentes"
2. Toque em "Rejeitar" no card
3. Informe motivo (obrigatório)
4. Confirme
5. ❌ Profissional rejeitado

### Adicionar Admin
1. Dashboard > "Gerenciar Roles"
2. Toque no botão "+"
3. Digite email do usuário
4. Escolha role (Admin ou Moderador)
5. Confirme
6. **IMPORTANTE:** Execute o script para definir Custom Claims:
   ```bash
   node scripts/set-super-admin.js set email-do-novo-admin@exemplo.com
   ```

### Remover Admin
1. Dashboard > "Gerenciar Roles"
2. Toque em "Remover" no card do admin
3. Confirme
4. ✅ Admin removido

---

## 🔧 Comandos Úteis

```bash
# Listar todos os admins
node scripts/set-super-admin.js list

# Definir admin
node scripts/set-super-admin.js set email@exemplo.com

# Remover admin
node scripts/set-super-admin.js remove email@exemplo.com

# Deploy das Firestore Rules (se modificou)
firebase deploy --only firestore:rules

# Verificar erros no código
npx tsc --noEmit
```

---

## ❓ Problemas Comuns

### "Acesso Negado" ao abrir Dashboard

**Causa:** Custom Claims não definidos ou token não atualizado.

**Solução:**
```bash
# 1. Execute o script
node scripts/set-super-admin.js set seu-email@exemplo.com

# 2. No app:
# - Faça logout
# - Faça login novamente
# - Tente novamente
```

### Botão "Painel Admin" não aparece

**Causa:** `isAdmin` está retornando `false`.

**Solução:**
```typescript
// Adicione console.log para debug
useEffect(() => {
  isCurrentUserAdmin().then(result => {
    console.log('Is Admin:', result);
    setIsAdmin(result);
  });
}, []);
```

### Erro ao aprovar profissional

**Causa:** Firestore Rules não atualizadas ou permissões incorretas.

**Solução:**
```bash
# Fazer deploy das rules
firebase deploy --only firestore:rules

# Verificar se é realmente admin
node scripts/set-super-admin.js list
```

### Script dá erro "User not found"

**Causa:** Usuário não existe no Firebase Auth.

**Solução:**
1. Registre-se no app primeiro
2. Depois execute o script

---

## 📚 Próximos Passos

Após configuração, veja:
- [CLIENT_SIDE_IMPLEMENTATION.md](./CLIENT_SIDE_IMPLEMENTATION.md) - Documentação completa
- [IMPLEMENTACAO_FINAL.md](./IMPLEMENTACAO_FINAL.md) - Resumo técnico
- [RESUMO_CLIENT_SIDE.md](./RESUMO_CLIENT_SIDE.md) - Guia de referência

---

## 💬 Suporte

Se encontrar problemas:
1. Verifique os logs do console (`console.log`)
2. Verifique Firebase Console > Firestore Rules
3. Verifique Firebase Console > Authentication > Users
4. Consulte a documentação completa

---

**Health App Angola** - Quick Start Guide  
**Última atualização:** Outubro 2025
