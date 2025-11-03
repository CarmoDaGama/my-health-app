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
  Modal,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Colors } from '../../constants/colors';
import { spacing } from '../../constants/dimensions';
import { useTranslation } from '../../hooks/useTranslation';
import { Professional, Coordinates } from '../../types';
import { getTranslatedSpecialties, getTranslatedServices } from '../../constants/specialties';
import { LocationPicker } from '../common/LocationPicker';
import { GeocodingService } from '../../services/geocoding';
import { LocationServiceExpo as LocationService } from '../../services/location-expo';

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

  // Obter especialidades e serviços traduzidos
  const translatedSpecialties = getTranslatedSpecialties(t);
  const translatedServices = getTranslatedServices(t);

  // Estados para coordenadas e localização
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(user?.professionalInfo?.coordinates || null);
  
  // Estados para serviços
  const [showServicesPicker, setShowServicesPicker] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>(user?.professionalInfo?.services || []);

  const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    professionalInfo: {
      specialty: user?.professionalInfo?.specialty || '',
      license: user?.professionalInfo?.license || '',
      experience: user?.professionalInfo?.experience?.toString() || '',
      bio: user?.professionalInfo?.bio || '',
      address: user?.professionalInfo?.address || '',
      services: user?.professionalInfo?.services || [],
      coordinates: user?.professionalInfo?.coordinates || null,
    }
  });

  // Atualizar formData quando user props mudar
  useEffect(() => {
    if (!user) return;
    
    console.log('🔄 ProfessionalForm - useEffect disparado');
    console.log('🔍 ProfessionalForm - User completo:', JSON.stringify(user, null, 2));
    console.log('🔍 ProfessionalForm - professionalInfo detalhado:', {
      exists: !!user.professionalInfo,
      specialty: user.professionalInfo?.specialty,
      license: user.professionalInfo?.license,
      experience: user.professionalInfo?.experience,
      bio: user.professionalInfo?.bio,
      address: user.professionalInfo?.address,
      services: user.professionalInfo?.services,
      coordinates: user.professionalInfo?.coordinates,
      allKeys: user.professionalInfo ? Object.keys(user.professionalInfo) : []
    });
    
    const newFormData = {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      professionalInfo: {
        specialty: user.professionalInfo?.specialty || '',
        license: user.professionalInfo?.license || '',
        experience: user.professionalInfo?.experience?.toString() || '',
        bio: user.professionalInfo?.bio || '',
        address: user.professionalInfo?.address || '',
        services: user.professionalInfo?.services || [],
        coordinates: user.professionalInfo?.coordinates || null,
      }
    };
    
    console.log('📝 ProfessionalForm - Novo formData:', JSON.stringify(newFormData, null, 2));
    setFormData(newFormData);

    // Atualizar estados locais
    const newCoordinates = user.professionalInfo?.coordinates || null;
    const newServices = user.professionalInfo?.services || [];
    
    console.log('📍 ProfessionalForm - Atualizando coordenadas:', newCoordinates);
    console.log('🔧 ProfessionalForm - Atualizando serviços:', newServices);
    
    setCoordinates(newCoordinates);
    setSelectedServices(newServices);
  }, [user]);

  // Aguardar dados completos do usuário
  if (!user) {
    console.log('⏳ ProfessionalForm - Aguardando usuário...');
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>
          {t('common.loading') || 'Carregando dados do perfil...'}
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

  // Handlers para os novos campos
  const handleServiceToggle = (service: string) => {
    const updatedServices = selectedServices.includes(service)
      ? selectedServices.filter(s => s !== service)
      : [...selectedServices, service];
    
    setSelectedServices(updatedServices);
    setFormData(prev => ({
      ...prev,
      professionalInfo: {
        ...prev.professionalInfo,
        services: updatedServices
      }
    }));
  };

  const handleAddressChange = async (address: string) => {
    setFormData(prev => ({
      ...prev,
      professionalInfo: {
        ...prev.professionalInfo,
        address
      }
    }));
    
    // Geocoding automático quando o endereço é alterado
    if (address.length > 10) {
      setIsGeocodingAddress(true);
      try {
        const result = await GeocodingService.getCoordinatesFromAddress(address);
        if (result) {
          setCoordinates(result.coordinates);
          setFormData(prev => ({
            ...prev,
            professionalInfo: {
              ...prev.professionalInfo,
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
  };

  const handleUseGPS = async () => {
    setIsGettingLocation(true);
    try {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        setCoordinates(location.coordinates);
        setFormData(prev => ({
          ...prev,
          professionalInfo: {
            ...prev.professionalInfo,
            coordinates: location.coordinates
          }
        }));
        
        // Se obtivemos um endereço do GPS, atualizar também
        if (location.address) {
          setFormData(prev => ({
            ...prev,
            professionalInfo: {
              ...prev.professionalInfo,
              address: location.address!
            }
          }));
        }
        
        Alert.alert(
          t('common.success') || 'Localização Obtida!',
          `Sua localização foi capturada com precisão de ${location.accuracy.toFixed(0)} metros.`,
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
      professionalInfo: {
        ...prev.professionalInfo,
        coordinates: coords,
        ...(address && { address })
      }
    }));
    
    console.log('✅ Localização selecionada manualmente:', coords);
  };

  const formatCoordinates = (coords: Coordinates): string => {
    return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
  };

  const handleSave = () => {
    console.log('💾 ProfessionalForm.handleSave - Iniciando salvamento...');
    console.log('📊 Estado atual do formData:', JSON.stringify(formData, null, 2));
    console.log('📊 Serviços selecionados:', selectedServices);
    console.log('📊 Coordenadas:', coordinates);
    
    // Validações básicas - alinhadas com RegisterScreen
    if (!formData.name.trim()) {
      Alert.alert(
        t('errors.title') || 'Erro',
        t('validation.nameRequired') || 'Nome é obrigatório'
      );
      return;
    }

    if (!formData.professionalInfo.specialty.trim()) {
      Alert.alert(
        t('errors.title') || 'Erro',
        t('validation.specialtyRequired') || 'Especialidade é obrigatória'
      );
      return;
    }

    if (!formData.professionalInfo.license.trim()) {
      Alert.alert(
        t('errors.title') || 'Erro',
        t('validation.licenseRequired') || 'Número da licença é obrigatório'
      );
      return;
    }

    // Preparar dados para salvar - apenas os campos do RegisterScreen
    const updateData: Partial<Professional> = {
      name: formData.name.trim(),
      phone: formData.phone.trim() || undefined,
      professionalInfo: {
        ...(user.professionalInfo || {}),
        specialty: formData.professionalInfo.specialty.trim(),
        license: formData.professionalInfo.license.trim(),
        experience: parseInt(formData.professionalInfo.experience) || 0,
        bio: formData.professionalInfo.bio.trim() || undefined,
        address: formData.professionalInfo.address.trim(),
        services: selectedServices,
        coordinates: coordinates || undefined,
      }
    };

    console.log('📤 ProfessionalForm.handleSave - Dados preparados para envio:', JSON.stringify(updateData, null, 2));
    console.log('📤 ProfessionalForm.handleSave - Chamando onSave...');
    
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
              {t('profile.phone') || 'Telefone'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              placeholder={t('profile.phonePlaceholder') || 'Digite seu telefone'}
              placeholderTextColor={Colors.textSecondary}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Informações Profissionais - Alinhado com RegisterScreen */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('forms.professionalInfo') || 'Informações Profissionais'}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('forms.specialty') || 'Especialidade'} *
            </Text>
            <TouchableOpacity
              style={styles.specialtyButton}
              onPress={() => setShowSpecialtyPicker(true)}
              disabled={isLoading}
            >
              <Text style={[
                styles.specialtyButtonText, 
                !formData.professionalInfo.specialty && styles.placeholder
              ]}>
                {formData.professionalInfo.specialty || 
                 (t('forms.specialtyPlaceholder') || 'Ex: Cardiologia, Pediatria...')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('forms.licenseNumber') || 'Número da Licença'} *
            </Text>
            <TextInput
              style={styles.input}
              value={formData.professionalInfo.license}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                professionalInfo: { ...prev.professionalInfo, license: text }
              }))}
              placeholder={t('forms.licenseNumberPlaceholder') || 'Número do registro profissional'}
              placeholderTextColor={Colors.textSecondary}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('forms.availableServices') || 'Serviços Disponíveis'} *
            </Text>
            <TouchableOpacity
              style={styles.servicesButton}
              onPress={() => setShowServicesPicker(true)}
              disabled={isLoading}
            >
              <Text style={[styles.servicesButtonText, selectedServices.length === 0 && styles.placeholder]}>
                {selectedServices.length > 0 
                  ? `${selectedServices.length} ${t('forms.servicesSelected') || 'serviço(s) selecionado(s)'}`
                  : t('forms.selectServices') || 'Selecionar serviços'
                }
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('forms.yearsOfExperience') || 'Anos de Experiência'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.professionalInfo.experience}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                professionalInfo: { ...prev.professionalInfo, experience: text }
              }))}
              placeholder={t('forms.yearsPlaceholder') || 'Ex: 5'}
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('forms.address') || 'Endereço'} *
            </Text>
            <TextInput
              style={styles.input}
              value={formData.professionalInfo.address}
              onChangeText={handleAddressChange}
              placeholder={t('forms.officeAddress') || 'Endereço do consultório'}
              placeholderTextColor={Colors.textSecondary}
              editable={!isLoading}
            />
            {isGeocodingAddress && (
              <View style={styles.geocodingIndicator}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.geocodingText}>{t('forms.gettingCoordinates') || 'Obtendo coordenadas...'}</Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('forms.descriptionBiography') || 'Descrição/Biografia'} *
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.professionalInfo.bio}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                professionalInfo: { ...prev.professionalInfo, bio: text }
              }))}
              placeholder={t('forms.descriptionPlaceholder') || 'Descreva seus serviços...'}
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={3}
              editable={!isLoading}
            />
          </View>

          {/* Seção de Coordenadas - Alinhado com RegisterScreen */}
          <View style={styles.coordinatesSection}>
            <Text style={styles.label}>{t('forms.exactLocation') || 'Localização Exata'}</Text>
            <Text style={styles.coordinatesHelp}>
              {t('app.locationPrecisionProfessional') || 'Para melhor precisão no mapa, capture sua localização exata:'}
            </Text>
            
            {coordinates ? (
              <View style={styles.coordinatesDisplay}>
                <Text style={styles.coordinatesTitle}>📍 {t('forms.coordinatesCaptured') || 'Coordenadas capturadas'}:</Text>
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
                    {t('app.selectOnMap') || '📍 Selecionar no Mapa'}
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
      
      {/* Modal de Seleção de Serviços */}
      <Modal
        visible={showServicesPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowServicesPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('forms.selectServicesTitle') || 'Selecionar Serviços'}</Text>
            <FlatList
              data={translatedServices}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.serviceOption,
                    selectedServices.includes(item) && styles.selectedServiceOption
                  ]}
                  onPress={() => handleServiceToggle(item)}
                >
                  <Text style={[
                    styles.serviceOptionText,
                    selectedServices.includes(item) && styles.selectedServiceOptionText
                  ]}>
                    {item}
                  </Text>
                  {selectedServices.includes(item) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowServicesPicker(false)}
            >
              <Text style={styles.modalCloseText}>{t('forms.close') || 'Fechar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal do LocationPicker */}
      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        initialCoordinates={coordinates || undefined}
        title="Selecionar Localização do Consultório"
      />
      
      {/* Modal de Seleção de Especialidade */}
      <Modal
        visible={showSpecialtyPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSpecialtyPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t('profile.selectSpecialty') || 'Selecione uma Especialidade'}
            </Text>
            <FlatList
              data={translatedSpecialties}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.specialtyOption,
                    formData.professionalInfo.specialty === item && styles.selectedSpecialtyOption
                  ]}
                  onPress={() => {
                    setFormData(prev => ({
                      ...prev,
                      professionalInfo: { ...prev.professionalInfo, specialty: item }
                    }));
                    setShowSpecialtyPicker(false);
                  }}
                >
                  <Text style={[
                    styles.specialtyOptionText,
                    formData.professionalInfo.specialty === item && styles.selectedSpecialtyOptionText
                  ]}>
                    {item}
                  </Text>
                  {formData.professionalInfo.specialty === item && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSpecialtyPicker(false)}
            >
              <Text style={styles.modalCloseText}>
                {t('common.close') || 'Fechar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  // Estilos para serviços
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
  // Estilos para coordenadas
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
    marginBottom: spacing.md,
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
  // Estilos para o modal de serviços
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
  // Estilos para seleção de especialidade
  specialtyButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: Colors.surface,
    minHeight: 48,
    justifyContent: 'center',
  },
  specialtyButtonText: {
    fontSize: 16,
    color: Colors.text,
  },
  placeholder: {
    color: Colors.textSecondary,
  },
  // Estilos do modal
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
  specialtyOption: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedSpecialtyOption: {
    backgroundColor: Colors.primary + '10',
  },
  specialtyOptionText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  selectedSpecialtyOptionText: {
    color: Colors.primary,
    fontWeight: '600',
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