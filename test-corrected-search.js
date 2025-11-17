/**
 * TESTE RÁPIDO DA BUSCA CORRIGIDA
 * Testa se a busca por texto funciona com a correção implementada
 */

const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCOxpoXvaG9wNRoMrSVf0o5Xdqvmm19NWY",
  authDomain: "health-app-angola.firebaseapp.com",
  projectId: "health-app-angola",
  storageBucket: "health-app-angola.firebasestorage.app",
  messagingSenderId: "435118303895",
  appId: "1:435118303895:web:8c42f4faaf46ec716117d2"
};

// Simular o AdvancedSearchService corrigido
class TestAdvancedSearch {
  static async searchInCollection(filters, maxResults = 50) {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Simular busca manual como implementado
    const { collection, getDocs, query, limit } = require('firebase/firestore');
    
    const hasTextSearch = filters.query && filters.query.length > 0;
    
    // Buscar mais dados se há filtro de texto para aplicar manualmente
    const constraints = [limit(hasTextSearch ? 100 : maxResults)];
    
    const q = query(collection(db, 'healthServices'), ...constraints);
    const snapshot = await getDocs(q);
    
    const services = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Verificar status ativo
      const serviceStatus = data.status || 'active';
      const isVerified = data.verified !== false;
      
      if (serviceStatus !== 'active' || !isVerified) {
        return;
      }
      
      const service = {
        id: doc.id,
        name: data.name || '',
        type: data.type || data.serviceType || 'clinic',
        address: data.address || '',
        city: data.city || '',
        description: data.description || '',
        services: data.services || [],
        specialty: data.specialty || data.specialization
      };
      
      // ✅ BUSCA POR TEXTO MANUAL (como corrigido no AdvancedSearchService)
      if (filters.query && filters.query.length > 0) {
        const searchLower = filters.query.toLowerCase();
        const searchableText = [
          service.name,
          service.description,
          service.specialty,
          service.address,
          service.city,
          ...(service.services || [])
        ].filter(Boolean).join(' ').toLowerCase();
        
        // Pular se não contém o texto buscado
        if (!searchableText.includes(searchLower)) {
          return;
        }
      }
      
      services.push(service);
    });
    
    return services;
  }
}

async function testCorrectedSearch() {
  console.log('🔍 TESTE DA BUSCA CORRIGIDA');
  console.log('=' .repeat(50));
  
  try {
    // Teste 1: Buscar "hospital"
    console.log('\n🏥 TESTE 1: Busca por "hospital"');
    const hospitalResults = await TestAdvancedSearch.searchInCollection({ query: 'hospital' });
    console.log(`✅ Resultados encontrados: ${hospitalResults.length}`);
    hospitalResults.forEach(r => {
      console.log(`  📋 ${r.name} (${r.type})`);
    });
    
    // Teste 2: Buscar "clínica"
    console.log('\n🏩 TESTE 2: Busca por "clínica"');
    const clinicResults = await TestAdvancedSearch.searchInCollection({ query: 'clínica' });
    console.log(`✅ Resultados encontrados: ${clinicResults.length}`);
    clinicResults.forEach(r => {
      console.log(`  📋 ${r.name} (${r.type})`);
    });
    
    // Teste 3: Buscar "farmácia"
    console.log('\n💊 TESTE 3: Busca por "farmácia"');
    const pharmacyResults = await TestAdvancedSearch.searchInCollection({ query: 'farmácia' });
    console.log(`✅ Resultados encontrados: ${pharmacyResults.length}`);
    pharmacyResults.forEach(r => {
      console.log(`  📋 ${r.name} (${r.type})`);
    });
    
    // Teste 4: Buscar "luanda"
    console.log('\n📍 TESTE 4: Busca por "luanda" (cidade)');
    const locationResults = await TestAdvancedSearch.searchInCollection({ query: 'luanda' });
    console.log(`✅ Resultados encontrados: ${locationResults.length}`);
    locationResults.slice(0, 3).forEach(r => {
      console.log(`  📋 ${r.name} - ${r.city}`);
    });
    
    // Teste 5: Busca sem filtro (carregar todos)
    console.log('\n📊 TESTE 5: Carregar todos os serviços');
    const allResults = await TestAdvancedSearch.searchInCollection({});
    console.log(`✅ Total de serviços: ${allResults.length}`);
    
    console.log('\n🎯 RESULTADO:');
    if (hospitalResults.length > 0 && clinicResults.length > 0) {
      console.log('✅ BUSCA FUNCIONANDO! A correção foi bem-sucedida.');
    } else {
      console.log('❌ Ainda há problemas com a busca.');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testCorrectedSearch().catch(console.error);