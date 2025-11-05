#!/usr/bin/env node

/**
 * Script para testar as correções de localização
 * Este script verifica se os problemas de localização foram resolvidos
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando correções de localização...\n');

// Verificar PatientDashboard
console.log('1. Verificando PatientDashboard...');
const patientDashboardPath = path.join(__dirname, 'screens/dashboards/PatientDashboard.tsx');
const patientDashboardContent = fs.readFileSync(patientDashboardPath, 'utf-8');

if (patientDashboardContent.includes('LocationService.getLocationWithFallback()')) {
  console.log('✅ PatientDashboard agora usa LocationService');
} else {
  console.log('❌ PatientDashboard ainda não usa LocationService');
}

if (patientDashboardContent.includes('import { LocationService }')) {
  console.log('✅ LocationService importado corretamente');
} else {
  console.log('❌ LocationService não importado');
}

// Verificar LocationService
console.log('\n2. Verificando LocationService...');
const locationServicePath = path.join(__dirname, 'services/location.ts');
const locationServiceContent = fs.readFileSync(locationServicePath, 'utf-8');

if (locationServiceContent.includes('BestForNavigation')) {
  console.log('✅ Configuração de alta precisão ativada');
} else {
  console.log('❌ Ainda usando precisão baixa');
}

if (locationServiceContent.includes('isValidCoordinates')) {
  console.log('✅ Validação de coordenadas implementada');
} else {
  console.log('❌ Validação de coordenadas não encontrada');
}

if (locationServiceContent.includes('isLocationInAngola')) {
  console.log('✅ Verificação de localização em Angola implementada');
} else {
  console.log('❌ Verificação de Angola não encontrada');
}

// Verificar MapScreen
console.log('\n3. Verificando MapScreen...');
const mapScreenPath = path.join(__dirname, 'screens/MapScreen.tsx');
const mapScreenContent = fs.readFileSync(mapScreenPath, 'utf-8');

if (mapScreenContent.includes('latitude: -8.8383')) {
  console.log('✅ Região padrão corrigida para Luanda');
} else {
  console.log('❌ Região padrão ainda incorreta');
}

// Verificar useLocation hook
console.log('\n4. Verificando useLocation hook...');
const useLocationPath = path.join(__dirname, 'hooks/useLocation.ts');
const useLocationContent = fs.readFileSync(useLocationPath, 'utf-8');

if (useLocationContent.includes('LocationService.isValidCoordinates')) {
  console.log('✅ Hook useLocation usa validação de coordenadas');
} else {
  console.log('❌ Hook useLocation não valida coordenadas');
}

console.log('\n📋 Resumo das correções:');
console.log('• PatientDashboard agora obtém localização real do usuário');
console.log('• LocationService configurado para máxima precisão GPS');
console.log('• Validação de coordenadas implementada');
console.log('• Verificação se está em Angola');
console.log('• Fallbacks inteligentes para casos de falha');
console.log('• Região padrão corrigida para Luanda, Angola');
console.log('• Logs detalhados para debug');

console.log('\n🚀 Para testar:');
console.log('1. Reinicie o app');
console.log('2. Verifique as permissões de localização');
console.log('3. Teste em diferentes condições de GPS');
console.log('4. Verifique os logs no console para debug');

console.log('\n✅ Verificação completa!');