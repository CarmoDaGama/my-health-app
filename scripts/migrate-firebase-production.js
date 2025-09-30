const admin = require('firebase-admin');
const healthServicesData = require('../data/healthServices.json');

// Initialize Firebase Admin SDK para PRODUÇÃO
console.log('🔥 ATENÇÃO: Migração para FIRESTORE EM PRODUÇÃO!');
console.log('📍 Projeto: health-app-angola');

// Usar credenciais padrão do ambiente (ADC - Application Default Credentials)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'health-app-angola'
  });
}

const db = admin.firestore();

async function validateConnection() {
  try {
    console.log('🔍 Testando conexão com Firestore...');
    await db.collection('test').doc('connection').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      test: 'connection successful'
    });
    await db.collection('test').doc('connection').delete();
    console.log('✅ Conexão com Firestore confirmada!');
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
    const batch = db.batch();

    // Criar batch de operações para melhor performance
    for (const service of services) {
      try {
        const serviceData = {
          name: service.name,
          type: service.type,
          address: service.address,
          city: service.city,
          state: service.state || '',
          country: service.country || 'Angola',
          coordinates: new admin.firestore.GeoPoint(
            service.coordinates.latitude,
            service.coordinates.longitude
          ),
          phone: service.phone || '',
          services: service.services || [],
          rating: service.rating || 0,
          description: service.description || '',
          website: service.website || '',
          operatingHours: service.operatingHours || 'Não informado',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'active',
          createdBy: 'system',
          migratedAt: admin.firestore.FieldValue.serverTimestamp(),
          version: '1.0'
        };

        // Usar o ID original do JSON se existir
        const docId = service.id || service.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const docRef = db.collection('healthServices').doc(docId);
        batch.set(docRef, serviceData);
        
        successCount++;
        console.log(`✅ Preparado para migrar: ${service.name} (ID: ${docId})`);

      } catch (error) {
        errorCount++;
        console.error(`❌ Erro ao preparar ${service.name}:`, error.message);
      }
    }

    // Executar batch
    console.log('💾 Executando migração em lote...');
    await batch.commit();

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

async function createProductionCollections() {
  console.log('🔧 Criando estruturas de produção...');

  try {
    const batch = db.batch();

    // Criar metadados do sistema
    const systemMetaRef = db.collection('system').doc('metadata');
    batch.set(systemMetaRef, {
      version: '1.0.0',
      migratedAt: admin.firestore.FieldValue.serverTimestamp(),
      totalServices: healthServicesData.healthServices.length,
      environment: 'production',
      lastUpdate: admin.firestore.FieldValue.serverTimestamp()
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
      const typeRef = db.collection('serviceTypes').doc(type.id);
      batch.set(typeRef, {
        ...type,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Criar configurações iniciais
    const configRef = db.collection('config').doc('app');
    batch.set(configRef, {
      searchRadius: 50, // km
      maxResults: 100,
      enableRatings: true,
      enableReviews: true,
      maintenanceMode: false,
      supportedCities: ['Luanda', 'Benguela', 'Huambo', 'Lobito'],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await batch.commit();
    console.log('✅ Estruturas de produção criadas');

  } catch (error) {
    console.error('❌ Erro ao criar estruturas:', error);
    throw error;
  }
}

async function runProductionMigration() {
  console.log('🎯 INICIANDO MIGRAÇÃO PARA PRODUÇÃO');
  console.log('⚠️  ATENÇÃO: Os dados serão salvos no Firestore real!');
  console.log('📍 Projeto: health-app-angola');
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
    
    console.log('🎉 MIGRAÇÃO PARA PRODUÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('💡 Resultados:');
    console.log(`   📍 Projeto: health-app-angola`);
    console.log(`   📊 Serviços migrados: ${result.successCount}`);
    console.log(`   ⏰ Concluído em: ${new Date().toLocaleString()}`);
    console.log('');
    console.log('🔗 Links úteis:');
    console.log('   • Firebase Console: https://console.firebase.google.com/project/health-app-angola/firestore');
    console.log('   • Verificar dados: Firestore > healthServices');
    console.log('');
    console.log('⚠️  PRÓXIMO PASSO OBRIGATÓRIO:');
    console.log('   Reverter regras de segurança para as originais!');
    console.log('   Execute: npm run restore-firestore-rules');
    
    process.exit(0);
  } catch (error) {
    console.error('💥 FALHA NA MIGRAÇÃO PARA PRODUÇÃO:', error);
    console.log('');
    console.log('🔧 Verifique:');
    console.log('   1. Conexão com internet');
    console.log('   2. Permissões do projeto Firebase');
    console.log('   3. Regras do Firestore');
    console.log('   4. Configuração do Firebase CLI');
    process.exit(1);
  }
}

runProductionMigration();