import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Alert, ActivityIndicator } from 'react-native';
import ValidatedInput from '../common/ValidatedInput';
import { LocationPicker } from '../common/LocationPicker';
import { GeocodingService } from '../../services/geocoding';
import { LocationServiceExpo as LocationService } from '../../services/location-expo';
import { Coordinates } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { getTranslatedServices } from '../../constants/specialties';

interface ProfessionalFormProps {
  data: any;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export default function ProfessionalForm({ data, onChange, errors }: ProfessionalFormProps) {
  const { t } = useTranslation();
  
  // Obter serviços traduzidos
  const translatedServices = getTranslatedServices(t);
  
  const [showServicesPicker, setShowServicesPicker] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>(data.services || []);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(data.coordinates || null);

  const handleServiceToggle = (service: string) => {
    const updatedServices = selectedServices.includes(service)
      ? selectedServices.filter(s => s !== service)
      : [...selectedServices, service];
    
    setSelectedServices(updatedServices);
    onChange('services', updatedServices);
  };

  const handleAddressChange = async (address: string) => {
    onChange('address', address);
    
    // Automatic geocoding when the address is changed
    if (address.length > 10) { // Only try geocoding if the address has some content
      setIsGeocodingAddress(true);
      try {
        const result = await GeocodingService.getCoordinatesFromAddress(address);
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
  };

  const handleUseGPS = async () => {
    setIsGettingLocation(true);
    try {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        setCoordinates(location.coordinates);
        onChange('coordinates', location.coordinates);
        
        // If we got an address from GPS, update it as well
        if (location.address) {
          onChange('address', location.address);
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
    onChange('coordinates', coords);
    
    // If the map provided an address, update it
    if (address) {
      onChange('address', address);
    }
    
    console.log('✅ Localização selecionada manualmente:', coords);
  };

  const formatCoordinates = (coords: Coordinates): string => {
    return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('forms.professionalInfo')}</Text>
      
      <ValidatedInput
        label={t('forms.specialty') || 'Specialty'}
        value={data.specialty || ''}
        onChangeText={(value) => onChange('specialty', value)}
        error={errors.specialty}
        placeholder={t('forms.specialtyPlaceholder')}
        required
      />
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('forms.availableServices')} *</Text>
        <TouchableOpacity
          style={styles.servicesButton}
          onPress={() => setShowServicesPicker(true)}
        >
          <Text style={[styles.servicesButtonText, selectedServices.length === 0 && styles.placeholder]}>
            {selectedServices.length > 0 
              ? `${selectedServices.length} ${t('forms.servicesSelected')}`
              : t('forms.selectServices')
            }
          </Text>
        </TouchableOpacity>
        {errors.services && <Text style={styles.errorText}>{errors.services}</Text>}
        
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
      
      <ValidatedInput
        label={t('forms.yearsOfExperience')}
        value={data.experience?.toString() || ''}
        onChangeText={(value) => onChange('experience', parseInt(value) || 0)}
        error={errors.experience}
        placeholder={t('forms.yearsPlaceholder') || 'Ex: 5'}
        keyboardType="numeric"
      />
      

      
      <View style={styles.inputGroup}>
        <ValidatedInput
          label={t('forms.address')}
          value={data.address || ''}
          onChangeText={handleAddressChange}
          error={errors.address}
          placeholder={t('forms.officeAddress')}
          required
        />
        {isGeocodingAddress && (
          <View style={styles.geocodingIndicator}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.geocodingText}>{t('forms.gettingCoordinates')}</Text>
          </View>
        )}
      </View>

      <ValidatedInput
        label={t('forms.descriptionBiography')}
        value={data.description || data.bio || ''}
        onChangeText={(value) => onChange('description', value)}
        error={errors.description}
        placeholder={t('forms.descriptionPlaceholder') || 'Descreva seus serviços...'}
        multiline
        numberOfLines={3}
        required
      />

      {/* Seção de Coordenadas - Opcional */}
      <View style={styles.coordinatesSection}>
        <Text style={styles.label}>{t('forms.exactLocation')} ({t('common.optional') || 'Optional'})</Text>
        <Text style={styles.coordinatesHelp}>
          {t('app.locationPrivacyNote') || 'Your exact location helps patients find you. You can choose to show only your city/neighborhood for privacy.'}
        </Text>
        
        {coordinates ? (
          <View style={styles.coordinatesDisplay}>
            <Text style={styles.coordinatesTitle}>📍 {t('forms.coordinatesCaptured')}:</Text>
            <Text style={styles.coordinatesText}>
              {formatCoordinates(coordinates)}
            </Text>
            <TouchableOpacity
              style={styles.updateLocationButton}
              onPress={() => setShowLocationPicker(true)}
            >
              <Text style={styles.updateLocationButtonText}>
                {t('app.adjustOnMap')}
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
                  🎯 {t('forms.useGPS')}
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.locationOption}
              onPress={() => setShowLocationPicker(true)}
            >
              <Text style={styles.locationOptionText}>
                {t('app.selectOnMap')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {errors.coordinates && (
          <Text style={styles.errorText}>{errors.coordinates}</Text>
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
              <Text style={styles.modalCloseText}>{t('forms.close')}</Text>
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
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
  placeholder: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  selectedServices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
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
  serviceOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedServiceOptionText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  checkmark: {
    color: '#3B82F6',
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