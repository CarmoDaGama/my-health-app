#!/usr/bin/env node

/**
 * Script para definir Super Admin
 * 
 * Este script define Custom Claims para o primeiro Super Admin do sistema.
 * É necessário porque Custom Claims só podem ser definidos via Firebase Admin SDK.
 * 
 * USO:
 *   1. Baixe sua Service Account Key do Firebase Console:
 *      - Firebase Console > Project Settings > Service Accounts
 *      - Clique em "Generate New Private Key"
 *      - Salve como: scripts/serviceAccountKey.json
 * 
 *   2. Instale dependências:
 *      npm install firebase-admin
 * 
 *   3. Execute o script:
 *      node scripts/set-super-admin.js seu-email@exemplo.com
 * 
 * IMPORTANTE: Mantenha serviceAccountKey.json FORA do controle de versão!
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Verificar se serviceAccountKey.json existe
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Erro: serviceAccountKey.json não encontrado!');
  console.error('');
  console.error('Por favor:');
  console.error('1. Acesse: Firebase Console > Project Settings > Service Accounts');
  console.error('2. Clique em "Generate New Private Key"');
  console.error('3. Salve o arquivo como: scripts/serviceAccountKey.json');
  console.error('');
  process.exit(1);
}

// Inicializar Firebase Admin
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin inicializado');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
  process.exit(1);
}

/**
 * Define um usuário como Super Admin
 */
async function setSuperAdmin(email) {
  try {
    console.log(`\n🔍 Buscando usuário: ${email}...`);
    
    // Buscar usuário por email
    const user = await admin.auth().getUserByEmail(email);
    console.log(`✅ Usuário encontrado: ${user.uid}`);
    
    // Definir Custom Claims
    console.log(`\n⚙️  Definindo Custom Claims...`);
    await admin.auth().setCustomUserClaims(user.uid, {
      isAdmin: true,
      role: 'super_admin'
    });
    console.log('✅ Custom Claims definidos com sucesso!');
    
    // Criar documento na collection adminRoles
    console.log(`\n📝 Criando documento em adminRoles...`);
    const db = admin.firestore();
    await db.collection('adminRoles').doc(user.uid).set({
      userId: user.uid,
      role: 'super_admin',
      isAdmin: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      assignedBy: 'system',
      assignedByEmail: 'system',
    });
    console.log('✅ Documento criado com sucesso!');
    
    // Registrar log
    console.log(`\n📋 Registrando log...`);
    await db.collection('adminLogs').add({
      adminId: 'system',
      adminEmail: 'system',
      action: 'SET_SUPER_ADMIN',
      details: {
        userId: user.uid,
        email: email,
        role: 'super_admin',
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Log registrado!');
    
    console.log('\n' + '='.repeat(50));
    console.log('✨ SUCESSO! ✨');
    console.log('='.repeat(50));
    console.log(`\n👤 Usuário: ${email}`);
    console.log(`🆔 UID: ${user.uid}`);
    console.log(`👑 Role: Super Admin`);
    console.log('');
    console.log('📱 Próximos passos:');
    console.log('1. Faça logout no app');
    console.log('2. Faça login novamente');
    console.log('3. Você verá o botão "Painel Admin"');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.error('\n💡 Dica: O usuário precisa estar registrado no Firebase Auth primeiro.');
      console.error('   Faça o registro pelo app antes de executar este script.');
    }
    
    throw error;
  }
}

/**
 * Listar todos os admins atuais
 */
async function listAdmins() {
  try {
    console.log('\n📋 Listando admins atuais...\n');
    
    const db = admin.firestore();
    const snapshot = await db.collection('adminRoles').get();
    
    if (snapshot.empty) {
      console.log('ℹ️  Nenhum admin encontrado.');
      return;
    }
    
    console.log(`Encontrados ${snapshot.size} admin(s):\n`);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`👤 ${data.userId}`);
      console.log(`   Role: ${data.role}`);
      console.log(`   Criado em: ${data.createdAt?.toDate?.() || 'N/A'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro ao listar admins:', error.message);
    throw error;
  }
}

/**
 * Remover admin
 */
async function removeAdmin(email) {
  try {
    console.log(`\n🔍 Buscando usuário: ${email}...`);
    
    const user = await admin.auth().getUserByEmail(email);
    console.log(`✅ Usuário encontrado: ${user.uid}`);
    
    // Remover Custom Claims
    console.log(`\n⚙️  Removendo Custom Claims...`);
    await admin.auth().setCustomUserClaims(user.uid, {
      isAdmin: false,
      role: null
    });
    console.log('✅ Custom Claims removidos!');
    
    // Deletar documento
    console.log(`\n🗑️  Deletando documento em adminRoles...`);
    const db = admin.firestore();
    await db.collection('adminRoles').doc(user.uid).delete();
    console.log('✅ Documento deletado!');
    
    console.log('\n✅ Admin removido com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    throw error;
  }
}

// ========================================
// MAIN
// ========================================

const command = process.argv[2];
const email = process.argv[3];

async function main() {
  try {
    if (!command) {
      console.log('\n📖 Uso do script:');
      console.log('');
      console.log('  Definir Super Admin:');
      console.log('    node scripts/set-super-admin.js set email@exemplo.com');
      console.log('');
      console.log('  Listar todos os admins:');
      console.log('    node scripts/set-super-admin.js list');
      console.log('');
      console.log('  Remover admin:');
      console.log('    node scripts/set-super-admin.js remove email@exemplo.com');
      console.log('');
      process.exit(0);
    }
    
    switch (command) {
      case 'set':
        if (!email) {
          console.error('❌ Email é obrigatório!');
          console.error('Uso: node scripts/set-super-admin.js set email@exemplo.com');
          process.exit(1);
        }
        await setSuperAdmin(email);
        break;
        
      case 'list':
        await listAdmins();
        break;
        
      case 'remove':
        if (!email) {
          console.error('❌ Email é obrigatório!');
          console.error('Uso: node scripts/set-super-admin.js remove email@exemplo.com');
          process.exit(1);
        }
        await removeAdmin(email);
        break;
        
      default:
        console.error(`❌ Comando desconhecido: ${command}`);
        console.error('Comandos disponíveis: set, list, remove');
        process.exit(1);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  }
}

main();
