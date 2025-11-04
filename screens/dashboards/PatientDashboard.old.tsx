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

  useEffect(() => {
    loadServices();
    getUserLocation();
  }, []);

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
    navigation.navigate('ServiceDetail', { service });
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  const getInitialRegion = (): Region => {
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

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
    navigation.navigate('Map', { services: nearbyServices });
  };

  const navigateToProfile = () => {
    navigation.navigate('Profile');
  };

  const navigateToFavorites = () => {
    navigation.navigate('Favorites');
  };

  const handleServicePress = (service: HealthService) => {
    navigation.navigate('ServiceDetail', { service });
  };

  const renderQuickAction = (
    icon: string,
    title: string,
    subtitle: string,
    onPress: () => void,
    color: string = Colors.primary
  ) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderServiceCard = (service: HealthService, showDistance = true) => (
    <TouchableOpacity 
      key={service.id}
      style={styles.serviceCard}
      onPress={() => handleServicePress(service)}
    >
      <View style={styles.serviceHeader}>
        <View style={styles.serviceIcon}>
          <Ionicons 
            name={service.type === 'professional' ? 'person' : 'medical'} 
            size={20} 
            color={Colors.primary} 
          />
        </View>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName} numberOfLines={1}>
            {service.name}
          </Text>
          <Text style={styles.serviceType}>
            {service.specialty || service.type}
          </Text>
        </View>
        {favoriteServices.includes(service.id) && (
          <Ionicons name="heart" size={16} color={Colors.error} />
        )}
      </View>
      
      {showDistance && (
        <View style={styles.serviceDistance}>
          <Ionicons name="location" size={14} color={Colors.textSecondary} />
          <Text style={styles.distanceText}>2.5 km</Text>
        </View>
      )}
      
      {service.rating && (
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{service.rating}</Text>
          <Text style={styles.ratingCount}>({service.reviewCount || 0})</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderStatCard = (icon: string, value: string, label: string, color: string) => (
    <View style={[styles.statCard, { borderColor: color + '30' }]}>
      <Ionicons name={icon as any} size={24} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header com saudação */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>
              {t('dashboard.hello') || 'Olá'}
            </Text>
            <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={navigateToProfile}>
            <Ionicons name="person-circle" size={32} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subtitle}>
          {t('dashboard.subtitle') || 'Como podemos ajudar você hoje?'}
        </Text>
      </View>

      {/* Estatísticas do usuário */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>
          {t('dashboard.yourStats') || 'Sua Atividade'}
        </Text>
        <View style={styles.statsContainer}>
          {renderStatCard('heart', favoriteServices.length.toString(), 'Favoritos', Colors.error)}
          {renderStatCard('star', (reviews?.length || 0).toString(), 'Avaliações', '#FFD700')}
          {renderStatCard('time', '12', 'Consultas', Colors.success)}
        </View>
      </View>

      {/* Ações rápidas */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>
          {t('dashboard.quickActions') || 'Ações Rápidas'}
        </Text>
        
        {renderQuickAction(
          'search',
          t('dashboard.findServices') || 'Buscar Serviços',
          t('dashboard.findServicesDesc') || 'Encontre profissionais próximos',
          navigateToMap
        )}
        
        {renderQuickAction(
          'heart',
          t('dashboard.favorites') || 'Meus Favoritos',
          `${favoriteServices.length} ${t('dashboard.savedServices') || 'serviços salvos'}`,
          navigateToFavorites,
          Colors.error
        )}
        
        {renderQuickAction(
          'calendar',
          t('dashboard.appointments') || 'Agendamentos',
          t('dashboard.manageAppointments') || 'Gerencie suas consultas',
          () => navigation.navigate('Appointments'),
          Colors.success
        )}
        
        {renderQuickAction(
          'document-text',
          t('dashboard.medicalHistory') || 'Histórico Médico',
          t('dashboard.viewHistory') || 'Visualize seu histórico',
          () => navigation.navigate('MedicalHistory'),
          '#8B5CF6'
        )}
      </View>

      {/* Serviços próximos */}
      <View style={styles.nearbySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('dashboard.nearbyServices') || 'Serviços Próximos'}
          </Text>
          <TouchableOpacity onPress={navigateToMap}>
            <Text style={styles.seeAllText}>
              {t('common.seeAll') || 'Ver todos'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t('common.loading') || 'Carregando...'}</Text>
          </View>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesContainer}
          >
            {nearbyServices.map(service => renderServiceCard(service, true))}
          </ScrollView>
        )}
      </View>

      {/* Serviços recentes */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>
          {t('dashboard.recentServices') || 'Visitados Recentemente'}
        </Text>
        
        {recentServices.length > 0 ? (
          recentServices.map(service => renderServiceCard(service, false))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>
              {t('dashboard.noRecentServices') || 'Nenhum serviço visitado recentemente'}
            </Text>
          </View>
        )}
      </View>

      {/* Botão de logout */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color={Colors.error} />
          <Text style={styles.logoutButtonText}>
            {t('auth.logout') || 'Sair'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    padding: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  greeting: {
    flex: 1,
  },
  greetingText: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  profileButton: {
    padding: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
  },
  statsSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    borderWidth: 1,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  quickActionsSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  quickActionCard: {
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  quickActionSubtitle: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  nearbySection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontSize: fontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: fontSize.md,
  },
  servicesContainer: {
    paddingRight: spacing.lg,
  },
  serviceCard: {
    width: 200,
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  serviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  serviceType: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  serviceDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  distanceText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginLeft: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: fontSize.sm,
    color: Colors.text,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  ratingCount: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginLeft: spacing.xs,
  },
  recentSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  logoutSection: {
    padding: spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  logoutButtonText: {
    color: Colors.error,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});
