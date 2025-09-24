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
import { RegisterScreenNavigationProp } from '../types/navigation';
import { RegisterData } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { Colors } from '../constants/colors';
import { spacing } from '../constants/dimensions';

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register, isLoading, error } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    acceptTerms: false,
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof RegisterData | 'confirmPassword', value: string | boolean) => {
    if (field === 'confirmPassword') {
      setConfirmPassword(value as string);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidAngolanPhone = (phone: string): boolean => {
    // Formato angolano: +244 9xx xxx xxx ou 9xx xxx xxx
    const phoneRegex = /^(\+244\s?)?9[0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = t('validation.nameRequired') || 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      errors.name = t('validation.nameMinLength') || 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      errors.email = t('validation.emailRequired') || 'Email é obrigatório';
    } else if (!isValidEmail(formData.email)) {
      errors.email = t('validation.emailInvalid') || 'Email inválido';
    }

    if (formData.phone && !isValidAngolanPhone(formData.phone)) {
      errors.phone = t('validation.phoneInvalid') || 'Número de telefone inválido (use formato angolano)';
    }

    if (!formData.password) {
      errors.password = t('validation.passwordRequired') || 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      errors.password = t('validation.passwordMinLength') || 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!confirmPassword) {
      errors.confirmPassword = t('validation.confirmPasswordRequired') || 'Confirmação de senha é obrigatória';
    } else if (formData.password !== confirmPassword) {
      errors.confirmPassword = t('validation.passwordMismatch') || 'As senhas não coincidem';
    }

    if (!formData.acceptTerms) {
      errors.acceptTerms = t('validation.acceptTermsRequired') || 'É necessário aceitar os termos de uso';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await register(formData);
      // Navigation será automática através do AuthContext
    } catch (error) {
      Alert.alert(
        t('auth.registerError') || 'Erro no Registro',
        error instanceof Error ? error.message : t('auth.registerGenericError') || 'Erro desconhecido',
        [{ text: t('common.ok') || 'OK' }]
      );
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{t('auth.creatingAccount') || 'Criando conta...'}</Text>
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('auth.createAccount') || 'Criar Conta'}</Text>
          <Text style={styles.subtitle}>{t('auth.registerSubtitle') || 'Preencha os dados para se registrar'}</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('auth.name') || 'Nome completo'}</Text>
            <TextInput
              style={[styles.textInput, formErrors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(text: string) => handleInputChange('name', text)}
              placeholder={t('auth.namePlaceholder') || 'Digite seu nome completo'}
              placeholderTextColor={Colors.text.secondary}
            />
            {formErrors.name && (
              <Text style={styles.errorFieldText}>{formErrors.name}</Text>
            )}
          </View>

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
            <Text style={styles.inputLabel}>{t('auth.phone') || 'Telefone (opcional)'}</Text>
            <TextInput
              style={[styles.textInput, formErrors.phone && styles.inputError]}
              value={formData.phone || ''}
              onChangeText={(text: string) => handleInputChange('phone', text)}
              keyboardType="phone-pad"
              placeholder={t('auth.phonePlaceholder') || 'Ex: +244 9XX XXX XXX'}
              placeholderTextColor={Colors.text.secondary}
            />
            {formErrors.phone && (
              <Text style={styles.errorFieldText}>{formErrors.phone}</Text>
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

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('auth.confirmPassword') || 'Confirmar senha'}</Text>
            <TextInput
              style={[styles.textInput, formErrors.confirmPassword && styles.inputError]}
              value={confirmPassword}
              onChangeText={(text: string) => handleInputChange('confirmPassword', text)}
              secureTextEntry
              placeholder={t('auth.confirmPasswordPlaceholder') || 'Confirme sua senha'}
              placeholderTextColor={Colors.text.secondary}
            />
            {formErrors.confirmPassword && (
              <Text style={styles.errorFieldText}>{formErrors.confirmPassword}</Text>
            )}
          </View>

          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => handleInputChange('acceptTerms', !formData.acceptTerms)}
          >
            <View style={[styles.checkbox, formData.acceptTerms && styles.checkboxChecked]}>
              {formData.acceptTerms && <Text style={styles.checkboxTick}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              {t('auth.acceptTerms') || 'Aceito os '}
              <Text style={styles.linkText}>
                {t('auth.termsOfService') || 'termos de uso'}
              </Text>
              {t('auth.and') || ' e a '}
              <Text style={styles.linkText}>
                {t('auth.privacyPolicy') || 'política de privacidade'}
              </Text>
            </Text>
          </TouchableOpacity>
          {formErrors.acceptTerms && (
            <Text style={[styles.errorFieldText, { marginLeft: 0 }]}>{formErrors.acceptTerms}</Text>
          )}

          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>
              {t('auth.register') || 'Registrar-se'}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              {t('auth.alreadyHaveAccount') || 'Já tem conta?'} 
            </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>
                {t('auth.login') || 'Entrar'}
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
    paddingTop: spacing.xl,
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
    marginBottom: spacing.xl,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 4,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxTick: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  buttonDisabled: {
    backgroundColor: Colors.text.secondary,
  },
  registerButtonText: {
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
});