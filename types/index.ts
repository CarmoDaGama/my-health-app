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

// Export types for institution service management
export * from './institutionService';

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
  reviewCount?: number;
  services?: string[];
  status?: 'active' | 'suspended';
  isActive?: boolean;
  createdBy?: string;
  institutionId?: string;
  
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
  INSTITUTION = 'institution',
  ADMIN = 'admin'
}

// Base User Interface
export interface BaseUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  userType: UserType;
  isActive: boolean; // Se false/null/undefined, usuário não pode fazer login
  isVerified?: boolean; // Para profissionais/instituições - se false/null/undefined, não aparece na busca
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
    certifications?: string[]; // Opcional - não editável no formulário
    services?: string[];
    coordinates?: Coordinates;
    address?: string;
    workingHours?: { // Opcional - não editável no formulário
      [key: string]: { start: string; end: string; available: boolean };
    };
    consultationFee?: number;
    acceptsInsurance?: boolean; // Opcional - não editável no formulário
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
    coordinates?: Coordinates; // Padronizado: usar interface Coordinates
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    services: string[];
    workingHours: {
      [key: string]: { start: string; end: string; available: boolean };
    };
    contactInfo?: {
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

// UserProfile alias for compatibility with auth systems
export type UserProfile = User & {
  preferences: UserPreferences;
};

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
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  error?: string;
  needsEmailVerification?: boolean;
}

export interface ResetPasswordData {
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Review System Types
export interface Review {
  id: string;
  serviceId: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  verified: boolean;
  helpful?: number; // number of users who found this helpful
  reported?: boolean;
}

export interface ReviewInput {
  serviceId: string;
  rating: number;
  comment: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewsResponse {
  reviews: Review[];
  stats: ReviewStats;
  hasMore: boolean;
  lastDocId?: string;
}

export interface ReviewFilters {
  rating?: number;
  sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
  limit?: number;
  lastDocId?: string;
}
