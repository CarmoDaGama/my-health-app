/**
 * TESTE DIAGNÓSTICO - BUSCA E CARREGAMENTO
 * Testa se os serviços estão sendo carregados e se a busca funciona
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, orderBy, limit } = require('firebase/firestore');

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCOxpoXvaG9wNRoMrSVf0o5Xdqvmm19NWY",
  authDomain: "health-app-angola.firebaseapp.com",
  projectId: "health-app-angola",
  storageBucket: "health-app-angola.firebasestorage.app",
  messagingSenderId: "435118303895",
  appId: "1:435118303895:web:8c42f4faaf46ec716117d2"
};

async function testSearchAndLoadingFunctions() {
  console.log('🔍 TESTE DIAGNÓSTICO: BUSCA E CARREGAMENTO');
  console.log('=' .repeat(60));
  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  try {
    // TESTE 1: Carregar todos os serviços (simulando getAllServices)
    console.log('\n📋 TESTE 1: getAllServices() - Carregar todos os serviços');
    console.log('-' .repeat(40));
    
    const healthServicesQuery = query(
      collection(db, 'healthServices'),
      limit(20)
    );
    
    const healthServicesSnapshot = await getDocs(healthServicesQuery);
    console.log(`✅ Total de serviços encontrados: ${healthServicesSnapshot.size}`);
    
    const allServices = [];
    healthServicesSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Verificar estrutura de dados
      const service = {
        id: doc.id,
        name: data.name || 'Nome não definido',
        type: data.type || data.serviceType || 'Tipo não definido',
        address: data.address || 'Endereço não definido',
        city: data.city || 'Cidade não definida',
        coordinates: data.coordinates || { latitude: 0, longitude: 0 },
        status: data.status || 'active',
        verified: data.verified !== false
      };
      
      console.log(`  📄 ${service.name} (${service.type}) - ${service.city}`);
      console.log(`      Status: ${service.status}, Verificado: ${service.verified}`);
      console.log(`      Coordenadas: ${service.coordinates.latitude}, ${service.coordinates.longitude}`);
      
      allServices.push(service);
    });
    
    console.log(`\n📊 Resultado: ${allServices.length} serviços processados com sucesso`);
    
  } catch (error) {
    console.error('❌ ERRO no teste 1:', error.message);
  }
  
  try {
    // TESTE 2: Busca por texto (simulando search)
    console.log('\n🔍 TESTE 2: Busca por texto - "Hospital"');
    console.log('-' .repeat(40));
    
    const searchQuery = 'hospital';
    const searchLower = searchQuery.toLowerCase();
    
    // Buscar com where (prefix matching)
    const textSearchQuery = query(
      collection(db, 'healthServices'),
      where('name', '>=', searchLower),
      where('name', '<=', searchLower + '\uf8ff'),
      limit(10)
    );
    
    const searchSnapshot = await getDocs(textSearchQuery);
    console.log(`✅ Busca por "${searchQuery}" encontrou: ${searchSnapshot.size} resultados`);
    
    searchSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  🔍 ${data.name} (${data.type})`);
    });
    
    // Se busca direta falhar, tentar busca manual
    if (searchSnapshot.size === 0) {
      console.log('\n⚠️ Busca direta falhou. Tentando busca manual...');
      
      const allServicesQuery = query(collection(db, 'healthServices'));
      const allSnapshot = await getDocs(allServicesQuery);
      
      const manualResults = [];
      allSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.name && data.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          manualResults.push(data);
          console.log(`  🔍 Manual: ${data.name} (${data.type})`);
        }
      });
      
      console.log(`✅ Busca manual encontrou: ${manualResults.length} resultados`);
    }
    
  } catch (error) {
    console.error('❌ ERRO no teste 2:', error.message);
  }
  
  try {
    // TESTE 3: Filtros por tipo
    console.log('\n🏥 TESTE 3: Filtro por tipo - "hospital"');
    console.log('-' .repeat(40));
    
    const typeFilterQuery = query(
      collection(db, 'healthServices'),
      where('type', '==', 'hospital'),
      limit(10)
    );
    
    const typeSnapshot = await getDocs(typeFilterQuery);
    console.log(`✅ Filtro por tipo "hospital" encontrou: ${typeSnapshot.size} resultados`);
    
    typeSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  🏥 ${data.name} - ${data.address}`);
    });
    
  } catch (error) {
    console.error('❌ ERRO no teste 3:', error.message);
  }
  
  try {
    // TESTE 4: Coordenadas válidas
    console.log('\n📍 TESTE 4: Verificar coordenadas para mapa');
    console.log('-' .repeat(40));
    
    const allServicesQuery = query(collection(db, 'healthServices'));
    const coordSnapshot = await getDocs(allServicesQuery);
    
    let validCoords = 0;
    let invalidCoords = 0;
    
    coordSnapshot.forEach((doc) => {
      const data = doc.data();
      const coords = data.coordinates;
      
      if (coords && coords.latitude && coords.longitude && 
          coords.latitude !== 0 && coords.longitude !== 0) {
        validCoords++;
        console.log(`  ✅ ${data.name}: ${coords.latitude}, ${coords.longitude}`);
      } else {
        invalidCoords++;
        console.log(`  ❌ ${data.name}: Coordenadas inválidas ou ausentes`);
      }
    });
    
    console.log(`\n📊 Coordenadas: ${validCoords} válidas, ${invalidCoords} inválidas`);
    
  } catch (error) {
    console.error('❌ ERRO no teste 4:', error.message);
  }
  
  console.log('\n🎯 DIAGNÓSTICO COMPLETO:');
  console.log('=' .repeat(60));
  console.log('1. Se serviços aparecem no Teste 1: ✅ Carregamento OK');
  console.log('2. Se busca funciona no Teste 2: ✅ Busca OK');
  console.log('3. Se filtros funcionam no Teste 3: ✅ Filtros OK');
  console.log('4. Se coordenadas são válidas no Teste 4: ✅ Mapa OK');
  console.log('=' .repeat(60));
}

testSearchAndLoadingFunctions().catch(console.error);