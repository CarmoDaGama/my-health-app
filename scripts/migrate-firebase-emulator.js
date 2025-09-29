const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  GeoPoint, 
  serverTimestamp,
  connectFirestoreEmulator 
} = require('firebase/firestore');
const healthServicesData = require('../data/healthServices.json');

// Firebase config para emulator
const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "health-app-angola",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to Firestore emulator
let usingEmulator = false;
try {
  connectFirestoreEmulator(db, 'localhost', 8080);
  usingEmulator = true;
  console.log('📡 Conectado ao Firestore Emulator (localhost:8080)');
} catch (error) {
  console.log('⚠️  Usando Firestore em produção');
}

async function migrateHealthServices() {
  console.log('🚀 Iniciando migração de dados para Firebase...');
  
  try {
    const services = healthServicesData.healthServices;
    console.log(`📊 Encontrados ${services.length} serviços para migrar`);

    let successCount = 0;
    let errorCount = 0;

    for (const service of services) {
      try {
        const serviceData = {
          name: service.name,
          type: service.type,
          address: service.address,
          city: service.city,
          state: service.state || '',
          country: service.country || 'Angola',
          coordinates: new GeoPoint(
            service.coordinates.latitude,
            service.coordinates.longitude
          ),
          phone: service.phone || '',
          services: service.services || [],
          rating: service.rating || 0,
          description: service.description || '',
          website: service.website || '',
          operatingHours: service.operatingHours || 'Não informado',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'active',
          createdBy: 'system'
        };

        await addDoc(collection(db, 'healthServices'), serviceData);
        successCount++;
        console.log(`✅ Migrado: ${service.name}`);

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (error) {
        errorCount++;
        console.error(`❌ Erro ao migrar ${service.name}:`, error.message);
      }
    }

    console.log('✅ Migração concluída!');
    console.log(`📊 Resultados finais:`);
    console.log(`   • Sucessos: ${successCount}`);
    console.log(`   • Erros: ${errorCount}`);
    console.log(`   • Total: ${services.length}`);

    return { successCount, errorCount };

  } catch (error) {
    console.error('💥 Erro fatal na migração:', error);
    throw error;
  }
}

async function createSampleCollections() {
  console.log('🔧 Criando coleções de exemplo...');

  try {
    // Criar documento de exemplo para users
    const exampleUser = {
      name: 'Usuário Exemplo',
      email: 'exemplo@email.com',
      phone: '+244 923 456 789',
      userType: 'patient',
      preferences: {
        language: 'pt',
        notifications: true,
        favorites: {
          services: [],
          locations: []
        }
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await addDoc(collection(db, 'users'), exampleUser);
    console.log('✅ Coleção users criada');

    console.log('✅ Coleções de exemplo criadas com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao criar coleções de exemplo:', error);
    throw error;
  }
}

async function runMigration() {
  console.log('🎯 Iniciando migração completa do sistema...');
  console.log('💡 Certifique-se de que os emulators estão rodando: firebase emulators:start');
  
  try {
    const result = await migrateHealthServices();
    await createSampleCollections();
    
    console.log('🎉 Migração completa realizada com sucesso!');
    console.log('💡 Próximos passos:');
    console.log('   1. Verificar dados no Emulator UI (http://localhost:4000)');
    console.log('   2. Testar autenticação no app');
    console.log('   3. Para produção, ajustar regras do Firestore se necessário');
    
    if (result.successCount > 0) {
      console.log('✨ Migração bem-sucedida! Os dados estão disponíveis para uso.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Falha na migração:', error);
    console.log('💡 Dicas para resolver:');
    console.log('   1. Certifique-se de que os emulators estão rodando');
    console.log('   2. Execute: firebase emulators:start');
    console.log('   3. Tente novamente: npm run migrate-firebase');
    process.exit(1);
  }
}

runMigration();