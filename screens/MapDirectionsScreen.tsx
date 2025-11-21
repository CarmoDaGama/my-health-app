import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { HealthService, Region } from '../types';
import { MapDirectionsScreenNavigationProp, MapDirectionsScreenRouteProp } from '../types/navigation';
import { Colors, spacing, borderRadius, fontSize, ROUTE_PROFILES } from '../constants';
import { useLocation } from '../hooks/useLocation';
import { useTranslation } from '../hooks/useTranslation';
import { RoutingService, RouteResponse, RouteStep } from '../services/routing';

interface MapDirectionsScreenProps {
  navigation: MapDirectionsScreenNavigationProp;
  route: MapDirectionsScreenRouteProp;
}

interface TransportMode {
  id: keyof typeof ROUTE_PROFILES;
  name: string;
  icon: string;
}

export const MapDirectionsScreen: React.FC<MapDirectionsScreenProps> = ({
  navigation,
  route,
}) => {
  const { service } = route.params;
  const { location } = useLocation();
  const { t } = useTranslation();
  const webViewRef = React.useRef<WebView>(null);
  const [region, setRegion] = useState<Region>({
    latitude: service.coordinates.latitude || -8.8379,
    longitude: service.coordinates.longitude || 13.2894,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [selectedMode, setSelectedMode] = useState<keyof typeof ROUTE_PROFILES>('DRIVING');
  const [showDirections, setShowDirections] = useState(false);
  
  const transportModes: TransportMode[] = [
    { id: 'DRIVING', name: 'Carro', icon: 'car' },
    { id: 'WALKING', name: 'A pé', icon: 'walk' },
    { id: 'CYCLING', name: 'Bicicleta', icon: 'bicycle' },
  ];

  useEffect(() => {
    if (location) {
      try {
        // Calcular a região que inclui tanto o usuário quanto o destino
        const minLat = Math.min(location.latitude, service.coordinates.latitude);
        const maxLat = Math.max(location.latitude, service.coordinates.latitude);
        const minLon = Math.min(location.longitude, service.coordinates.longitude);
        const maxLon = Math.max(location.longitude, service.coordinates.longitude);
        
        const latDelta = (maxLat - minLat) * 1.5 || 0.05;
        const lonDelta = (maxLon - minLon) * 1.5 || 0.05;
        
        setRegion({
          latitude: (minLat + maxLat) / 2,
          longitude: (minLon + maxLon) / 2,
          latitudeDelta: Math.max(latDelta, 0.01),
          longitudeDelta: Math.max(lonDelta, 0.01),
        });

        // Obter rota real
        fetchRoute();
      } catch (error) {
        console.log('Error setting region:', error);
        // Fallback para coordenadas padrão de Luanda
        setRegion({
          latitude: -8.8379,
          longitude: 13.2894,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } else {
      // Se não temos localização, centramos no destino
      setRegion({
        latitude: service.coordinates.latitude || -8.8379,
        longitude: service.coordinates.longitude || 13.2894,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [location, service]);

  const fetchRoute = async (transportMode?: keyof typeof ROUTE_PROFILES) => {
    if (!location) {
      Alert.alert(
        'Localização Necessária',
        'Não foi possível obter sua localização. Verifique se o GPS está ativado.',
        [{ text: t('common.ok') || 'OK' }]
      );
      return;
    }

    const modeToUse = transportMode || selectedMode;
    
    setIsLoadingRoute(true);
    try {
      console.log('Iniciando busca de rota...');
      console.log('Origem:', location.latitude, location.longitude);
      console.log('Destino:', service.coordinates.latitude, service.coordinates.longitude);
      console.log('Modo:', modeToUse);
      
      const route = await RoutingService.getRoute(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: service.coordinates.latitude, longitude: service.coordinates.longitude },
        modeToUse
      );
      
      console.log('Rota obtida com sucesso:', route.distance, route.duration);
      setRouteData(route);
    } catch (error) {
      console.error('Erro ao obter rota:', error);
      
      // Mostrar erro específico baseado no tipo
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (errorMessage.includes('403') || errorMessage.includes('401')) {
        Alert.alert(
          'Service Temporarily Unavailable',
          'The routing service is temporarily unavailable. An approximate route will be displayed.',
          [{ text: 'Entendi' }]
        );
      } else if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
        Alert.alert(
          'Problema de Conexão',
          'Verifique sua conexão com a internet. Uma rota aproximada será exibida.',
          [{ text: t('common.ok') || 'OK' }]
        );
      } else {
        Alert.alert(
          'Aviso',
          'Exibindo rota aproximada. Para rotas precisas, verifique sua conexão.',
          [{ text: t('common.ok') || 'OK' }]
        );
      }
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleDirections = () => {
    setShowDirections(!showDirections);
  };

  const handleModeChange = (mode: keyof typeof ROUTE_PROFILES) => {
    if (mode !== selectedMode) {
      console.log(`🚀 Mudando modo de transporte: ${selectedMode} → ${mode}`);
      setSelectedMode(mode);
      // Recalcular a rota com o novo modo de transporte
      fetchRoute(mode);
    }
  };

  const generateMapHTML = () => {
    const userLat = location?.latitude || -8.8379;
    const userLng = location?.longitude || 13.2894;
    const destLat = service.coordinates.latitude;
    const destLng = service.coordinates.longitude;
    
    // Calcular centro e zoom
    const centerLat = (userLat + destLat) / 2;
    const centerLng = (userLng + destLng) / 2;
    
    // Preparar coordenadas da rota
    const routeCoordinates = routeData?.coordinates || [
      { latitude: userLat, longitude: userLng },
      { latitude: destLat, longitude: destLng }
    ];
    
    const routePoints = routeCoordinates.map(coord => `[${coord.latitude}, ${coord.longitude}]`).join(', ');
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100vw; }
            .user-marker {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: #4285f4;
                border: 3px solid white;
                box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.3);
            }
            .dest-marker {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background-color: #ea4335;
                border: 3px solid white;
                box-shadow: 0 0 0 2px rgba(234, 67, 53, 0.3);
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <script>
            // Inicializar mapa
            const map = L.map('map').setView([${centerLat}, ${centerLng}], 13);
            
            // Adicionar tiles do OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            // Marcador do usuário
            const userIcon = L.divIcon({
                className: 'user-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            
            L.marker([${userLat}, ${userLng}], { icon: userIcon })
                .addTo(map)
                .bindPopup('Sua localização');
            
            // Marcador do destino
            const destIcon = L.divIcon({
                className: 'dest-marker',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
            
            L.marker([${destLat}, ${destLng}], { icon: destIcon })
                .addTo(map)
                .bindPopup('${service.name}<br>${service.address}');
            
            // Linha da rota (usando coordenadas reais da API)
            const routeLine = L.polyline([
                ${routePoints}
            ], {
                color: '#2E7D32',
                weight: 4,
                opacity: 0.8,
                smoothFactor: 1
            }).addTo(map);
            
            // Ajustar zoom para mostrar toda a rota
            const group = new L.featureGroup([
                L.marker([${userLat}, ${userLng}]),
                L.marker([${destLat}, ${destLng}])
            ]);
            map.fitBounds(group.getBounds().pad(0.1));
        </script>
    </body>
    </html>
    `;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{t('directions.title')}</Text>
          <Text style={styles.headerSubtitle}>{service.name}</Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          style={styles.map}
          source={{ html: generateMapHTML() }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
        />
      </View>

      {/* Seleção do modo de transporte */}
      <View style={styles.transportModes}>
        {transportModes.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[
              styles.modeButton,
              selectedMode === mode.id && styles.modeButtonActive,
              isLoadingRoute && styles.modeButtonDisabled
            ]}
            onPress={() => handleModeChange(mode.id)}
            disabled={isLoadingRoute}
          >
            <Ionicons 
              name={mode.icon as any} 
              size={20} 
              color={
                isLoadingRoute 
                  ? Colors.textSecondary 
                  : selectedMode === mode.id 
                    ? Colors.textOnPrimary 
                    : Colors.primary
              } 
            />
            <Text style={[
              styles.modeButtonText,
              selectedMode === mode.id && styles.modeButtonTextActive,
              isLoadingRoute && styles.modeButtonTextDisabled
            ]}>
              {mode.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Loading indicator */}
      {isLoadingRoute && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>
            Recalculando rota para {transportModes.find(m => m.id === selectedMode)?.name.toLowerCase()}...
          </Text>
        </View>
      )}

      {/* Informações da rota */}
      <View style={styles.routeInfo}>
        <View style={styles.routeStats}>
          <View style={styles.statItem}>
            <Ionicons name="time" size={20} color={Colors.primary} />
            <Text style={styles.statText}>{routeData?.duration || '--'}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="location" size={20} color={Colors.primary} />
            <Text style={styles.statText}>{routeData?.distance || '--'}</Text>
          </View>
          <TouchableOpacity style={styles.directionsButton} onPress={toggleDirections}>
            <Ionicons name="list" size={20} color={Colors.primary} />
            <Text style={styles.directionsButtonText}>
              {showDirections ? t('directions.hide') : t('directions.show')} {t('directions.title')}
            </Text>
          </TouchableOpacity>
        </View>

        {showDirections && routeData?.steps && (
          <View style={styles.directionsList}>
            {routeData.steps.map((step: RouteStep, index: number) => (
              <View key={index} style={styles.directionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepInstruction}>{step.instruction}</Text>
                  <Text style={styles.stepDistance}>
                    {step.distance} • {step.duration}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  userMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  destinationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  routeInfo: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  routeStats: {
    flexDirection: 'row',
    padding: spacing.lg,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: spacing.sm,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: borderRadius.md,
  },
  directionsButtonText: {
    fontSize: fontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  directionsList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    maxHeight: 200,
  },
  directionStep: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: Colors.textOnPrimary,
  },
  stepInfo: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: fontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
  stepDistance: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  transportModes: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
  },
  modeButtonText: {
    fontSize: fontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  modeButtonTextActive: {
    color: Colors.textOnPrimary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: Colors.surface,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginLeft: spacing.sm,
  },
  modeButtonDisabled: {
    opacity: 0.5,
    backgroundColor: Colors.background,
  },
  modeButtonTextDisabled: {
    color: Colors.textSecondary,
  },
});
