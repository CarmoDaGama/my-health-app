/**
 * Validation utilities for Angolan data and geographic coordinates
 */

// Validation of Angolan phone numbers
export interface PhoneValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
  operator?: 'Unitel' | 'Movicel' | 'Africell' | 'Unknown';
}

/**
 * Valida números de telefone angolanos
 * Formatos aceitos:
 * - +244 9XX XXX XXX (formato internacional)
 * - 9XX XXX XXX (formato nacional)
 * - 2XX XXX XXX (fixos)
 */
export const validateAngolanPhoneNumber = (phone: string): PhoneValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'Número de telefone é obrigatório' };
  }

  // Remover espaços, hífens e parênteses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Verificar se contém apenas números e + no início
  if (!/^\+?[0-9]+$/.test(cleanPhone)) {
    return { isValid: false, error: 'Número deve conter apenas dígitos' };
  }

  let nationalNumber = '';
  
  // Verificar formato internacional (+244)
  if (cleanPhone.startsWith('+244')) {
    nationalNumber = cleanPhone.substring(4);
  } else if (cleanPhone.startsWith('244')) {
    nationalNumber = cleanPhone.substring(3);
  } else {
    nationalNumber = cleanPhone;
  }

  // Validar comprimento (9 dígitos para móveis, 9 para fixos)
  if (nationalNumber.length !== 9) {
    return { isValid: false, error: 'Número deve ter 9 dígitos' };
  }

  // Verificar prefixos válidos
  const firstThreeDigits = nationalNumber.substring(0, 3);
  let operator: PhoneValidationResult['operator'] = 'Unknown';

  // Móveis
  if (['923', '924', '925', '926', '927', '928', '929'].includes(firstThreeDigits)) {
    operator = 'Unitel';
  } else if (['930', '931', '932', '933', '934', '935', '936', '937'].includes(firstThreeDigits)) {
    operator = 'Movicel';
  } else if (['940', '941', '942', '943', '944', '945', '946', '947'].includes(firstThreeDigits)) {
    operator = 'Africell';
  } 
  // Fixos Luanda (2XX)
  else if (nationalNumber.startsWith('2')) {
    const secondDigit = nationalNumber.charAt(1);
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(secondDigit)) {
      operator = 'Unknown'; // Telefones fixos
    } else {
      return { isValid: false, error: 'Prefixo de telefone fixo inválido' };
    }
  } else {
    return { isValid: false, error: 'Prefixo não reconhecido para Angola' };
  }

  // Formatar número
  const formatted = `+244 ${nationalNumber.substring(0, 3)} ${nationalNumber.substring(3, 6)} ${nationalNumber.substring(6)}`;

  return {
    isValid: true,
    formatted,
    operator
  };
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
 * Valida coordenadas geográficas para Angola
 * Angola fica entre:
 * - Latitude: -18.0 a -4.0
 * - Longitude: 11.0 a 24.0
 */
export const validateAngolanCoordinates = (
  latitude: number | string, 
  longitude: number | string
): CoordinateValidationResult => {
  const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
  const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;

  if (isNaN(lat) || isNaN(lng)) {
    return { isValid: false, error: 'Coordenadas devem ser números válidos' };
  }

  if (lat < -90 || lat > 90) {
    return { isValid: false, error: 'Latitude deve estar entre -90 e 90 graus' };
  }

  if (lng < -180 || lng > 180) {
    return { isValid: false, error: 'Longitude deve estar entre -180 e 180 graus' };
  }

  // Verificar se as coordenadas estão dentro de Angola (aproximadamente)
  const isInAngola = lat >= -18.5 && lat <= -4.0 && lng >= 11.0 && lng <= 24.5;
  
  if (!isInAngola) {
    return { 
      isValid: false, 
      error: 'Coordenadas estão fora do território angolano' 
    };
  }

  return {
    isValid: true,
    coordinates: { latitude: lat, longitude: lng }
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