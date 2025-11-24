/**
 * Debug específico da linha 372 do ServiceDetailScreen
 * Analisando a renderização condicional problemática
 */

console.log('🔍 ANÁLISE DA LINHA 372 - ServiceDetailScreen');
console.log('===========================================');

// Simular dados do HospGama vs Hospital Militar Principal
const hospGamaService = {
  id: 'n1KbATJbQJgaDboSNDRu4E1Tmr42',
  name: 'HospGama ',
  rating: 0, // SUSPEITO: rating 0 pode causar problemas
  reviews: 5, // Como número
  type: 'hospital'
};

const hospitalMilitarService = {
  id: 'hospital-militar-123',
  name: 'Hospital Militar Principal',
  rating: 4.5, // Rating válido > 0
  reviews: 12, // Como número  
  type: 'hospital'
};

const serviçoComProblema = {
  id: 'service-with-issue',
  name: 'Service With Issue',
  rating: 0, // Rating 0
  reviews: [], // Como array em vez de número - PROBLEMA!
  type: 'hospital'
};

console.log('\n🎯 ANÁLISE DA RENDERIZAÇÃO CONDICIONAL:');
console.log('Linha 374: {service.rating && typeof service.rating === "number" && (...)}');

function analyzeConditionalRendering(service, serviceName) {
  console.log(`\n--- Análise de ${serviceName} ---`);
  
  const condition1 = service.rating;
  const condition2 = typeof service.rating === 'number';
  const overallCondition = condition1 && condition2;
  
  console.log(`service.rating:`, service.rating);
  console.log(`service.rating (truthy):`, !!condition1);
  console.log(`typeof service.rating === 'number':`, condition2);
  console.log(`Condição geral (rating && typeof):`, overallCondition);
  
  // Analisar o campo reviews especificamente
  console.log(`service.reviews:`, service.reviews);
  console.log(`typeof service.reviews:`, typeof service.reviews);
  console.log(`typeof service.reviews === 'number':`, typeof service.reviews === 'number');
  console.log(`Valor para renderização:`, typeof service.reviews === 'number' ? service.reviews : 0);
  
  return overallCondition;
}

// Testar cada serviço
analyzeConditionalRendering(hospGamaService, 'HospGama');
analyzeConditionalRendering(hospitalMilitarService, 'Hospital Militar');
analyzeConditionalRendering(serviçoComProblema, 'Serviço com Problema');

console.log('\n🚨 PROBLEMAS IDENTIFICADOS:');

// Problema 1: Rating 0 faz a condição falhar
if (hospGamaService.rating === 0) {
  console.log('❌ PROBLEMA 1: HospGama tem rating 0');
  console.log('   A condição {service.rating && ...} falha porque 0 é falsy');
  console.log('   Isso pode estar causando renderização inesperada');
}

// Problema 2: Reviews pode ser array em vez de número
if (Array.isArray(serviçoComProblema.reviews)) {
  console.log('❌ PROBLEMA 2: Campo reviews pode ser array em vez de número');
  console.log('   Se renderizado incorretamente, causará erro "Text strings must be rendered within a <Text> component"');
}

console.log('\n🛠️ SOLUÇÕES RECOMENDADAS:');

console.log('1. ✅ Corrigir condição de rating para aceitar 0:');
console.log('   Antes: {service.rating && typeof service.rating === "number" && (...)}');
console.log('   Depois: {typeof service.rating === "number" && (...)}');

console.log('\n2. ✅ Garantir que reviews seja sempre tratado como número:');
console.log('   ({typeof service.reviews === "number" ? service.reviews : (Array.isArray(service.reviews) ? service.reviews.length : 0)})');

console.log('\n3. ✅ Adicionar validação extra no sanitizeService');

// Simulação da correção
console.log('\n🧪 SIMULAÇÃO DA CORREÇÃO:');

function simulateFixedConditional(service) {
  // Correção 1: Aceitar rating 0
  const shouldShowRating = typeof service.rating === 'number';
  
  // Correção 2: Tratar reviews adequadamente
  let reviewsCount = 0;
  if (typeof service.reviews === 'number') {
    reviewsCount = service.reviews;
  } else if (Array.isArray(service.reviews)) {
    reviewsCount = service.reviews.length;
  }
  
  console.log(`Serviço: ${service.name.trim()}`);
  console.log(`Deve mostrar rating: ${shouldShowRating}`);
  console.log(`Reviews count: ${reviewsCount}`);
  
  return { shouldShowRating, reviewsCount };
}

console.log('\nTeste das correções:');
simulateFixedConditional(hospGamaService);
simulateFixedConditional(hospitalMilitarService);
simulateFixedConditional(serviçoComProblema);

console.log('\n🎯 CÓDIGO CORRIGIDO SUGERIDO:');
console.log(`
{typeof service.rating === 'number' && (
  <View style={styles.ratingContainer}>
    <Ionicons name="star" size={20} color="#FFD700" />
    <Text style={styles.ratingText}>
      {service.rating}/5.0
    </Text>
    <Text style={styles.reviewsText}>
      ({typeof service.reviews === 'number' 
        ? service.reviews 
        : (Array.isArray(service.reviews) 
          ? service.reviews.length 
          : 0)
      })
    </Text>
  </View>
)}
`);