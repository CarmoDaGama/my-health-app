const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, GeoPoint, serverTimestamp } = require('firebase/firestore');
const healthServicesData = require('../data/healthServices.json');

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

        // Small delay to avoid overwhelming Firestore
        await new Promise(resolve => setTimeout(resolve, 100));

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
  
  try {
    await migrateHealthServices();
    await createSampleCollections();
    
    console.log('🎉 Migração completa realizada com sucesso!');
    console.log('💡 Próximos passos:');
    console.log('   1. Testar autenticação no app');
    console.log('   2. Verificar dados no Firebase Console');
    console.log('   3. Testar funcionalidades do app');
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Falha na migração:', error);
    process.exit(1);
  }
}

runMigration();