/**
 * TESTE COM DADOS REAIS DO THEMATIC REVIEW
 */

const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore, addDoc, collection, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCOxpoXvaG9wNRoMrSVf0o5Xdqvmm19NWY",
  authDomain: "health-app-angola.firebaseapp.com",
  projectId: "health-app-angola",
  storageBucket: "health-app-angola.firebasestorage.app",
  messagingSenderId: "435118303895",
  appId: "1:435118303895:web:8c42f4faaf46ec716117d2"
};

console.log('🧪 TESTE COM DADOS REAIS DO THEMATIC REVIEW');
console.log('============================================');

async function testRealThematicReviewData() {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    // Simulando exatamente os dados que o app envia
    const realThematicReviewData = {
      serviceId: "test-service-123",
      serviceName: "Hospital Central de Luanda",
      serviceType: "hospital",
      userId: "test-user-123", 
      userName: "João Silva",
      categoryRatings: {
        "quality": 4,
        "service": 5,
        "facilities": 3,
        "accessibility": 4,
        "pricing": 3
      },
      overallRating: 3.8,
      visitContext: "consulta_geral",
      generalComment: "Serviço bom mas com algumas melhorias necessárias",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      verified: false,
      helpful: 0,
      reportCount: 0,
      userAvatar: null
    };
    
    console.log('\\n📤 Enviando dados reais do Thematic Review...');
    console.log('Dados:', JSON.stringify(realThematicReviewData, null, 2));
    
    const docRef = await addDoc(collection(db, 'thematicReviews'), realThematicReviewData);
    console.log('\\n✅ SUCESSO! Thematic Review criado com ID:', docRef.id);
    
    // Testando também sem alguns campos opcionais
    console.log('\\n📤 Testando sem campos opcionais...');
    const minimalThematicReview = {
      serviceId: "test-service-456",
      serviceName: "Clínica São Paulo",
      serviceType: "clinica",
      userId: "test-user-456",
      userName: "Maria Santos",
      categoryRatings: {
        "quality": 5,
        "service": 4
      },
      overallRating: 4.5,
      visitContext: "urgencia",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      verified: false,
      helpful: 0,
      reportCount: 0
      // generalComment e userAvatar omitidos intencionalmente
    };
    
    const docRef2 = await addDoc(collection(db, 'thematicReviews'), minimalThematicReview);
    console.log('✅ SUCESSO! Thematic Review mínimo criado com ID:', docRef2.id);
    
    console.log('\\n🎯 CONCLUSÃO: ThematicReviews está funcionando perfeitamente!');
    console.log('');
    console.log('✅ Dados completos: FUNCIONARAM');
    console.log('✅ Dados mínimos: FUNCIONARAM'); 
    console.log('✅ Timestamps: FUNCIONARAM');
    console.log('✅ Objetos aninhados: FUNCIONARAM');
    console.log('');
    console.log('🔍 O erro deve estar em outro lugar!');
    console.log('Possíveis causas:');
    console.log('1. 🎯 AUTHENTICATION STATE no app mobile');
    console.log('2. 🎯 NETWORK/CONNECTIVITY issues no device');
    console.log('3. 🎯 EMULATOR configuration no app');
    console.log('4. 🎯 EXPO/React Native Firebase setup');
    console.log('5. 🎯 TIMING issues (auth not ready when calling)');
    
  } catch (error) {
    console.error('❌ Erro:', error);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
  }
}

testRealThematicReviewData().then(() => {
  console.log('\\n✅ Teste concluído');
  process.exit(0);
}).catch(error => {
  console.error('❌ Falha no teste:', error);
  process.exit(1);
});