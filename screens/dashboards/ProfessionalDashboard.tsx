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

const { width } = Dimensions.get('window');

export const ProfessionalDashboard: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { reviews, loadReviews } = useReviews();
  
  const [myService, setMyService] = useState<HealthService | null>(null);
  const [appointmentRequests, setAppointmentRequests] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState({
    appointments: 0,
    newPatients: 0,
    reviews: 0,
    rating: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfessionalData();
  }, []);

  const loadProfessionalData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadMyService(),
        loadAppointmentRequests(),
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
      const myService = services.find((service: HealthService) => 
        service.createdBy === user?.id
      );
      setMyService(myService || null);
    } catch (error) {
      console.error('Erro ao carregar meu serviço:', error);
    }
  };

  const loadAppointmentRequests = async () => {
    try {
      // Simular solicitações de agendamento
      // Em produção, buscar do banco de dados
      setAppointmentRequests([
        { id: '1', patientName: 'João Silva', time: '14:00', date: '2024-01-20' },
        { id: '2', patientName: 'Maria Santos', time: '15:30', date: '2024-01-20' },
        { id: '3', patientName: 'Pedro Costa', time: '09:00', date: '2024-01-21' },
      ]);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    }
  };

  const loadMonthlyStats = async () => {
    try {
      // Simular estatísticas mensais
      // Em produção, calcular do banco de dados
      setMonthlyStats({
        appointments: 45,
        newPatients: 12,
        reviews: 8,
        rating: 4.7
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
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
      t('auth.logoutConfirm') || 'Tem certeza que deseja sair?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('auth.logout'), onPress: logout, style: 'destructive' }
      ]
    );
  };

  const handleCreateService = () => {
    // TODO: Implementar navegação para criação de serviços
    console.log('Navegação para criação de serviços em desenvolvimento');
  };

  const handleEditService = () => {
    if (myService) {
      // TODO: Implementar navegação para edição de serviços  
      console.log('Navegação para edição de serviços em desenvolvimento', myService);
    }
  };

  const handleManageAppointments = () => {
    navigation.navigate('ManageAppointments');
  };

  const handleViewAnalytics = () => {
    navigation.navigate('Analytics');
  };

  const renderStatCard = (
    icon: string, 
    value: string | number, 
    label: string, 
    color: string,
    trend?: string
  ) => (
    <View style={[styles.statCard, { borderColor: color + '30' }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: color + '15' }]}>
            <Text style={[styles.trendText, { color }]}>{trend}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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

  const renderAppointmentRequest = (request: any) => (
    <View key={request.id} style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <Ionicons name="person-circle" size={32} color={Colors.primary} />
        <View style={styles.appointmentInfo}>
          <Text style={styles.patientName}>{request.patientName}</Text>
          <Text style={styles.appointmentDateTime}>
            {request.date} às {request.time}
          </Text>
        </View>
      </View>
      
      <View style={styles.appointmentActions}>
        <TouchableOpacity style={styles.acceptButton}>
          <Ionicons name="checkmark" size={16} color={Colors.surface} />
          <Text style={styles.acceptButtonText}>Aceitar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.declineButton}>
          <Ionicons name="close" size={16} color={Colors.error} />
          <Text style={styles.declineButtonText}>Recusar</Text>
        </TouchableOpacity>
      </View>
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>
              {t('professional.welcome') || 'Bem-vindo, Dr(a).'}
            </Text>
            <Text style={styles.userName}>{user?.displayName || 'Profissional'}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle" size={32} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        {myService ? (
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{myService.name}</Text>
            <Text style={styles.serviceSpecialty}>{myService.specialty}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.createServicePrompt} onPress={handleCreateService}>
            <Ionicons name="add-circle" size={24} color={Colors.primary} />
            <Text style={styles.createServiceText}>
              {t('professional.createService') || 'Criar meu serviço'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Estatísticas mensais */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>
          {t('professional.monthlyStats') || 'Estatísticas do Mês'}
        </Text>
        <View style={styles.statsContainer}>
          {renderStatCard(
            'calendar', 
            monthlyStats.appointments, 
            'Consultas', 
            Colors.primary,
            '+12%'
          )}
          {renderStatCard(
            'person-add', 
            monthlyStats.newPatients, 
            'Novos Pacientes', 
            Colors.success,
            '+8%'
          )}
          {renderStatCard(
            'star', 
            monthlyStats.rating, 
            'Avaliação', 
            '#FFD700'
          )}
          {renderStatCard(
            'chatbubble', 
            monthlyStats.reviews, 
            'Avaliações', 
            Colors.info
          )}
        </View>
      </View>

      {/* Ações rápidas */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>
          {t('professional.quickActions') || 'Ações Rápidas'}
        </Text>
        
        {renderQuickAction(
          'calendar-outline',
          t('professional.manageSchedule') || 'Gerenciar Agenda',
          t('professional.manageScheduleDesc') || 'Visualize e organize horários',
          handleManageAppointments,
          Colors.primary,
          appointmentRequests.length.toString()
        )}
        
        {myService ? (
          renderQuickAction(
            'medical',
            t('professional.editService') || 'Editar Serviço',
            t('professional.editServiceDesc') || 'Atualize informações do seu serviço',
            handleEditService,
            Colors.info
          )
        ) : (
          renderQuickAction(
            'add-circle',
            t('professional.createService') || 'Criar Serviço',
            t('professional.createServiceDesc') || 'Configure seu perfil profissional',
            handleCreateService,
            Colors.success
          )
        )}
        
        {renderQuickAction(
          'bar-chart',
          t('professional.analytics') || 'Relatórios',
          t('professional.analyticsDesc') || 'Veja suas métricas de desempenho',
          handleViewAnalytics,
          '#8B5CF6'
        )}
        
        {renderQuickAction(
          'star-outline',
          t('professional.reviews') || 'Avaliações',
          `${reviews.length} ${t('professional.newReviews') || 'novas avaliações'}`,
          () => navigation.navigate('Reviews'),
          '#FFD700'
        )}
      </View>

      {/* Solicitações de agendamento pendentes */}
      <View style={styles.appointmentsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('professional.pendingRequests') || 'Solicitações Pendentes'}
          </Text>
          <TouchableOpacity onPress={handleManageAppointments}>
            <Text style={styles.seeAllText}>
              {t('common.seeAll') || 'Ver todos'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {appointmentRequests.length > 0 ? (
          appointmentRequests.slice(0, 3).map(renderAppointmentRequest)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>
              {t('professional.noPendingRequests') || 'Nenhuma solicitação pendente'}
            </Text>
          </View>
        )}
      </View>

      {/* Desempenho da semana */}
      <View style={styles.performanceSection}>
        <Text style={styles.sectionTitle}>
          {t('professional.weeklyPerformance') || 'Desempenho da Semana'}
        </Text>
        
        <View style={styles.performanceCard}>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>32</Text>
            <Text style={styles.performanceLabel}>Consultas Realizadas</Text>
          </View>
          
          <View style={styles.performanceDivider} />
          
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>4.8</Text>
            <Text style={styles.performanceLabel}>Avaliação Média</Text>
          </View>
          
          <View style={styles.performanceDivider} />
          
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>95%</Text>
            <Text style={styles.performanceLabel}>Taxa de Comparecimento</Text>
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
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
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
