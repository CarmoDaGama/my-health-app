/**
 * Script para testar descoberta sem criar novos documentos
 * Apenas verifica se conseguimos ler das duas coleções
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCOxpoXvaG9wNRoMrSVf0o5Xdqvmm19NWY",
  authDomain: "health-app-angola.firebaseapp.com",
  projectId: "health-app-angola",
  storageBucket: "health-app-angola.firebasestorage.app",
  messagingSenderId: "435118303895",
  appId: "1:435118303895:web:8c42f4faaf46ec716117d2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testReadOnlyDiscovery() {
  try {
    console.log('🔍 Testando leitura das coleções (sem criar documentos)...\n');
    
    // 1. Tentar ler healthServices
    console.log('📂 Testando acesso a healthServices...');
    try {
      const healthQuery = query(collection(db, 'healthServices'));
      const healthSnapshot = await getDocs(healthQuery);
      console.log(`✅ healthServices: ${healthSnapshot.size} documentos`);
      
      if (healthSnapshot.size > 0) {
        console.log('📋 Exemplos de healthServices:');
        healthSnapshot.docs.slice(0, 3).forEach(doc => {
          const data = doc.data();
          console.log(`- ${data.name || 'Sem nome'} (${data.type || data.serviceType || 'Sem tipo'})`);
        });
      }
    } catch (error) {
      console.log(`❌ Erro ao acessar healthServices: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. Tentar ler registeredServices
    console.log('📂 Testando acesso a registeredServices...');
    try {
      const registeredQuery = query(collection(db, 'registeredServices'));
      const registeredSnapshot = await getDocs(registeredQuery);
      console.log(`✅ registeredServices (todos): ${registeredSnapshot.size} documentos`);
      
      // Contar por status
      const statusCounts = {};
      registeredSnapshot.docs.forEach(doc => {
        const status = doc.data().status || 'undefined';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      console.log('📊 Por status:', statusCounts);
      
      // Mostrar serviços aprovados especificamente
      const approvedServices = registeredSnapshot.docs.filter(doc => doc.data().status === 'approved');
      console.log(`📋 Serviços aprovados: ${approvedServices.length}`);
      
      if (approvedServices.length > 0) {
        console.log('📄 Exemplos de serviços aprovados:');
        approvedServices.slice(0, 3).forEach(doc => {
          const data = doc.data();
          console.log(`- ${data.name || 'Sem nome'} (${data.type || data.serviceType || 'Sem tipo'}) - Status: ${data.status}`);
        });
      }
      
    } catch (error) {
      console.log(`❌ Erro ao acessar registeredServices: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. Testar query específica de serviços aprovados
    console.log('🎯 Testando query específica para serviços aprovados...');
    try {
      const approvedQuery = query(
        collection(db, 'registeredServices'),
        where('status', '==', 'approved')
      );
      const approvedSnapshot = await getDocs(approvedQuery);
      console.log(`✅ registeredServices (approved): ${approvedSnapshot.size} documentos`);
      
      if (approvedSnapshot.size > 0) {
        console.log('🎉 ENCONTRAMOS SERVIÇOS APROVADOS!');
        console.log('✅ A correção no código deve funcionar para incluir estes serviços no mapa.');
        
        approvedSnapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log(`- ID: ${doc.id}`);
          console.log(`  Nome: ${data.name || 'N/A'}`);
          console.log(`  Tipo: ${data.type || data.serviceType || 'N/A'}`);
          console.log(`  Cidade: ${data.city || 'N/A'}`);
          console.log(`  Status: ${data.status}`);
          console.log(`  Verificado: ${data.verified !== undefined ? data.verified : 'N/A'}`);
          console.log('');
        });
      } else {
        console.log('⚠️ Nenhum serviço com status "approved" encontrado.');
        console.log('💡 Isso significa que:');
        console.log('   1. Os serviços ainda não foram aprovados no admin, ou');
        console.log('   2. Eles estão sendo aprovados mas o status não está sendo atualizado corretamente');
      }
      
    } catch (error) {
      console.log(`❌ Erro na query específica: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
testReadOnlyDiscovery().then(() => {
  console.log('\n🏁 Teste de leitura concluído!');
  console.log('💡 Se encontramos serviços aprovados, a correção deve resolver o problema.');
  console.log('📱 Teste no app móvel para verificar se os serviços agora aparecem no mapa.');
  process.exit(0);
}).catch((error) => {
  console.error('Erro no teste:', error);
  process.exit(1);
});