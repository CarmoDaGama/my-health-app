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

// Simular função de filtro de facilities do HomeScreen
function filterFacilities(services) {
  return services.filter(service => {
    const isFacility = 
      // Core facility types
      service.type === 'hospital' ||
      service.type === 'pharmacy' ||
      service.type === 'laboratory' ||
      service.type === 'emergency' ||
      // Clinics without individual specialties (institution, not professional)
      (service.type === 'clinic' && !service.specialty) ||
      // Services explicitly marked as institutions
      service.serviceType === 'institution' ||
      // Other facility types
      service.type === 'diagnostic_center' ||
      service.type === 'rehabilitation' ||
      service.type === 'mental_health_center';
    
    // EXCLUDE individual professionals from map
    const isProfessional = 
      service.type === 'professional' ||
      service.specialty ||
      service.serviceType === 'professional' ||
      service.professionalInfo;
    
    const shouldInclude = isFacility && !isProfessional;
    
    // Debug específico para HospGama
    if (service.name && service.name.includes('HospGama')) {
      console.log('🏥 [Simulation] HospGama facility filter analysis:', {
        name: service.name,
        type: service.type,
        specialty: service.specialty,
        serviceType: service.serviceType,
        professionalInfo: service.professionalInfo,
        isFacility,
        isProfessional,
        shouldInclude: shouldInclude ? '✅ INCLUDED' : '❌ FILTERED OUT'
      });
    }
    
    return shouldInclude;
  });
}

async function debugCompleteDataFlow() {
  try {
    console.log('🔍 DEBUGANDO FLUXO COMPLETO DE DADOS DO HOSPGAMA\n');
    console.log('📍 Etapa 1: Buscar HospGama no Firestore...\n');
    
    // Buscar o HospGama específico
    const hospGamaId = 'n1KbATJbQJgaDboSNDRu4E1Tmr42';
    const docRef = doc(db, 'healthServices', hospGamaId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log('❌ Etapa 1 FALHOU: HospGama não encontrado no Firestore');
      return;
    }
    
    const rawData = docSnap.data();
    console.log('✅ Etapa 1 SUCESSO: HospGama encontrado no Firestore');
    console.log('📄 Dados brutos do Firestore:');
    console.log('- ID:', hospGamaId);
    console.log('- Nome:', rawData.name);
    console.log('- Type:', rawData.type);
    console.log('- ServiceType:', rawData.serviceType);
    console.log('- Specialty:', rawData.specialty);
    console.log('- ProfessionalInfo:', rawData.professionalInfo);
    console.log('- Status:', rawData.status);
    console.log('- Verified:', rawData.verified);
    console.log('- Coordinates:', rawData.coordinates);
    console.log();
    
    console.log('📍 Etapa 2: Simular processamento da API (api-firebase.ts)...\n');
    
    // Simular validação da API
    const serviceStatus = rawData.status !== undefined ? rawData.status : 'active';
    const isVerified = rawData.verified !== undefined ? rawData.verified : true;
    
    console.log('🔍 Validação de status e verificação:');
    console.log('- Status:', serviceStatus);
    console.log('- Verificado:', isVerified);
    
    // Verificar filtros da API
    const wouldPassAPIFilters = (() => {
      // Para profissionais e instituições, aplicar filtro rigoroso
      if (rawData.type === 'professional' || rawData.serviceType === 'professional' || 
          rawData.type === 'institution' || rawData.serviceType === 'institution') {
        
        // Serviço deve estar ativo E verificado
        if (serviceStatus !== 'active' || !isVerified) {
          console.log(`❌ Seria filtrado pela API - Status: ${serviceStatus}, Verificado: ${isVerified}`);
          return false;
        }
        
        console.log(`✅ Seria APROVADO pela API como profissional/instituição`);
        return true;
      } else {
        // Para outros tipos, só verificar se está ativo
        if (serviceStatus !== 'active') {
          console.log(`❌ Seria filtrado pela API - Status inativo: ${serviceStatus}`);
          return false;
        }
        
        console.log(`✅ Seria APROVADO pela API como serviço geral`);
        return true;
      }
    })();
    
    if (!wouldPassAPIFilters) {
      console.log('\n❌ Etapa 2 FALHOU: HospGama seria filtrado pela API');
      return;
    }
    
    console.log('\n✅ Etapa 2 SUCESSO: HospGama passaria pelos filtros da API');
    
    // Simular processamento de coordenadas
    let lat = 0;
    let lng = 0;
    
    if (rawData.coordinates && typeof rawData.coordinates === 'object') {
      lat = rawData.coordinates.latitude || 0;
      lng = rawData.coordinates.longitude || 0;
    } else if (rawData.location && typeof rawData.location === 'object') {
      lat = rawData.location.latitude || 0;
      lng = rawData.location.longitude || 0;
    }
    
    // Aplicar coordenadas padrão de Luanda se necessário
    if (!lat || !lng || lat === 0 || lng === 0) {
      console.log('⚠️ Coordenadas inválidas - aplicando coordenadas padrão de Luanda');
      lat = -8.8390526;
      lng = 13.2894116;
    }
    
    const processedService = {
      id: hospGamaId,
      name: rawData.name,
      type: rawData.type,
      serviceType: rawData.serviceType,
      specialty: rawData.specialty,
      professionalInfo: rawData.professionalInfo,
      coordinates: { latitude: lat, longitude: lng },
      status: serviceStatus,
      verified: isVerified
    };
    
    console.log('📄 Serviço após processamento da API:', processedService);
    console.log();
    
    console.log('📍 Etapa 3: Simular filtro de facilities (HomeScreen)...\n');
    
    const facilities = filterFacilities([processedService]);
    
    if (facilities.length === 0) {
      console.log('❌ Etapa 3 FALHOU: HospGama foi filtrado como não-facility');
      return;
    }
    
    console.log('✅ Etapa 3 SUCESSO: HospGama passou pelo filtro de facilities');
    console.log();
    
    console.log('📍 Etapa 4: Simular chegada no InteractiveMap...\n');
    
    console.log('✅ Etapa 4 SUCESSO: HospGama chegaria no InteractiveMap');
    console.log('📄 Dados que chegariam no InteractiveMap:', facilities[0]);
    console.log();
    
    console.log('🎯 RESUMO DA ANÁLISE:');
    console.log('1. ✅ Existe no Firestore');
    console.log('2. ✅ Passaria pelos filtros da API');
    console.log('3. ✅ Passaria pelo filtro de facilities');
    console.log('4. ✅ Chegaria no InteractiveMap');
    console.log();
    console.log('💡 Se ainda assim não aparece, o problema pode ser:');
    console.log('- ❓ Erro na função getAllServices() da API');
    console.log('- ❓ Problema de timing/loading no componente');
    console.log('- ❓ Estado não sendo atualizado corretamente');
    console.log('- ❓ Filtros adicionais não simulados');
    
  } catch (error) {
    console.error('❌ Erro na análise:', error.message);
    
    // Executar simulação offline
    console.log('\n🔄 Executando simulação offline com dados mockados...');
    
    const mockHospGama = {
      id: 'n1KbATJbQJgaDboSNDRu4E1Tmr42',
      name: 'HospGama',
      type: 'hospital', // Teste com tipo hospital
      serviceType: undefined,
      specialty: undefined,
      professionalInfo: undefined,
      status: 'active',
      verified: true,
      coordinates: null
    };
    
    console.log('\n📍 Simulação Offline - Etapa 3: Filtro de facilities');
    const facilitiesOffline = filterFacilities([mockHospGama]);
    
    if (facilitiesOffline.length > 0) {
      console.log('✅ Mock HospGama passaria pelo filtro de facilities');
    } else {
      console.log('❌ Mock HospGama seria filtrado como não-facility');
    }
  }
}

debugCompleteDataFlow();