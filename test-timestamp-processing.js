/**
 * COMPLETE TEST: Verify timestamp and data structure
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

async function testTimestampProcessing() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('🔍 TESTE COMPLETO: Timestamp e Estrutura');
    console.log('=======================================');
    
    const serviceId = 'Ha7CiMKH0DEEJYHbi61p';
    
    // Find reviews
    const q = query(
      collection(db, 'thematicReviews'),
      where('serviceId', '==', serviceId)
    );
    
    const snapshot = await getDocs(q);
    console.log(`Total de docs encontrados: ${snapshot.size}`);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('\\n📄 DOCUMENTO:', doc.id);
      console.log('================');
      
      // Verificar cada campo
      console.log('serviceId:', typeof data.serviceId, data.serviceId);
      console.log('serviceName:', typeof data.serviceName, data.serviceName);
      console.log('userName:', typeof data.userName, data.userName);
      console.log('overallRating:', typeof data.overallRating, data.overallRating);
      console.log('categoryRatings:', typeof data.categoryRatings, data.categoryRatings);
      
      // Testar conversão de timestamp
      console.log('\\n🕐 TIMESTAMP ANALYSIS:');
      console.log('createdAt type:', typeof data.createdAt);
      console.log('createdAt value:', data.createdAt);
      
      if (data.createdAt && typeof data.createdAt === 'object') {
        console.log('createdAt properties:', Object.keys(data.createdAt));
        
        // Testar conversão
        try {
          if (data.createdAt.toDate) {
            const convertedDate = data.createdAt.toDate();
            console.log('✅ toDate() successful:', convertedDate);
          } else {
            console.log('❌ No toDate() method');
          }
        } catch (error) {
          console.error('❌ Error converting timestamp:', error);
        }
      }
      
      // Verificar estrutura de categoryRatings
      console.log('\\n📊 CATEGORY RATINGS:');
      if (data.categoryRatings && typeof data.categoryRatings === 'object') {
        console.log('categoryRatings keys:', Object.keys(data.categoryRatings));
        console.log('categoryRatings values:', Object.values(data.categoryRatings));
        
        Object.entries(data.categoryRatings).forEach(([key, value]) => {
          console.log(`  ${key}: ${typeof value} = ${value}`);
        });
      }
      
      // Simular processamento como no serviço
      console.log('\\n🔄 SIMULAR PROCESSAMENTO:');
      try {
        const processedReview = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
        
        console.log('✅ Processamento bem-sucedido:', {
          id: processedReview.id,
          userName: processedReview.userName,
          overallRating: processedReview.overallRating,
          createdAt: processedReview.createdAt,
          categoryCount: Object.keys(processedReview.categoryRatings || {}).length
        });
        
      } catch (error) {
        console.error('❌ Erro no processamento:', error);
      }
    });
    
    // Testar simulação da query do serviço
    console.log('\\n🎯 SIMULAÇÃO DA QUERY DO SERVIÇO:');
    console.log('==================================');
    
    try {
      // Simular exatamente o que o serviço faz
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
      
      console.log('📊 Reviews processados:', reviews.length);
      reviews.forEach((review, index) => {
        console.log(`Review ${index + 1}:`, {
          id: review.id,
          userName: review.userName,
          overallRating: review.overallRating,
          createdAt: review.createdAt instanceof Date ? 'Valid Date' : 'Invalid Date'
        });
      });
      
      if (reviews.length === 0) {
        console.log('❌ PROBLEMA IDENTIFICADO: Reviews não estão sendo processados corretamente');
      } else {
        console.log('✅ Reviews processados com sucesso!');
      }
      
    } catch (error) {
      console.error('❌ Erro na simulação:', error);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testTimestampProcessing().then(() => {
  console.log('\\n✅ Teste concluído');
  process.exit(0);
}).catch(error => {
  console.error('❌ Falha no teste:', error);
  process.exit(1);
});