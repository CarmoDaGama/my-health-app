/**
 * ANÁLISE COMPLETA: Estrutura de dados vs Frontend
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

async function analyzeDataStructure() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('🔍 ANÁLISE COMPLETA: Dados vs Frontend');
    console.log('=====================================');
    
    // 1. Examinar estrutura dos thematic reviews
    console.log('\\n1️⃣ ESTRUTURA DOS THEMATIC REVIEWS:');
    const thematicSnapshot = await getDocs(collection(db, 'thematicReviews'));
    
    console.log(`Total thematic reviews: ${thematicSnapshot.size}`);
    
    const sampleThematic = [];
    thematicSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.serviceId && data.serviceName) { // Só dados válidos
        sampleThematic.push({
          id: doc.id,
          serviceId: data.serviceId,
          serviceName: data.serviceName,
          userName: data.userName,
          overallRating: data.overallRating,
          categoryRatings: data.categoryRatings,
          createdAt: data.createdAt,
          generalComment: data.generalComment
        });
      }
    });
    
    console.log('\\n📊 SAMPLE THEMATIC REVIEW:');
    if (sampleThematic.length > 0) {
      const sample = sampleThematic[0];
      console.log('Estrutura completa:', JSON.stringify(sample, null, 2));
      
      console.log('\\n🔑 CAMPOS CHAVE:');
      console.log(`- ID: ${sample.id}`);
      console.log(`- Service ID: ${sample.serviceId}`);
      console.log(`- Service Name: ${sample.serviceName}`);
      console.log(`- User Name: ${sample.userName}`);
      console.log(`- Overall Rating: ${sample.overallRating}`);
      console.log(`- Category Ratings: ${JSON.stringify(sample.categoryRatings)}`);
      console.log(`- Created At Type: ${typeof sample.createdAt}`);
      console.log(`- Created At Value: ${sample.createdAt}`);
      console.log(`- General Comment: ${sample.generalComment || 'null'}`);
    }
    
    // 2. Examinar estrutura dos reviews tradicionais
    console.log('\\n2️⃣ ESTRUTURA DOS REVIEWS TRADICIONAIS:');
    const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
    
    console.log(`Total traditional reviews: ${reviewsSnapshot.size}`);
    
    if (reviewsSnapshot.size > 0) {
      const sampleReview = reviewsSnapshot.docs[0];
      console.log('\\n📊 SAMPLE TRADITIONAL REVIEW:');
      console.log('Estrutura:', JSON.stringify(sampleReview.data(), null, 2));
    }
    
    // 3. Comparar serviceIds
    console.log('\\n3️⃣ COMPARAÇÃO DE SERVICE IDS:');
    
    const healthServicesSnapshot = await getDocs(collection(db, 'healthServices'));
    console.log(`Total health services: ${healthServicesSnapshot.size}`);
    
    const serviceIds = new Set();
    healthServicesSnapshot.forEach(doc => {
      serviceIds.add(doc.id);
    });
    
    console.log('\\n🏥 SERVICE IDS DISPONÍVEIS:');
    Array.from(serviceIds).slice(0, 5).forEach(id => {
      console.log(`- ${id}`);
    });
    
    console.log('\\n🎯 THEMATIC REVIEWS POR SERVICE ID:');
    sampleThematic.forEach(review => {
      const serviceExists = serviceIds.has(review.serviceId);
      console.log(`- ${review.serviceId} (${review.serviceName}): ${serviceExists ? '✅ Service exists' : '❌ Service missing'}`);
    });
    
    // 4. Testar query específica
    if (sampleThematic.length > 0) {
      const testServiceId = sampleThematic[0].serviceId;
      console.log(`\\n4️⃣ TESTE DE QUERY PARA: ${testServiceId}`);
      
      const testQuery = query(
        collection(db, 'thematicReviews'),
        where('serviceId', '==', testServiceId)
      );
      
      const testSnapshot = await getDocs(testQuery);
      console.log(`Query result: ${testSnapshot.size} documents`);
      
      testSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`Found: ${data.userName} - ${data.overallRating}/5`);
      });
    }
    
    console.log('\\n🚨 POSSÍVEIS PROBLEMAS IDENTIFICADOS:');
    console.log('=====================================');
    
    // Problema 1: ServiceDetailScreen pode estar usando reviews tradicionais
    console.log('\\n❗ PROBLEMA 1: COLLECTION INCORRETA');
    console.log('- ServiceDetailScreen pode estar consultando "reviews" em vez de "thematicReviews"');
    console.log('- Verificar se ReviewsPreview usa useReviews (collection tradicional)');
    console.log('- ThematicReviewsPreview deve usar ThematicReviewService');
    
    // Problema 2: activeReviewTab pode não estar definida corretamente
    console.log('\\n❗ PROBLEMA 2: ACTIVE REVIEW TAB');
    console.log('- activeReviewTab pode não estar como "thematic" por padrão');
    console.log('- Verificar se o componente certo está sendo renderizado');
    
    // Problema 3: Estrutura de dados incompatível
    console.log('\\n❗ PROBLEMA 3: ESTRUTURA DE DADOS');
    console.log('- ThematicReviews têm estrutura diferente de Reviews tradicionais');
    console.log('- Campos: overallRating vs rating, categoryRatings vs comment');
    
    console.log('\\n🔧 PRÓXIMAS AÇÕES:');
    console.log('1. Verificar se activeReviewTab está como "thematic" no ServiceDetailScreen');
    console.log('2. Confirmar que ThematicReviewsPreview está sendo renderizado');
    console.log('3. Adicionar logs para ver qual componente está sendo usado');
    console.log('4. Verificar se o serviceId está sendo passado corretamente');
    
  } catch (error) {
    console.error('❌ Erro na análise:', error);
  }
}

analyzeDataStructure().then(() => {
  console.log('\\n✅ Análise concluída');
  process.exit(0);
}).catch(error => {
  console.error('❌ Falha na análise:', error);
  process.exit(1);
});