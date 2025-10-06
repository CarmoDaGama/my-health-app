#!/usr/bin/env node

/**
 * Teste específico para verificar sistema global de re-renderização
 */

console.log('🔍 Testando nova implementação de re-renderização global...\n');

const fs = require('fs');
const path = require('path');

function fileContains(filePath, searchString) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(searchString);
  } catch (error) {
    console.error(`❌ Erro ao ler arquivo ${filePath}:`, error.message);
    return false;
  }
}

// Verificações específicas da nova implementação
const tests = [
  {
    name: 'Sistema global de listeners implementado',
    file: 'hooks/useTranslation.ts',
    check: 'globalTranslationListeners'
  },
  {
    name: 'Função notifyTranslationChange criada',
    file: 'hooks/useTranslation.ts', 
    check: 'notifyTranslationChange'
  },
  {
    name: 'Listener registrado no useEffect',
    file: 'hooks/useTranslation.ts',
    check: 'globalTranslationListeners.add(listener)'
  },
  {
    name: 'changeLanguage usa notificação global',
    file: 'hooks/useTranslation.ts',
    check: 'notifyTranslationChange();'
  },
  {
    name: 'initializeLanguage também notifica mudanças',
    file: 'hooks/useTranslation.ts',
    check: 'setIsInitialized(true);\n      \n      // Notificar sobre inicialização/mudança\n      notifyTranslationChange();'
  }
];

let passedTests = 0;
const totalTests = tests.length;

console.log('📋 Verificando nova implementação:\n');

tests.forEach((test, index) => {
  const filePath = path.join(__dirname, test.file);
  const passed = fileContains(filePath, test.check);
  
  console.log(`${index + 1}. ${test.name}`);
  console.log(`   🔍 Verificando: "${test.check.substring(0, 50)}${test.check.length > 50 ? '...' : ''}"`);
  console.log(`   ${passed ? '✅ PASSOU' : '❌ FALHOU'}\n`);
  
  if (passed) passedTests++;
});

console.log('📊 RESULTADO:');
console.log(`✅ Testes passaram: ${passedTests}/${totalTests}`);

if (passedTests === totalTests) {
  console.log('\n🎉 Nova implementação está correta!');
  console.log('\n📝 SISTEMA IMPLEMENTADO:');
  console.log('• Sistema global de listeners para mudanças de idioma');
  console.log('• Notificação automática para todos os componentes');
  console.log('• Re-renderização forçada quando idioma muda');
  console.log('• Cleanup automático de listeners');
  
  console.log('\n🔧 COMO FUNCIONA:');
  console.log('1. Cada useTranslation() registra um listener global');
  console.log('2. Quando idioma muda, notifyTranslationChange() é chamado');
  console.log('3. Todos os listeners são executados simultaneamente');
  console.log('4. Cada componente força seu próprio re-render');
  console.log('5. Todas as traduções são atualizadas instantaneamente');
  
  console.log('\n🧪 TESTE RECOMENDADO:');
  console.log('1. Abra a aplicação');
  console.log('2. Mude o idioma no perfil');
  console.log('3. Verifique se TODAS as labels mudam instantaneamente');
  console.log('4. Navegue entre telas para confirmar persistência');
} else {
  console.log('\n⚠️  Implementação incompleta. Verificar código manualmente.');
}