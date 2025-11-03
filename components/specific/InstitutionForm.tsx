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
  Switch,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import { Colors } from '../../constants/colors';
import { spacing } from '../../constants/dimensions';
import { useTranslation } from '../../hooks/useTranslation';
import { Institution, Coordinates } from '../../types';
import { LocationPicker } from '../common/LocationPicker';
import { GeocodingService } from '../../services/geocoding';
import { LocationServiceExpo as LocationService } from '../../services/location-expo';

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

  // Estados para coordenadas e localização (hooks devem vir antes de qualquer return)
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(
    user?.institutionInfo?.coordinates || null
  );
  // Serviços oferecidos (picker)
  const [showServicesPicker, setShowServicesPicker] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>(user?.institutionInfo?.services || []);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    institutionInfo: {
      type: user?.institutionInfo?.type || ('clinic' as const),
      description: user?.institutionInfo?.description || '',
      services: user?.institutionInfo?.services?.join(', ') || '',
      acceptsInsurance: user?.institutionInfo?.acceptsInsurance || false,
      emergencyService: user?.institutionInfo?.emergencyService || false,
      coordinates: user?.institutionInfo?.coordinates || null,
      address: {
        street: user?.institutionInfo?.address?.street || '',
        city: user?.institutionInfo?.address?.city || '',
        state: user?.institutionInfo?.address?.state || '',
        zipCode: user?.institutionInfo?.address?.zipCode || '',
      },
      workingHours: user?.institutionInfo?.workingHours || {
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
    if (!user) return;
    
    console.log('🔄 InstitutionForm - Atualizando dados do formulário:', {
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      institutionInfo: user.institutionInfo
    });
    
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      institutionInfo: {
        type: user.institutionInfo?.type || ('clinic' as const),
        description: user.institutionInfo?.description || '',
        services: user.institutionInfo?.services?.join(', ') || '',
        acceptsInsurance: user.institutionInfo?.acceptsInsurance || false,
        emergencyService: user.institutionInfo?.emergencyService || false,
        coordinates: user.institutionInfo?.coordinates || null,
        address: {
          street: user.institutionInfo?.address?.street || '',
          city: user.institutionInfo?.address?.city || '',
          state: user.institutionInfo?.address?.state || '',
          zipCode: user.institutionInfo?.address?.zipCode || '',
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

    // Atualizar estado local de coordinates
    setCoordinates(user.institutionInfo?.coordinates || null);
    // Atualizar serviços selecionados
    setSelectedServices(user.institutionInfo?.services || []);
  }, [user]);

  // Aguardar dados completos do usuário
  if (!user) {
    console.log('⏳ InstitutionForm - Aguardando dados completos do usuário...');
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>
          {t('common.loading') || 'Carregando dados do perfil...'}
        </Text>
      </View>
    );
  }

  // Se não tiver institutionInfo, vamos usar valores padrão e deixar o usuário preencher
  console.log('ℹ️ InstitutionForm - institutionInfo:', user.institutionInfo);

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

  // Handlers para localização
  const handleAddressChange = async (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      institutionInfo: {
        ...prev.institutionInfo,
        address: {
          ...prev.institutionInfo.address,
          [field]: value
        }
      }
    }));
    
    // Geocoding automático quando temos endereço da rua
    if (field === 'street' && value.length > 5) {
      const currentAddress = formData.institutionInfo.address;
      const fullAddress = `${value}, ${currentAddress.city || ''}, ${currentAddress.state || ''}, Angola`.trim();
      
      if (fullAddress.length > 10) {
        setIsGeocodingAddress(true);
        try {
          const result = await GeocodingService.getCoordinatesFromAddress(fullAddress);
          if (result) {
            setCoordinates(result.coordinates);
            setFormData(prev => ({
              ...prev,
              institutionInfo: {
                ...prev.institutionInfo,
                coordinates: result.coordinates
              }
            }));
            console.log('✅ Coordenadas obtidas automaticamente:', result.coordinates);
          }
        } catch (error) {
          console.log('⚠️ Geocoding automático falhou, usuário pode usar GPS ou mapa');
        } finally {
          setIsGeocodingAddress(false);
        }
      }
    }
  };

  const AVAILABLE_SERVICES = [
    { key: 'generalConsultations', label: t('medicalServices.generalConsultations') || 'Consultas Gerais' },
    { key: 'cardiology', label: t('medicalServices.cardiology') || 'Cardiologia' },
    { key: 'pediatrics', label: t('medicalServices.pediatrics') || 'Pediatria' },
    { key: 'gynecology', label: t('medicalServices.gynecology') || 'Ginecologia' },
    { key: 'dermatology', label: t('medicalServices.dermatology') || 'Dermatologia' },
    { key: 'orthopedics', label: t('medicalServices.orthopedics') || 'Ortopedia' },
    { key: 'neurology', label: t('medicalServices.neurology') || 'Neurologia' },
    { key: 'psychiatry', label: t('medicalServices.psychiatry') || 'Psiquiatria' },
    { key: 'ophthalmology', label: t('medicalServices.ophthalmology') || 'Oftalmologia' },
    { key: 'otolaryngology', label: t('medicalServices.otolaryngology') || 'Otorrinolaringologia' },
    { key: 'urology', label: t('medicalServices.urology') || 'Urologia' },
    { key: 'endocrinology', label: t('medicalServices.endocrinology') || 'Endocrinologia' },
    { key: 'rheumatology', label: t('medicalServices.rheumatology') || 'Reumatologia' },
    { key: 'gastroenterology', label: t('medicalServices.gastroenterology') || 'Gastroenterologia' },
    { key: 'pneumology', label: t('medicalServices.pneumology') || 'Pneumologia' },
    { key: 'oncology', label: t('medicalServices.oncology') || 'Oncologia' },
    { key: 'physiotherapy', label: t('medicalServices.physiotherapy') || 'Fisioterapia' },
    { key: 'nutrition', label: t('medicalServices.nutrition') || 'Nutrição' },
    { key: 'psychology', label: t('medicalServices.psychology') || 'Psicologia' },
    { key: 'emergency', label: t('medicalServices.emergency') || 'Emergência' },
    { key: 'generalSurgery', label: t('medicalServices.generalSurgery') || 'Cirurgia Geral' }
  ];

  const handleServiceToggle = (service: string) => {
    const updated = selectedServices.includes(service)
      ? selectedServices.filter(s => s !== service)
      : [...selectedServices, service];

    setSelectedServices(updated);
    // Keep formData in sync if needed (not strictly required)
    setFormData(prev => ({
      ...prev,
      institutionInfo: { ...prev.institutionInfo, services: updated.join(', ') }
    }));
  };

  const handleUseGPS = async () => {
    setIsGettingLocation(true);
    try {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        setCoordinates(location.coordinates);
        setFormData(prev => ({
          ...prev,
          institutionInfo: {
            ...prev.institutionInfo,
            coordinates: location.coordinates
          }
        }));
        
        Alert.alert(
          t('common.success') || 'Localização Obtida!',
          `A localização da instituição foi capturada com precisão de ${location.accuracy.toFixed(0)} metros.`,
          [{ text: t('common.ok') || 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        t('app.locationError'),
        t('app.locationGpsError')
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleLocationSelect = (coords: Coordinates, address?: string) => {
    setCoordinates(coords);
    setFormData(prev => ({
      ...prev,
      institutionInfo: {
        ...prev.institutionInfo,
        coordinates: coords
      }
    }));
    console.log('✅ Localização da instituição selecionada manualmente:', coords);
  };

  const formatCoordinates = (coords: Coordinates): string => {
    return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
  };

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
        services: selectedServices,
        acceptsInsurance: formData.institutionInfo.acceptsInsurance,
        emergencyService: formData.institutionInfo.emergencyService,
        coordinates: coordinates || user.institutionInfo?.coordinates, // Usar coordinates do estado
        address: {
          street: formData.institutionInfo.address.street.trim(),
          city: formData.institutionInfo.address.city.trim(),
          state: formData.institutionInfo.address.state.trim(),
          zipCode: formData.institutionInfo.address.zipCode.trim(),
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
              placeholderTextColor={Colors.textSecondary}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.email') || 'Email'}
            </Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={formData.email}
              editable={false}
              placeholderTextColor={Colors.textSecondary}
            />
            <Text style={styles.helpText}>
              {t('profile.emailNotEditable') || 'O email não pode ser alterado'}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.phone') || 'Telefone Principal'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              placeholder={t('profile.phonePlaceholder') || 'Digite o telefone principal'}
              placeholderTextColor={Colors.textSecondary}
              keyboardType="phone-pad"
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
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={4}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('profile.services') || 'Serviços Oferecidos'}
            </Text>
            <TouchableOpacity
              style={styles.servicesButton}
              onPress={() => setShowServicesPicker(true)}
              disabled={isLoading}
            >
              <Text style={[styles.servicesButtonText, selectedServices.length === 0 && styles.placeholder]}>
                {selectedServices.length > 0
                  ? `${selectedServices.length} ${t('forms.servicesSelected') || 'serviço(s) selecionado(s)'}`
                  : (t('profile.selectServices') || 'Selecionar serviços oferecidos')}
              </Text>
            </TouchableOpacity>

            {selectedServices.length > 0 && (
              <View style={styles.selectedServices}>
                {selectedServices.map((service, index) => (
                  <View key={index} style={styles.serviceTag}>
                    <Text style={styles.serviceTagText}>{service}</Text>
                    <TouchableOpacity
                      onPress={() => handleServiceToggle(service)}
                      style={styles.removeServiceButton}
                    >
                      <Text style={styles.removeServiceText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
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
              onChangeText={(text) => handleAddressChange('street', text)}
              placeholder={t('profile.streetPlaceholder') || 'Rua, número, bairro'}
              placeholderTextColor={Colors.textSecondary}
              editable={!isLoading}
            />
            {isGeocodingAddress && (
              <View style={styles.geocodingIndicator}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.geocodingText}>
                  {t('forms.gettingCoordinates') || 'Obtendo coordenadas...'}
                </Text>
              </View>
            )}
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
                placeholderTextColor={Colors.textSecondary}
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
                placeholderTextColor={Colors.textSecondary}
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
              placeholderTextColor={Colors.textSecondary}
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Localização Exata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('forms.exactInstitutionLocation') || 'Localização Exata da Instituição'}
          </Text>
          
          <View style={styles.coordinatesSection}>
            <Text style={styles.coordinatesHelp}>
              {t('app.locationPrecisionInstitution') || 'Para melhor precisão no mapa, forneça as coordenadas exatas da instituição'}
            </Text>
            
            {coordinates ? (
              <View style={styles.coordinatesDisplay}>
                <Text style={styles.coordinatesTitle}>
                  📍 {t('forms.coordinatesCaptured') || 'Coordenadas capturadas'}:
                </Text>
                <Text style={styles.coordinatesText}>
                  {formatCoordinates(coordinates)}
                </Text>
                <TouchableOpacity
                  style={styles.updateLocationButton}
                  onPress={() => setShowLocationPicker(true)}
                  disabled={isLoading}
                >
                  <Text style={styles.updateLocationButtonText}>
                    {t('app.adjustOnMap') || 'Ajustar no Mapa'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.locationOptions}>
                <TouchableOpacity
                  style={styles.locationOption}
                  onPress={handleUseGPS}
                  disabled={isGettingLocation || isLoading}
                >
                  {isGettingLocation ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Text style={styles.locationOptionText}>
                      🎯 {t('forms.useGPS') || 'Usar GPS'}
                    </Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.locationOption}
                  onPress={() => setShowLocationPicker(true)}
                  disabled={isLoading}
                >
                  <Text style={styles.locationOptionText}>
                    {t('app.selectOnMap') || 'Selecionar no Mapa'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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

      {/* Modal do LocationPicker */}
      <Modal
        visible={showServicesPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowServicesPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('profile.selectServices') || 'Selecionar Serviços'}</Text>
            <FlatList
              data={AVAILABLE_SERVICES}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.serviceOption,
                    selectedServices.includes(item.label) && styles.selectedServiceOption
                  ]}
                  onPress={() => handleServiceToggle(item.label)}
                >
                  <Text style={[
                    styles.serviceOptionText,
                    selectedServices.includes(item.label) && styles.selectedServiceOptionText
                  ]}>
                    {item.label}
                  </Text>
                  {selectedServices.includes(item.label) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowServicesPicker(false)}
            >
              <Text style={styles.modalCloseText}>{t('common.close') || 'Fechar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        initialCoordinates={coordinates || undefined}
        title={t('forms.selectInstitutionLocation') || 'Selecionar Localização da Instituição'}
      />
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
    color: Colors.text,
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
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    color: Colors.text,
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
    color: Colors.textSecondary,
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
    color: Colors.text,
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
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  timeField: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    padding: spacing.sm,
    fontSize: 14,
    color: Colors.text,
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
    backgroundColor: Colors.textSecondary,
  },
  saveButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 50,
  },
  // Estilos para geocoding e coordenadas
  geocodingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: Colors.accent + '20',
    borderRadius: 6,
  },
  geocodingText: {
    marginLeft: spacing.sm,
    fontSize: 12,
    color: Colors.primary,
  },
  coordinatesSection: {
    padding: spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  coordinatesHelp: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  coordinatesDisplay: {
    backgroundColor: Colors.accent + '20',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
  },
  coordinatesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'monospace',
    marginBottom: spacing.sm,
  },
  updateLocationButton: {
    backgroundColor: Colors.primary,
    padding: spacing.sm,
    borderRadius: 6,
    alignItems: 'center',
  },
  updateLocationButtonText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '500',
  },
  locationOptions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  locationOption: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  locationOptionText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  // Styles for services picker
  servicesButton: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: spacing.md,
    minHeight: 50,
    justifyContent: 'center',
  },
  servicesButtonText: {
    fontSize: 16,
    color: Colors.text,
  },
  selectedServices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 2,
  },
  serviceTagText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '500',
  },
  removeServiceButton: {
    marginLeft: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeServiceText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  serviceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '40',
  },
  selectedServiceOption: {
    backgroundColor: Colors.accent + '20',
  },
  serviceOptionText: {
    fontSize: 16,
    color: Colors.text,
  },
  selectedServiceOptionText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  modalCloseText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    color: Colors.textSecondary,
  },
  disabledInput: {
    backgroundColor: Colors.border + '30',
    color: Colors.textSecondary,
  },
  helpText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
});