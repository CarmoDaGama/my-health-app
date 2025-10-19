# Fase 1: Sistema de Roles e Permissões ✅

## ✅ Implementação Concluída

Esta fase implementa o **sistema de roles administrativas** usando Firebase Custom Claims, permitindo controle granular de permissões.

---

## 📁 Arquivos Criados

### Cloud Functions (`/functions/src/`)

1. **`index.ts`** - Ponto de entrada principal
   - Inicializa Firebase Admin SDK
   - Exporta todas as Cloud Functions
   - Configurações globais (região, maxInstances)

2. **`roles.ts`** - Gerenciamento de roles administrativas
   - `setAdminRole()` - Atribuir role de admin
   - `removeAdminRole()` - Remover role de admin
   - `listAdmins()` - Listar todos os admins
   - `logAdminAction()` - Helper para logs

3. **`utils/validators.ts`** - Utilitários de validação
   - `isAdmin()` - Verificar se usuário é admin
   - `hasRole()` - Verificar role específica
   - `isSuperAdmin()` - Verificar super admin
   - `isValidEmail()` - Validar formato de email
   - `isValidAngolanPhone()` - Validar telefone angolano

### Scripts (`/scripts/`)

4. **`create-first-admin.js`** - Script para criar primeiro super admin
   - Cria usuário no Firebase Auth
   - Define Custom Claims (super_admin)
   - Cria documento em `users` collection
   - Cria documento em `adminRoles` collection
   - Registra log da criação

### Configuração

5. **`firestore.rules`** - Regras de segurança atualizadas
   - Funções auxiliares: `isAdmin()`, `hasRole()`, `isSuperAdmin()`, `isModerator()`
   - Proteção da coleção `adminRoles` (apenas super admins)
   - Proteção da coleção `adminLogs` (apenas leitura por admins)
   - Proteção da coleção `reportedReviews` (apenas moderadores)
   - Regras para `healthServices` e `registeredServices` com verificação de roles

---

## 🎯 Hierarquia de Roles

```
super_admin (Super Administrador)
├── Pode fazer TUDO
├── Atribuir/remover roles de outros admins
├── Aprovar/rejeitar profissionais
├── Moderar conteúdo
├── Acessar analytics
└── Gerenciar sistema completo

admin (Administrador)
├── Aprovar/rejeitar profissionais
├── Moderar conteúdo
├── Acessar analytics
└── Gerenciar serviços de saúde

moderator (Moderador)
├── Moderar conteúdo (reviews, reports)
└── Ver reviews reportadas

analytics_viewer (Visualizador de Analytics)
└── Apenas visualizar dashboard de analytics
```

---

## 🚀 Como Usar

### 1. Deploy das Cloud Functions

```bash
cd /home/katsuvie/Projects/my-health-app/functions
npm run build
firebase deploy --only functions
```

**Funções disponíveis após deploy:**
- `setAdminRole` - Atribuir role
- `removeAdminRole` - Remover role
- `listAdmins` - Listar admins

### 2. Deploy das Firestore Rules

```bash
cd /home/katsuvie/Projects/my-health-app
firebase deploy --only firestore:rules
```

### 3. Baixar Service Account Key

**Necessário para o script `create-first-admin.js`**

1. Ir ao Firebase Console
2. Project Settings > Service Accounts
3. Clicar em "Generate new private key"
4. Salvar como `/home/katsuvie/Projects/my-health-app/service-account-key.json`

⚠️ **IMPORTANTE**: Adicione este arquivo ao `.gitignore`!

```bash
echo "service-account-key.json" >> .gitignore
```

### 4. Criar Primeiro Super Admin

```bash
cd /home/katsuvie/Projects/my-health-app
node scripts/create-first-admin.js admin@healthapp.ao MinhaSenha123!
```

**O script irá:**
- ✅ Criar usuário no Firebase Auth
- ✅ Definir Custom Claims (super_admin, isAdmin: true)
- ✅ Criar documento em `users` collection
- ✅ Criar documento em `adminRoles` collection
- ✅ Registrar log em `adminLogs` collection

### 5. Atribuir Role para Outro Usuário

**No app mobile ou admin panel**, chamar a Cloud Function:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const setAdminRole = httpsCallable(functions, 'setAdminRole');

// Atribuir role de moderador
await setAdminRole({ 
  userId: 'abc123', 
  role: 'moderator' 
});
```

**Roles válidas:**
- `super_admin`
- `admin`
- `moderator`
- `analytics_viewer`

### 6. Remover Role de um Usuário

```typescript
const removeAdminRole = httpsCallable(functions, 'removeAdminRole');

await removeAdminRole({ userId: 'abc123' });
```

### 7. Listar Todos os Admins

```typescript
const listAdmins = httpsCallable(functions, 'listAdmins');

const result = await listAdmins();
console.log(result.data.admins);
// [
//   { userId: '...', email: 'admin@...', role: 'super_admin', ... },
//   { userId: '...', email: 'mod@...', role: 'moderator', ... },
// ]
```

---

## 🧪 Testar Localmente (Opcional)

### 1. Iniciar Firebase Emulators

```bash
cd /home/katsuvie/Projects/my-health-app
firebase emulators:start
```

### 2. Configurar App para Usar Emulators

```typescript
import { connectFunctionsEmulator } from 'firebase/functions';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';

// No modo de desenvolvimento
if (__DEV__) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

---

## 🔒 Segurança

### Custom Claims

As roles são armazenadas como **Custom Claims** no Firebase Auth Token:

```json
{
  "role": "super_admin",
  "isAdmin": true,
  "assignedAt": 1234567890,
  "assignedBy": "uid-do-super-admin"
}
```

### Firestore Rules

As regras do Firestore verificam estas claims:

```javascript
// Verificar se é admin
function isAdmin() {
  return request.auth != null && 
         request.auth.token.isAdmin == true;
}

// Verificar role específica
function hasRole(role) {
  return request.auth != null && 
         request.auth.token.role == role;
}
```

### Coleções Protegidas

| Coleção | Quem Pode Ler | Quem Pode Escrever |
|---------|---------------|-------------------|
| `adminRoles` | Todos admins | Apenas super_admin |
| `adminLogs` | Todos admins | Apenas Cloud Functions |
| `reportedReviews` | Moderadores | Moderadores |
| `registeredServices` | Admins + criador | Admins + criador |

---

## 📊 Collections no Firestore

### `adminRoles/{userId}`

```typescript
{
  userId: string;           // UID do admin
  role: string;            // 'super_admin' | 'admin' | 'moderator' | 'analytics_viewer'
  isAdmin: boolean;        // true
  createdAt: Timestamp;    // Data de criação
  assignedBy: string;      // UID de quem atribuiu
  assignedByEmail: string; // Email de quem atribuiu
}
```

### `adminLogs/{logId}`

```typescript
{
  adminId: string;        // UID do admin que fez a ação
  adminEmail: string;     // Email do admin
  action: string;         // 'SET_ADMIN_ROLE' | 'REMOVE_ADMIN_ROLE' | etc
  details: object;        // Detalhes da ação
  timestamp: Timestamp;   // Data/hora da ação
  ip: string | null;      // IP do admin (se disponível)
}
```

---

## ⚠️ Importante

1. **Nunca exponha `service-account-key.json`** - Adicione ao `.gitignore`
2. **Proteja as Cloud Functions** - Apenas super admins podem atribuir roles
3. **Audite os logs** - Todas as ações ficam registradas em `adminLogs`
4. **Use HTTPS** - Cloud Functions são sempre HTTPS (certificado automático)
5. **Teste antes de produção** - Use Firebase Emulators para testar

---

## ✅ Checklist de Implementação

- [x] Criar `functions/src/roles.ts`
- [x] Criar `functions/src/utils/validators.ts`
- [x] Criar `functions/src/index.ts`
- [x] Criar `scripts/create-first-admin.js`
- [x] Atualizar `firestore.rules`
- [x] Compilar sem erros (`npm run build`)
- [ ] Deploy das Cloud Functions
- [ ] Deploy das Firestore Rules
- [ ] Baixar `service-account-key.json`
- [ ] Criar primeiro super admin
- [ ] Testar `setAdminRole`
- [ ] Testar `removeAdminRole`
- [ ] Testar `listAdmins`

---

## 📚 Próximas Fases

### Fase 2: Aprovação de Profissionais (1-2 semanas)
- Implementar `functions/src/approval.ts`
- Criar fluxo de aprovação para profissionais
- Sistema de notificações por email

### Fase 3: Moderação de Conteúdo (1 semana)
- Implementar `functions/src/moderation.ts`
- Auto-moderação com bad-words
- Dashboard de reviews reportadas

### Fase 4: Analytics Dashboard (1-2 semanas)
- Implementar `functions/src/analytics.ts`
- Métricas do sistema
- Exportação de relatórios

### Fase 5: Integração Admin Panel (1-2 semanas)
- Conectar health-admin-platform
- Interface web para admins
- Deploy em Firebase Hosting

---

## 🆘 Troubleshooting

### Erro: "Permission denied"
- Verifique se o usuário tem a role correta
- Verifique se as Firestore Rules foram deployadas
- Force refresh do token: `await user.getIdToken(true)`

### Erro: "functions/not-found"
- Verifique se as Cloud Functions foram deployadas
- Verifique o nome da função (é case-sensitive)

### Erro: "UNAUTHENTICATED"
- Verifique se o usuário está logado
- Verifique se o token não expirou

### Custom Claims não aparecem
- Custom Claims demoram até 1 hora para propagar
- Force refresh: `await user.getIdToken(true)`
- Re-login do usuário

---

**Data de Implementação**: Janeiro 2025  
**Versão**: 1.0.0  
**Status**: ✅ Fase 1 Completa - Pronta para Deploy
