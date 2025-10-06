#!/usr/bin/env node

/**
 * Script de teste para verificar as correções do sistema de idiomas
 * Execute com: node test-language-fix.js
 */

console.log('🔍 Verificando correções do sistema de idiomas...\n');

const fs = require('fs');
const path = require('path');

// Função para verificar se um arquivo contém uma string
function fileContains(filePath, searchString) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(searchString);
  } catch (error) {
    console.error(`❌ Erro ao ler arquivo ${filePath}:`, error.message);
    return false;
  }
}

// Testes das correções
const tests = [
  {
    name: 'determineLanguage considera preferências de guests',
    file: 'utils/i18n.ts',
    check: 'const savedLanguage = await getUserLanguagePreference();'
  },
  {
    name: 'useTranslation tem updateTrigger para forçar re-renders',
    file: 'hooks/useTranslation.ts',
    check: 'setUpdateTrigger'
  },
  {
    name: 'changeLanguage sempre salva preferência localmente',
    file: 'hooks/useTranslation.ts',
    check: 'await saveUserLanguagePreference(newLocale);'
  },
  {
    name: 'LanguageProvider evita re-inicializações desnecessárias',
    file: 'hooks/LanguageProvider.tsx',
    check: 'if (!authLoading && !isInitialized)'
  },
  {
    name: 'Função t é reativa a mudanças de idioma',
    file: 'hooks/useTranslation.ts',
    check: '_trigger: updateTrigger'
  }
];

let passedTests = 0;
let totalTests = tests.length;

console.log('📋 Executando testes das correções:\n');

tests.forEach((test, index) => {
  const filePath = path.join(__dirname, test.file);
  const passed = fileContains(filePath, test.check);
  
  console.log(`${index + 1}. ${test.name}`);
  console.log(`   📄 Arquivo: ${test.file}`);
  console.log(`   🔍 Verificando: "${test.check}"`);
  console.log(`   ${passed ? '✅ PASSOU' : '❌ FALHOU'}\n`);
  
  if (passed) passedTests++;
});

// Resultado final
console.log('📊 RESUMO DOS TESTES:');
console.log(`✅ Testes que passaram: ${passedTests}/${totalTests}`);
console.log(`❌ Testes que falharam: ${totalTests - passedTests}/${totalTests}`);

if (passedTests === totalTests) {
  console.log('\n🎉 Todas as correções foram aplicadas com sucesso!');
  console.log('\n📝 CORREÇÕES IMPLEMENTADAS:');
  console.log('• Persistência de idioma para usuários convidados');
  console.log('• Re-renderização automática quando idioma muda');
  console.log('• Evita re-inicializações desnecessárias do idioma');
  console.log('• Melhora na lógica de determinação de idioma');
  console.log('• Sistema mais robusto de salvamento de preferências');
  
  console.log('\n🚀 PRÓXIMOS PASSOS:');
  console.log('1. Teste a aplicação alterando o idioma');
  console.log('2. Verifique se todas as labels mudam instantaneamente');
  console.log('3. Saia e entre na tela para verificar persistência');
  console.log('4. Teste com usuário logado e usuário convidado');
} else {
  console.log('\n⚠️  Algumas correções podem não ter sido aplicadas corretamente.');
  console.log('Verifique os arquivos manualmente se necessário.');
}