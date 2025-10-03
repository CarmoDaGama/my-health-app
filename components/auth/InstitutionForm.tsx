import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Alert, ActivityIndicator } from 'react-native';
import ValidatedInput from '../common/ValidatedInput';
import { LocationPicker } from '../common/LocationPicker';
import { GeocodingService } from '../../services/geocoding';
import { LocationServiceExpo as LocationService } from '../../services/location-expo';
import { Coordinates } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface InstitutionFormProps {
  data: any;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

const INSTITUTION_TYPES = [
  { label: 'forms.selectType', value: '' },
  { label: 'Hospital', value: 'hospital' },
  { label: 'Clínica', value: 'clinic' },
  { label: 'Laboratório', value: 'laboratory' },
  { label: 'Farmácia', value: 'pharmacy' },
  { label: 'Outro', value: 'other' },
];

const AVAILABLE_SERVICES = [
  'Emergência',
  'Cirurgia',
  'Pediatria',
  'Cardiologia',
  'Consultas',
  'Exames',
  'Vacinação',
  'Check-up',
  'Laboratório',
  'Radiologia',
  'Fisioterapia',
  'Nutrição',
  'Psicologia',
  'Ginecologia',
  'Urologia',
  'Dermatologia',
  'Oftalmologia',
  'Ortopedia',
  'Neurologia',
  'Oncologia',
  'Farmácia',
  'Internação',
  'UTI',
  'Maternidade'
];

export default function InstitutionForm({ data, onChange, errors }: InstitutionFormProps) {
  const { t } = useTranslation();
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showServicesPicker, setShowServicesPicker] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>(data.services || []);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(data.coordinates || null);

  const handleNestedChange = (field: string, value: any) => {
    onChange(field, value);
  };

  const handleTypeSelect = (value: string) => {
    onChange('type', value);
    setShowTypePicker(false);
  };

  const handleServiceToggle = (service: string) => {
    const updatedServices = selectedServices.includes(service)
      ? selectedServices.filter((s: string) => s !== service)
      : [...selectedServices, service];
    
    setSelectedServices(updatedServices);
    onChange('services', updatedServices);
  };

  const handleAddressChange = async (field: string, value: string) => {
    handleNestedChange(field, value);
    
    // Geocoding automático quando temos um endereço completo
    if (field === 'address.street' && value.length > 5) {
      const currentAddress = data.address || {};
      const fullAddress = `${value}, ${currentAddress.city || ''}, ${currentAddress.state || ''}, Angola`.trim();
      
      if (fullAddress.length > 10) {
        setIsGeocodingAddress(true);
        try {
          const result = await GeocodingService.getCoordinatesFromAddress(fullAddress);
          if (result) {
            setCoordinates(result.coordinates);
            onChange('coordinates', result.coordinates);
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

  const handleUseGPS = async () => {
    setIsGettingLocation(true);
    try {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        setCoordinates(location.coordinates);
        onChange('coordinates', location.coordinates);
        
        Alert.alert(
          'Localização Obtida!',
          `A localização da instituição foi capturada com precisão de ${location.accuracy.toFixed(0)} metros.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        t('map.locationError'),
        'Não foi possível obter a localização via GPS. Use a seleção manual no mapa.'
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleLocationSelect = (coords: Coordinates, address?: string) => {
    setCoordinates(coords);
    onChange('coordinates', coords);
    console.log('✅ Localização da instituição selecionada manualmente:', coords);
  };

  const formatCoordinates = (coords: Coordinates): string => {
    return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
  };

  const selectedTypeLabel = INSTITUTION_TYPES.find(type => type.value === data.type)?.label || 'forms.selectType';
  const getTranslatedLabel = (label: string) => {
    if (label === 'forms.selectType') return t('forms.selectType');
    return label;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informações da Instituição</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tipo de Instituição *</Text>
        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => setShowTypePicker(true)}
        >
          <Text style={[styles.pickerText, !data.type && styles.placeholder]}>
            {getTranslatedLabel(selectedTypeLabel)}
          </Text>
        </TouchableOpacity>
        {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
      </View>

      <Modal
        visible={showTypePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTypePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('forms.selectTypeTitle')}</Text>
            <FlatList
              data={INSTITUTION_TYPES.filter(type => type.value !== '')}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleTypeSelect(item.value)}
                >
                  <Text style={styles.modalOptionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTypePicker(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Serviços Disponíveis *</Text>
        <TouchableOpacity
          style={styles.servicesButton}
          onPress={() => setShowServicesPicker(true)}
        >
          <Text style={[styles.servicesButtonText, selectedServices.length === 0 && styles.placeholder]}>
            {selectedServices.length > 0 
              ? `${selectedServices.length} serviço(s) selecionado(s)`
              : t('forms.selectServices')
            }
          </Text>
        </TouchableOpacity>
        {errors.services && <Text style={styles.errorText}>{errors.services}</Text>}
        
        {selectedServices.length > 0 && (
          <View style={styles.selectedServices}>
            {selectedServices.map((service: string, index: number) => (
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
      
      <Modal
        visible={showServicesPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowServicesPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('forms.selectServicesTitle')}</Text>
            <FlatList
              data={AVAILABLE_SERVICES}
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
              <Text style={styles.modalCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <Text style={styles.sectionTitle}>Endereço</Text>
      
      <View style={styles.inputGroup}>
        <ValidatedInput
          label="Rua"
          value={data.address?.street || ''}
          onChangeText={(value) => handleAddressChange('address.street', value)}
          error={errors['address.street']}
          placeholder="Rua, número"
          required
        />
        {isGeocodingAddress && (
          <View style={styles.geocodingIndicator}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.geocodingText}>Obtendo coordenadas...</Text>
          </View>
        )}
      </View>
      
      <ValidatedInput
        label="Cidade"
        value={data.address?.city || ''}
        onChangeText={(value) => handleNestedChange('address.city', value)}
        error={errors['address.city']}
        placeholder="Cidade"
        required
      />
      
      <ValidatedInput
        label="Província"
        value={data.address?.state || ''}
        onChangeText={(value) => handleNestedChange('address.state', value)}
        error={errors['address.state']}
        placeholder="Província"
        required
      />

      {/* Seção de Coordenadas */}
      <View style={styles.coordinatesSection}>
        <Text style={styles.label}>Localização Exata da Instituição</Text>
        <Text style={styles.coordinatesHelp}>
          Para melhor precisão no mapa, capture a localização exata da instituição:
        </Text>
        
        {coordinates ? (
          <View style={styles.coordinatesDisplay}>
            <Text style={styles.coordinatesTitle}>📍 Coordenadas Capturadas:</Text>
            <Text style={styles.coordinatesText}>
              {formatCoordinates(coordinates)}
            </Text>
            <TouchableOpacity
              style={styles.updateLocationButton}
              onPress={() => setShowLocationPicker(true)}
            >
              <Text style={styles.updateLocationButtonText}>
                📍 Ajustar no Mapa
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.locationOptions}>
            <TouchableOpacity
              style={styles.locationOption}
              onPress={handleUseGPS}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <Text style={styles.locationOptionText}>
                  🎯 Usar GPS
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.locationOption}
              onPress={() => setShowLocationPicker(true)}
            >
              <Text style={styles.locationOptionText}>
                🗺️ Selecionar no Mapa
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {errors.coordinates && (
          <Text style={styles.errorText}>{errors.coordinates}</Text>
        )}
      </View>
      
      <ValidatedInput
        label="Descrição da Instituição"
        value={data.description || ''}
        onChangeText={(value) => onChange('description', value)}
        error={errors.description}
        placeholder="Descreva a instituição e seus serviços..."
        multiline
        numberOfLines={3}
        required
      />

      {/* Modal do LocationPicker */}
      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        initialCoordinates={coordinates || undefined}
        title="Selecionar Localização da Instituição"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#374151',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#374151',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 16,
    minHeight: 50,
    justifyContent: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#374151',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  servicesButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 16,
    minHeight: 50,
    justifyContent: 'center',
  },
  servicesButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedServices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 2,
  },
  serviceTagText: {
    color: 'white',
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
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 20,
    maxHeight: 500,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  serviceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedServiceOption: {
    backgroundColor: '#EBF4FF',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  serviceOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedServiceOptionText: {
    color: '#10B981',
    fontWeight: '500',
  },
  checkmark: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  geocodingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#EBF4FF',
    borderRadius: 6,
  },
  geocodingText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#3B82F6',
  },
  coordinatesSection: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  coordinatesHelp: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 16,
  },
  coordinatesDisplay: {
    backgroundColor: '#EBF4FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  coordinatesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#3B82F6',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  updateLocationButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  updateLocationButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  locationOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  locationOption: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  locationOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});