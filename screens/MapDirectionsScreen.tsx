import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { HealthService, Region } from '../types';
import { MapDirectionsScreenNavigationProp, MapDirectionsScreenRouteProp } from '../types/navigation';
import { Colors, spacing, borderRadius, fontSize } from '../constants';
import { useLocation } from '../hooks/useLocation';

interface MapDirectionsScreenProps {
  navigation: MapDirectionsScreenNavigationProp;
  route: MapDirectionsScreenRouteProp;
}

interface DirectionStep {
  instruction: string;
  distance: string;
  duration: string;
}

export const MapDirectionsScreen: React.FC<MapDirectionsScreenProps> = ({
  navigation,
  route,
}) => {
  const { service } = route.params;
  const { location } = useLocation();
  const [region, setRegion] = useState<Region>({
    latitude: service.coordinates.latitude,
    longitude: service.coordinates.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [directions, setDirections] = useState<DirectionStep[]>([]);
  const [totalDistance, setTotalDistance] = useState<string>('');
  const [totalDuration, setTotalDuration] = useState<string>('');
  const [showDirections, setShowDirections] = useState(false);

  useEffect(() => {
    if (location) {
      // Calcular a região que inclui tanto o usuário quanto o destino
      const minLat = Math.min(location.latitude, service.coordinates.latitude);
      const maxLat = Math.max(location.latitude, service.coordinates.latitude);
      const minLon = Math.min(location.longitude, service.coordinates.longitude);
      const maxLon = Math.max(location.longitude, service.coordinates.longitude);
      
      const latDelta = (maxLat - minLat) * 1.5 || 0.01;
      const lonDelta = (maxLon - minLon) * 1.5 || 0.01;
      
      setRegion({
        latitude: (minLat + maxLat) / 2,
        longitude: (minLon + maxLon) / 2,
        latitudeDelta: Math.max(latDelta, 0.01),
        longitudeDelta: Math.max(lonDelta, 0.01),
      });

      // Simular direções (em uma implementação real, você usaria uma API de rotas)
      generateMockDirections();
    }
  }, [location, service]);

  const generateMockDirections = () => {
    if (!location) return;

    // Simular coordenadas da rota (linha reta simplificada)
    const startLat = location.latitude;
    const startLon = location.longitude;
    const endLat = service.coordinates.latitude;
    const endLon = service.coordinates.longitude;

    // Criar pontos intermediários para simular uma rota
    const steps = 5;
    const coordinates = [];
    for (let i = 0; i <= steps; i++) {
      const lat = startLat + (endLat - startLat) * (i / steps);
      const lon = startLon + (endLon - startLon) * (i / steps);
      coordinates.push({ latitude: lat, longitude: lon });
    }

    setRouteCoordinates(coordinates);

    // Calcular distância aproximada
    const distance = calculateDistance(startLat, startLon, endLat, endLon);
    const duration = Math.round(distance * 3); // Assumir ~20km/h de velocidade média

    setTotalDistance(`${distance.toFixed(1)} km`);
    setTotalDuration(`${duration} min`);

    // Direções simuladas
    setDirections([
      { instruction: 'Siga em frente na sua rua atual', distance: '0.5 km', duration: '2 min' },
      { instruction: 'Vire à direita na próxima esquina', distance: '0.3 km', duration: '1 min' },
      { instruction: `Continue em direção a ${service.address}`, distance: `${(distance - 0.8).toFixed(1)} km`, duration: `${duration - 3} min` },
      { instruction: 'Chegou ao destino', distance: '0 km', duration: '0 min' }
    ]);
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Direções</Text>
          <Text style={styles.headerSubtitle}>{service.name}</Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={true}
          showsMyLocationButton={false}
          followsUserLocation={false}
        >
          {/* Marcador do usuário */}
          {location && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Sua localização"
            >
              <View style={styles.userMarker}>
                <Ionicons name="person" size={20} color={Colors.text.onPrimary} />
              </View>
            </Marker>
          )}

          {/* Marcador do destino */}
          <Marker
            coordinate={service.coordinates}
            title={service.name}
            description={service.address}
          >
            <View style={styles.destinationMarker}>
              <Ionicons 
                name={service.type === 'professional' ? 'person' : 'medical'} 
                size={20} 
                color={Colors.text.onPrimary} 
              />
            </View>
          </Marker>

          {/* Linha da rota */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={Colors.primary}
              strokeWidth={4}
              lineDashPattern={[0]}
            />
          )}
        </MapView>
      </View>

      {/* Informações da rota */}
      <View style={styles.routeInfo}>
        <View style={styles.routeStats}>
          <View style={styles.statItem}>
            <Ionicons name="time" size={20} color={Colors.primary} />
            <Text style={styles.statText}>{totalDuration}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="location" size={20} color={Colors.primary} />
            <Text style={styles.statText}>{totalDistance}</Text>
          </View>
          <TouchableOpacity style={styles.directionsButton} onPress={toggleDirections}>
            <Ionicons name="list" size={20} color={Colors.primary} />
            <Text style={styles.directionsButtonText}>
              {showDirections ? 'Ocultar' : 'Ver'} Direções
            </Text>
          </TouchableOpacity>
        </View>

        {showDirections && (
          <View style={styles.directionsList}>
            {directions.map((step, index) => (
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
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: fontSize.md,
    color: Colors.text.secondary,
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
    color: Colors.text.primary,
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
    color: Colors.text.onPrimary,
  },
  stepInfo: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: fontSize.md,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  stepDistance: {
    fontSize: fontSize.sm,
    color: Colors.text.secondary,
    marginTop: spacing.xs,
  },
});
