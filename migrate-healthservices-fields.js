const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, deleteField } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCOxpoXvaG9wNRoMrSVf0o5Xdqvmm19NWY",
  authDomain: "health-app-angola.firebaseapp.com",
  projectId: "health-app-angola",
  storageBucket: "health-app-angola.firebasestorage.app",
  messagingSenderId: "435118303895",
  appId: "1:435118303895:web:8c42f4faaf46ec716117d2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateHealthServicesFields() {
  try {
    console.log('🔧 Iniciando migração de campos em healthServices...');

    // Buscar todos os serviços
    const snapshot = await getDocs(collection(db, 'healthServices'));
    console.log(`📊 Total de serviços encontrados: ${snapshot.size}`);

    let migratedCount = 0;
    let errorsCount = 0;

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const docId = docSnapshot.id;
      
      console.log(`\n🔍 Processando: ${data.name || docId}`);

      const updates = {};
      let needsUpdate = false;

      // 1. Corrigir campo 'type' ausente
      if (!data.type && data.serviceType) {
        if (data.serviceType === 'professional') {
          updates.type = 'professional';
        } else if (data.serviceType === 'institution') {
          // Para instituições, tentar detectar o tipo baseado no nome
          const name = (data.name || '').toLowerCase();
          if (name.includes('hospital')) {
            updates.type = 'hospital';
          } else if (name.includes('clínica') || name.includes('clinica')) {
            updates.type = 'clinic';
          } else if (name.includes('laboratório') || name.includes('laboratorio')) {
            updates.type = 'laboratory';
          } else if (name.includes('farmácia') || name.includes('farmacia')) {
            updates.type = 'pharmacy';
          } else {
            updates.type = 'clinic'; // Padrão
          }
        }
        needsUpdate = true;
        console.log(`  ✅ Adicionando campo 'type': ${updates.type}`);
      }

      // 2. Corrigir campo 'coordinates' ausente (migrar de 'location')
      if (!data.coordinates && data.location) {
        updates.coordinates = data.location;
        needsUpdate = true;
        console.log(`  ✅ Migrando 'location' para 'coordinates':`, data.location);
        
        // Remover o campo antigo 'location'
        updates.location = deleteField();
        console.log(`  🗑️ Removendo campo antigo 'location'`);
      }

      // 3. Aplicar atualizações se necessário
      if (needsUpdate) {
        try {
          const docRef = doc(db, 'healthServices', docId);
          await updateDoc(docRef, updates);
          
          migratedCount++;
          console.log(`  ✅ Documento atualizado com sucesso`);
          
          // Log das mudanças aplicadas
          Object.keys(updates).forEach(key => {
            if (key !== 'location') { // Não logar a remoção
              console.log(`    - ${key}: ${JSON.stringify(updates[key])}`);
            }
          });
          
        } catch (error) {
          errorsCount++;
          console.error(`  ❌ Erro ao atualizar documento ${docId}:`, error.message);
        }
      } else {
        console.log(`  ⏭️ Nenhuma atualização necessária`);
      }
    }

    console.log('\n📊 Resumo da migração:');
    console.log(`✅ Documentos migrados: ${migratedCount}`);
    console.log(`❌ Erros encontrados: ${errorsCount}`);
    console.log(`📋 Total processados: ${snapshot.size}`);

    if (migratedCount > 0) {
      console.log('\n🎉 Migração completada! Os campos foram corrigidos:');
      console.log('- Campo "type" adicionado onde estava ausente');
      console.log('- Campo "location" migrado para "coordinates"');
      console.log('\n💡 Novos registros usarão os campos corretos automaticamente.');
    } else {
      console.log('\n✅ Nenhuma migração necessária - todos os campos já estão corretos!');
    }

  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }

  process.exit(0);
}

migrateHealthServicesFields();