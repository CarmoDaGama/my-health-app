/**
 * Debug para o problema do HospGama não aparecer no mapa
 */

console.log('🗺️ ANÁLISE: Por que HospGama não aparece no mapa?');
console.log('=============================================');

// Dados simulados baseados no serviceId do HospGama
const hospGamaService = {
  id: 'n1KbATJbQJgaDboSNDRu4E1Tmr42',
  name: 'HospGama',
  type: 'hospital',
  coordinates: null, // SUSPEITO: coordenadas podem estar null
  address: 'Luanda, Angola',
  rating: 0
};

const hospitalMilitarService = {
  id: 'hospital-militar-123',
  name: 'Hospital Militar Principal',
  type: 'hospital',
  coordinates: {
    latitude: -8.8400,
    longitude: 13.2350
  },
  address: 'Luanda, Angola',
  rating: 4.5
};

console.log('\n🔍 VERIFICAÇÕES DE COORDENADAS:');

function analyzeMapVisibility(service, serviceName) {
  console.log(`\n--- Análise de ${serviceName} ---`);
  
  // 1. Verificar coordenadas
  console.log('Coordinates:', service.coordinates);
  console.log('Has coordinates:', !!service.coordinates);
  
  if (service.coordinates) {
    console.log('Latitude:', service.coordinates.latitude);
    console.log('Longitude:', service.coordinates.longitude);
    console.log('Latitude valid:', service.coordinates.latitude >= -90 && service.coordinates.latitude <= 90);
    console.log('Longitude valid:', service.coordinates.longitude >= -180 && service.coordinates.longitude <= 180);
  }
  
  // 2. Verificar se passaria pelos filtros do mapa
  const hasValidCoordinates = service.coordinates && 
    typeof service.coordinates.latitude === 'number' && 
    typeof service.coordinates.longitude === 'number' &&
    !isNaN(service.coordinates.latitude) && 
    !isNaN(service.coordinates.longitude);
  
  console.log('Would appear on map:', hasValidCoordinates);
  
  // 3. Verificar estrutura esperada pelo mapa
  const mapService = {
    ...service,
    color: '#2E7D32',
    icon: '🏥'
  };
  
  console.log('Map service structure:', JSON.stringify(mapService, null, 2));
  
  return hasValidCoordinates;
}

analyzeMapVisibility(hospGamaService, 'HospGama');
analyzeMapVisibility(hospitalMilitarService, 'Hospital Militar');

console.log('\n🎯 POSSÍVEIS CAUSAS:');
console.log('1. ❓ Coordenadas null/undefined no banco de dados');
console.log('2. ❓ Coordenadas com valores inválidos (NaN, fora do range)');
console.log('3. ❓ Serviço sendo filtrado por maxServicesToShow (limite de 50)');
console.log('4. ❓ Problema no clustering (serviço agrupado com outros)');
console.log('5. ❓ Serviço fora da região visível do mapa');
console.log('6. ❓ Filtro de categoria ativo');

console.log('\n🔍 VERIFICAÇÕES NECESSÁRIAS:');
console.log('1. Verificar dados reais do HospGama no Firestore');
console.log('2. Verificar se o serviço está na lista enviada para o mapa');
console.log('3. Verificar se passa pelos filtros do MapView');
console.log('4. Verificar se o marker é criado no JavaScript');
console.log('5. Verificar se não está sendo clustered');

console.log('\n📝 LOGS DE DEBUG NECESSÁRIOS:');
console.log('• [MapView] Total services received: X');
console.log('• [MapView] Optimized services: Y');
console.log('• [InteractiveMap] Filtered services: Z');
console.log('• [InteractiveMap] Adding marker for: HospGama');

console.log('\n🛠️ SOLUÇÕES A IMPLEMENTAR:');
console.log('1. ✅ Adicionar logs de debug no processo do mapa');
console.log('2. ✅ Verificar e corrigir coordenadas no Firestore');
console.log('3. ✅ Validar filtros de exibição');
console.log('4. ✅ Desabilitar clustering temporariamente para teste');
console.log('5. ✅ Centralizar mapa nas coordenadas do HospGama');

// Simular filtros do MapView
console.log('\n🧪 SIMULAÇÃO DOS FILTROS DO MAPVIEW:');

const services = [hospGamaService, hospitalMilitarService];
console.log('Services before filtering:', services.length);

// Filtro 1: Coordenadas válidas
const validCoordinatesServices = services.filter(service => {
  if (!service.coordinates) return false;
  if (typeof service.coordinates.latitude !== 'number') return false;
  if (typeof service.coordinates.longitude !== 'number') return false;
  if (isNaN(service.coordinates.latitude) || isNaN(service.coordinates.longitude)) return false;
  if (service.coordinates.latitude < -90 || service.coordinates.latitude > 90) return false;
  if (service.coordinates.longitude < -180 || service.coordinates.longitude > 180) return false;
  return true;
});

console.log('Services after coordinate validation:', validCoordinatesServices.length);
console.log('Valid services:', validCoordinatesServices.map(s => s.name));

// Filtro 2: Limite maxServicesToShow (padrão 50)
const limitedServices = validCoordinatesServices.slice(0, 50);
console.log('Services after limit (50):', limitedServices.length);

console.log('\n💡 RESULTADO DA SIMULAÇÃO:');
if (validCoordinatesServices.find(s => s.id === hospGamaService.id)) {
  console.log('✅ HospGama passaria pelos filtros');
} else {
  console.log('❌ HospGama seria filtrado (coordenadas inválidas)');
}