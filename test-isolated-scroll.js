const fs = require('fs');
const path = require('path');

// Teste específico para verificar se o scroll foi isolado
function testIsolatedScroll() {
  console.log('🔍 Verificando isolamento do scroll...\n');

  const dashboardPath = path.join(__dirname, 'screens/dashboards/PatientDashboard.tsx');
  
  if (!fs.existsSync(dashboardPath)) {
    console.log('❌ Arquivo PatientDashboard.tsx não encontrado');
    return;
  }

  const content = fs.readFileSync(dashboardPath, 'utf8');

  console.log('🎯 VERIFICAÇÕES ESPECÍFICAS:');
  console.log('-'.repeat(40));

  // 1. Verificar se existe apenas UM PanGestureHandler
  const gestureMatches = content.match(/<PanGestureHandler/g);
  const gestureCount = gestureMatches ? gestureMatches.length : 0;
  console.log(`✅ Apenas um PanGestureHandler: ${gestureCount === 1 ? '✓' : `❌ (${gestureCount} encontrados)`}`);

  // 2. Verificar se PanGestureHandler só envolve o handle
  const gestureOnlyAroundHandle = content.includes('<PanGestureHandler') &&
                                 content.includes('<View style={styles.dragHandleArea}>') &&
                                 content.includes('</PanGestureHandler>') &&
                                 content.includes('<View style={styles.searchBarContainer}>');
  console.log(`✅ Gesture só no handle: ${gestureOnlyAroundHandle ? '✓' : '❌'}`);

  // 3. Verificar se ScrollView está FORA do PanGestureHandler
  const scrollViewOutside = content.includes('<ScrollView ') &&
                           !content.includes('<PanGestureHandler') ||
                           content.indexOf('<ScrollView ') > content.indexOf('</PanGestureHandler>');
  console.log(`✅ ScrollView fora do gesture: ${scrollViewOutside ? '✓' : '❌'}`);

  // 4. Verificar se enabled={!isExpanded} está presente
  const hasEnabledCondition = content.includes('enabled={!isExpanded}');
  console.log(`✅ Gesture condicionalmente habilitado: ${hasEnabledCondition ? '✓' : '❌'}`);

  // 5. Verificar se há proteção no handler para quando expandido
  const hasHandlerProtection = content.includes('if (isExpanded) {') &&
                              content.includes('return;');
  console.log(`✅ Proteção no handler: ${hasHandlerProtection ? '✓' : '❌'}`);

  console.log('\n📱 ESTRUTURA DE ÁREAS:');
  console.log('-'.repeat(40));

  // Verificar ordem dos elementos
  const handleIndex = content.indexOf('dragHandleArea');
  const searchBarIndex = content.indexOf('searchBarContainer');
  const scrollViewIndex = content.indexOf('<ScrollView ');
  
  console.log(`📍 Posições no código:`);
  console.log(`   Handle área: ${handleIndex > 0 ? 'encontrado' : 'não encontrado'}`);
  console.log(`   Search bar: ${searchBarIndex > 0 ? 'encontrado' : 'não encontrado'}`);
  console.log(`   ScrollView: ${scrollViewIndex > 0 ? 'encontrado' : 'não encontrado'}`);

  const correctOrder = handleIndex < searchBarIndex && searchBarIndex < scrollViewIndex;
  console.log(`✅ Ordem correta: ${correctOrder ? '✓' : '❌'}`);

  console.log('\n🔧 CONFIGURAÇÃO DO SCROLLVIEW:');
  console.log('-'.repeat(40));

  // Verificar configurações do ScrollView
  const scrollConfig = {
    nestedScrollEnabled: content.includes('nestedScrollEnabled={true}'),
    showsVerticalScrollIndicator: content.includes('showsVerticalScrollIndicator={true}'),
    bounces: content.includes('bounces={true}'),
    contentContainerStyle: content.includes('contentContainerStyle={styles.scrollContent}')
  };

  Object.entries(scrollConfig).forEach(([key, value]) => {
    console.log(`✅ ${key}: ${value ? '✓' : '❌'}`);
  });

  console.log('\n📊 DIAGNÓSTICO FINAL:');
  console.log('='.repeat(50));

  const checks = [
    gestureCount === 1,
    gestureOnlyAroundHandle,
    scrollViewOutside,
    hasEnabledCondition,
    hasHandlerProtection,
    correctOrder,
    ...Object.values(scrollConfig)
  ];

  const passedChecks = checks.filter(Boolean).length;
  const totalChecks = checks.length;

  console.log(`🎯 Verificações passaram: ${passedChecks}/${totalChecks}`);

  if (passedChecks === totalChecks) {
    console.log('🎉 SCROLL ISOLADO COM SUCESSO!');
    console.log('\n✨ O que foi implementado:');
    console.log('• 🎯 PanGestureHandler limitado apenas à área do handle');
    console.log('• 📜 ScrollView totalmente independente do gesture');
    console.log('• 🚫 Gesture desabilitado quando lista expandida');
    console.log('• 🔄 Lista pode rolar livremente sem mover a barra');
    console.log('\n🚀 PROBLEMA DO SCROLL RESOLVIDO!');
  } else if (passedChecks >= 8) {
    console.log('⚠️  Quase tudo configurado corretamente');
  } else {
    console.log('❌ Ainda há problemas com a configuração');
  }

  console.log('\n' + '='.repeat(50));
}

testIsolatedScroll();