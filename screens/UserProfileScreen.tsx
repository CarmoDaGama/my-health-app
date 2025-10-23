import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserProfileScreenNavigationProp } from '../types/navigation';
import { User } from '../types';
import { useAuth, useUser } from '../hooks/useAuth-firebase';
import { useTranslation, useLocalization } from '../hooks/useTranslation';
import { Colors } from '../constants/colors';
import { spacing } from '../constants/dimensions';
import { UserStatusBanner } from '../components/common/UserStatusBanner';

export default function UserProfileScreen() {
  const navigation = useNavigation<UserProfileScreenNavigationProp>();
  const { logout } = useAuth();
  const { user, updateProfile } = useUser();
  const { t } = useTranslation();
  const { formatDate } = useLocalization();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      await updateProfile(formData);
      setIsEditing(false);
      Alert.alert(
        t('profile.success') || 'Sucesso',
        t('profile.profileUpdated') || 'Perfil atualizado com sucesso',
        [{ text: t('common.ok') || 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        t('profile.error') || 'Erro',
        error instanceof Error ? error.message : t('profile.updateError') || 'Erro ao atualizar perfil',
        [{ text: t('common.ok') || 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout') || 'Sair',
      t('profile.logoutConfirmation') || 'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: t('common.cancel') || 'Cancelar',
          style: 'cancel',
        },
        {
          text: t('profile.logout') || 'Sair',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{t('profile.loading') || 'Carregando...'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Banner de status do usuário (apenas para profissionais/instituições não verificados) */}
      <UserStatusBanner />
      
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('profile.personalInfo') || 'Informações Pessoais'}
          </Text>
          {!isEditing ? (
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Text style={styles.editButtonText}>
                {t('profile.edit') || 'Editar'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                <Text style={styles.cancelButtonText}>
                  {t('common.cancel') || 'Cancelar'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, isLoading && styles.buttonDisabled]}
                onPress={handleSaveProfile}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={Colors.text.onPrimary} />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {t('common.save') || 'Salvar'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {t('profile.name') || 'Nome'}
          </Text>
          {isEditing ? (
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholder={t('profile.namePlaceholder') || 'Digite seu nome'}
              placeholderTextColor={Colors.text.secondary}
            />
          ) : (
            <Text style={styles.fieldValue}>{user.name}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {t('profile.email') || 'Email'}
          </Text>
          <Text style={[styles.fieldValue, styles.fieldDisabled]}>
            {user.email}
          </Text>
          {!isEditing && (
            <Text style={styles.fieldNote}>
              {t('profile.emailNote') || 'Email não pode ser alterado'}
            </Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {t('profile.phone') || 'Telefone'}
          </Text>
          {isEditing ? (
            <TextInput
              style={styles.textInput}
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              placeholder={t('profile.phonePlaceholder') || 'Digite seu telefone'}
              placeholderTextColor={Colors.text.secondary}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.fieldValue}>
              {user.phone || t('profile.notProvided') || 'Não informado'}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('profile.accountInfo') || 'Informações da Conta'}
        </Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            {t('profile.memberSince') || 'Membro desde'}
          </Text>
          <Text style={styles.infoValue}>
            {formatDate(new Date(user.createdAt))}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            {t('profile.lastUpdate') || 'Última atualização'}
          </Text>
          <Text style={styles.infoValue}>
            {formatDate(new Date(user.updatedAt))}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>
            {t('profile.logout') || 'Sair da Conta'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
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
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.onPrimary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  editButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  editButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  cancelButtonText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.text.secondary,
  },
  saveButtonText: {
    fontSize: 14,
    color: Colors.text.onPrimary,
    fontWeight: '500',
  },
  fieldContainer: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: spacing.xs,
  },
  fieldValue: {
    fontSize: 16,
    color: Colors.text.primary,
    paddingVertical: spacing.xs,
  },
  fieldDisabled: {
    color: Colors.text.secondary,
  },
  fieldNote: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.background,
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  actions: {
    marginTop: spacing.lg,
  },
  logoutButton: {
    backgroundColor: Colors.error,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.onPrimary,
  },
});