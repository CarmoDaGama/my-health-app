import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Alert, ActivityIndicator } from 'react-native';
import ValidatedInput from '../common/ValidatedInput';
import { LocationPicker } from '../common/LocationPicker';
import { GeocodingService } from '../../services/geocoding';
import { LocationService } from '../../services/location';
import { Coordinates } from '../../types';

interface ProfessionalFormProps {
  data: any;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

const AVAILABLE_SERVICES = [
  'Consultas Gerais',
  'Cardiologia',
  'Pediatria',
  'Ginecologia',
  'Dermatologia',
  'Ortopedia',
  'Neurologia',
  'Psiquiatria',
  'Oftalmologia',
  'Otorrinolaringologia',
  'Urologia',
  'Endocrinologia',
  'Reumatologia',
  'Gastroenterologia',
  'Pneumologia',
  'Oncologia',
  'Fisioterapia',
  'Nutrição',
  'Psicologia',
  'Emergência',
  'Cirurgia Geral'
];

export default function ProfessionalForm({ data, onChange, errors }: ProfessionalFormProps) {
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
    
    // Geocoding automático quando o endereço é alterado
    if (address.length > 10) { // Só tentar geocoding se o endereço tiver algum conteúdo
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
        
        // Se obtivemos um endereço do GPS, atualizar também
        if (location.address) {
          onChange('address', location.address);
        }
        
        Alert.alert(
          'Localização Obtida!',
          `Sua localização foi capturada com precisão de ${location.accuracy.toFixed(0)} metros.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Erro ao Obter Localização',
        'Não foi possível obter sua localização via GPS. Use a seleção manual no mapa.'
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleLocationSelect = (coords: Coordinates, address?: string) => {
    setCoordinates(coords);
    onChange('coordinates', coords);
    
    // Se o mapa forneceu um endereço, atualizar
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
      <Text style={styles.title}>Informações Profissionais</Text>
      
      <ValidatedInput
        label="Especialidade"
        value={data.specialty || ''}
        onChangeText={(value) => onChange('specialty', value)}
        error={errors.specialty}
        placeholder="Ex: Cardiologia, Pediatria..."
        required
      />
      
      <ValidatedInput
        label="Número da Licença"
        value={data.license || ''}
        onChangeText={(value) => onChange('license', value)}
        error={errors.license}
        placeholder="Número do registro profissional"
        required
      />
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Serviços Disponíveis *</Text>
        <TouchableOpacity
          style={styles.servicesButton}
          onPress={() => setShowServicesPicker(true)}
        >
          <Text style={[styles.servicesButtonText, selectedServices.length === 0 && styles.placeholder]}>
            {selectedServices.length > 0 
              ? `${selectedServices.length} serviço(s) selecionado(s)`
              : 'Selecione os serviços que oferece'
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
        label="Anos de Experiência"
        value={data.experience?.toString() || ''}
        onChangeText={(value) => onChange('experience', parseInt(value) || 0)}
        error={errors.experience}
        placeholder="Ex: 5"
        keyboardType="numeric"
      />
      

      
      <View style={styles.inputGroup}>
        <ValidatedInput
          label="Endereço"
          value={data.address || ''}
          onChangeText={handleAddressChange}
          error={errors.address}
          placeholder="Endereço do consultório ou clínica"
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
        label="Descrição/Biografia"
        value={data.description || data.bio || ''}
        onChangeText={(value) => onChange('description', value)}
        error={errors.description}
        placeholder="Descreva sua experiência e especializações..."
        multiline
        numberOfLines={3}
        required
      />

      {/* Seção de Coordenadas */}
      <View style={styles.coordinatesSection}>
        <Text style={styles.label}>Localização Exata</Text>
        <Text style={styles.coordinatesHelp}>
          Para melhor precisão no mapa, capture sua localização exata:
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
      
      <Modal
        visible={showServicesPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowServicesPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione os Serviços</Text>
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