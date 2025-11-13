// Test Firebase connection and check users data
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function testUsersData() {
  try {
    console.log('🔥 Testando conexão Firebase...');
    
    // Verificar coleção users
    console.log('\n👥 Verificando coleção users:');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`📊 Total de usuários: ${usersSnapshot.size}`);
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      console.log(`👤 Usuário ${doc.id}:`, {
        name: userData.name,
        email: userData.email,
        userType: userData.userType,
        isActive: userData.isActive,
        isVerified: userData.isVerified,
        createdAt: userData.createdAt?.toDate?.() || userData.createdAt
      });
    });
    
    // Verificar coleção healthServices
    console.log('\n🏥 Verificando coleção healthServices:');
    const servicesSnapshot = await getDocs(collection(db, 'healthServices'));
    console.log(`📊 Total de serviços: ${servicesSnapshot.size}`);
    
    servicesSnapshot.forEach((doc) => {
      const serviceData = doc.data();
      console.log(`🏥 Serviço ${doc.id}:`, {
        name: serviceData.name,
        serviceType: serviceData.serviceType,
        createdBy: serviceData.createdBy,
        status: serviceData.status
      });
    });
    
    // Verificar coleção registeredServices (aguardando aprovação)
    console.log('\n⏳ Verificando coleção registeredServices:');
    const registeredSnapshot = await getDocs(collection(db, 'registeredServices'));
    console.log(`📊 Total de serviços registrados: ${registeredSnapshot.size}`);
    
    registeredSnapshot.forEach((doc) => {
      const regData = doc.data();
      console.log(`⏳ Registro ${doc.id}:`, {
        name: regData.name,
        serviceType: regData.serviceType,
        createdBy: regData.createdBy,
        status: regData.status,
        verified: regData.verified
      });
    });
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
  }
}

testUsersData();