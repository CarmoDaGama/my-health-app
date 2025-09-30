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
import { LoginScreenNavigationProp } from '../types/navigation';
import { AuthCredentials } from '../types';
import { useAuth } from '../hooks/useAuth-firebase';
import { useTranslation } from '../hooks/useTranslation';
import { Colors } from '../constants/colors';
import { spacing } from '../constants/dimensions';

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, isLoading, error } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<AuthCredentials>({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState<Partial<AuthCredentials>>({});

  const handleInputChange = (field: keyof AuthCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const errors: Partial<AuthCredentials> = {};

    if (!formData.email.trim()) {
      errors.email = t('validation.emailRequired') || 'Email é obrigatório';
    } else if (!isValidEmail(formData.email)) {
      errors.email = t('validation.emailInvalid') || 'Email inválido';
    }

    if (!formData.password) {
      errors.password = t('validation.passwordRequired') || 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      errors.password = t('validation.passwordMinLength') || 'Senha deve ter pelo menos 6 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      // Navigation será automática através do AuthContext
    } catch (error) {
      Alert.alert(
        t('auth.loginError') || 'Erro no Login',
        error instanceof Error ? error.message : t('auth.loginGenericError') || 'Erro desconhecido',
        [{ text: t('common.ok') || 'OK' }]
      );
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{t('auth.signingIn') || 'Fazendo login...'}</Text>
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
          <Text style={styles.title}>{t('auth.welcomeBack') || 'Bem-vindo de volta'}</Text>
          <Text style={styles.subtitle}>{t('auth.loginSubtitle') || 'Acesse sua conta para continuar'}</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('auth.email') || 'Email'}</Text>
            <TextInput
              style={[styles.textInput, formErrors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(text: string) => handleInputChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder={t('auth.emailPlaceholder') || 'Digite seu email'}
              placeholderTextColor={Colors.text.secondary}
            />
            {formErrors.email && (
              <Text style={styles.errorFieldText}>{formErrors.email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('auth.password') || 'Senha'}</Text>
            <TextInput
              style={[styles.textInput, formErrors.password && styles.inputError]}
              value={formData.password}
              onChangeText={(text: string) => handleInputChange('password', text)}
              secureTextEntry
              placeholder={t('auth.passwordPlaceholder') || 'Digite sua senha'}
              placeholderTextColor={Colors.text.secondary}
            />
            {formErrors.password && (
              <Text style={styles.errorFieldText}>{formErrors.password}</Text>
            )}
          </View>

          <TouchableOpacity 
            style={styles.forgotPasswordLink}
            onPress={navigateToForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>
              {t('auth.forgotPassword') || 'Esqueci minha senha'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {t('auth.login') || 'Entrar'}
            </Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              {t('auth.noAccount') || 'Não tem conta?'} 
            </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.registerLink}>
                {t('auth.register') || 'Registrar-se'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: Colors.text.secondary,
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
  },
  errorContainer: {
    backgroundColor: Colors.error,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  errorText: {
    color: Colors.surface,
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing.md,
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
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  buttonDisabled: {
    backgroundColor: Colors.text.secondary,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.onPrimary,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  registerLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
});