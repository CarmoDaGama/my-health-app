import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { SplashScreen } from '../screens/SplashScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import { MapScreen } from '../screens/MapScreen';
import { ServiceDetailScreen } from '../screens/ServiceDetailScreen';
import { MapDirectionsScreen } from '../screens/MapDirectionsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from '../components';
import { Colors } from '../constants';
import i18n from '../utils/i18n';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigatorContent: React.FC = () => {
  const { isAuthenticated, isGuest, isLoading } = useAuth();

  console.log('🚀 AppNavigatorContent renderizado:', { isAuthenticated, isGuest, isLoading });

  if (isLoading) {
    // Show splash screen while checking authentication
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  // Show main app if authenticated OR in guest mode
  const showMainApp = isAuthenticated || isGuest;

  return (
    <Stack.Navigator
      initialRouteName={showMainApp ? "Home" : "Welcome"}
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.text.onPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {!showMainApp ? (
        // Auth Stack - shown when user is not authenticated
        <>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{
              headerShown: false,
            }}
          />
          
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              title: i18n.t('auth.login') || 'Login',
              headerLeft: () => null, // Disable back button
            }}
          />
          
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              title: i18n.t('auth.register') || 'Registrar',
            }}
          />
          
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{
              title: i18n.t('auth.forgotPassword') || 'Recuperar Senha',
            }}
          />
        </>
      ) : (
        // Main App Stack - shown when user is authenticated
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: i18n.t('screens.home') || 'Início',
              headerLeft: () => null, // Disable back button
            }}
          />
          
          <Stack.Screen
            name="Map"
            component={MapScreen}
            options={{
              title: i18n.t('screens.map') || 'Mapa',
            }}
          />
          
          <Stack.Screen
            name="ServiceDetail"
            component={ServiceDetailScreen}
            options={{
              title: i18n.t('screens.details') || 'Detalhes',
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
            name="Profile"
            component={ProfileScreen}
            options={{
              title: 'Perfil',
            }}
          />
          
          <Stack.Screen
            name="UserProfile"
            component={UserProfileScreen}
            options={{
              title: i18n.t('profile.myProfile') || 'Meu Perfil',
            }}
          />
        </>
      )}
      
      {/* Splash screen always available */}
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigatorContent />
      </NavigationContainer>
    </AuthProvider>
  );
};