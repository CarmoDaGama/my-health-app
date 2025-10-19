/**
 * Teste específico para validar filtros de profissionais e instituições
 * Execute com: node scripts/test-service-filters.js
 */

const { HealthServiceAPIFirebase } = require('../services/api-firebase');

async function testServiceFilters() {
  console.log('🧪 TESTE: Filtros de Profissionais e Instituições\n');
  console.log('=' * 70);
  
  try {
    // Teste 1: getAllServices
    console.log('\n📍 TESTE 1: getAllServices() - Filtros aplicados');
    const allServicesResult = await HealthServiceAPIFirebase.getAllServices(50);
    const allServices = allServicesResult.services;
    
    console.log(`📊 Total de serviços retornados: ${allServices.length}`);
    
    // Analisar por tipo
    const servicesByType = {};
    const statusAnalysis = {
      'active': 0,
      'suspended': 0,
      'undefined': 0
    };
    const verificationAnalysis = {
      'verified': 0,
      'not_verified': 0,
      'undefined': 0
    };
    
    allServices.forEach(service => {
      // Contar por tipo
      const type = service.type || 'undefined';
      servicesByType[type] = (servicesByType[type] || 0) + 1;
      
      // Analisar status (apenas para profissionais e instituições)
      if (service.type === 'professional' || service.type === 'institution') {
        if (service.status === 'active') {
          statusAnalysis.active++;
        } else if (service.status === 'suspended') {
          statusAnalysis.suspended++;
        } else {
          statusAnalysis.undefined++;
        }
        
        // Analisar verificação
        if (service.verified === true) {
          verificationAnalysis.verified++;
        } else if (service.verified === false) {
          verificationAnalysis.not_verified++;
        } else {
          verificationAnalysis.undefined++;
        }
      }
    });
    
    console.log('\n📋 Serviços por tipo:');
    Object.entries(servicesByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    
    console.log('\n🔍 Análise de Profissionais e Instituições:');
    const profAndInst = allServices.filter(s => 
      s.type === 'professional' || s.type === 'institution'
    );
    
    if (profAndInst.length > 0) {
      console.log(`📊 Total de prof/inst retornados: ${profAndInst.length}`);
      console.log('📈 Status:');
      console.log(`   ✅ Ativos: ${statusAnalysis.active}`);
      console.log(`   🚫 Suspensos: ${statusAnalysis.suspended} ${statusAnalysis.suspended > 0 ? '⚠️ PROBLEMA!' : ''}`);
      console.log(`   ❓ Sem status: ${statusAnalysis.undefined}`);
      
      console.log('🔐 Verificação:');
      console.log(`   ✅ Verificados: ${verificationAnalysis.verified}`);
      console.log(`   🚫 Não verificados: ${verificationAnalysis.not_verified} ${verificationAnalysis.not_verified > 0 ? '⚠️ PROBLEMA!' : ''}`);
      console.log(`   ❓ Sem campo: ${verificationAnalysis.undefined}`);
      
      // Mostrar detalhes dos primeiros 3
      console.log('\n📝 Detalhes dos primeiros 3:');
      profAndInst.slice(0, 3).forEach((service, index) => {
        console.log(`   ${index + 1}. ${service.name}`);
        console.log(`      📋 Tipo: ${service.type}`);
        console.log(`      🔄 Status: ${service.status || 'não definido'}`);
        console.log(`      ✓ Verificado: ${service.verified !== undefined ? service.verified : 'não definido'}`);
        console.log(`      👤 Criado por: ${service.createdBy || 'não informado'}`);
      });
    } else {
      console.log('📭 Nenhum profissional ou instituição encontrado');
    }
    
    // Teste 2: Busca específica por tipo
    console.log('\n📍 TESTE 2: getServicesByType("professional")');
    const professionalServices = await HealthServiceAPIFirebase.getServicesByType('professional');
    console.log(`📊 Profissionais retornados: ${professionalServices.length}`);
    
    // Verificar se algum suspenso ou não verificado passou
    const invalidProfessionals = professionalServices.filter(service => 
      service.status === 'suspended' || service.verified === false
    );
    
    if (invalidProfessionals.length > 0) {
      console.log(`❌ PROBLEMA: ${invalidProfessionals.length} profissionais inválidos passaram pelo filtro!`);
      invalidProfessionals.forEach(service => {
        console.log(`   🚫 ${service.name} - Status: ${service.status}, Verificado: ${service.verified}`);
      });
    } else {
      console.log('✅ Todos os profissionais retornados estão válidos');
    }
    
    // Teste 3: Busca específica por instituições
    console.log('\n📍 TESTE 3: getServicesByType("institution")');
    const institutionServices = await HealthServiceAPIFirebase.getServicesByType('institution');
    console.log(`📊 Instituições retornadas: ${institutionServices.length}`);
    
    const invalidInstitutions = institutionServices.filter(service => 
      service.status === 'suspended' || service.verified === false
    );
    
    if (invalidInstitutions.length > 0) {
      console.log(`❌ PROBLEMA: ${invalidInstitutions.length} instituições inválidas passaram pelo filtro!`);
      invalidInstitutions.forEach(service => {
        console.log(`   🚫 ${service.name} - Status: ${service.status}, Verificado: ${service.verified}`);
      });
    } else {
      console.log('✅ Todas as instituições retornadas estão válidas');
    }
    
    // Resumo final
    console.log('\n' + '=' * 70);
    console.log('📋 RESUMO FINAL:');
    
    const totalProfInst = profAndInst.length;
    const totalSuspended = statusAnalysis.suspended;
    const totalNotVerified = verificationAnalysis.not_verified;
    
    if (totalSuspended === 0 && totalNotVerified === 0) {
      console.log('✅ SUCESSO: Todos os filtros estão funcionando corretamente!');
      console.log('   - Nenhum serviço suspenso foi retornado');
      console.log('   - Nenhum serviço não verificado foi retornado');
    } else {
      console.log('❌ PROBLEMA: Filtros não estão funcionando adequadamente!');
      if (totalSuspended > 0) {
        console.log(`   - ${totalSuspended} serviços suspensos foram retornados`);
      }
      if (totalNotVerified > 0) {
        console.log(`   - ${totalNotVerified} serviços não verificados foram retornados`);
      }
    }
    
    console.log(`📊 Total de prof/instituições visíveis: ${totalProfInst}`);
    
  } catch (error) {
    console.error('❌ ERRO no teste:', error);
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testServiceFilters()
    .then(() => {
      console.log('\n🏁 Teste de filtros concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { testServiceFilters };