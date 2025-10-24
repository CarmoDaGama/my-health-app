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
  ScrollView,
  Switch
} from 'react-native';
import { Colors } from '../../constants/colors';
import { spacing } from '../../constants/dimensions';
import { useTranslation } from '../../hooks/useTranslation';
import { Professional } from '../../types';

interface ProfessionalFormProps {
  user: Professional;
  onSave: (data: Partial<Professional>) => void;
  isLoading?: boolean;
}

export const ProfessionalForm: React.FC<ProfessionalFormProps> = ({
  user,
  onSave,
  isLoading = false
}) => {
  const { t } = useTranslation();

  // Aguardar dados completos do usuário (temporariamente relaxado para debug)
  if (!user) {
    console.log('⏳ ProfessionalForm - Aguardando usuário...', {
      hasUser: !!user
    });
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>
          {t('common.loading') || 'Carregando dados do usuário...'}
        </Text>
      </View>
    );
  }
  
  // Log dos dados recebidos
  console.log('🔍 ProfessionalForm - Dados recebidos:', {
    hasUser: !!user,
    hasProfessionalInfo: !!user?.professionalInfo,
    professionalInfoContent: user?.professionalInfo,
    userKeys: Object.keys(user || {}),
    userData: JSON.stringify(user, null, 2)
  });
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    professionalInfo: {
      specialty: user.professionalInfo?.specialty || '',
      license: user.professionalInfo?.license || '',
      experience: user.professionalInfo?.experience?.toString() || '',
      bio: user.professionalInfo?.bio || '',
      certifications: user.professionalInfo?.certifications?.join(', ') || '',
      consultationFee: user.professionalInfo?.consultationFee?.toString() || '',
      acceptsInsurance: user.professionalInfo?.acceptsInsurance || false,
      workingHours: user.professionalInfo?.workingHours || {
        monday: { start: '', end: '', available: false },
        tuesday: { start: '', end: '', available: false },
        wednesday: { start: '', end: '', available: false },
        thursday: { start: '', end: '', available: false },
        friday: { start: '', end: '', available: false },
        saturday: { start: '', end: '', available: false },
        sunday: { start: '', end: '', available: false },
      }
    }
  });

  // Atualizar formData quando user props mudar
  useEffect(() => {
    console.log('🔄 ProfessionalForm - Atualizando dados do formulário:', {
      userId: user.id,
      name: user.name,
      phone: user.phone,
      professionalInfo: user.professionalInfo
    });
    
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      professionalInfo: {
        specialty: user.professionalInfo?.specialty || '',
        license: user.professionalInfo?.license || '',
        experience: user.professionalInfo?.experience?.toString() || '',
        bio: user.professionalInfo?.bio || '',
        certifications: user.professionalInfo?.certifications?.join(', ') || '',
        consultationFee: user.professionalInfo?.consultationFee?.toString() || '',
        acceptsInsurance: user.professionalInfo?.acceptsInsurance || false,
        workingHours: user.professionalInfo?.workingHours || {
          monday: { start: '', end: '', available: false },
          tuesday: { start: '', end: '', available: false },
          wednesday: { start: '', end: '', available: false },
          thursday: { start: '', end: '', available: false },
          friday: { start: '', end: '', available: false },
          saturday: { start: '', end: '', available: false },
          sunday: { start: '', end: '', available: false },
        }
      }
    });
  }, [user]);

  const weekDays = [
    { key: 'monday', name: t('profile.monday') || 'Segunda-feira' },
    { key: 'tuesday', name: t('profile.tuesday') || 'Terça-feira' },
    { key: 'wednesday', name: t('profile.wednesday') || 'Quarta-feira' },
    { key: 'thursday', name: t('profile.thursday') || 'Quinta-feira' },
    { key: 'friday', name: t('profile.friday') || 'Sexta-feira' },
    { key: 'saturday', name: t('profile.saturday') || 'Sábado' },
    { key: 'sunday', name: t('profile.sunday') || 'Domingo' },
  ];

  const handleSave = () => {
    // Validações básicas
    if (!formData.name.trim()) {
      Alert.alert(
        t('errors.title') || 'Erro',
        t('profile.errors.nameRequired') || 'Nome é obrigatório'
      );
      return;
    }

    if (!formData.professionalInfo.specialty.trim()) {
      Alert.alert(
        t('errors.title') || 'Erro',
        t('profile.errors.specialtyRequired') || 'Especialidade é obrigatória'
      );
      return;
    }

    // Preparar dados para salvar
    const updateData: Partial<Professional> = {
      name: formData.name.trim(),
      phone: formData.phone.trim() || undefined,
      professionalInfo: {
        ...(user.professionalInfo || {}),
        specialty: formData.professionalInfo.specialty.trim(),
        license: formData.professionalInfo.license.trim(),
        experience: parseInt(formData.professionalInfo.experience) || 0,
        bio: formData.professionalInfo.bio.trim() || undefined,
        certifications: formData.professionalInfo.certifications
          .split(',')
          .map(cert => cert.trim())
          .filter(cert => cert.length > 0),
        consultationFee: parseFloat(formData.professionalInfo.consultationFee) || undefined,
        acceptsInsurance: formData.professionalInfo.acceptsInsurance,
        workingHours: formData.professionalInfo.workingHours
      }
    };

    onSave(updateData);
  };

  const updateWorkingHours = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      professionalInfo: {
        ...prev.professionalInfo,
        workingHours: {
          ...prev.professionalInfo.workingHours,
          [day]: {
            ...prev.professionalInfo.workingHours[day],
            [field]: value
          }
        }
      }
    }));
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
        </View>

        {/* Informações Profissionais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('profile.professionalInfo') || 'Informações Profissionais'}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.specialty') || 'Especialidade'} *
            </Text>
            <TextInput
              style={styles.input}
              value={formData.professionalInfo.specialty}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                professionalInfo: { ...prev.professionalInfo, specialty: text }
              }))}
              placeholder={t('profile.specialtyPlaceholder') || 'Ex: Cardiologia, Pediatria, etc.'}
              placeholderTextColor={Colors.text.secondary}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.license') || 'Número da Licença'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.professionalInfo.license}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                professionalInfo: { ...prev.professionalInfo, license: text }
              }))}
              placeholder={t('profile.licensePlaceholder') || 'Número do registro profissional'}
              placeholderTextColor={Colors.text.secondary}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.experience') || 'Anos de Experiência'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.professionalInfo.experience}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                professionalInfo: { ...prev.professionalInfo, experience: text }
              }))}
              placeholder="0"
              placeholderTextColor={Colors.text.secondary}
              keyboardType="numeric"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.bio') || 'Biografia/Descrição'}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.professionalInfo.bio}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                professionalInfo: { ...prev.professionalInfo, bio: text }
              }))}
              placeholder={t('profile.bioPlaceholder') || 'Descreva sua experiência e abordagem profissional'}
              placeholderTextColor={Colors.text.secondary}
              multiline
              numberOfLines={4}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.certifications') || 'Certificações'}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.professionalInfo.certifications}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                professionalInfo: { ...prev.professionalInfo, certifications: text }
              }))}
              placeholder={t('profile.certificationsPlaceholder') || 'Separe as certificações por vírgula'}
              placeholderTextColor={Colors.text.secondary}
              multiline
              numberOfLines={3}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.consultationFee') || 'Taxa de Consulta (AOA)'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.professionalInfo.consultationFee}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                professionalInfo: { ...prev.professionalInfo, consultationFee: text }
              }))}
              placeholder="0.00"
              placeholderTextColor={Colors.text.secondary}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
          </View>

          <View style={styles.switchGroup}>
            <Text style={styles.label}>
              {t('profile.acceptsInsurance') || 'Aceita Seguro'}
            </Text>
            <Switch
              value={formData.professionalInfo.acceptsInsurance}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                professionalInfo: { ...prev.professionalInfo, acceptsInsurance: value }
              }))}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor={formData.professionalInfo.acceptsInsurance ? Colors.primary : Colors.text.secondary}
              disabled={isLoading}
            />
          </View>
        </View>

        {/* Horário de Atendimento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('profile.workingHours') || 'Horário de Atendimento'}
          </Text>
          
          {weekDays.map(({ key, name }) => (
            <View key={key} style={styles.dayGroup}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayName}>{name}</Text>
                <Switch
                  value={formData.professionalInfo.workingHours[key]?.available || false}
                  onValueChange={(value) => updateWorkingHours(key, 'available', value)}
                  trackColor={{ false: Colors.border, true: Colors.accent }}
                  thumbColor={formData.professionalInfo.workingHours[key]?.available ? Colors.primary : Colors.text.secondary}
                  disabled={isLoading}
                />
              </View>
              
              {formData.professionalInfo.workingHours[key]?.available && (
                <View style={styles.timeInputs}>
                  <View style={styles.timeInput}>
                    <Text style={styles.timeLabel}>
                      {t('profile.startTime') || 'Início'}
                    </Text>
                    <TextInput
                      style={styles.timeField}
                      value={formData.professionalInfo.workingHours[key]?.start || ''}
                      onChangeText={(text) => updateWorkingHours(key, 'start', text)}
                      placeholder="08:00"
                      placeholderTextColor={Colors.text.secondary}
                      editable={!isLoading}
                    />
                  </View>
                  <View style={styles.timeInput}>
                    <Text style={styles.timeLabel}>
                      {t('profile.endTime') || 'Fim'}
                    </Text>
                    <TextInput
                      style={styles.timeField}
                      value={formData.professionalInfo.workingHours[key]?.end || ''}
                      onChangeText={(text) => updateWorkingHours(key, 'end', text)}
                      placeholder="17:00"
                      placeholderTextColor={Colors.text.secondary}
                      editable={!isLoading}
                    />
                  </View>
                </View>
              )}
            </View>
          ))}
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
    paddingBottom: spacing.lg + 50,
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
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
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
    height: 100,
    textAlignVertical: 'top',
  },
  dayGroup: {
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: Colors.surface,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  timeInputs: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: spacing.sm,
  },
  timeField: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    padding: spacing.sm,
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: 'center',
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
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 50,
  },
});