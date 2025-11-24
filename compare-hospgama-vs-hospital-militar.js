/**
 * Comparação entre HospGama e Hospital Militar Principal
 * Para identificar qual diferença está causando o erro de renderização
 */

// Simular dados baseados nos padrões que vi nos logs
// HospGama - com problemas
const hospGamaData = {
  id: 'n1KbATJbQJgaDboSNDRu4E1Tmr42',
  name: 'HospGama ',
  type: 'hospital',
  coordinates: {
    latitude: -8.8383,
    longitude: 13.2344
  },
  address: 'Luanda, Angola',
  // Possíveis campos problemáticos que podem estar causando o erro
  rating: 4.2,
  phone: '+244 923 456 789',
  email: 'contato@hospgama.ao',
  specialty: 'General Medicine',
  clinic: 'Hospital Geral',
  services: ['Emergency', 'Surgery', 'Consultation'],
  description: 'Hospital geral em Luanda',
  // Campos que podem estar como objetos quando deveriam ser strings
  schedule: {
    monday: '07:00-19:00',
    tuesday: '07:00-19:00',
    wednesday: '07:00-19:00',
    thursday: '07:00-19:00',
    friday: '07:00-19:00',
    saturday: '08:00-14:00',
    sunday: 'Closed'
  },
  // Possível campo problemático
  experience: 'Mais de 10 anos de experiência',
  insurance: ['SAUDE', 'PARTICULAR'],
  // Outros campos que podem estar causando problemas
  metadata: {
    created: new Date(),
    updated: new Date(),
    verified: true
  }
};

// Hospital Militar Principal - funcionando
const hospitalMilitarData = {
  id: 'hospital-militar-123',
  name: 'Hospital Militar Principal',
  type: 'hospital',
  coordinates: {
    latitude: -8.8400,
    longitude: 13.2350
  },
  address: 'Luanda, Angola',
  rating: 4.5,
  phone: '+244 922 123 456',
  email: 'hmp@militar.ao',
  specialty: 'Military Medicine',
  clinic: 'Hospital Militar',
  services: ['Emergency', 'Surgery', 'Radiology'],
  description: 'Hospital militar de referência',
  schedule: 'Segunda a Sexta: 08:00-17:00',
  experience: '15 anos de serviço',
  insurance: ['MILITAR', 'PARTICULAR']
};

console.log('🔍 COMPARAÇÃO: HospGama vs Hospital Militar Principal');
console.log('================================================');

function analyzeField(fieldName, hospGamaValue, hospitalMilitarValue) {
  console.log(`\n📊 CAMPO: ${fieldName}`);
  console.log(`HospGama:`, typeof hospGamaValue, hospGamaValue);
  console.log(`Hospital Militar:`, typeof hospitalMilitarValue, hospitalMilitarValue);
  
  const hospGamaType = typeof hospGamaValue;
  const hospitalMilitarType = typeof hospitalMilitarValue;
  
  if (hospGamaType !== hospitalMilitarType) {
    console.log(`⚠️ DIFERENÇA DE TIPO: ${hospGamaType} vs ${hospitalMilitarType}`);
    return true;
  }
  
  // Verificar se é um objeto complexo
  if (hospGamaType === 'object' && hospGamaValue !== null) {
    if (Array.isArray(hospGamaValue) !== Array.isArray(hospitalMilitarValue)) {
      console.log(`⚠️ DIFERENÇA: Um é array, outro não`);
      return true;
    }
    
    if (!Array.isArray(hospGamaValue)) {
      console.log(`⚠️ OBJETO COMPLEXO DETECTADO em HospGama`);
      return true;
    }
  }
  
  // Verificar strings com espaços
  if (hospGamaType === 'string') {
    const hasTrailingSpace = hospGamaValue.endsWith(' ');
    const hasLeadingSpace = hospGamaValue.startsWith(' ');
    if (hasTrailingSpace || hasLeadingSpace) {
      console.log(`⚠️ STRING COM ESPAÇOS: leading=${hasLeadingSpace}, trailing=${hasTrailingSpace}`);
      return true;
    }
  }
  
  return false;
}

console.log('\n🔍 ANÁLISE CAMPO POR CAMPO:');

const fields = ['name', 'type', 'coordinates', 'address', 'rating', 'phone', 'email', 
               'specialty', 'clinic', 'services', 'description', 'schedule', 'experience', 'insurance'];

const problematicFields = [];

fields.forEach(field => {
  const hasIssue = analyzeField(field, hospGamaData[field], hospitalMilitarData[field]);
  if (hasIssue) {
    problematicFields.push(field);
  }
});

console.log('\n🚨 CAMPOS PROBLEMÁTICOS IDENTIFICADOS:');
problematicFields.forEach((field, index) => {
  console.log(`${index + 1}. ${field}`);
});

console.log('\n🎯 ANÁLISE ESPECÍFICA DOS PROBLEMAS:');

// 1. Analisar o campo name
if (hospGamaData.name.endsWith(' ')) {
  console.log('❌ PROBLEMA 1: Nome "HospGama " tem espaço no final');
  console.log('   Isso pode causar problemas quando renderizado diretamente');
}

// 2. Analisar o campo schedule  
if (typeof hospGamaData.schedule === 'object' && typeof hospitalMilitarData.schedule === 'string') {
  console.log('❌ PROBLEMA 2: Schedule é objeto em HospGama, string em Hospital Militar');
  console.log('   ServiceDetailScreen pode tentar renderizar o objeto diretamente');
}

// 3. Analisar outros campos que podem ser objetos
if (hospGamaData.metadata && !hospitalMilitarData.metadata) {
  console.log('❌ PROBLEMA 3: HospGama tem campo "metadata" complexo');
  console.log('   Pode estar sendo renderizado inadvertidamente');
}

console.log('\n🔍 SIMULAÇÃO DE RENDERIZAÇÃO:');

// Simular como o ServiceDetailScreen processa os campos
function simulateServiceDetailRendering(service, serviceName) {
  console.log(`\n--- Simulando renderização de ${serviceName} ---`);
  
  // Verificar campos que são renderizados condicionalmente
  Object.keys(service).forEach(key => {
    const value = service[key];
    
    if (value && typeof value === 'object' && !Array.isArray(value) && key !== 'coordinates') {
      console.log(`⚠️ RISCO: Campo "${key}" é objeto:`, value);
      console.log(`   Se renderizado como {${key}} causará erro "Text strings must be rendered within a <Text> component"`);
    }
    
    if (typeof value === 'string' && (value.startsWith(' ') || value.endsWith(' '))) {
      console.log(`⚠️ RISCO: Campo "${key}" tem espaços extras:`, JSON.stringify(value));
    }
  });
}

simulateServiceDetailRendering(hospGamaData, 'HospGama');
simulateServiceDetailRendering(hospitalMilitarData, 'Hospital Militar');

console.log('\n🛠️ SOLUÇÕES RECOMENDADAS:');
console.log('1. ✅ Limpar nome: "HospGama " → "HospGama"');
console.log('2. ✅ Converter schedule para string ou renderizar condicionalmente');
console.log('3. ✅ Filtrar campos metadata antes de passar para componentes');
console.log('4. ✅ Validar todos os campos antes da renderização no ServiceDetailScreen');

console.log('\n📝 CÓDIGO PARA CORREÇÃO:');
console.log(`
// No ServiceDetailScreen, antes da renderização:
const sanitizeService = (service) => ({
  ...service,
  name: typeof service.name === 'string' ? service.name.trim() : service.name,
  schedule: typeof service.schedule === 'object' 
    ? Object.entries(service.schedule).map(([day, time]) => \`\${day}: \${time}\`).join(', ')
    : service.schedule
});

const cleanService = sanitizeService(service);
`);

console.log('\n🎯 PRINCIPAL SUSPEITO:');
console.log('O campo "schedule" sendo objeto em HospGama vs string em Hospital Militar');
console.log('é provavelmente a causa raiz do erro de renderização.');