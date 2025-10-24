/**
 * Adaptador para migração gradual entre estruturas de dados
 * 
 * Este arquivo facilita a transição da estrutura atual para a nova estrutura
 * com separação de concerns, permitindo compatibilidade durante a migração.
 */

import { 
  User as LegacyUser, 
  Professional as LegacyProfessional, 
  Institution as LegacyInstitution,
  NormalUser as LegacyNormalUser,
  UserType as LegacyUserType 
} from '../types/index';

import {
  User as NewUser,
  Professional as NewProfessional,
  Institution as NewInstitution,
  NormalUser as NewNormalUser,
  UserType as NewUserType,
  migrateUserToNewStructure,
  validateUserCore,
  validateCoordinates,
  Coordinates,
  UserPreferences
} from '../types/userStructure';

/**
 * Classe adaptadora para facilitar migração
 */
export class UserDataAdapter {
  
  /**
   * Converte usuário da estrutura legada para nova estrutura
   */
  static toLegacyUser(newUser: NewUser): LegacyUser {
    const legacyBase = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      avatar: newUser.avatar,
      userType: newUser.userType as any,
      isActive: newUser.isActive,
      isVerified: newUser.isVerified,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
      preferences: newUser.preferences
    };

    switch (newUser.userType) {
      case NewUserType.NORMAL_USER:
        const normalUser = newUser as NewNormalUser;
        return {
          ...legacyBase,
          userType: LegacyUserType.NORMAL_USER,
          favoriteInstitutions: normalUser.normalUserInfo.favoriteInstitutions,
          searchHistory: normalUser.normalUserInfo.searchHistory,
          dateOfBirth: normalUser.normalUserInfo.dateOfBirth,
          gender: normalUser.normalUserInfo.gender,
          address: typeof normalUser.address === 'string' ? normalUser.address : undefined,
          emergencyContact: normalUser.normalUserInfo.emergencyContact,
        } as LegacyNormalUser;

      case NewUserType.PROFESSIONAL:
        const professional = newUser as NewProfessional;
        return {
          ...legacyBase,
          userType: LegacyUserType.PROFESSIONAL,
          professionalInfo: {
            ...professional.professionalInfo,
            coordinates: professional.coordinates,
            address: typeof professional.address === 'string' ? professional.address : undefined,
          },
          institutionId: professional.professionalInfo.institutionId,
          favoriteInstitutions: professional.professionalInfo.favoriteInstitutions,
        } as LegacyProfessional;

      case NewUserType.INSTITUTION:
        const institution = newUser as NewInstitution;
        return {
          ...legacyBase,
          userType: LegacyUserType.INSTITUTION,
          institutionInfo: {
            ...institution.institutionInfo,
            coordinates: institution.coordinates,
            address: typeof institution.address === 'object' ? institution.address : {
              street: institution.address || '',
              city: '',
              state: '',
              zipCode: ''
            }
          },
          professionals: institution.institutionInfo.professionals,
        } as LegacyInstitution;

      default:
        throw new Error(`Tipo de usuário não suportado: ${(newUser as any).userType}`);
    }
  }

  /**
   * Converte usuário da estrutura nova para legada
   */
  static fromLegacyUser(legacyUser: LegacyUser): NewUser | null {
    return migrateUserToNewStructure(legacyUser);
  }

  /**
   * Verifica se um objeto é um usuário válido na estrutura legada
   */
  static isValidLegacyUser(user: any): user is LegacyUser {
    return !!(
      user &&
      user.id &&
      user.email &&
      user.name &&
      user.userType &&
      [LegacyUserType.NORMAL_USER, LegacyUserType.PROFESSIONAL, LegacyUserType.INSTITUTION].indexOf(user.userType) !== -1
    );
  }

  /**
   * Verifica se um objeto é um usuário válido na nova estrutura
   */
  static isValidNewUser(user: any): user is NewUser {
    if (!validateUserCore(user)) {
      return false;
    }

    switch (user.userType) {
      case NewUserType.NORMAL_USER:
        return !!(user.normalUserInfo && Array.isArray(user.normalUserInfo.favoriteInstitutions));
      
      case NewUserType.PROFESSIONAL:
        return !!(
          user.professionalInfo &&
          user.professionalInfo.specialty &&
          user.professionalInfo.license &&
          typeof user.professionalInfo.experience === 'number'
        );
      
      case NewUserType.INSTITUTION:
        return !!(
          user.institutionInfo &&
          user.institutionInfo.type &&
          Array.isArray(user.institutionInfo.services)
        );
      
      default:
        return false;
    }
  }

  /**
   * Normaliza preferences para garantir estrutura correta
   */
  static normalizePreferences(preferences: any): UserPreferences {
    const defaults: UserPreferences = {
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

    if (!preferences || typeof preferences !== 'object') {
      return defaults;
    }

    return {
      language: preferences.language || defaults.language,
      notifications: typeof preferences.notifications === 'boolean' 
        ? { ...defaults.notifications, enabled: preferences.notifications }
        : { ...defaults.notifications, ...preferences.notifications },
      favorites: {
        services: Array.isArray(preferences.favorites?.services) 
          ? preferences.favorites.services 
          : defaults.favorites.services,
        locations: Array.isArray(preferences.favorites?.locations) 
          ? preferences.favorites.locations 
          : defaults.favorites.locations
      },
      privacy: {
        shareLocation: preferences.privacy?.shareLocation !== false,
        publicProfile: preferences.privacy?.publicProfile === true
      },
      accessibility: preferences.accessibility || undefined
    };
  }

  /**
   * Normaliza coordenadas para formato padrão
   */
  static normalizeCoordinates(coords: any): Coordinates | null {
    if (!coords || typeof coords !== 'object') {
      return null;
    }

    // Formato padrão: { latitude, longitude }
    if (typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
      const normalized = {
        latitude: coords.latitude,
        longitude: coords.longitude
      };
      return validateCoordinates(normalized) ? normalized : null;
    }

    // Formato alternativo: { lat, lng }
    if (typeof coords.lat === 'number' && typeof coords.lng === 'number') {
      const normalized = {
        latitude: coords.lat,
        longitude: coords.lng
      };
      return validateCoordinates(normalized) ? normalized : null;
    }

    return null;
  }

  /**
   * Gera dados de debug para diagnóstico
   */
  static debugUserStructure(user: any, context: string = ''): void {
    console.log(`🔍 [${context}] Estrutura do Usuário:`, {
      id: user?.id,
      userType: user?.userType,
      hasNewStructure: UserDataAdapter.isValidNewUser(user),
      hasLegacyStructure: UserDataAdapter.isValidLegacyUser(user),
      coordinates: {
        hasCoordinates: !!(user?.coordinates || user?.professionalInfo?.coordinates || user?.institutionInfo?.coordinates),
        format: user?.coordinates ? 'new' : (user?.professionalInfo?.coordinates ? 'professional' : (user?.institutionInfo?.coordinates ? 'institution' : 'none')),
        isValid: !!(
          UserDataAdapter.normalizeCoordinates(user?.coordinates) ||
          UserDataAdapter.normalizeCoordinates(user?.professionalInfo?.coordinates) ||
          UserDataAdapter.normalizeCoordinates(user?.institutionInfo?.coordinates)
        )
      },
      preferences: {
        hasPreferences: !!user?.preferences,
        notificationsType: typeof user?.preferences?.notifications,
        isNormalized: typeof user?.preferences?.notifications === 'object'
      },
      typeSpecificData: {
        normal: !!(user?.normalUserInfo || user?.favoriteInstitutions !== undefined),
        professional: !!(user?.professionalInfo),
        institution: !!(user?.institutionInfo)
      }
    });
  }
}

/**
 * Hook para facilitar migração em componentes React
 */
export function useUserDataMigration() {
  const migrateUser = (user: any): NewUser | LegacyUser | null => {
    if (!user) return null;

    // Tentar usar estrutura nova primeiro
    if (UserDataAdapter.isValidNewUser(user)) {
      return user as NewUser;
    }

    // Fallback para estrutura legada
    if (UserDataAdapter.isValidLegacyUser(user)) {
      const migrated = UserDataAdapter.fromLegacyUser(user);
      if (migrated) {
        return migrated;
      }
      return user as LegacyUser;
    }

    // Tentar normalizar dados corrompidos
    console.warn('🚨 Dados de usuário em formato não reconhecido, tentando normalizar:', user);
    
    try {
      const normalized = migrateUserToNewStructure(user);
      return normalized;
    } catch (error) {
      console.error('❌ Falha na normalização dos dados do usuário:', error);
      return null;
    }
  };

  const normalizePreferences = UserDataAdapter.normalizePreferences;
  const normalizeCoordinates = UserDataAdapter.normalizeCoordinates;
  const debugUser = UserDataAdapter.debugUserStructure;

  return {
    migrateUser,
    normalizePreferences,
    normalizeCoordinates,
    debugUser
  };
}

// Exportar tipos para retrocompatibilidade
export type CompatibleUser = LegacyUser | NewUser;
export { UserDataAdapter as default };
