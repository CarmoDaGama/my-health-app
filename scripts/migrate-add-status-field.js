/**
 * Script de migração para adicionar campo 'status' aos serviços existentes
 * Execute uma vez para atualizar os dados existentes no Firestore
 */

const { collection, getDocs, updateDoc, doc } = require('firebase/firestore');
const { db } = require('../services/firebase');

async function migrateServicesToAddStatusField() {
  console.log('🔄 Iniciando migração: Adicionando campo "status" aos serviços...');
  
  try {
    // Buscar todos os serviços existentes
    const servicesSnapshot = await getDocs(collection(db, 'healthServices'));
    
    console.log(`📊 Encontrados ${servicesSnapshot.size} serviços para migrar`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const serviceDoc of servicesSnapshot.docs) {
      try {
        const data = serviceDoc.data();
        
        // Se já tem o campo status, pular
        if (data.status !== undefined) {
          console.log(`⏭️  ${data.name} já tem campo status: ${data.status}`);
          continue;
        }
        
        // Definir como ativo para serviços existentes (assumir que são válidos)
        await updateDoc(doc(db, 'healthServices', serviceDoc.id), {
          status: 'active'
        });
        
        console.log(`✅ ${data.name} - Campo status adicionado como 'active'`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Erro ao migrar ${serviceDoc.id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n📈 RESULTADO DA MIGRAÇÃO:');
    console.log(`✅ Sucessos: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📊 Total processados: ${successCount + errorCount}`);
    
    if (successCount > 0) {
      console.log('\n🎉 Migração concluída! Agora você pode reativar os filtros de status.');
    }
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  migrateServicesToAddStatusField()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { migrateServicesToAddStatusField };