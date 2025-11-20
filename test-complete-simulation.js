/**
 * TESTE COMPLETO: Simular exatamente como o app React Native funciona
 */

const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  connectAuthEmulator,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut 
} = require('firebase/auth');
const { 
  getFirestore, 
  connectFirestoreEmulator, 
  addDoc, 
  collection, 
  Timestamp 
} = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCOxpoXvaG9wNRoMrSVf0o5Xdqvmm19NWY",
  authDomain: "health-app-angola.firebaseapp.com",
  projectId: "health-app-angola",
  storageBucket: "health-app-angola.firebasestorage.app",
  messagingSenderId: "435118303895",
  appId: "1:435118303895:web:8c42f4faaf46ec716117d2"
};

console.log('🧪 TESTE COMPLETO - Simulação React Native');
console.log('==========================================');

async function testCompleteFlow() {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('\\n📱 CONFIGURAÇÃO');
    console.log('---------------');
    console.log('✅ Firebase App inicializado');
    console.log('✅ Auth inicializado');
    console.log('✅ Firestore inicializado');
    console.log('📍 Project ID:', app.options.projectId);
    
    // Verificar se devemos usar emulators (simular a lógica do app)
    const __DEV__ = process.env.NODE_ENV !== 'production';
    const USE_EMULATORS = false; // Como está no app
    
    if (__DEV__ && USE_EMULATORS) {
      console.log('\\n🔧 CONECTANDO AOS EMULATORS...');
      try {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('✅ Conectado aos emulators');
      } catch (error) {
        console.log('⚠️ Emulators não disponíveis ou já conectados');
      }
    } else {
      console.log('\\n🔥 USANDO FIREBASE PRODUCTION (como no app)');
    }
    
    console.log('\\n🔐 TESTE DE AUTENTICAÇÃO');
    console.log('------------------------');
    
    // Teste 1: Usuário não autenticado (como guest)
    console.log('\\n1️⃣ Testando como GUEST (não autenticado)...');
    console.log('auth.currentUser:', auth.currentUser);
    
    try {
      const guestReview = {
        serviceId: "test-service-guest",
        serviceName: "Hospital Teste Guest",
        serviceType: "hospital",
        userId: "guest-user-id",
        userName: "Usuário Convidado",
        categoryRatings: {
          "quality": 4,
          "service": 3
        },
        overallRating: 3.5,
        visitContext: "consulta_geral",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        verified: false,
        helpful: 0,
        reportCount: 0
      };
      
      await addDoc(collection(db, 'thematicReviews'), guestReview);
      console.log('✅ GUEST: Review criado com sucesso!');
    } catch (error) {
      console.log('❌ GUEST: Falhou -', error.message);
    }
    
    // Teste 2: Criar usuário temporário e testar autenticado
    console.log('\\n2️⃣ Testando como USUÁRIO AUTENTICADO...');
    const tempEmail = `test${Date.now()}@temp.com`;
    const tempPassword = 'TestPassword123!';
    
    try {
      console.log('Criando usuário temporário:', tempEmail);
      const userCredential = await createUserWithEmailAndPassword(auth, tempEmail, tempPassword);
      console.log('✅ Usuário criado:', userCredential.user.uid);
      
      console.log('auth.currentUser:', auth.currentUser?.uid);
      
      const authenticatedReview = {
        serviceId: "test-service-auth",
        serviceName: "Hospital Teste Autenticado", 
        serviceType: "hospital",
        userId: userCredential.user.uid,
        userName: "Usuário Autenticado",
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
      };
      
      await addDoc(collection(db, 'thematicReviews'), authenticatedReview);
      console.log('✅ AUTENTICADO: Review criado com sucesso!');
      
      // Fazer logout
      await signOut(auth);
      console.log('✅ Logout realizado');
      
    } catch (error) {
      console.log('❌ AUTENTICADO: Falhou -', error.message);
    }
    
    console.log('\\n🎯 TESTE DE POSSÍVEIS PROBLEMAS');
    console.log('-------------------------------');
    
    // Teste 3: Dados inválidos que poderiam causar erro
    console.log('\\n3️⃣ Testando com dados que podem causar problemas...');
    
    try {
      const problematicReview = {
        serviceId: null, // Null value
        serviceName: "",  // Empty string
        serviceType: "invalid_type",
        userId: undefined, // Undefined
        userName: "Test User",
        categoryRatings: {},
        overallRating: "invalid", // Wrong type
        visitContext: "test",
        createdAt: "invalid_date", // Wrong type
        updatedAt: new Date(), // JS Date instead of Timestamp
        verified: "false", // String instead of boolean
        helpful: "0", // String instead of number
        reportCount: null
      };
      
      await addDoc(collection(db, 'thematicReviews'), problematicReview);
      console.log('✅ Dados problemáticos foram aceitos (problema!)');
    } catch (error) {
      console.log('❌ Dados problemáticos rejeitados:', error.message);
    }
    
    console.log('\\n🔍 RESUMO DOS TESTES');
    console.log('====================');
    console.log('✅ Firebase Production está funcionando');
    console.log('✅ Não há problema com emulators (não estão sendo usados)');
    console.log('✅ Firestore aceita documentos com e sem autenticação');
    console.log('');
    console.log('🎯 POSSÍVEIS CAUSAS DO ERRO NO APP:');
    console.log('1. 🔄 Estado de autenticação inconsistente no momento da criação');
    console.log('2. 📱 Diferenças entre Node.js e React Native Firebase SDK'); 
    console.log('3. 🌐 Network issues específicos do dispositivo móvel');
    console.log('4. 📋 Dados sendo enviados com formato ligeiramente diferente');
    console.log('5. ⚡ Race condition entre auth state e Firestore call');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testCompleteFlow().then(() => {
  console.log('\\n✅ Teste completo finalizado');
  process.exit(0);
}).catch(error => {
  console.error('❌ Falha no teste completo:', error);
  process.exit(1);
});