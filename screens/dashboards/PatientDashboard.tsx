import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, spacing, borderRadius, fontSize } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth-firebase';
import { HealthService, Region } from '../../types';
import { HealthServiceAPIFirebase } from '../../services/api-firebase';
import { MapView } from '../../components/specific/MapView';

const { width, height } = Dimensions.get('window');

export const PatientDashboard: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  
  const [allServices, setAllServices] = useState<HealthService[]>([]);
  const [filteredServices, setFilteredServices] = useState<HealthService[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);

  useEffect(() => {
    loadServices();
    getUserLocation();
  }, []);

  useEffect(() => {
    // Atualizar região do mapa quando os serviços filtrados ou pesquisa mudam
    const newRegion = getInitialRegion();
    setMapRegion(newRegion);
  }, [filteredServices, searchQuery, userLocation]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const servicesResult = await HealthServiceAPIFirebase.getAllServices();
      const services = servicesResult?.services || [];
      setAllServices(Array.isArray(services) ? services : []);
      setFilteredServices(Array.isArray(services) ? services : []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      setAllServices([]);
      setFilteredServices([]);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = async () => {
    // Por enquanto, usar localização padrão (Luanda, Angola)
    setUserLocation({
      latitude: -8.8383,
      longitude: 13.2344
    });
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (!text.trim()) {
      setFilteredServices(allServices);
      return;
    }

    const query = text.toLowerCase();
    const filtered = allServices.filter(service => 
      service.name.toLowerCase().includes(query) ||
      service.specialty?.toLowerCase().includes(query) ||
      service.type.toLowerCase().includes(query) ||
      service.description?.toLowerCase().includes(query)
    );
    
    setFilteredServices(filtered);
  };

  const handleServicePress = (service: HealthService) => {
    navigation.navigate('ServiceDetail', { service } as any);
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile' as any);
  };

  const getInitialRegion = (): Region => {
    // Se há pesquisa ativa e serviços filtrados, centralizar nos serviços encontrados
    if (searchQuery.trim() && filteredServices.length > 0) {
      const latitudes = filteredServices.map(s => s.coordinates.latitude);
      const longitudes = filteredServices.map(s => s.coordinates.longitude);
      
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);
      
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      
      const latDelta = (maxLat - minLat) * 1.5;
      const lngDelta = (maxLng - minLng) * 1.5;
      
      return {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: Math.max(latDelta, 0.05),
        longitudeDelta: Math.max(lngDelta, 0.05),
      };
    }

    // Se não há pesquisa ativa, priorizar localização do usuário
    if (userLocation && !searchQuery.trim()) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    // Se há serviços mas sem pesquisa específica, mostrar todos os serviços
    if (filteredServices.length > 0) {
      const latitudes = filteredServices.map(s => s.coordinates.latitude);
      const longitudes = filteredServices.map(s => s.coordinates.longitude);
      
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);
      
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      
      const latDelta = (maxLat - minLat) * 1.5;
      const lngDelta = (maxLng - minLng) * 1.5;
      
      return {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: Math.max(latDelta, 0.05),
        longitudeDelta: Math.max(lngDelta, 0.05),
      };
    }

    // Localização padrão (Luanda, Angola)
    return {
      latitude: -8.8383,
      longitude: 13.2344,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading') || 'Carregando...'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Mapa */}
      <View style={styles.mapContainer}>
        {mapRegion && (
          <MapView
            services={filteredServices}
            region={mapRegion}
            onServicePress={handleServicePress}
            userLocation={userLocation || undefined}
          />
        )}
      </View>

      {/* Barra de pesquisa na parte inferior */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('app.searchPlaceholder') || 'Buscar serviços de saúde...'}
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Contador de resultados */}
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            {filteredServices.length} {t('app.servicesFound') || 'serviços encontrados'}
          </Text>
          <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
            <Ionicons name="person-circle" size={28} color={Colors.primary} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: Colors.textSecondary,
  },
  mapContainer: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    padding: spacing.md,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: Colors.text,
    padding: 0,
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  resultsText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  profileButton: {
    padding: spacing.xs,
  },
});
