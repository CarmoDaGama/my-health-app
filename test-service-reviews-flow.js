/**
 * TESTE: Fluxo ServiceReviews - Verificar View All Reviews
 * Simula o fluxo completo do componente ServiceReviews
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where
} = require('firebase/firestore');

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBPgldaU5k1GUGPrMZnSO4EBOhT6DKkx2o",
  authDomain: "mendlink-4b5f5.firebaseapp.com",
  projectId: "mendlink-4b5f5",
  storageBucket: "mendlink-4b5f5.firebasestorage.app",
  messagingSenderId: "952110962925",
  appId: "1:952110962925:web:34d5eb8834e3344b8309c9",
  measurementId: "G-50YCE5LQES"
};

async function testServiceReviewsFlow() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('🧪 TESTE: ServiceReviews Flow');
    console.log('=================================');

    // Buscar serviços com reviews temáticos
    const reviewsSnapshot = await getDocs(collection(db, 'thematicReviews'));
    
    if (reviewsSnapshot.size === 0) {
      console.log('❌ Nenhum review temático encontrado!');
      return;
    }

    console.log(`📊 Total de reviews temáticos: ${reviewsSnapshot.size}`);

    // Pegar os serviceIds únicos
    const serviceIds = new Set();
    reviewsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.serviceId) {
        serviceIds.add(data.serviceId);
      }
    });

    console.log(`🏥 Serviços com reviews: ${serviceIds.size}`);

    // Testar o primeiro serviço com reviews
    const firstServiceId = Array.from(serviceIds)[0];
    console.log(`\n🎯 TESTANDO SERVIÇO: ${firstServiceId}`);

    // Buscar informações do serviço
    const servicesSnapshot = await getDocs(
      query(collection(db, 'healthServices'), where('__name__', '==', firstServiceId))
    );

    if (servicesSnapshot.size === 0) {
      console.log('❌ Serviço não encontrado na coleção healthServices!');
      return;
    }

    const serviceData = servicesSnapshot.docs[0].data();
    console.log(`📋 Serviço: ${serviceData.name || 'Nome não disponível'}`);

    // Buscar reviews deste serviço
    const serviceReviewsSnapshot = await getDocs(
      query(collection(db, 'thematicReviews'), where('serviceId', '==', firstServiceId))
    );

    console.log(`\n📝 Reviews deste serviço: ${serviceReviewsSnapshot.size}`);
    
    serviceReviewsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`  ${index + 1}. ${data.userName} - ${data.overallRating}/5`);
      if (data.generalComment) {
        console.log(`     💬 "${data.generalComment.substring(0, 50)}${data.generalComment.length > 50 ? '...' : ''}"`);
      }
    });

    console.log('\n✅ TESTE: Fluxo verificado');
    console.log('🔄 PRÓXIMOS PASSOS:');
    console.log('1. Execute o app');
    console.log('2. Vá para os detalhes de um serviço');  
    console.log('3. Certifique-se que activeReviewTab === "thematic"');
    console.log('4. Clique em "View All" para abrir ServiceReviews');
    console.log('5. Verifique se os reviews aparecem');

    console.log(`\n💡 DICA: Teste com o serviço "${serviceData.name}" (ID: ${firstServiceId})`);

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testServiceReviewsFlow();