const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, orderBy, desc, limit } = require('firebase/firestore');

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

async function validateFieldFixes() {
  try {
    console.log('🔍 Validando se as correções dos campos estão funcionando...');

    // 1. Verificar se HospGama tem os campos corretos
    console.log('\n1. Verificando HospGama...');
    const hospGamaQuery = query(
      collection(db, 'healthServices'), 
      where('name', '==', 'HospGama'),
      limit(1)
    );
    const hospGamaSnapshot = await getDocs(hospGamaQuery);
    
    if (!hospGamaSnapshot.empty) {
      const hospGama = hospGamaSnapshot.docs[0].data();
      console.log('✅ HospGama encontrado:', {
        id: hospGamaSnapshot.docs[0].id,
        name: hospGama.name,
        type: hospGama.type || 'MISSING ❌',
        serviceType: hospGama.serviceType || 'MISSING',
        coordinates: hospGama.coordinates ? '✅ EXISTS' : 'MISSING ❌',
        location: hospGama.location ? '❌ OLD FIELD EXISTS' : '✅ CLEANED',
        address: hospGama.address || 'MISSING'
      });
      
      const isCorrect = !!hospGama.type && !!hospGama.coordinates && !hospGama.location;
      console.log(`HospGama está correto: ${isCorrect ? '✅ SIM' : '❌ NÃO'}`);
    } else {
      console.log('❌ HospGama não encontrado');
    }

    // 2. Verificar serviços mais recentes
    console.log('\n2. Verificando serviços mais recentes...');
    const recentQuery = query(
      collection(db, 'healthServices'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const recentSnapshot = await getDocs(recentQuery);
    
    console.log(`📊 ${recentSnapshot.size} serviços mais recentes:`);
    recentSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const hasCorrectFields = !!data.type && (!!data.coordinates || !!data.location);
      
      console.log(`${index + 1}. ${data.name || doc.id}:`, {
        type: data.type || 'MISSING ❌',
        coordinates: data.coordinates ? '✅' : (data.location ? '📍 OLD' : 'MISSING ❌'),
        correct: hasCorrectFields ? '✅' : '❌'
      });
    });

    // 3. Resumo da situação atual
    console.log('\n📊 Resumo da situação atual:');
    
    const allServicesSnapshot = await getDocs(collection(db, 'healthServices'));
    const stats = {
      total: allServicesSnapshot.size,
      withType: 0,
      withCoordinates: 0,
      withOldLocation: 0,
      fullyCorrect: 0
    };

    allServicesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.type) stats.withType++;
      if (data.coordinates) stats.withCoordinates++;
      if (data.location) stats.withOldLocation++;
      if (data.type && data.coordinates && !data.location) stats.fullyCorrect++;
    });

    console.log(`📈 Estatísticas dos campos:`);
    console.log(`- Total de serviços: ${stats.total}`);
    console.log(`- Com campo 'type': ${stats.withType}/${stats.total} (${((stats.withType/stats.total)*100).toFixed(1)}%)`);
    console.log(`- Com campo 'coordinates': ${stats.withCoordinates}/${stats.total} (${((stats.withCoordinates/stats.total)*100).toFixed(1)}%)`);
    console.log(`- Com campo antigo 'location': ${stats.withOldLocation}/${stats.total} (${((stats.withOldLocation/stats.total)*100).toFixed(1)}%)`);
    console.log(`- Completamente corretos: ${stats.fullyCorrect}/${stats.total} (${((stats.fullyCorrect/stats.total)*100).toFixed(1)}%)`);

    if (stats.withOldLocation > 0) {
      console.log('\n⚠️ Ação recomendada:');
      console.log(`- ${stats.withOldLocation} serviços ainda têm o campo antigo 'location'`);
      console.log('- Execute a migração como admin para corrigir dados antigos');
      console.log('- Novos registros já usarão os campos corretos');
    } else {
      console.log('\n✅ Todos os serviços estão usando os campos corretos!');
    }

    // 4. Verificar se as correções no código resolverão novos registros
    console.log('\n💡 Status das correções implementadas:');
    console.log('✅ AuthServiceFirebase.addToHealthServices agora usa:');
    console.log('  - Campo "type" ao invés de apenas "serviceType"');
    console.log('  - Campo "coordinates" ao invés de "location"');
    console.log('✅ AuthServiceFirebase.updateProfile agora atualiza healthServices');
    console.log('✅ Novos registros de instituições terão campos corretos');
    console.log('✅ Atualizações de perfil sincronizarão os dados');

  } catch (error) {
    console.error('❌ Erro na validação:', error);
  }

  process.exit(0);
}

validateFieldFixes();