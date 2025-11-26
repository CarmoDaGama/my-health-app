const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, limit } = require('firebase/firestore');

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

async function analyzeHealthServicesFields() {
  try {
    console.log('🔍 Analisando campos em healthServices...');

    // Buscar alguns serviços para análise
    const servicesQuery = query(collection(db, 'healthServices'), limit(10));
    const snapshot = await getDocs(servicesQuery);

    console.log(`📊 Total de serviços encontrados: ${snapshot.size}`);

    const fieldAnalysis = {
      hasType: 0,
      hasServiceType: 0,
      hasCoordinates: 0,
      hasLocation: 0,
      servicesWithIssues: []
    };

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const service = {
        id: doc.id,
        name: data.name,
        hasType: !!data.type,
        hasServiceType: !!data.serviceType,
        hasCoordinates: !!data.coordinates,
        hasLocation: !!data.location,
        typeValue: data.type,
        serviceTypeValue: data.serviceType
      };

      if (data.type) fieldAnalysis.hasType++;
      if (data.serviceType) fieldAnalysis.hasServiceType++;
      if (data.coordinates) fieldAnalysis.hasCoordinates++;
      if (data.location) fieldAnalysis.hasLocation++;

      // Identificar serviços com problemas
      const hasIssues = (!data.type && data.serviceType) || (!data.coordinates && data.location);
      if (hasIssues) {
        fieldAnalysis.servicesWithIssues.push(service);
      }

      console.log(`🏥 ${data.name || doc.id}:`, {
        type: data.type || 'MISSING',
        serviceType: data.serviceType || 'MISSING',
        coordinates: data.coordinates ? 'EXISTS' : 'MISSING',
        location: data.location ? 'EXISTS' : 'MISSING',
        hasIssues
      });
    });

    console.log('\n📈 Resumo da análise:', fieldAnalysis);

    if (fieldAnalysis.servicesWithIssues.length > 0) {
      console.log('\n🚨 Serviços com problemas de campos encontrados:');
      fieldAnalysis.servicesWithIssues.forEach(service => {
        console.log(`- ${service.name} (${service.id}):`, {
          needsType: !service.hasType && service.hasServiceType,
          needsCoordinates: !service.hasCoordinates && service.hasLocation
        });
      });
      
      console.log('\n💡 Ação necessária:');
      console.log('1. Campo "type" ausente em alguns serviços (apenas "serviceType" presente)');
      console.log('2. Campo "coordinates" ausente em alguns serviços (apenas "location" presente)');
      console.log('3. As correções no AuthServiceFirebase resolverão novos registros');
      console.log('4. Para dados existentes, pode ser necessária uma migração');
    } else {
      console.log('\n✅ Nenhum problema encontrado nos campos analisados');
    }

  } catch (error) {
    console.error('❌ Erro na análise:', error);
  }

  process.exit(0);
}

analyzeHealthServicesFields();