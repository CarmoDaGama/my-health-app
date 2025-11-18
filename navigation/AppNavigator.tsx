import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { SplashScreen } from '../screens/SplashScreen';
import { ServiceDetailScreen } from '../screens/ServiceDetailScreen';
import { MapDirectionsScreen } from '../screens/MapDirectionsScreen';
import { MainTabNavigator } from './MainTabNavigator';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { useAuth } from '../hooks/useAuth-firebase';
import { useTranslation } from '../hooks/useTranslation';
import { ProtectedRoute } from '../components';
import { Colors } from '../constants';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigatorContent: React.FC = () => {
  const { isAuthenticated, isGuest, loading } = useAuth();
  const { t } = useTranslation();

  console.log('🚀 AppNavigatorContent renderizado:', { isAuthenticated, isGuest, loading });

  if (loading) {
    // Show splash screen while checking authentication
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  // Always go to MainTabs after splash screen
  const showMainApp = true;
  const initialRoute = "MainTabs";

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textOnPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* Main App - Always shown after Splash */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{
          headerShown: false, // Tabs will handle their own headers
        }}
      />
      
      <Stack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
        options={{
          title: 'Service Details',
          presentation: 'modal',
        }}
      />
      
      <Stack.Screen
        name="MapDirections"
        component={MapDirectionsScreen}
        options={{
          headerShown: false,
        }}
      />
      
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{
          title: t('profile.myProfile') || 'Meu Perfil',
        }}
      />
      
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: t('profile.editProfile') || 'Editar Perfil',
        }}
      />
      
      {/* Auth screens accessible from Profile */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: t('auth.login') || 'Login',
        }}
      />
      
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: t('auth.register') || 'Registrar',
        }}
      />
      
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: t('auth.forgotPassword') || 'Recuperar Senha',
        }}
      />
      
      <Stack.Screen
        name="EmailVerification"
        component={EmailVerificationScreen}
        options={{
          title: t('auth.verifyEmail') || 'Verificar Email',
        }}
      />
    </Stack.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <AppNavigatorContent />
    </NavigationContainer>
  );
};