import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
  FlatList,
} from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
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

type TabType = 'profissionais' | 'instituicoes' | 'mais';

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<HealthService[]>([]);
  const [filteredServices, setFilteredServices] = useState<HealthService[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesVisible, setCategoriesVisible] = useState(false);
  const [isFullScreenMode, setIsFullScreenMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('profissionais');
  const [region, setRegion] = useState<Region>({
    latitude: -8.8379,  // Luanda default
    longitude: 13.2894,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  
  // Animation refs
  const translateY = useRef(new Animated.Value(0)).current;
  const categoriesHeight = useRef(new Animated.Value(0)).current;
  
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

  const handleProfessionalsPress = () => {
    setActiveTab('profissionais');
    setIsFullScreenMode(true);
  };

  const handleInstitutionsPress = () => {
    setActiveTab('instituicoes');
    setIsFullScreenMode(true);
  };

  const handleMorePress = () => {
    setActiveTab('mais');
    setIsFullScreenMode(true);
  };

  const closeFullScreenMode = () => {
    setIsFullScreenMode(false);
  };

  const getTabData = () => {
    switch (activeTab) {
      case 'profissionais':
        return services.filter(service => 
          service.type === 'clinic' || service.name.toLowerCase().includes('dr.')
        );
      case 'instituicoes':
        return services.filter(service => 
          service.type === 'hospital' || service.type === 'emergency'
        );
      case 'mais':
        return services.filter(service => 
          service.type === 'laboratory'
        );
      default:
        return services;
    }
  };

  const renderTabContent = () => {
    const data = getTabData();
    
    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.listItem}
            onPress={() => handleServicePress(item)}
          >
            <View style={styles.serviceIconContainer}>
              <Text style={styles.serviceIcon}>
                {item.type === 'hospital' ? '🏥' : 
                 item.type === 'clinic' ? '👨‍⚕️' : 
                 item.type === 'emergency' ? '🚑' : '🔬'}
              </Text>
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{item.name}</Text>
              <Text style={styles.serviceAddress}>{item.address}</Text>
              <Text style={styles.serviceDistance}>
                2.3 km
              </Text>
            </View>
            <View style={styles.serviceRating}>
              <Text style={styles.ratingText}>⭐ 4.5</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const toggleCategories = () => {
    const toValue = categoriesVisible ? 0 : 80; // 80px height for categories
    setCategoriesVisible(!categoriesVisible);
    
    Animated.timing(categoriesHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    const { translationY } = event.nativeEvent;
    
    // Drag up to show categories, drag down to hide
    if (translationY < -20 && !categoriesVisible) {
      toggleCategories();
    } else if (translationY > 20 && categoriesVisible) {
      toggleCategories();
    }
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

      {isFullScreenMode ? (
        /* Full Screen Tab Mode */
        <View style={styles.fullScreenContainer}>
          {/* Top Bar with Search and Categories */}
          <View style={styles.fullScreenTopBar}>
            <TouchableOpacity style={styles.backButton} onPress={closeFullScreenMode}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            
            <View style={styles.fullScreenSearchContainer}>
              <TextInput
                style={styles.fullScreenSearchInput}
                placeholder="Pesquisar serviços de saúde..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={Colors.text.secondary}
              />
              <TouchableOpacity style={styles.micButton}>
                <Text style={styles.micIcon}>🎤</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'profissionais' && styles.activeTabButton]}
              onPress={() => setActiveTab('profissionais')}
            >
              <View style={styles.tabIconContainer}>
                <Text style={styles.tabIcon}>👨‍⚕️</Text>
              </View>
              <Text style={[styles.tabText, activeTab === 'profissionais' && styles.activeTabText]}>
                Profissionais
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'instituicoes' && styles.activeTabButton]}
              onPress={() => setActiveTab('instituicoes')}
            >
              <View style={styles.tabIconContainer}>
                <Text style={styles.tabIcon}>🏥</Text>
              </View>
              <Text style={[styles.tabText, activeTab === 'instituicoes' && styles.activeTabText]}>
                Instituições
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'mais' && styles.activeTabButton]}
              onPress={() => setActiveTab('mais')}
            >
              <View style={styles.tabIconContainer}>
                <Text style={styles.tabIcon}>⋯</Text>
              </View>
              <Text style={[styles.tabText, activeTab === 'mais' && styles.activeTabText]}>
                Mais
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContentContainer}>
            {renderTabContent()}
          </View>
        </View>
      ) : (
        /* Normal Map Mode */
        <>
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

          {/* Full Width Bottom Bar */}
          <PanGestureHandler onGestureEvent={onGestureEvent}>
            <Animated.View style={styles.fullWidthBottomContainer}>
              <View style={styles.unifiedBarContainer}>
                {/* Search Row */}
                <TouchableOpacity style={styles.dragIndicator} onPress={toggleCategories}>
                  <View style={styles.dragHandle} />
                </TouchableOpacity>
                
                <View style={styles.searchRowContainer}>
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

                {/* Categories Row - Animated */}
                <Animated.View style={[styles.categoriesContainer, { height: categoriesHeight }]}>
                  <View style={styles.categoriesRowContainer}>
                    <TouchableOpacity style={styles.categoryButton} onPress={handleProfessionalsPress}>
                      <View style={styles.categoryIconContainer}>
                        <Text style={styles.categoryIcon}>👨‍⚕️</Text>
                      </View>
                      <Text style={styles.categoryText} numberOfLines={1}>Profissionais</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.categoryButton} onPress={handleInstitutionsPress}>
                      <View style={styles.categoryIconContainer}>
                        <Text style={styles.categoryIcon}>🏥</Text>
                      </View>
                      <Text style={styles.categoryText} numberOfLines={1}>Instituições</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.categoryButton} onPress={handleMorePress}>
                      <View style={styles.categoryIconContainer}>
                        <Text style={styles.categoryIcon}>⋯</Text>
                      </View>
                      <Text style={styles.categoryText} numberOfLines={1}>Mais</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </View>
            </Animated.View>
          </PanGestureHandler>
        </>
      )}
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
  fullWidthBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  unifiedBarContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dragIndicator: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  searchRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: Colors.text.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.background,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  micButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.background,
    marginRight: spacing.sm,
  },
  micIcon: {
    fontSize: 18,
  },
  menuButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.background,
  },
  menuIcon: {
    fontSize: 18,
  },
  categoriesContainer: {
    overflow: 'hidden',
  },
  categoriesRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    maxWidth: 120, // Limita a largura para evitar sobreposição
  },
  categoryIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  categoryIcon: {
    fontSize: 14,
    color: Colors.text.onPrimary,
  },
  categoryText: {
    fontSize: fontSize.sm,
    color: Colors.text.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Full Screen Mode Styles
  fullScreenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  fullScreenTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: spacing.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  fullScreenSearchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullScreenSearchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: Colors.text.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.background,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  activeTabButton: {
    backgroundColor: Colors.primary,
  },
  tabIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabText: {
    fontSize: fontSize.sm,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.text.onPrimary,
  },
  tabContentContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // List Styles
  listContainer: {
    padding: spacing.lg,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  serviceIcon: {
    fontSize: 24,
    color: Colors.text.onPrimary,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: spacing.xs,
  },
  serviceAddress: {
    fontSize: fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: spacing.xs,
  },
  serviceDistance: {
    fontSize: fontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  serviceRating: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  ratingText: {
    fontSize: fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
});
