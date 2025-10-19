/**
 * Tela de Dashboard Administrativo
 * 
 * Visão geral do painel de controle admin com:
 * - Estatísticas de serviços (pendentes, aprovados, rejeitados)
 * - Atalhos para principais ações
 * - Lista de atividades recentes
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { getServicesStats } from '../services/approval-client';
import { isCurrentUserAdmin } from '../services/roles-client';
import LoadingSpinner from '../components/common/LoadingSpinner';

type NavigationProp = StackNavigationProp<any>;

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export default function AdminDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const adminStatus = await isCurrentUserAdmin();
      setIsAdmin(adminStatus);
      
      if (!adminStatus) {
        Alert.alert(
          'Acesso Negado',
          'Você não tem permissão para acessar esta área.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      await loadStats();
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await getServicesStats();
      if (result.success && result.stats) {
        setStats(result.stats);
      } else {
        Alert.alert('Erro', result.error || 'Erro ao carregar estatísticas');
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="lock-closed" size={64} color={Colors.error} />
        <Text style={styles.errorText}>Acesso Negado</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={48} color={Colors.primary} />
        <Text style={styles.headerTitle}>Painel Administrativo</Text>
        <Text style={styles.headerSubtitle}>Gerenciamento do Sistema</Text>
      </View>

      {/* Estatísticas */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Estatísticas</Text>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.pendingCard]}>
            <Ionicons name="time-outline" size={32} color={Colors.warning} />
            <Text style={styles.statNumber}>{stats?.pending || 0}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>

          <View style={[styles.statCard, styles.approvedCard]}>
            <Ionicons name="checkmark-circle-outline" size={32} color={Colors.success} />
            <Text style={styles.statNumber}>{stats?.approved || 0}</Text>
            <Text style={styles.statLabel}>Aprovados</Text>
          </View>

          <View style={[styles.statCard, styles.rejectedCard]}>
            <Ionicons name="close-circle-outline" size={32} color={Colors.error} />
            <Text style={styles.statNumber}>{stats?.rejected || 0}</Text>
            <Text style={styles.statLabel}>Rejeitados</Text>
          </View>

          <View style={[styles.statCard, styles.totalCard]}>
            <Ionicons name="bar-chart-outline" size={32} color={Colors.primary} />
            <Text style={styles.statNumber}>{stats?.total || 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>

      {/* Ações Rápidas */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AdminPendingServices')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="list-outline" size={24} color={Colors.primary} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Serviços Pendentes</Text>
            <Text style={styles.actionDescription}>
              Aprovar ou rejeitar profissionais
            </Text>
          </View>
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeText}>{stats?.pending || 0}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AdminManageRoles')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="people-outline" size={24} color={Colors.primary} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Gerenciar Roles</Text>
            <Text style={styles.actionDescription}>
              Atribuir e remover permissões de admin
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            Alert.alert(
              'Em Desenvolvimento',
              'Visualização de logs estará disponível em breve.'
            );
          }}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="document-text-outline" size={24} color={Colors.primary} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Logs de Atividade</Text>
            <Text style={styles.actionDescription}>
              Ver histórico de ações administrativas
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Informações Importantes */}
      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={Colors.info} />
          <Text style={styles.infoText}>
            Este painel permite gerenciar profissionais e administradores do sistema.
          </Text>
        </View>

        <View style={[styles.infoCard, styles.warningCard]}>
          <Ionicons name="warning" size={24} color={Colors.warning} />
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Nota:</Text> Esta é uma implementação client-side.
            Emails não são enviados automaticamente. Para funcionalidade completa,
            use Cloud Functions (requer Firebase Blaze plan).
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  statsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  approvedCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  rejectedCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  totalCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  actionsContainer: {
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  actionDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  actionBadge: {
    backgroundColor: Colors.warning,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  actionBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: `${Colors.info}15`,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  warningCard: {
    backgroundColor: `${Colors.warning}15`,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text.primary,
    marginLeft: 12,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.error,
    marginTop: 16,
  },
});
