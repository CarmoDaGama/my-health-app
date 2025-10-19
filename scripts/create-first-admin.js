#!/usr/bin/env node

/**
 * Script para criar o primeiro Super Admin
 * Uso: node create-first-admin.js <email> [senha]
 * 
 * Exemplos:
 *   node create-first-admin.js admin@healthapp.ao MinhaSenha123!
 *   node create-first-admin.js admin@healthapp.ao
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Inicializar Firebase Admin
const serviceAccount = require('../service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
});

const db = admin.firestore();
const auth = admin.auth();

// Interface para ler input do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Perguntar ao usuário
 */
function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

/**
 * Criar o primeiro super admin
 */
async function createFirstSuperAdmin() {
  try {
    console.log('='.repeat(60));
    console.log('CRIAR PRIMEIRO SUPER ADMIN - Health App Angola');
    console.log('='.repeat(60));
    console.log('');

    // Obter email
    let email = process.argv[2];
    if (!email) {
      email = await question('Email do super admin: ');
    }

    if (!email || !email.includes('@')) {
      console.error('❌ Email inválido!');
      process.exit(1);
    }

    // Obter senha
    let password = process.argv[3];
    if (!password) {
      password = await question('Senha (mínimo 6 caracteres): ');
    }

    if (!password || password.length < 6) {
      console.error('❌ Senha deve ter no mínimo 6 caracteres!');
      process.exit(1);
    }

    console.log('');
    console.log('Criando super admin...');
    console.log(`Email: ${email}`);
    console.log('');

    // 1. Criar usuário no Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log('✓ Usuário já existe no Firebase Auth');
    } catch (error) {
      userRecord = await auth.createUser({
        email: email,
        password: password,
        emailVerified: true,
        displayName: 'Super Admin',
      });
      console.log('✓ Usuário criado no Firebase Auth');
    }

    const uid = userRecord.uid;

    // 2. Definir Custom Claims
    await auth.setCustomUserClaims(uid, {
      role: 'super_admin',
      isAdmin: true,
      assignedAt: Date.now(),
      assignedBy: 'system',
    });
    console.log('✓ Custom Claims definidos (super_admin)');

    // 3. Criar documento no Firestore (users collection)
    await db.collection('users').doc(uid).set({
      uid: uid,
      email: email,
      displayName: 'Super Admin',
      userType: 'ADMIN',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
    }, {merge: true});
    console.log('✓ Documento criado em users');

    // 4. Criar documento no Firestore (adminRoles collection)
    await db.collection('adminRoles').doc(uid).set({
      userId: uid,
      role: 'super_admin',
      isAdmin: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      assignedBy: 'system',
      assignedByEmail: 'system@healthapp.ao',
    });
    console.log('✓ Documento criado em adminRoles');

    // 5. Registrar log
    await db.collection('adminLogs').add({
      adminId: 'system',
      adminEmail: 'system@healthapp.ao',
      action: 'CREATE_FIRST_SUPER_ADMIN',
      details: {
        targetUserId: uid,
        targetEmail: email,
        role: 'super_admin',
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ip: null,
    });
    console.log('✓ Log registrado');

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ SUPER ADMIN CRIADO COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('');
    console.log(`UID: ${uid}`);
    console.log(`Email: ${email}`);
    console.log(`Role: super_admin`);
    console.log('');
    console.log('Este usuário agora pode:');
    console.log('  • Atribuir roles para outros admins');
    console.log('  • Aprovar/rejeitar profissionais');
    console.log('  • Moderar conteúdo');
    console.log('  • Acessar analytics');
    console.log('  • Gerenciar todo o sistema');
    console.log('');
    console.log('Login no Admin Panel: https://seu-admin-panel.web.app');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ ERRO:', error.message);
    console.error('');
    if (error.code) {
      console.error(`Código: ${error.code}`);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Executar
createFirstSuperAdmin();
