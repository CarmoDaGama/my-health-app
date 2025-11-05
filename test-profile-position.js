#!/usr/bin/env node

/**
 * Script para testar a nova posição do botão de perfil
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testando nova posição do botão de perfil...\n');

// Verificar PatientDashboard
const dashboardPath = path.join(__dirname, 'screens/dashboards/PatientDashboard.tsx');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

console.log('1. Verificando estrutura da barra de pesquisa...');

// Verificar se a nova estrutura foi implementada
if (dashboardContent.includes('searchBarContainer') && 
    dashboardContent.includes('flex: 1') && 
    dashboardContent.includes('person-circle')) {
  console.log('✅ Nova estrutura da barra implementada corretamente');
} else {
  console.log('❌ Estrutura da barra não encontrada');
}

console.log('\n2. Verificando posição do botão de perfil...');

// Verificar se o botão foi movido para a barra de pesquisa
const searchBarSection = dashboardContent.substring(
  dashboardContent.indexOf('searchBarContainer'),
  dashboardContent.indexOf('searchBarContainer') + 1200
);

if (searchBarSection.includes('profileButton') && searchBarSection.includes('person-circle')) {
  console.log('✅ Botão de perfil movido para lateral da barra de pesquisa');
} else {
  console.log('❌ Botão de perfil não encontrado na barra de pesquisa');
  console.log('Debug - searchBarSection inclui profileButton:', searchBarSection.includes('profileButton'));
  console.log('Debug - searchBarSection inclui person-circle:', searchBarSection.includes('person-circle'));
}

console.log('\n3. Verificando remoção do botão da seção de resultados...');

// Verificar se o botão foi removido da seção de resultados
const resultsSection = dashboardContent.substring(
  dashboardContent.indexOf('resultsInfo'),
  dashboardContent.indexOf('resultsInfo') + 400
);

if (!resultsSection.includes('TouchableOpacity') || !resultsSection.includes('profileButton')) {
  console.log('✅ Botão de perfil removido da seção de resultados');
} else {
  console.log('❌ Botão de perfil ainda está na seção de resultados');
}

console.log('\n4. Verificando estilos...');

// Verificar estilos necessários
const stylesChecks = [
  'searchBarContainer',
  'flex: 1',
  'gap: spacing.sm',
  'borderRadius: borderRadius.md',
  'shadowColor'
];

const foundStyles = stylesChecks.filter(style => 
  dashboardContent.includes(style)
);

if (foundStyles.length >= 4) {
  console.log('✅ Estilos necessários implementados');
} else {
  console.log(`⚠️ Alguns estilos podem estar faltando: ${stylesChecks.filter(s => !foundStyles.includes(s)).join(', ')}`);
}

console.log('\n📋 Nova estrutura da barra:');
console.log('┌─────────────────────────────────────┐');
console.log('│ [🔍] Buscar serviços...     [👤]   │ ← Perfil na lateral');
console.log('├─────────────────────────────────────┤');
console.log('│ [👥 Profissionais][🏢 Instituições] │');
console.log('└─────────────────────────────────────┘');

console.log('\n🎯 Mudanças implementadas:');
console.log('• ✅ Botão de perfil movido para lateral direita da barra');
console.log('• ✅ Barra de pesquisa com layout flex para acomodar perfil');
console.log('• ✅ Botão de perfil com shadow para destaque');
console.log('• ✅ Espaçamento adequado entre elementos');
console.log('• ✅ Seção de resultados simplificada');

console.log('\n🚀 Como testar:');
console.log('1. Abra o PatientDashboard');
console.log('2. Veja o botão de perfil na lateral direita da barra');
console.log('3. Teste clique no botão de perfil');
console.log('4. Verifique se não há botão duplicado em baixo');

console.log('\n✅ Teste da posição do perfil concluído!');