/**
 * Estrutura de dados melhorada com separação de concerns
 */

// ========== TIPOS BÁSICOS ==========

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  country?: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  website?: string;
}

export interface WorkingHours {
  [day: string]: {
    start: string;
    end: string;
    available: boolean;
  };
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

// ========== SEPARAÇÃO DE CONCERNS ==========

/**
 * CORE: Dados essenciais do usuário (imutáveis ou quase)
 */
export interface UserCore {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * PROFILE: Dados de perfil (editáveis pelo usuário)
 */
export interface UserProfile {
  phone?: string;
  avatar?: string;
  isActive: boolean;
  isVerified?: boolean;
  preferences: UserPreferences;
}

/**
 * LOCATION: Dados relacionados a localização
 */
export interface UserLocation {
  coordinates?: Coordinates;
  address?: string | Address;
  timezone?: string;
}

/**
 * TYPE-SPECIFIC: Dados específicos por tipo de usuário
 */
export interface NormalUserSpecific {
  favoriteInstitutions: string[];
  searchHistory: string[];
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  emergencyContact?: EmergencyContact;
  medicalInfo?: {
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
  };
}

export interface ProfessionalSpecific {
  specialty: string;
  license: string;
  experience: number;
  bio?: string;
  certifications?: string[]; // Opcional - não editável no formulário
  workingHours?: WorkingHours; // Opcional - não editável no formulário
  consultationFee?: number;
  acceptsInsurance?: boolean; // Opcional - não editável no formulário
  institutionId?: string;
  favoriteInstitutions: string[];
  services?: string[];
}

export interface InstitutionSpecific {
  type: 'hospital' | 'clinic' | 'laboratory' | 'pharmacy' | 'other';
  services: string[];
  workingHours: WorkingHours;
  contactInfo: ContactInfo;
  description: string;
  acceptsInsurance: boolean;
  emergencyService: boolean;
  verified: boolean;
  rating: number;
  totalReviews: number;
  professionals: string[];
  capacity?: number;
  amenities?: string[];
}

// ========== TIPOS DE USUÁRIO COMPOSTOS ==========

/**
 * Base para todos os usuários
 */
export interface BaseUser extends UserCore, UserProfile {
  // Combina core + profile
}

/**
 * Usuário Normal
 */
export interface NormalUser extends BaseUser, UserLocation {
  userType: UserType.NORMAL_USER;
  normalUserInfo: NormalUserSpecific;
}

/**
 * Profissional
 */
export interface Professional extends BaseUser, UserLocation {
  userType: UserType.PROFESSIONAL;
  professionalInfo: ProfessionalSpecific;
}

/**
 * Instituição
 */
export interface Institution extends BaseUser, UserLocation {
  userType: UserType.INSTITUTION;
  institutionInfo: InstitutionSpecific;
}

// ========== TIPOS DE UNIÃO ==========

export type User = NormalUser | Professional | Institution;
export type AnyUser = GuestUser | User;

// ========== ENUMS ==========

export enum UserType {
  GUEST = 'guest',
  NORMAL_USER = 'normal_user',
  PROFESSIONAL = 'professional',
  INSTITUTION = 'institution'
}

// ========== INTERFACES DE SUPORTE ==========

export interface GuestUser {
  userType: UserType.GUEST;
  id: 'guest';
}

export interface UserPreferences {
  language: 'pt' | 'en';
  notifications: {
    enabled: boolean;
    serviceReminders: boolean;
    healthTips: boolean;
    emergencyAlerts: boolean;
  };
  favorites: {
    services: string[];
    locations: Coordinates[];
  };
  privacy: {
    shareLocation: boolean;
    publicProfile: boolean;
  };
  accessibility?: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reduceMotion: boolean;
  };
}

// ========== TYPE GUARDS ==========

export function isGuestUser(user: AnyUser): user is GuestUser {
  return user.userType === UserType.GUEST;
}

export function isNormalUser(user: AnyUser): user is NormalUser {
  return user.userType === UserType.NORMAL_USER;
}

export function isProfessional(user: AnyUser): user is Professional {
  return user.userType === UserType.PROFESSIONAL;
}

export function isInstitution(user: AnyUser): user is Institution {
  return user.userType === UserType.INSTITUTION;
}

export function isLoggedInUser(user: AnyUser): user is User {
  return !isGuestUser(user);
}

// ========== MIGRATION HELPERS ==========

/**
 * Converte dados legados para nova estrutura
 */
export function migrateUserToNewStructure(legacyUser: any): User | null {
  if (!legacyUser || !legacyUser.userType) {
    return null;
  }

  const baseUser: BaseUser = {
    id: legacyUser.id,
    email: legacyUser.email,
    name: legacyUser.name,
    userType: legacyUser.userType,
    createdAt: legacyUser.createdAt,
    updatedAt: legacyUser.updatedAt,
    phone: legacyUser.phone,
    avatar: legacyUser.avatar,
    isActive: legacyUser.isActive !== false,
    isVerified: legacyUser.isVerified,
    preferences: legacyUser.preferences || {}
  };

  const location: UserLocation = {
    coordinates: legacyUser.coordinates || legacyUser.professionalInfo?.coordinates || legacyUser.institutionInfo?.coordinates,
    address: legacyUser.address || legacyUser.professionalInfo?.address || legacyUser.institutionInfo?.address,
  };

  switch (legacyUser.userType) {
    case UserType.NORMAL_USER:
      return {
        ...baseUser,
        ...location,
        userType: UserType.NORMAL_USER,
        normalUserInfo: {
          favoriteInstitutions: legacyUser.favoriteInstitutions || [],
          searchHistory: legacyUser.searchHistory || [],
          dateOfBirth: legacyUser.dateOfBirth,
          gender: legacyUser.gender,
          emergencyContact: legacyUser.emergencyContact,
        }
      } as NormalUser;

    case UserType.PROFESSIONAL:
      return {
        ...baseUser,
        ...location,
        userType: UserType.PROFESSIONAL,
        professionalInfo: {
          specialty: legacyUser.professionalInfo?.specialty || '',
          license: legacyUser.professionalInfo?.license || '',
          experience: legacyUser.professionalInfo?.experience || 0,
          bio: legacyUser.professionalInfo?.bio,
          certifications: legacyUser.professionalInfo?.certifications || [],
          workingHours: legacyUser.professionalInfo?.workingHours || {},
          consultationFee: legacyUser.professionalInfo?.consultationFee,
          acceptsInsurance: legacyUser.professionalInfo?.acceptsInsurance || false,
          institutionId: legacyUser.institutionId,
          favoriteInstitutions: legacyUser.favoriteInstitutions || [],
          services: legacyUser.professionalInfo?.services || [],
        }
      } as Professional;

    case UserType.INSTITUTION:
      return {
        ...baseUser,
        ...location,
        userType: UserType.INSTITUTION,
        institutionInfo: {
          type: legacyUser.institutionInfo?.type || 'clinic',
          services: legacyUser.institutionInfo?.services || [],
          workingHours: legacyUser.institutionInfo?.workingHours || {},
          contactInfo: legacyUser.institutionInfo?.contactInfo || { phone: '', email: '' },
          description: legacyUser.institutionInfo?.description || '',
          acceptsInsurance: legacyUser.institutionInfo?.acceptsInsurance || false,
          emergencyService: legacyUser.institutionInfo?.emergencyService || false,
          verified: legacyUser.institutionInfo?.verified || false,
          rating: legacyUser.institutionInfo?.rating || 0,
          totalReviews: legacyUser.institutionInfo?.totalReviews || 0,
          professionals: legacyUser.professionals || [],
        }
      } as Institution;

    default:
      return null;
  }
}

// ========== VALIDATION HELPERS ==========

export function validateUserCore(core: Partial<UserCore>): boolean {
  const validUserTypes = [UserType.GUEST, UserType.NORMAL_USER, UserType.PROFESSIONAL, UserType.INSTITUTION];
  return !!(
    core.id &&
    core.email &&
    core.name &&
    core.userType &&
    validUserTypes.indexOf(core.userType as UserType) !== -1
  );
}

export function validateCoordinates(coordinates: any): coordinates is Coordinates {
  return !!(
    coordinates &&
    typeof coordinates.latitude === 'number' &&
    typeof coordinates.longitude === 'number' &&
    coordinates.latitude >= -90 &&
    coordinates.latitude <= 90 &&
    coordinates.longitude >= -180 &&
    coordinates.longitude <= 180
  );
}
