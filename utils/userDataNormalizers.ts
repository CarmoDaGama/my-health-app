/**
 * Utilitários para normalização de dados de usuários
 */

import { UserPreferences } from '../types';

/**
 * Normaliza a estrutura de preferences para garantir consistência
 */
export function normalizePreferences(currentPreferences: any): UserPreferences {
  const defaultPreferences: UserPreferences = {
    language: 'pt',
    notifications: {
      enabled: true,
      serviceReminders: true,
      healthTips: true,
      emergencyAlerts: true
    },
    favorites: {
      services: [],
      locations: []
    },
    privacy: {
      shareLocation: true,
      publicProfile: false
    }
  };

  // Se preferences não existe ou está vazio
  if (!currentPreferences || typeof currentPreferences !== 'object') {
    return defaultPreferences;
  }

  const normalized: UserPreferences = {
    language: currentPreferences.language || defaultPreferences.language,
    notifications: defaultPreferences.notifications,
    favorites: {
      services: [],
      locations: []
    },
    privacy: {
      shareLocation: true,
      publicProfile: false
    }
  };

  // Migrar notifications - verificar se é boolean ou objeto
  if (typeof currentPreferences.notifications === 'boolean') {
    // Caso legado: preferences.notifications é boolean
    normalized.notifications = {
      enabled: currentPreferences.notifications,
      serviceReminders: true,
      healthTips: true,
      emergencyAlerts: true
    };
  } else if (
    currentPreferences.notifications && 
    typeof currentPreferences.notifications === 'object'
  ) {
    // Caso atual: preferences.notifications é objeto
    normalized.notifications = {
      enabled: currentPreferences.notifications.enabled !== false,
      serviceReminders: currentPreferences.notifications.serviceReminders !== false,
      healthTips: currentPreferences.notifications.healthTips !== false,
      emergencyAlerts: currentPreferences.notifications.emergencyAlerts !== false
    };
  }

  // Migrar favorites
  if (currentPreferences.favorites && typeof currentPreferences.favorites === 'object') {
    normalized.favorites = {
      services: Array.isArray(currentPreferences.favorites.services) 
        ? currentPreferences.favorites.services 
        : [],
      locations: Array.isArray(currentPreferences.favorites.locations) 
        ? currentPreferences.favorites.locations 
        : []
    };
  }

  // Migrar privacy
  if (currentPreferences.privacy && typeof currentPreferences.privacy === 'object') {
    normalized.privacy = {
      shareLocation: currentPreferences.privacy.shareLocation !== false,
      publicProfile: currentPreferences.privacy.publicProfile === true
    };
  }

  return normalized;
}

/**
 * Normaliza coordenadas para formato padrão
 */
export interface StandardCoordinates {
  latitude: number;
  longitude: number;
}

export function normalizeCoordinates(coords: any): StandardCoordinates | null {
  if (!coords || typeof coords !== 'object') {
    return null;
  }

  // Formato padrão: { latitude, longitude }
  if (typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
    return {
      latitude: coords.latitude,
      longitude: coords.longitude
    };
  }

  // Formato alternativo: { lat, lng }
  if (typeof coords.lat === 'number' && typeof coords.lng === 'number') {
    return {
      latitude: coords.lat,
      longitude: coords.lng
    };
  }

  return null;
}

/**
 * Valida se as coordenadas são válidas
 */
export function isValidCoordinates(coords: StandardCoordinates | null): coords is StandardCoordinates {
  if (!coords) return false;
  
  return (
    typeof coords.latitude === 'number' &&
    typeof coords.longitude === 'number' &&
    coords.latitude >= -90 && coords.latitude <= 90 &&
    coords.longitude >= -180 && coords.longitude <= 180
  );
}

/**
 * Utilitário para debug de dados de usuário
 */
export function debugUserData(user: any, context: string = '') {
  console.log(`🔍 [${context}] User Debug:`, {
    id: user?.id,
    userType: user?.userType,
    hasPreferences: !!user?.preferences,
    preferencesStructure: user?.preferences ? {
      hasLanguage: typeof user.preferences.language === 'string',
      notificationType: typeof user.preferences.notifications,
      hasFavorites: !!user.preferences.favorites,
      hasPrivacy: !!user.preferences.privacy
    } : 'none',
    hasTypeSpecificData: {
      professional: !!user?.professionalInfo,
      institution: !!user?.institutionInfo,
      normalUser: !!(user?.favoriteInstitutions !== undefined || user?.searchHistory !== undefined)
    }
  });
}
