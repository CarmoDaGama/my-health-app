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
import { HealthService } from '../../types';
import { HealthServiceAPIFirebase } from '../../services/api-firebase';
import { useInstitutionServices } from '../../hooks/useInstitutionServices';
import { InstitutionServiceManagement } from '../../components/specific/InstitutionServiceManagement';
import { InstitutionService } from '../../types/institutionService';
import { UserDebugInfo } from '../../components/debug/UserDebugInfo';

const { width } = Dimensions.get('window');

export const InstitutionDashboard: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  
  // Aguardar o carregamento do usuário antes de inicializar o hook de serviços
  const shouldInitializeServices = isAuthenticated && user && !authLoading;
  const { services: institutionServices, stats: serviceStats, error: servicesError } = useInstitutionServices();
  
  const [myServices, setMyServices] = useState<HealthService[]>([]);
  const [institutionStats, setInstitutionStats] = useState({
    totalServices: 0,
    activeServices: 0,
    totalReviews: 0,
    averageRating: 0,
    monthlyAppointments: 0,
    newPatients: 0
  });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showServiceManagement, setShowServiceManagement] = useState(false);

  useEffect(() => {
    loadInstitutionData();
  }, []);

  // Debug: mostrar erro dos serviços se houver
  useEffect(() => {
    if (servicesError) {
      console.log('🚨 Erro nos serviços da instituição:', servicesError);
      console.log('👤 Estado do usuário:', {
        authenticated: isAuthenticated,
        userType: user?.userType,
        userId: user?.id,
        userName: user?.name,
        authLoading
      });
    }
  }, [servicesError, user, isAuthenticated, authLoading]);

  // Handlers para gerenciamento de serviços
  const handleServiceCreated = (service: InstitutionService) => {
    Alert.alert(
      'Sucesso!',
      `Serviço "${service.name}" foi criado com sucesso.`,
      [{ text: 'OK' }]
    );
  };

  const handleServiceUpdated = (service: InstitutionService) => {
    Alert.alert(
      'Atualizado!',
      `Serviço "${service.name}" foi atualizado com sucesso.`,
      [{ text: 'OK' }]
    );
  };

  const handleServiceDeleted = (serviceId: string) => {
    Alert.alert(
      'Excluído!',
      'Serviço foi excluído com sucesso.',
      [{ text: 'OK' }]
    );
  };

  const loadInstitutionData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadMyServices(),
        loadInstitutionStats(),
        loadPendingRequests()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados da instituição:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyServices = async () => {
    // Usar os serviços do hook ao invés de carregar novamente
    // Os serviços já são carregados pelo useInstitutionServices
  };

  const loadInstitutionStats = async () => {
    try {
      // Simular estatísticas da instituição
      // Em produção, calcular do banco de dados
      setInstitutionStats({
        totalServices: 15,
        activeServices: 12,
        totalReviews: 245,
        averageRating: 4.6,
        monthlyAppointments: 320,
        newPatients: 89
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadPendingRequests = async () => {
    try {
      // Simular solicitações pendentes
      setPendingRequests([
        { id: '1', type: 'service_approval', professional: 'Dr. João Silva', specialty: 'Cardiologia' },
        { id: '2', type: 'schedule_change', professional: 'Dra. Maria Santos', reason: 'Emergência' },
        { id: '3', type: 'new_professional', name: 'Dr. Pedro Costa', specialty: 'Neurologia' },
      ]);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInstitutionData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      t('auth.logoutConfirm') || 'Tem certeza que deseja sair?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('auth.logout'), onPress: logout, style: 'destructive' }
      ]
    );
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

  const renderServiceCard = (service: HealthService) => (
    <TouchableOpacity 
      key={service.id}
      style={styles.serviceCard}
      onPress={() => navigation.navigate('ServiceDetail', { service })}
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
        <View style={[
          styles.statusBadge, 
          { backgroundColor: service.isActive ? Colors.success + '15' : Colors.warning + '15' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: service.isActive ? Colors.success : Colors.warning }
          ]}>
            {service.isActive ? 'Ativo' : 'Inativo'}
          </Text>
        </View>
      </View>
      
      {service.rating && (
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{service.rating}</Text>
          <Text style={styles.ratingCount}>({service.reviewCount || 0})</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderPendingRequest = (request: any) => (
    <View key={request.id} style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Ionicons 
          name={
            request.type === 'service_approval' ? 'checkmark-circle' :
            request.type === 'schedule_change' ? 'time' : 'person-add'
          } 
          size={24} 
          color={Colors.warning} 
        />
        <View style={styles.requestInfo}>
          <Text style={styles.requestTitle}>
            {request.type === 'service_approval' && 'Aprovação de Serviço'}
            {request.type === 'schedule_change' && 'Mudança de Agenda'}
            {request.type === 'new_professional' && 'Novo Profissional'}
          </Text>
          <Text style={styles.requestDescription}>
            {request.professional || request.name} - {request.specialty || request.reason}
          </Text>
        </View>
      </View>
      
      <View style={styles.requestActions}>
        <TouchableOpacity style={styles.approveButton}>
          <Text style={styles.approveButtonText}>Aprovar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectButton}>
          <Text style={styles.rejectButtonText}>Rejeitar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
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
              {t('institution.welcome') || 'Painel Institucional'}
            </Text>
            <Text style={styles.institutionName}>{user?.name || 'Instituição'}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="business" size={32} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subtitle}>
          {t('institution.subtitle') || 'Gerencie sua instituição e serviços'}
        </Text>
      </View>

      {/* Debug Info - apenas em desenvolvimento */}
      <UserDebugInfo />

      {/* Estatísticas principais */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>
          {t('institution.overview') || 'Visão Geral'}
        </Text>
        <View style={styles.statsContainer}>
          {renderStatCard(
            'medical', 
            institutionStats.totalServices, 
            'Total de Serviços', 
            Colors.primary,
            `${institutionStats.activeServices} ativos`
          )}
          {renderStatCard(
            'people', 
            institutionStats.monthlyAppointments, 
            'Consultas/Mês', 
            Colors.success
          )}
          {renderStatCard(
            'star', 
            institutionStats.averageRating, 
            'Avaliação Média', 
            '#FFD700',
            `${institutionStats.totalReviews} avaliações`
          )}
          {renderStatCard(
            'person-add', 
            institutionStats.newPatients, 
            'Novos Pacientes', 
            Colors.info
          )}
        </View>
      </View>

      {/* Ações rápidas */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>
          {t('institution.quickActions') || 'Gestão Rápida'}
        </Text>
        
        {renderQuickAction(
          'medical-outline',
          t('institution.manageServices') || 'Gerenciar Serviços',
          `${serviceStats.total} serviços cadastrados`,
          () => {
            setShowServiceManagement(true);
          },
          Colors.primary
        )}
        
        {renderQuickAction(
          'people-outline',
          t('institution.manageProfessionals') || 'Profissionais',
          'Cadastrar e gerenciar equipe',
          () => navigation.navigate('ManageProfessionals'),
          Colors.success,
          pendingRequests.filter(r => r.type === 'new_professional').length.toString()
        )}
        
        {renderQuickAction(
          'calendar-outline',
          t('institution.scheduleManagement') || 'Agenda Geral',
          'Visualizar agendas dos profissionais',
          () => navigation.navigate('InstitutionSchedule'),
          Colors.info
        )}
        
        {renderQuickAction(
          'bar-chart-outline',
          t('institution.reports') || 'Relatórios',
          'Métricas e análises detalhadas',
          () => navigation.navigate('InstitutionReports'),
          '#8B5CF6'
        )}
        
        {renderQuickAction(
          'settings-outline',
          t('institution.settings') || 'Configurações',
          'Configurar política e permissões',
          () => navigation.navigate('InstitutionSettings'),
          Colors.textSecondary
        )}
      </View>

      {/* Solicitações pendentes */}
      <View style={styles.pendingSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('institution.pendingRequests') || 'Solicitações Pendentes'}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('AllRequests')}>
            <Text style={styles.seeAllText}>
              {t('common.seeAll') || 'Ver todas'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {pendingRequests.length > 0 ? (
          pendingRequests.slice(0, 3).map(renderPendingRequest)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>
              {t('institution.noPendingRequests') || 'Nenhuma solicitação pendente'}
            </Text>
          </View>
        )}
      </View>

      {/* Meus serviços */}
      <View style={styles.servicesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('institution.myServices') || 'Meus Serviços'}
          </Text>
          <TouchableOpacity onPress={() => {
            setShowServiceManagement(true);
          }}>
            <Text style={styles.seeAllText}>
              {t('common.seeAll') || 'Ver todos'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : myServices.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesContainer}
          >
            {myServices.slice(0, 5).map(renderServiceCard)}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>
              {t('institution.noServices') || 'Nenhum serviço cadastrado'}
            </Text>
            <TouchableOpacity 
              style={styles.addServiceButton}
              onPress={() => {
                // TODO: Implementar navegação para criação de serviços
                console.log('Navegação para criação de serviços em desenvolvimento');
              }}
            >
              <Text style={styles.addServiceButtonText}>
                Cadastrar Primeiro Serviço
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Desempenho mensal */}
      <View style={styles.performanceSection}>
        <Text style={styles.sectionTitle}>
          {t('institution.monthlyPerformance') || 'Desempenho Mensal'}
        </Text>
        
        <View style={styles.performanceCard}>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>95%</Text>
            <Text style={styles.performanceLabel}>Taxa de Ocupação</Text>
          </View>
          
          <View style={styles.performanceDivider} />
          
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>4.6</Text>
            <Text style={styles.performanceLabel}>Satisfação Média</Text>
          </View>
          
          <View style={styles.performanceDivider} />
          
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>12</Text>
            <Text style={styles.performanceLabel}>Novos Profissionais</Text>
          </View>
        </View>
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

      {/* Modal de Gerenciamento de Serviços */}
      {showServiceManagement && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gerenciamento de Serviços</Text>
              <TouchableOpacity onPress={() => setShowServiceManagement(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <InstitutionServiceManagement
              onServiceCreated={handleServiceCreated}
              onServiceUpdated={handleServiceUpdated}
              onServiceDeleted={handleServiceDeleted}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flex: 1,
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
  institutionName: {
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
  pendingSection: {
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
  requestCard: {
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  requestInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  requestTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  requestDescription: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  approveButton: {
    flex: 1,
    backgroundColor: Colors.success,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  approveButtonText: {
    color: Colors.surface,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  rejectButtonText: {
    color: Colors.error,
    fontSize: fontSize.sm,
    fontWeight: '600',
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
    marginBottom: spacing.md,
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
  // Estilos do modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.background,
    width: '95%',
    height: '90%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
  },
});
