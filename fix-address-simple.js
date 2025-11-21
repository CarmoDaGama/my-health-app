import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBql0nG9Spe9hPrSOQJQczgJhfBpOl1Ryg",
  authDomain: "myhealth-ee3e3.firebaseapp.com", 
  projectId: "myhealth-ee3e3",
  storageBucket: "myhealth-ee3e3.appspot.com",
  messagingSenderId: "43856123658",
  appId: "1:43856123658:web:dcd6b5101322fd98d37b3a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixAddressObject() {
  console.log('🔧 Corrigindo documentos com address como object...');
  
  try {
    const docRef = doc(db, 'healthServices', 'n1KbATJbQJgaDboSNDRu4E1Tmr42');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('📋 Dados atuais do documento:');
      console.log('Address atual:', data.address);
      console.log('Tipo do address:', typeof data.address);
      
      // If address is an object, convert to string
      if (typeof data.address === 'object' && data.address !== null) {
        const { city, street, state } = data.address;
        const addressString = `${street || ''}, ${city || ''}, ${state || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '');
        
        await updateDoc(docRef, {
          address: addressString
        });
        
        console.log('✅ Documento corrigido!');
        console.log('📍 Novo address:', addressString);
      } else {
        console.log('ℹ️ Address is already a string:', data.address);
      }
    } else {
      console.log('❌ Document not found');
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir documento:', error);
  }
  
  console.log('✨ Correção concluída!');
}

fixAddressObject();