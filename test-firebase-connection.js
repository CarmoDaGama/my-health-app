// Test Firebase connection and data
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function testFirebaseConnection() {
  try {
    console.log('🔥 Testando conexão Firebase...');
    const querySnapshot = await getDocs(collection(db, 'healthServices'));
    console.log(`📊 Total de documentos: ${querySnapshot.size}`);
    
    querySnapshot.forEach((doc) => {
      console.log(`📄 ${doc.id}:`, doc.data());
    });
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
  }
}

testFirebaseConnection();