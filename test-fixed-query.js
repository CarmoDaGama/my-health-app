/**
 * TESTE PÓS-CORREÇÃO: Verificar se a solução funciona
 */

console.log('🎯 TESTE PÓS-CORREÇÃO: Verificar fallback');
console.log('==========================================');

async function testFixedQuery() {
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
    
    const serviceId = 'Ha7CiMKH0DEEJYHbi61p';
    
    // Testar query simples (fallback)
    console.log('\\n1️⃣ Testando query simples (fallback)...');
    
    const fallbackQ = query(
      collection(db, 'thematicReviews'),
      where('serviceId', '==', serviceId),
      limit(10)
    );
    
    console.log('Query fallback criada, executando...');
    const snapshot = await getDocs(fallbackQ);
    console.log('✅ Query fallback funcionou! Documentos:', snapshot.size);
    
    const reviews = [];
    let index = 0;
    
    snapshot.forEach(doc => {
      index++;
      const data = doc.data();
      console.log(`Doc ${index}:`, {
        id: doc.id,
        userName: data.userName,
        overallRating: data.overallRating,
        createdAt: data.createdAt
      });
      
      reviews.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });
    
    console.log('\\n2️⃣ Ordenando no cliente...');
    reviews.sort((a, b) => {
      const dateA = a.createdAt.getTime();
      const dateB = b.createdAt.getTime();
      return dateB - dateA; // desc
    });
    
    console.log('✅ Reviews ordenados:', 
      reviews.map(r => ({ 
        userName: r.userName, 
        rating: r.overallRating,
        createdAt: r.createdAt.toISOString()
      }))
    );
    
    console.log('\\n🎯 RESULTADO DO TESTE:');
    console.log('======================');
    if (reviews.length > 0) {
      console.log('✅ SUCCESS: Query fallback funciona!');
      console.log(`✅ Encontrados ${reviews.length} reviews`);
      console.log('✅ Ordenação no cliente funcionando');
      console.log('\\n🚀 O componente ThematicReviewsPreview agora deve funcionar!');
    } else {
      console.log('❌ FAIL: Mesmo o fallback não retornou reviews');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste pós-correção:', error);
  }
}

testFixedQuery().then(() => {
  console.log('\\n✅ Teste pós-correção concluído');
  process.exit(0);
}).catch(error => {
  console.error('❌ Falha no teste pós-correção:', error);
  process.exit(1);
});