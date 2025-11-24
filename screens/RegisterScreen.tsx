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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RegisterScreenNavigationProp } from '../types/navigation';
import { RegisterData, UserType } from '../types';
import { useAuth } from '../hooks/useAuth-firebase';
import { useTranslation } from '../hooks/useTranslation';
import { Colors } from '../constants/colors';
import { spacing } from '../constants/dimensions';
import { Button } from '../components';
import ValidatedInput from '../components/common/ValidatedInput';
import PhoneInput from '../components/common/PhoneInput';
import UserTypeSelector from '../components/auth/UserTypeSelector';
import ProfessionalForm from '../components/auth/ProfessionalForm';
import InstitutionForm from '../components/auth/InstitutionForm';

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register, loading } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    userType: UserType.NORMAL_USER,
    acceptTerms: false,
    professionalInfo: {},
    institutionInfo: {},
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (field: string, value: any) => {
    console.log('🔄 handleFieldChange:', field, '=', value);
    
    if (field === 'confirmPassword') {
      setConfirmPassword(value);
      return;
    }

    if (field.includes('.')) {
      const fieldParts = field.split('.');
      
      if (fieldParts.length === 2) {
        // Simple nested field like institutionInfo.type
        const [parent, child] = fieldParts;
        setFormData(prev => {
          const newData = {
            ...prev,
            [parent]: {
              ...((prev as any)[parent] || {}),
              [child]: value
            }
          };
          console.log('📝 Updated nested field:', newData);
          return newData;
        });
      } else if (fieldParts.length === 3) {
        // Double nested field like institutionInfo.address.street
        const [parent, grandParent, child] = fieldParts;
        setFormData(prev => {
          const newData = {
            ...prev,
            [parent]: {
              ...((prev as any)[parent] || {}),
              [grandParent]: {
                ...((prev as any)[parent]?.[grandParent] || {}),
                [child]: value
              }
            }
          };
          console.log('📝 Updated double nested field:', newData);
          return newData;
        });
      }
    } else {
      setFormData(prev => {
        const newData = { ...prev, [field]: value };
        console.log('📝 Updated simple field:', newData);
        return newData;
      });
    }
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
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
    const newErrors: Record<string, string> = {};
    
    // Basic validations
    if (!formData.name.trim()) newErrors.name = t('validation.nameRequired');
    if (!formData.email.trim()) newErrors.email = t('validation.emailRequired');
    if (!isValidEmail(formData.email)) newErrors.email = t('validation.emailInvalid');
    if (!formData.password) newErrors.password = t('validation.passwordRequired');
    if (formData.password.length < 6) newErrors.password = t('validation.passwordMinLength');
    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordMismatch');
    }
    if (!formData.acceptTerms) newErrors.acceptTerms = t('validation.acceptTermsRequired');

    // Validations specific to user type
    if (formData.userType === UserType.PROFESSIONAL) {
      if (!formData.professionalInfo?.specialty) {
        newErrors.specialty = t('validation.specialtyRequired') || 'Especialidade é obrigatória';
      }
      if (!formData.professionalInfo?.license) {
        newErrors.license = t('validation.licenseRequired') || 'Número da licença é obrigatório';
      }
    }

    if (formData.userType === UserType.INSTITUTION) {
      if (!formData.institutionInfo?.type) {
        newErrors.type = t('validation.institutionTypeRequired') || 'Tipo de instituição é obrigatório';
      }
      if (!formData.institutionInfo?.address) {
        newErrors.address = t('validation.addressRequired') || 'Endereço é obrigatório';
      }
      if (!formData.institutionInfo?.city) {
        newErrors.city = t('validation.cityRequired') || 'Cidade é obrigatória';
      }
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    console.log('📝 Enviando dados de registro:', {
      userType: formData.userType,
      hasName: !!formData.name,
      hasEmail: !!formData.email,
      hasPassword: !!formData.password,
      hasProfessionalInfo: formData.userType === UserType.PROFESSIONAL ? !!formData.professionalInfo : 'N/A',
      hasInstitutionInfo: formData.userType === UserType.INSTITUTION ? !!formData.institutionInfo : 'N/A',
      institutionInfo: formData.userType === UserType.INSTITUTION ? formData.institutionInfo : 'N/A'
    });

    const result = await register(formData);
    
    if (result.success) {
      // Navigate to email verification screen instead of directly to home
      navigation.navigate('EmailVerification', { email: formData.email });
    } else {
      const errorMessage = result.error || t('auth.loginGenericError');
      
      console.error('🚨 ERRO NO REGISTRO - Falha na criação:', {
        error: errorMessage,
        formData: {
          email: formData.email,
          userType: formData.userType,
          hasRequiredFields: !!(formData.name && formData.email && formData.password)
        }
      });
      
      // Determine specific error message for user
      let userMessage = t('auth.registrationFailed');
      let alertTitle = t('auth.registerError');
      
      if (errorMessage.includes('email já está em uso')) {
        alertTitle = t('auth.emailAlreadyRegistered');
        userMessage = t('auth.emailAlreadyInUse');
      } else if (errorMessage.includes('Email inválido')) {
        alertTitle = t('auth.invalidEmail');
        userMessage = t('auth.checkEmailFormat');
      } else if (errorMessage.includes('Senha')) {
        alertTitle = t('auth.passwordProblem');
        userMessage = errorMessage;
      } else if (errorMessage.includes('telefone')) {
        alertTitle = t('auth.invalidPhone');
        userMessage = t('auth.checkPhoneNumber');
      } else if (errorMessage.includes('obrigatório')) {
        alertTitle = t('auth.requiredFields');
        userMessage = t('auth.fillAllFields');
      }
      
      Alert.alert(alertTitle, userMessage);
    }
  };

  const renderTypeSpecificForm = () => {
    switch (formData.userType) {
      case UserType.PROFESSIONAL:
        return (
          <ProfessionalForm
            data={formData.professionalInfo}
            onChange={(field, value) => handleFieldChange(`professionalInfo.${field}`, value)}
            errors={formErrors}
          />
        );
      case UserType.INSTITUTION:
        return (
          <InstitutionForm
            data={formData.institutionInfo}
            onChange={(field, value) => handleFieldChange(`institutionInfo.${field}`, value)}
            errors={formErrors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('auth.createAccount')}</Text>
        <Text style={styles.subtitle}>
          {t('auth.registerSubtitle')}
        </Text>

        <UserTypeSelector
          selectedType={formData.userType}
          onSelect={(type) => handleFieldChange('userType', type)}
          disabled={loading}
        />

        <ValidatedInput
          label={t('auth.fullName')}
          value={formData.name}
          onChangeText={(value) => handleFieldChange('name', value)}
          error={formErrors.name}
          placeholder={t('auth.fullNamePlaceholder')}
          required
        />

        <ValidatedInput
          label={t('auth.emailAddress')}
          value={formData.email}
          onChangeText={(value) => handleFieldChange('email', value)}
          error={formErrors.email}
          placeholder={t('auth.emailAddressPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          required
        />

        <PhoneInput
          label={t('auth.phoneNumber')}
          value={formData.phone || ''}
          onChangeText={(value) => handleFieldChange('phone', value)}
        />

        <ValidatedInput
          label={t('auth.password')}
          value={formData.password}
          onChangeText={(value) => handleFieldChange('password', value)}
          error={formErrors.password}
          placeholder={t('auth.passwordPlaceholder')}
          secureTextEntry
          required
        />

        <ValidatedInput
          label={t('auth.confirmPasswordLabel')}
          value={confirmPassword}
          onChangeText={(value) => handleFieldChange('confirmPassword', value)}
          error={formErrors.confirmPassword}
          placeholder={t('auth.confirmPasswordPlaceholderText')}
          secureTextEntry
          required
        />

        {renderTypeSpecificForm()}

        <View style={styles.termsContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => handleFieldChange('acceptTerms', !formData.acceptTerms)}
          >
            <View style={[styles.checkboxBox, formData.acceptTerms && styles.checkboxChecked]}>
              {formData.acceptTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              {t('auth.acceptTerms')} <Text style={styles.link}>{t('auth.termsOfUse')}</Text> {t('auth.and')}
              <Text style={styles.link}>{t('auth.privacyPolicyLabel')}</Text>
            </Text>
          </TouchableOpacity>
          {formErrors.acceptTerms && (
            <Text style={styles.errorText}>{formErrors.acceptTerms}</Text>
          )}
        </View>

        <Button
          title={t('auth.createAccount')}
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
        />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>
            {t('auth.alreadyHaveAccountLabel')} <Text style={styles.link}>{t('auth.signIn')}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#6B7280',
  },
  termsContainer: {
    marginVertical: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    lineHeight: 20,
  },
  link: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  submitButton: {
    marginTop: 16,
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
});