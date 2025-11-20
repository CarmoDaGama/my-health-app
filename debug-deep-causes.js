/**
 * DEBUG PROFUNDO: Investigar causas alternativas do erro
 */

const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore, addDoc, collection } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCOxpoXvaG9wNRoMrSVf0o5Xdqvmm19NWY",
  authDomain: "health-app-angola.firebaseapp.com",
  projectId: "health-app-angola",
  storageBucket: "health-app-angola.firebasestorage.app",
  messagingSenderId: "435118303895",
  appId: "1:435118303895:web:8c42f4faaf46ec716117d2"
};

console.log('🔍 INVESTIGAÇÃO PROFUNDA: Outras Causas Possíveis');
console.log('=================================================');

async function investigateDeepCauses() {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('\\n📋 TESTE 1: Configuração do Firebase');
    console.log('-------------------------------------');
    console.log('✅ Project ID:', app.options.projectId);
    console.log('✅ Auth Domain:', app.options.authDomain);
    console.log('✅ App Name:', app.name);
    
    console.log('\\n📋 TESTE 2: Diferentes Tipos de Dados');
    console.log('--------------------------------------');
    
    // Test com dados MÍNIMOS
    console.log('\\nTestando com dados MÍNIMOS...');
    try {
      const minimalData = {
        test: 'minimal'
      };
      await addDoc(collection(db, 'thematicReviews'), minimalData);
      console.log('✅ Dados mínimos FUNCIONARAM');
    } catch (error) {
      console.log('❌ Dados mínimos FALHARAM:', error.message);
    }
    
    // Test com Date objects
    console.log('\\nTestando com Date objects...');
    try {
      const dateData = {
        test: 'date',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await addDoc(collection(db, 'thematicReviews'), dateData);
      console.log('✅ Date objects FUNCIONARAM');
    } catch (error) {
      console.log('❌ Date objects FALHARAM:', error.message);
    }
    
    // Test com objetos complexos
    console.log('\\nTestando com objetos complexos...');
    try {
      const complexData = {
        test: 'complex',
        categoryRatings: {
          quality: 4,
          service: 5
        },
        visitContext: {
          date: new Date(),
          type: 'consultation'
        }
      };
      await addDoc(collection(db, 'thematicReviews'), complexData);
      console.log('✅ Objetos complexos FUNCIONARAM');
    } catch (error) {
      console.log('❌ Objetos complexos FALHARAM:', error.message);
    }
    
    console.log('\\n📋 TESTE 3: Diferentes Collections');
    console.log('-----------------------------------');
    
    // Test em collection diferente
    console.log('\\nTestando collection alternativa...');
    try {
      await addDoc(collection(db, 'testCollection'), { test: 'alternative' });
      console.log('✅ Collection alternativa FUNCIONOU');
    } catch (error) {
      console.log('❌ Collection alternativa FALHOU:', error.message);
    }
    
    // Test na collection reviews normal
    console.log('\\nTestando collection reviews...');
    try {
      await addDoc(collection(db, 'reviews'), { test: 'reviews' });
      console.log('✅ Collection reviews FUNCIONOU');
    } catch (error) {
      console.log('❌ Collection reviews FALHOU:', error.message);
    }
    
    console.log('\\n📋 TESTE 4: Verificação de Quota/Limits');
    console.log('----------------------------------------');
    
    // Multiple rapid calls para testar rate limiting
    console.log('\\nTestando multiple calls rápidas...');
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(
        addDoc(collection(db, 'thematicReviews'), { test: `rapid_${i}` })
          .then(() => console.log(`✅ Rapid call ${i} SUCCESS`))
          .catch(error => console.log(`❌ Rapid call ${i} FAILED:`, error.message))
      );
    }
    await Promise.all(promises);
    
    console.log('\\n🔍 ANÁLISE DE POSSÍVEIS CAUSAS');
    console.log('===============================');
    
    console.log('\\n🎯 CAUSA 1: EMULATORS');
    console.log('• Se app está conectado aos emulators do Firebase');
    console.log('• Verificar se emulators estão rodando');
    console.log('• Verificar configuração de host/porta');
    
    console.log('\\n🎯 CAUSA 2: BILLING/QUOTA');
    console.log('• Projeto Firebase pode ter atingido quota gratuita');
    console.log('• Billing pode estar desabilitado');
    console.log('• Rate limiting por excesso de requests');
    
    console.log('\\n🎯 CAUSA 3: CONFIGURAÇÃO FIRESTORE');
    console.log('• Database não foi criado ainda');
    console.log('• Database está em modo Native vs Datastore');
    console.log('• Região do database incompatível');
    
    console.log('\\n🎯 CAUSA 4: NETWORK/CONECTIVIDADE');
    console.log('• Firewall bloqueando Firebase');
    console.log('• DNS issues com googleapis.com');
    console.log('• Proxy/VPN interferindo');
    
    console.log('\\n🎯 CAUSA 5: VERSÃO SDK/DEPENDÊNCIAS');
    console.log('• Versão incompatível do Firebase SDK');
    console.log('• Conflitos de dependências');
    console.log('• Node version issues');
    
    console.log('\\n🎯 CAUSA 6: DADOS ESPECÍFICOS');
    console.log('• Algum campo específico do ThematicReview causando erro');
    console.log('• Tipos de dados não suportados');
    console.log('• Tamanho do documento muito grande');
    
  } catch (error) {
    console.error('❌ Erro na investigação:', error);
  }
}

investigateDeepCauses().then(() => {
  console.log('\\n✅ Investigação concluída');
  process.exit(0);
}).catch(error => {
  console.error('❌ Falha na investigação:', error);
  process.exit(1);
});