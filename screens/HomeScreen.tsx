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
  
  // Animation refs
  const translateY = useRef(new Animated.Value(0)).current;
  const categoriesHeight = useRef(new Animated.Value(0)).current;
  const fullScreenOpacity = useRef(new Animated.Value(0)).current;
  
  const { location, loading: locationLoading, error: locationError } = useLocation();

  useEffect(() => {
    loadServices();
    if (location) {
      setRegion(prevRegion => ({
        ...prevRegion,
        latitude: location.latitude,
        longitude: location.longitude,
      }));
    }
  }, [location]);

  useEffect(() => {
    filterServices();
  }, [searchQuery, services]);

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
});

// Export apenas uma vez
export default HomeScreen;
