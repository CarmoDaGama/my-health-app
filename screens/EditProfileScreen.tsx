import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { spacing } from '../constants/dimensions';
import { useAuth, useUser } from '../hooks/useAuth-firebase';
import { useTranslation } from '../hooks/useTranslation';
import { 
  User, 
  isNormalUser, 
  isProfessional, 
  isInstitution,
  NormalUser,
  Professional,
  Institution
} from '../types';
import { UserProfileService, UpdateProfileData } from '../services/userProfile';
import { NormalUserForm } from '../components/specific/NormalUserForm';
import { ProfessionalForm } from '../components/specific/ProfessionalForm';
import { InstitutionForm } from '../components/specific/InstitutionForm';
import { ProfileDebug } from '../components/debug/ProfileDebug';

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user: authUser, updateProfile: updateUserProfile } = useUser();
  const { t } = useTranslation();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: t('profile.editProfile') || 'Editar Perfil',
      headerBackTitle: t('common.back') || 'Voltar',
    });
  }, [navigation, t]);

  const handleSave = async (updateData: UpdateProfileData) => {
    console.log('💾 handleSave chamado com dados:', updateData);
    
    if (!authUser) {
      console.error('❌ authUser não está disponível!');
      Alert.alert(
        t('errors.title') || 'Erro',
        t('errors.userNotFound') || 'Usuário não encontrado'
      );
      return;
    }

    console.log('📊 Estado atual do usuário antes da atualização:', {
      id: authUser.id,
      name: authUser.name,
      userType: authUser.userType,
      dadosCompletos: JSON.stringify(authUser, null, 2)
    });

    setIsSaving(true);

    try {
      console.log('🔄 Chamando updateProfile do contexto/auth para:', authUser.id);
      console.log('📝 Dados de atualização:', JSON.stringify(updateData, null, 2));

      // Usar o updateProfile do contexto que atualiza o Firestore via AuthServiceFirebase
      const response = await updateUserProfile(updateData as any);
      console.log('📥 Resposta do contexto Auth updateProfile:', response);

      if (response && response.success) {
        console.log('✅ Perfil atualizado com sucesso via AuthServiceFirebase');
        Alert.alert(
          t('common.success') || 'Sucesso',
          t('profile.updateSuccess') || 'Perfil atualizado com sucesso!',
          [
            {
              text: t('common.ok') || 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        console.error('❌ Falha na atualização via Auth:', response?.error);
        throw new Error(response?.error || 'Falha ao atualizar perfil');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      
      Alert.alert(
        t('errors.title') || 'Erro',
        error instanceof Error ? error.message : (t('errors.updateProfile') || 'Erro ao atualizar perfil')
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>
          {t('common.loading') || 'Carregando...'}
        </Text>
      </View>
    );
  }

  if (!authUser) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {t('errors.userNotFound') || 'Usuário não encontrado'}
        </Text>
      </View>
    );
  }

  console.log('🔍 EditProfileScreen - Render iniciado');
  console.log('🔍 EditProfileScreen - Tipo de usuário:', authUser.userType);
  console.log('🔍 EditProfileScreen - Dados básicos:', {
    id: authUser.id,
    email: authUser.email,
    name: authUser.name,
    phone: authUser.phone,
    userType: authUser.userType
  });
  console.log('🔍 EditProfileScreen - Dados RAW do usuário authUser:', JSON.stringify(authUser, null, 2));
  
  // Se for profissional, garantir que professionalInfo existe (mesmo que vazio)
  let userForForm = authUser;
  if (isProfessional(authUser)) {
    console.log('👨‍⚕️ EditProfileScreen - É profissional');
    console.log('📋 EditProfileScreen - professionalInfo atual:', authUser.professionalInfo);
    
    if (!authUser.professionalInfo) {
      console.log('⚠️ EditProfileScreen - Profissional sem professionalInfo - criando objeto básico');
      userForForm = {
        ...authUser,
        professionalInfo: {
          specialty: '',
          license: '',
          experience: 0,
          bio: '',
          address: '',
          services: [],
          coordinates: undefined,
        }
      } as Professional;
    } else {
      console.log('✅ EditProfileScreen - Profissional com professionalInfo existente');
      // Manter os dados existentes e garantir campos obrigatórios do formulário
      userForForm = {
        ...authUser,
        professionalInfo: {
          ...authUser.professionalInfo,
          // Garantir valores padrão para campos obrigatórios do formulário
          specialty: authUser.professionalInfo.specialty || '',
          license: authUser.professionalInfo.license || '',
          experience: authUser.professionalInfo.experience || 0,
          bio: authUser.professionalInfo.bio || '',
          address: authUser.professionalInfo.address || '',
          services: authUser.professionalInfo.services || [],
        }
      } as Professional;
    }
    
    console.log('📤 EditProfileScreen - userForForm.professionalInfo final:', userForForm.professionalInfo);
  }
  
  // Se for instituição sem institutionInfo, criar um objeto básico temporário
  if (isInstitution(authUser) && !authUser.institutionInfo) {
    console.log('⚠️ Instituição sem institutionInfo - criando objeto temporário');
    userForForm = {
      ...authUser,
      institutionInfo: {
        type: 'clinic' as const,
        description: '',
        services: [],
        acceptsInsurance: true,
        emergencyService: false,
        coordinates: undefined,
        address: '',
        workingHours: {
          monday: { start: '', end: '', available: false },
          tuesday: { start: '', end: '', available: false },
          wednesday: { start: '', end: '', available: false },
          thursday: { start: '', end: '', available: false },
          friday: { start: '', end: '', available: false },
          saturday: { start: '', end: '', available: false },
          sunday: { start: '', end: '', available: false }
        },
        verified: false,
        rating: 0,
        totalReviews: 0
      }
    } as Institution;
  }
  
  console.log('🔍 EditProfileScreen - Análise dos tipos:', {
    id: authUser.id,
    email: authUser.email,
    userType: authUser.userType,
    hasNormalUser: isNormalUser(userForForm),
    hasProfessional: isProfessional(userForForm),
    hasInstitution: isInstitution(userForForm),
    
    // Dados específicos de usuário normal
    ...(isNormalUser(userForForm) && {
      normalUserData: {
        name: (userForForm as NormalUser).name,
        phone: (userForForm as NormalUser).phone,
        dateOfBirth: (userForForm as NormalUser).dateOfBirth,
        gender: (userForForm as NormalUser).gender,
        address: (userForForm as NormalUser).address,
        emergencyContact: (userForForm as NormalUser).emergencyContact
      }
    }),
    
    // Dados específicos de profissional
    ...(isProfessional(userForForm) && {
      professionalData: {
        name: (userForForm as Professional).name,
        phone: (userForForm as Professional).phone,
        professionalInfo: (userForForm as Professional).professionalInfo
      }
    }),
    
    // Dados específicos de instituição
    ...(isInstitution(userForForm) && {
      institutionData: {
        name: (userForForm as Institution).name,
        phone: (userForForm as Institution).phone,
        institutionInfo: (userForForm as Institution).institutionInfo
      }
    })
  });

  return (
    <SafeAreaView style={styles.container}>
      {isNormalUser(userForForm) && (
        <NormalUserForm
          user={userForForm as NormalUser}
          onSave={handleSave}
          isLoading={isSaving}
        />
      )}
      
      {isProfessional(userForForm) && (
        <ProfessionalForm
          user={userForForm as Professional}
          onSave={handleSave}
          isLoading={isSaving}
        />
      )}
      
      {isInstitution(userForForm) && (
        <InstitutionForm
          user={userForForm as Institution}
          onSave={handleSave}
          isLoading={isSaving}
        />
      )}
      
      {!isNormalUser(userForForm) && !isProfessional(userForForm) && !isInstitution(userForForm) && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {t('profile.errors.unknownUserType') || 'Tipo de usuário não reconhecido:'} {(userForForm as any).userType}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
  },
});