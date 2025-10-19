/**
 * Script de teste para validações de usuário
 * Execute com: node scripts/test-user-validations.js
 */

const { UserType } = require('../types');

// Simular usuários para teste
const testUsers = [
  {
    id: '1',
    name: 'Dr. João Silva',
    email: 'joao@email.com',
    userType: UserType.PROFESSIONAL,
    isActive: true,
    isVerified: false, // Profissional não verificado
  },
  {
    id: '2', 
    name: 'Hospital Central',
    email: 'contato@hospital.com',
    userType: UserType.INSTITUTION,
    isActive: true,
    isVerified: true, // Instituição verificada
  },
  {
    id: '3',
    name: 'Maria Santos',
    email: 'maria@email.com', 
    userType: UserType.NORMAL_USER,
    isActive: false, // Usuário inativo
    isVerified: true,
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana@email.com',
    userType: UserType.NORMAL_USER,
    isActive: true,
    isVerified: true, // Usuário normal ativo
  }
];

// Simular validação de login
function simulateLogin(user) {
  console.log(`\n🔐 Tentativa de login: ${user.name} (${user.userType})`);
  
  if (user.isActive === false || user.isActive === null || user.isActive === undefined) {
    console.log('❌ Login NEGADO - Conta inativa');
    console.log('💬 Mensagem: "Sua conta foi desativada. Entre em contato com o suporte para assistência."');
    return false;
  }
  
  console.log('✅ Login PERMITIDO');
  return true;
}

// Simular busca de serviços
function simulateServiceSearch(users) {
  console.log('\n🔍 Busca de serviços (apenas verificados aparecerão):');
  
  const visibleServices = users.filter(user => {
    // Apenas profissionais e instituições verificados aparecem
    if (user.userType === UserType.PROFESSIONAL || user.userType === UserType.INSTITUTION) {
      return user.isVerified === true;
    }
    return false; // Usuários normais não aparecem como serviços
  });
  
  console.log(`📋 Serviços visíveis: ${visibleServices.length} de ${users.length} usuários`);
  visibleServices.forEach(service => {
    console.log(`   ✓ ${service.name} (${service.userType})`);
  });
  
  const hiddenServices = users.filter(user => {
    if (user.userType === UserType.PROFESSIONAL || user.userType === UserType.INSTITUTION) {
      return user.isVerified !== true;
    }
    return false;
  });
  
  console.log(`🚫 Serviços ocultos: ${hiddenServices.length}`);
  hiddenServices.forEach(service => {
    console.log(`   ✗ ${service.name} (${service.userType}) - Não verificado`);
  });
}

// Simular aviso de verificação
function simulateVerificationWarning(user) {
  if (user.userType === UserType.PROFESSIONAL || user.userType === UserType.INSTITUTION) {
    if (user.isVerified !== true) {
      console.log(`\n⚠️  Aviso para ${user.name}:`);
      console.log('💬 "Sua conta profissional ainda não foi verificada e não aparecerá nas buscas."');
      return true;
    }
  }
  return false;
}

// Executar testes
console.log('🧪 TESTE DAS VALIDAÇÕES DE USUÁRIO\n');
console.log('=' * 50);

// Teste 1: Validações de login
console.log('\n📍 TESTE 1: VALIDAÇÕES DE LOGIN');
testUsers.forEach(simulateLogin);

// Teste 2: Busca de serviços
console.log('\n📍 TESTE 2: BUSCA DE SERVIÇOS');
simulateServiceSearch(testUsers);

// Teste 3: Avisos de verificação
console.log('\n📍 TESTE 3: AVISOS DE VERIFICAÇÃO');
testUsers.forEach(user => {
  simulateVerificationWarning(user);
});

console.log('\n' + '=' * 50);
console.log('✅ TESTES CONCLUÍDOS');
console.log('\n📚 Resumo:');
console.log('- isActive: false/null/undefined → Login NEGADO');
console.log('- isVerified: false/null/undefined → Não aparece na busca (apenas prof/inst)');
console.log('- Avisos mostrados para profissionais/instituições não verificados');