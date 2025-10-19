/**
 * Script de teste para verificar se os serviços estão aparecendo corretamente
 * Execute com: node scripts/test-services-visibility.js
 */

const { HealthServiceAPIFirebase } = require('../services/api-firebase');

async function testServicesVisibility() {
  console.log('🧪 TESTE: Verificação de Visibilidade dos Serviços\n');
  console.log('=' * 60);
  
  try {
    // Teste 1: getAllServices
    console.log('\n📍 TESTE 1: getAllServices()');
    const allServicesResult = await HealthServiceAPIFirebase.getAllServices(10);
    console.log(`✅ Total de serviços retornados: ${allServicesResult.services.length}`);
    
    if (allServicesResult.services.length > 0) {
      console.log('🏥 Primeiros 3 serviços:');
      allServicesResult.services.slice(0, 3).forEach((service, index) => {
        console.log(`   ${index + 1}. ${service.name} (${service.type})`);
        console.log(`      📍 ${service.address || 'Endereço não informado'}`);
        console.log(`      ✓ Verificado: ${service.verified !== undefined ? service.verified : 'campo não existe'}`);
      });
    } else {
      console.log('❌ Nenhum serviço encontrado!');
    }
    
    // Teste 2: searchServices
    console.log('\n📍 TESTE 2: searchServices()');
    const searchResults = await HealthServiceAPIFirebase.searchServices('', {});
    console.log(`✅ Total de serviços na busca: ${searchResults.length}`);
    
    // Teste 3: getNearbyServices
    console.log('\n📍 TESTE 3: getNearbyServices()');
    // Coordenadas de Luanda, Angola
    const nearbyResults = await HealthServiceAPIFirebase.getNearbyServices(-8.8383, 13.2344, 50);
    console.log(`✅ Serviços próximos a Luanda: ${nearbyResults.length}`);
    
    // Resumo por tipo
    console.log('\n📊 RESUMO POR TIPO:');
    const servicesByType = {};
    allServicesResult.services.forEach(service => {
      const type = service.type || 'indefinido';
      servicesByType[type] = (servicesByType[type] || 0) + 1;
    });
    
    Object.entries(servicesByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} serviços`);
    });
    
    // Verificação de campos obrigatórios
    console.log('\n🔍 VERIFICAÇÃO DE DADOS:');
    const servicesWithoutCoordinates = allServicesResult.services.filter(s => 
      !s.coordinates || s.coordinates.latitude === 0 || s.coordinates.longitude === 0
    );
    console.log(`⚠️  Serviços sem coordenadas válidas: ${servicesWithoutCoordinates.length}`);
    
    const servicesWithoutVerified = allServicesResult.services.filter(s => s.verified === undefined);
    console.log(`⚠️  Serviços sem campo 'verified': ${servicesWithoutVerified.length}`);
    
    console.log('\n' + '=' * 60);
    
    if (allServicesResult.services.length === 0) {
      console.log('❌ PROBLEMA: Nenhum serviço está sendo retornado!');
      console.log('\n🔧 POSSÍVEIS SOLUÇÕES:');
      console.log('1. Verificar se existem dados na coleção "healthServices" no Firestore');
      console.log('2. Executar migração de dados: node scripts/migrate-firebase.js');
      console.log('3. Verificar configuração do Firebase');
    } else {
      console.log('✅ SUCESSO: Serviços estão sendo retornados normalmente!');
    }
    
  } catch (error) {
    console.error('❌ ERRO no teste:', error);
    console.log('\n🔧 VERIFICAÇÕES:');
    console.log('1. Configuração do Firebase está correta?');
    console.log('2. Permissões do Firestore estão adequadas?');
    console.log('3. Coleção "healthServices" existe?');
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testServicesVisibility()
    .then(() => {
      console.log('\n🏁 Teste concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { testServicesVisibility };