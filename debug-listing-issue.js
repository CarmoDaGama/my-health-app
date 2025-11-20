/**
 * DEBUG ESPECÍFICO: Por que ThematicReviewsPreview não está mostrando reviews
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

async function debugThematicReviewsListing() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('🔍 DEBUG: Por que ThematicReviewsPreview não está funcionando');
    console.log('========================================================');
    
    // 1. Verificar reviews com dados válidos
    console.log('\\n1️⃣ VERIFICANDO REVIEWS COM DADOS VÁLIDOS...');
    
    const allReviewsSnapshot = await getDocs(collection(db, 'thematicReviews'));
    console.log(`Total reviews: ${allReviewsSnapshot.size}`);
    
    const validReviews = [];
    const invalidReviews = [];
    
    allReviewsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.serviceId && data.serviceName && data.userName) {
        validReviews.push({ id: doc.id, ...data });
      } else {
        invalidReviews.push({ id: doc.id, ...data });
      }
    });
    
    console.log(`✅ Reviews VÁLIDOS: ${validReviews.length}`);
    console.log(`❌ Reviews INVÁLIDOS: ${invalidReviews.length}`);
    
    if (validReviews.length > 0) {
      console.log('\\n📋 REVIEWS VÁLIDOS POR SERVIÇO:');
      
      const serviceGroups = {};
      validReviews.forEach(review => {
        if (!serviceGroups[review.serviceId]) {
          serviceGroups[review.serviceId] = [];
        }
        serviceGroups[review.serviceId].push(review);
      });
      
      Object.entries(serviceGroups).forEach(([serviceId, reviews]) => {
        console.log(`\\n🏥 Serviço: ${reviews[0].serviceName} (ID: ${serviceId})`);
        console.log(`   📊 Total de reviews: ${reviews.length}`);
        
        reviews.forEach((review, index) => {
          console.log(`   ${index + 1}. ${review.userName}: ${review.overallRating}/5`);
          console.log(`      📅 Data: ${review.createdAt?.toDate?.() || review.createdAt}`);
          console.log(`      📝 Comentário: ${review.generalComment || 'Sem comentário'}`);
        });
      });
      
      // 2. Testar query específica como o componente faz
      console.log('\\n2️⃣ TESTANDO QUERY ESPECÍFICA...');
      
      const firstServiceId = Object.keys(serviceGroups)[0];
      console.log(`Testando query para serviceId: ${firstServiceId}`);
      
      const testQuery = query(
        collection(db, 'thematicReviews'),
        where('serviceId', '==', firstServiceId)
      );
      
      const testSnapshot = await getDocs(testQuery);
      console.log(`✅ Query retornou: ${testSnapshot.size} reviews`);
      
      testSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}. ID: ${doc.id}`);
        console.log(`      Usuário: ${data.userName}`);
        console.log(`      Nota: ${data.overallRating}`);
        console.log(`      Data tipo: ${typeof data.createdAt}`);
        console.log(`      Data valor: ${data.createdAt}`);
      });
      
    }
    
    console.log('\\n3️⃣ POSSÍVEIS PROBLEMAS:');
    console.log('a) ❓ ServiceDetailScreen não está passando serviceId correto');
    console.log('b) ❓ ThematicReviewsPreview não está sendo renderizado (activeReviewTab)');
    console.log('c) ❓ useEffect não está disparando');
    console.log('d) ❓ Erro silencioso no componente');
    console.log('e) ❓ Problemas com conversão de datas');
    
    console.log('\\n4️⃣ PRÓXIMOS PASSOS DE DEBUG:');
    console.log('1. Adicione console.log no ThematicReviewsPreview useEffect');
    console.log('2. Verifique se activeReviewTab === "thematic" no ServiceDetailScreen');  
    console.log('3. Adicione logs no ThematicReviewService.getServiceReviews');
    console.log('4. Verifique se o serviceId está sendo passado corretamente');
    
  } catch (error) {
    console.error('❌ Erro no debug:', error);
  }
}

debugThematicReviewsListing().then(() => {
  console.log('\\n✅ Debug concluído');
  process.exit(0);
}).catch(error => {
  console.error('❌ Falha no debug:', error);
  process.exit(1);
});