/**
 * Script de migração para corrigir a estrutura de preferences dos usuários
 * 
 * PROBLEMA: Alguns usuários têm preferences.notifications como boolean,
 * mas a interface TypeScript espera um objeto complexo
 * 
 * SOLUÇÃO: Migrar todos os usuários para a estrutura correta
 */

const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
  path.join(__dirname, '../serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
} catch (error) {
  console.log('🔧 Usando emulador local do Firebase');
  admin.initializeApp({
    projectId: 'my-health-app-local'
  });
}

const db = admin.firestore();

/**
 * Função para normalizar preferences
 */
function normalizePreferences(currentPreferences) {
  const defaultPreferences = {
    language: 'pt',
    notifications: {
      enabled: true,
      serviceReminders: true,
      healthTips: true,
      emergencyAlerts: true
    },
    favorites: {
      services: [],
      locations: []
    },
    privacy: {
      shareLocation: true,
      publicProfile: false
    }
  };

  // Se preferences não existe ou está vazio
  if (!currentPreferences || typeof currentPreferences !== 'object') {
    console.log('  📝 Criando preferences do zero');
    return defaultPreferences;
  }

  const normalized = {
    language: currentPreferences.language || defaultPreferences.language,
    notifications: {},
    favorites: {
      services: [],
      locations: []
    },
    privacy: {
      shareLocation: true,
      publicProfile: false
    }
  };

  // Migrar notifications
  if (typeof currentPreferences.notifications === 'boolean') {
    console.log('  🔄 Migrando notifications de boolean para objeto');
    normalized.notifications = {
      enabled: currentPreferences.notifications,
      serviceReminders: true,
      healthTips: true,
      emergencyAlerts: true
    };
  } else if (typeof currentPreferences.notifications === 'object' && currentPreferences.notifications !== null) {
    console.log('  ✅ Notifications já é objeto, mantendo estrutura');
    normalized.notifications = {
      enabled: currentPreferences.notifications.enabled !== false,
      serviceReminders: currentPreferences.notifications.serviceReminders !== false,
      healthTips: currentPreferences.notifications.healthTips !== false,
      emergencyAlerts: currentPreferences.notifications.emergencyAlerts !== false
    };
  } else {
    console.log('  📝 Criando notifications padrão');
    normalized.notifications = defaultPreferences.notifications;
  }

  // Migrar favorites
  if (currentPreferences.favorites && typeof currentPreferences.favorites === 'object') {
    normalized.favorites = {
      services: Array.isArray(currentPreferences.favorites.services) 
        ? currentPreferences.favorites.services 
        : [],
      locations: Array.isArray(currentPreferences.favorites.locations) 
        ? currentPreferences.favorites.locations 
        : []
    };
  }

  // Migrar privacy
  if (currentPreferences.privacy && typeof currentPreferences.privacy === 'object') {
    normalized.privacy = {
      shareLocation: currentPreferences.privacy.shareLocation !== false,
      publicProfile: currentPreferences.privacy.publicProfile === true
    };
  }

  return normalized;
}

/**
 * Migrar todos os usuários
 */
async function migrateAllUsers() {
  console.log('🚀 Iniciando migração de preferences...\n');
  
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    
    console.log(`📊 Total de usuários encontrados: ${snapshot.size}\n`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const doc of snapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;
      
      console.log(`👤 Processando usuário: ${userData.name || userId}`);
      console.log(`   Type: ${userData.userType || 'unknown'}`);
      console.log(`   Current preferences:`, JSON.stringify(userData.preferences, null, 2));
      
      try {
        const normalizedPreferences = normalizePreferences(userData.preferences);
        
        // Verificar se realmente precisa de migração
        const needsMigration = JSON.stringify(userData.preferences) !== JSON.stringify(normalizedPreferences);
        
        if (needsMigration) {
          console.log(`   📝 Atualizando preferences...`);
          
          await usersRef.doc(userId).update({
            preferences: normalizedPreferences,
            updatedAt: admin.firestore.Timestamp.now()
          });
          
          console.log(`   ✅ Migração concluída`);
          migratedCount++;
        } else {
          console.log(`   ⏭️  Preferences já estão corretas, pulando`);
          skippedCount++;
        }
        
      } catch (error) {
        console.error(`   ❌ Erro ao migrar usuário ${userId}:`, error.message);
        errorCount++;
      }
      
      console.log(''); // Linha em branco para separar usuários
    }
    
    console.log('📊 RESUMO DA MIGRAÇÃO:');
    console.log(`   ✅ Migrados: ${migratedCount}`);
    console.log(`   ⏭️  Pulados: ${skippedCount}`);
    console.log(`   ❌ Erros: ${errorCount}`);
    console.log(`   📁 Total: ${snapshot.size}\n`);
    
    if (errorCount === 0) {
      console.log('🎉 Migração concluída com sucesso!');
    } else {
      console.log('⚠️  Migração concluída com alguns erros. Verifique os logs acima.');
    }
    
  } catch (error) {
    console.error('💥 Erro fatal na migração:', error);
    process.exit(1);
  }
}

/**
 * Executar migração
 */
if (require.main === module) {
  migrateAllUsers()
    .then(() => {
      console.log('✨ Script de migração finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro na execução:', error);
      process.exit(1);
    });
}

module.exports = {
  normalizePreferences,
  migrateAllUsers
};
