/**
 * DEBUG DETALHADO: Verificar cada etapa do rendering
 */

console.log('🎯 DEBUG DETALHADO: Verificar rendering completo');
console.log('===============================================');

// Simular exatamente o que acontece no ServiceDetailScreen
const mockService = {
  id: 'Ha7CiMKH0DEEJYHbi61p',
  name: 'Hospital Américo Boavida'
};

const activeReviewTab = 'thematic'; // Como está definido no ServiceDetailScreen

console.log('\\n1️⃣ ESTADO INICIAL:');
console.log('==================');
console.log('activeReviewTab:', activeReviewTab);
console.log('service.id:', mockService.id);
console.log('service.name:', mockService.name);

console.log('\\n2️⃣ CONDIÇÃO DE RENDERIZAÇÃO:');
console.log('============================');
console.log('activeReviewTab === "thematic":', activeReviewTab === 'thematic');

if (activeReviewTab === 'thematic') {
  console.log('✅ DEVE renderizar ThematicReviewsPreview');
  
  // Simular props que seriam passadas
  const props = {
    serviceId: mockService.id,
    maxReviews: 3
  };
  
  console.log('Props que seriam passadas:', props);
  
  // Simular chamada do ThematicReviewService
  console.log('\\n3️⃣ TESTE DO SERVIÇO:');
  console.log('====================');
  
  async function testServiceCall() {
    try {
      const { initializeApp } = require('firebase/app');
      const { getFirestore, collection, getDocs, query, where, limit } = require('firebase/firestore');
      
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
      
      console.log('Simulando ThematicReviewService.getServiceReviews...');
      console.log('serviceId:', props.serviceId);
      
      // Simular o fallback query (que sabemos que funciona)
      const fallbackQ = query(
        collection(db, 'thematicReviews'),
        where('serviceId', '==', props.serviceId),
        limit(props.maxReviews)
      );
      
      console.log('Executando query fallback...');
      const snapshot = await getDocs(fallbackQ);
      console.log('Query result:', snapshot.size, 'documents');
      
      const reviews = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      console.log('Reviews processados:', reviews.length);
      
      // Simular o que o componente faria
      console.log('\\n4️⃣ SIMULAÇÃO DO COMPONENTE:');
      console.log('===========================');
      
      console.log('setIsLoading(false) - seria chamado');
      console.log('setReviews(reviews) - seria chamado com:', reviews.length, 'reviews');
      console.log('setTotalReviews(reviews.length) - seria chamado com:', reviews.length);
      
      // Simular condições de render
      console.log('\\n5️⃣ CONDIÇÕES DE RENDER:');
      console.log('========================');
      
      const isLoading = false;
      const error = null;
      
      console.log('isLoading:', isLoading);
      console.log('error:', error);
      console.log('reviews.length:', reviews.length);
      
      if (isLoading) {
        console.log('🎭 RENDERIZARIA: Loading Container');
      } else if (error) {
        console.log('🎭 RENDERIZARIA: Error Container');
      } else if (reviews.length === 0) {
        console.log('🎭 RENDERIZARIA: Empty Container ("Nenhuma avaliação temática ainda")');
        console.log('❌ ISSO EXPLICA O "No reviews yet"!');
      } else {
        console.log('🎭 RENDERIZARIA: Container com reviews');
        console.log('✅ DEVERIA mostrar os reviews!');
        
        // Simular renderização dos reviews
        console.log('\\n📋 REVIEWS QUE SERIAM RENDERIZADOS:');
        reviews.forEach((review, index) => {
          console.log(`Review ${index + 1}:`, {
            userName: review.userName,
            overallRating: review.overallRating,
            categoryCount: Object.keys(review.categoryRatings || {}).length,
            hasComment: !!review.generalComment
          });
        });
      }
      
      return reviews.length;
      
    } catch (error) {
      console.error('❌ Erro no teste do serviço:', error);
      return -1;
    }
  }
  
  testServiceCall().then(reviewCount => {
    console.log('\\n🎯 RESULTADO FINAL:');
    console.log('===================');
    
    if (reviewCount > 0) {
      console.log('✅ O serviço retorna reviews corretamente');
      console.log('✅ O componente deveria renderizar os reviews');
      console.log('\\n🔍 SE AINDA MOSTRA "No reviews yet":');
      console.log('1. Verificar se o componente ThematicReviewsPreview está sendo renderizado');
      console.log('2. Verificar se há erro de CSS escondendo o componente');
      console.log('3. Verificar se os logs aparecem no console do app');
      console.log('4. Verificar se o serviceId está correto no app real');
    } else if (reviewCount === 0) {
      console.log('❌ O serviço não retorna reviews');
      console.log('❌ Por isso aparece "No reviews yet"');
    } else {
      console.log('❌ Erro no teste do serviço');
    }
    
    process.exit(0);
  });
  
} else {
  console.log('❌ NÃO deve renderizar ThematicReviewsPreview');
  console.log('❌ Renderizaria ReviewsPreview tradicional');
  process.exit(0);
}