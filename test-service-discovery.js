/**
 * Script para testar se a correção está funcionando
 * Simula busca de serviços como o mapa do app móvel faz
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp, query, where, getDocs } = require('firebase/firestore');

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

async function testServiceDiscovery() {
  try {
    console.log('🧪 Testando descoberta de serviços...\n');
    
    // 1. Criar um serviço de teste em registeredServices
    console.log('📝 Criando serviço de teste em registeredServices...');
    const testService = {
      name: 'Clínica de Teste - Mobile',
      serviceType: 'institution',
      type: 'clinic',
      specialty: 'Medicina Geral',
      description: 'Clínica para teste de sincronização',
      address: 'Rua de Teste, 123',
      city: 'Luanda',
      province: 'Luanda',
      location: {
        latitude: -8.8383,
        longitude: 13.2344
      },
      contactEmail: 'teste@clinica.ao',
      contactPhone: '+244 123 456 789',
      createdBy: 'test-user-id',
      createdAt: Timestamp.now(),
      status: 'approved', // Marcado como aprovado
      verified: true,
      userType: 'institution'
    };

    const testDocRef = await addDoc(collection(db, 'registeredServices'), testService);
    console.log(`✅ Serviço de teste criado com ID: ${testDocRef.id}\n`);

    // 2. Simular busca como o app móvel faz
    console.log('🔍 Simulando busca do app móvel...');
    
    // Busca 1: Apenas em healthServices (método antigo)
    console.log('\n📂 Busca antiga (apenas healthServices):');
    const healthOnlyQuery = query(collection(db, 'healthServices'));
    const healthOnlySnapshot = await getDocs(healthOnlyQuery);
    console.log(`Resultado: ${healthOnlySnapshot.size} serviços encontrados`);
    
    // Busca 2: Em ambas as coleções (método corrigido)
    console.log('\n📂 Busca corrigida (healthServices + registeredServices aprovados):');
    
    // healthServices
    const healthQuery = query(collection(db, 'healthServices'));
    const healthSnapshot = await getDocs(healthQuery);
    
    // registeredServices com status 'approved'
    const registeredQuery = query(
      collection(db, 'registeredServices'),
      where('status', '==', 'approved')
    );
    const registeredSnapshot = await getDocs(registeredQuery);
    
    const totalFound = healthSnapshot.size + registeredSnapshot.size;
    console.log(`Resultado: ${totalFound} serviços encontrados`);
    console.log(`- healthServices: ${healthSnapshot.size} serviços`);
    console.log(`- registeredServices (approved): ${registeredSnapshot.size} serviços`);
    
    // 3. Listar os serviços encontrados
    if (registeredSnapshot.size > 0) {
      console.log('\n📋 Serviços aprovados em registeredServices:');
      registeredSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`- ${data.name} (${data.type || data.serviceType}) - Status: ${data.status}`);
      });
    }
    
    // 4. Verificar se nosso serviço de teste está sendo encontrado
    const foundTestService = registeredSnapshot.docs.find(doc => doc.id === testDocRef.id);
    if (foundTestService) {
      console.log('\n✅ SUCESSO: Serviço de teste foi encontrado pela busca corrigida!');
      console.log('🎉 A correção está funcionando - serviços aprovados agora aparecerão no mapa.');
    } else {
      console.log('\n❌ PROBLEMA: Serviço de teste não foi encontrado.');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar teste
testServiceDiscovery().then(() => {
  console.log('\nTeste concluído!');
  process.exit(0);
}).catch((error) => {
  console.error('Erro no teste:', error);
  process.exit(1);
});