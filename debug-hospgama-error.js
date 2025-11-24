/**
 * Test para identificar o problema específico do HospGama
 */
const admin = require('firebase-admin');

// Inicializar Firebase Admin se necessário
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: 'mendlink-healthcare'
    });
  } catch (error) {
    console.log('⚠️ Firebase Admin não disponível. Simulando dados...');
  }
}

// Simular o serviceId específico do HospGama mencionado no log
const hospGamaServiceId = 'n1KbATJbQJgaDboSNDRu4E1Tmr42';
const hospGamaName = 'HospGama '; // Note o espaço no final

console.log('🔍 Analisando problema do HospGama');
console.log('ServiceId:', hospGamaServiceId);
console.log('ServiceName:', JSON.stringify(hospGamaName));
console.log('ServiceName Length:', hospGamaName.length);
console.log('Tem espaço no final?', hospGamaName.endsWith(' '));

// Simular dados de review com problemas potenciais
const problematicReview = {
  id: 'test-review-1',
  serviceId: hospGamaServiceId,
  serviceName: hospGamaName,
  serviceType: 'hospital',
  userId: 'user123',
  userName: 'Test User',
  categoryRatings: {
    'infrastructure': 4.0,
    'medical_care': 3.5,
    'wait_time': 2.0
  },
  overallRating: 3.2,
  generalComment: 'Bom atendimento, mas espera longa.',
  createdAt: new Date(),
  updatedAt: new Date(),
  verified: true,
  helpful: 5,
  reportCount: 0,
  visitContext: {
    visitDate: new Date(),
    visitType: 'routine',
    waitTime: 60,
    costRange: 'medium'
  }
};

console.log('\n📊 Review de teste:');
console.log(JSON.stringify(problematicReview, null, 2));

// Testar se há algum problema na estrutura de dados
console.log('\n🔍 Verificando tipos de dados:');
console.log('categoryRatings type:', typeof problematicReview.categoryRatings);
console.log('categoryRatings é objeto?:', typeof problematicReview.categoryRatings === 'object');
console.log('categoryRatings entries:', Object.entries(problematicReview.categoryRatings));

console.log('\n🔍 Verificando visitContext:');
console.log('visitContext type:', typeof problematicReview.visitContext);
console.log('visitContext.visitType:', problematicReview.visitContext.visitType);
console.log('visitContext.visitType type:', typeof problematicReview.visitContext.visitType);

// Verificar se há algum problema potencial de renderização
console.log('\n⚠️ PROBLEMAS POTENCIAIS:');

// 1. Nome com espaço no final
if (hospGamaName.endsWith(' ')) {
  console.log('❌ PROBLEMA 1: Nome do serviço tem espaço no final');
}

// 2. CategoryRatings sendo renderizado diretamente
const categoryRatings = problematicReview.categoryRatings;
const sortedCategories = Object.entries(categoryRatings)
  .filter(([category, rating]) => typeof category === 'string' && typeof rating === 'number')
  .sort(([,a], [,b]) => b - a)
  .slice(0, 2);

console.log('Top categories processed:', sortedCategories);

// 3. VisitContext sendo renderizado
const visitContext = problematicReview.visitContext;
if (visitContext) {
  console.log('Visit context processed:', {
    isString: typeof visitContext === 'string',
    isObject: typeof visitContext === 'object',
    visitType: visitContext.visitType,
    visitTypeType: typeof visitContext.visitType
  });
}

console.log('\n💡 POSSÍVEIS CAUSAS DO ERRO:');
console.log('1. ❌ String com espaço sendo renderizada fora de <Text>');
console.log('2. ❌ Objeto sendo renderizado diretamente');
console.log('3. ❌ Array ou função sendo retornada onde deveria ser JSX');
console.log('4. ❌ Componente retornando valor primitivo ao invés de JSX');

console.log('\n🔧 VERIFICAÇÕES NECESSÁRIAS:');
console.log('1. Verificar se ThematicReviewsPreview está retornando JSX válido');
console.log('2. Verificar se todas as renderizações condicionais são válidas');
console.log('3. Verificar se não há objetos sendo renderizados diretamente');
console.log('4. Verificar se não há problemas com o serviceId específico');

// Simular problema de renderização
console.log('\n🚨 SIMULANDO POSSÍVEIS ERROS:');

// Erro tipo 1: Tentar renderizar string diretamente
console.log('Tipo 1 - String direta (CAUSARIA ERRO):');
// return hospGamaName; // Isso causaria o erro "Text strings must be rendered within a <Text> component"

// Erro tipo 2: Tentar renderizar objeto diretamente  
console.log('Tipo 2 - Objeto direto (CAUSARIA ERRO):');
// return categoryRatings; // Isso causaria erro de renderização

// Erro tipo 3: Função retornando valor primitivo
console.log('Tipo 3 - Função retornando primitivo:');
const problematicFunction = () => {
  return 'String primitiva'; // Problemático se usado em JSX
};

console.log('\n✅ CONCLUSÃO: O erro provavelmente está em alguma renderização condicional');
console.log('    que retorna string ou objeto ao invés de JSX válido.');