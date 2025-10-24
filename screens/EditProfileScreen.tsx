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
      console.log('🔄 Atualizando perfil do usuário:', authUser.id);
      console.log('📝 Dados de atualização:', JSON.stringify(updateData, null, 2));

      const response = await UserProfileService.updateProfile(authUser.id, updateData);
      console.log('📥 Resposta do UserProfileService:', response);

      if (response.success && response.user) {
        console.log('✅ Perfil atualizado com sucesso, atualizando contexto...');
        console.log('👤 Dados atualizados do usuário:', JSON.stringify(response.user, null, 2));
        
        // Atualizar usuário no contexto de autenticação
        await updateUserProfile(response.user);

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
        console.error('❌ Falha na atualização:', response.error);
        throw new Error(response.error || 'Falha ao atualizar perfil');
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
  console.log('🔍 EditProfileScreen - Dados RAW do Firestore:', JSON.stringify(authUser, null, 2));
  console.log('🔍 EditProfileScreen - Análise dos tipos:', {
    id: authUser.id,
    email: authUser.email,
    userType: authUser.userType,
    hasNormalUser: isNormalUser(authUser),
    hasProfessional: isProfessional(authUser),
    hasInstitution: isInstitution(authUser),
    
    // Dados específicos de usuário normal
    ...(isNormalUser(authUser) && {
      normalUserData: {
        name: (authUser as NormalUser).name,
        phone: (authUser as NormalUser).phone,
        dateOfBirth: (authUser as NormalUser).dateOfBirth,
        gender: (authUser as NormalUser).gender,
        address: (authUser as NormalUser).address,
        emergencyContact: (authUser as NormalUser).emergencyContact
      }
    }),
    
    // Dados específicos de profissional
    ...(isProfessional(authUser) && {
      professionalData: {
        name: (authUser as Professional).name,
        phone: (authUser as Professional).phone,
        professionalInfo: (authUser as Professional).professionalInfo
      }
    }),
    
    // Dados específicos de instituição
    ...(isInstitution(authUser) && {
      institutionData: {
        name: (authUser as Institution).name,
        phone: (authUser as Institution).phone,
        institutionInfo: (authUser as Institution).institutionInfo
      }
    })
  });

  return (
    <SafeAreaView style={styles.container}>
      {isNormalUser(authUser) && (
        <NormalUserForm
          user={authUser as NormalUser}
          onSave={handleSave}
          isLoading={isSaving}
        />
      )}
      
      {isProfessional(authUser) && (
        <ProfessionalForm
          user={authUser as Professional}
          onSave={handleSave}
          isLoading={isSaving}
        />
      )}
      
      {isInstitution(authUser) && (
        <InstitutionForm
          user={authUser as Institution}
          onSave={handleSave}
          isLoading={isSaving}
        />
      )}
      
      {!isNormalUser(authUser) && !isProfessional(authUser) && !isInstitution(authUser) && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Tipo de usuário não reconhecido: {(authUser as any).userType}
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
    color: Colors.text.secondary,
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