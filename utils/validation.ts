/**
 * Validation utilities for international data and geographic coordinates
 */

import { 
  getCountryConfig, 
  detectCountryByPhone, 
  isValidGlobalCoordinates,
  DEFAULT_COUNTRY 
} from './countries';

// Validation of international phone numbers
export interface PhoneValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
  operator?: string;
  country?: string;
}

/**
 * Valida números de telefone internacionais
 * Suporta múltiplos países através do sistema de configuração
 */
export const validateInternationalPhone = (phone: string, countryCode?: string): PhoneValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'Número de telefone é obrigatório' };
  }

  // Remover espaços, hífens e parênteses para validação
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');

  // Verificar se contém apenas números e + no início
  if (!/^\+?[0-9]+$/.test(cleanPhone)) {
    return { isValid: false, error: 'Número deve conter apenas dígitos' };
  }

  // Detectar país automaticamente ou usar o fornecido
  const detectedCountry = countryCode || detectCountryByPhone(cleanPhone) || DEFAULT_COUNTRY;
  const countryConfig = getCountryConfig(detectedCountry);

  if (!countryConfig) {
    return { 
      isValid: false, 
      error: `País ${detectedCountry} não suportado`,
      country: detectedCountry 
    };
  }

  // Validar contra o padrão do país
  const isValid = countryConfig.phone.regex.test(phone);

  if (!isValid) {
    return {
      isValid: false,
      error: `Formato de telefone inválido para ${countryConfig.name}. Use o formato: ${countryConfig.phone.format}`,
      country: detectedCountry
    };
  }

  // Formatar número
  let formattedPhone = cleanPhone;
  const countryCodeNum = countryConfig.phone.countryCode.substring(1);
  
  if (!formattedPhone.startsWith('+')) {
    if (formattedPhone.startsWith(countryCodeNum)) {
      formattedPhone = '+' + formattedPhone;
    } else {
      formattedPhone = countryConfig.phone.countryCode + formattedPhone;
    }
  }

  return {
    isValid: true,
    formatted: formattedPhone,
    country: detectedCountry,
    operator: 'Valid'
  };
};

/**
 * Função legada para compatibilidade - valida números angolanos
 */
export const validateAngolanPhoneNumber = (phone: string): PhoneValidationResult => {
  return validateInternationalPhone(phone, 'AO');
};

// Validação de coordenadas geográficas
export interface CoordinateValidationResult {
  isValid: boolean;
  error?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Valida coordenadas geográficas internacionais
 * Suporta validação para qualquer país através do sistema de configuração
 */
export const validateInternationalCoordinates = (
  latitude: number | string, 
  longitude: number | string,
  countryCode?: string
): CoordinateValidationResult & { country?: string } => {
  const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
  const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;

  if (isNaN(lat) || isNaN(lng)) {
    return { isValid: false, error: 'Coordenadas devem ser números válidos' };
  }

  // Validações básicas globais
  if (lat < -90 || lat > 90) {
    return { isValid: false, error: 'Latitude deve estar entre -90 e 90 graus' };
  }

  if (lng < -180 || lng > 180) {
    return { isValid: false, error: 'Longitude deve estar entre -180 e 180 graus' };
  }

  // Se não há país especificado, usar validação global
  if (!countryCode) {
    return {
      isValid: true,
      coordinates: { latitude: lat, longitude: lng },
      country: 'Global'
    };
  }

  const countryConfig = getCountryConfig(countryCode);
  
  if (!countryConfig) {
    // Se país não suportado, permitir coordenadas globais
    return {
      isValid: true,
      coordinates: { latitude: lat, longitude: lng },
      country: countryCode
    };
  }

  // Verificar se as coordenadas estão dentro do país
  const bounds = countryConfig.coordinates;
  const isInCountry = lat <= bounds.north && 
                     lat >= bounds.south && 
                     lng <= bounds.east && 
                     lng >= bounds.west;
  
  if (!isInCountry) {
    return { 
      isValid: false, 
      error: `Coordenadas estão fora do território de ${countryConfig.name}`,
      country: countryCode
    };
  }

  return {
    isValid: true,
    coordinates: { latitude: lat, longitude: lng },
    country: countryCode
  };
};

/**
 * Função legada para compatibilidade - valida coordenadas angolanas
 */
export const validateAngolanCoordinates = (
  latitude: number | string, 
  longitude: number | string
): CoordinateValidationResult => {
  const result = validateInternationalCoordinates(latitude, longitude, 'AO');
  return {
    isValid: result.isValid,
    error: result.error,
    coordinates: result.coordinates
  };
};

// Validação de endereços angolanos
export interface AddressValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}

/**
 * Valida endereços angolanos básicos
 */
export const validateAngolanAddress = (address: string): AddressValidationResult => {
  if (!address || address.trim().length === 0) {
    return { isValid: false, error: 'Endereço é obrigatório' };
  }

  const trimmedAddress = address.trim();

  if (trimmedAddress.length < 5) {
    return { isValid: false, error: 'Endereço muito curto' };
  }

  if (trimmedAddress.length > 200) {
    return { isValid: false, error: 'Endereço muito longo' };
  }

  // Verificar se contém pelo menos algumas palavras
  const words = trimmedAddress.split(/\s+/);
  if (words.length < 2) {
    return { isValid: false, error: 'Endereço deve conter pelo menos duas palavras' };
  }

  // Formatar endereço (primeira letra maiúscula de cada palavra)
  const formatted = trimmedAddress
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    isValid: true,
    formatted
  };
};

// Validação de emails
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email é obrigatório' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Formato de email inválido' };
  }

  return { isValid: true };
};

// Validação de nomes
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Nome é obrigatório' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Nome deve ter pelo menos 2 caracteres' };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Nome muito longo' };
  }

  // Verificar se contém apenas letras, espaços e caracteres acentuados
  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(trimmedName)) {
    return { isValid: false, error: 'Nome deve conter apenas letras' };
  }

  return { isValid: true };
};