/**
 * DEBUG PROFUNDO: Análise Detalhada do Erro de Permissões
 * 
 * Este script investiga exatamente onde o erro está ocorrendo
 */

import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';

console.log('🔍 DEBUG PROFUNDO: Erro de Permissões Thematic Reviews');
console.log('====================================================');

// Simular configuração do Firebase
console.log('\n1️⃣ VERIFICAÇÃO DE CONFIGURAÇÃO:');
console.log('===============================');

// Verificar se as constantes estão corretas
const mockAuth = {
  currentUser: {
    uid: 'test-user-123',
    displayName: 'João Teste',
    email: 'joao@teste.com',
    photoURL: null
  }
};

const mockServiceData = {
  serviceId: 'service-123',
  serviceName: 'Hospital Central',
  serviceType: 'hospital',
  categoryRatings: [
    { category: 'infrastructure', rating: 4 },
    { category: 'medical_care', rating: 5 },
    { category: 'wait_time', rating: 3 }
  ],
  visitContext: 'consultation',
  generalComment: 'Excelente atendimento!'
};

console.log('✅ Usuário simulado:', {
  uid: mockAuth.currentUser.uid,
  name: mockAuth.currentUser.displayName,
  email: mockAuth.currentUser.email
});

console.log('✅ Dados do serviço:', mockServiceData);

console.log('\n2️⃣ CONSTRUÇÃO DOS DADOS:');
console.log('========================');

// Simular construção dos dados exatamente como no código
const user = mockAuth.currentUser;
const overallRating = 4.0; // Calculado

const reviewData = {
  serviceId: mockServiceData.serviceId,
  serviceName: mockServiceData.serviceName,
  serviceType: mockServiceData.serviceType,
  userId: user.uid,
  userName: user.displayName || 'Usuário Anônimo',
  ...(user.photoURL && { userAvatar: user.photoURL }),
  categoryRatings: mockServiceData.categoryRatings,
  overallRating: overallRating,
  ...(mockServiceData.generalComment && mockServiceData.generalComment.trim() && { 
    generalComment: mockServiceData.generalComment.trim() 
  }),
  visitContext: mockServiceData.visitContext,
  createdAt: new Date(),
  updatedAt: new Date(),
  verified: false,
  helpful: 0,
  reportCount: 0
};

console.log('📋 Dados construídos:', reviewData);

// Limpeza dos dados
const cleanReviewData = Object.fromEntries(
  Object.entries(reviewData).filter(([_, value]) => 
    value !== undefined && 
    value !== null && 
    (typeof value !== 'string' || value.trim() !== '')
  )
);

console.log('🧹 Dados limpos:', cleanReviewData);
console.log('🔢 Total de campos:', Object.keys(cleanReviewData).length);

console.log('\n3️⃣ ANÁLISE DE CAMPOS:');
console.log('=====================');

Object.entries(cleanReviewData).forEach(([key, value]) => {
  const type = typeof value;
  const isValid = value !== undefined && value !== null;
  console.log(`   ${isValid ? '✅' : '❌'} ${key}: ${type} = ${JSON.stringify(value)}`);
});

console.log('\n4️⃣ VERIFICAÇÃO DAS REGRAS:');
console.log('==========================');

// Campos exigidos pelas regras Firestore atuais (regra temporária)
const requiredByRules = ['serviceId', 'userId']; // Regra temporária só exige autenticação

const missingRequired = requiredByRules.filter(field => 
  !cleanReviewData.hasOwnProperty(field) || 
  cleanReviewData[field] === undefined ||
  cleanReviewData[field] === null ||
  cleanReviewData[field] === ''
);

if (missingRequired.length === 0) {
  console.log('✅ Todos os campos obrigatórios presentes');
} else {
  console.log('❌ Campos obrigatórios ausentes:', missingRequired);
}

console.log('\n5️⃣ POSSÍVEIS CAUSAS DO ERRO:');
console.log('============================');

const possibleCauses = [
  {
    cause: 'Usuário não autenticado',
    check: user && user.uid,
    solution: 'Verificar auth.currentUser no momento da chamada'
  },
  {
    cause: 'Coleção inexistente',
    check: true, // Não podemos verificar isso aqui
    solution: 'Verificar se coleção "thematicReviews" existe no Firestore'
  },
  {
    cause: 'Projeto Firebase incorreto',
    check: true,
    solution: 'Verificar se está conectado ao projeto health-app-angola'
  },
  {
    cause: 'Regras não aplicadas',
    check: true,
    solution: 'Verificar se deploy das regras foi realmente aplicado'
  },
  {
    cause: 'Cache do Firebase',
    check: true,
    solution: 'Aguardar propagação ou forçar refresh'
  }
];

possibleCauses.forEach((item, index) => {
  const status = item.check ? '✅' : '❌';
  console.log(`${index + 1}. ${status} ${item.cause}`);
  console.log(`   Solução: ${item.solution}`);
});

console.log('\n6️⃣ TESTE SIMPLIFICADO:');
console.log('======================');

const minimalData = {
  serviceId: mockServiceData.serviceId,
  userId: user.uid,
  createdAt: new Date()
};

console.log('📦 Dados mínimos para teste:', minimalData);
console.log('💡 Tente criar um documento com apenas estes campos');

console.log('\n7️⃣ COMANDO DE DEBUG:');
console.log('====================');

console.log('Execute este código no console do app:');
console.log(`
// 1. Verificar autenticação
console.log('User:', auth.currentUser);

// 2. Testar criação simples
const testData = {
  serviceId: 'test-123',
  userId: auth.currentUser?.uid,
  message: 'Teste de permissões',
  createdAt: new Date()
};

// 3. Tentar adicionar documento
addDoc(collection(db, 'thematicReviews'), testData)
  .then(ref => console.log('✅ Sucesso:', ref.id))
  .catch(err => console.error('❌ Erro:', err));
`);

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('==================');
console.log('1. Execute o comando de debug acima');
console.log('2. Verifique os logs do console Firebase');  
console.log('3. Teste com dados mínimos primeiro');
console.log('4. Adicione campos gradualmente');
console.log('5. Identifique exatamente qual campo causa o erro');