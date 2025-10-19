# 🚀 Implementação Client-Side - Sistema de Aprovação de Profissionais

## 📋 Visão Geral

Este documento descreve a implementação **client-side** do sistema de aprovação de profissionais e gerenciamento de roles administrativas, criada como alternativa aos **Cloud Functions** devido à limitação do plano gratuito (Spark) do Firebase.

### ⚠️ Por Que Client-Side?

O Firebase **Blaze Plan** (pay-as-you-go) é necessário para usar:
- Cloud Functions
- Cloud Build API
- Artifact Registry API

Esta implementação permite usar todas as funcionalidades administrativas sem upgrade de plano, com algumas limitações documentadas abaixo.

---

## 🏗️ Arquitetura

### Componentes Principais

```
my-health-app/
├── services/
│   ├── roles-client.ts          # Gerenciamento de roles (Fase 1)
│   └── approval-client.ts       # Aprovação de profissionais (Fase 2)
├── screens/
│   ├── AdminDashboardScreen.tsx      # Dashboard com estatísticas
│   ├── AdminPendingServicesScreen.tsx # Lista e ações sobre pendentes
│   └── AdminManageRolesScreen.tsx    # Gerenciar admins
└── firestore.rules              # Regras de segurança atualizadas
```

---

## 🔐 Sistema de Roles

### Tipos de Roles Disponíveis

| Role | Permissões |
|------|-----------|
| **super_admin** | Todas as permissões + gerenciar admins |
| **admin** | Aprovar/rejeitar profissionais, ver estatísticas |
| **moderator** | Moderar conteúdo, ver relatórios |
| **analytics_viewer** | Apenas visualizar analytics |

### Como as Roles Funcionam

1. **Armazenamento**: Roles são armazenadas na coleção `adminRoles`
2. **Custom Claims**: Devem ser definidos manualmente (ver seção abaixo)
3. **Verificação**: Cada tela verifica permissões antes de renderizar

---

## 🛠️ Serviços Implementados

### 1. `roles-client.ts` (Fase 1)

Gerenciamento de roles administrativas sem Cloud Functions.

**Funções principais:**
```typescript
// Atribuir role de admin
await setAdminRole(email: string, role: AdminRole)

// Remover role de admin
await removeAdminRole(email: string)

// Listar todos os admins
await listAdmins()

// Verificar se é admin
await isCurrentUserAdmin()

// Verificar se é super admin
await isCurrentUserSuperAdmin()

// Obter role do usuário atual
await getCurrentUserRole()

// Verificar permissões específicas
await canModerate()
await canViewAnalytics()
```

**Limitações:**
- ❌ Não define Custom Claims automaticamente (requer ação manual)
- ❌ Não envia emails de notificação
- ✅ Funciona completamente offline após autenticação

### 2. `approval-client.ts` (Fase 2)

Sistema de aprovação de profissionais sem Cloud Functions.

**Funções principais:**
```typescript
// Aprovar profissional
await approveProfessional(serviceId: string, notes?: string)

// Rejeitar profissional
await rejectProfessional(serviceId: string, reason: string)

// Listar serviços pendentes/aprovados/rejeitados
await listPendingServices(status: 'pending' | 'approved' | 'rejected')

// Obter detalhes de um serviço
await getServiceDetails(serviceId: string)

// Obter estatísticas
await getServicesStats()
```

**O que faz:**
- ✅ Move serviços de `registeredServices` para `healthServices` ao aprovar
- ✅ Atualiza status do profissional para `verified: true`
- ✅ Registra logs de ações administrativas
- ✅ Valida permissões do usuário

**Limitações:**
- ❌ Não envia emails de aprovação/rejeição
- ❌ Profissionais não são notificados automaticamente
- ⚠️ Segurança depende das Firestore Rules (menos robusto que Cloud Functions)

---

## 🖥️ Telas Administrativas

### 1. AdminDashboardScreen

**Rota:** `AdminDashboard`

**Features:**
- 📊 Estatísticas em tempo real (pendentes, aprovados, rejeitados, total)
- 🎯 Atalhos para principais ações
- 🔄 Pull-to-refresh para atualizar dados
- ⚠️ Avisos sobre limitações client-side

**Acesso:** Requer `isAdmin == true`

### 2. AdminPendingServicesScreen

**Rota:** `AdminPendingServices`

**Features:**
- 📋 Lista de serviços aguardando aprovação
- 👤 Informações do profissional (nome, email, telefone)
- 📍 Localização e especialidade
- ✅ Aprovar com notas opcionais
- ❌ Rejeitar com motivo obrigatório
- 🔄 Atualização automática após ações

**Acesso:** Requer `isAdmin == true`

**Fluxo de Aprovação:**
```
1. Admin abre lista de pendentes
2. Clica em "Aprovar" no card do serviço
3. Modal aparece para adicionar notas (opcional)
4. Confirma aprovação
5. Serviço movido para healthServices
6. Status atualizado para "approved"
7. Profissional marcado como verified
8. Log registrado
```

**Fluxo de Rejeição:**
```
1. Admin abre lista de pendentes
2. Clica em "Rejeitar" no card do serviço
3. Modal aparece para informar motivo (obrigatório)
4. Confirma rejeição
5. Status atualizado para "rejected"
6. Motivo salvo no documento
7. Log registrado
```

### 3. AdminManageRolesScreen

**Rota:** `AdminManageRoles`

**Features:**
- 👥 Lista de todos os administradores
- ➕ Adicionar novos admins (Super Admins only)
- 🗑️ Remover admins (Super Admins only)
- 🎨 Badges coloridos por role
- 📅 Data de atribuição da role
- 👤 Quem atribuiu a role

**Acesso:** Requer `isSuperAdmin == true` ou `role == 'admin'` (read-only)

**Roles disponíveis ao adicionar:**
- **Admin**: Pode aprovar e gerenciar profissionais
- **Moderador**: Pode ver e moderar conteúdo

---

## 🔒 Firestore Rules Atualizadas

As regras foram atualizadas para suportar operações client-side seguras:

### adminRoles Collection
```javascript
match /adminRoles/{userId} {
  // Admins podem ler suas próprias roles
  allow read: if request.auth != null && request.auth.uid == userId;
  // Super admins e admins podem ler todas as roles
  allow read: if isAdmin();
  // Apenas super admins podem criar/atualizar/deletar roles
  allow create, update, delete: if isSuperAdmin();
}
```

### registeredServices Collection
```javascript
match /registeredServices/{serviceId} {
  // Admins podem ler todos os registros pendentes
  allow read: if isAdmin();
  // Criadores podem ler seus próprios registros
  allow read: if request.auth != null && 
    request.auth.uid == resource.data.createdBy;
  // Admins podem atualizar status (aprovar/rejeitar)
  allow update: if isAdmin();
}
```

### adminLogs Collection
```javascript
match /adminLogs/{logId} {
  // Apenas admins podem ler logs
  allow read: if isAdmin();
  // Admins podem criar logs (client-side)
  allow create: if isAdmin() && 
    request.resource.data.adminId == request.auth.uid;
  // Logs não podem ser modificados
  allow update, delete: if false;
}
```

---

## ⚙️ Configuração Inicial

### 1. Definir Custom Claims Manualmente

Como Custom Claims não podem ser definidos client-side, você precisa usar um dos métodos abaixo:

#### Opção A: Firebase Console (Recomendado para testes)

Não é possível via console diretamente. Use Opção B ou C.

#### Opção B: Script Node.js com Firebase Admin SDK

Crie um arquivo `scripts/set-admin-claims.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaims(email, role) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, {
      isAdmin: true,
      role: role // 'super_admin', 'admin', 'moderator'
    });
    console.log(`✅ Custom claims definidos para ${email} com role: ${role}`);
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Uso:
setAdminClaims('seu-email@exemplo.com', 'super_admin')
  .then(() => process.exit(0));
```

Execute:
```bash
node scripts/set-admin-claims.js
```

#### Opção C: Cloud Functions (requer Blaze plan)

Se futuramente você fizer upgrade para Blaze plan, as Cloud Functions já implementadas podem definir Custom Claims automaticamente.

### 2. Adicionar Rotas no AppNavigator

Adicione as novas telas no seu `AppNavigator.tsx`:

```typescript
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminPendingServicesScreen from '../screens/AdminPendingServicesScreen';
import AdminManageRolesScreen from '../screens/AdminManageRolesScreen';

// Dentro do Stack.Navigator:
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

### 3. Adicionar Botão de Acesso ao Dashboard

No seu `ProfileScreen.tsx` ou `HomeScreen.tsx`:

```typescript
import { isCurrentUserAdmin } from '../services/roles-client';

// No componente:
const [isAdmin, setIsAdmin] = useState(false);

useEffect(() => {
  checkAdmin();
}, []);

const checkAdmin = async () => {
  const adminStatus = await isCurrentUserAdmin();
  setIsAdmin(adminStatus);
};

// No render:
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

---

## 🧪 Como Testar

### 1. Testar Sistema de Roles

```typescript
import { 
  setAdminRole, 
  isCurrentUserAdmin,
  listAdmins 
} from './services/roles-client';

// 1. Definir Custom Claims manualmente (ver seção acima)

// 2. Registrar role no Firestore
const result = await setAdminRole('usuario@email.com', 'admin');
console.log(result); // { success: true }

// 3. Verificar admin
const isAdmin = await isCurrentUserAdmin();
console.log(isAdmin); // true

// 4. Listar admins
const admins = await listAdmins();
console.log(admins); // { success: true, admins: [...] }
```

### 2. Testar Aprovação de Profissionais

```typescript
import {
  listPendingServices,
  approveProfessional,
  rejectProfessional
} from './services/approval-client';

// 1. Listar pendentes
const pending = await listPendingServices('pending');
console.log(pending); // { success: true, services: [...], count: 5 }

// 2. Aprovar
const approved = await approveProfessional('serviceId123', 'Aprovado');
console.log(approved); // { success: true }

// 3. Rejeitar
const rejected = await rejectProfessional('serviceId456', 'Documentos inválidos');
console.log(rejected); // { success: true }
```

### 3. Testar Telas

1. Faça login com usuário admin
2. Navegue para `AdminDashboard`
3. Verifique estatísticas
4. Entre em "Serviços Pendentes"
5. Aprove ou rejeite um serviço
6. Volte ao dashboard e veja contadores atualizados
7. Entre em "Gerenciar Roles"
8. Adicione um novo admin (se for super admin)

---

## 🚨 Limitações e Diferenças

### ❌ O Que NÃO Funciona (comparado a Cloud Functions)

| Funcionalidade | Client-Side | Cloud Functions |
|---------------|-------------|-----------------|
| **Emails automáticos** | ❌ Não envia | ✅ Envia via Nodemailer |
| **Custom Claims automáticos** | ❌ Requer ação manual | ✅ Define automaticamente |
| **Segurança server-side** | ⚠️ Depende de Rules | ✅ Validação no servidor |
| **Triggers automáticos** | ❌ Não suportado | ✅ onNewServiceRegistered |
| **Performance** | ⚠️ Operações múltiplas client-side | ✅ Batch operations |

### ✅ O Que Funciona Bem

- ✅ Aprovar e rejeitar profissionais
- ✅ Gerenciar roles de admins
- ✅ Listar serviços pendentes
- ✅ Visualizar estatísticas
- ✅ Logs de ações administrativas
- ✅ Interface completa e funcional
- ✅ Validação de permissões
- ✅ Offline-capable após autenticação

---

## 🔄 Migração para Cloud Functions (Futuro)

Quando você fizer upgrade para Blaze plan, pode migrar facilmente:

### 1. Deploy das Cloud Functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### 2. Atualizar Services

Crie `services/approval.ts` e `services/roles.ts` que usam Cloud Functions:

```typescript
// services/approval.ts
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

export async function approveProfessional(serviceId: string, notes?: string) {
  const callable = httpsCallable(functions, 'approveProfessional');
  const result = await callable({ serviceId, notes });
  return result.data;
}
```

### 3. Trocar Imports

Nas telas, substitua:
```typescript
// De:
import { approveProfessional } from '../services/approval-client';

// Para:
import { approveProfessional } from '../services/approval';
```

### 4. Remover Arquivos Client-Side (opcional)

- `services/roles-client.ts`
- `services/approval-client.ts`

---

## 📊 Estrutura de Dados

### Collection: adminRoles

```typescript
{
  userId: string;           // UID do usuário
  role: AdminRole;          // 'super_admin' | 'admin' | 'moderator'
  isAdmin: boolean;         // true
  createdAt: Timestamp;     // Data de criação
  assignedBy: string;       // UID de quem atribuiu
  assignedByEmail: string;  // Email de quem atribuiu
}
```

### Collection: registeredServices

```typescript
{
  id: string;
  name: string;
  serviceType: string;
  specialty: string;
  description: string;
  address: string;
  city: string;
  province: string;
  location: { latitude: number; longitude: number };
  contactEmail: string;
  contactPhone: string;
  createdBy: string;        // UID do profissional
  createdAt: Timestamp;
  status: 'pending' | 'approved' | 'rejected';
  verified: boolean;
  
  // Campos adicionados ao processar:
  processedAt?: Timestamp;
  processedBy?: string;
  approvedBy?: string;
  approverEmail?: string;
  approverNotes?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}
```

### Collection: adminLogs

```typescript
{
  adminId: string;          // UID do admin
  adminEmail: string;       // Email do admin
  action: string;           // 'APPROVE_PROFESSIONAL' | 'REJECT_PROFESSIONAL' | etc
  details: any;             // Detalhes da ação
  timestamp: Timestamp;     // Data/hora
}
```

---

## 🐛 Troubleshooting

### Problema: "Acesso Negado" nas telas admin

**Causa:** Custom Claims não definidos ou usuário não tem role no Firestore.

**Solução:**
1. Verifique se Custom Claims foram definidos (use script Node.js)
2. Verifique se existe documento em `adminRoles/{userId}`
3. Faça logout e login novamente para atualizar token

### Problema: Aprovação não move serviço para healthServices

**Causa:** Firestore Rules bloqueando operação.

**Solução:**
1. Verifique se fez deploy das rules: `firebase deploy --only firestore:rules`
2. Verifique no Firebase Console se as rules estão atualizadas
3. Verifique se o usuário é realmente admin (`isAdmin == true` no token)

### Problema: Não consigo adicionar novos admins

**Causa:** Apenas Super Admins podem adicionar admins.

**Solução:**
1. Verifique se seu usuário tem `role: 'super_admin'` no Custom Claim
2. Verifique se existe documento em `adminRoles` com `role: 'super_admin'`
3. Use o script Node.js para definir o primeiro Super Admin

### Problema: Estatísticas não aparecem

**Causa:** Queries Firestore falhando por falta de permissão.

**Solução:**
1. Verifique se fez deploy das Firestore Rules atualizadas
2. Verifique logs do console para ver erro específico
3. Teste com `firebase emulators:start` localmente

---

## 📚 Recursos Adicionais

### Documentação Relacionada

- [FASE1_ROLES.md](./FASE1_ROLES.md) - Documentação do sistema de roles com Cloud Functions
- [FASE2_IMPLEMENTACAO_COMPLETA.md](./FASE2_IMPLEMENTACAO_COMPLETA.md) - Implementação completa com Cloud Functions
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Configuração do Firebase

### Links Úteis

- [Firebase Authentication - Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Pricing](https://firebase.google.com/pricing)

---

## 🎯 Conclusão

Esta implementação client-side fornece todas as funcionalidades essenciais do sistema de aprovação de profissionais e gerenciamento de roles **sem custo adicional**, rodando completamente no plano gratuito do Firebase.

**Recomendações:**

- ✅ **Para desenvolvimento e MVP**: Use esta implementação client-side
- ✅ **Para pequena escala (< 1000 profissionais)**: Client-side é suficiente
- ⚠️ **Para produção em larga escala**: Migre para Cloud Functions para:
  - Emails automáticos
  - Maior segurança
  - Custom Claims automáticos
  - Performance otimizada

---

**Desenvolvido para Health App Angola**  
**Data:** Outubro 2025  
**Versão:** 1.0.0
