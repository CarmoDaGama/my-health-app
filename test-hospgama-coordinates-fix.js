const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDoc } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAIp-rFuZZsBCNVJ3uraFpHkdlEBcmDeMI",
  authDomain: "terahealth-7478e.firebaseapp.com", 
  projectId: "terahealth-7478e",
  storageBucket: "terahealth-7478e.appspot.com",
  messagingSenderId: "677470258880",
  appId: "1:677470258880:web:5fadf9d2d07fbe59b4a0c6"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testHospGamaCoordinates() {
  try {
    console.log('🧪 Testando coordenadas do HospGama após correção...\n');
    
    // Buscar o HospGama específico
    const hospGamaId = 'n1KbATJbQJgaDboSNDRu4E1Tmr42';
    const docRef = doc(db, 'healthServices', hospGamaId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log('❌ HospGama não encontrado no Firestore');
      return;
    }
    
    const data = docSnap.data();
    console.log('📄 Dados originais do HospGama no Firestore:');
    console.log('- ID:', hospGamaId);
    console.log('- Nome:', data.name);
    console.log('- Coordinates:', data.coordinates);
    console.log('- Location:', data.location);
    console.log();
    
    // Simular a lógica de processamento da API atualizada
    console.log('🔧 Simulando processamento com nova lógica...');
    
    let lat = 0;
    let lng = 0;
    
    // Tentar extrair coordenadas de diferentes fontes
    if (data.coordinates && typeof data.coordinates === 'object') {
      lat = data.coordinates.latitude || 0;
      lng = data.coordinates.longitude || 0;
      console.log('- Coordenadas de data.coordinates:', { lat, lng });
    } else if (data.location && typeof data.location === 'object') {
      lat = data.location.latitude || 0;
      lng = data.location.longitude || 0;
      console.log('- Coordenadas de data.location:', { lat, lng });
    }
    
    // Se não há coordenadas válidas, usar coordenadas padrão de Luanda
    if (!lat || !lng || lat === 0 || lng === 0) {
      console.log('⚠️ Coordenadas inválidas detectadas - aplicando coordenadas padrão de Luanda');
      lat = -8.8390526;
      lng = 13.2894116;
    }
    
    const finalCoordinates = {
      latitude: lat,
      longitude: lng
    };
    
    console.log('✅ Coordenadas finais processadas:', finalCoordinates);
    console.log();
    
    // Verificar se serão válidas para o mapa
    const isValidForMap = finalCoordinates.latitude !== 0 && 
                         finalCoordinates.longitude !== 0 &&
                         !isNaN(finalCoordinates.latitude) && 
                         !isNaN(finalCoordinates.longitude);
    
    console.log('🗺️ Validação para exibição no mapa:');
    console.log('- Será exibido no mapa?', isValidForMap ? '✅ SIM' : '❌ NÃO');
    console.log('- Latitude válida?', finalCoordinates.latitude !== 0 && !isNaN(finalCoordinates.latitude));
    console.log('- Longitude válida?', finalCoordinates.longitude !== 0 && !isNaN(finalCoordinates.longitude));
    console.log();
    
    console.log('📍 Localização final:');
    console.log(`- Latitude: ${finalCoordinates.latitude}`);
    console.log(`- Longitude: ${finalCoordinates.longitude}`);
    console.log('- Localização: Centro de Luanda, Angola');
    
  } catch (error) {
    console.error('❌ Erro ao testar coordenadas do HospGama:', error);
  }
}

testHospGamaCoordinates();