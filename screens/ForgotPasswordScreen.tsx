import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ForgotPasswordScreenNavigationProp } from '../types/navigation';
import { ResetPasswordData } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { Colors } from '../constants/colors';
import { spacing } from '../constants/dimensions';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { requestPasswordReset } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setEmailError(t('validation.emailRequired') || 'Email é obrigatório');
      return false;
    }
    
    if (!isValidEmail(email)) {
      setEmailError(t('validation.emailInvalid') || 'Email inválido');
      return false;
    }

    setEmailError('');
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      await requestPasswordReset({ email });
      setIsEmailSent(true);
    } catch (error) {
      Alert.alert(
        t('auth.resetPasswordError') || 'Erro',
        error instanceof Error ? error.message : t('auth.resetPasswordGenericError') || 'Erro ao enviar email de recuperação',
        [{ text: t('common.ok') || 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  if (isEmailSent) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>
            {t('auth.emailSent') || 'Email Enviado'}
          </Text>
          <Text style={styles.successMessage}>
            {t('auth.emailSentMessage') || 'Enviamos um link de recuperação para seu email. Verifique sua caixa de entrada e spam.'}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={navigateToLogin}>
            <Text style={styles.backButtonText}>
              {t('auth.backToLogin') || 'Voltar ao Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {t('auth.forgotPassword') || 'Esqueceu a senha?'}
          </Text>
          <Text style={styles.subtitle}>
            {t('auth.forgotPasswordSubtitle') || 'Digite seu email para receber um link de recuperação'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('auth.email') || 'Email'}</Text>
            <TextInput
              style={[styles.textInput, emailError && styles.inputError]}
              value={email}
              onChangeText={(text: string) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder={t('auth.emailPlaceholder') || 'Digite seu email'}
              placeholderTextColor={Colors.text.secondary}
              editable={!isLoading}
            />
            {emailError && (
              <Text style={styles.errorFieldText}>{emailError}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.resetButton, isLoading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.text.onPrimary} />
            ) : (
              <Text style={styles.resetButtonText}>
                {t('auth.sendResetLink') || 'Enviar Link de Recuperação'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              {t('auth.rememberPassword') || 'Lembrou da senha?'} 
            </Text>
            <TouchableOpacity onPress={navigateToLogin} disabled={isLoading}>
              <Text style={[styles.loginLink, isLoading && styles.linkDisabled]}>
                {t('auth.backToLogin') || 'Voltar ao Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.surface,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorFieldText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: spacing.xs,
  },
  resetButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.lg,
    minHeight: 48,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.text.secondary,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.onPrimary,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  loginLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  linkDisabled: {
    color: Colors.text.secondary,
  },
  
  // Success screen styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  successIcon: {
    fontSize: 80,
    color: Colors.success,
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.onPrimary,
  },
});