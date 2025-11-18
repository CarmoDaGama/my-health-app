import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { HealthService, Coordinates } from './index';

export type RootStackParamList = {
  // Core screens
  Splash: undefined;
  MainTabs: undefined;
  ServiceDetail: {
    service: HealthService;
  };
  MapDirections: {
    service: HealthService;
  };
  
  // Authentication screens
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  EmailVerification: {
    email?: string;
  };
  UserProfile: undefined;
  EditProfile: undefined;

  // Dashboard screens
  GuestDashboard: undefined;
  PatientDashboard: undefined;
  ProfessionalDashboard: undefined;
  InstitutionDashboard: undefined;
  AdminDashboard: undefined;

  // Patient features
  Favorites: undefined;
  Appointments: undefined;
  MedicalHistory: undefined;
  Reviews: undefined;

  // Professional features
  CreateService: undefined;
  EditService: {
    service: HealthService;
  };
  ManageAppointments: undefined;
  Analytics: undefined;
  ProfessionalSettings: undefined;

  // Institution features
  ManageServices: undefined;
  ManageProfessionals: undefined;
  InstitutionSchedule: undefined;
  InstitutionReports: undefined;
  InstitutionSettings: undefined;
  AllRequests: undefined;

  // Admin features
  AdminManageRoles: undefined;
  AdminPendingServices: undefined;
  SystemReports: undefined;
  UserManagement: undefined;
};

// Bottom Tab Navigator types
export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Favorites: undefined;
  Profile: undefined;
};

// Navigation prop types for Stack Navigator  
export type ServiceDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ServiceDetail'>;
export type MapDirectionsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MapDirections'>;
export type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

// Navigation prop types for Bottom Tab Navigator
export type HomeScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;
export type SearchScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Search'>;
export type FavoritesScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Favorites'>;
export type ProfileScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Profile'>;

// Authentication screen navigation props
export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
export type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;
export type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;
export type EmailVerificationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EmailVerification'>;
export type UserProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'UserProfile'>;
export type EditProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;

// Dashboard navigation props
export type GuestDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'GuestDashboard'>;
export type PatientDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'PatientDashboard'>;
export type ProfessionalDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'ProfessionalDashboard'>;
export type InstitutionDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'InstitutionDashboard'>;
export type AdminDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'AdminDashboard'>;

// Patient feature navigation props
export type FavoritesNavigationProp = StackNavigationProp<RootStackParamList, 'Favorites'>;
export type AppointmentsNavigationProp = StackNavigationProp<RootStackParamList, 'Appointments'>;
export type MedicalHistoryNavigationProp = StackNavigationProp<RootStackParamList, 'MedicalHistory'>;
export type ReviewsNavigationProp = StackNavigationProp<RootStackParamList, 'Reviews'>;

// Professional feature navigation props
export type CreateServiceNavigationProp = StackNavigationProp<RootStackParamList, 'CreateService'>;
export type EditServiceNavigationProp = StackNavigationProp<RootStackParamList, 'EditService'>;
export type ManageAppointmentsNavigationProp = StackNavigationProp<RootStackParamList, 'ManageAppointments'>;
export type AnalyticsNavigationProp = StackNavigationProp<RootStackParamList, 'Analytics'>;
export type ProfessionalSettingsNavigationProp = StackNavigationProp<RootStackParamList, 'ProfessionalSettings'>;

// Institution feature navigation props
export type ManageServicesNavigationProp = StackNavigationProp<RootStackParamList, 'ManageServices'>;
export type ManageProfessionalsNavigationProp = StackNavigationProp<RootStackParamList, 'ManageProfessionals'>;
export type InstitutionScheduleNavigationProp = StackNavigationProp<RootStackParamList, 'InstitutionSchedule'>;
export type InstitutionReportsNavigationProp = StackNavigationProp<RootStackParamList, 'InstitutionReports'>;
export type InstitutionSettingsNavigationProp = StackNavigationProp<RootStackParamList, 'InstitutionSettings'>;

// Admin feature navigation props
export type AdminManageRolesNavigationProp = StackNavigationProp<RootStackParamList, 'AdminManageRoles'>;
export type AdminPendingServicesNavigationProp = StackNavigationProp<RootStackParamList, 'AdminPendingServices'>;
export type SystemReportsNavigationProp = StackNavigationProp<RootStackParamList, 'SystemReports'>;
export type UserManagementNavigationProp = StackNavigationProp<RootStackParamList, 'UserManagement'>;

// Route prop types
export type ServiceDetailScreenRouteProp = RouteProp<RootStackParamList, 'ServiceDetail'>;
export type MapDirectionsScreenRouteProp = RouteProp<RootStackParamList, 'MapDirections'>;
export type EditServiceRouteProp = RouteProp<RootStackParamList, 'EditService'>;

// Generic navigation types for common usage
export type NavigationProp = StackNavigationProp<RootStackParamList>;
export type ScreenRouteProp<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;
