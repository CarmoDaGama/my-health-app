const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  setDoc,
  doc,
  GeoPoint, 
  serverTimestamp,
  enableNetwork,
  writeBatch
} = require('firebase/firestore');
const healthServicesData = require('../data/healthServices.json');

// Firebase config REAL para produção
const firebaseConfig = {
  apiKey: "AIzaSyCOxpoXvaG9wNRoMrSVf0o5Xdqvmm19NWY",
  authDomain: "health-app-angola.firebaseapp.com",
  projectId: "health-app-angola",
  storageBucket: "health-app-angola.firebasestorage.app",
  messagingSenderId: "435118303895",
  appId: "1:435118303895:web:8c42f4faaf46ec716117d2"
};

console.log('🔥 INICIANDO MIGRAÇÃO PARA FIRESTORE PRODUÇÃO');
console.log('📍 Projeto: health-app-angola');

// Initialize Firebase para PRODUÇÃO
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function validateConnection() {
  try {
    console.log('🔍 Testando conexão com Firestore produção...');
    const testDoc = doc(db, 'test', 'connection');
    await setDoc(testDoc, {
      timestamp: serverTimestamp(),
      test: 'connection successful'
    });
    console.log('✅ Conexão com Firestore PRODUÇÃO confirmada!');
    return true;
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    return false;
  }
}

async function migrateHealthServices() {
  console.log('🚀 Iniciando migração de dados para Firestore PRODUÇÃO...');
  
  try {
    const services = healthServicesData.healthServices;
    console.log(`📊 Encontrados ${services.length} serviços para migrar`);

    let successCount = 0;
    let errorCount = 0;

    // Migrar um por vez para evitar problemas de rate limiting
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
          createdBy: 'system',
          migratedAt: serverTimestamp(),
          version: '1.0'
        };

        // Usar o ID original do JSON se existir
        const docId = service.id || service.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const docRef = doc(db, 'healthServices', docId);
        await setDoc(docRef, serviceData);
        
        successCount++;
        console.log(`✅ Migrado: ${service.name} (ID: ${docId})`);

        // Delay pequeno para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        errorCount++;
        console.error(`❌ Erro ao migrar ${service.name}:`, error.message);
      }
    }

    console.log('✅ Migração de serviços concluída!');
    console.log(`📊 Resultados:`);
    console.log(`   • Sucessos: ${successCount}`);
    console.log(`   • Erros: ${errorCount}`);
    console.log(`   • Total: ${services.length}`);

    return { successCount, errorCount };

  } catch (error) {
    console.error('💥 Erro fatal na migração:', error);
    throw error;
  }
}

async function createProductionCollections() {
  console.log('🔧 Criando estruturas de produção...');

  try {
    // Criar metadados do sistema
    await setDoc(doc(db, 'system', 'metadata'), {
      version: '1.0.0',
      migratedAt: serverTimestamp(),
      totalServices: healthServicesData.healthServices.length,
      environment: 'production',
      lastUpdate: serverTimestamp()
    });

    // Criar tipos de serviços
    const serviceTypes = [
      { id: 'hospital', name: 'Hospital', icon: '🏥' },
      { id: 'clinic', name: 'Clínica', icon: '🏥' },
      { id: 'pharmacy', name: 'Farmácia', icon: '💊' },
      { id: 'laboratory', name: 'Laboratório', icon: '🔬' },
      { id: 'doctor', name: 'Médico', icon: '👨‍⚕️' }
    ];

    for (const type of serviceTypes) {
      await setDoc(doc(db, 'serviceTypes', type.id), {
        ...type,
        createdAt: serverTimestamp()
      });
    }

    // Criar configurações iniciais
    await setDoc(doc(db, 'config', 'app'), {
      searchRadius: 50, // km
      maxResults: 100,
      enableRatings: true,
      enableReviews: true,
      maintenanceMode: false,
      supportedCities: ['Luanda', 'Benguela', 'Huambo', 'Lobito'],
      createdAt: serverTimestamp()
    });

    console.log('✅ Estruturas de produção criadas');

  } catch (error) {
    console.error('❌ Erro ao criar estruturas:', error);
    throw error;
  }
}

async function runProductionMigration() {
  console.log('🎯 EXECUTANDO MIGRAÇÃO PARA PRODUÇÃO');
  console.log('⚠️  Os dados serão salvos no Firestore REAL!');
  console.log('🕐 Iniciado em:', new Date().toLocaleString());
  
  try {
    // Validar conexão primeiro
    const connected = await validateConnection();
    if (!connected) {
      throw new Error('Falha na conexão com Firestore');
    }

    // Executar migração
    const result = await migrateHealthServices();
    await createProductionCollections();
    
    console.log('');
    console.log('🎉 MIGRAÇÃO PARA PRODUÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('📊 Resumo Final:');
    console.log(`   📍 Projeto: health-app-angola`);
    console.log(`   ✅ Serviços migrados: ${result.successCount}/${healthServicesData.healthServices.length}`);
    console.log(`   ⚠️ Erros: ${result.errorCount}`);
    console.log(`   ⏰ Concluído em: ${new Date().toLocaleString()}`);
    console.log('');
    console.log('🔗 Verificar dados:');
    console.log('   • Console: https://console.firebase.google.com/project/health-app-angola/firestore');
    console.log('   • Coleção: healthServices');
    console.log('');
    console.log('⚠️  IMPORTANTE - PRÓXIMOS PASSOS:');
    console.log('   1. ✅ Dados migrados com sucesso');
    console.log('   2. 🔒 Restaurar regras de segurança: npm run restore-firestore-rules');
    console.log('   3. 🧪 Testar app em produção');
    console.log('   4. 🚀 App pronto para uso!');
    
    process.exit(0);
  } catch (error) {
    console.error('💥 FALHA NA MIGRAÇÃO:', error);
    console.log('');
    console.log('🔧 Possíveis soluções:');
    console.log('   1. Verificar regras do Firestore (devem estar permissivas)');
    console.log('   2. Aguardar alguns minutos e tentar novamente');
    console.log('   3. Verificar conexão com internet');
    process.exit(1);
  }
}

runProductionMigration();