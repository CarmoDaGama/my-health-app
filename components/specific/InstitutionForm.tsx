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
import { Institution } from '../../types';

interface InstitutionFormProps {
  user: Institution;
  onSave: (data: Partial<Institution>) => void;
  isLoading?: boolean;
}

export const InstitutionForm: React.FC<InstitutionFormProps> = ({
  user,
  onSave,
  isLoading = false
}) => {
  const { t } = useTranslation();

  // Aguardar dados completos do usuário
  if (!user || !user.institutionInfo) {
    console.log('⏳ InstitutionForm - Aguardando dados completos do usuário...', {
      hasUser: !!user,
      hasInstitutionInfo: !!user?.institutionInfo,
      userData: user
    });
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>
          {t('common.loading') || 'Carregando dados do perfil...'}
        </Text>
      </View>
    );
  }
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    institutionInfo: {
      type: user.institutionInfo?.type || 'clinic',
      description: user.institutionInfo?.description || '',
      services: user.institutionInfo?.services?.join(', ') || '',
      acceptsInsurance: user.institutionInfo?.acceptsInsurance || false,
      emergencyService: user.institutionInfo?.emergencyService || false,
      address: {
        street: user.institutionInfo?.address?.street || '',
        city: user.institutionInfo?.address?.city || '',
        state: user.institutionInfo?.address?.state || '',
        zipCode: user.institutionInfo?.address?.zipCode || '',
      },
      contactInfo: {
        phone: user.institutionInfo?.contactInfo?.phone || '',
        email: user.institutionInfo?.contactInfo?.email || '',
        website: user.institutionInfo?.contactInfo?.website || '',
      },
      workingHours: user.institutionInfo?.workingHours || {
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
    console.log('🔄 InstitutionForm - Atualizando dados do formulário:', {
      userId: user.id,
      name: user.name,
      phone: user.phone,
      institutionInfo: user.institutionInfo
    });
    
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      institutionInfo: {
        type: user.institutionInfo?.type || 'clinic',
        description: user.institutionInfo?.description || '',
        services: user.institutionInfo?.services?.join(', ') || '',
        acceptsInsurance: user.institutionInfo?.acceptsInsurance || false,
        emergencyService: user.institutionInfo?.emergencyService || false,
        address: {
          street: user.institutionInfo?.address?.street || '',
          city: user.institutionInfo?.address?.city || '',
          state: user.institutionInfo?.address?.state || '',
          zipCode: user.institutionInfo?.address?.zipCode || '',
        },
        contactInfo: {
          phone: user.institutionInfo?.contactInfo?.phone || '',
          email: user.institutionInfo?.contactInfo?.email || '',
          website: user.institutionInfo?.contactInfo?.website || '',
        },
        workingHours: user.institutionInfo?.workingHours || {
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

  const institutionTypes = [
    { value: 'hospital', label: t('profile.hospital') || 'Hospital' },
    { value: 'clinic', label: t('profile.clinic') || 'Clínica' },
    { value: 'laboratory', label: t('profile.laboratory') || 'Laboratório' },
    { value: 'pharmacy', label: t('profile.pharmacy') || 'Farmácia' },
    { value: 'emergency', label: t('profile.emergency') || 'Emergência' },
    { value: 'maternity', label: t('profile.maternity') || 'Maternidade' },
    { value: 'rehabilitation', label: t('profile.rehabilitation') || 'Reabilitação' },
    { value: 'dental', label: t('profile.dental') || 'Clínica Dentária' },
    { value: 'physiotherapy', label: t('profile.physiotherapy') || 'Fisioterapia' },
    { value: 'psychology', label: t('profile.psychology') || 'Psicologia' },
    { value: 'other', label: t('profile.other') || 'Outro' },
  ];

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

    if (!formData.institutionInfo.address.street.trim() || 
        !formData.institutionInfo.address.city.trim() || 
        !formData.institutionInfo.address.state.trim()) {
      Alert.alert(
        t('errors.title') || 'Erro',
        t('profile.errors.addressRequired') || 'Endereço completo é obrigatório'
      );
      return;
    }

    // Preparar dados para salvar
    const updateData: Partial<Institution> = {
      name: formData.name.trim(),
      phone: formData.phone.trim() || undefined,
      institutionInfo: {
        ...(user.institutionInfo || {}),
        type: formData.institutionInfo.type as 'hospital' | 'clinic' | 'laboratory' | 'pharmacy' | 'other',
        description: formData.institutionInfo.description.trim(),
        services: formData.institutionInfo.services
          .split(',')
          .map(service => service.trim())
          .filter(service => service.length > 0),
        acceptsInsurance: formData.institutionInfo.acceptsInsurance,
        emergencyService: formData.institutionInfo.emergencyService,
        address: {
          street: formData.institutionInfo.address.street.trim(),
          city: formData.institutionInfo.address.city.trim(),
          state: formData.institutionInfo.address.state.trim(),
          zipCode: formData.institutionInfo.address.zipCode.trim(),
          coordinates: user.institutionInfo?.address?.coordinates, // Manter coordenadas existentes
        },
        contactInfo: {
          phone: formData.institutionInfo.contactInfo.phone.trim(),
          email: formData.institutionInfo.contactInfo.email.trim(),
          website: formData.institutionInfo.contactInfo.website.trim() || undefined,
        },
        workingHours: formData.institutionInfo.workingHours,
        verified: user.institutionInfo?.verified || false, // Manter status de verificação
        rating: user.institutionInfo?.rating || 0, // Manter rating
        totalReviews: user.institutionInfo?.totalReviews || 0, // Manter número de reviews
      }
    };

    onSave(updateData);
  };

  const updateWorkingHours = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      institutionInfo: {
        ...prev.institutionInfo,
        workingHours: {
          ...prev.institutionInfo.workingHours,
          [day]: {
            ...prev.institutionInfo.workingHours[day],
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
              {t('profile.institutionName') || 'Nome da Instituição'} *
            </Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder={t('profile.institutionNamePlaceholder') || 'Nome da instituição de saúde'}
              placeholderTextColor={Colors.text.secondary}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.type') || 'Tipo de Instituição'}
            </Text>
            <View style={styles.typeContainer}>
              {institutionTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeOption,
                    formData.institutionInfo.type === type.value && styles.typeOptionSelected
                  ]}
                  onPress={() => setFormData(prev => ({
                    ...prev,
                    institutionInfo: { 
                      ...prev.institutionInfo, 
                      type: type.value as 'hospital' | 'clinic' | 'laboratory' | 'pharmacy' | 'other' 
                    }
                  }))}
                  disabled={isLoading}
                >
                  <Text style={[
                    styles.typeText,
                    formData.institutionInfo.type === type.value && styles.typeTextSelected
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.description') || 'Descrição'}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.institutionInfo.description}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                institutionInfo: { ...prev.institutionInfo, description: text }
              }))}
              placeholder={t('profile.descriptionPlaceholder') || 'Descreva os serviços e diferenciais da instituição'}
              placeholderTextColor={Colors.text.secondary}
              multiline
              numberOfLines={4}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.services') || 'Serviços Oferecidos'}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.institutionInfo.services}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                institutionInfo: { ...prev.institutionInfo, services: text }
              }))}
              placeholder={t('profile.servicesPlaceholder') || 'Separe os serviços por vírgula (Ex: Consultas, Exames, Cirurgias)'}
              placeholderTextColor={Colors.text.secondary}
              multiline
              numberOfLines={3}
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Endereço */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('profile.address') || 'Endereço'}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.street') || 'Rua/Avenida'} *
            </Text>
            <TextInput
              style={styles.input}
              value={formData.institutionInfo.address.street}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                institutionInfo: {
                  ...prev.institutionInfo,
                  address: { ...prev.institutionInfo.address, street: text }
                }
              }))}
              placeholder={t('profile.streetPlaceholder') || 'Rua, número, bairro'}
              placeholderTextColor={Colors.text.secondary}
              editable={!isLoading}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>
                {t('profile.city') || 'Cidade'} *
              </Text>
              <TextInput
                style={styles.input}
                value={formData.institutionInfo.address.city}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  institutionInfo: {
                    ...prev.institutionInfo,
                    address: { ...prev.institutionInfo.address, city: text }
                  }
                }))}
                placeholder={t('profile.cityPlaceholder') || 'Cidade'}
                placeholderTextColor={Colors.text.secondary}
                editable={!isLoading}
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1, { marginLeft: spacing.sm }]}>
              <Text style={styles.label}>
                {t('profile.state') || 'Província'} *
              </Text>
              <TextInput
                style={styles.input}
                value={formData.institutionInfo.address.state}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  institutionInfo: {
                    ...prev.institutionInfo,
                    address: { ...prev.institutionInfo.address, state: text }
                  }
                }))}
                placeholder={t('profile.statePlaceholder') || 'Província'}
                placeholderTextColor={Colors.text.secondary}
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.zipCode') || 'Código Postal'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.institutionInfo.address.zipCode}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                institutionInfo: {
                  ...prev.institutionInfo,
                  address: { ...prev.institutionInfo.address, zipCode: text }
                }
              }))}
              placeholder={t('profile.zipCodePlaceholder') || 'Código postal'}
              placeholderTextColor={Colors.text.secondary}
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Informações de Contato */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('profile.contactInfo') || 'Informações de Contato'}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.phone') || 'Telefone Principal'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.institutionInfo.contactInfo.phone}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                institutionInfo: {
                  ...prev.institutionInfo,
                  contactInfo: { ...prev.institutionInfo.contactInfo, phone: text }
                }
              }))}
              placeholder={t('profile.phonePlaceholder') || 'Telefone principal'}
              placeholderTextColor={Colors.text.secondary}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.email') || 'Email de Contato'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.institutionInfo.contactInfo.email}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                institutionInfo: {
                  ...prev.institutionInfo,
                  contactInfo: { ...prev.institutionInfo.contactInfo, email: text }
                }
              }))}
              placeholder={t('profile.emailPlaceholder') || 'Email para contato'}
              placeholderTextColor={Colors.text.secondary}
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.website') || 'Website'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.institutionInfo.contactInfo.website}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                institutionInfo: {
                  ...prev.institutionInfo,
                  contactInfo: { ...prev.institutionInfo.contactInfo, website: text }
                }
              }))}
              placeholder={t('profile.websitePlaceholder') || 'https://www.example.com'}
              placeholderTextColor={Colors.text.secondary}
              keyboardType="url"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Configurações de Serviço */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('profile.serviceSettings') || 'Configurações de Serviço'}
          </Text>
          
          <View style={styles.switchGroup}>
            <Text style={styles.label}>
              {t('profile.acceptsInsurance') || 'Aceita Seguro de Saúde'}
            </Text>
            <Switch
              value={formData.institutionInfo.acceptsInsurance}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                institutionInfo: { ...prev.institutionInfo, acceptsInsurance: value }
              }))}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor={formData.institutionInfo.acceptsInsurance ? Colors.primary : Colors.text.secondary}
              disabled={isLoading}
            />
          </View>

          <View style={styles.switchGroup}>
            <Text style={styles.label}>
              {t('profile.emergencyService') || 'Atendimento de Emergência 24h'}
            </Text>
            <Switch
              value={formData.institutionInfo.emergencyService}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                institutionInfo: { ...prev.institutionInfo, emergencyService: value }
              }))}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor={formData.institutionInfo.emergencyService ? Colors.primary : Colors.text.secondary}
              disabled={isLoading}
            />
          </View>
        </View>

        {/* Horário de Funcionamento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('profile.workingHours') || 'Horário de Funcionamento'}
          </Text>
          
          {weekDays.map(({ key, name }) => (
            <View key={key} style={styles.dayGroup}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayName}>{name}</Text>
                <Switch
                  value={formData.institutionInfo.workingHours[key]?.available || false}
                  onValueChange={(value) => updateWorkingHours(key, 'available', value)}
                  trackColor={{ false: Colors.border, true: Colors.accent }}
                  thumbColor={formData.institutionInfo.workingHours[key]?.available ? Colors.primary : Colors.text.secondary}
                  disabled={isLoading}
                />
              </View>
              
              {formData.institutionInfo.workingHours[key]?.available && (
                <View style={styles.timeInputs}>
                  <View style={styles.timeInput}>
                    <Text style={styles.timeLabel}>
                      {t('profile.startTime') || 'Abertura'}
                    </Text>
                    <TextInput
                      style={styles.timeField}
                      value={formData.institutionInfo.workingHours[key]?.start || ''}
                      onChangeText={(text) => updateWorkingHours(key, 'start', text)}
                      placeholder="08:00"
                      placeholderTextColor={Colors.text.secondary}
                      editable={!isLoading}
                    />
                  </View>
                  <View style={styles.timeInput}>
                    <Text style={styles.timeLabel}>
                      {t('profile.endTime') || 'Fechamento'}
                    </Text>
                    <TextInput
                      style={styles.timeField}
                      value={formData.institutionInfo.workingHours[key]?.end || ''}
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
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
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
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    backgroundColor: Colors.surface,
  },
  typeOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accent + '20',
  },
  typeText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  typeTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
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