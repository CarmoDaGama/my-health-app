/**
 * TESTE DEFINITIVO DE PERMISSÕES FIREBASE
 * Script para verificar se o erro de permissões foi resolvido
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, limit, where } = require('firebase/firestore');

// Configuração Firebase (mesma que no app)
const firebaseConfig = {
  apiKey: "AIzaSyCOxpoXvaG9wNRoMrSVf0o5Xdqvmm19NWY",
  authDomain: "health-app-angola.firebaseapp.com",
  projectId: "health-app-angola",
  storageBucket: "health-app-angola.firebasestorage.app",
  messagingSenderId: "435118303895",
  appId: "1:435118303895:web:8c42f4faaf46ec716117d2"
};

// Inicializar Firebase SEM autenticação
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebasePermissions() {
  console.log('🧪 TESTE DEFINITIVO DE PERMISSÕES FIREBASE');
  console.log('=' .repeat(60));
  
  try {
    // Teste 1: Ler coleção healthServices (sem autenticação)
    console.log('\n📋 TESTE 1: Leitura de healthServices (sem autenticação)');
    
    const healthServicesQuery = query(
      collection(db, 'healthServices'),
      limit(5)
    );
    
    const healthServicesSnapshot = await getDocs(healthServicesQuery);
    console.log(`✅ SUCCESS: healthServices retornou ${healthServicesSnapshot.size} documentos`);
    
    healthServicesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  📄 ${data.name || 'Nome não encontrado'} (${data.type || 'Tipo não encontrado'})`);
    });
    
  } catch (error) {
    console.error('❌ ERRO no teste 1 (healthServices):', error.message);
  }
  
  try {
    // Teste 2: Ler coleção registeredServices (sem autenticação)
    console.log('\n📋 TESTE 2: Leitura de registeredServices (sem autenticação)');
    
    const registeredServicesQuery = query(
      collection(db, 'registeredServices'),
      limit(5)
    );
    
    const registeredServicesSnapshot = await getDocs(registeredServicesQuery);
    console.log(`✅ SUCCESS: registeredServices retornou ${registeredServicesSnapshot.size} documentos`);
    
    registeredServicesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  📄 ${data.name || 'Nome não encontrado'} (${data.status || 'Status não encontrado'})`);
    });
    
  } catch (error) {
    console.error('❌ ERRO no teste 2 (registeredServices):', error.message);
  }
  
  try {
    // Teste 3: Filtrar por serviços aprovados
    console.log('\n📋 TESTE 3: Filtrar registeredServices por status approved');
    
    const approvedServicesQuery = query(
      collection(db, 'registeredServices'),
      where('status', '==', 'approved'),
      limit(10)
    );
    
    const approvedServicesSnapshot = await getDocs(approvedServicesQuery);
    console.log(`✅ SUCCESS: Serviços aprovados encontrados: ${approvedServicesSnapshot.size}`);
    
    approvedServicesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  ✅ ${data.name || 'Nome não encontrado'} (${data.type || 'Tipo não encontrado'}) - Status: ${data.status}`);
    });
    
  } catch (error) {
    console.error('❌ ERRO no teste 3 (filtro approved):', error.message);
  }
  
  // Teste 4: Simular busca do app
  console.log('\n📋 TESTE 4: Simular getAllServices() do app');
  
  try {
    const services = [];
    
    // Buscar healthServices
    const healthQuery = query(collection(db, 'healthServices'), limit(20));
    const healthSnapshot = await getDocs(healthQuery);
    
    healthSnapshot.forEach(doc => {
      services.push({ id: doc.id, ...doc.data() });
    });
    
    // Buscar registeredServices aprovados
    const registeredQuery = query(
      collection(db, 'registeredServices'), 
      where('status', '==', 'approved'),
      limit(20)
    );
    const registeredSnapshot = await getDocs(registeredQuery);
    
    registeredSnapshot.forEach(doc => {
      services.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`✅ SUCCESS: Total de serviços combinados: ${services.length}`);
    console.log(`  📊 healthServices: ${healthSnapshot.size}`);
    console.log(`  📊 registeredServices (approved): ${registeredSnapshot.size}`);
    
    // Mostrar alguns exemplos
    services.slice(0, 5).forEach(service => {
      console.log(`  🏥 ${service.name} (${service.type || service.serviceType}) - Coordinates: ${service.coordinates ? 'OK' : 'MISSING'}`);
    });
    
  } catch (error) {
    console.error('❌ ERRO no teste 4 (combinado):', error.message);
  }
  
  console.log('\n🎯 RESULTADO FINAL:');
  console.log('=' .repeat(60));
  console.log('Se todos os testes mostraram "✅ SUCCESS", as permissões estão funcionando!');
  console.log('Se algum mostrou "❌ ERRO", ainda há problemas de permissão.');
  console.log('=' .repeat(60));
}

// Executar teste
testFirebasePermissions().catch(console.error);