import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Colors } from '../../constants/colors';
import { spacing } from '../../constants/dimensions';
import { useTranslation } from '../../hooks/useTranslation';
import { NormalUser } from '../../types';

interface NormalUserFormProps {
  user: NormalUser;
  onSave: (data: Partial<NormalUser>) => void;
  isLoading?: boolean;
}

export const NormalUserForm: React.FC<NormalUserFormProps> = ({
  user,
  onSave,
  isLoading = false
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    dateOfBirth: user.dateOfBirth || '',
    gender: user.gender || '',
    address: user.address || '',
    emergencyContact: {
      name: user.emergencyContact?.name || '',
      phone: user.emergencyContact?.phone || '',
      relationship: user.emergencyContact?.relationship || ''
    }
  });

  // Atualizar formData quando user props mudar
  useEffect(() => {
    console.log('🔄 NormalUserForm - Atualizando dados do formulário:', {
      userId: user.id,
      name: user.name,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      address: user.address,
      emergencyContact: user.emergencyContact
    });
    
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || '',
      address: user.address || '',
      emergencyContact: {
        name: user.emergencyContact?.name || '',
        phone: user.emergencyContact?.phone || '',
        relationship: user.emergencyContact?.relationship || ''
      }
    });
  }, [user]);

  const handleSave = () => {
    // Validações básicas
    if (!formData.name.trim()) {
      Alert.alert(
        t('errors.title') || 'Erro',
        t('profile.errors.nameRequired') || 'Nome é obrigatório'
      );
      return;
    }

    // Preparar dados para salvar
    const updateData: Partial<NormalUser> = {
      name: formData.name.trim(),
      phone: formData.phone.trim() || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      gender: formData.gender as 'male' | 'female' | 'other' || undefined,
      address: formData.address.trim() || undefined,
    };

    // Adicionar contato de emergência se todos os campos estiverem preenchidos
    if (formData.emergencyContact.name.trim() && 
        formData.emergencyContact.phone.trim() && 
        formData.emergencyContact.relationship.trim()) {
      updateData.emergencyContact = {
        name: formData.emergencyContact.name.trim(),
        phone: formData.emergencyContact.phone.trim(),
        relationship: formData.emergencyContact.relationship.trim()
      };
    }

    onSave(updateData);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Informações Básicas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('profile.basicInfo') || 'Informações Básicas'}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.name') || 'Nome'} *
            </Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder={t('profile.namePlaceholder') || 'Digite seu nome completo'}
              placeholderTextColor={Colors.text.secondary}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.phone') || 'Telefone'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              placeholder={t('profile.phonePlaceholder') || 'Digite seu telefone'}
              placeholderTextColor={Colors.text.secondary}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.dateOfBirth') || 'Data de Nascimento'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.dateOfBirth}
              onChangeText={(text) => setFormData(prev => ({ ...prev, dateOfBirth: text }))}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={Colors.text.secondary}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.gender') || 'Gênero'}
            </Text>
            <View style={styles.genderContainer}>
              {['male', 'female', 'other'].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderOption,
                    formData.gender === gender && styles.genderOptionSelected
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, gender }))}
                  disabled={isLoading}
                >
                  <Text style={[
                    styles.genderText,
                    formData.gender === gender && styles.genderTextSelected
                  ]}>
                    {gender === 'male' ? (t('profile.male') || 'Masculino') :
                     gender === 'female' ? (t('profile.female') || 'Feminino') :
                     (t('profile.other') || 'Outro')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.address') || 'Endereço'}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.address}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
              placeholder={t('profile.addressPlaceholder') || 'Digite seu endereço completo'}
              placeholderTextColor={Colors.text.secondary}
              multiline
              numberOfLines={3}
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Contato de Emergência */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('profile.emergencyContact') || 'Contato de Emergência'}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.emergencyName') || 'Nome do Contato'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.emergencyContact.name}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                emergencyContact: { ...prev.emergencyContact, name: text }
              }))}
              placeholder={t('profile.emergencyNamePlaceholder') || 'Nome da pessoa de contato'}
              placeholderTextColor={Colors.text.secondary}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.emergencyPhone') || 'Telefone do Contato'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.emergencyContact.phone}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                emergencyContact: { ...prev.emergencyContact, phone: text }
              }))}
              placeholder={t('profile.emergencyPhonePlaceholder') || 'Telefone da pessoa de contato'}
              placeholderTextColor={Colors.text.secondary}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.emergencyRelationship') || 'Relacionamento'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.emergencyContact.relationship}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                emergencyContact: { ...prev.emergencyContact, relationship: text }
              }))}
              placeholder={t('profile.emergencyRelationshipPlaceholder') || 'Ex: Pai/Mãe, Cônjuge, Irmão(ã)'}
              placeholderTextColor={Colors.text.secondary}
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 
              (t('common.saving') || 'Salvando...') : 
              (t('common.save') || 'Salvar Alterações')
            }
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg + 50, // Extra space for button
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderOption: {
    flex: 1,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  genderOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accent + '20', // Adding transparency
  },
  genderText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  genderTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.text.secondary,
  },
  saveButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});