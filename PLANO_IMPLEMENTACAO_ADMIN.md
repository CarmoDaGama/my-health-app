# 🚀 PLANO DE IMPLEMENTAÇÃO - Sistema Administrativo

**Baseado em:** ANALISE_FLUXO_ADMINISTRATIVO.md  
**Data:** 19 de Outubro de 2025  
**Prioridade:** CRÍTICA

---

## 📋 ÍNDICE

1. [Setup Inicial](#1-setup-inicial)
2. [Fase 1: Cloud Functions e Roles](#fase-1-cloud-functions-e-roles)
3. [Fase 2: Fluxo de Aprovação](#fase-2-fluxo-de-aprovação)
4. [Fase 3: Sistema de Moderação](#fase-3-sistema-de-moderação)
5. [Fase 4: Dashboard Analytics](#fase-4-dashboard-analytics)
6. [Fase 5: Integração Admin Panel](#fase-5-integração-admin-panel)

---

## 1. SETUP INICIAL

### Passo 1: Inicializar Cloud Functions

```bash
cd ~/Projects/my-health-app

# Inicializar Functions
firebase init functions

# Escolher opções:
# - TypeScript
# - TSLint: Sim
# - Install dependencies: Sim
```

### Passo 2: Instalar Dependências

```bash
cd functions

# Dependências principais
npm install firebase-admin firebase-functions

# Dependências para email
npm install nodemailer @types/nodemailer

# Dependências para moderação
npm install bad-words

# Dependências para analytics
npm install moment
```

### Passo 3: Configurar Variáveis de Ambiente

```bash
# Email config
firebase functions:config:set email.user="noreply@healthapp.ao"
firebase functions:config:set email.pass="sua_senha_aqui"

# App config
firebase functions:config:set app.name="Health App Angola"
firebase functions:config:set app.url="https://healthapp.ao"
```

---

## FASE 1: CLOUD FUNCTIONS E ROLES

### Arquivo: `functions/src/index.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

// ============================================
// GERENCIAMENTO DE ROLES
// ============================================

/**
 * Define role de admin para um usuário
 * Apenas super admins podem executar
 */
export const setAdminRole = functions.https.onCall(async (data, context) => {
  // Verificar autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Usuário não autenticado'
    );
  }

  // Verificar se é super admin
  const callerToken = context.auth.token;
  if (callerToken.role !== 'super_admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Apenas super admins podem atribuir roles'
    );
  }

  const { userId, role } = data;

  // Validar role
  const validRoles = ['admin', 'moderator', 'super_admin'];
  if (!validRoles.includes(role)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Role inválido. Use: admin, moderator ou super_admin'
    );
  }

  try {
    // Definir custom claim
    await auth.setCustomUserClaims(userId, {
      admin: true,
      role: role,
      assignedBy: context.auth.uid,
      assignedAt: new Date().toISOString(),
    });

    // Registrar no Firestore para histórico
    await db.collection('adminRoles').add({
      userId: userId,
      role: role,
      assignedBy: context.auth.uid,
      assignedByEmail: context.auth.token.email,
      assignedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log da ação
    await logAdminAction(
      context.auth.uid,
      'set_admin_role',
      userId,
      { role, previousRole: null }
    );

    return {
      success: true,
      message: `Role ${role} atribuído com sucesso ao usuário ${userId}`,
    };
  } catch (error: any) {
    console.error('Erro ao definir role:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Erro ao definir role: ' + error.message
    );
  }
});

/**
 * Remove role de admin de um usuário
 */
export const removeAdminRole = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.role !== 'super_admin') {
    throw new functions.https.HttpsError('permission-denied', 'Sem permissão');
  }

  const { userId } = data;

  try {
    // Buscar role atual
    const userRecord = await auth.getUser(userId);
    const previousRole = userRecord.customClaims?.role;

    // Remover custom claims
    await auth.setCustomUserClaims(userId, null);

    // Log da ação
    await logAdminAction(
      context.auth.uid,
      'remove_admin_role',
      userId,
      { previousRole }
    );

    return { success: true, message: 'Role removido com sucesso' };
  } catch (error: any) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Lista todos os admins
 */
export const listAdmins = functions.https.onCall(async (data, context) => {
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Sem permissão');
  }

  try {
    const adminsSnapshot = await db.collection('adminRoles').get();
    const admins: any[] = [];

    for (const doc of adminsSnapshot.docs) {
      const adminData = doc.data();
      const userRecord = await auth.getUser(adminData.userId);

      admins.push({
        id: doc.id,
        userId: adminData.userId,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: adminData.role,
        assignedBy: adminData.assignedByEmail,
        assignedAt: adminData.assignedAt,
      });
    }

    return { admins };
  } catch (error: any) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

async function logAdminAction(
  adminId: string,
  action: string,
  targetId: string,
  details: any
) {
  try {
    const adminRecord = await auth.getUser(adminId);

    await db.collection('adminLogs').add({
      adminId: adminId,
      adminEmail: adminRecord.email,
      action: action,
      targetId: targetId,
      details: details,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
}
```

### Arquivo: `functions/src/utils/validators.ts`

```typescript
import * as admin from 'firebase-admin';

export class Validators {
  
  /**
   * Verifica se usuário é admin
   */
  static async isAdmin(uid: string): Promise<boolean> {
    try {
      const userRecord = await admin.auth().getUser(uid);
      return userRecord.customClaims?.admin === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica se usuário tem role específico
   */
  static async hasRole(uid: string, role: string): Promise<boolean> {
    try {
      const userRecord = await admin.auth().getUser(uid);
      return userRecord.customClaims?.role === role;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica se é super admin
   */
  static async isSuperAdmin(uid: string): Promise<boolean> {
    return this.hasRole(uid, 'super_admin');
  }

  /**
   * Valida email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida telefone angolano
   */
  static isValidAngolanPhone(phone: string): boolean {
    const phoneRegex = /^\+244\s?9[0-9]{2}\s?[0-9]{3}\s?[0-9]{3}$/;
    return phoneRegex.test(phone);
  }
}
```

### Atualizar Firestore Rules: `firestore.rules`

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // FUNÇÕES AUXILIARES
    // ============================================
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && request.auth.token.admin == true;
    }
    
    function isSuperAdmin() {
      return isAuthenticated() && request.auth.token.role == 'super_admin';
    }
    
    function isModerator() {
      return isAuthenticated() && (
        request.auth.token.role == 'moderator' ||
        request.auth.token.role == 'admin' ||
        request.auth.token.role == 'super_admin'
      );
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // ============================================
    // USERS COLLECTION
    // ============================================
    
    match /users/{userId} {
      // Usuários podem ler seus próprios dados
      allow read: if isOwner(userId);
      
      // Admins podem ler todos os usuários
      allow read: if isAdmin();
      
      // Usuários podem atualizar seus próprios dados
      allow update: if isOwner(userId) && 
        !request.resource.data.diff(resource.data).affectedKeys()
          .hasAny(['userType', 'createdAt', 'admin', 'role']);
      
      // Criação durante registro
      allow create: if isAuthenticated();
    }
    
    // ============================================
    // HEALTH SERVICES COLLECTION
    // ============================================
    
    match /healthServices/{serviceId} {
      // Leitura pública de serviços verificados
      allow read: if true;
      
      // Apenas admins podem criar serviços verificados
      allow create: if isAdmin() || 
        (isAuthenticated() && request.resource.data.verified == false);
      
      // Apenas criador ou admin pode atualizar
      allow update: if isAdmin() || 
        (isAuthenticated() && 
         request.auth.uid == resource.data.createdBy &&
         !request.resource.data.diff(resource.data).affectedKeys()
           .hasAny(['verified', 'createdBy', 'createdAt']));
      
      // Apenas admin pode deletar
      allow delete: if isAdmin();
    }
    
    // ============================================
    // REGISTERED SERVICES (Pendentes de Aprovação)
    // ============================================
    
    match /registeredServices/{serviceId} {
      // Apenas admins podem ler serviços pendentes
      allow read: if isAdmin();
      
      // Usuários autenticados podem submeter para aprovação
      allow create: if isAuthenticated() &&
        request.resource.data.status == 'pending' &&
        request.resource.data.createdBy == request.auth.uid;
      
      // Apenas admins podem atualizar (aprovar/rejeitar)
      allow update: if isAdmin();
      
      // Apenas admins podem deletar
      allow delete: if isAdmin();
    }
    
    // ============================================
    // REVIEWS COLLECTION
    // ============================================
    
    match /reviews/{reviewId} {
      // Leitura pública
      allow read: if true;
      
      // Usuários autenticados podem criar
      allow create: if isAuthenticated() &&
        request.resource.data.userId == request.auth.uid &&
        request.resource.data.verified == false &&
        request.resource.data.reported == false;
      
      // Apenas autor ou moderador pode atualizar
      allow update: if isOwner(resource.data.userId) || isModerator();
      
      // Apenas autor ou admin pode deletar
      allow delete: if isOwner(resource.data.userId) || isAdmin();
    }
    
    // ============================================
    // FAVORITES COLLECTION
    // ============================================
    
    match /favorites/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // ============================================
    // ADMIN LOGS (Somente Leitura para Admins)
    // ============================================
    
    match /adminLogs/{logId} {
      allow read: if isSuperAdmin();
      allow write: if false; // Apenas via Cloud Functions
    }
    
    // ============================================
    // ADMIN ROLES (Somente Leitura para Admins)
    // ============================================
    
    match /adminRoles/{roleId} {
      allow read: if isAdmin();
      allow write: if false; // Apenas via Cloud Functions
    }
  }
}
```

### Script para Criar Primeiro Super Admin

Arquivo: `scripts/create-first-admin.js`

```javascript
const admin = require('firebase-admin');

// Inicializar Admin SDK
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function createFirstSuperAdmin() {
  // EMAIL DO PRIMEIRO SUPER ADMIN
  const email = 'admin@healthapp.ao'; // ALTERAR PARA SEU EMAIL
  const password = 'SuperAdmin123!'; // ALTERAR PARA SENHA SEGURA
  const name = 'Super Administrador';

  try {
    console.log('🔐 Criando primeiro super admin...');
    console.log(`📧 Email: ${email}`);

    // Criar usuário no Authentication
    let userRecord;
    try {
      userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: name,
        emailVerified: true,
      });
      console.log('✅ Usuário criado no Authentication');
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        console.log('⚠️  Email já existe, buscando usuário...');
        userRecord = await admin.auth().getUserByEmail(email);
      } else {
        throw error;
      }
    }

    // Definir custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: 'super_admin',
      assignedAt: new Date().toISOString(),
    });
    console.log('✅ Custom claims definidos');

    // Criar documento no Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      name: name,
      email: email,
      userType: 'admin',
      role: 'super_admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      preferences: {
        language: 'pt',
        notifications: {
          enabled: true,
          serviceReminders: false,
          healthTips: false,
          emergencyAlerts: true,
        },
        favorites: { services: [], locations: [] },
        privacy: { shareLocation: false, publicProfile: false }
      }
    });
    console.log('✅ Documento criado no Firestore');

    // Registrar no adminRoles
    await admin.firestore().collection('adminRoles').add({
      userId: userRecord.uid,
      role: 'super_admin',
      assignedBy: 'system',
      assignedByEmail: 'system@healthapp.ao',
      assignedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Registrado em adminRoles');

    console.log('\n🎉 SUPER ADMIN CRIADO COM SUCESSO!\n');
    console.log('📋 Credenciais:');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar super admin:', error);
    process.exit(1);
  }
}

createFirstSuperAdmin();
```

### Comandos para Executar

```bash
# 1. Criar primeiro admin (UMA VEZ APENAS)
cd ~/Projects/my-health-app
node scripts/create-first-admin.js

# 2. Deploy das functions
cd functions
npm run build
firebase deploy --only functions

# 3. Deploy das rules
firebase deploy --only firestore:rules

# 4. Testar
# Login com credenciais do super admin
# Usar o painel admin para criar outros admins
```

---

## FASE 2: FLUXO DE APROVAÇÃO

### Arquivo: `functions/src/approval.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendEmail } from './email';

const db = admin.firestore();

/**
 * Aprovar ou rejeitar um profissional/instituição
 */
export const approveProfessional = functions.https.onCall(async (data, context) => {
  // Verificar permissão
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Apenas administradores podem aprovar profissionais'
    );
  }

  const { serviceId, approved, reason } = data;

  if (!serviceId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'serviceId é obrigatório'
    );
  }

  try {
    // Buscar serviço pendente
    const serviceRef = db.doc(`registeredServices/${serviceId}`);
    const serviceDoc = await serviceRef.get();

    if (!serviceDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Serviço não encontrado'
      );
    }

    const serviceData = serviceDoc.data()!;

    // Buscar dados do usuário para email
    const userDoc = await db.doc(`users/${serviceData.createdBy}`).get();
    const userData = userDoc.data();

    if (approved) {
      // APROVAÇÃO
      console.log(`✅ Aprovando serviço: ${serviceData.name}`);

      // Mover para healthServices com verified: true
      await db.collection('healthServices').doc(serviceId).set({
        ...serviceData,
        verified: true,
        approvedBy: context.auth.uid,
        approvedByEmail: context.auth.token.email,
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active',
      });

      // Remover de registeredServices
      await serviceRef.delete();

      // Enviar email de aprovação
      if (userData?.email) {
        await sendEmail({
          to: userData.email,
          subject: 'Seu perfil foi aprovado! ✅',
          html: `
            <h1>Parabéns, ${userData.name}!</h1>
            <p>Seu perfil profissional foi verificado e aprovado pela nossa equipe.</p>
            <p><strong>Serviço:</strong> ${serviceData.name}</p>
            <p><strong>Tipo:</strong> ${serviceData.type}</p>
            <p>Agora você está visível no aplicativo para todos os usuários.</p>
            <p>Obrigado por fazer parte do Health App Angola!</p>
          `,
        });
      }

      return {
        success: true,
        message: `Profissional ${serviceData.name} aprovado com sucesso`,
      };

    } else {
      // REJEIÇÃO
      console.log(`❌ Rejeitando serviço: ${serviceData.name}`);

      // Atualizar status para rejeitado
      await serviceRef.update({
        status: 'rejected',
        rejectedBy: context.auth.uid,
        rejectedByEmail: context.auth.token.email,
        rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
        rejectionReason: reason || 'Não especificado',
      });

      // Enviar email de rejeição
      if (userData?.email) {
        await sendEmail({
          to: userData.email,
          subject: 'Atualização sobre seu cadastro',
          html: `
            <h1>Olá, ${userData.name}</h1>
            <p>Infelizmente, não pudemos aprovar seu cadastro no momento.</p>
            <p><strong>Serviço:</strong> ${serviceData.name}</p>
            <p><strong>Motivo:</strong> ${reason || 'Não especificado'}</p>
            <p>Entre em contato conosco para mais informações:</p>
            <p>Email: suporte@healthapp.ao</p>
          `,
        });
      }

      return {
        success: true,
        message: `Profissional ${serviceData.name} rejeitado`,
      };
    }
  } catch (error: any) {
    console.error('Erro ao processar aprovação:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Erro ao processar aprovação: ' + error.message
    );
  }
});

/**
 * Listar serviços pendentes de aprovação
 */
export const listPendingServices = functions.https.onCall(async (data, context) => {
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Sem permissão');
  }

  try {
    const { limit = 50, status = 'pending' } = data;

    const snapshot = await db
      .collection('registeredServices')
      .where('status', '==', status)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const services: any[] = [];

    for (const doc of snapshot.docs) {
      const serviceData = doc.data();

      // Buscar dados do criador
      const creatorDoc = await db.doc(`users/${serviceData.createdBy}`).get();
      const creatorData = creatorDoc.data();

      services.push({
        id: doc.id,
        ...serviceData,
        createdAt: serviceData.createdAt?.toDate()?.toISOString(),
        creator: {
          id: serviceData.createdBy,
          name: creatorData?.name,
          email: creatorData?.email,
          userType: creatorData?.userType,
        },
      });
    }

    return {
      services,
      total: services.length,
    };
  } catch (error: any) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Obter detalhes de um serviço pendente
 */
export const getPendingServiceDetails = functions.https.onCall(async (data, context) => {
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Sem permissão');
  }

  const { serviceId } = data;

  try {
    const serviceDoc = await db.doc(`registeredServices/${serviceId}`).get();

    if (!serviceDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Serviço não encontrado');
    }

    const serviceData = serviceDoc.data()!;

    // Buscar criador
    const creatorDoc = await db.doc(`users/${serviceData.createdBy}`).get();

    return {
      id: serviceDoc.id,
      ...serviceData,
      creator: creatorDoc.data(),
    };
  } catch (error: any) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

### Arquivo: `functions/src/email.ts`

```typescript
import * as functions from 'firebase-functions';
import * as nodemailer from 'nodemailer';

const config = functions.config();

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: config.email?.user || process.env.EMAIL_USER,
    pass: config.email?.pass || process.env.EMAIL_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: `Health App Angola <${config.email?.user}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`📧 Email enviado para: ${options.to}`);
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    throw error;
  }
}
```

### Modificar Registro no App

Arquivo: `services/auth-firebase.ts` - MODIFICAR método `addToHealthServices`

```typescript
// ANTES: Criava direto em healthServices
// DEPOIS: Cria em registeredServices

public static async addToHealthServices(user: any, data: RegisterData): Promise<void> {
  try {
    console.log('📝 Submetendo serviço para aprovação...');

    let newService: any = {
      name: user.name,
      userId: user.id,
      createdBy: user.id,
      status: 'pending',  // ✅ NOVO
      verified: false,
      submittedAt: serverTimestamp(),  // ✅ NOVO
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (data.userType === UserType.PROFESSIONAL) {
      newService = {
        ...newService,
        type: 'professional',
        address: data.professionalInfo?.address || '',
        city: data.professionalInfo?.city || '',
        state: data.professionalInfo?.state || '',
        coordinates: new GeoPoint(
          data.professionalInfo?.coordinates?.latitude || 0,
          data.professionalInfo?.coordinates?.longitude || 0
        ),
        phone: user.phone || '',
        description: data.professionalInfo?.description || '',
        rating: 0,
        reviews: 0,
        services: data.professionalInfo?.services || [],
        specialty: data.professionalInfo?.specialty,
        license: data.professionalInfo?.license,
        experience: data.professionalInfo?.experience || 0,
      };
    } else if (data.userType === UserType.INSTITUTION) {
      newService = {
        ...newService,
        type: data.institutionInfo?.type || 'clinic',
        address: data.institutionInfo?.address || '',
        city: data.institutionInfo?.city || '',
        state: data.institutionInfo?.state || '',
        coordinates: new GeoPoint(
          data.institutionInfo?.coordinates?.latitude || 0,
          data.institutionInfo?.coordinates?.longitude || 0
        ),
        phone: user.phone || '',
        description: data.institutionInfo?.description || '',
        rating: 0,
        reviews: 0,
        services: data.institutionInfo?.services || [],
      };
    }

    // ✅ NOVO: Enviar para registeredServices (aguardando aprovação)
    await addDoc(collection(db, 'registeredServices'), newService);
    
    console.log('✅ Serviço submetido para aprovação!');
    console.log('⏳ Aguardando análise da equipe administrativa.');

  } catch (error) {
    console.error('❌ Erro ao submeter serviço:', error);
    throw error;
  }
}
```

---

## FASE 3: SISTEMA DE MODERAÇÃO

### Arquivo: `functions/src/moderation.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as Filter from 'bad-words';

const db = admin.firestore();
const filter = new Filter();

// Adicionar palavras em português
filter.addWords('palavrão1', 'palavrão2'); // Adicionar conforme necessário

/**
 * Filtro automático ao criar review
 */
export const autoModerateReview = functions.firestore
  .document('reviews/{reviewId}')
  .onCreate(async (snap, context) => {
    const review = snap.data();
    const reviewId = context.params.reviewId;

    let shouldFlag = false;
    const flagReasons: string[] = [];

    // 1. Verificar palavrões
    if (filter.isProfane(review.comment)) {
      shouldFlag = true;
      flagReasons.push('Linguagem inapropriada detectada');
    }

    // 2. Verificar spam (muitas reviews do mesmo usuário)
    const oneHourAgo = new Date(Date.now() - 3600000);
    const userReviews = await db
      .collection('reviews')
      .where('userId', '==', review.userId)
      .where('createdAt', '>', oneHourAgo)
      .get();

    if (userReviews.size > 5) {
      shouldFlag = true;
      flagReasons.push('Possível spam - múltiplas reviews em curto período');
    }

    // 3. Verificar comentário muito curto ou suspeito
    if (review.comment.length < 10) {
      shouldFlag = true;
      flagReasons.push('Comentário muito curto');
    }

    // 4. Verificar apenas emojis ou caracteres especiais
    if (!/[a-zA-ZÀ-ÿ]{5,}/.test(review.comment)) {
      shouldFlag = true;
      flagReasons.push('Comentário sem texto significativo');
    }

    // Se deve ser sinalizado
    if (shouldFlag) {
      await snap.ref.update({
        reported: true,
        autoFlagged: true,
        flagReasons: flagReasons,
        flaggedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`🚩 Review ${reviewId} foi automaticamente sinalizada:`, flagReasons);
    }

    return null;
  });

/**
 * Moderar uma review (aprovar, editar ou deletar)
 */
export const moderateReview = functions.https.onCall(async (data, context) => {
  // Verificar permissão (moderador ou admin)
  if (!context.auth?.token.admin && context.auth?.token.role !== 'moderator') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Apenas moderadores podem executar esta ação'
    );
  }

  const { reviewId, action, newComment, reason } = data;

  if (!reviewId || !action) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'reviewId e action são obrigatórios'
    );
  }

  try {
    const reviewRef = db.doc(`reviews/${reviewId}`);
    const reviewDoc = await reviewRef.get();

    if (!reviewDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Review não encontrada');
    }

    const reviewData = reviewDoc.data()!;

    switch (action) {
      case 'approve':
        // Aprovar e marcar como verificada
        await reviewRef.update({
          verified: true,
          reported: false,
          autoFlagged: false,
          moderatedBy: context.auth.uid,
          moderatedByEmail: context.auth.token.email,
          moderatedAt: admin.firestore.FieldValue.serverTimestamp(),
          moderationAction: 'approved',
        });
        break;

      case 'edit':
        // Editar comentário
        if (!newComment) {
          throw new functions.https.HttpsError(
            'invalid-argument',
            'newComment é obrigatório para edição'
          );
        }

        await reviewRef.update({
          comment: newComment,
          edited: true,
          originalComment: reviewData.comment,
          moderatedBy: context.auth.uid,
          moderatedByEmail: context.auth.token.email,
          moderatedAt: admin.firestore.FieldValue.serverTimestamp(),
          moderationAction: 'edited',
          moderationReason: reason,
        });
        break;

      case 'delete':
        // Deletar review
        await reviewRef.delete();

        // Atualizar contador do serviço
        const serviceRef = db.doc(`healthServices/${reviewData.serviceId}`);
        await serviceRef.update({
          reviews: admin.firestore.FieldValue.increment(-1),
        });

        // Recalcular rating
        // (implementar função separada se necessário)
        break;

      case 'ignore':
        // Marcar como revisada mas manter
        await reviewRef.update({
          reported: false,
          autoFlagged: false,
          moderatedBy: context.auth.uid,
          moderatedByEmail: context.auth.token.email,
          moderatedAt: admin.firestore.FieldValue.serverTimestamp(),
          moderationAction: 'ignored',
          moderationReason: reason,
        });
        break;

      default:
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Ação inválida. Use: approve, edit, delete ou ignore'
        );
    }

    // Log da ação de moderação
    await db.collection('moderationLogs').add({
      reviewId: reviewId,
      action: action,
      moderatorId: context.auth.uid,
      moderatorEmail: context.auth.token.email,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      reason: reason,
      details: {
        originalComment: reviewData.comment,
        newComment: newComment,
      },
    });

    return { success: true, message: `Review ${action} com sucesso` };
  } catch (error: any) {
    console.error('Erro na moderação:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Listar reviews pendentes de moderação
 */
export const listReportedReviews = functions.https.onCall(async (data, context) => {
  if (!context.auth?.token.admin && context.auth?.token.role !== 'moderator') {
    throw new functions.https.HttpsError('permission-denied', 'Sem permissão');
  }

  try {
    const { limit = 50 } = data;

    const snapshot = await db
      .collection('reviews')
      .where('reported', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const reviews: any[] = [];

    for (const doc of snapshot.docs) {
      const reviewData = doc.data();

      // Buscar serviço relacionado
      const serviceDoc = await db.doc(`healthServices/${reviewData.serviceId}`).get();
      const serviceData = serviceDoc.data();

      reviews.push({
        id: doc.id,
        ...reviewData,
        service: {
          id: reviewData.serviceId,
          name: serviceData?.name,
        },
      });
    }

    return {
      reviews,
      total: reviews.length,
    };
  } catch (error: any) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

---

## FASE 4: DASHBOARD ANALYTICS

### Arquivo: `functions/src/analytics.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as moment from 'moment';

const db = admin.firestore();

/**
 * Obter estatísticas gerais do sistema
 */
export const getSystemAnalytics = functions.https.onCall(async (data, context) => {
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Sem permissão');
  }

  try {
    const { period = '30days' } = data;

    // Calcular datas
    let startDate: Date;
    switch (period) {
      case '7days':
        startDate = moment().subtract(7, 'days').toDate();
        break;
      case '30days':
        startDate = moment().subtract(30, 'days').toDate();
        break;
      case '90days':
        startDate = moment().subtract(90, 'days').toDate();
        break;
      case '1year':
        startDate = moment().subtract(1, 'year').toDate();
        break;
      default:
        startDate = moment().subtract(30, 'days').toDate();
    }

    // ============================================
    // ESTATÍSTICAS DE USUÁRIOS
    // ============================================
    
    const usersSnapshot = await db.collection('users').get();
    const newUsersSnapshot = await db
      .collection('users')
      .where('createdAt', '>=', startDate)
      .get();

    const userStats = {
      total: usersSnapshot.size,
      new: newUsersSnapshot.size,
      byType: {
        normal: 0,
        professional: 0,
        institution: 0,
      },
    };

    usersSnapshot.docs.forEach(doc => {
      const type = doc.data().userType;
      if (type in userStats.byType) {
        userStats.byType[type as keyof typeof userStats.byType]++;
      }
    });

    // ============================================
    // ESTATÍSTICAS DE SERVIÇOS
    // ============================================
    
    const servicesSnapshot = await db.collection('healthServices').get();
    const serviceStats = {
      total: servicesSnapshot.size,
      verified: 0,
      unverified: 0,
      byType: {} as Record<string, number>,
      byCity: {} as Record<string, number>,
      averageRating: 0,
      totalReviews: 0,
    };

    let totalRating = 0;
    let countWithRating = 0;

    servicesSnapshot.docs.forEach(doc => {
      const data = doc.data();

      if (data.verified) serviceStats.verified++;
      else serviceStats.unverified++;

      const type = data.type || 'outros';
      serviceStats.byType[type] = (serviceStats.byType[type] || 0) + 1;

      const city = data.city || 'Não especificado';
      serviceStats.byCity[city] = (serviceStats.byCity[city] || 0) + 1;

      if (data.rating > 0) {
        totalRating += data.rating;
        countWithRating++;
      }

      serviceStats.totalReviews += data.reviews || 0;
    });

    serviceStats.averageRating = countWithRating > 0 
      ? Number((totalRating / countWithRating).toFixed(1))
      : 0;

    // ============================================
    // ESTATÍSTICAS DE REVIEWS
    // ============================================
    
    const reviewsSnapshot = await db.collection('reviews').get();
    const newReviewsSnapshot = await db
      .collection('reviews')
      .where('createdAt', '>=', startDate)
      .get();

    const reviewStats = {
      total: reviewsSnapshot.size,
      new: newReviewsSnapshot.size,
      verified: 0,
      reported: 0,
      byRating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };

    reviewsSnapshot.docs.forEach(doc => {
      const data = doc.data();

      if (data.verified) reviewStats.verified++;
      if (data.reported) reviewStats.reported++;

      const rating = data.rating;
      if (rating >= 1 && rating <= 5) {
        reviewStats.byRating[rating as keyof typeof reviewStats.byRating]++;
      }
    });

    // ============================================
    // ESTATÍSTICAS DE MODERAÇÃO
    // ============================================
    
    const pendingServicesSnapshot = await db
      .collection('registeredServices')
      .where('status', '==', 'pending')
      .get();

    const moderationStats = {
      pendingServices: pendingServicesSnapshot.size,
      reportedReviews: reviewStats.reported,
    };

    // ============================================
    // RETORNAR TUDO
    // ============================================

    return {
      period: period,
      generatedAt: new Date().toISOString(),
      users: userStats,
      services: serviceStats,
      reviews: reviewStats,
      moderation: moderationStats,
    };
  } catch (error: any) {
    console.error('Erro ao gerar analytics:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Obter histórico de crescimento (gráfico)
 */
export const getGrowthHistory = functions.https.onCall(async (data, context) => {
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Sem permissão');
  }

  try {
    const { metric = 'users', period = '30days' } = data;

    // Calcular intervalo
    let days: number;
    switch (period) {
      case '7days': days = 7; break;
      case '30days': days = 30; break;
      case '90days': days = 90; break;
      default: days = 30;
    }

    const dataPoints: any[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = moment().subtract(i, 'days').startOf('day').toDate();
      const nextDate = moment(date).add(1, 'day').toDate();

      let count = 0;

      if (metric === 'users') {
        const snapshot = await db
          .collection('users')
          .where('createdAt', '>=', date)
          .where('createdAt', '<', nextDate)
          .get();
        count = snapshot.size;
      } else if (metric === 'services') {
        const snapshot = await db
          .collection('healthServices')
          .where('createdAt', '>=', date)
          .where('createdAt', '<', nextDate)
          .get();
        count = snapshot.size;
      } else if (metric === 'reviews') {
        const snapshot = await db
          .collection('reviews')
          .where('createdAt', '>=', date)
          .where('createdAt', '<', nextDate)
          .get();
        count = snapshot.size;
      }

      dataPoints.push({
        date: moment(date).format('YYYY-MM-DD'),
        count: count,
      });
    }

    return {
      metric,
      period,
      data: dataPoints,
    };
  } catch (error: any) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Exportar relatório completo
 */
export const exportReport = functions.https.onCall(async (data, context) => {
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Sem permissão');
  }

  try {
    const { format = 'json' } = data;

    // Buscar todos os dados
    const [users, services, reviews] = await Promise.all([
      db.collection('users').get(),
      db.collection('healthServices').get(),
      db.collection('reviews').get(),
    ]);

    const report = {
      generatedAt: new Date().toISOString(),
      generatedBy: context.auth.token.email,
      summary: {
        totalUsers: users.size,
        totalServices: services.size,
        totalReviews: reviews.size,
      },
      users: users.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      services: services.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      reviews: reviews.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    };

    if (format === 'json') {
      return report;
    } else {
      // CSV ou outro formato
      throw new functions.https.HttpsError(
        'unimplemented',
        'Formato ainda não implementado'
      );
    }
  } catch (error: any) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

---

## DEPLOY COMPLETO

### Arquivo: `functions/src/index.ts` - COMPLETO

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Importar módulos
export * from './approval';
export * from './moderation';
export * from './analytics';

// Roles (já implementado acima)
export { setAdminRole, removeAdminRole, listAdmins } from './roles';
```

### Deploy Tudo

```bash
cd ~/Projects/my-health-app

# Build
cd functions
npm run build

# Deploy tudo
firebase deploy

# Ou deploy seletivo
firebase deploy --only functions
firebase deploy --only firestore:rules
```

---

## 📊 RESUMO DE ENDPOINTS CRIADOS

| Função | Permissão | Descrição |
|--------|-----------|-----------|
| `setAdminRole` | super_admin | Atribuir role de admin |
| `removeAdminRole` | super_admin | Remover role de admin |
| `listAdmins` | admin | Listar todos os admins |
| `approveProfessional` | admin | Aprovar/rejeitar profissional |
| `listPendingServices` | admin | Listar serviços pendentes |
| `getPendingServiceDetails` | admin | Detalhes de serviço pendente |
| `moderateReview` | moderator/admin | Moderar review |
| `listReportedReviews` | moderator/admin | Listar reviews denunciadas |
| `getSystemAnalytics` | admin | Estatísticas do sistema |
| `getGrowthHistory` | admin | Histórico de crescimento |
| `exportReport` | admin | Exportar relatório |

---

## ✅ PRÓXIMO PASSO: INTEGRAR PAINEL ADMIN

Ver documento separado: `INTEGRACAO_PAINEL_ADMIN.md`

---

**FIM DO PLANO DE IMPLEMENTAÇÃO**
