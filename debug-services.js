const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase config - usar as mesmas credenciais do projeto
const firebaseConfig = {
  apiKey: "AIzaSyCOxpoXvaG9wNRoMrSVf0o5Xdqvmm19NWY",
  authDomain: "health-app-angola.firebaseapp.com",
  projectId: "health-app-angola",
  storageBucket: "health-app-angola.firebasestorage.app",
  messagingSenderId: "435118303895",
  appId: "1:435118303895:web:8c42f4faaf46ec716117d2"
};

async function testFirebaseConnection() {
  try {
    console.log('🔧 Inicializando Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('📡 Testando conexão com Firestore...');
    const querySnapshot = await getDocs(collection(db, 'healthServices'));
    
    console.log(`📊 Total de documentos na coleção: ${querySnapshot.size}`);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📄 ID: ${doc.id}`);
      console.log(`📝 Nome: ${data.name || 'N/A'}`);
      console.log(`🏥 Tipo: ${data.type || 'N/A'}`);
      console.log(`✅ Verificado: ${data.verified !== undefined ? data.verified : 'N/A'}`);
      console.log(`📊 Status: ${data.status !== undefined ? data.status : 'N/A'}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testFirebaseConnection();
