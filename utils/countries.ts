/**
 * Configurações de países para validações regionais
 * Sistema internacional para suportar múltiplos países
 */

export interface CountryBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface PhoneConfig {
  countryCode: string;
  regex: RegExp;
  format: string;
  example: string;
  operators?: string[];
}

export interface CountryConfig {
  code: string;
  name: string;
  nativeName: string;
  currency: string;
  locale: string;
  coordinates: CountryBounds;
  phone: PhoneConfig;
  emergencyNumber: string;
  timezones: string[];
}

/**
 * Configurações de países suportados
 */
export const COUNTRIES: Record<string, CountryConfig> = {
  // Angola - Configuração original
  AO: {
    code: 'AO',
    name: 'Angola',
    nativeName: 'Angola',
    currency: 'AOA',
    locale: 'pt-AO',
    coordinates: {
      north: -4.376,
      south: -18.042,
      east: 24.084,
      west: 11.679,
    },
    phone: {
      countryCode: '+244',
      regex: /^\+?244\s?9[0-9]{2}\s?[0-9]{3}\s?[0-9]{3}$/,
      format: '+244 9XX XXX XXX',
      example: '+244 923 456 789',
      operators: ['Unitel', 'Movicel', 'Africell'],
    },
    emergencyNumber: '113',
    timezones: ['Africa/Luanda'],
  },

  // Brasil
  BR: {
    code: 'BR',
    name: 'Brazil',
    nativeName: 'Brasil',
    currency: 'BRL',
    locale: 'pt-BR',
    coordinates: {
      north: 5.272,
      south: -33.751,
      east: -28.848,
      west: -73.985,
    },
    phone: {
      countryCode: '+55',
      regex: /^\+?55\s?\([0-9]{2}\)\s?9?[0-9]{4}[-\s]?[0-9]{4}$/,
      format: '+55 (XX) 9XXXX-XXXX',
      example: '+55 (11) 99999-8888',
      operators: ['Vivo', 'Claro', 'TIM', 'Oi'],
    },
    emergencyNumber: '190',
    timezones: ['America/Sao_Paulo', 'America/Manaus', 'America/Fortaleza'],
  },

  // Portugal
  PT: {
    code: 'PT',
    name: 'Portugal',
    nativeName: 'Portugal',
    currency: 'EUR',
    locale: 'pt-PT',
    coordinates: {
      north: 42.154,
      south: 36.838,
      east: -6.189,
      west: -9.501,
    },
    phone: {
      countryCode: '+351',
      regex: /^\+?351\s?9[0-9]{8}$/,
      format: '+351 9XXXXXXXX',
      example: '+351 912345678',
      operators: ['MEO', 'Vodafone', 'NOS'],
    },
    emergencyNumber: '112',
    timezones: ['Europe/Lisbon'],
  },

  // Estados Unidos
  US: {
    code: 'US',
    name: 'United States',
    nativeName: 'United States',
    currency: 'USD',
    locale: 'en-US',
    coordinates: {
      north: 71.538,
      south: 18.911,
      east: -66.885,
      west: 172.461,
    },
    phone: {
      countryCode: '+1',
      regex: /^\+?1\s?\([0-9]{3}\)\s?[0-9]{3}[-\s]?[0-9]{4}$/,
      format: '+1 (XXX) XXX-XXXX',
      example: '+1 (555) 123-4567',
      operators: ['Verizon', 'AT&T', 'T-Mobile', 'Sprint'],
    },
    emergencyNumber: '911',
    timezones: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'],
  },

  // Moçambique
  MZ: {
    code: 'MZ',
    name: 'Mozambique',
    nativeName: 'Moçambique',
    currency: 'MZN',
    locale: 'pt-MZ',
    coordinates: {
      north: -10.417,
      south: -26.868,
      east: 40.842,
      west: 30.217,
    },
    phone: {
      countryCode: '+258',
      regex: /^\+?258\s?8[0-9]{7}$/,
      format: '+258 8XXXXXXX',
      example: '+258 82345678',
      operators: ['Vodacom', 'Tmcel', 'Movitel'],
    },
    emergencyNumber: '117',
    timezones: ['Africa/Maputo'],
  },

  // Cabo Verde
  CV: {
    code: 'CV',
    name: 'Cape Verde',
    nativeName: 'Cabo Verde',
    currency: 'CVE',
    locale: 'pt-CV',
    coordinates: {
      north: 17.197,
      south: 14.808,
      east: -22.669,
      west: -25.358,
    },
    phone: {
      countryCode: '+238',
      regex: /^\+?238\s?[0-9]{7}$/,
      format: '+238 XXXXXXX',
      example: '+238 2345678',
      operators: ['CVMóvel', 'T+'],
    },
    emergencyNumber: '132',
    timezones: ['Atlantic/Cape_Verde'],
  },

  // Espanha
  ES: {
    code: 'ES',
    name: 'Spain',
    nativeName: 'España',
    currency: 'EUR',
    locale: 'es-ES',
    coordinates: {
      north: 43.791,
      south: 36.006,
      east: 4.329,
      west: -9.301,
    },
    phone: {
      countryCode: '+34',
      regex: /^\+?34\s?[6-9][0-9]{8}$/,
      format: '+34 XXXXXXXXX',
      example: '+34 612345678',
      operators: ['Movistar', 'Vodafone', 'Orange', 'Yoigo'],
    },
    emergencyNumber: '112',
    timezones: ['Europe/Madrid'],
  },

  // Reino Unido
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    nativeName: 'United Kingdom',
    currency: 'GBP',
    locale: 'en-GB',
    coordinates: {
      north: 60.854,
      south: 49.960,
      east: 1.768,
      west: -8.623,
    },
    phone: {
      countryCode: '+44',
      regex: /^\+?44\s?7[0-9]{9}$/,
      format: '+44 7XXXXXXXXX',
      example: '+44 7123456789',
      operators: ['EE', 'Vodafone', 'O2', 'Three'],
    },
    emergencyNumber: '999',
    timezones: ['Europe/London'],
  },

  // França
  FR: {
    code: 'FR',
    name: 'France',
    nativeName: 'France',
    currency: 'EUR',
    locale: 'fr-FR',
    coordinates: {
      north: 51.088,
      south: 41.333,
      east: 9.560,
      west: -5.225,
    },
    phone: {
      countryCode: '+33',
      regex: /^\+?33\s?[67][0-9]{8}$/,
      format: '+33 X XX XX XX XX',
      example: '+33 6 12 34 56 78',
      operators: ['Orange', 'SFR', 'Bouygues', 'Free'],
    },
    emergencyNumber: '112',
    timezones: ['Europe/Paris'],
  },

  // República do Congo
  CG: {
    code: 'CG',
    name: 'Republic of the Congo',
    nativeName: 'République du Congo',
    currency: 'XAF',
    locale: 'fr-CG',
    coordinates: {
      north: 3.703,
      south: -5.027,
      east: 18.649,
      west: 11.093,
    },
    phone: {
      countryCode: '+242',
      regex: /^\+?242\s?0[567][0-9]{7}$/,
      format: '+242 0X XXX XXXX',
      example: '+242 06 123 4567',
      operators: ['Airtel Congo', 'MTN Congo', 'Azur Congo'],
    },
    emergencyNumber: '118',
    timezones: ['Africa/Brazzaville'],
  },

  // República Democrática do Congo
  CD: {
    code: 'CD',
    name: 'Democratic Republic of the Congo',
    nativeName: 'République Démocratique du Congo',
    currency: 'CDF',
    locale: 'fr-CD',
    coordinates: {
      north: 5.373,
      south: -13.455,
      east: 31.305,
      west: 12.204,
    },
    phone: {
      countryCode: '+243',
      regex: /^\+?243\s?[89][0-9]{8}$/,
      format: '+243 X XXXX XXXX',
      example: '+243 8 1234 5678',
      operators: ['Vodacom Congo', 'Airtel RDC', 'Orange RDC', 'Africell RDC'],
    },
    emergencyNumber: '112',
    timezones: ['Africa/Kinshasa', 'Africa/Lubumbashi'],
  },
};

/**
 * País padrão (Angola) para compatibilidade
 */
export const DEFAULT_COUNTRY = 'AO';

/**
 * Detectar país com base nas coordenadas
 */
export function detectCountryByCoordinates(latitude: number, longitude: number): string {
  for (const [countryCode, config] of Object.entries(COUNTRIES)) {
    const bounds = config.coordinates;
    if (
      latitude >= bounds.south &&
      latitude <= bounds.north &&
      longitude >= bounds.west &&
      longitude <= bounds.east
    ) {
      return countryCode;
    }
  }
  return DEFAULT_COUNTRY;
}

/**
 * Obter configuração do país
 */
export function getCountryConfig(countryCode?: string): CountryConfig {
  const code = countryCode || DEFAULT_COUNTRY;
  return COUNTRIES[code] || COUNTRIES[DEFAULT_COUNTRY];
}

/**
 * Validar se coordenadas estão dentro de um país
 */
export function isLocationInCountry(
  latitude: number, 
  longitude: number, 
  countryCode: string
): boolean {
  const config = getCountryConfig(countryCode);
  const bounds = config.coordinates;
  
  return (
    latitude >= bounds.south &&
    latitude <= bounds.north &&
    longitude >= bounds.west &&
    longitude <= bounds.east
  );
}

/**
 * Listar países suportados
 */
export function getSupportedCountries(): Array<{code: string; name: string; nativeName: string}> {
  return Object.values(COUNTRIES).map(country => ({
    code: country.code,
    name: country.name,
    nativeName: country.nativeName,
  }));
}

/**
 * Detectar país com base no código de telefone
 */
export function detectCountryByPhone(phone: string): string | null {
  // Remover caracteres especiais
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  for (const [countryCode, config] of Object.entries(COUNTRIES)) {
    if (cleanPhone.startsWith(config.phone.countryCode.replace('+', ''))) {
      return countryCode;
    }
  }
  
  return null;
}

/**
 * Validar coordenadas globalmente (qualquer país suportado)
 */
export function isValidGlobalCoordinates(latitude: number, longitude: number): {
  isValid: boolean;
  country?: string;
  error?: string;
} {
  // Validações básicas de coordenadas
  if (latitude < -90 || latitude > 90) {
    return { 
      isValid: false, 
      error: 'Latitude must be between -90 and 90 degrees' 
    };
  }
  
  if (longitude < -180 || longitude > 180) {
    return { 
      isValid: false, 
      error: 'Longitude must be between -180 and 180 degrees' 
    };
  }
  
  // Verificar se não são coordenadas nulas
  if (latitude === 0 && longitude === 0) {
    return { 
      isValid: false, 
      error: 'Invalid coordinates (0,0)' 
    };
  }
  
  // Detectar país
  const country = detectCountryByCoordinates(latitude, longitude);
  
  return {
    isValid: true,
    country,
  };
}

export default {
  COUNTRIES,
  DEFAULT_COUNTRY,
  getCountryConfig,
  detectCountryByCoordinates,
  isLocationInCountry,
  getSupportedCountries,
  detectCountryByPhone,
  isValidGlobalCoordinates,
};