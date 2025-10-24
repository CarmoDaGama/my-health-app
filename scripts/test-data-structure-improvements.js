/**
 * Script para testar e validar as melhorias na estrutura de dados
 */

import { UserDataAdapter, useUserDataMigration } from '../utils/userDataAdapter';
import { normalizePreferences, normalizeCoordinates, debugUserData } from '../utils/userDataNormalizers';

// Dados de teste simulando diferentes cenários
const testUsers = [
  {
    name: 'Usuário com estrutura legada - preferences boolean',
    data: {
      id: 'test1',
      email: 'test1@example.com',
      name: 'João Silva',
      userType: 'normal_user',
      preferences: {
        language: 'pt',
        notifications: true, // Estrutura antiga
        favorites: {
          services: ['service1'],
          locations: []
        }
      },
      favoriteInstitutions: [],
      searchHistory: []
    }
  },
  {
    name: 'Profissional com coordenadas no formato antigo',
    data: {
      id: 'test2',
      email: 'test2@example.com',
      name: 'Dr. Maria Santos',
      userType: 'professional',
      professionalInfo: {
        specialty: 'Cardiologia',
        license: '12345',
        experience: 10,
        coordinates: {
          lat: -8.8267755, // Formato antigo
          lng: 13.2303908
        }
      },
      preferences: {
        language: 'pt',
        notifications: {
          enabled: true,
          serviceReminders: true,
          healthTips: false,
          emergencyAlerts: true
        },
        favorites: { services: [], locations: [] },
        privacy: { shareLocation: true, publicProfile: false }
      }
    }
  },
  {
    name: 'Instituição com estrutura mista',
    data: {
      id: 'test3',
      email: 'test3@example.com',
      name: 'Hospital Central',
      userType: 'institution',
      institutionInfo: {
        type: 'hospital',
        services: ['emergencia', 'cirurgia'],
        address: {
          street: 'Rua Principal 123',
          city: 'Luanda',
          state: 'Luanda',
          zipCode: '1000',
          coordinates: { latitude: -8.8379, longitude: 13.2894 } // Coordenadas no lugar errado
        },
        contactInfo: {
          phone: '+244 222 000 000',
          email: 'contato@hospital.ao'
        }
      }
    }
  }
];

/**
 * Executa testes de validação
 */
function runValidationTests() {
  console.log('🧪 INICIANDO TESTES DE VALIDAÇÃO DA ESTRUTURA\n');

  testUsers.forEach((testCase, index) => {
    console.log(`📋 Teste ${index + 1}: ${testCase.name}`);
    console.log('─'.repeat(50));
    
    const userData = testCase.data;
    
    // Teste 1: Debug da estrutura atual
    console.log('🔍 Estrutura atual:');
    debugUserData(userData, `Test${index + 1}`);
    
    // Teste 2: Normalização de preferences
    console.log('\n🔧 Testando normalização de preferences:');
    const originalPrefs = userData.preferences;
    const normalizedPrefs = normalizePreferences(originalPrefs);
    console.log('Original:', JSON.stringify(originalPrefs, null, 2));
    console.log('Normalizado:', JSON.stringify(normalizedPrefs, null, 2));
    
    // Teste 3: Normalização de coordenadas
    console.log('\n📍 Testando normalização de coordenadas:');
    let coords = null;
    
    if (userData.coordinates) {
      coords = userData.coordinates;
    } else if (userData.professionalInfo?.coordinates) {
      coords = userData.professionalInfo.coordinates;
    } else if (userData.institutionInfo?.address?.coordinates) {
      coords = userData.institutionInfo.address.coordinates;
    } else if (userData.institutionInfo?.coordinates) {
      coords = userData.institutionInfo.coordinates;
    }
    
    if (coords) {
      const normalizedCoords = normalizeCoordinates(coords);
      console.log('Original:', JSON.stringify(coords, null, 2));
      console.log('Normalizado:', JSON.stringify(normalizedCoords, null, 2));
      console.log('Válido:', normalizedCoords ? '✅' : '❌');
    } else {
      console.log('Nenhuma coordenada encontrada');
    }
    
    // Teste 4: Validação da estrutura
    console.log('\n✅ Validação da estrutura:');
    const isValidLegacy = UserDataAdapter.isValidLegacyUser(userData);
    const isValidNew = UserDataAdapter.isValidNewUser(userData);
    
    console.log(`Estrutura legada válida: ${isValidLegacy ? '✅' : '❌'}`);
    console.log(`Nova estrutura válida: ${isValidNew ? '✅' : '❌'}`);
    
    // Teste 5: Migração para nova estrutura
    if (isValidLegacy) {
      console.log('\n🔄 Testando migração para nova estrutura:');
      try {
        const migrated = UserDataAdapter.fromLegacyUser(userData);
        if (migrated) {
          console.log('Migração: ✅ Sucesso');
          console.log('Nova estrutura:', JSON.stringify({
            userType: migrated.userType,
            hasCore: !!(migrated.id && migrated.email && migrated.name),
            hasProfile: !!(migrated.preferences && migrated.isActive !== undefined),
            hasLocation: !!(migrated.coordinates || migrated.address),
            hasTypeSpecific: !!(
              (migrated.userType === 'normal_user' && migrated.normalUserInfo) ||
              (migrated.userType === 'professional' && migrated.professionalInfo) ||
              (migrated.userType === 'institution' && migrated.institutionInfo)
            )
          }, null, 2));
        } else {
          console.log('Migração: ❌ Falhou');
        }
      } catch (error) {
        console.log('Migração: ❌ Erro:', error.message);
      }
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  });
  
  console.log('🎉 TESTES CONCLUÍDOS\n');
}

/**
 * Testa performance das operações
 */
function runPerformanceTests() {
  console.log('⚡ INICIANDO TESTES DE PERFORMANCE\n');
  
  const iterations = 1000;
  const sampleUser = testUsers[1].data;
  
  // Teste de normalização de preferences
  console.time('Normalização de Preferences (1000x)');
  for (let i = 0; i < iterations; i++) {
    normalizePreferences(sampleUser.preferences);
  }
  console.timeEnd('Normalização de Preferences (1000x)');
  
  // Teste de normalização de coordenadas
  console.time('Normalização de Coordenadas (1000x)');
  for (let i = 0; i < iterations; i++) {
    normalizeCoordinates(sampleUser.professionalInfo?.coordinates);
  }
  console.timeEnd('Normalização de Coordenadas (1000x)');
  
  // Teste de validação
  console.time('Validação de Estrutura (1000x)');
  for (let i = 0; i < iterations; i++) {
    UserDataAdapter.isValidLegacyUser(sampleUser);
  }
  console.timeEnd('Validação de Estrutura (1000x)');
  
  console.log('\n⚡ TESTES DE PERFORMANCE CONCLUÍDOS\n');
}

/**
 * Sumário das melhorias implementadas
 */
function showImprovementsSummary() {
  console.log('📊 RESUMO DAS MELHORIAS IMPLEMENTADAS\n');
  console.log('✅ 1. NORMALIZAÇÃO IMEDIATA:');
  console.log('   • Estrutura de preferences corrigida (boolean → objeto)');
  console.log('   • Coordenadas padronizadas ({ lat, lng } → { latitude, longitude })');
  console.log('   • Scripts de migração automática criados\n');
  
  console.log('✅ 2. MELHORIAS ESTRUTURAIS:');
  console.log('   • Separação de concerns (UserCore, UserProfile, UserLocation)');
  console.log('   • Tipos específicos por categoria de usuário');
  console.log('   • Adaptador para migração gradual');
  console.log('   • Funções de validação e normalização\n');
  
  console.log('🔧 3. FERRAMENTAS CRIADAS:');
  console.log('   • userDataNormalizers.ts - Utilitários de normalização');
  console.log('   • userStructure.ts - Nova estrutura com separação de concerns');
  console.log('   • userDataAdapter.ts - Adaptador para migração gradual');
  console.log('   • Scripts de migração para Firebase\n');
  
  console.log('📈 4. BENEFÍCIOS:');
  console.log('   • Consistência de dados garantida');
  console.log('   • Facilidade de manutenção');
  console.log('   • Melhor performance');
  console.log('   • Estrutura escalável');
  console.log('   • Migração segura e gradual\n');
}

// Executar testes se o script for executado diretamente
if (require.main === module) {
  showImprovementsSummary();
  runValidationTests();
  runPerformanceTests();
}

export {
  runValidationTests,
  runPerformanceTests,
  showImprovementsSummary
};
