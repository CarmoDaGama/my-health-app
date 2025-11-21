/**
 * LISTA DE SERVICES IDs REAIS PARA TESTAR
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCOxpoXvaG9wNRoMrSVf0o5Xdqvmm19NWY",
  authDomain: "health-app-angola.firebaseapp.com",
  projectId: "health-app-angola",
  storageBucket: "health-app-angola.firebasestorage.app",
  messagingSenderId: "435118303895",
  appId: "1:435118303895:web:8c42f4faaf46ec716117d2"
};

async function getServicesWithReviews() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('🏥 SERVICES COM THEMATIC REVIEWS DISPONÍVEIS');
    console.log('============================================');
    
    // Find all services
    const servicesSnapshot = await getDocs(collection(db, 'healthServices'));
    
    console.log(`📊 Total de services no banco: ${servicesSnapshot.size}`);
    
    // Find all thematic reviews
    const reviewsSnapshot = await getDocs(collection(db, 'thematicReviews'));
    
    console.log(`📋 Total de thematic reviews: ${reviewsSnapshot.size}`);
    
    // Agrupar reviews por serviceId
    const reviewsByService = {};
    reviewsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.serviceId) {
        if (!reviewsByService[data.serviceId]) {
          reviewsByService[data.serviceId] = [];
        }
        reviewsByService[data.serviceId].push(data);
      }
    });
    
    console.log('\\n🎯 SERVICES COM REVIEWS TEMÁTICOS:');
    console.log('===================================');
    
    for (const [serviceId, reviews] of Object.entries(reviewsByService)) {
      const firstReview = reviews[0];
      console.log(`\\n🏥 ${firstReview.serviceName}`);
      console.log(`   📍 Service ID: ${serviceId}`);
      console.log(`   📊 Total Reviews: ${reviews.length}`);
      console.log(`   👥 Users: ${reviews.map(r => r.userName).join(', ')}`);
      console.log(`   ⭐ Notas: ${reviews.map(r => r.overallRating).join(', ')}`);
      
      // Verificar se o service existe na collection services
      const serviceDoc = servicesSnapshot.docs.find(doc => doc.id === serviceId);
      if (serviceDoc) {
        const serviceData = serviceDoc.data();
        console.log(`   ✅ Service existe: ${serviceData.name}`);
        console.log(`   📱 Para testar no app: Procure por "${serviceData.name}"`);
      } else {
        console.log(`   ⚠️ Service not found in healthServices collection`);
      }
    }
    
    console.log('\\n📱 COMO TESTAR NO APP:');
    console.log('1. Execute: expo start');
    console.log('2. Search for one of the services listed above');
    console.log('3. Open service details');
    console.log('4. Verifique se a tab "Temáticas" está selecionada');
    console.log('5. Os reviews devem aparecer');
    
    console.log('\\n🔍 LOGS ESPERADOS NO CONSOLE:');
    console.log('• [ServiceDetailScreen] Renderizando Reviews Preview');
    console.log('• [ThematicReviewsPreview] Componente renderizado');
    console.log('• [ThematicReviewsPreview] useEffect disparado');
    console.log('• [ThematicReviewService] Query executada');
    console.log('• [ThematicReviewsPreview] Reviews carregados');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getServicesWithReviews().then(() => {
  console.log('\\n✅ Lista concluída');
  process.exit(0);
}).catch(error => {
  console.error('❌ Failure:', error);
  process.exit(1);
});