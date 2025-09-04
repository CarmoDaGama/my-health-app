import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { HealthService, Region } from '../types';
import { HomeScreenNavigationProp } from '../types/navigation';
import { HealthServiceAPI } from '../services/api';
import { useLocation } from '../hooks/useLocation';
import { MapView } from '../components/specific/MapView';
import { Colors, spacing, borderRadius, fontSize } from '../constants';
import i18n from '../utils/i18n';

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<HealthService[]>([]);
  const [filteredServices, setFilteredServices] = useState<HealthService[]>([]);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: -8.8379,  // Luanda default
    longitude: 13.2894,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  
  const { location, loading: locationLoading, error: locationError } = useLocation();

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (location) {
      loadNearbyServices();
      updateRegionToUserLocation();
    }
  }, [location]);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, services]);

  const loadServices = () => {
    try {
      setLoading(true);
      const allServices = HealthServiceAPI.getAllServices();
      setServices(allServices);
      setFilteredServices(allServices);
    } catch (error) {
      console.error('Error loading services:', error);
      Alert.alert(
        i18n.t('app.errorTitle'),
        i18n.t('app.loadingError')
      );
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyServices = () => {
    if (!location) return;
    
    try {
      const nearbyServices = HealthServiceAPI.getNearbyServices(location, 10);
      setServices(nearbyServices);
      setFilteredServices(searchQuery ? HealthServiceAPI.searchServices(searchQuery) : nearbyServices);
    } catch (error) {
      console.error('Error loading nearby services:', error);
    }
  };

  const updateRegionToUserLocation = () => {
    if (location) {
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredServices(services);
      return;
    }

    const results = HealthServiceAPI.searchServices(searchQuery);
    setFilteredServices(results);
  };

  const handleServicePress = (service: HealthService) => {
    navigation.navigate('ServiceDetail', { service });
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  const handleLocationError = () => {
    Alert.alert(
      i18n.t('app.locationPermission'),
      i18n.t('app.locationPermissionMessage'),
      [
        { text: i18n.t('actions.cancel'), style: 'cancel' },
        { text: i18n.t('actions.ok'), onPress: loadServices },
      ]
    );
  };

  if (locationError) {
    handleLocationError();
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Map View - Full Screen */}
      <View style={styles.mapContainer}>
        <MapView
          region={region}
          services={filteredServices}
          userLocation={location || undefined}
          onServicePress={handleServicePress}
        />
        
        {/* Loading overlay */}
        {(loading || locationLoading) && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>
              {locationLoading ? 'Obtendo localização...' : 'Carregando...'}
            </Text>
          </View>
        )}
      </View>

      {/* Floating Profile Button */}
      <TouchableOpacity style={styles.floatingProfileButton} onPress={handleProfilePress}>
        <Text style={styles.floatingProfileIcon}>👤</Text>
      </TouchableOpacity>

      {/* Bottom Search Bar */}
      <View style={styles.bottomSearchContainer}>
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar serviços de saúde..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.text.secondary}
          />
          <TouchableOpacity style={styles.micButton}>
            <Text style={styles.micIcon}>🎤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  floatingProfileButton: {
    position: 'absolute',
    top: 20,
    right: spacing.lg,
    backgroundColor: Colors.surface,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  floatingProfileIcon: {
    fontSize: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  loadingText: {
    color: Colors.text.onPrimary,
    fontSize: fontSize.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  bottomSearchContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.md,
    right: spacing.md,
    zIndex: 10,
  },
  searchBarContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: Colors.text.primary,
    paddingVertical: spacing.sm,
  },
  micButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.background,
  },
  micIcon: {
    fontSize: 18,
  },
  menuButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.background,
  },
  menuIcon: {
    fontSize: 18,
  },
});
