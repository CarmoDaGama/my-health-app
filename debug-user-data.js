// Script de debug para verificar dados do usuário no Firestore
// Execute com: node debug-user-data.js

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

// Configuração Firebase (você deve ter isso no seu firebase config)
const firebaseConfig = {
  // Adicione sua configuração Firebase aqui
  // Você pode encontrar no arquivo services/firebase.ts
};

// Para testar este script, você precisará:
// 1. Instalar firebase: npm install firebase
// 2. Adicionar sua configuração Firebase acima
// 3. Substituir 'USER_ID_AQUI' pelo ID real de um usuário para testar

const userId = 'USER_ID_AQUI'; // Substitua pelo ID real do usuário

async function debugUserData() {
  try {
    console.log('🔍 Iniciando debug dos dados do usuário...');
    console.log('👤 ID do usuário:', userId);
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('\n✅ Dados encontrados no Firestore:');
      console.log(JSON.stringify(userData, null, 2));
      
      console.log('\n📋 Análise dos campos:');
      console.log('- Nome:', userData.name || 'NÃO DEFINIDO');
      console.log('- Email:', userData.email || 'NÃO DEFINIDO');
      console.log('- Telefone:', userData.phone || 'NÃO DEFINIDO');
      console.log('- Tipo de usuário:', userData.userType || 'NÃO DEFINIDO');
      console.log('- Ativo:', userData.isActive);
      console.log('- Verificado:', userData.isVerified);
      
      if (userData.userType === 'normal_user') {
        console.log('\n👤 Campos específicos de usuário normal:');
        console.log('- Data nascimento:', userData.dateOfBirth || 'NÃO DEFINIDO');
        console.log('- Gênero:', userData.gender || 'NÃO DEFINIDO');
        console.log('- Endereço:', userData.address || 'NÃO DEFINIDO');
        console.log('- Contato emergência:', userData.emergencyContact ? 'DEFINIDO' : 'NÃO DEFINIDO');
        if (userData.emergencyContact) {
          console.log('  - Nome:', userData.emergencyContact.name);
          console.log('  - Telefone:', userData.emergencyContact.phone);
          console.log('  - Relacionamento:', userData.emergencyContact.relationship);
        }
      }
      
      if (userData.userType === 'professional') {
        console.log('\n👨‍⚕️ Campos específicos de profissional:');
        console.log('- Info profissional:', userData.professionalInfo ? 'DEFINIDO' : 'NÃO DEFINIDO');
        if (userData.professionalInfo) {
          console.log('  - Especialidade:', userData.professionalInfo.specialty);
          console.log('  - Licença:', userData.professionalInfo.license);
          console.log('  - Experiência:', userData.professionalInfo.experience);
          console.log('  - Bio:', userData.professionalInfo.bio);
        }
      }
      
      if (userData.userType === 'institution') {
        console.log('\n🏥 Campos específicos de instituição:');
        console.log('- Info instituição:', userData.institutionInfo ? 'DEFINIDO' : 'NÃO DEFINIDO');
        if (userData.institutionInfo) {
          console.log('  - Tipo:', userData.institutionInfo.type);
          console.log('  - Endereço:', userData.institutionInfo.address);
          console.log('  - Serviços:', userData.institutionInfo.services);
        }
      }
      
      console.log('\n🔧 Preferências:');
      console.log('- Definidas:', userData.preferences ? 'SIM' : 'NÃO');
      if (userData.preferences) {
        console.log('  - Idioma:', userData.preferences.language);
        console.log('  - Notificações:', userData.preferences.notifications ? 'DEFINIDAS' : 'NÃO DEFINIDAS');
      }
      
    } else {
      console.log('❌ Usuário não encontrado no Firestore!');
    }
    
  } catch (error) {
    console.error('🚨 Erro ao buscar dados do usuário:', error);
  }
}

console.log('🚀 Para executar este debug:');
console.log('1. npm install firebase (se ainda não instalou)');
console.log('2. Adicione sua configuração Firebase no topo do arquivo');
console.log('3. Substitua USER_ID_AQUI pelo ID real do usuário');
console.log('4. Execute: node debug-user-data.js');
console.log('\n⚠️  ATENÇÃO: Este arquivo é apenas para debug - remova após usar!');

// debugUserData();