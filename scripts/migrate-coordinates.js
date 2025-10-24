/**
 * Script de migração para padronizar coordenadas
 * 
 * PROBLEMA: Coordenadas estão em formatos diferentes:
 * - Professional: professionalInfo.coordinates = { latitude, longitude }
 * - Institution: institutionInfo.address.coordinates = { lat, lng }
 * 
 * SOLUÇÃO: Padronizar para { latitude, longitude } e mover coordinates 
 * para o nível superior em institutionInfo
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';

// Configuração do Firebase (emulador)
const firebaseConfig = {
  projectId: 'my-health-app-local',
  storageBucket: 'my-health-app-local.appspot.com',
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Normaliza coordenadas para formato padrão
 */
function normalizeCoordinates(coords) {
  if (!coords || typeof coords !== 'object') {
    return null;
  }

  // Formato padrão: { latitude, longitude }
  if (typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
    return {
      latitude: coords.latitude,
      longitude: coords.longitude
    };
  }

  // Formato alternativo: { lat, lng }
  if (typeof coords.lat === 'number' && typeof coords.lng === 'number') {
    return {
      latitude: coords.lat,
      longitude: coords.lng
    };
  }

  return null;
}

/**
 * Valida se as coordenadas são válidas
 */
function isValidCoordinates(coords) {
  if (!coords) return false;
  
  return (
    typeof coords.latitude === 'number' &&
    typeof coords.longitude === 'number' &&
    coords.latitude >= -90 && coords.latitude <= 90 &&
    coords.longitude >= -180 && coords.longitude <= 180
  );
}

/**
 * Migrar coordenadas de profissionais
 */
function migrateProfessionalCoordinates(userData) {
  const updates = {};
  let needsUpdate = false;

  if (userData.professionalInfo && userData.professionalInfo.coordinates) {
    const normalized = normalizeCoordinates(userData.professionalInfo.coordinates);
    
    if (normalized && isValidCoordinates(normalized)) {
      console.log('    🔄 Normalizando coordenadas do profissional');
      updates['professionalInfo.coordinates'] = normalized;
      needsUpdate = true;
    } else {
      console.log('    ⚠️  Coordenadas inválidas, removendo');
      updates['professionalInfo.coordinates'] = null;
      needsUpdate = true;
    }
  }

  return { updates, needsUpdate };
}

/**
 * Migrar coordenadas de instituições
 */
function migrateInstitutionCoordinates(userData) {
  const updates = {};
  let needsUpdate = false;

  if (userData.institutionInfo) {
    // Verificar se coordinates está no lugar errado (dentro de address)
    if (userData.institutionInfo.address && userData.institutionInfo.address.coordinates) {
      const normalized = normalizeCoordinates(userData.institutionInfo.address.coordinates);
      
      if (normalized && isValidCoordinates(normalized)) {
        console.log('    🔄 Movendo coordinates de address para institutionInfo');
        updates['institutionInfo.coordinates'] = normalized;
        
        // Remover coordinates do address (criar novo address sem coordinates)
        const newAddress = { ...userData.institutionInfo.address };
        delete newAddress.coordinates;
        updates['institutionInfo.address'] = newAddress;
        
        needsUpdate = true;
      }
    }
    
    // Verificar se coordinates já está no lugar certo mas precisa normalização
    else if (userData.institutionInfo.coordinates) {
      const normalized = normalizeCoordinates(userData.institutionInfo.coordinates);
      
      if (normalized && isValidCoordinates(normalized)) {
        // Verificar se já está no formato correto
        const current = userData.institutionInfo.coordinates;
        if (current.latitude !== normalized.latitude || current.longitude !== normalized.longitude) {
          console.log('    🔄 Normalizando coordenadas da instituição');
          updates['institutionInfo.coordinates'] = normalized;
          needsUpdate = true;
        }
      } else {
        console.log('    ⚠️  Coordenadas inválidas, removendo');
        updates['institutionInfo.coordinates'] = null;
        needsUpdate = true;
      }
    }
  }

  return { updates, needsUpdate };
}

/**
 * Migrar todos os usuários
 */
async function migrateAllCoordinates() {
  console.log('🚀 Iniciando migração de coordenadas...\n');
  
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    console.log(`📊 Total de usuários encontrados: ${snapshot.size}\n`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const docSnap of snapshot.docs) {
      const userData = docSnap.data();
      const userId = docSnap.id;
      
      console.log(`👤 Processando usuário: ${userData.name || userId}`);
      console.log(`   Type: ${userData.userType || 'unknown'}`);
      
      try {
        let allUpdates = {};
        let needsUpdate = false;
        
        // Migrar baseado no tipo de usuário
        if (userData.userType === 'professional' && userData.professionalInfo) {
          const { updates, needsUpdate: professionalNeedsUpdate } = migrateProfessionalCoordinates(userData);
          allUpdates = { ...allUpdates, ...updates };
          needsUpdate = needsUpdate || professionalNeedsUpdate;
        }
        
        if (userData.userType === 'institution' && userData.institutionInfo) {
          const { updates, needsUpdate: institutionNeedsUpdate } = migrateInstitutionCoordinates(userData);
          allUpdates = { ...allUpdates, ...updates };
          needsUpdate = needsUpdate || institutionNeedsUpdate;
        }
        
        if (needsUpdate) {
          console.log(`   📝 Atualizando coordenadas...`);
          console.log(`   Updates:`, JSON.stringify(allUpdates, null, 2));
          
          const userDocRef = doc(db, 'users', userId);
          await updateDoc(userDocRef, {
            ...allUpdates,
            updatedAt: Timestamp.now()
          });
          
          console.log(`   ✅ Migração de coordenadas concluída`);
          migratedCount++;
        } else {
          console.log(`   ⏭️  Coordenadas já estão corretas, pulando`);
          skippedCount++;
        }
        
      } catch (error) {
        console.error(`   ❌ Erro ao migrar usuário ${userId}:`, error.message);
        errorCount++;
      }
      
      console.log(''); // Linha em branco para separar usuários
    }
    
    console.log('📊 RESUMO DA MIGRAÇÃO DE COORDENADAS:');
    console.log(`   ✅ Migrados: ${migratedCount}`);
    console.log(`   ⏭️  Pulados: ${skippedCount}`);
    console.log(`   ❌ Erros: ${errorCount}`);
    console.log(`   📁 Total: ${snapshot.size}\n`);
    
    if (errorCount === 0) {
      console.log('🎉 Migração de coordenadas concluída com sucesso!');
    } else {
      console.log('⚠️  Migração concluída com alguns erros. Verifique os logs acima.');
    }
    
  } catch (error) {
    console.error('💥 Erro fatal na migração:', error);
    throw error;
  }
}

// Executar migração
migrateAllCoordinates()
  .then(() => {
    console.log('✨ Script de migração de coordenadas finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro na execução:', error);
    process.exit(1);
  });
