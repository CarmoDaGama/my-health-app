// Script de teste para funcionalidade de denúncia de avaliações
// Para executar: node test-report-review.js

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

// ATENÇÃO: Configure suas credenciais Firebase aqui
const firebaseConfig = {
  // Suas credenciais Firebase aqui
};

// Para testar:
// 1. Configure as credenciais Firebase acima
// 2. Substitua os IDs abaixo por valores reais do seu banco
const TEST_REVIEW_ID = 'SUBSTITUA_POR_ID_REAL'; // ID de uma avaliação existente
const TEST_USER_ID = 'SUBSTITUA_POR_ID_REAL';   // ID de um usuário existente

async function testReportReview() {
  try {
    console.log('🔍 Iniciando teste da funcionalidade de denúncia...');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // 1. Verificar se a avaliação existe
    console.log('📝 Verificando avaliação:', TEST_REVIEW_ID);
    const reviewRef = doc(db, 'reviews', TEST_REVIEW_ID);
    const reviewDoc = await getDoc(reviewRef);
    
    if (!reviewDoc.exists()) {
      console.log('❌ Avaliação não encontrada!');
      console.log('💡 Dica: Verifique se o TEST_REVIEW_ID está correto');
      return;
    }
    
    const reviewData = reviewDoc.data();
    console.log('✅ Avaliação encontrada:', {
      id: reviewDoc.id,
      rating: reviewData.rating,
      comment: reviewData.comment?.substring(0, 50) + '...',
      reported: reviewData.reported,
      userId: reviewData.userId
    });
    
    // 2. Verificar coleção de denúncias
    console.log('\n📋 Verificando denúncias existentes...');
    const reportQuery = query(
      collection(db, 'reportedReviews'),
      where('reviewId', '==', TEST_REVIEW_ID)
    );
    
    const reportDocs = await getDocs(reportQuery);
    console.log(`📊 Denúncias encontradas: ${reportDocs.size}`);
    
    reportDocs.forEach((doc) => {
      const data = doc.data();
      console.log('🚨 Denúncia:', {
        id: doc.id,
        reportedBy: data.reportedBy,
        status: data.status,
        reason: data.reason,
        reportedAt: data.reportedAt?.toDate?.() || 'N/A'
      });
    });
    
    // 3. Listar todas as avaliações denunciadas
    console.log('\n📊 Estatísticas gerais de denúncias...');
    const allReportsQuery = query(collection(db, 'reportedReviews'));
    const allReports = await getDocs(allReportsQuery);
    console.log(`📈 Total de denúncias no sistema: ${allReports.size}`);
    
    // Agrupar por status
    const statusCount = {};
    allReports.forEach((doc) => {
      const status = doc.data().status || 'unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    
    console.log('📈 Denúncias por status:', statusCount);
    
    console.log('\n✅ Teste de verificação concluído!');
    console.log('\n🔧 Para testar a denúncia:');
    console.log('1. Abra o app');
    console.log('2. Vá para uma tela com avaliações');
    console.log('3. Toque em "..." e selecione "Denunciar"');
    console.log('4. Execute este script novamente para verificar se foi registrada');
    
  } catch (error) {
    console.error('🚨 Erro no teste:', error);
  }
}

// Função para simular denúncia (sem Firebase Auth)
async function simulateReport() {
  try {
    console.log('\n🧪 Simulando denúncia manual...');
    console.log('⚠️  ATENÇÃO: Esta função requer configuração adicional');
    console.log('💡 Use a interface do app para testar a denúncia real');
    
    // Para implementar teste completo, seria necessário:
    // 1. Configurar Firebase Auth
    // 2. Fazer login com usuário de teste
    // 3. Chamar o método de denúncia
    
  } catch (error) {
    console.error('Erro na simulação:', error);
  }
}

console.log('🚀 Script de Teste - Denúncia de Avaliações');
console.log('==========================================');
console.log('');
console.log('📝 Para usar este script:');
console.log('1. Configure firebaseConfig com suas credenciais');
console.log('2. Substitua TEST_REVIEW_ID por um ID real');
console.log('3. Execute: node test-report-review.js');
console.log('');
console.log('⚠️  REMOVA este arquivo após o teste!');

// Descomente para executar o teste:
// testReportReview();