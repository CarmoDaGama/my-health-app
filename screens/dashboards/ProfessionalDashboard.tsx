import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, spacing, borderRadius, fontSize } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth-firebase';
import { useReviews } from '../../hooks/useReviews';
import { HealthService } from '../../types';
import { HealthServiceAPIFirebase } from '../../services/api-firebase';
import ServiceTypeManager from '../../components/specific/ServiceTypeManager';

const { width } = Dimensions.get('window');

export const ProfessionalDashboard: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { reviews, loadReviews } = useReviews();
  
  const [myService, setMyService] = useState<HealthService | null>(null);
  const [allServices, setAllServices] = useState<HealthService[]>([]);
  const [monthlyStats, setMonthlyStats] = useState({
    totalServiceTypes: 0,
    totalSearches: 0,
    totalReviews: 0,
    rating: 4.5
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showServiceTypeManager, setShowServiceTypeManager] = useState(false);

  useEffect(() => {
    loadProfessionalData();
  }, []);

  const loadProfessionalData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadMyService(),
        loadMonthlyStats(),
        // Load reviews if we have a service
        myService ? loadReviews(myService.id) : Promise.resolve()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados profissionais:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyService = async () => {
    try {
      // Buscar o serviço do profissional atual
      const servicesResult = await HealthServiceAPIFirebase.getAllServices();
      const services = servicesResult.services || servicesResult;
      
      // Armazenar todos os serviços
      setAllServices(Array.isArray(services) ? services : []);
      
      const myService = services.find((service: HealthService) => 
        service.createdBy === user?.id
      );
      setMyService(myService || null);
    } catch (error) {
      console.error('Erro ao carregar meu serviço:', error);
      setAllServices([]);
    }
  };

  const loadMonthlyStats = async () => {
    try {
      // Get count of offered services from professional info
      const offeredServicesCount = (user as any)?.professionalInfo?.services?.length || 0;
      
      setMonthlyStats({
        totalServiceTypes: offeredServicesCount,
        totalSearches: 156, // Keep simulated for now
        totalReviews: 8,    // Keep simulated for now
        rating: 4.7         // Keep simulated for now
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Fallback to default values
      setMonthlyStats({
        totalServiceTypes: 0,
        totalSearches: 156,
        totalReviews: 8,
        rating: 4.7
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfessionalData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      t('auth.logoutConfirm') || 'Are you sure you want to logout?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('auth.logout'), onPress: logout, style: 'destructive' }
      ]
    );
  };

  const navigateToMap = () => {
    try {
      console.log('🗺️ Navegando para Map com', allServices.length, 'serviços');
      navigation.navigate('Map', { 
        services: allServices,
        searchQuery: ''
      });
    } catch (error) {
      console.error('❌ Erro ao navegar para Map:', error);
      Alert.alert('Erro', 'Não foi possível abrir o mapa. Tente novamente.');
    }
  };

  const renderStatCard = (
    icon: string, 
    value: string | number, 
    label: string, 
    color: string,
    subtitle?: string
  ) => (
    <View style={[styles.statCard, { borderColor: color + '30' }]}>
      <Ionicons name={icon as any} size={24} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {subtitle && (
        <Text style={styles.statSubtitle}>{subtitle}</Text>
      )}
    </View>
  );

  const renderQuickAction = (
    icon: string,
    title: string,
    subtitle: string,
    onPress: () => void,
    color: string = Colors.primary,
    badge?: string
  ) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
        {badge && (
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>
              {t('professional.welcome') || 'Professional Dashboard'}
            </Text>
            <Text style={styles.userName}>{user?.name || 'Professional'}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle" size={32} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subtitle}>
          {t('professional.subtitle') || 'Manage your profile and professional services'}
        </Text>
      </View>

      {/* Estatísticas principais */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>
          {t('professional.overview') || 'Overview'}
        </Text>
        <View style={styles.statsContainer}>
          {renderStatCard(
            'list', 
            monthlyStats.totalServiceTypes, 
            'Serviços Oferecidos', 
            Colors.primary
          )}
          {renderStatCard(
            'search', 
            monthlyStats.totalSearches, 
            'Procuras pelo Profissional', 
            Colors.success
          )}
          {renderStatCard(
            'star', 
            monthlyStats.rating, 
            'Avaliação Média', 
            '#FFD700',
            `${monthlyStats.totalReviews} avaliações`
          )}
        </View>
      </View>

      {/* Ações rápidas */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>
          {t('professional.quickActions') || 'Quick Actions'}
        </Text>
        
        {renderQuickAction(
          'search',
          t('dashboard.findServices') || 'Find Services',
          t('dashboard.findServicesDesc') || 'Find nearby professionals',
          navigateToMap,
          Colors.info
        )}
      </View>

      {/* Meus serviços */}
      <View style={styles.servicesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('professional.myServices') || 'My Services'}
          </Text>
          <TouchableOpacity onPress={() => {
            Alert.alert(t('common.comingSoon') || 'Coming Soon', t('common.featureSoon') || 'Feature coming soon');
          }}>
            <Text style={styles.seeAllText}>
              {t('common.seeAll') || 'See all'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t('common.loading') || 'Loading...'}</Text>
          </View>
        ) : myService ? (
          <View style={styles.servicesContainer}>
            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => {
                Alert.alert(t('common.comingSoon') || 'Coming Soon', t('common.featureSoon') || 'Feature coming soon');
              }}
            >
              <View style={styles.serviceHeader}>
                <View style={styles.serviceIcon}>
                  <Ionicons name="person" size={20} color={Colors.primary} />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName} numberOfLines={1}>
                    {myService.name}
                  </Text>
                  <Text style={styles.serviceType}>
                    {myService.specialty || myService.type}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: myService.isActive ? Colors.success + '15' : Colors.warning + '15' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: myService.isActive ? Colors.success : Colors.warning }
                  ]}>
                    {myService.isActive ? t('status.active') : t('status.inactive')}
                  </Text>
                </View>
              </View>
              
              {myService.rating && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.rating}>{myService.rating}</Text>
                  <Text style={styles.ratingCount}>({myService.reviewCount || 0})</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>
              {t('professional.noServices') || 'No services registered'}
            </Text>
            <TouchableOpacity 
              style={styles.addServiceButton}
              onPress={() => {
                Alert.alert(t('common.comingSoon') || 'Coming Soon', t('common.featureSoon') || 'Feature coming soon');
              }}
            >
              <Text style={styles.addServiceButtonText}>
                {t('professional.addFirstService') || 'Register First Service'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Botão de logout */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color={Colors.error} />
          <Text style={styles.logoutButtonText}>
            {t('auth.logout') || 'Logout'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>

      {/* Service Type Manager Modal */}
      <ServiceTypeManager
        visible={showServiceTypeManager}
        onClose={() => {
          setShowServiceTypeManager(false);
          loadMonthlyStats(); // Refresh stats when modal closes
        }}
        userType="professional"
      />
    </View>
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
  serviceInfo: {
    backgroundColor: Colors.primary + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  serviceName: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  serviceSpecialty: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  createServicePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
    borderStyle: 'dashed',
  },
  createServiceText: {
    fontSize: fontSize.md,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: spacing.sm,
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - spacing.lg * 3) / 2,
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  trendBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  trendText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  statSubtitle: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
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
    position: 'relative',
  },
  actionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBadgeText: {
    color: Colors.surface,
    fontSize: 10,
    fontWeight: 'bold',
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
  appointmentsSection: {
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
  appointmentCard: {
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  patientName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  appointmentDateTime: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: Colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  acceptButtonText: {
    color: Colors.surface,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  declineButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  declineButtonText: {
    color: Colors.error,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  performanceSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  performanceCard: {
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  performanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: spacing.xs,
  },
  performanceLabel: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  performanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  servicesSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
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
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
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
  serviceType: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
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
  addServiceButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  addServiceButtonText: {
    color: Colors.surface,
    fontSize: fontSize.md,
    fontWeight: '600',
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
