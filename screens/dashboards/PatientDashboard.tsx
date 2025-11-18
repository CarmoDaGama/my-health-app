import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  ScrollView,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, spacing, borderRadius, fontSize } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth-firebase';
import { HealthService, Region } from '../../types';
import { HealthServiceAPIFirebase } from '../../services/api-firebase';
import { LocationService } from '../../services/location';
import { MapView } from '../../components/specific/MapView';

const { width, height } = Dimensions.get('window');

// Constantes para os estados da barra
const SEARCH_BAR_HEIGHT = 80;
const TABS_HEIGHT = 60;
const EXPANDED_HEIGHT = height * 0.7;
const DRAG_THRESHOLD = 50;

export const PatientDashboard: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [allServices, setAllServices] = useState<HealthService[]>([]);
  const [filteredServices, setFilteredServices] = useState<HealthService[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTabs, setShowTabs] = useState(false);
  
  // Animações
  const bottomPosition = useRef(new Animated.Value(0)).current;
  const expandedHeight = useRef(new Animated.Value(SEARCH_BAR_HEIGHT)).current;
  const dragY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadServices();
    getUserLocation();
  }, []);

  useEffect(() => {
    // Listener para animar a barra de pesquisa baseado no teclado
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', 
      (e) => {
        // Apenas adicionar padding suficiente para ficar acima do teclado
        const keyboardHeight = Platform.OS === 'ios' 
          ? e.endCoordinates.height - insets.bottom
          : e.endCoordinates.height;
        
        Animated.timing(bottomPosition, {
          toValue: Math.max(keyboardHeight - insets.bottom, 0), // Garantir que não seja negativo
          duration: Platform.OS === 'ios' ? 250 : 200,
          useNativeDriver: false,
        }).start();
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(bottomPosition, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? 250 : 200,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, [insets.bottom]);

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
    try {
      console.log('🔍 Obtendo localização do usuário no dashboard...');
      
      // Usar o serviço de localização com fallbacks
      const locationResult = await LocationService.getLocationWithFallback();
      
      if (locationResult) {
        console.log('✅ Localização obtida:', locationResult.coordinates);
        setUserLocation({
          latitude: locationResult.coordinates.latitude,
          longitude: locationResult.coordinates.longitude
        });
      } else {
        console.log('⚠️ Não foi possível obter localização, usando padrão');
        // Fallback para Luanda, Angola
        setUserLocation({
          latitude: -8.8383,
          longitude: 13.2344
        });
      }
    } catch (error) {
      console.error('❌ Erro ao obter localização:', error);
      // Fallback para Luanda, Angola em caso de erro
      setUserLocation({
        latitude: -8.8383,
        longitude: 13.2344
      });
    }
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
    (navigation as any).navigate('ServiceDetail', { service });
  };

  const handleProfilePress = () => {
    (navigation as any).navigate('Profile');
  };

  const handleTabPress = (tabName: string) => {
    if (activeTab === tabName && isExpanded) {
      // Se o tab já está ativo e expandido, colapsar
      collapsePanel();
    } else {
      // Primeiro mostrar os tabs se não estiverem visíveis
      if (!showTabs) {
        setShowTabs(true);
      }
      // Expandir o painel para o tab selecionado
      setActiveTab(tabName);
      expandPanel();
    }
  };

  const expandPanel = () => {
    setIsExpanded(true);
    Animated.timing(expandedHeight, {
      toValue: height * 0.8, // 80% da altura da tela para melhor visualização
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const collapsePanel = () => {
    Animated.timing(expandedHeight, {
      toValue: showTabs ? SEARCH_BAR_HEIGHT + TABS_HEIGHT : SEARCH_BAR_HEIGHT,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setIsExpanded(false);
      setActiveTab(null);
    });
  };

  const showTabsPanel = () => {
    if (!showTabs) {
      setShowTabs(true);
      Animated.timing(expandedHeight, {
        toValue: SEARCH_BAR_HEIGHT + TABS_HEIGHT,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  };

  const hideTabsPanel = () => {
    if (showTabs && !isExpanded) {
      setShowTabs(false);
      Animated.timing(expandedHeight, {
        toValue: SEARCH_BAR_HEIGHT,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: dragY } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;
      
      // Reset drag position
      dragY.setValue(0);
      
      // Se estiver expandido, não processar gestos (deixar o scroll funcionar)
      if (isExpanded) {
        return;
      }
      
      // Determinar ação baseada na direção e velocidade do gesto
      if (translationY < -DRAG_THRESHOLD || velocityY < -500) {
        // Arrastar para cima - mostrar tabs
        showTabsPanel();
      } else if (translationY > DRAG_THRESHOLD || velocityY > 500) {
        // Arrastar para baixo - esconder tabs (se não estiver expandido)
        if (!isExpanded) {
          hideTabsPanel();
        }
      }
    }
  };

  const getProfessionals = () => {
    return allServices.filter(service => 
      // Usar serviceType como filtro principal
      (service as any).serviceType === 'professional' ||
      // Fallback para casos antigos
      (service.type === 'professional') ||
      (service.type === 'clinic' && service.specialty)
    );
  };

  const getInstitutions = () => {
    return allServices.filter(service => 
      // Usar serviceType como filtro principal
      (service as any).serviceType === 'institution' ||
      // Fallback para casos antigos ou serviços estáticos
      (service.type === 'hospital' && !(service as any).serviceType) || 
      (service.type === 'clinic' && !(service as any).serviceType && !service.specialty) ||
      (service.type === 'pharmacy')
    );
  };

  const renderTabContent = () => {
    if (!activeTab || !isExpanded) return null;

    let data: HealthService[] = [];
    let title = '';

    switch (activeTab) {
      case 'professionals':
        data = getProfessionals();
        title = t('dashboard.professionals') || 'Profissionais Disponíveis';
        break;
      case 'institutions':
        data = getInstitutions();
        title = t('dashboard.institutions') || 'Instituições de Saúde';
        break;
      default:
        return null;
    }

    return (
      <>
        <View style={styles.expandedHeader}>
          <Text style={styles.expandedTitle}>{title}</Text>
          <TouchableOpacity onPress={collapsePanel} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
        {data.length > 0 ? (
          data.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.listItem}
              onPress={() => handleServicePress(item)}
            >
              <View style={styles.listItemContent}>
                <View style={styles.listItemIcon}>
                  <Ionicons 
                    name={activeTab === 'professionals' ? 'person' : 'business'} 
                    size={20} 
                    color={Colors.primary} 
                  />
                </View>
                <View style={styles.listItemText}>
                  <Text style={styles.listItemTitle}>{item.name}</Text>
                  <Text style={styles.listItemSubtitle}>
                    {item.specialty || item.type} • {item.address}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyStateText}>
              {t('dashboard.noResults') || 'Nenhum resultado encontrado'}
            </Text>
          </View>
        )}
      </>
    );
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

      {/* Barra de pesquisa com área arrastável específica */}
      <Animated.View style={[
        styles.searchContainer, 
        { 
          bottom: bottomPosition,
          height: isExpanded ? height * 0.85 : (showTabs ? SEARCH_BAR_HEIGHT + TABS_HEIGHT : SEARCH_BAR_HEIGHT),
          transform: [{ translateY: dragY }]
        }
      ]}>
        {/* Handle arrastável - só esta área responde ao gesto */}
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          enabled={!isExpanded} // Desabilitar quando expandido
        >
          <View style={styles.dragHandleArea}>
            <View style={styles.dragHandle} />
          </View>
        </PanGestureHandler>
        
        {/* Barra de pesquisa */}
        <View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('app.searchPlaceholder') || 'Buscar serviços de saúde...'}
                placeholderTextColor={Colors.textSecondary}
                value={searchQuery}
                onChangeText={handleSearch}
                returnKeyType="search"
                blurOnSubmit={true}
                enablesReturnKeyAutomatically={true}
              />
              {searchQuery.length > 0 ? (
                <TouchableOpacity onPress={() => handleSearch('')}>
                  <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>
            <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
              <Ionicons name="person-circle" size={32} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Botões de Tab - só aparecem quando showTabs é true */}
          {showTabs && (
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[
                  styles.tabButton, 
                  activeTab === 'professionals' && styles.activeTabButton
                ]}
                onPress={() => handleTabPress('professionals')}
              >
                <Ionicons 
                  name="people" 
                  size={20} 
                  color={activeTab === 'professionals' ? Colors.surface : Colors.textSecondary} 
                />
                <Text style={[
                  styles.tabButtonText,
                  activeTab === 'professionals' && styles.activeTabButtonText
                ]}>
                  {t('dashboard.professionals') || 'Profissionais'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.tabButton, 
                  activeTab === 'institutions' && styles.activeTabButton
                ]}
                onPress={() => handleTabPress('institutions')}
              >
                <Ionicons 
                  name="business" 
                  size={20} 
                  color={activeTab === 'institutions' ? Colors.surface : Colors.textSecondary} 
                />
                <Text style={[
                  styles.tabButtonText,
                  activeTab === 'institutions' && styles.activeTabButtonText
                ]}>
                  {t('dashboard.institutions') || 'Instituições'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Painel expandido */}
          {isExpanded && (
            <ScrollView 
              style={[
                styles.expandedPanel,
                { 
                  flex: 1,
                  marginTop: spacing.sm,
                }
              ]}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              contentContainerStyle={styles.scrollContent}
              bounces={true}
            >
              {renderTabContent()}
            </ScrollView>
          )}
          
          {/* Contador de resultados - só aparece quando não está expandido */}
          {!isExpanded ? (
            <View style={styles.resultsInfo}>
              <Text style={styles.resultsText}>
                {String(filteredServices.length || 0)} {t('app.servicesFound') || 'serviços encontrados'}
              </Text>
            </View>
          ) : null}
        </Animated.View>
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
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
    zIndex: 1000,
    minHeight: SEARCH_BAR_HEIGHT,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.textSecondary + '40',
    borderRadius: 2,
    alignSelf: 'center',
  },
  dragHandleArea: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  resultsText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  profileButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.background,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // Novos estilos para os tabs e painel expandido
  expandedPanel: {
    backgroundColor: Colors.surface,
    paddingTop: spacing.sm,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.xs, // Espaçamento entre os dois botões
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm, // Aumentar padding horizontal
    borderRadius: borderRadius.md,
  },
  activeTabButton: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activeTabButtonText: {
    color: Colors.surface,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  expandedTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  listItem: {
    backgroundColor: Colors.background,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  listItemText: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  listItemSubtitle: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    marginHorizontal: spacing.md,
  },
  emptyStateText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
