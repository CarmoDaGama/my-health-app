import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { HealthService, Coordinates, Region } from '../types';
import { MapScreenNavigationProp, MapScreenRouteProp } from '../types/navigation';
import { MapView } from '../components/specific/MapView';
import { Colors } from '../constants';

interface MapScreenProps {
  navigation: MapScreenNavigationProp;
  route: MapScreenRouteProp;
}

export const MapScreen: React.FC<MapScreenProps> = ({ navigation, route }) => {
  const { services, userLocation } = route.params;

  // Calcular região inicial baseada nos serviços ou localização do usuário
  const getInitialRegion = (): Region => {
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    if (services.length > 0) {
      // Calcular centro dos serviços
      const latitudes = services.map(s => s.coordinates.latitude);
      const longitudes = services.map(s => s.coordinates.longitude);
      
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);
      
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      
      const latDelta = Math.max(maxLat - minLat, 0.01) * 1.2;
      const lngDelta = Math.max(maxLng - minLng, 0.01) * 1.2;
      
      return {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      };
    }

    // Região padrão (São Paulo)
    return {
      latitude: -23.5505,
      longitude: -46.6333,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
  };

  const handleServicePress = (service: HealthService) => {
    navigation.navigate('ServiceDetail', { service });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primary} />
      
      <View style={styles.mapContainer}>
        <MapView
          region={getInitialRegion()}
          services={services}
          userLocation={userLocation}
          onServicePress={handleServicePress}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapContainer: {
    flex: 1,
  },
});
