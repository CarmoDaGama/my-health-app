import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { WelcomeScreenNavigationProp } from '../types/navigation';
import { Colors, spacing } from '../constants';
import { useAuth } from '../hooks/useAuth-firebase';
import { useTranslation } from '../hooks/useTranslation';

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { continueAsGuest } = useAuth();
  const { t } = useTranslation();

  const handleFindProfessional = () => {
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
          <Text style={styles.title}>{t('welcome.title')}</Text>
          <Text style={styles.subtitle}>
            {t('welcome.subtitle')}
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleFindProfessional}>
            <Text style={styles.primaryButtonText}>{t('welcome.findProfessional')}</Text>
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
    backgroundColor: Colors.textOnPrimary,
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
    color: Colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
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
    color: Colors.textOnPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
