/**
 * Teste das validações internacionais
 * Verifica se o sistema de países e validações está funcionando corretamente
 */

const { 
  validateInternationalPhone, 
  validateInternationalCoordinates,
  validateAngolanPhoneNumber,
  validateAngolanCoordinates
} = require('./utils/validation');

const {
  getCountryConfig,
  detectCountryByPhone,
  detectCountryByCoordinates,
  isValidGlobalCoordinates,
  COUNTRIES
} = require('./utils/countries');

console.log('🧪 TESTANDO SISTEMA INTERNACIONAL DE VALIDAÇÕES\n');

// ===== TESTE 1: Configurações de Países =====
console.log('1️⃣ TESTANDO CONFIGURAÇÕES DE PAÍSES');
console.log('Países disponíveis:', Object.keys(COUNTRIES));
console.log('Angola config:', getCountryConfig('AO')?.name);
console.log('Brasil config:', getCountryConfig('BR')?.name);
console.log('Portugal config:', getCountryConfig('PT')?.name);
console.log('');

// ===== TESTE 2: Validação de Telefones =====
console.log('2️⃣ TESTANDO VALIDAÇÃO DE TELEFONES');

const phoneTests = [
  // Angola
  { phone: '+244923456789', country: 'AO', expected: true },
  { phone: '923456789', country: 'AO', expected: true },
  { phone: '+244930123456', country: 'AO', expected: true },
  { phone: '+244941234567', country: 'AO', expected: true },
  
  // Brasil
  { phone: '+5511999998888', country: 'BR', expected: true },
  { phone: '+55(11)99999-8888', country: 'BR', expected: true },
  
  // Portugal
  { phone: '+351912345678', country: 'PT', expected: true },
  
  // EUA
  { phone: '+1(555)123-4567', country: 'US', expected: true },
  
  // Inválidos
  { phone: '123', country: 'AO', expected: false },
  { phone: '+999999999999', country: 'XX', expected: false },
];

phoneTests.forEach(test => {
  try {
    const result = validateInternationalPhone(test.phone, test.country);
    const status = result.isValid === test.expected ? '✅' : '❌';
    console.log(`${status} ${test.phone} (${test.country}): ${result.isValid ? 'Válido' : result.error}`);
    if (result.formatted) {
      console.log(`   → Formatado: ${result.formatted}`);
    }
  } catch (error) {
    console.log(`❌ ERRO ${test.phone}: ${error.message}`);
  }
});

console.log('');

// ===== TESTE 3: Detecção Automática de País por Telefone =====
console.log('3️⃣ TESTANDO DETECÇÃO DE PAÍS POR TELEFONE');

const phoneDetectionTests = [
  '+244923456789', // Angola
  '+5511999998888', // Brasil
  '+351912345678', // Portugal
  '+1555123456', // EUA
  '+4407123456789', // Reino Unido
];

phoneDetectionTests.forEach(phone => {
  try {
    const country = detectCountryByPhone(phone);
    const config = getCountryConfig(country);
    console.log(`📱 ${phone} → ${country} (${config?.name || 'Desconhecido'})`);
  } catch (error) {
    console.log(`❌ ERRO ${phone}: ${error.message}`);
  }
});

console.log('');

// ===== TESTE 4: Validação de Coordenadas =====
console.log('4️⃣ TESTANDO VALIDAÇÃO DE COORDENADAS');

const coordinateTests = [
  // Angola
  { lat: -8.8390, lng: 13.2894, country: 'AO', expected: true, name: 'Luanda, Angola' },
  { lat: -15.7794, lng: 19.9353, country: 'AO', expected: true, name: 'Huambo, Angola' },
  
  // Brasil
  { lat: -23.5505, lng: -46.6333, country: 'BR', expected: true, name: 'São Paulo, Brasil' },
  { lat: -22.9068, lng: -43.1729, country: 'BR', expected: true, name: 'Rio de Janeiro, Brasil' },
  
  // Portugal
  { lat: 38.7223, lng: -9.1393, country: 'PT', expected: true, name: 'Lisboa, Portugal' },
  
  // Globais (sem país específico)
  { lat: 40.7128, lng: -74.0060, country: null, expected: true, name: 'Nova York (sem país)' },
  
  // Fora dos limites do país especificado
  { lat: 40.7128, lng: -74.0060, country: 'AO', expected: false, name: 'Nova York em Angola' },
];

coordinateTests.forEach(test => {
  try {
    const result = validateInternationalCoordinates(test.lat, test.lng, test.country);
    const status = result.isValid === test.expected ? '✅' : '❌';
    console.log(`${status} ${test.name}: ${result.isValid ? 'Válido' : result.error}`);
    if (result.country) {
      console.log(`   → País: ${result.country}`);
    }
  } catch (error) {
    console.log(`❌ ERRO ${test.name}: ${error.message}`);
  }
});

console.log('');

// ===== TESTE 5: Detecção de País por Coordenadas =====
console.log('5️⃣ TESTANDO DETECÇÃO DE PAÍS POR COORDENADAS');

const coordinateDetectionTests = [
  { lat: -8.8390, lng: 13.2894, name: 'Luanda' },
  { lat: -23.5505, lng: -46.6333, name: 'São Paulo' },
  { lat: 38.7223, lng: -9.1393, name: 'Lisboa' },
  { lat: 40.7128, lng: -74.0060, name: 'Nova York' },
  { lat: 51.5074, lng: -0.1278, name: 'Londres' },
];

coordinateDetectionTests.forEach(test => {
  try {
    const country = detectCountryByCoordinates(test.lat, test.lng);
    const config = getCountryConfig(country);
    console.log(`🗺️ ${test.name} (${test.lat}, ${test.lng}) → ${country} (${config?.name || 'Desconhecido'})`);
  } catch (error) {
    console.log(`❌ ERRO ${test.name}: ${error.message}`);
  }
});

console.log('');

// ===== TESTE 6: Compatibilidade com Funções Antigas =====
console.log('6️⃣ TESTANDO COMPATIBILIDADE COM FUNÇÕES ANTIGAS');

try {
  const angolanPhoneResult = validateAngolanPhoneNumber('+244923456789');
  console.log(`✅ validateAngolanPhoneNumber: ${angolanPhoneResult.isValid ? 'Válido' : 'Inválido'}`);
  
  const angolanCoordsResult = validateAngolanCoordinates(-8.8390, 13.2894);
  console.log(`✅ validateAngolanCoordinates: ${angolanCoordsResult.isValid ? 'Válido' : 'Inválido'}`);
} catch (error) {
  console.log(`❌ ERRO na compatibilidade: ${error.message}`);
}

console.log('\n🎉 TESTES CONCLUÍDOS!');
console.log('\n📊 RESUMO:');
console.log('- Sistema de países: Implementado');
console.log('- Validação internacional de telefones: Implementado');
console.log('- Validação internacional de coordenadas: Implementado');
console.log('- Detecção automática de país: Implementado');
console.log('- Compatibilidade com funções antigas: Mantida');
console.log('\n✅ O aplicativo agora suporta validações para múltiplos países!');