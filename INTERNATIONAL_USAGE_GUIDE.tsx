/**
 * GUIA DE USO - SISTEMA INTERNACIONAL MENDLINK
 * Como usar as novas funcionalidades internacionais implementadas
 */

// ===== IMPORTAÇÕES =====
import { 
  validateInternationalPhone, 
  validateInternationalCoordinates,
  validateAngolanPhoneNumber, // Mantida para compatibilidade
  validateAngolanCoordinates  // Mantida para compatibilidade
} from './utils/validation';

import { 
  getCountryConfig, 
  detectCountryByPhone, 
  detectCountryByCoordinates,
  isValidGlobalCoordinates,
  COUNTRIES 
} from './utils/countries';

import { LocationService } from './services/location';
import { useLocalization } from './hooks/useTranslation';

// ===== 1. VALIDAÇÃO DE TELEFONES INTERNACIONAL =====

// Exemplo 1: Validar telefone com país específico
const validatePhoneExample1 = () => {
  const result = validateInternationalPhone('+244923456789', 'AO');
  console.log('Angola:', result.isValid, result.formatted);
  // Output: true, "+244923456789"
};

// Exemplo 2: Detecção automática de país
const validatePhoneExample2 = () => {
  const result = validateInternationalPhone('+5511999998888'); // Detecta Brasil automaticamente
  console.log('Brasil:', result.isValid, result.country, result.formatted);
  // Output: true, "BR", "+5511999998888"
};

// Exemplo 3: Múltiplos países
const validateMultiplePhones = () => {
  const phones = [
    { phone: '+244923456789', country: 'AO' }, // Angola
    { phone: '+5511999998888', country: 'BR' }, // Brasil  
    { phone: '+351912345678', country: 'PT' }, // Portugal
    { phone: '+1555123456', country: 'US' },    // EUA
    { phone: '+447123456789', country: 'GB' },  // Reino Unido
  ];

  phones.forEach(test => {
    const result = validateInternationalPhone(test.phone, test.country);
    console.log(`${test.country}: ${result.isValid ? '✅' : '❌'} ${test.phone}`);
  });
};

// ===== 2. VALIDAÇÃO DE COORDENADAS INTERNACIONAL =====

// Exemplo 1: Validação global (sem país específico)
const validateGlobalCoordinates = () => {
  const result = validateInternationalCoordinates(40.7128, -74.0060); // Nova York
  console.log('Global:', result.isValid, result.country);
  // Output: true, "Global"
};

// Exemplo 2: Validação específica por país
const validateCountryCoordinates = () => {
  // Luanda, Angola
  const result1 = validateInternationalCoordinates(-8.8390, 13.2894, 'AO');
  console.log('Luanda em Angola:', result1.isValid);
  // Output: true
  
  // Nova York tentando validar como Angola (deve falhar)
  const result2 = validateInternationalCoordinates(40.7128, -74.0060, 'AO');
  console.log('Nova York em Angola:', result2.isValid, result2.error);
  // Output: false, "Coordenadas estão fora do território de Angola"
};

// ===== 3. DETECÇÃO AUTOMÁTICA DE PAÍS =====

// Detecção por telefone
const detectCountryExamples = () => {
  console.log('Telefones:');
  console.log(detectCountryByPhone('+244923456789')); // AO
  console.log(detectCountryByPhone('+5511999998888')); // BR
  console.log(detectCountryByPhone('+351912345678')); // PT
  
  console.log('Coordenadas:');
  console.log(detectCountryByCoordinates(-8.8390, 13.2894));   // AO (Luanda)
  console.log(detectCountryByCoordinates(-23.5505, -46.6333)); // BR (São Paulo)
  console.log(detectCountryByCoordinates(38.7223, -9.1393));   // PT (Lisboa)
};

// ===== 4. FORMATAÇÃO DE MOEDA DINÂMICA =====

const CurrencyExample = () => {
  const { formatCurrency, formatNumber } = useLocalization();
  
  // Exemplo 1: Diferentes moedas
  const amount = 150.50;
  
  console.log('Angola:', formatCurrency(amount, 'AO'));     // AOA 150,50
  console.log('Brasil:', formatCurrency(amount, 'BR'));     // R$ 150,50
  console.log('Portugal:', formatCurrency(amount, 'PT'));   // 150,50 €
  console.log('EUA:', formatCurrency(amount, 'US'));        // $150.50
  console.log('Reino Unido:', formatCurrency(amount, 'GB')); // £150.50
  
  // Exemplo 2: Números formatados
  const number = 1234567.89;
  console.log('Angola:', formatNumber(number, 2, 'AO'));
  console.log('Brasil:', formatNumber(number, 2, 'BR'));
  console.log('EUA:', formatNumber(number, 2, 'US'));
};

// ===== 5. SERVIÇOS DE LOCALIZAÇÃO INTERNACIONAL =====

const LocationExamples = async () => {
  // Verificar se coordenadas estão em um país específico
  const coordinates = { latitude: -8.8390, longitude: 13.2894 };
  
  console.log('Em Angola:', LocationService.isLocationInCountry(coordinates, 'AO')); // true
  console.log('Em Brasil:', LocationService.isLocationInCountry(coordinates, 'BR')); // false
  
  // Função legada ainda funciona
  console.log('Legado Angola:', LocationService.isLocationInAngola(coordinates)); // true
  
  // Obter localização atual (agora com detecção internacional)
  const location = await LocationService.getCurrentLocation();
  console.log('Localização atual:', location);
};

// ===== 6. CONFIGURAÇÃO DE PAÍSES =====

const countryConfigExamples = () => {
  // Obter configuração de um país
  const angolaConfig = getCountryConfig('AO');
  console.log('Angola:', angolaConfig?.name, angolaConfig?.currency);
  
  const brasilConfig = getCountryConfig('BR');
  console.log('Brasil:', brasilConfig?.name, brasilConfig?.currency);
  
  // Listar todos os países disponíveis
  console.log('Países suportados:', Object.keys(COUNTRIES));
  
  // Verificar limites geográficos de um país
  const portugalConfig = getCountryConfig('PT');
  console.log('Limites de Portugal:', portugalConfig?.coordinates);
};

// ===== 7. MIGRAÇÃO GRADUAL =====

// As funções antigas ainda funcionam para compatibilidade:
const backwardCompatibility = () => {
  // Funciona como antes
  const oldPhoneResult = validateAngolanPhoneNumber('+244923456789');
  console.log('Função antiga phone:', oldPhoneResult.isValid);
  
  // Funciona como antes  
  const oldCoordResult = validateAngolanCoordinates(-8.8390, 13.2894);
  console.log('Função antiga coords:', oldCoordResult.isValid);
  
  // Mas agora você pode usar as novas também:
  const newPhoneResult = validateInternationalPhone('+5511999998888', 'BR');
  console.log('Função nova phone:', newPhoneResult.isValid, newPhoneResult.country);
};

// ===== 8. EXEMPLO PRÁTICO EM COMPONENTE REACT =====

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

const InternationalPhoneComponent = () => {
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [validation, setValidation] = useState(null);
  const { formatCurrency } = useLocalization();

  const validatePhone = () => {
    const result = validateInternationalPhone(phone, country);
    setValidation(result);
  };

  const detectCountry = () => {
    const detected = detectCountryByPhone(phone);
    setCountry(detected);
  };

  return (
    <View>
      <TextInput 
        placeholder="Digite o telefone (ex: +5511999998888)"
        value={phone}
        onChangeText={setPhone}
      />
      
      <Button title="Detectar País" onPress={detectCountry} />
      
      <Text>País detectado: {country}</Text>
      
      <Button title="Validar" onPress={validatePhone} />
      
      {validation && (
        <View>
          <Text>Válido: {validation.isValid ? 'Sim' : 'Não'}</Text>
          <Text>País: {validation.country}</Text>
          {validation.formatted && (
            <Text>Formatado: {validation.formatted}</Text>
          )}
          {validation.error && (
            <Text>Erro: {validation.error}</Text>
          )}
        </View>
      )}
      
      <Text>Preço exemplo: {formatCurrency(100, country)}</Text>
    </View>
  );
};

// ===== 9. EXEMPLO DE SELETOR DE PAÍS =====

const CountrySelector = () => {
  const [selectedCountry, setSelectedCountry] = useState('AO');
  const countryConfig = getCountryConfig(selectedCountry);

  return (
    <View>
      <Text>País Selecionado: {countryConfig?.name}</Text>
      <Text>Moeda: {countryConfig?.currency}</Text>
      <Text>Código de Telefone: {countryConfig?.phone.countryCode}</Text>
      <Text>Formato: {countryConfig?.phone.format}</Text>
      <Text>Exemplo: {countryConfig?.phone.example}</Text>
      
      {/* Aqui você adicionaria um Picker ou lista para seleção */}
    </View>
  );
};

export {
  validatePhoneExample1,
  validatePhoneExample2,
  validateMultiplePhones,
  validateGlobalCoordinates,
  validateCountryCoordinates,
  detectCountryExamples,
  CurrencyExample,
  LocationExamples,
  countryConfigExamples,
  backwardCompatibility,
  InternationalPhoneComponent,
  CountrySelector
};