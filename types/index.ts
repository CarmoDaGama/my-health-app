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

// User Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
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
    services: string[]; // Array of service IDs
    locations: Coordinates[];
  };
  privacy: {
    shareLocation: boolean;
    publicProfile: boolean;
  };
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  name: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  user: User | null;
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
