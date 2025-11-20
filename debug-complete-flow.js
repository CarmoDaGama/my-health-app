/**
 * DEBUG FINAL: Teste completo do fluxo de exibição
 * Este script deve ser executado no console do navegador/app
 */

// 1. Primeiro vamos verificar se conseguimos acessar diretamente o ThematicReviewService
console.log('🎯 DEBUG FINAL: Testando fluxo completo de exibição');
console.log('====================================================');

// 2. Testar diretamente o serviço
import { ThematicReviewService } from './services/thematic-reviews';

async function testCompleteFlow() {
  try {
    console.log('\\n1️⃣ TESTE DIRETO DO SERVIÇO:');
    console.log('=============================');
    
    const serviceId = 'Ha7CiMKH0DEEJYHbi61p';
    console.log(`Testing service: ${serviceId}`);
    
    const result = await ThematicReviewService.getServiceReviews(serviceId, undefined, 10);
    
    console.log('✅ Resultado do serviço:', {
      reviewCount: result.reviews.length,
      reviews: result.reviews.map(r => ({
        id: r.id,
        userName: r.userName,
        rating: r.overallRating,
        categories: Object.keys(r.categoryRatings).length
      }))
    });
    
    if (result.reviews.length === 0) {
      console.log('❌ PROBLEMA: Serviço não retornou reviews');
      
      // Testar query direta no Firebase
      console.log('\\n2️⃣ TESTE DIRETO NO FIREBASE:');
      
      const { initializeApp } = await import('firebase/app');
      const { getFirestore, collection, getDocs, query, where } = await import('firebase/firestore');
      
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
      
      const testQuery = query(
        collection(db, 'thematicReviews'),
        where('serviceId', '==', serviceId)
      );
      
      const snapshot = await getDocs(testQuery);
      console.log(`Firebase direto retornou: ${snapshot.size} documentos`);
      
      snapshot.forEach(doc => {
        console.log('Firebase doc:', doc.id, doc.data());
      });
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Exportar função para uso no console
window.testCompleteFlow = testCompleteFlow;

console.log('✅ Script carregado. Execute: testCompleteFlow() no console do app.');

export { testCompleteFlow };