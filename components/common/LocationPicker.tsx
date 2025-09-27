import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Coordinates } from '../../types';
import { LocationService, LocationResult, ReverseGeocodeResult } from '../../services/location';
import { Colors } from '../../constants/colors';

// Mapear cores para compatibilidade
const colors = {
  primary: Colors.primary,
  secondary: Colors.secondary,
  background: Colors.background,
  surface: Colors.surface,
  surfaceVariant: '#F8F9FA',
  text: Colors.text.primary,
  textSecondary: Colors.text.secondary,
  border: Colors.border,
};

interface LocationPickerProps {
  onLocationSelect: (coordinates: Coordinates, address?: string) => void;
  initialCoordinates?: Coordinates;
  visible: boolean;
  onClose: () => void;
  title?: string;
}

interface MapMarker {
  coordinates: Coordinates;
  address?: string;
}

const { width, height } = Dimensions.get('window');

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialCoordinates,
  visible,
  onClose,
  title = 'Selecionar Localização',
}) => {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: initialCoordinates?.latitude || -8.8379, // Luanda por padrão
    longitude: initialCoordinates?.longitude || 13.2894,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    if (initialCoordinates) {
      setSelectedMarker({
        coordinates: initialCoordinates,
      });
      setMapRegion({
        ...mapRegion,
        latitude: initialCoordinates.latitude,
        longitude: initialCoordinates.longitude,
      });
    }
  }, [initialCoordinates]);

  const handleMapPress = async (coordinate: Coordinates) => {
    console.log('📍 Coordenada selecionada no mapa:', coordinate);
    
    setSelectedMarker({
      coordinates: coordinate,
    });

    // Obter endereço da coordenada selecionada
    setIsLoadingAddress(true);
    try {
      const reverseResult = await LocationService.reverseGeocode(
        coordinate.latitude,
        coordinate.longitude
      );
      
      setSelectedMarker({
        coordinates: coordinate,
        address: reverseResult.formattedAddress,
      });
    } catch (error) {
      console.log('⚠️ Não foi possível obter endereço da coordenada selecionada');
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    console.log('🎯 Obtendo localização atual...');
    
    try {
      const locationResult = await LocationService.getCurrentLocation();
      if (locationResult) {
        const marker: MapMarker = {
          coordinates: locationResult.coordinates,
          address: locationResult.address,
        };
        
        setSelectedMarker(marker);
        setMapRegion({
          ...mapRegion,
          latitude: locationResult.coordinates.latitude,
          longitude: locationResult.coordinates.longitude,
        });
      }
    } catch (error) {
      Alert.alert(
        'Erro de Localização',
        'Não foi possível obter sua localização atual. Selecione manualmente no mapa.'
      );
    }
  };

  const handleConfirmLocation = () => {
    if (selectedMarker) {
      onLocationSelect(selectedMarker.coordinates, selectedMarker.address);
      onClose();
    } else {
      Alert.alert('Selecione uma Localização', 'Por favor, toque no mapa para selecionar uma localização.');
    }
  };

  const formatCoordinates = (coords: Coordinates): string => {
    return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
  };

  // Simular componente de mapa interativo (em produção usar react-native-maps)
  const MapComponent = () => {
    const handleMapTouch = (event: any) => {
      const { locationX, locationY } = event.nativeEvent;
      const mapWidth = width - 32; // margin
      const mapHeight = 300; // altura aproximada do mapa
      
      // Converter coordenadas de toque em coordenadas geográficas
      // Simular uma área de ~2km x 2km ao redor de Luanda
      const latRange = 0.02; // ~2.2km
      const lngRange = 0.02; // ~2.2km
      
      const normalizedX = locationX / mapWidth;
      const normalizedY = locationY / mapHeight;
      
      const newCoordinate: Coordinates = {
        latitude: mapRegion.latitude - (latRange / 2) + (normalizedY * latRange),
        longitude: mapRegion.longitude - (lngRange / 2) + (normalizedX * lngRange),
      };
      
      console.log('🗺️ Ponto marcado no mapa:', newCoordinate);
      handleMapPress(newCoordinate);
    };

    return (
      <View style={styles.mapContainer}>
        <TouchableOpacity
          style={styles.mapView}
          onPress={handleMapTouch}
          activeOpacity={1}
        >
          {/* Simular grid de mapa */}
          <View style={styles.mapGrid}>
            {Array.from({ length: 8 }, (_, i) => (
              <View key={`h-${i}`} style={[styles.gridLine, styles.horizontalLine, { top: `${(i + 1) * 12.5}%` }]} />
            ))}
            {Array.from({ length: 8 }, (_, i) => (
              <View key={`v-${i}`} style={[styles.gridLine, styles.verticalLine, { left: `${(i + 1) * 12.5}%` }]} />
            ))}
          </View>

          {/* Marcador de centro */}
          <View style={styles.centerMarker}>
            <View style={styles.centerDot} />
            <Text style={styles.centerLabel}>Centro</Text>
          </View>

          {/* Simular algumas "ruas" e "bairros" */}
          <View style={styles.mockStreets}>
            <View style={[styles.street, { top: '20%', left: '10%', width: '80%' }]} />
            <View style={[styles.street, { top: '60%', left: '5%', width: '90%' }]} />
            <View style={[styles.street, { top: '10%', left: '30%', height: '80%', width: 2 }]} />
            <View style={[styles.street, { top: '25%', left: '70%', height: '50%', width: 2 }]} />
          </View>

          {/* Instruções */}
          <View style={styles.mapInstructionsContainer}>
            <Text style={styles.mapInstructions}>
              🎯 Toque em qualquer ponto do mapa para marcar sua localização
            </Text>
            <Text style={styles.mapCoordinates}>
              Região: {formatCoordinates(mapRegion)}
            </Text>
          </View>

          {/* Marcador do ponto selecionado */}
          {selectedMarker && (
            <View style={styles.selectedMarkerContainer}>
              <View style={styles.selectedMarker}>
                <View style={styles.markerPin} />
                <View style={styles.markerRipple} />
              </View>
              
              <View style={styles.markerPopup}>
                <Text style={styles.markerTitle}>📍 Localização Selecionada</Text>
                <Text style={styles.markerCoordinates}>
                  {formatCoordinates(selectedMarker.coordinates)}
                </Text>
                {isLoadingAddress ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingText}>Obtendo endereço...</Text>
                  </View>
                ) : (
                  selectedMarker.address && (
                    <Text style={styles.markerAddress} numberOfLines={2}>
                      {selectedMarker.address}
                    </Text>
                  )
                )}
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <MapComponent />

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={handleUseCurrentLocation}
          >
            <Text style={styles.currentLocationButtonText}>
              📍 Usar Minha Localização
            </Text>
          </TouchableOpacity>

          {selectedMarker && (
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedInfoTitle}>Localização Selecionada:</Text>
              <Text style={styles.selectedInfoCoords}>
                {formatCoordinates(selectedMarker.coordinates)}
              </Text>
              {selectedMarker.address && (
                <Text style={styles.selectedInfoAddress} numberOfLines={3}>
                  {selectedMarker.address}
                </Text>
              )}
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.confirmButton,
                !selectedMarker && styles.disabledButton
              ]}
              onPress={handleConfirmLocation}
              disabled={!selectedMarker}
            >
              <Text style={[
                styles.confirmButtonText,
                !selectedMarker && styles.disabledButtonText
              ]}>
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    position: 'relative',
  },
  mapPlaceholder: {
    fontSize: 24,
    marginBottom: 8,
  },
  mapInstructions: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  mapCenter: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  markerInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  markerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  markerCoordinates: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  markerAddress: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  controls: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  currentLocationButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  currentLocationButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '500',
  },
  selectedInfo: {
    backgroundColor: colors.surfaceVariant,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  selectedInfoCoords: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  selectedInfoAddress: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  disabledButtonText: {
    color: colors.textSecondary,
  },
  // Novos estilos para o mapa interativo
  mapGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: colors.border,
    opacity: 0.3,
  },
  horizontalLine: {
    height: 1,
    width: '100%',
  },
  verticalLine: {
    width: 1,
    height: '100%',
  },
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    alignItems: 'center',
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    opacity: 0.7,
  },
  centerLabel: {
    fontSize: 8,
    color: colors.textSecondary,
    marginTop: 2,
  },
  mockStreets: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  street: {
    position: 'absolute',
    backgroundColor: colors.textSecondary,
    opacity: 0.4,
    height: 2,
  },
  mapInstructionsContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  mapCoordinates: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 4,
  },
  selectedMarkerContainer: {
    position: 'absolute',
    top: '40%',
    left: '45%',
    alignItems: 'center',
  },
  selectedMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF4444',
    borderWidth: 3,
    borderColor: colors.surface,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  markerRipple: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF4444',
    opacity: 0.2,
  },
  markerPopup: {
    marginTop: 8,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minWidth: 200,
    maxWidth: 250,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.textSecondary,
  },
});