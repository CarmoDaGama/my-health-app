import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Colors, spacing } from '../constants';
import { useAuth } from '../hooks/useAuth-firebase';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { isAuthenticated, isGuest, isLoading } = useAuth();

  useEffect(() => {
    console.log('🎬 SplashScreen montado');
    console.log('📊 Estado inicial:', { isAuthenticated, isGuest, isLoading });

    // Navegar após um tempo mínimo e depois que o auth terminar de carregar
    const checkAndNavigate = () => {
      console.log('🔍 Verificando navegação...', { isAuthenticated, isGuest, isLoading });
      
      if (!isLoading) {
        console.log('✅ isLoading é false, decidindo navegação...');
        
        if (isAuthenticated || isGuest) {
          console.log('🏠 Navegando para Home');
          navigation.replace('Home');
        } else {
          console.log('👋 Navegando para Welcome');
          navigation.replace('Welcome');
        }
      } else {
        console.log('⏳ Ainda carregando, aguardando...');
        setTimeout(checkAndNavigate, 100);
      }
    };

    // Aguardar pelo menos 1.5 segundos para mostrar o splash
    const timer = setTimeout(checkAndNavigate, 1500);

    return () => {
      console.log('🧹 SplashScreen desmontado');
      clearTimeout(timer);
    };
  }, [navigation, isAuthenticated, isGuest, isLoading]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {/* Heart with pulse icon */}
        <View style={styles.heartIcon}>
          <Text style={styles.heartSymbol}>♥</Text>
          <View style={styles.pulseIcon}>
            <Text style={styles.pulseSymbol}>~</Text>
          </View>
        </View>
        <Text style={styles.appName}>MEDILOCATOR</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  heartIcon: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  heartSymbol: {
    fontSize: 80,
    color: Colors.text.onPrimary,
    fontWeight: 'bold',
  },
  pulseIcon: {
    position: 'absolute',
    right: -10,
    top: 20,
  },
  pulseSymbol: {
    fontSize: 30,
    color: Colors.text.onPrimary,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.onPrimary,
    letterSpacing: 2,
  },
});
