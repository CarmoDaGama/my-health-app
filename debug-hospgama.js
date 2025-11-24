const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'mendlink-healthcare'
  });
}

const db = admin.firestore();

async function findHospGama() {
  console.log('🔍 Buscando serviço HospGama...');
  
  try {
    const servicesSnapshot = await db.collection('healthServices').get();
    
    console.log('Total de serviços:', servicesSnapshot.size);
    
    let found = false;
    
    servicesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.name && data.name.toLowerCase().includes('hospgama')) {
        found = true;
        console.log('✅ Encontrado HospGama:');
        console.log('ID:', doc.id);
        console.log('Nome:', data.name);
        console.log('Tipo:', data.type);
        console.log('Coordenadas:', data.coordinates);
        console.log('Endereço:', data.address);
        console.log('Rating:', data.rating);
        console.log('Dados completos:', JSON.stringify(data, null, 2));
      }
    });
    
    if (!found) {
      console.log('❌ HospGama não encontrado. Listando serviços similares...');
      servicesSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.name && (data.name.toLowerCase().includes('hosp') || data.name.toLowerCase().includes('gama'))) {
          console.log('Similar:', doc.id, '-', data.name);
        }
      });
    }

    // Também buscar pelo ID específico mencionado no log
    const specificServiceId = 'n1KbATJbQJgaDboSNDRu4E1Tmr42';
    console.log('\n🔍 Buscando pelo ID específico:', specificServiceId);
    
    try {
      const specificDoc = await db.collection('healthServices').doc(specificServiceId).get();
      if (specificDoc.exists) {
        const data = specificDoc.data();
        console.log('✅ Serviço encontrado pelo ID:');
        console.log('Nome:', data.name);
        console.log('Tipo:', data.type);
        console.log('Dados:', JSON.stringify(data, null, 2));
      } else {
        console.log('❌ Serviço não encontrado pelo ID específico');
      }
    } catch (error) {
      console.error('Erro ao buscar por ID específico:', error);
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

findHospGama();