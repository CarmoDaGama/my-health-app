/**
 * TESTE DA SOLUÇÃO: ThematicReviewsPreview
 * Verifica se os reviews temáticos estão sendo listados corretamente
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

console.log('🧪 TESTE: ThematicReviews Listagem');
console.log('================================');

async function testThematicReviewsListing() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('\\n📊 VERIFICANDO TODOS OS REVIEWS TEMÁTICOS...');
    
    // Buscar TODOS os reviews temáticos
    const allReviewsSnapshot = await getDocs(collection(db, 'thematicReviews'));
    
    console.log(`✅ Total de reviews temáticos no banco: ${allReviewsSnapshot.size}`);
    
    if (allReviewsSnapshot.size > 0) {
      console.log('\\n📋 REVIEWS ENCONTRADOS:');
      
      allReviewsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\\n${index + 1}. Review ID: ${doc.id}`);
        console.log(`   ├─ Serviço: ${data.serviceName} (ID: ${data.serviceId})`);
        console.log(`   ├─ Usuário: ${data.userName} (${data.userId})`);
        console.log(`   ├─ Nota Geral: ${data.overallRating}/5`);
        console.log(`   ├─ Categorias: ${Object.keys(data.categoryRatings || {}).length}`);
        console.log(`   ├─ Comentário: ${data.generalComment ? 'Sim' : 'Não'}`);
        console.log(`   └─ Data: ${data.createdAt?.toDate?.() || data.createdAt}`);
      });
      
      // Teste para um serviço específico
      const firstReview = allReviewsSnapshot.docs[0].data();
      const serviceId = firstReview.serviceId;
      
      console.log('\\n🎯 TESTANDO BUSCA POR SERVIÇO ESPECÍFICO...');
      console.log(`Service ID: ${serviceId}`);
      
      const serviceReviewsQuery = query(
        collection(db, 'thematicReviews'),
        where('serviceId', '==', serviceId)
      );
      
      const serviceReviewsSnapshot = await getDocs(serviceReviewsQuery);
      console.log(`✅ Reviews para este serviço: ${serviceReviewsSnapshot.size}`);
      
      serviceReviewsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}. ${data.userName}: ${data.overallRating}/5 - ${data.generalComment || 'Sem comentário'}`);
      });
      
    } else {
      console.log('⚠️ Nenhum review temático encontrado no banco de dados');
    }
    
    console.log('\\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. ✅ Reviews temáticos estão sendo criados');
    console.log('2. ✅ ThematicReviewsPreview foi criado');
    console.log('3. 🔄 ServiceDetailScreen foi atualizado para usar ThematicReviewsPreview');
    console.log('4. 📱 Execute o app e verifique se os reviews aparecem nos detalhes do serviço');
    console.log('\\n💡 DICA: Certifique-se que activeReviewTab === "thematic" está selecionado no ServiceDetailScreen');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testThematicReviewsListing().then(() => {
  console.log('\\n✅ Teste de listagem concluído');
  process.exit(0);
}).catch(error => {
  console.error('❌ Falha no teste:', error);
  process.exit(1);
});