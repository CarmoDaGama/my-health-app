import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { HealthService, Coordinates } from './index';

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Home: undefined;
  Map: {
    services: HealthService[];
    userLocation?: Coordinates;
  };
  ServiceDetail: {
    service: HealthService;
  };
  MapDirections: {
    service: HealthService;
  };
  Profile: undefined;
  
  // Authentication screens
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  UserProfile: undefined;
  EditProfile: undefined;
};

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Map'>;
export type ServiceDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ServiceDetail'>;
export type MapDirectionsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MapDirections'>;
export type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;
export type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;
export type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

// Authentication screen navigation props
export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
export type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;
export type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;
export type UserProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'UserProfile'>;
export type EditProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;

export type MapScreenRouteProp = RouteProp<RootStackParamList, 'Map'>;
export type ServiceDetailScreenRouteProp = RouteProp<RootStackParamList, 'ServiceDetail'>;
export type MapDirectionsScreenRouteProp = RouteProp<RootStackParamList, 'MapDirections'>;
