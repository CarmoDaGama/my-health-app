/**
 * Teste para verificar dados inconsistentes no Firebase
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  limit,
  getDocs 
} from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC5H3GuVWYBm52TuRNeJ6bPmwBwRPCS2xE",
  authDomain: "health-app-angola.firebaseapp.com",
  projectId: "health-app-angola",
  storageBucket: "health-app-angola.firebasestorage.app",
  messagingSenderId: "180853682005",
  appId: "1:180853682005:web:696aed81a98e5b43bb0f02"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDataConsistency() {
  console.log('🔍 Verificando consistência de dados...\n');
  
  try {
    // Verificar healthServices
    const healthServicesQuery = query(collection(db, 'healthServices'), limit(10));
    const healthSnapshot = await getDocs(healthServicesQuery);
    
    console.log(`📋 Verificando ${healthSnapshot.size} serviços em healthServices:`);
    
    let inconsistentCount = 0;
    
    healthSnapshot.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      
      const issues = [];
      
      // Verificar tipos de dados
      if (typeof data.name !== 'string' && data.name !== undefined) {
        issues.push(`name: ${typeof data.name} (${JSON.stringify(data.name)})`);
      }
      
      if (typeof data.address !== 'string' && data.address !== undefined) {
        issues.push(`address: ${typeof data.address} (${JSON.stringify(data.address)})`);
      }
      
      if (typeof data.city !== 'string' && data.city !== undefined) {
        issues.push(`city: ${typeof data.city} (${JSON.stringify(data.city)})`);
      }
      
      if (typeof data.specialty !== 'string' && data.specialty !== undefined) {
        issues.push(`specialty: ${typeof data.specialty} (${JSON.stringify(data.specialty)})`);
      }
      
      if (!Array.isArray(data.services) && data.services !== undefined) {
        issues.push(`services: ${typeof data.services} (${JSON.stringify(data.services)})`);
      }
      
      if (issues.length > 0) {
        inconsistentCount++;
        console.log(`⚠️ Documento ${id} tem problemas:`, issues);
      }
    });
    
    if (inconsistentCount === 0) {
      console.log('✅ Todos os dados estão consistentes!');
    } else {
      console.log(`❌ Encontrados ${inconsistentCount} documentos com problemas de tipo.`);
    }
    
  } catch (error) {
    console.error('Erro na verificação:', error);
  }
}

checkDataConsistency().then(() => {
  console.log('\n✨ Verificação concluída!');
  process.exit(0);
}).catch(error => {
  console.error('Erro:', error);
  process.exit(1);
});