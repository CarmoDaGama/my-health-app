/**
 * VERIFICAR DADOS E PERMISSÕES NO FIREBASE
 * Conecta ao projeto correto e verifica se há dados
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc } = require('firebase/firestore');

// Configuração Firebase CORRETA (mesma que no app)
const firebaseConfig = {
  apiKey: "AIzaSyCOxpoXvaG9wNRoMrSVf0o5Xdqvmm19NWY",
  authDomain: "health-app-angola.firebaseapp.com",
  projectId: "health-app-angola",
  storageBucket: "health-app-angola.firebasestorage.app",
  messagingSenderId: "435118303895",
  appId: "1:435118303895:web:8c42f4faaf46ec716117d2"
};

async function checkFirebaseData() {
  console.log('🔍 VERIFICANDO DADOS NO FIREBASE - PROJETO: health-app-angola');
  console.log('=' .repeat(70));
  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  try {
    // Verificar se há dados em healthServices
    console.log('\n📋 Verificando coleção healthServices...');
    const healthServicesRef = collection(db, 'healthServices');
    const healthServicesSnapshot = await getDocs(healthServicesRef);
    console.log(`✅ healthServices: ${healthServicesSnapshot.size} documentos encontrados`);
    
    if (healthServicesSnapshot.size > 0) {
      healthServicesSnapshot.forEach((doc, index) => {
        if (index < 3) { // Mostrar apenas os primeiros 3
          const data = doc.data();
          console.log(`  📄 ${data.name || 'Sem nome'} - ${data.type || 'Sem tipo'}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao acessar healthServices:', error.message);
  }
  
  try {
    // Verificar se há dados em registeredServices
    console.log('\n📋 Verificando coleção registeredServices...');
    const registeredServicesRef = collection(db, 'registeredServices');
    const registeredServicesSnapshot = await getDocs(registeredServicesRef);
    console.log(`✅ registeredServices: ${registeredServicesSnapshot.size} documentos encontrados`);
    
    if (registeredServicesSnapshot.size > 0) {
      registeredServicesSnapshot.forEach((doc, index) => {
        if (index < 3) { // Mostrar apenas os primeiros 3
          const data = doc.data();
          console.log(`  📄 ${data.name || 'Sem nome'} - Status: ${data.status || 'Sem status'}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao acessar registeredServices:', error.message);
  }
  
  // Se não há dados, vamos criar alguns dados de teste
  if (healthServicesSnapshot.size === 0 && registeredServicesSnapshot.size === 0) {
    console.log('\n⚠️ NENHUM DADO ENCONTRADO! Vamos criar dados de teste...');
    
    try {
      // Criar serviço de teste em healthServices
      const testService = {
        name: 'Hospital Central de Luanda - TESTE',
        type: 'hospital',
        address: 'Rua 17 de Setembro, Luanda',
        city: 'Luanda',
        state: 'Luanda',
        country: 'Angola',
        coordinates: {
          latitude: -8.8383,
          longitude: 13.2344
        },
        phone: '+244 222 000 000',
        description: 'Hospital público de referência em Luanda',
        rating: 4.2,
        reviews: 150,
        services: ['Emergency', 'Surgery', 'Cardiology'],
        status: 'active',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const healthServicesRef = collection(db, 'healthServices');
      const docRef = await addDoc(healthServicesRef, testService);
      console.log('✅ Serviço de teste criado em healthServices:', docRef.id);
      
      // Criar serviço aprovado de teste em registeredServices
      const testRegisteredService = {
        name: 'Clínica Sagrada Família - TESTE',
        type: 'clinic',
        serviceType: 'clinic',
        address: 'Rua Rainha Ginga, Luanda',
        city: 'Luanda',
        state: 'Luanda',
        country: 'Angola',
        coordinates: {
          latitude: -8.8200,
          longitude: 13.2400
        },
        phone: '+244 222 111 111',
        description: 'Clínica privada especializada em medicina geral',
        rating: 4.5,
        reviews: 89,
        services: ['General Medicine', 'Pediatrics'],
        status: 'approved',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const registeredServicesRef = collection(db, 'registeredServices');
      const docRef2 = await addDoc(registeredServicesRef, testRegisteredService);
      console.log('✅ Serviço de teste criado em registeredServices:', docRef2.id);
      
      console.log('\n🎉 Dados de teste criados com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao criar dados de teste:', error.message);
    }
  }
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('1. Execute o app React Native para testar');
  console.log('2. Verifique se os serviços aparecem no mapa');
  console.log('3. Se ainda houver erro de permissão, as regras Firestore precisam ser atualizadas');
}

checkFirebaseData().catch(console.error);