import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Colors, spacing } from '../constants';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  console.log('🎬 SplashScreen renderizada');
  
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
