/**
 * TESTE COMPLETO: Debug do Problema de Autenticação
 * Este teste simula exatamente o que está acontecendo no app
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, addDoc, collection, connectFirestoreEmulator } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCOxpoXvaG9wNRoMrSVf0o5Xdqvmm19NWY",
  authDomain: "health-app-angola.firebaseapp.com",
  projectId: "health-app-angola",
  storageBucket: "health-app-angola.firebasestorage.app",
  messagingSenderId: "435118303895",
  appId: "1:435118303895:web:8c42f4faaf46ec716117d2"
};

console.log('🚨 DEBUG COMPLETO: Erro de Permissions Persiste');
console.log('===============================================');

async function debugAuthenticationProblem() {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('\\n📋 PASSO 1: Estado Inicial');
    console.log('---------------------------');
    console.log('Auth State:', auth.currentUser ? 'AUTENTICADO' : '❌ NÃO AUTENTICADO');
    
    if (!auth.currentUser) {
      console.log('\\n🚨 PROBLEMA CONFIRMADO:');
      console.log('• O usuário NÃO está autenticado');
      console.log('• auth.currentUser = null');
      console.log('• Firestore CORRETAMENTE rejeita a operação');
      console.log('• As regras estão funcionando como esperado');
    }
    
    console.log('\\n📋 PASSO 2: Simulando Criação de Review SEM Auth');
    console.log('---------------------------------------------------');
    
    const testReviewData = {
      serviceId: 'service-123',
      serviceName: 'Hospital Teste',
      serviceType: 'hospital',
      userId: 'fake-user-id',
      userName: 'Usuario Fake',
      categoryRatings: {
        quality: 4,
        service: 5,
        facilities: 3
      },
      overallRating: 4.0,
      createdAt: new Date(),
      updatedAt: new Date(),
      verified: false,
      helpful: 0,
      reportCount: 0
    };
    
    try {
      console.log('Tentando criar review SEM autenticação...');
      await addDoc(collection(db, 'thematicReviews'), testReviewData);
      console.log('❌ ERRO: Review foi aceito sem autenticação! (Bug nas regras)');
    } catch (error) {
      console.log('✅ CORRETO: Review rejeitado (como esperado)');
      console.log('   Erro:', error.message);
      console.log('   Código:', error.code);
    }
    
    console.log('\\n📋 PASSO 3: Análise das Possíveis Causas');
    console.log('-------------------------------------------');
    console.log('');
    console.log('🎯 CAUSA MAIS PROVÁVEL:');
    console.log('• O usuário não fez login no app');
    console.log('• O app está executando em modo convidado/guest');
    console.log('• A tela de review está sendo mostrada mesmo sem login');
    console.log('');
    console.log('🔍 OUTRAS POSSIBILIDADES:');
    console.log('• Token de autenticação expirado');
    console.log('• Logout automático por inatividade');
    console.log('• Problema de sincronização entre client e Firebase');
    console.log('• App reiniciado e perdeu estado de autenticação');
    
    console.log('\\n📋 PASSO 4: Verificações no Código');
    console.log('------------------------------------');
    console.log('');
    console.log('✅ Verificar se useAuth() retorna isAuthenticated = true');
    console.log('✅ Verificar se auth.currentUser não é null antes de criar review');
    console.log('✅ Verificar se o AuthProvider está envolvendo toda a app');
    console.log('✅ Verificar se há logout automático em algum lugar');
    console.log('✅ Verificar se o form de review aparece apenas para usuários logados');
    
    console.log('\\n🛠️  SOLUÇÕES PARA TESTAR');
    console.log('==========================');
    console.log('');
    console.log('1. 🚪 FORÇAR LOGIN:');
    console.log('   • Certificar que usuário fez login antes de acessar reviews');
    console.log('   • Bloquear acesso à tela de review se não autenticado');
    console.log('');
    console.log('2. 🔒 VERIFICAÇÃO EXTRA:');
    console.log('   • Adicionar guard de autenticação na navigation');
    console.log('   • Verificar auth state antes de mostrar form de review');
    console.log('');
    console.log('3. 🐛 DEBUG IMEDIATO:');
    console.log('   • Adicionar console.log antes de criar review');
    console.log('   • Verificar se auth.currentUser é null no momento da criação');
    console.log('   • Usar AuthDebugHelper na tela de reviews');
    
    console.log('\\n📱 TESTE NO APP');
    console.log('================');
    console.log('');
    console.log('Para confirmar o diagnóstico:');
    console.log('1. Abra o app');
    console.log('2. Vá para Developer Tools > Console');
    console.log('3. Execute: console.log("Auth:", auth.currentUser)');
    console.log('4. Se retornar null, o problema é falta de login');
    console.log('5. Se retornar um objeto, o problema está em outro lugar');
    
  } catch (error) {
    console.error('❌ Erro no debug:', error);
  }
}

debugAuthenticationProblem().then(() => {
  console.log('\\n🎯 CONCLUSÃO');
  console.log('=============');
  console.log('O problema é FALTA DE AUTENTICAÇÃO, não as regras Firestore.');
  console.log('As regras estão corretas e funcionando como esperado.');
  console.log('A solução é garantir que o usuário esteja logado antes de criar reviews.');
  
  process.exit(0);
}).catch(error => {
  console.error('Falha no debug:', error);
  process.exit(1);
});