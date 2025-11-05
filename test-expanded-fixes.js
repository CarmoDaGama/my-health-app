const fs = require('fs');
const path = require('path');

// Teste das correções da barra expandida
function testExpandedBarFixes() {
  console.log('🔧 Testando correções da barra expandida...\n');

  const dashboardPath = path.join(__dirname, 'screens/dashboards/PatientDashboard.tsx');
  
  if (!fs.existsSync(dashboardPath)) {
    console.log('❌ Arquivo PatientDashboard.tsx não encontrado');
    return;
  }

  const content = fs.readFileSync(dashboardPath, 'utf8');

  console.log('📏 CORREÇÕES DE ALTURA:');
  console.log('-'.repeat(40));

  // Verificar altura expandida corrigida
  const hasExpandedHeightFix = content.includes('height * 0.8');
  console.log(`✅ Altura expandida 80%: ${hasExpandedHeightFix ? '✓' : '❌'}`);

  // Verificar altura dinâmica da barra
  const hasDynamicHeight = content.includes('height: isExpanded ? expandedHeight : (showTabs ? SEARCH_BAR_HEIGHT + TABS_HEIGHT : SEARCH_BAR_HEIGHT)');
  console.log(`✅ Altura dinâmica: ${hasDynamicHeight ? '✓' : '❌'}`);

  console.log('\n📜 CORREÇÕES DE SCROLL:');
  console.log('-'.repeat(40));

  // Verificar ScrollView com configurações corretas
  const hasScrollConfig = content.includes('nestedScrollEnabled={true}') && 
                         content.includes('showsVerticalScrollIndicator={true}') &&
                         content.includes('bounces={true}');
  console.log(`✅ Configuração ScrollView: ${hasScrollConfig ? '✓' : '❌'}`);

  // Verificar estilos de scroll
  const hasScrollStyles = content.includes('scrollContainer: {') && 
                         content.includes('scrollContent: {');
  console.log(`✅ Estilos de scroll: ${hasScrollStyles ? '✓' : '❌'}`);

  console.log('\n🎨 ESTRUTURA DO PAINEL:');
  console.log('-'.repeat(40));

  // Verificar estrutura do painel expandido
  const hasFlexPanel = content.includes('flex: 1,') && 
                      content.includes('marginTop: spacing.sm,');
  console.log(`✅ Estrutura flex: ${hasFlexPanel ? '✓' : '❌'}`);

  // Verificar renderTabContent sem listContainer
  const hasDirectContent = !content.includes('<View style={styles.listContainer}>') &&
                          content.includes('data.map((item, index) =>');
  console.log(`✅ Conteúdo direto: ${hasDirectContent ? '✓' : '❌'}`);

  console.log('\n🔄 LÓGICA DE EXIBIÇÃO:');
  console.log('-'.repeat(40));

  // Verificar contador de resultados condicional
  const hasConditionalResults = content.includes('{!isExpanded && (') &&
                               content.includes('resultsInfo');
  console.log(`✅ Contador condicional: ${hasConditionalResults ? '✓' : '❌'}`);

  // Verificar View em vez de Animated.View no painel
  const hasViewPanel = content.includes('<View style={[') &&
                      content.includes('styles.expandedPanel,');
  console.log(`✅ View no painel: ${hasViewPanel ? '✓' : '❌'}`);

  console.log('\n📊 RESUMO DAS CORREÇÕES:');
  console.log('='.repeat(50));

  const fixes = [
    { name: 'Altura expandida 80%', status: hasExpandedHeightFix },
    { name: 'Altura dinâmica', status: hasDynamicHeight },
    { name: 'Configuração ScrollView', status: hasScrollConfig },
    { name: 'Estilos de scroll', status: hasScrollStyles },
    { name: 'Estrutura flex', status: hasFlexPanel },
    { name: 'Conteúdo direto', status: hasDirectContent },
    { name: 'Contador condicional', status: hasConditionalResults },
    { name: 'View no painel', status: hasViewPanel }
  ];

  const appliedFixes = fixes.filter(f => f.status).length;
  const totalFixes = fixes.length;

  fixes.forEach(fix => {
    console.log(`${fix.status ? '✅' : '❌'} ${fix.name}`);
  });

  console.log(`\n🎯 Correções aplicadas: ${appliedFixes}/${totalFixes}`);
  
  if (appliedFixes === totalFixes) {
    console.log('🎉 TODAS AS CORREÇÕES APLICADAS!');
    console.log('\n✨ PROBLEMAS CORRIGIDOS:');
    console.log('• 📏 Barra expande para 80% da tela');
    console.log('• 📜 ScrollView configurado corretamente');
    console.log('• 🔄 Lista scrollável dentro da barra');
    console.log('• 🎨 Estrutura flex otimizada');
    console.log('• 📊 Contador de resultados condicional');
    console.log('\n🚀 Pronto para testar!');
  } else {
    console.log('⚠️  Algumas correções podem estar pendentes');
  }

  console.log('\n' + '='.repeat(50));
}

testExpandedBarFixes();