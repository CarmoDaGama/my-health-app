/**
 * Script para testar e implantar regras do Firestore
 * 
 * Este script ajuda a verificar se as regras do Firestore estão corretas
 * antes de implantá-las no Firebase.
 */

console.log('🔥 TESTE: Regras do Firestore para Avaliações Temáticas');
console.log('=======================================================');

const fs = require('fs');
const path = require('path');

// Ler as regras do firestore.rules
const rulesPath = path.join(__dirname, 'firestore.rules');

try {
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  
  console.log('✅ Arquivo firestore.rules carregado com sucesso');
  
  // Verificar se as novas coleções estão nas regras
  const requiredCollections = [
    'thematicReviews',
    'serviceInsights', 
    'reviewStats'
  ];
  
  const requiredFunctions = [
    'validateThematicReviewData',
    'validateThematicReviewUpdate'
  ];
  
  console.log('\n🔍 Verificando coleções nas regras:');
  console.log('===================================');
  
  requiredCollections.forEach(collection => {
    const hasCollection = rulesContent.includes(`match /${collection}/`);
    console.log(`${hasCollection ? '✅' : '❌'} ${collection}: ${hasCollection ? 'CONFIGURADO' : 'FALTANDO'}`);
  });
  
  console.log('\n🔍 Verificando funções de validação:');
  console.log('====================================');
  
  requiredFunctions.forEach(func => {
    const hasFunction = rulesContent.includes(`function ${func}(`);
    console.log(`${hasFunction ? '✅' : '❌'} ${func}: ${hasFunction ? 'DEFINIDO' : 'FALTANDO'}`);
  });
  
  // Verificar sintaxe básica das regras
  console.log('\n🔍 Verificações de sintaxe:');
  console.log('===========================');
  
  const hasRulesVersion = rulesContent.includes("rules_version = '2';");
  console.log(`${hasRulesVersion ? '✅' : '❌'} rules_version: ${hasRulesVersion ? 'OK' : 'FALTANDO'}`);
  
  const hasServiceClause = rulesContent.includes('service cloud.firestore');
  console.log(`${hasServiceClause ? '✅' : '❌'} service clause: ${hasServiceClause ? 'OK' : 'FALTANDO'}`);
  
  // Contar chaves abertas vs fechadas
  const openBraces = (rulesContent.match(/{/g) || []).length;
  const closeBraces = (rulesContent.match(/}/g) || []).length;
  console.log(`${openBraces === closeBraces ? '✅' : '❌'} Balanceamento de chaves: ${openBraces} aberta(s), ${closeBraces} fechada(s)`);
  
  console.log('\n📋 INSTRUÇÕES PARA IMPLANTAÇÃO:');
  console.log('===============================');
  console.log('1. Faça login no Firebase Console: https://console.firebase.google.com');
  console.log('2. Selecione seu projeto');
  console.log('3. Vá em Firestore Database > Rules');
  console.log('4. Cole o conteúdo do arquivo firestore.rules');
  console.log('5. Clique em "Publicar"');
  
  console.log('\n🔑 REGRAS ADICIONADAS PARA AVALIAÇÕES TEMÁTICAS:');
  console.log('================================================');
  console.log('• thematicReviews: Usuários autenticados podem criar, ler é público');
  console.log('• serviceInsights: Leitura pública, escrita apenas por sistema');
  console.log('• reviewStats: Leitura pública, escrita apenas por sistema');
  console.log('• Validação completa de dados temáticos');
  console.log('• Proteção contra campos maliciosos');
  
  console.log('\n⚡ TESTE RÁPIDO:');
  console.log('================');
  console.log('Após implantar as regras, tente criar uma avaliação temática no app.');
  console.log('Se não houver erro de permissões, as regras foram aplicadas corretamente.');
  
} catch (error) {
  console.error('❌ Erro ao ler arquivo de regras:', error.message);
}

console.log('\n✨ Script concluído!');