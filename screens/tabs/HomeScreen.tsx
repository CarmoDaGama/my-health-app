import React, { useState } from 'react';
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

type HomeSubTab = 'map' | 'list';

export const HomeScreen: React.FC = () => {
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
    console.log('🚀 Starting automatic geolocation on app startup');
    getUserLocationAutomatically();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const servicesResult = await HealthServiceAPIFirebase.getAllServices();
      const servicesData = servicesResult?.services || [];
      setServices(Array.isArray(servicesData) ? servicesData : []);
      
      // MENDLINK Debug: Log service types for debugging
      console.log(`📊 Loaded ${servicesData.length} total services:`);
      servicesData.forEach((service, index) => {
        console.log(`  ${index + 1}. ${service.name} - Type: ${service.type}${service.specialty ? ` - Specialty: ${service.specialty}` : ''}`);
      });
      
      // Calculate category statistics
      if (servicesData.length > 0) {
        const stats = calculateCategoryStats(servicesData);
        setCategoryStats(stats);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
      setCategoryStats([]);
    } finally {
      setLoading(false);
    }
  };

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

  const handleServicePress = (service: HealthService) => {
    console.log('Service selected:', service.name);
    navigation.navigate('ServiceDetail', { service });
  };

  const handleLocationChange = (location: { latitude: number; longitude: number }) => {
    setUserLocation(location);
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.length === 0) {
        // If no categories selected (showing all), select only this category
        return [categoryId];
      } else if (prev.includes(categoryId)) {
        // If category is selected, remove it
        const newCategories = prev.filter(id => id !== categoryId);
        // If removing last category, show all (empty array)
        return newCategories;
      } else {
        // Add category to selection
        return [...prev, categoryId];
      }
    });
  };

  const handleSelectAllCategories = () => {
    setSelectedCategories([]);
  };

  const handleClearAllCategories = () => {
    // Select all available categories (essentially hiding everything until something is selected)
    const allCategoryIds = categoryStats.map(stat => stat.categoryId);
    setSelectedCategories(allCategoryIds);
  };

  const renderSubTabButton = (tab: HomeSubTab, icon: string, label: string) => (
    <NeumorphicButton
      title={label}
      icon={icon}
      variant={activeSubTab === tab ? 'primary' : 'tertiary'}
      size="small"
      onPress={() => setActiveSubTab(tab)}
      style={{
        ...styles.subTabButton,
        ...(activeSubTab === tab && styles.subTabButtonActive)
      }}
    />
  );

  const renderContent = () => {
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
        const facilities = services.filter(service => {
          const isFacility = 
            // Core facility types
            service.type === 'hospital' ||
            service.type === 'pharmacy' ||
            service.type === 'laboratory' ||
            service.type === 'emergency' ||
            // Clinics without individual specialties (institution, not professional)
            (service.type === 'clinic' && !service.specialty) ||
            // Services explicitly marked as institutions
            (service as any).serviceType === 'institution' ||
            // Other facility types
            service.type === 'diagnostic_center' ||
            service.type === 'rehabilitation' ||
            service.type === 'mental_health_center';
          
          // EXCLUDE individual professionals from map
          const isProfessional = 
            service.type === 'professional' ||
            service.specialty ||
            (service as any).serviceType === 'professional' ||
            (service as any).professionalInfo;
          
          return isFacility && !isProfessional;
        });
        
        console.log(`🗺️ Map showing ${facilities.length} facilities (excluding ${services.length - facilities.length} professionals)`);
        
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
        const professionals = services.filter(service => {
          const isProfessional = 
            // Direct professional types
            service.type === 'professional' ||
            // Has specialty (indicates individual professional)
            service.specialty ||
            // ServiceType explicitly set as professional  
            (service as any).serviceType === 'professional' ||
            // Has professional info (registered professional)
            (service as any).professionalInfo ||
            // Individual practitioners in clinics (not the clinic itself)
            (service.verified && service.type === 'practitioner');
          
          // EXCLUDE facilities (hospitals, pharmacies, labs) from professionals list
          const isFacility = 
            service.type === 'hospital' ||
            service.type === 'pharmacy' ||
            service.type === 'laboratory' ||
            service.type === 'clinic' && !service.specialty; // Clinic without specialty = facility
          
          return isProfessional && !isFacility;
        });
        
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
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sub-tabs Header */}
      <View style={styles.subTabsContainer}>
        {renderSubTabButton('map', 'map-outline', 'Map')}
        {renderSubTabButton('list', 'list-outline', 'List')}
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
  },
  subTabButtonActive: {
    // Handled by NeumorphicButton variant
  },
  subTabText: {
    // Handled by NeumorphicButton
  },
  subTabTextActive: {
    // Handled by NeumorphicButton
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