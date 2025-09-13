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
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
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

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
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
  const [mapOptimizing, setMapOptimizing] = useState(false);
  
  // Animation refs
  const translateY = useRef(new Animated.Value(0)).current;
  const categoriesHeight = useRef(new Animated.Value(0)).current;
  const fullScreenOpacity = useRef(new Animated.Value(0)).current;
  
  const { location, loading: locationLoading, error: locationError } = useLocation();

  useEffect(() => {
    loadServices();
  }, []);

  // Atualizar região quando localização ou serviços mudarem
  useEffect(() => {
    updateMapRegion();
  }, [location, services]);

  useEffect(() => {
    filterServices();
  }, [searchQuery, services]);

  // Atualizar região do mapa quando os serviços filtrados mudarem
  useEffect(() => {
    if (filteredServices.length > 0 && searchQuery.trim()) {
      // Se há busca ativa, centralizar nos resultados filtrados
      const filteredRegion = findCenterOfServices(filteredServices);
      setRegion(filteredRegion);
    }
  }, [filteredServices]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = HealthServiceAPI.getAllServices();
      setServices(data);
    } catch (error) {
      Alert.alert(
        i18n.t('error.title'),
        i18n.t('error.loadingServices')
      );
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    if (!searchQuery.trim()) {
      setFilteredServices(services);
      return;
    }

    const filtered = services.filter(service =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredServices(filtered);
  };

  // Função para calcular distância entre dois pontos
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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

  // Função para encontrar o centro com maior densidade de serviços
  const findOptimalMapCenter = (): { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } => {
    if (services.length === 0) {
      // Fallback para Luanda se não há serviços
      return {
        latitude: -8.8379,
        longitude: 13.2894,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    // Filtrar apenas profissionais e instituições relevantes
    const relevantServices = services.filter(service => 
      service.type === 'professional' || 
      service.type === 'hospital' || 
      service.type === 'clinic' || 
      service.type === 'emergency'
    );

    if (relevantServices.length === 0) {
      // Se não há serviços relevantes, usar todos os serviços
      return findCenterOfServices(services);
    }

    // Priorizar serviços com melhor avaliação
    const highQualityServices = relevantServices.filter(service => 
      service.rating && service.rating >= 4.0
    );

    // Se temos localização do usuário, priorizar serviços próximos
    if (location) {
      const nearbyServices = relevantServices.filter(service => {
        const distance = calculateDistance(
          location.latitude, 
          location.longitude, 
          service.coordinates.latitude, 
          service.coordinates.longitude
        );
        return distance <= 10; // 10km de raio
      });

      // Priorizar serviços próximos e com boa avaliação
      const nearbyQualityServices = nearbyServices.filter(service => 
        service.rating && service.rating >= 3.5
      );

      if (nearbyQualityServices.length >= 2) {
        console.log(`🎯 Centralizando em ${nearbyQualityServices.length} serviços próximos e bem avaliados`);
        return findCenterOfServices(nearbyQualityServices);
      } else if (nearbyServices.length >= 3) {
        console.log(`📍 Centralizando em ${nearbyServices.length} serviços próximos`);
        return findCenterOfServices(nearbyServices);
      } else if (nearbyServices.length > 0) {
        // Se há poucos serviços próximos, incluir mais um pouco da área
        const center = findCenterOfServices(nearbyServices);
        console.log(`🔍 Expandindo área para mostrar ${nearbyServices.length} serviços próximos`);
        return {
          ...center,
          latitudeDelta: 0.08, // Área ligeiramente maior
          longitudeDelta: 0.08,
        };
      }
    }

    // Se há serviços de alta qualidade, priorizá-los
    if (highQualityServices.length >= 5) {
      console.log(`⭐ Centralizando em ${highQualityServices.length} serviços bem avaliados`);
      return findCenterOfServices(highQualityServices);
    }

    // Algoritmo de clustering simples para encontrar área com maior densidade
    const clusters = findServiceClusters(relevantServices);
    const bestCluster = clusters.reduce((max, cluster) => {
      // Considerar tanto quantidade quanto qualidade
      const maxScore = max.services.length + (max.services.filter(s => s.rating && s.rating >= 4.0).length * 0.5);
      const clusterScore = cluster.services.length + (cluster.services.filter(s => s.rating && s.rating >= 4.0).length * 0.5);
      return clusterScore > maxScore ? cluster : max;
    });

    console.log(`🏘️ Centralizando no cluster com ${bestCluster.services.length} serviços`);
    return findCenterOfServices(bestCluster.services);
  };

  // Função para agrupar serviços por proximidade
  const findServiceClusters = (serviceList: HealthService[]) => {
    const clusters: { center: { lat: number; lng: number }; services: HealthService[] }[] = [];
    const clusterRadius = 3; // 3km de raio para clustering

    serviceList.forEach(service => {
      let addedToCluster = false;

      // Tentar adicionar a um cluster existente
      for (const cluster of clusters) {
        const distance = calculateDistance(
          cluster.center.lat,
          cluster.center.lng,
          service.coordinates.latitude,
          service.coordinates.longitude
        );

        if (distance <= clusterRadius) {
          cluster.services.push(service);
          // Recalcular centro do cluster
          const avgLat = cluster.services.reduce((sum, s) => sum + s.coordinates.latitude, 0) / cluster.services.length;
          const avgLng = cluster.services.reduce((sum, s) => sum + s.coordinates.longitude, 0) / cluster.services.length;
          cluster.center = { lat: avgLat, lng: avgLng };
          addedToCluster = true;
          break;
        }
      }

      // Se não foi adicionado a nenhum cluster, criar um novo
      if (!addedToCluster) {
        clusters.push({
          center: { lat: service.coordinates.latitude, lng: service.coordinates.longitude },
          services: [service]
        });
      }
    });

    return clusters;
  };

  // Função para encontrar o centro geográfico de uma lista de serviços
  const findCenterOfServices = (serviceList: HealthService[]) => {
    if (serviceList.length === 0) {
      return {
        latitude: -8.8379,
        longitude: 13.2894,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    // Calcular centro médio
    const avgLat = serviceList.reduce((sum, service) => sum + service.coordinates.latitude, 0) / serviceList.length;
    const avgLng = serviceList.reduce((sum, service) => sum + service.coordinates.longitude, 0) / serviceList.length;

    // Calcular bounds para determinar zoom apropriado
    const latitudes = serviceList.map(s => s.coordinates.latitude);
    const longitudes = serviceList.map(s => s.coordinates.longitude);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    // Adicionar padding para melhor visualização
    const latPadding = (maxLat - minLat) * 0.3 || 0.02;
    const lngPadding = (maxLng - minLng) * 0.3 || 0.02;

    return {
      latitude: avgLat,
      longitude: avgLng,
      latitudeDelta: Math.max((maxLat - minLat) + latPadding, 0.01),
      longitudeDelta: Math.max((maxLng - minLng) + lngPadding, 0.01),
    };
  };

  // Função principal para atualizar a região do mapa
  const updateMapRegion = async () => {
    if (services.length === 0) {
      return; // Aguardar carregar os serviços
    }

    setMapOptimizing(true);
    
    // Pequeno delay para mostrar o indicador
    await new Promise(resolve => setTimeout(resolve, 300));

    console.log('🗺️ Calculando região otimizada do mapa...');
    console.log(`📊 Total de serviços: ${services.length}`);
    
    const optimalRegion = findOptimalMapCenter();
    
    const relevantServicesCount = services.filter(service => 
      service.type === 'professional' || 
      service.type === 'hospital' || 
      service.type === 'clinic' || 
      service.type === 'emergency'
    ).length;
    
    console.log('📍 Nova região:', {
      lat: optimalRegion.latitude.toFixed(4),
      lng: optimalRegion.longitude.toFixed(4),
      zoom: `${optimalRegion.latitudeDelta.toFixed(3)}°`,
      relevantServices: relevantServicesCount
    });

    setRegion(optimalRegion);
    setMapOptimizing(false);
  };

  const handleServicePress = (service: HealthService) => {
    navigation.navigate('ServiceDetail', { service });
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  const handleToggleCategories = () => {
    setCategoriesVisible(!categoriesVisible);
  };

  // Animation effects
  useEffect(() => {
    Animated.timing(categoriesHeight, {
      toValue: categoriesVisible ? 80 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [categoriesVisible]);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isFullScreenMode ? -Dimensions.get('window').height : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(fullScreenOpacity, {
      toValue: isFullScreenMode ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isFullScreenMode]);

  // Tab navigation handlers
  const handleProfessionalsPress = () => {
    setIsFullScreenMode(true);
    setActiveTab('profissionais');
  };

  const handleInstitutionsPress = () => {
    setIsFullScreenMode(true);
    setActiveTab('instituicoes');
  };

  const handleMorePress = () => {
    setIsFullScreenMode(true);
    setActiveTab('mais');
  };

  const handleBackPress = () => {
    setIsFullScreenMode(false);
    // Reset search when going back
    setSearchQuery('');
  };

  const getTabData = () => {
    let filteredData: HealthService[] = [];
    
    switch (activeTab) {
      case 'profissionais':
        // Filtra apenas profissionais
        filteredData = services.filter(service => 
          service.type === 'professional'
        );
        break;
      case 'instituicoes':
        // Filtra apenas instituições de Luanda, Angola
        filteredData = services.filter(service => 
          (service.type === 'hospital' || 
           service.type === 'clinic' || 
           service.type === 'emergency') &&
          service.city === 'Luanda' &&
          service.country === 'Angola'
        );
        break;
      case 'mais':
        // Filtra laboratórios, farmácias e outros serviços de Luanda
        filteredData = services.filter(service => 
          (service.type === 'laboratory' || 
           service.type === 'pharmacy') &&
          service.city === 'Luanda' &&
          service.country === 'Angola'
        );
        break;
      default:
        filteredData = services;
    }
    
    return filteredData;
  };

  const renderTabContent = () => {
    const data = getTabData();
    
    if (data.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            Nenhum serviço encontrado
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Tente carregar os dados novamente ou verifique sua conexão
          </Text>
        </View>
      );
    }

    const getTabTitle = () => {
      switch (activeTab) {
        case 'profissionais':
          return 'Profissionais de Saúde';
        case 'instituicoes':
          return 'Instituições de Saúde';
        case 'mais':
          return 'Outros Serviços';
        default:
          return 'Serviços de Saúde';
      }
    };

    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.listHeaderContainer}>
            <Text style={styles.listHeaderTitle}>
              {getTabTitle()}
            </Text>
            <Text style={styles.listHeaderSubtitle}>
              {data.length} {data.length === 1 ? 'serviço encontrado' : 'serviços encontrados'}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.listItem}
            onPress={() => handleServicePress(item)}
          >
            <View style={styles.serviceIconContainer}>
              <Ionicons 
                name={
                  item.type === 'professional' ? 'person' :
                  item.type === 'hospital' ? 'medical' : 
                  item.type === 'clinic' ? 'medical-outline' : 
                  item.type === 'emergency' ? 'pulse' : 
                  item.type === 'laboratory' ? 'flask' : 
                  item.type === 'pharmacy' ? 'medical' : 'fitness'
                } 
                size={24} 
                color={Colors.text.onPrimary} 
              />
            </View>
            <View style={styles.serviceInfo}>
              {item.type === 'professional' ? (
                // Layout para profissionais
                <>
                  <Text style={styles.serviceName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.serviceSpecialty}>
                    {item.specialty}
                  </Text>
                  <Text style={styles.serviceClinic} numberOfLines={1}>
                    {item.clinic}
                  </Text>
                  <Text style={styles.serviceAddress} numberOfLines={1}>
                    {item.address}
                  </Text>
                  {item.rating && (
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.ratingText}>
                        {item.rating} ({item.reviews} avaliações)
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                // Layout para instituições
                <>
                  <Text style={styles.serviceName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.serviceType}>
                    {item.type === 'hospital' ? 'Hospital' :
                     item.type === 'clinic' ? 'Clínica' :
                     item.type === 'emergency' ? 'Emergência' :
                     item.type === 'laboratory' ? 'Laboratório' :
                     item.type === 'pharmacy' ? 'Farmácia' : 'Serviço de Saúde'}
                  </Text>
                  <Text style={styles.serviceAddress} numberOfLines={1}>
                    {item.address}
                  </Text>
                  {item.rating && (
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.ratingText}>
                        {item.rating}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
            <View style={styles.serviceActions}>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
            </View>
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Full Screen Mode */}
      {isFullScreenMode ? (
        <Animated.View style={[styles.fullScreenContainer, { opacity: fullScreenOpacity }]}>
          <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
          {/* Top Bar with Back Button and Search */}
          <View style={styles.fullScreenTopBar}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <View style={styles.fullScreenSearchContainer}>
              <TextInput
                style={styles.fullScreenSearchInput}
                placeholder="Pesquisar serviços de saúde..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={Colors.text.secondary}
              />
            </View>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'profissionais' && styles.activeTabButton]}
              onPress={() => setActiveTab('profissionais')}
            >
              <View style={styles.tabIconContainer}>
                <Ionicons 
                  name="people" 
                  size={20} 
                  color={activeTab === 'profissionais' ? Colors.primary : Colors.text.primary} 
                />
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
                <Ionicons 
                  name="business" 
                  size={20} 
                  color={activeTab === 'instituicoes' ? Colors.primary : Colors.text.primary} 
                />
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
                <Ionicons 
                  name="medical" 
                  size={20} 
                  color={activeTab === 'mais' ? Colors.primary : Colors.text.primary} 
                />
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
        </Animated.View>
      ) : (
        <>
          <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
          
          {/* Map View */}
          <View style={styles.mapContainer}>
            <MapView 
              region={region}
              services={filteredServices}
              onServicePress={handleServicePress}
            />
            
            {/* Map Optimization Indicator */}
            {mapOptimizing && (
              <View style={styles.mapOptimizingContainer}>
                <View style={styles.mapOptimizingContent}>
                  <Ionicons name="location" size={20} color={Colors.primary} />
                  <Text style={styles.mapOptimizingText}>
                    Otimizando visualização...
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Bottom Search Bar */}
          <Animated.View style={[styles.bottomBar, { transform: [{ translateY }] }]}>
            <View style={styles.searchBarContainer}>
              <View style={styles.searchInputContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Pesquisar serviços de saúde..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor={Colors.text.secondary}
                />
                <TouchableOpacity style={styles.menuButton} onPress={handleProfilePress}>
                  <Ionicons name="person" size={20} color={Colors.text.primary} />
                </TouchableOpacity>
              </View>

              {/* Categories Toggle Button */}
              <TouchableOpacity 
                style={styles.categoriesToggle} 
                onPress={handleToggleCategories}
              >
                <Ionicons 
                  name={categoriesVisible ? "chevron-down" : "chevron-up"} 
                  size={20} 
                  color={Colors.text.primary} 
                />
                <Text style={styles.categoriesToggleText}>Categorias</Text>
              </TouchableOpacity>

              {/* Categories Row - Animated */}
              <Animated.View style={[styles.categoriesContainer, { height: categoriesHeight }]}>
                <View style={styles.categoriesRowContainer}>
                  <TouchableOpacity style={styles.categoryButton} onPress={handleProfessionalsPress}>
                    <View style={styles.categoryIconContainer}>
                      <Ionicons name="people" size={16} color={Colors.text.onPrimary} />
                    </View>
                    <Text style={styles.categoryText} numberOfLines={1}>Profissionais</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.categoryButton} onPress={handleInstitutionsPress}>
                    <View style={styles.categoryIconContainer}>
                      <Ionicons name="business" size={16} color={Colors.text.onPrimary} />
                    </View>
                    <Text style={styles.categoryText} numberOfLines={1}>Instituições</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.categoryButton} onPress={handleMorePress}>
                    <View style={styles.categoryIconContainer}>
                      <Ionicons name="medical" size={16} color={Colors.text.onPrimary} />
                    </View>
                    <Text style={styles.categoryText} numberOfLines={1}>Mais</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </Animated.View>
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  searchBarContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: Colors.text.primary,
  },
  menuButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  categoriesContainer: {
    overflow: 'hidden',
  },
  categoriesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  categoriesToggleText: {
    fontSize: fontSize.sm,
    color: Colors.text.primary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  categoriesRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    marginHorizontal: spacing.xs,
    backgroundColor: Colors.background,
    borderRadius: borderRadius.lg,
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
  categoryText: {
    fontSize: fontSize.sm,
    color: Colors.text.primary,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  // Full Screen Mode Styles
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    zIndex: 1000,
  },
  fullScreenTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: Constants.statusBarHeight + spacing.md,
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
    paddingHorizontal: spacing.md,
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
    marginHorizontal: spacing.xs,
  },
  activeTabButton: {
    backgroundColor: 'transparent',
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
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
  tabText: {
    fontSize: fontSize.sm,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
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
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
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
  serviceType: {
    fontSize: fontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  serviceAddress: {
    fontSize: fontSize.sm,
    color: Colors.text.secondary,
  },
  serviceActions: {
    marginLeft: spacing.md,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyStateText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  fallbackHeaderContainer: {
    backgroundColor: Colors.warning,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  fallbackHeaderText: {
    fontSize: fontSize.sm,
    color: Colors.text.onPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
  listHeaderContainer: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: spacing.md,
  },
  listHeaderTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  listHeaderSubtitle: {
    fontSize: fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  serviceSpecialty: {
    fontSize: fontSize.md,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  serviceClinic: {
    fontSize: fontSize.sm,
    color: Colors.text.primary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  ratingText: {
    fontSize: fontSize.sm,
    color: Colors.text.secondary,
    marginLeft: spacing.xs,
  },
  // Map Optimization Indicator Styles
  mapOptimizingContainer: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 100,
  },
  mapOptimizingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  mapOptimizingText: {
    fontSize: fontSize.sm,
    color: Colors.text.primary,
    fontWeight: '500',
    marginLeft: spacing.sm,
  },
});

// Export apenas uma vez
export default HomeScreen;
