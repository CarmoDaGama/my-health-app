const admin = require('firebase-admin');
const healthServicesData = require('../data/healthServices.json');

// Initialize Firebase Admin SDK para emulator
const serviceAccount = {
  "type": "service_account",
  "project_id": "health-app-angola",
  "private_key_id": "demo-key",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5F5X8qU8j...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk@health-app-angola.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
};

// Configurar para usar emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

// Inicializar Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'health-app-angola'
  });
}

const db = admin.firestore();

async function migrateHealthServices() {
  console.log('🚀 Iniciando migração de dados para Firebase com Admin SDK...');
  
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
          createdBy: 'system'
        };

        // Usar o ID original do JSON se existir
        const docId = service.id || service.name.toLowerCase().replace(/\s+/g, '-');
        await db.collection('healthServices').doc(docId).set(serviceData);
        
        successCount++;
        console.log(`✅ Migrado: ${service.name} (ID: ${docId})`);

        // Small delay
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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc('example-user').set(exampleUser);
    console.log('✅ Coleção users criada');

    // Criar índices e estruturas necessárias
    const categories = ['hospital', 'clinic', 'pharmacy', 'laboratory', 'doctor'];
    for (const category of categories) {
      await db.collection('serviceTypes').doc(category).set({
        name: category,
        displayName: category.charAt(0).toUpperCase() + category.slice(1),
        description: `Serviços do tipo ${category}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    console.log('✅ Tipos de serviços criados');

    console.log('✅ Coleções de exemplo criadas com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao criar coleções de exemplo:', error);
    throw error;
  }
}

async function runMigration() {
  console.log('🎯 Iniciando migração completa do sistema com Admin SDK...');
  console.log('💡 Conectando ao emulator Firestore em localhost:8080');
  
  try {
    const result = await migrateHealthServices();
    await createSampleCollections();
    
    console.log('🎉 Migração completa realizada com sucesso!');
    console.log('💡 Próximos passos:');
    console.log('   1. Verificar dados no Emulator UI (http://localhost:4000)');
    console.log('   2. Testar busca e filtros no app');
    console.log('   3. Verificar integridade dos dados migrados');
    
    if (result.successCount > 0) {
      console.log('✨ Migração bem-sucedida! Os dados estão disponíveis para uso.');
      console.log(`📍 Migrados ${result.successCount} serviços de saúde`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Falha na migração:', error);
    console.log('💡 Verifique se os emulators estão rodando corretamente');
    process.exit(1);
  }
}

runMigration();