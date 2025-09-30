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
    institutionInfo: { address: {} },
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
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!isValidEmail(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    if (formData.password.length < 6) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não conferem';
    }
    if (!formData.acceptTerms) newErrors.acceptTerms = 'Você deve aceitar os termos';

    // Validations specific to user type
    if (formData.userType === UserType.PROFESSIONAL) {
      if (!formData.professionalInfo?.specialty) {
        newErrors.specialty = 'Especialidade é obrigatória';
      }
      if (!formData.professionalInfo?.license) {
        newErrors.license = 'Número da licença é obrigatório';
      }
    }

    if (formData.userType === UserType.INSTITUTION) {
      if (!formData.institutionInfo?.type) {
        newErrors.type = 'Tipo de instituição é obrigatório';
      }
      if (!formData.institutionInfo?.address?.street) {
        newErrors['address.street'] = 'Endereço é obrigatório';
      }
      if (!formData.institutionInfo?.address?.city) {
        newErrors['address.city'] = 'Cidade é obrigatória';
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
      hasInstitutionInfo: formData.userType === UserType.INSTITUTION ? !!formData.institutionInfo : 'N/A'
    });

    const result = await register(formData);
    
    if (result.success) {
      Alert.alert(
        'Sucesso!', 
        'Conta criada com sucesso!',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } else {
      const errorMessage = result.error || 'Erro desconhecido';
      
      console.error('🚨 ERRO NO REGISTRO - Falha na criação:', {
        error: errorMessage,
        formData: {
          email: formData.email,
          userType: formData.userType,
          hasRequiredFields: !!(formData.name && formData.email && formData.password)
        }
      });
      
      // Determine specific error message for user
      let userMessage = 'Não foi possível criar a conta. Tente novamente.';
      let alertTitle = 'Erro no Registro';
      
      if (errorMessage.includes('email já está em uso')) {
        alertTitle = 'Email já Cadastrado';
        userMessage = 'Este email já possui uma conta registrada. Tente fazer login ou use outro email.';
      } else if (errorMessage.includes('Email inválido')) {
        alertTitle = 'Email Inválido';
        userMessage = 'Por favor, verifique se o email está no formato correto.';
      } else if (errorMessage.includes('Senha')) {
        alertTitle = 'Problema com a Senha';
        userMessage = errorMessage;
      } else if (errorMessage.includes('telefone')) {
        alertTitle = 'Telefone Inválido';
        userMessage = 'Por favor, verifique se o número de telefone está correto.';
      } else if (errorMessage.includes('obrigatório')) {
        alertTitle = 'Campos Obrigatórios';
        userMessage = 'Por favor, preencha todos os campos obrigatórios.';
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
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>
          Preencha os dados para criar sua conta
        </Text>

        <UserTypeSelector
          selectedType={formData.userType}
          onSelect={(type) => handleFieldChange('userType', type)}
          disabled={loading}
        />

        <ValidatedInput
          label="Nome Completo"
          value={formData.name}
          onChangeText={(value) => handleFieldChange('name', value)}
          error={formErrors.name}
          placeholder="Seu nome completo"
          required
        />

        <ValidatedInput
          label="Email"
          value={formData.email}
          onChangeText={(value) => handleFieldChange('email', value)}
          error={formErrors.email}
          placeholder="seu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          required
        />

        <PhoneInput
          label="Telefone"
          value={formData.phone || ''}
          onChangeText={(value) => handleFieldChange('phone', value)}
        />

        <ValidatedInput
          label="Senha"
          value={formData.password}
          onChangeText={(value) => handleFieldChange('password', value)}
          error={formErrors.password}
          placeholder="Sua senha"
          secureTextEntry
          required
        />

        <ValidatedInput
          label="Confirmar Senha"
          value={confirmPassword}
          onChangeText={(value) => handleFieldChange('confirmPassword', value)}
          error={formErrors.confirmPassword}
          placeholder="Confirme sua senha"
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
              Aceito os <Text style={styles.link}>Termos de Uso</Text> e{' '}
              <Text style={styles.link}>Política de Privacidade</Text>
            </Text>
          </TouchableOpacity>
          {formErrors.acceptTerms && (
            <Text style={styles.errorText}>{formErrors.acceptTerms}</Text>
          )}
        </View>

        <Button
          title="Criar Conta"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
        />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>
            Já tem uma conta? <Text style={styles.link}>Entrar</Text>
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