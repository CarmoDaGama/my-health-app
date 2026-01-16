import React, { memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, Easing } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Colors, spacing } from '../constants';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

export const SplashScreen: React.FC<Props> = memo(({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for heart
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, scaleAnim, pulseAnim]);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View 
          style={[
            styles.heartIcon,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Text style={styles.heartSymbol}>♥</Text>
          <View style={styles.pulseIcon}>
            <Text style={styles.pulseSymbol}>~</Text>
          </View>
        </Animated.View>
        <Text style={styles.appName}>MENDLINK</Text>
        <Text style={styles.tagline}>Your Health Connection</Text>
      </Animated.View>
    </View>
  );
});

SplashScreen.displayName = 'SplashScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  heartIcon: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  heartSymbol: {
    fontSize: 100,
    color: Colors.primary,
    fontWeight: 'bold',
    textShadowColor: Colors.neumorphic.darkShadow,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
  },
  pulseIcon: {
    position: 'absolute',
    right: -15,
    top: 25,
  },
  pulseSymbol: {
    fontSize: 40,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 4,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
