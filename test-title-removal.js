const fs = require('fs');
const path = require('path');

// Teste para verificar remoção de barra de título duplicada
function testDuplicateTitleRemoval() {
  console.log('🔧 Testando remoção de barra de título duplicada...\n');

  const serviceDetailPath = path.join(__dirname, 'screens/ServiceDetailScreen.tsx');
  
  if (!fs.existsSync(serviceDetailPath)) {
    console.log('❌ Arquivo ServiceDetailScreen.tsx não encontrado');
    return;
  }

  const content = fs.readFileSync(serviceDetailPath, 'utf8');

  console.log('📱 VERIFICAÇÃO DE TÍTULOS:');
  console.log('-'.repeat(40));

  // Verificar se o título do header foi removido
  const hasHeaderTitle = content.includes('<Text style={styles.headerTitle}>');
  console.log(`✅ Título do header removido: ${!hasHeaderTitle ? '✓' : '❌'}`);

  // Verificar se mantém apenas o nome do serviço no card
  const hasServiceName = content.includes('<Text style={styles.serviceName}>');
  console.log(`✅ Nome do serviço mantido: ${hasServiceName ? '✓' : '❌'}`);

  // Verificar se o header só tem o botão de voltar
  const headerContent = content.match(/<View style={styles\.header}>[\s\S]*?<\/View>/);
  if (headerContent) {
    const headerHasOnlyBackButton = headerContent[0].includes('chevron-back') && 
                                   !headerContent[0].includes('headerTitle');
    console.log(`✅ Header só com botão voltar: ${headerHasOnlyBackButton ? '✓' : '❌'}`);
  } else {
    console.log(`❌ Header não encontrado`);
  }

  // Verificar se o estilo headerTitle ainda existe (pode ser removido depois)
  const hasHeaderTitleStyle = content.includes('headerTitle: {');
  console.log(`📝 Estilo headerTitle existe: ${hasHeaderTitleStyle ? 'Sim (pode remover)' : 'Não'}`);

  console.log('\n🎨 ESTRUTURA DO HEADER:');
  console.log('-'.repeat(40));

  // Verificar estrutura do header
  const headerStructureMatch = content.match(/<View style={styles\.header}>([\s\S]*?)<\/View>/);
  if (headerStructureMatch) {
    const headerStructure = headerStructureMatch[1];
    
    const hasBackButton = headerStructure.includes('backButton');
    const hasTitle = headerStructure.includes('headerTitle');
    
    console.log(`📍 Estrutura atual:`);
    console.log(`   - Botão voltar: ${hasBackButton ? '✓' : '❌'}`);
    console.log(`   - Título: ${hasTitle ? '❌ (duplicado)' : '✓ (removido)'}`);
  }

  console.log('\n📋 TÍTULOS RESTANTES:');
  console.log('-'.repeat(40));

  // Listar todos os títulos/nomes restantes
  const serviceName = content.includes('service.name');
  const titleSection = content.includes('titleSection');
  const iconContainer = content.includes('iconContainer');
  
  console.log(`✅ Nome do serviço no card: ${serviceName ? '✓' : '❌'}`);
  console.log(`✅ Seção de título do card: ${titleSection ? '✓' : '❌'}`);
  console.log(`✅ Ícone do serviço: ${iconContainer ? '✓' : '❌'}`);

  console.log('\n📊 RESULTADO:');
  console.log('='.repeat(50));

  const checks = [
    !hasHeaderTitle,
    hasServiceName,
    headerContent && headerContent[0].includes('chevron-back') && !headerContent[0].includes('headerTitle'),
    serviceName,
    titleSection
  ];

  const passedChecks = checks.filter(Boolean).length;
  const totalChecks = checks.length;

  console.log(`🎯 Verificações: ${passedChecks}/${totalChecks}`);

  if (passedChecks === totalChecks) {
    console.log('🎉 TÍTULO DUPLICADO REMOVIDO COM SUCESSO!');
    console.log('\n✨ Estrutura atual:');
    console.log('• 🔙 Header: Apenas botão de voltar');
    console.log('• 📄 Card: Nome do serviço como título principal');
    console.log('• 🎯 Interface: Mais limpa e sem redundância');
    console.log('\n🚀 Interface melhorada!');
  } else if (passedChecks >= 3) {
    console.log('⚠️  Maioria das correções aplicadas');
  } else {
    console.log('❌ Ainda há problemas com títulos duplicados');
  }

  console.log('\n' + '='.repeat(50));
}

testDuplicateTitleRemoval();