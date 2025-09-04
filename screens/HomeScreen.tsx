import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { HealthService } from '../types';
import { HomeScreenNavigationProp } from '../types/navigation';
import { HealthServiceAPI } from '../services/api';
import { useLocation } from '../hooks/useLocation';
import { ServiceListItem } from '../components/specific/ServiceListItem';
import { Button } from '../components/common/Button';
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
  
  const { location, loading: locationLoading, error: locationError } = useLocation();

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (location) {
      loadNearbyServices();
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
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyServices = () => {
    if (!location) return;
    
    try {
      setLoading(true);
      const nearbyServices = HealthServiceAPI.getNearbyServices(location, 10);
      setServices(nearbyServices);
      setFilteredServices(nearbyServices);
    } catch (error) {
      console.error('Error loading nearby services:', error);
    } finally {
      setLoading(false);
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

  const handleShowMap = () => {
    navigation.navigate('Map', { 
      services: filteredServices,
      userLocation: location || undefined
    });
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

  const renderServiceItem = ({ item }: { item: HealthService }) => {
    const distance = location 
      ? HealthServiceAPI.calculateDistance(location, item.coordinates)
      : undefined;

    return (
      <ServiceListItem
        service={item}
        onPress={() => handleServicePress(item)}
        distance={distance}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t('app.title')}</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={i18n.t('app.search')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.text.secondary}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title={i18n.t('screens.map')}
            onPress={handleShowMap}
            variant="outline"
            size="medium"
          />
        </View>
      </View>

      <View style={styles.content}>
        {locationLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{i18n.t('app.loading')}</Text>
          </View>
        )}

        {filteredServices.length === 0 && !loading && !locationLoading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{i18n.t('app.noResults')}</Text>
          </View>
        )}

        <FlatList
          data={filteredServices}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
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
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: Colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSize.md,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: spacing.xl,
  },
});
