import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, spacing, fontSize } from '../../constants';
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
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);

  // Load services and user location on component mount
  React.useEffect(() => {
    loadServices();
    getUserLocation();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const servicesResult = await HealthServiceAPIFirebase.getAllServices();
      const servicesData = servicesResult?.services || [];
      setServices(Array.isArray(servicesData) ? servicesData : []);
      
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

  const getUserLocation = async () => {
    try {
      const locationResult = await LocationService.getLocationWithFallback();
      if (locationResult) {
        setUserLocation({
          latitude: locationResult.coordinates.latitude,
          longitude: locationResult.coordinates.longitude
        });
      }
    } catch (error) {
      console.error('Error getting user location:', error);
      // Fallback to Luanda, Angola
      setUserLocation({
        latitude: -8.8383,
        longitude: 13.2344
      });
    }
  };

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
    <TouchableOpacity
      style={[
        styles.subTabButton,
        activeSubTab === tab && styles.subTabButtonActive
      ]}
      onPress={() => setActiveSubTab(tab)}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={activeSubTab === tab ? Colors.primary : Colors.textSecondary} 
      />
      <Text style={[
        styles.subTabText,
        activeSubTab === tab && styles.subTabTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading healthcare facilities...</Text>
        </View>
      );
    }

    switch (activeSubTab) {
      case 'map':
        return (
          <View style={styles.mapContainer}>
            {/* Category Filter */}
            <CategoryFilter
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
              onSelectAll={handleSelectAllCategories}
              onClearAll={handleClearAllCategories}
              categoryStats={categoryStats}
              showStats={true}
              horizontal={true}
            />
            
            {/* Interactive Map */}
            <InteractiveMap
              services={services}
              userLocation={userLocation || undefined}
              onServicePress={handleServicePress}
              onLocationChange={handleLocationChange}
              showUserLocation={true}
              autoZoomToServices={true}
              enableClustering={true}
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
              showCategoryLegend={true}
            />
          </View>
        );
      case 'list':
        return (
          <View style={styles.listContainer}>
            <Text style={styles.contentTitle}>Healthcare Professionals</Text>
            <Text style={styles.contentDescription}>
              {services.length} professionals available in your area
            </Text>
            {/* TODO: Implement professionals list view */}
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
    backgroundColor: Colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  subTabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginHorizontal: spacing.xs,
  },
  subTabButtonActive: {
    backgroundColor: Colors.accent + '20', // Adding transparency
  },
  subTabText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  subTabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
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
  },
});