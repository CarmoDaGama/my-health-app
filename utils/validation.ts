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
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remover espaços, hífens e parênteses para validação
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');

  // Check if contains only numbers and + at the beginning
  if (!/^\+?[0-9]+$/.test(cleanPhone)) {
    return { isValid: false, error: 'Number must contain only digits' };
  }

  // Detectar país automaticamente ou usar o fornecido
  const detectedCountry = countryCode || detectCountryByPhone(cleanPhone) || DEFAULT_COUNTRY;
  const countryConfig = getCountryConfig(detectedCountry);

  if (!countryConfig) {
    return { 
      isValid: false, 
      error: `Country ${detectedCountry} not supported`,
      country: detectedCountry 
    };
  }

  // Validar contra o padrão do país
  const isValid = countryConfig.phone.regex.test(phone);

  if (!isValid) {
    return {
      isValid: false,
      error: `Invalid phone format for ${countryConfig.name}. Use format: ${countryConfig.phone.format}`,
      country: detectedCountry
    };
  }

  // Format number
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
    return { isValid: false, error: 'Coordinates must be valid numbers' };
  }

  // Basic global validations
  if (lat < -90 || lat > 90) {
    return { isValid: false, error: 'Latitude must be between -90 and 90 degrees' };
  }

  if (lng < -180 || lng > 180) {
    return { isValid: false, error: 'Longitude must be between -180 and 180 degrees' };
  }

  // If no country specified, use global validation
  if (!countryCode) {
    return {
      isValid: true,
      coordinates: { latitude: lat, longitude: lng },
      country: 'Global'
    };
  }

  const countryConfig = getCountryConfig(countryCode);
  
  if (!countryConfig) {
    // If country not supported, allow global coordinates
    return {
      isValid: true,
      coordinates: { latitude: lat, longitude: lng },
      country: countryCode
    };
  }

  // Check if coordinates are within the country
  const bounds = countryConfig.coordinates;
  const isInCountry = lat <= bounds.north && 
                     lat >= bounds.south && 
                     lng <= bounds.east && 
                     lng >= bounds.west;
  
  if (!isInCountry) {
    return { 
      isValid: false, 
      error: `Coordinates are outside the territory of ${countryConfig.name}`,
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
    return { isValid: false, error: 'Address is required' };
  }

  const trimmedAddress = address.trim();

  if (trimmedAddress.length < 5) {
    return { isValid: false, error: 'Address too short' };
  }

  if (trimmedAddress.length > 200) {
    return { isValid: false, error: 'Address too long' };
  }

  // Check if contains at least some words
  const words = trimmedAddress.split(/\s+/);
  if (words.length < 2) {
    return { isValid: false, error: 'Address must contain at least two words' };
  }

  // Format address (capitalize first letter of each word)
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
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true };
};

// Validação de nomes
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Name too long' };
  }

  // Check if contains only letters, spaces and accented characters
  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(trimmedName)) {
    return { isValid: false, error: 'Name must contain only letters' };
  }

  return { isValid: true };
};