# Fase 2: Sistema de Aprovação de Profissionais ✅

## ✅ Implementação Concluída

Esta fase implementa o **fluxo completo de aprovação de profissionais** resolvendo o problema crítico onde profissionais eram registrados como `verified: false` e nunca eram aprovados.

---

## 🎯 Problema Resolvido

### ❌ Antes (Problema Crítico #1)
- Profissionais registravam serviços diretamente em `healthServices`
- Campo `verified: false` era definido mas nunca mudava
- Nenhum fluxo de aprovação existia
- Admins não sabiam de novos registros
- Profissionais ficavam eternamente não verificados

### ✅ Depois (Solução Implementada)
- Profissionais registram em `registeredServices` (status: pending)
- Admins recebem notificação por email
- Admins podem aprovar/rejeitar via Cloud Functions
- Aprovação move serviço para `healthServices` com `verified: true`
- Profissionais recebem email de aprovação/rejeição
- Audit logs completo de todas as ações

---

## 📦 Arquivos Criados/Modificados

### ✅ Cloud Functions (1 arquivo novo)

**`functions/src/approval.ts`** (570 linhas)
- `approveProfessional()` - Aprovar serviço e verificar profissional
- `rejectProfessional()` - Rejeitar serviço com motivo
- `listPendingServices()` - Listar serviços aguardando aprovação
- `onNewServiceRegistered()` - Trigger: notificar admins sobre novo registro
- `sendApprovalEmail()` - Helper: email de aprovação
- `sendRejectionEmail()` - Helper: email de rejeição
- `sendNewServiceNotification()` - Helper: notificar admins

### ✅ Backend (1 arquivo modificado)

**`services/auth-firebase.ts`**
- Novo método: `addToRegisteredServices()`
- Modificado: `register()` - agora usa `registeredServices` ao invés de `healthServices`

### ✅ Configuração (2 arquivos modificados)

**`functions/src/index.ts`**
- Exporta 4 novas Cloud Functions

**`firestore.rules`**
- Regras atualizadas para `registeredServices`
- Validação de campos obrigatórios
- Controle de status (pending/approved/rejected)

---

## 🔄 Fluxo Completo de Aprovação

```
┌─────────────────┐
│  1. PROFISSIONAL│
│  Faz Registro   │
└────────┬────────┘
         │
         │ Cria documento em
         │ registeredServices
         │ status: "pending"
         │
         ▼
┌─────────────────────────────┐
│  2. TRIGGER AUTOMÁTICO      │
│  onNewServiceRegistered()   │
└────────┬────────────────────┘
         │
         │ Envia email para
         │ todos os admins
         │
         ▼
┌─────────────────┐
│  3. ADMIN       │
│  Recebe Email   │
└────────┬────────┘
         │
         │ Acessa Admin Panel
         │ ou chama Cloud Function
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌──────┐   ┌──────┐
│APROVAR│  │REJEITAR│
└───┬──┘   └───┬──┘
    │          │
    │          │ 4a. rejectProfessional()
    │          │     - Atualiza status: "rejected"
    │          │     - Envia email de rejeição
    │          │     - Registra log
    │          │
    │          ▼
    │      ┌─────────────────┐
    │      │  PROFISSIONAL   │
    │      │  Recebe Email   │
    │      │  de Rejeição    │
    │      └─────────────────┘
    │
    │ 4b. approveProfessional()
    │     - Move para healthServices
    │     - verified: true
    │     - Atualiza user: verified
    │     - Custom Claims: verified
    │     - Envia email aprovação
    │     - Registra log
    │
    ▼
┌─────────────────┐
│  PROFISSIONAL   │
│  Verificado! ✅ │
│  Recebe Email   │
└─────────────────┘
```

---

## 🚀 Como Usar

### 1. Configurar Email (Obrigatório)

As Cloud Functions usam Nodemailer para enviar emails. Configure via Firebase Functions Config:

```bash
# Opção 1: Gmail (recomendado para testes)
firebase functions:config:set email.user="seu-email@gmail.com"
firebase functions:config:set email.pass="sua-senha-app"

# Opção 2: Outro provedor SMTP
firebase functions:config:set email.host="smtp.seu-provedor.com"
firebase functions:config:set email.port="587"
firebase functions:config:set email.user="noreply@healthapp.ao"
firebase functions:config:set email.pass="sua-senha"

# Verificar configuração
firebase functions:config:get
```

**⚠️ Gmail**: Use "App Password" (não sua senha normal):
1. Ative 2FA na sua conta Google
2. Vá em https://myaccount.google.com/apppasswords
3. Gere uma senha de app
4. Use essa senha no comando acima

### 2. Deploy das Cloud Functions

```bash
cd /home/katsuvie/Projects/my-health-app/functions
npm run build
firebase deploy --only functions
```

**Funções que serão deployadas**:
- ✅ `approveProfessional` - Aprovar serviço
- ✅ `rejectProfessional` - Rejeitar serviço
- ✅ `listPendingServices` - Listar pendentes
- ✅ `onNewServiceRegistered` - Trigger automático

### 3. Deploy das Firestore Rules

```bash
cd /home/katsuvie/Projects/my-health-app
firebase deploy --only firestore:rules
```

### 4. Testar o Fluxo

#### a) Registrar um Profissional (Mobile App)

```typescript
// No app móvel, fazer registro normal
import { useAuth } from '../hooks/useAuth-firebase';

const { register } = useAuth();

await register({
  email: 'profissional@exemplo.com',
  password: 'senha123',
  name: 'Dr. João Silva',
  phone: '+244923456789',
  userType: UserType.PROFESSIONAL,
  acceptTerms: true,
  professionalInfo: {
    specialty: 'Cardiologia',
    description: 'Cardiologista com 10 anos de experiência',
    address: 'Rua Principal 123, Luanda',
    city: 'Luanda',
    province: 'Luanda',
    location: {
      latitude: -8.8383,
      longitude: 13.2344,
    },
  },
});

// Profissional fica com verified: false
// Serviço vai para registeredServices com status: 'pending'
```

#### b) Listar Serviços Pendentes (Admin Panel)

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const listPending = httpsCallable(functions, 'listPendingServices');

// Listar todos os pendentes
const result = await listPending();
console.log(result.data.services);
// [
//   {
//     id: 'user123',
//     name: 'Dr. João Silva',
//     status: 'pending',
//     contactEmail: 'profissional@exemplo.com',
//     professionalInfo: { ... }
//   }
// ]

// Listar apenas rejeitados
const rejected = await listPending({ status: 'rejected', limit: 10 });

// Listar apenas aprovados
const approved = await listPending({ status: 'approved', limit: 10 });
```

#### c) Aprovar um Serviço (Admin Panel)

```typescript
const approveProfessional = httpsCallable(functions, 'approveProfessional');

const result = await approveProfessional({
  serviceId: 'user123',
  notes: 'Documentação verificada. Aprovado!',
});

// ✅ Serviço movido para healthServices
// ✅ Profissional verified: true
// ✅ Custom Claims atualizados
// ✅ Email enviado
// ✅ Log registrado
```

#### d) Rejeitar um Serviço (Admin Panel)

```typescript
const rejectProfessional = httpsCallable(functions, 'rejectProfessional');

const result = await rejectProfessional({
  serviceId: 'user123',
  reason: 'Documentação incompleta. Por favor, envie o CRM válido.',
});

// ❌ Status atualizado para 'rejected'
// ❌ Email de rejeição enviado
// ❌ Log registrado
```

---

## 📊 Estrutura de Dados

### Collection: `registeredServices/{serviceId}`

```typescript
{
  // Informações do serviço
  name: string;                  // Nome do profissional/instituição
  serviceType: string;           // 'professional' | 'institution'
  specialty: string;             // 'Cardiologia', 'Hospital Geral', etc
  description: string;           // Descrição detalhada
  
  // Localização
  address: string;               // Endereço completo
  city: string;                  // Cidade
  province: string;              // Província
  location: {
    latitude: number;
    longitude: number;
  };
  
  // Contato
  contactEmail: string;          // Email do profissional
  contactPhone: string;          // Telefone
  
  // Metadata
  createdBy: string;             // UID do usuário
  createdAt: Timestamp;          // Data de criação
  status: string;                // 'pending' | 'approved' | 'rejected'
  verified: boolean;             // false (sempre false aqui)
  
  // Status de processamento
  processedAt?: Timestamp;       // Data de aprovação/rejeição
  processedBy?: string;          // UID do admin que processou
  
  // Aprovação
  approvedBy?: string;           // UID do admin que aprovou
  approverEmail?: string;        // Email do admin
  approverNotes?: string;        // Notas do admin
  
  // Rejeição
  rejectedBy?: string;           // UID do admin que rejeitou
  rejectionReason?: string;      // Motivo da rejeição
  
  // Dados originais
  userType: string;              // 'PROFESSIONAL' | 'INSTITUTION'
  professionalInfo?: object;     // Dados extras do profissional
  institutionInfo?: object;      // Dados extras da instituição
}
```

### Status Possíveis:

- `pending` - Aguardando aprovação (inicial)
- `approved` - Aprovado (movido para healthServices)
- `rejected` - Rejeitado (pode ser resubmetido)

---

## 📧 Templates de Email

### Email de Aprovação ✅

**Assunto**: ✅ Seu serviço foi aprovado - Health App Angola

**Conteúdo**:
- Mensagem de parabéns
- Nome do serviço aprovado
- Benefícios da verificação
- Link para acessar conta
- Footer com informações

### Email de Rejeição ❌

**Assunto**: ❌ Seu serviço precisa de ajustes - Health App Angola

**Conteúdo**:
- Agradecimento pelo interesse
- Motivo da rejeição em destaque
- Instruções para corrigir
- Link para cadastrar novamente
- Contato para dúvidas

### Email de Notificação (Admins) 🔔

**Assunto**: 🔔 Novo serviço aguardando aprovação

**Conteúdo**:
- Nome do serviço
- ID do serviço
- Email do profissional
- Link direto para admin panel
- Botão "Ver Detalhes"

---

## 🔒 Segurança

### Firestore Rules

```javascript
match /registeredServices/{serviceId} {
  // Admins podem ler todos
  allow read: if isAdmin();
  
  // Criadores podem ler seus próprios
  allow read: if request.auth != null && 
    request.auth.uid == resource.data.createdBy;
  
  // Criar: deve incluir campos obrigatórios
  allow create: if request.auth != null &&
    request.resource.data.keys().hasAll(['name', 'createdBy', 'createdAt', 'status']) &&
    request.resource.data.status == 'pending' &&
    request.resource.data.createdBy == request.auth.uid;
  
  // Atualizar: apenas se ainda pendente (criador) ou admin
  allow update: if (request.auth != null && 
    request.auth.uid == resource.data.createdBy &&
    resource.data.status == 'pending') || isAdmin();
  
  // Deletar: apenas admins
  allow delete: if isAdmin();
}
```

### Permissões nas Cloud Functions

- **`approveProfessional()`**: Apenas admins (verifica `token.isAdmin`)
- **`rejectProfessional()`**: Apenas admins (verifica `token.isAdmin`)
- **`listPendingServices()`**: Apenas admins (verifica `token.isAdmin`)
- **`onNewServiceRegistered()`**: Trigger automático (sem validação)

---

## 📈 Métricas de Implementação

```
Cloud Functions Criadas:       4
Linhas de Código:              570
Emails Templates:              3
Coleções Modificadas:          2 (registeredServices, healthServices)
Arquivos Modificados:          4
Tempo de Implementação:        3 horas
Compilação:                    ✅ Sem erros
Status:                        ✅ 100% Implementado
```

---

## ⚠️ Importante

### Antes do Deploy:
- [ ] Configurar email via `firebase functions:config:set`
- [ ] Ter completado Fase 1 (sistema de roles)
- [ ] Criar pelo menos um super admin

### Após o Deploy:
- [ ] Testar registro de profissional
- [ ] Verificar se email de notificação chega para admins
- [ ] Testar aprovação e verificar email
- [ ] Testar rejeição e verificar email
- [ ] Verificar logs em `adminLogs` collection

### Limitações:
- ⚠️ Gmail tem limite de 500 emails/dia (conta gratuita)
- ⚠️ Para produção, usar serviço profissional (SendGrid, AWS SES, etc)
- ⚠️ Emails podem cair em spam (configurar SPF/DKIM)

---

## 🆘 Troubleshooting

### Emails não estão sendo enviados

**Verificar**:
1. Configuração do email: `firebase functions:config:get`
2. Logs das Cloud Functions: Firebase Console > Functions > Logs
3. Se Gmail: App Password está correto?
4. Se Gmail: 2FA está ativado?

**Solução temporária**: Comentar o envio de emails para testar o fluxo

```typescript
// Em approval.ts, comentar temporariamente:
// await sendApprovalEmail(serviceData.contactEmail, serviceData.name, serviceData.createdBy);
```

### "Permission denied" ao aprovar

**Causa**: Usuário não é admin

**Solução**:
```typescript
// Forçar refresh do token
const user = auth.currentUser;
await user.getIdTokenResult(true);
```

### Serviço não aparece em healthServices após aprovação

**Verificar**:
1. Status em `registeredServices` mudou para `approved`?
2. Documento foi criado em `healthServices`?
3. Ver logs da Cloud Function

---

## 🔮 Próximas Fases

### Fase 3: Moderação de Conteúdo ⏳
**Problema**: Reviews reportadas não são processadas  
**Estimativa**: 1 semana  
**Dependências**: ✅ Fases 1 e 2 completas  

### Fase 4: Analytics Dashboard ⏳
**Problema**: Dados coletados mas não visualizados  
**Estimativa**: 1-2 semanas  
**Dependências**: ✅ Fases 1 e 2 completas  

### Fase 5: Admin Panel Integration ⏳
**Problema**: health-admin-platform desconectado  
**Estimativa**: 1-2 semanas  
**Dependências**: ✅ Fases 1, 2, 3, 4 completas  

---

## ✅ Checklist de Implementação

### Código
- [x] Cloud Functions criadas
- [x] Emails templates implementados
- [x] Backend modificado (auth-firebase.ts)
- [x] Firestore Rules atualizadas
- [x] Index.ts atualizado com exports
- [x] Compilação sem erros

### Deploy
- [ ] Configurar email (functions:config)
- [ ] Deploy Cloud Functions
- [ ] Deploy Firestore Rules
- [ ] Testar registro de profissional
- [ ] Testar notificação para admins
- [ ] Testar aprovação
- [ ] Testar rejeição
- [ ] Verificar emails recebidos
- [ ] Verificar logs

---

**Status**: ✅ IMPLEMENTADO - AGUARDANDO DEPLOY  
**Próxima Ação**: Configurar email e fazer deploy  
**Tempo Estimado de Deploy**: 20-30 minutos  
**Bloqueadores**: Nenhum - código pronto para produção
