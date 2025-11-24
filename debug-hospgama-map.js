/**
 * Debug específico para problema do HospGama não aparecer no mapa
 */

// Simulação dos dados do HospGama baseado no serviceId do log
const hospGamaService = {
  id: 'n1KbATJbQJgaDboSNDRu4E1Tmr42',
  name: 'HospGama ', // Note o espaço no final
  type: 'hospital',
  // Coordenadas hipotéticas - vamos testar vários cenários
  coordinates: {
    latitude: -8.8383,
    longitude: 13.2344
  },
  address: 'Luanda, Angola',
  rating: 4.2
};

console.log('🔍 ANÁLISE: Por que HospGama não aparece no mapa?');
console.log('=====================================');

console.log('\n📍 DADOS DO SERVIÇO:');
console.log('ID:', hospGamaService.id);
console.log('Nome:', JSON.stringify(hospGamaService.name));
console.log('Tipo:', hospGamaService.type);
console.log('Coordenadas:', hospGamaService.coordinates);

console.log('\n🔍 VERIFICAÇÕES DE COORDENADAS:');

// 1. Verificar se as coordenadas são válidas
function isValidCoordinates(coordinates) {
  if (!coordinates) return false;
  if (typeof coordinates.latitude !== 'number') return false;
  if (typeof coordinates.longitude !== 'number') return false;
  if (isNaN(coordinates.latitude) || isNaN(coordinates.longitude)) return false;
  if (coordinates.latitude < -90 || coordinates.latitude > 90) return false;
  if (coordinates.longitude < -180 || coordinates.longitude > 180) return false;
  return true;
}

console.log('1. Coordenadas válidas?', isValidCoordinates(hospGamaService.coordinates));
console.log('2. Latitude:', hospGamaService.coordinates?.latitude, '(válida:', hospGamaService.coordinates?.latitude >= -90 && hospGamaService.coordinates?.latitude <= 90, ')');
console.log('3. Longitude:', hospGamaService.coordinates?.longitude, '(válida:', hospGamaService.coordinates?.longitude >= -180 && hospGamaService.coordinates?.longitude <= 180, ')');

console.log('\n🗺️ VERIFICAÇÕES DE EXIBIÇÃO NO MAPA:');

// 2. Simular filtros que podem estar escondendo o serviço
const commonFilters = {
  maxServicesToShow: 50, // Limite padrão do MapView
  clusteringEnabled: true,
  selectedCategories: [], // Se vazio, mostra todos
};

console.log('4. Limite de serviços:', commonFilters.maxServicesToShow);
console.log('5. Clustering habilitado:', commonFilters.clusteringEnabled);

// 3. Verificar se o tipo de serviço está correto
const validServiceTypes = ['hospital', 'clinic', 'pharmacy', 'emergency', 'laboratory', 'professional', 'rehabilitation'];
console.log('6. Tipo de serviço válido?', validServiceTypes.includes(hospGamaService.type));

// 4. Verificar estrutura esperada pelo mapa
const expectedMapService = {
  ...hospGamaService,
  color: '#2E7D32', // Cor padrão para hospital
  icon: '🏥' // Ícone padrão para hospital
};

console.log('\n📊 ESTRUTURA PARA O MAPA:');
console.log('Serviço preparado para mapa:', JSON.stringify(expectedMapService, null, 2));

console.log('\n🎯 POSSÍVEIS CAUSAS DO PROBLEMA:');
console.log('❓ 1. Coordenadas inválidas ou null/undefined');
console.log('❓ 2. Serviço sendo filtrado por categoria');
console.log('❓ 3. Serviço fora da região visível do mapa');
console.log('❓ 4. Limite de serviços atingido (maxServicesToShow)');
console.log('❓ 5. Problema no clustering (agrupamento de marcadores)');
console.log('❓ 6. Tipo de serviço não reconhecido');
console.log('❓ 7. Problema na renderização do marcador');

console.log('\n🛠️ VERIFICAÇÕES NECESSÁRIAS NO FIRESTORE:');
console.log('1. Confirmar se o serviço HospGama existe no banco');
console.log('2. Verificar se tem campo "coordinates" válido');
console.log('3. Verificar se o tipo está correto');
console.log('4. Confirmar se não está marcado como inativo/deleted');

console.log('\n📝 LOGS ESPERADOS NO APP:');
console.log('• [MapView] Processando X serviços');
console.log('• [MapView] Serviços otimizados: Y');
console.log('• [InteractiveMap] Filtered services: Z');
console.log('• [InteractiveMap] Adding service marker: HospGama');

// 5. Simulação de filtro por distância
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Supondo localização do usuário em Luanda
const userLocation = { latitude: -8.8383, longitude: 13.2344 };
const distanceToHospGama = calculateDistance(
  userLocation.latitude,
  userLocation.longitude,
  hospGamaService.coordinates.latitude,
  hospGamaService.coordinates.longitude
);

console.log('\n📏 ANÁLISE DE DISTÂNCIA:');
console.log('Distância do usuário para HospGama:', distanceToHospGama.toFixed(2), 'km');
console.log('Filtro de distância comum (10km):', distanceToHospGama <= 10 ? '✅ Passaria' : '❌ Seria filtrado');

console.log('\n🚀 PRÓXIMOS PASSOS DE DEBUG:');
console.log('1. Verificar se HospGama está na lista de serviços carregados');
console.log('2. Verificar se passa pelos filtros do MapView');
console.log('3. Verificar se o marker é criado no JavaScript do mapa');
console.log('4. Verificar se não há erro na criação do ícone');
console.log('5. Verificar se não está sendo clustered (agrupado) com outros marcadores');

console.log('\n✅ SOLUÇÕES POTENCIAIS:');
console.log('• Limpar nome (remover espaço do final): "HospGama"');
console.log('• Validar coordenadas antes de enviar para o mapa');
console.log('• Aumentar maxServicesToShow se necessário');
console.log('• Desabilitar clustering temporariamente para testar');
console.log('• Verificar se não há filtros de categoria ativos');
console.log('• Centralizar mapa nas coordenadas do HospGama para teste');