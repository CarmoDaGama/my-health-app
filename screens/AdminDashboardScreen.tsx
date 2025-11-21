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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, spacing, borderRadius, fontSize } from '../constants';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth-firebase';
import { PermissionsManager } from '../utils/permissions';
import { isCurrentUserAdmin } from '../services/roles-client';
import { getServicesStats } from '../services/approval-client';
import LoadingSpinner from '../components/common/LoadingSpinner';

const { width } = Dimensions.get('window');

interface SystemStats {
  totalUsers: number;
  totalServices: number;
  pendingServices: number;
  approvedServices: number;
  rejectedServices: number;
  totalReviews: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  dailyActiveUsers: number;
  monthlyGrowth: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'service_submission' | 'service_approval' | 'service_rejection' | 'review_posted';
  message: string;
  timestamp: Date;
  userEmail?: string;
}

export default function AdminDashboardScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    totalServices: 0,
    pendingServices: 0,
    approvedServices: 0,
    rejectedServices: 0,
    totalReviews: 0,
    systemHealth: 'good',
    dailyActiveUsers: 0,
    monthlyGrowth: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const adminStatus = await isCurrentUserAdmin();
      setIsAdmin(adminStatus);
      
      if (adminStatus) {
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
      Alert.alert('Erro', 'Erro ao verificar permissões administrativas');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load system statistics
      const serviceStatsResult = await getServicesStats();
      
      // Extract stats from the result object
      const serviceStats = serviceStatsResult?.stats;
      
      // Simulate additional stats (in production, these would come from your backend)
      setSystemStats({
        totalUsers: 1247,
        totalServices: serviceStats?.total || 0,
        pendingServices: serviceStats?.pending || 0,
        approvedServices: serviceStats?.approved || 0,
        rejectedServices: serviceStats?.rejected || 0,
        totalReviews: 89,
        systemHealth: 'good',
        dailyActiveUsers: 156,
        monthlyGrowth: 12.5
      });

      // Load recent activities (simulated)
      setRecentActivities([
        {
          id: '1',
          type: 'user_registration',
          message: 'Novo usuário registrado: Dr. João Silva',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
        },
        {
          id: '2', 
          type: 'service_submission',
          message: 'Novo serviço submetido para aprovação',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
        },
        {
          id: '3',
          type: 'service_approval',
          message: 'Serviço aprovado: Clínica Santa Maria',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
        }
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>
          {t('admin.checkingPermissions') || 'Verificando permissões...'}
        </Text>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.accessDeniedContainer}>
        <Ionicons name="shield-checkmark" size={80} color={Colors.error} />
        <Text style={styles.accessDeniedTitle}>
          {t('admin.accessDenied') || 'Acesso Negado'}
        </Text>
        <Text style={styles.accessDeniedMessage}>
          {t('admin.adminRequired') || 'Esta área é restrita a administradores do sistema.'}
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>
            {t('common.goBack') || 'Voltar'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

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

  const renderActionCard = (
    icon: string,
    title: string,
    description: string,
    onPress: () => void,
    color: string = Colors.primary,
    badge?: string
  ) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
        {badge && (
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderActivityItem = (activity: RecentActivity) => (
    <View key={activity.id} style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) + '15' }]}>
        <Ionicons 
          name={getActivityIcon(activity.type)} 
          size={16} 
          color={getActivityColor(activity.type)} 
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityMessage}>{activity.message}</Text>
        <Text style={styles.activityTime}>
          {formatTimeAgo(activity.timestamp)}
        </Text>
      </View>
    </View>
  );

  const getActivityIcon = (type: string): any => {
    switch (type) {
      case 'user_registration': return 'person-add';
      case 'service_submission': return 'document';
      case 'service_approval': return 'checkmark-circle';
      case 'service_rejection': return 'close-circle';
      case 'review_posted': return 'star';
      default: return 'information-circle';
    }
  };

  const getActivityColor = (type: string): string => {
    switch (type) {
      case 'user_registration': return Colors.success;
      case 'service_submission': return Colors.info;
      case 'service_approval': return Colors.success;
      case 'service_rejection': return Colors.error;
      case 'review_posted': return '#FFD700';
      default: return Colors.textSecondary;
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  const getSystemHealthColor = (health: string): string => {
    switch (health) {
      case 'excellent': return Colors.success;
      case 'good': return Colors.info;
      case 'warning': return Colors.warning;
      case 'critical': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

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
              {t('admin.welcome') || 'Painel Administrativo'}
            </Text>
            <Text style={styles.userName}>{user?.displayName || 'Administrador'}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="shield-checkmark" size={32} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.systemStatus}>
          <View style={styles.systemStatusItem}>
            <View style={[styles.statusIndicator, { backgroundColor: getSystemHealthColor(systemStats.systemHealth) }]} />
            <Text style={styles.systemStatusText}>
              Sistema: {systemStats.systemHealth === 'excellent' ? 'Excelente' : 
                       systemStats.systemHealth === 'good' ? 'Bom' :
                       systemStats.systemHealth === 'warning' ? 'Atenção' : 'Crítico'}
            </Text>
          </View>
        </View>
      </View>

      {/* System Overview Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>
          {t('admin.systemOverview') || 'Visão Geral do Sistema'}
        </Text>
        <View style={styles.statsContainer}>
          {renderStatCard(
            'people', 
            systemStats.totalUsers, 
            'Total de Usuários', 
            Colors.primary,
            `+${systemStats.monthlyGrowth}%`
          )}
          {renderStatCard(
            'medical', 
            systemStats.totalServices, 
            'Serviços Cadastrados', 
            Colors.success
          )}
          {renderStatCard(
            'time', 
            systemStats.pendingServices, 
            'Aguardando Aprovação', 
            Colors.warning
          )}
          {renderStatCard(
            'star', 
            systemStats.totalReviews, 
            'Avaliações', 
            '#FFD700'
          )}
        </View>
      </View>

      {/* Quick Actions 
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>
          {t('admin.quickActions') || 'Ações Administrativas'}
        </Text>
        
        {renderActionCard(
          'list-outline',
          t('admin.pendingServices') || 'Serviços Pendentes',
          `${systemStats.pendingServices} aguardando aprovação`,
          () => navigation.navigate('AdminPendingServices'),
          Colors.warning,
          systemStats.pendingServices.toString()
        )}
        
        {renderActionCard(
          'people-outline',
          t('admin.manageRoles') || 'Gerenciar Usuários',
          'Atribuir permissões e roles',
          () => navigation.navigate('AdminManageRoles'),
          Colors.primary
        )}
        
        {renderActionCard(
          'bar-chart-outline',
          t('admin.systemReports') || 'Relatórios do Sistema',
          'Métricas e análises detalhadas',
          () => navigation.navigate('SystemReports'),
          '#8B5CF6'
        )}
        
        {renderActionCard(
          'settings-outline',
          t('admin.systemSettings') || 'Settings',
          'Configurar sistema e políticas',
          () => Alert.alert(t('common.comingSoon') || 'Coming Soon', t('common.featureSoon') || 'Feature coming soon'),
          Colors.textSecondary
        )}
      </View>
*/}
      {/* Recent Activities */}
      <View style={styles.activitiesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('admin.recentActivities') || 'Recent Activities'}
          </Text>
          <TouchableOpacity onPress={() => Alert.alert(t('common.comingSoon') || 'Coming Soon', t('common.featureSoon') || 'Feature coming soon')}>
            <Text style={styles.seeAllText}>
              {t('common.seeAll') || 'Ver todas'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.activitiesContainer}>
          {recentActivities.length > 0 ? (
            recentActivities.map(renderActivityItem)
          ) : (
            <View style={styles.emptyActivities}>
              <Ionicons name="information-circle-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyActivitiesText}>
                Nenhuma atividade recente
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* System Information */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>
          {t('admin.systemInfo') || 'Informações do Sistema'}
        </Text>
        
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={Colors.info} />
          <Text style={styles.infoText}>
            Este painel permite gerenciar usuários, serviços e monitorar a saúde do sistema.
          </Text>
        </View>

        <View style={[styles.infoCard, styles.warningCard]}>
          <Ionicons name="warning" size={24} color={Colors.warning} />
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Nota:</Text> Algumas funcionalidades requerem 
            implementação server-side para funcionalidade completa.
          </Text>
        </View>
      </View>

      {/* Logout Section */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color={Colors.error} />
          <Text style={styles.logoutButtonText}>
            {t('auth.logout') || 'Logout'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.error,
    marginTop: 24,
    textAlign: 'center',
  },
  accessDeniedMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  backButton: {
    marginTop: 32,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  systemStatus: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  systemStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  systemStatusText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  statsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  actionsSection: {
    padding: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    borderWidth: 2,
    borderColor: '#fff',
  },
  actionBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  activitiesSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  activitiesContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyActivities: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyActivitiesText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  infoSection: {
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.info + '15',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  warningCard: {
    backgroundColor: Colors.warning + '15',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    marginLeft: 12,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  logoutSection: {
    padding: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
    marginLeft: 8,
  },
});
