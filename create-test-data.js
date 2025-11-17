/**
 * CRIAR DADOS DE TESTE NO FIREBASE
 * Adiciona dados de saúde de exemplo para testar o app
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCOxpoXvaG9wNRoMrSVf0o5Xdqvmm19NWY",
  authDomain: "health-app-angola.firebaseapp.com",
  projectId: "health-app-angola",
  storageBucket: "health-app-angola.firebasestorage.app",
  messagingSenderId: "435118303895",
  appId: "1:435118303895:web:8c42f4faaf46ec716117d2"
};

async function createTestData() {
  console.log('🏥 CRIANDO DADOS DE TESTE PARA MENDLINK');
  console.log('=' .repeat(50));
  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  // Verificar dados existentes
  const healthServicesRef = collection(db, 'healthServices');
  const existingSnapshot = await getDocs(healthServicesRef);
  console.log(`📊 Dados existentes: ${existingSnapshot.size} serviços`);
  
  if (existingSnapshot.size >= 10) {
    console.log('✅ Já temos dados suficientes para teste!');
    return;
  }
  
  // Dados de teste realistas para Angola
  const testServices = [
    {
      name: 'Hospital Militar Principal',
      type: 'hospital',
      address: 'Rua Direita do Cemitério, Luanda',
      city: 'Luanda',
      state: 'Luanda',
      country: 'Angola',
      coordinates: { latitude: -8.8205, longitude: 13.2441 },
      phone: '+244 222 320 018',
      description: 'Hospital militar com atendimento público em emergências',
      rating: 4.1,
      reviews: 89,
      services: ['Emergency', 'Surgery', 'Internal Medicine'],
      category: 'hospital',
      status: 'active',
      verified: true,
      emergencyService: true,
      acceptsInsurance: true
    },
    {
      name: 'Clínica Multiperfil',
      type: 'clinic',
      address: 'Rua Amílcar Cabral, Maianga, Luanda',
      city: 'Luanda',
      state: 'Luanda',
      country: 'Angola',
      coordinates: { latitude: -8.8300, longitude: 13.2280 },
      phone: '+244 222 333 444',
      description: 'Clínica privada com múltiplas especialidades médicas',
      rating: 4.6,
      reviews: 234,
      services: ['Cardiology', 'Dermatology', 'Orthopedics', 'Gynecology'],
      category: 'clinic',
      status: 'active',
      verified: true,
      emergencyService: false,
      acceptsInsurance: true
    },
    {
      name: 'Farmácia Central',
      type: 'pharmacy',
      address: 'Largo do Kinaxixi, Ingombota, Luanda',
      city: 'Luanda',
      state: 'Luanda', 
      country: 'Angola',
      coordinates: { latitude: -8.8190, longitude: 13.2290 },
      phone: '+244 222 555 666',
      description: 'Farmácia 24h com medicamentos e produtos de saúde',
      rating: 4.3,
      reviews: 156,
      services: ['Medications', '24h Service', 'Health Products'],
      category: 'pharmacy',
      status: 'active',
      verified: true,
      emergencyService: true,
      acceptsInsurance: false
    },
    {
      name: 'Laboratório Synlab Angola',
      type: 'laboratory',
      address: 'Rua Kwame Nkrumah, Maculusso, Luanda',
      city: 'Luanda',
      state: 'Luanda',
      country: 'Angola', 
      coordinates: { latitude: -8.8150, longitude: 13.2320 },
      phone: '+244 222 777 888',
      description: 'Laboratório de análises clínicas e patologia',
      rating: 4.5,
      reviews: 198,
      services: ['Blood Tests', 'Imaging', 'Pathology', 'COVID Tests'],
      category: 'laboratory',
      status: 'active',
      verified: true,
      emergencyService: false,
      acceptsInsurance: true
    },
    {
      name: 'Clínica Girassol',
      type: 'clinic',
      address: 'Avenida Mortala Mohamed, Maianga, Luanda',
      city: 'Luanda',
      state: 'Luanda',
      country: 'Angola',
      coordinates: { latitude: -8.8400, longitude: 13.2250 },
      phone: '+244 222 999 111',
      description: 'Clínica especializada em pediatria e medicina familiar',
      rating: 4.4,
      reviews: 167,
      services: ['Pediatrics', 'Family Medicine', 'Vaccines'],
      category: 'clinic',
      status: 'active',
      verified: true,
      emergencyService: false,
      acceptsInsurance: true
    },
    {
      name: 'Hospital Américo Boavida',
      type: 'hospital',
      address: 'Rua Luther King, Maianga, Luanda',
      city: 'Luanda',
      state: 'Luanda',
      country: 'Angola',
      coordinates: { latitude: -8.8380, longitude: 13.2300 },
      phone: '+244 222 321 654',
      description: 'Hospital público materno-infantil de referência',
      rating: 3.9,
      reviews: 278,
      services: ['Maternity', 'Pediatrics', 'Emergency', 'Neonatology'],
      category: 'hospital',
      status: 'active',
      verified: true,
      emergencyService: true,
      acceptsInsurance: false
    },
    {
      name: 'Centro de Reabilitação Josina Machel',
      type: 'rehabilitation',
      address: 'Rua Major Kanhangulo, Ingombota, Luanda',
      city: 'Luanda',
      state: 'Luanda',
      country: 'Angola',
      coordinates: { latitude: -8.8100, longitude: 13.2380 },
      phone: '+244 222 456 789',
      description: 'Centro especializado em fisioterapia e reabilitação',
      rating: 4.2,
      reviews: 92,
      services: ['Physiotherapy', 'Occupational Therapy', 'Speech Therapy'],
      category: 'rehabilitation',
      status: 'active',
      verified: true,
      emergencyService: false,
      acceptsInsurance: true
    },
    {
      name: 'Consultório Dr. António Silva',
      type: 'professional',
      address: 'Rua Rainha Ginga, Ingombota, Luanda',
      city: 'Luanda',
      state: 'Luanda',
      country: 'Angola',
      coordinates: { latitude: -8.8180, longitude: 13.2350 },
      phone: '+244 222 987 654',
      description: 'Cardiologista com 15 anos de experiência',
      rating: 4.7,
      reviews: 145,
      services: ['Cardiology', 'ECG', 'Stress Tests'],
      specialty: 'Cardiology',
      category: 'specialist',
      status: 'active',
      verified: true,
      emergencyService: false,
      acceptsInsurance: true
    }
  ];
  
  console.log(`🎯 Adicionando ${testServices.length} serviços de teste...`);
  
  try {
    for (const service of testServices) {
      const serviceData = {
        ...service,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(healthServicesRef, serviceData);
      console.log(`✅ Criado: ${service.name} (${docRef.id})`);
    }
    
    console.log('\n🎉 DADOS DE TESTE CRIADOS COM SUCESSO!');
    console.log('📱 Execute o app para testar as funcionalidades:');
    console.log('   - Mapa interativo com marcadores');
    console.log('   - Busca avançada por tipo de serviço');
    console.log('   - Filtragem por categorias');
    console.log('   - Localização "Locate Me"');
    
  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error);
  }
}

createTestData().catch(console.error);