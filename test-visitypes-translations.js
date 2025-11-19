/**
 * Teste Final das Traduções dos visitTypes
 * 
 * Este teste verifica se as traduções dos visitTypes estão funcionando
 * corretamente após a correção das duplicações no arquivo i18n.ts
 */

const path = require('path');
const fs = require('fs');

// Simular importação das traduções
console.log('🧪 TESTE: Verificação das traduções visitTypes');
console.log('===============================================');

// Carregar arquivo i18n.ts e verificar estrutura
const i18nPath = path.join(__dirname, 'utils', 'i18n.ts');

try {
  const i18nContent = fs.readFileSync(i18nPath, 'utf8');
  
  // Verificar se não há mais duplicações
  const reviewsMatches = i18nContent.match(/^\s*reviews:\s*{/gm);
  console.log(`✅ Seções 'reviews:' encontradas: ${reviewsMatches ? reviewsMatches.length : 0}`);
  
  if (reviewsMatches && reviewsMatches.length <= 2) {
    console.log('✅ Duplicações removidas com sucesso!');
  } else {
    console.log('❌ Ainda há duplicações no arquivo');
  }
  
  // Verificar se visitTypes existem nas duas seções
  const visitTypesMatches = i18nContent.match(/visitTypes:\s*{[\s\S]*?}/g);
  console.log(`✅ Seções 'visitTypes' encontradas: ${visitTypesMatches ? visitTypesMatches.length : 0}`);
  
  if (visitTypesMatches && visitTypesMatches.length >= 2) {
    console.log('✅ visitTypes presentes em EN e PT');
    
    // Verificar conteúdo das traduções
    visitTypesMatches.forEach((match, index) => {
      const lang = index === 0 ? 'EN' : 'PT';
      console.log(`\n${lang} visitTypes:`);
      
      const types = ['consultation', 'emergency', 'routine', 'exam', 'procedure'];
      types.forEach(type => {
        const regex = new RegExp(`${type}:\\s*['"]([^'"]+)['"]`);
        const typeMatch = match.match(regex);
        if (typeMatch) {
          console.log(`  ✅ ${type}: ${typeMatch[1]}`);
        } else {
          console.log(`  ❌ ${type}: NÃO ENCONTRADO`);
        }
      });
    });
  } else {
    console.log('❌ visitTypes não encontrados ou incompletos');
  }
  
} catch (error) {
  console.error('❌ Erro ao ler arquivo i18n.ts:', error.message);
}

console.log('\n🎯 RESULTADO:');
console.log('=============');
console.log('Se todas as verificações acima mostrarem ✅, as traduções devem funcionar.');
console.log('Teste no app para confirmar que não há mais mensagens de [missing translation].');

console.log('\n📱 PRÓXIMOS PASSOS:');
console.log('===================');
console.log('1. Reiniciar o servidor de desenvolvimento');
console.log('2. Testar o formulário de avaliações');
console.log('3. Verificar se as traduções aparecem corretamente');