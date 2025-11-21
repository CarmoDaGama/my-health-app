import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBODvnmoIBdy24iTvM5CW-SNaaj2tO2wPM",
  authDomain: "myhealth-ee3e3.firebaseapp.com",
  projectId: "myhealth-ee3e3",
  storageBucket: "myhealth-ee3e3.firebasestorage.app",
  messagingSenderId: "1081633508088",
  appId: "1:1081633508088:web:a43940e49c79b51d6bc4f3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugServiceData() {
  console.log('🔍 Checking service data structure...');
  
  try {
    const servicesSnapshot = await getDocs(collection(db, 'healthServices'));
    console.log(`📋 Analyzing ${servicesSnapshot.size} services:`);
    
    servicesSnapshot.forEach((doc, index) => {
      const data = doc.data();
      
      // Check critical data types
      const problematicFields = [];
      
      if (typeof data.name !== 'string' && data.name !== undefined) {
        problematicFields.push(`name: ${typeof data.name} (${JSON.stringify(data.name)})`);
      }
      
      if (typeof data.address !== 'string' && data.address !== undefined) {
        problematicFields.push(`address: ${typeof data.address} (${JSON.stringify(data.address)})`);
      }
      
      if (typeof data.phone !== 'string' && data.phone !== undefined) {
        problematicFields.push(`phone: ${typeof data.phone} (${JSON.stringify(data.phone)})`);
      }
      
      if (typeof data.email !== 'string' && data.email !== undefined) {
        problematicFields.push(`email: ${typeof data.email} (${JSON.stringify(data.email)})`);
      }
      
      if (typeof data.specialty !== 'string' && data.specialty !== undefined) {
        problematicFields.push(`specialty: ${typeof data.specialty} (${JSON.stringify(data.specialty)})`);
      }
      
      if (typeof data.description !== 'string' && data.description !== undefined) {
        problematicFields.push(`description: ${typeof data.description} (${JSON.stringify(data.description)})`);
      }
      
      if (data.services && !Array.isArray(data.services)) {
        problematicFields.push(`services: ${typeof data.services} (${JSON.stringify(data.services)})`);
      }
      
      // Verificar array services
      if (Array.isArray(data.services)) {
        data.services.forEach((service, serviceIndex) => {
          if (typeof service !== 'string') {
            problematicFields.push(`services[${serviceIndex}]: ${typeof service} (${JSON.stringify(service)})`);
          }
        });
      }
      
      if (problematicFields.length > 0) {
        console.log(`⚠️ Documento ${doc.id} tem problemas:`, problematicFields);
      } else {
        console.log(`✅ Document ${doc.id} is OK`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error);
  }
  
  console.log('✨ Verification completed!');
  process.exit(0);
}

debugServiceData();