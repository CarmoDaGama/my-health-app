import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, spacing, fontSize, shadows, borderRadius } from '../../constants';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { NeumorphicButton } from '../../components/ui/NeumorphicButton';
import { createNeumorphicStyle } from '../../utils/neumorphicStyles';
import { useTranslation } from '../../hooks/useTranslation';
import { InteractiveMap } from '../../components/specific/InteractiveMap';
import { CategoryFilter } from '../../components/specific/CategoryFilter';
import { HealthService } from '../../types';
import { RootStackParamList } from '../../types/navigation';
import { HealthServiceAPIFirebase } from '../../services/api-firebase';
import { LocationService } from '../../services/location';
import { calculateCategoryStats, CategoryStats } from '../../constants/categories';
import { devLog } from '../../utils/performance';

type HomeSubTab = 'map' | 'list';

const HomeScreenComponent: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState<HomeSubTab>('map');
  const [services, setServices] = useState<HealthService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);

  // Load services and user location on component mount with automatic geolocation
  React.useEffect(() => {
    loadServices();
    // Automatic geolocation on startup (ATM Locator style)
    devLog.log('🚀 Starting automatic geolocation on app startup');
    getUserLocationAutomatically();
  }, []);

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      const servicesResult = await HealthServiceAPIFirebase.getAllServices();
      const servicesData = servicesResult?.services || [];
      setServices(Array.isArray(servicesData) ? servicesData : []);

      devLog.log(`📊 [HomeScreen] Loaded ${servicesData.length} total services from API`);

      // Calculate category statistics
      if (servicesData.length > 0) {
        const stats = calculateCategoryStats(servicesData);
        setCategoryStats(stats);
      }
    } catch (error) {
      devLog.error('Error loading services:', error);
      setServices([]);
      setCategoryStats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserLocationAutomatically = async () => {
    try {
      console.log('📍 Attempting automatic geolocation (ATM Locator style)...');
      setLoading(true);

      // First try high accuracy GPS
      const locationResult = await LocationService.getCurrentLocationHighAccuracy();
      if (locationResult && locationResult.coordinates) {
        console.log('✅ Automatic geolocation successful:', locationResult.coordinates);
        setUserLocation({
          latitude: locationResult.coordinates.latitude,
          longitude: locationResult.coordinates.longitude
        });
        return;
      }

      // Fallback to regular location
      const fallbackResult = await LocationService.getLocationWithFallback();
      if (fallbackResult) {
        console.log('✅ Fallback geolocation successful:', fallbackResult.coordinates);
        setUserLocation({
          latitude: fallbackResult.coordinates.latitude,
          longitude: fallbackResult.coordinates.longitude
        });
        return;
      }

      throw new Error('No location methods available');
    } catch (error) {
      console.error('❌ Automatic geolocation failed, using Luanda fallback:', error);
      // Fallback to Luanda, Angola
      setUserLocation({
        latitude: -8.8383,
        longitude: 13.2344
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = getUserLocationAutomatically;

  const handleServicePress = useCallback((service: HealthService) => {
    devLog.log('Service selected:', service.name);
    navigation.navigate('ServiceDetail', { service });
  }, [navigation]);

  const handleLocationChange = useCallback((location: { latitude: number; longitude: number }) => {
    setUserLocation(location);
  }, []);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    devLog.log('🎯 [HomeScreen] Category toggle requested for:', categoryId);
    setSelectedCategories(prev => {
      if (prev.length === 0) {
        return [categoryId];
      } else if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  }, []);

  const handleSelectAllCategories = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  const handleClearAllCategories = useCallback(() => {
    const allCategoryIds = categoryStats.map(stat => stat.categoryId);
    setSelectedCategories(allCategoryIds);
  }, [categoryStats]);

  const facilities = useMemo(() => services.filter(service => {
    const isFacility =
      service.type === 'hospital' ||
      service.type === 'pharmacy' ||
      service.type === 'laboratory' ||
      service.type === 'emergency' ||
      (service.type === 'clinic' && !service.specialty) ||
      (service as any).serviceType === 'institution' ||
      service.type === 'diagnostic_center' ||
      service.type === 'rehabilitation' ||
      service.type === 'mental_health_center';

    const isProfessional =
      service.type === 'professional' ||
      service.specialty ||
      (service as any).serviceType === 'professional' ||
      (service as any).professionalInfo;

    return isFacility && !isProfessional;
  }), [services]);

  const professionals = useMemo(() => services.filter(service => {
    return service.type === 'professional' ||
      service.specialty ||
      (service as any).serviceType === 'professional' ||
      (service as any).professionalInfo;
  }), [services]);

  const renderSubTabButton = useCallback((tab: HomeSubTab, icon: string, label: string) => (
    <TouchableOpacity
      onPress={() => setActiveSubTab(tab)}
      style={[
        styles.subTabButton,
        activeSubTab === tab && styles.subTabButtonActive
      ]}
    >
      <Ionicons name={icon as any} size={20} color={activeSubTab === tab ? Colors.primary : Colors.textSecondary} />
      <Text style={[
        styles.subTabButtonText,
        activeSubTab === tab && styles.subTabButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  ), [activeSubTab]);

  const renderContent = useCallback(() => {
    if (loading === true) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading healthcare facilities...</Text>
        </View>
      );
    }
    switch (activeSubTab) {
      case 'map':
        // MENDLINK Requirement: Map view shows ONLY facilities, not individual professionals
        devLog.log(`Map showing ${facilities.length} facilities (excluding ${services.length - facilities.length} professionals)`);

        return (
          <View style={styles.mapContainer}>
            {/* Category Filter */}
            {Array.isArray(categoryStats) && (
              <CategoryFilter
                selectedCategories={selectedCategories}
                onCategoryToggle={handleCategoryToggle}
                onSelectAll={handleSelectAllCategories}
                onClearAll={handleClearAllCategories}
                categoryStats={categoryStats}
                showStats={true}
                horizontal={true}
              />
            )}

            {/* MENDLINK Info: Facilities vs Professionals indicator */}
            <View style={styles.mapInfoBanner}>
              <Text style={styles.mapInfoText}>
                🏥 {t('screens.map')} • {facilities.length} {facilities.length === 1 ? t('screens.facility') : t('screens.facilities')}
                {services.length - facilities.length > 0 && (
                  <Text style={styles.mapInfoSecondary}>
                    {' '} • {services.length - facilities.length} {t('screens.professionalsInList')}
                  </Text>
                )}
              </Text>
            </View>

            {/* Interactive Map - Only Facilities */}
            {Array.isArray(facilities) && facilities.length >= 0 && (
              <InteractiveMap
                services={facilities}
                userLocation={userLocation || undefined}
                onServicePress={handleServicePress}
                onLocationChange={handleLocationChange}
                showUserLocation={true}
                autoZoomToServices={true}
                enableClustering={true}
                selectedCategories={selectedCategories || []}
                onCategoryToggle={handleCategoryToggle}
                showCategoryLegend={true}
              />
            )}
          </View>
        );
      case 'list':
        // MENDLINK Requirement: List view shows ONLY professionals, not facilities
        return (
          <View style={styles.listContainer}>
            <Text style={styles.contentTitle}>Healthcare Professionals</Text>
            <Text style={styles.contentDescription}>
              {professionals.length} professionals available in your area
            </Text>

            <ScrollView style={styles.professionalsList} showsVerticalScrollIndicator={false}>
              {professionals.length > 0 ? (
                professionals.map((professional, index) => (
                  <NeumorphicCard
                    key={professional.id || `professional-${index}`}
                    variant="default"
                    onPress={() => handleServicePress(professional)}
                    style={styles.professionalCard}
                  >
                    <View style={styles.professionalInfo}>
                      <View style={styles.professionalIcon}>
                        <Ionicons name="person" size={24} color={Colors.primary} />
                      </View>
                      <View style={styles.professionalDetails}>
                        <Text style={styles.professionalName}>{String(professional.name || 'Professional')}</Text>
                        <Text style={styles.professionalSpecialty}>
                          {String(professional.specialty || professional.type || 'Professional')}
                        </Text>
                        {professional.address && (
                          <Text style={styles.professionalAddress}>{String(professional.address)}</Text>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                    </View>
                  </NeumorphicCard>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="search" size={48} color={Colors.textSecondary} />
                  <Text style={styles.emptyStateText}>No professionals found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        );
      default:
        return null;
    }
  }, [activeSubTab, loading, facilities, professionals, categoryStats, selectedCategories, userLocation, t, handleServicePress, handleLocationChange, handleCategoryToggle, handleSelectAllCategories, handleClearAllCategories, services.length]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Sub-tabs Header */}
      <View style={styles.subTabsContainer}>
        {renderSubTabButton('map', 'business-outline', t('serviceTypes.healthInstitutions') || 'Institutions')}
        {renderSubTabButton('list', 'people-outline', t('serviceTypes.healthProfessionals') || 'Healthcare Professionals')}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  subTabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  subTabButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.cardBackground,
    ...shadows.neumorphic.small,
  },
  subTabButtonActive: {
    backgroundColor: Colors.primary,
    ...shadows.neumorphic.medium,
  },
  subTabButtonText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  subTabButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    padding: spacing.md,
  },
  contentTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  contentDescription: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  professionalsList: {
    flex: 1,
  },
  professionalCard: {
    marginBottom: spacing.sm,
    marginHorizontal: spacing.md,
  },
  professionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  professionalIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    ...createNeumorphicStyle({ size: 'small', rounded: 25 }),
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  professionalDetails: {
    flex: 1,
  },
  professionalName: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  professionalSpecialty: {
    fontSize: fontSize.sm,
    color: Colors.primary,
    marginBottom: 2,
  },
  professionalAddress: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  // MENDLINK: Map info banner styles
  mapInfoBanner: {
    ...createNeumorphicStyle({
      size: 'small',
      backgroundColor: Colors.primary + '10',
      rounded: borderRadius.lg
    }),
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  mapInfoText: {
    fontSize: fontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  mapInfoSecondary: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
});

export const HomeScreen = memo(HomeScreenComponent);
HomeScreen.displayName = 'HomeScreen';