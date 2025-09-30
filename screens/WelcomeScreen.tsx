import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { WelcomeScreenNavigationProp } from '../types/navigation';
import { Colors, spacing } from '../constants';
import { useAuth } from '../hooks/useAuth-firebase';
import i18n from '../utils/i18n';

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { continueAsGuest } = useAuth();

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleContinueAsGuest = () => {
    continueAsGuest();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Illustration of phone with health services */}
        <View style={styles.illustrationContainer}>
          <View style={styles.phoneFrame}>
            <View style={styles.phoneScreen}>
              <View style={styles.healthIcon}>
                <Text style={styles.plusIcon}>+</Text>
              </View>
            </View>
          </View>
          <View style={styles.personContainer}>
            <View style={styles.person} />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Boas-Vindas ao MediLocator</Text>
          <Text style={styles.subtitle}>
            Encontre rapidamente os melhores serviços de saúde da sua região. 
            Acesse informações detalhadas, localizações e avaliações.
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Entrar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleContinueAsGuest}>
            <Text style={styles.secondaryButtonText}>Continuar como Convidado</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.xl,
  },
  illustrationContainer: {
    alignItems: 'center',
    position: 'relative',
    height: 300,
    justifyContent: 'center',
  },
  phoneFrame: {
    width: 120,
    height: 200,
    backgroundColor: '#2D3748',
    borderRadius: 20,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneScreen: {
    width: '100%',
    height: '85%',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthIcon: {
    width: 40,
    height: 40,
    backgroundColor: Colors.text.onPrimary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  personContainer: {
    position: 'absolute',
    bottom: 0,
    right: 20,
  },
  person: {
    width: 60,
    height: 80,
    backgroundColor: '#4A90E2',
    borderRadius: 30,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonsContainer: {
    gap: spacing.md,
    marginHorizontal: spacing.xl,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.text.onPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
