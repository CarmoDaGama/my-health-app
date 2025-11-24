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

// Simular a função getCategoryByType
const SERVICE_TYPE_CATEGORY_MAP = {
  'emergency': 'emergency',
  'hospital': 'hospital',
  'clinic': 'clinic',
  'pharmacy': 'pharmacy',
  'laboratory': 'laboratory',
  'specialist': 'specialist',
  'professional': 'specialist',
  'dental': 'dental',
  'dentist': 'dental',
  'urgent_care': 'emergency',
  'trauma_center': 'emergency',
  'medical_center': 'hospital',
  'health_center': 'clinic',
  'family_clinic': 'clinic',
  'drug_store': 'pharmacy',
  'diagnostic_center': 'laboratory',
  'imaging_center': 'laboratory',
  'mental_health': 'mental_health',
  'psychology': 'mental_health',
  'psychiatry': 'mental_health',
  'therapy': 'rehabilitation',
  'physiotherapy': 'rehabilitation',
  'alternative_medicine': 'alternative',
};

const DEFAULT_CATEGORY = {
  id: 'general',
  name: 'General Healthcare',
  color: '#718096',
  darkColor: '#4A5568',
  icon: '🏥',
  description: 'General healthcare services',
  priority: 99,
};

function getCategoryByType(serviceType) {
  const normalizedType = serviceType.toLowerCase().replace(/\s+/g, '_');
  const categoryId = SERVICE_TYPE_CATEGORY_MAP[normalizedType];
  
  if (categoryId) {
    return { id: categoryId, name: `Category ${categoryId}` };
  }
  
  return DEFAULT_CATEGORY;
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugHospGamaFiltering() {
  try {
    console.log('🔍 Debugando filtragem do HospGama no InteractiveMap...\n');
    
    // Buscar o HospGama específico
    const hospGamaId = 'n1KbATJbQJgaDboSNDRu4E1Tmr42';
    const docRef = doc(db, 'healthServices', hospGamaId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log('❌ HospGama não encontrado no Firestore');
      return;
    }
    
    const data = docSnap.data();
    
    console.log('📋 Dados do HospGama:');
    console.log('- ID:', hospGamaId);
    console.log('- Nome:', data.name);
    console.log('- Tipo:', data.type);
    console.log('- Status:', data.status);
    console.log('- Verificado:', data.verified);
    console.log('- Coordenadas:', data.coordinates);
    console.log();
    
    // Simular o processo de categorização
    const serviceType = data.type || 'general';
    const category = getCategoryByType(serviceType);
    
    console.log('🏷️ Análise de Categoria:');
    console.log('- Service Type:', serviceType);
    console.log('- Category ID:', category.id);
    console.log('- Category Name:', category.name);
    console.log();
    
    // Simular diferentes cenários de filtro
    console.log('🔬 Simulação de Filtros:');
    
    // Cenário 1: Nenhuma categoria selecionada
    console.log('1. Sem filtro de categoria:');
    console.log('   - HospGama seria incluído? ✅ SIM (sem filtro)');
    console.log();
    
    // Cenário 2: Categoria correspondente selecionada
    const selectedCategories = [category.id];
    const isIncluded = selectedCategories.includes(category.id);
    console.log('2. Com filtro na categoria correspondente:', category.id);
    console.log('   - Categorias selecionadas:', selectedCategories);
    console.log('   - HospGama seria incluído?', isIncluded ? '✅ SIM' : '❌ NÃO');
    console.log();
    
    // Cenário 3: Categoria diferente selecionada
    const differentCategories = ['hospital', 'emergency'];
    const isIncludedDifferent = differentCategories.includes(category.id);
    console.log('3. Com filtro em categorias diferentes:', differentCategories);
    console.log('   - HospGama seria incluído?', isIncludedDifferent ? '✅ SIM' : '❌ NÃO');
    console.log();
    
    // Verificar todos os tipos possíveis
    console.log('🗂️ Mapeamento de Tipos para Categorias:');
    const possibleTypes = ['hospital', 'clinic', 'pharmacy', 'laboratory', 'specialist', 'professional', 'general'];
    possibleTypes.forEach(type => {
      const cat = getCategoryByType(type);
      console.log(`   - "${type}" → "${cat.id}"`);
    });
    console.log();
    
    // Recomendações
    console.log('💡 Possíveis Causas do Problema:');
    console.log('1. ✅ Categoria sendo mapeada corretamente para:', category.id);
    console.log('2. ❓ Verificar se algum filtro de categoria está ativo no app');
    console.log('3. ❓ Verificar se HospGama está chegando na lista original de services');
    console.log('4. ❓ Verificar se há outros filtros antes da categorização');
    console.log();
    
    console.log('🎯 Próximos Passos:');
    console.log('- Verificar logs do app para ver quais categorias estão selecionadas');
    console.log('- Confirmar se HospGama está na lista original de services');
    console.log('- Verificar se não há filtros adicionais sendo aplicados');
    
  } catch (error) {
    console.error('❌ Erro ao debuggar filtragem:', error.message);
    
    // Simulação offline com dados mockados
    console.log('\n🔄 Executando simulação offline...');
    
    const mockHospGama = {
      id: 'n1KbATJbQJgaDboSNDRu4E1Tmr42',
      name: 'HospGama',
      type: 'hospital', // Assumindo que é hospital
      status: 'active',
      verified: true,
      coordinates: null
    };
    
    console.log('📋 Dados Mockados do HospGama:');
    console.log('- Tipo:', mockHospGama.type);
    
    const category = getCategoryByType(mockHospGama.type);
    console.log('- Categoria mapeada:', category.id);
    
    // Teste de filtragem
    const testCategories = [
      [], // Sem filtro
      ['hospital'], // Categoria correta
      ['clinic', 'pharmacy'], // Categorias diferentes
      ['general'], // Categoria padrão
    ];
    
    testCategories.forEach((selectedCats, index) => {
      const wouldBeIncluded = selectedCats.length === 0 || selectedCats.includes(category.id);
      console.log(`\nTeste ${index + 1}: Categorias ${selectedCats.length ? selectedCats.join(', ') : 'nenhuma'}`);
      console.log(`  Resultado: ${wouldBeIncluded ? '✅ INCLUÍDO' : '❌ FILTRADO'}`);
    });
  }
}

debugHospGamaFiltering();