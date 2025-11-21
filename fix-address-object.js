import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Configurar Firebase Admin
const serviceAccount = JSON.parse(readFileSync('./firebase-service-account.json', 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function fixAddressObject() {
  console.log('🔧 Corrigindo documentos com address como object...');
  
  try {
    const docRef = db.collection('healthServices').doc('n1KbATJbQJgaDboSNDRu4E1Tmr42');
    const doc = await docRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      console.log('📋 Current document data:', JSON.stringify(data.address, null, 2));
      
      // Se address é um objeto, converter para string
      if (typeof data.address === 'object' && data.address !== null) {
        const { city, street, state } = data.address;
        const addressString = `${street || ''}, ${city || ''}, ${state || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '');
        
        await docRef.update({
          address: addressString
        });
        
        console.log('✅ Documento corrigido!');
        console.log('📍 Novo address:', addressString);
      } else {
        console.log('ℹ️ Address já é string');
      }
    } else {
      console.log('❌ Document not found');
    }
    
  } catch (error) {
    console.error('❌ Error fixing document:', error);
  }
  
  console.log('✨ Correção concluída!');
  process.exit(0);
}

fixAddressObject();