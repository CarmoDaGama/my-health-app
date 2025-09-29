export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Schedule {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface HealthService {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'emergency' | 'laboratory' | 'professional';
  address: string;
  city: string;
  state: string;
  country?: string;
  coordinates: Coordinates;
  phone: string;
  description: string;
  rating?: number;
  reviews?: number;
  services?: string[];
  
  // Propriedades específicas para profissionais
  specialty?: string;
  clinic?: string;
  email?: string;
  schedule?: Schedule;
  education?: string;
  experience?: string;
}

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// User Types Enum
export enum UserType {
  GUEST = 'guest',
  NORMAL_USER = 'normal_user',
  PROFESSIONAL = 'professional',
  INSTITUTION = 'institution'
}

// Base User Interface
export interface BaseUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  userType: UserType;
  createdAt: Date;
  updatedAt: Date;
}

// Guest User Interface
export interface GuestUser {
  userType: UserType.GUEST;
  id: 'guest';
}

// Normal User Interface
export interface NormalUser extends BaseUser {
  userType: UserType.NORMAL_USER;
  favoriteInstitutions: string[];
  searchHistory: string[];
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences: UserPreferences;
}

// Professional Interface
export interface Professional extends BaseUser {
  userType: UserType.PROFESSIONAL;
  professionalInfo: {
    specialty: string;
    license: string;
    experience: number;
    bio?: string;
    certifications: string[];
    workingHours: {
      [key: string]: { start: string; end: string; available: boolean };
    };
    consultationFee?: number;
    acceptsInsurance: boolean;
  };
  institutionId?: string;
  favoriteInstitutions: string[];
  preferences: UserPreferences;
}

// Institution Interface
export interface Institution extends BaseUser {
  userType: UserType.INSTITUTION;
  institutionInfo: {
    type: 'hospital' | 'clinic' | 'laboratory' | 'pharmacy' | 'other';
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      coordinates?: { lat: number; lng: number };
    };
    services: string[];
    workingHours: {
      [key: string]: { start: string; end: string; available: boolean };
    };
    contactInfo: {
      phone: string;
      email: string;
      website?: string;
    };
    description: string;
    acceptsInsurance: boolean;
    emergencyService: boolean;
    verified: boolean;
    rating: number;
    totalReviews: number;
  };
  professionals: string[];
  preferences: UserPreferences;
}

// User Type Unions
export type User = NormalUser | Professional | Institution;
export type AnyUser = GuestUser | User;

// Type Guards
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

// User Preferences Interface
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
}

// Authentication Types
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  name: string;
  phone?: string;
  userType: UserType;
  acceptTerms: boolean;
  professionalInfo?: any;
  institutionInfo?: any;
}

export interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  user: AnyUser | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
