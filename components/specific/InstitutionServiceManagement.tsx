import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, spacing, borderRadius, fontSize } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation';
import { useInstitutionServices } from '../../hooks/useInstitutionServices';
import { 
  InstitutionService, 
  ServiceCategory, 
  ServiceStatus,
  CreateServiceData 
} from '../../types/institutionService';
import ServiceForm from './ServiceForm';
import ServiceCard from './ServiceCard';
import ServiceFilters from './ServiceFilters';

interface InstitutionServiceManagementProps {
  onServiceCreated?: (service: InstitutionService) => void;
  onServiceUpdated?: (service: InstitutionService) => void;
  onServiceDeleted?: (serviceId: string) => void;
}

export const InstitutionServiceManagement: React.FC<InstitutionServiceManagementProps> = ({
  onServiceCreated,
  onServiceUpdated,
  onServiceDeleted
}) => {
  const { t } = useTranslation();
  const {
    services,
    stats,
    isLoading,
    error,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    loadServices,
    refreshServices
  } = useInstitutionServices();

  const [activeTab, setActiveTab] = useState<'list' | 'form' | 'stats'>('list');
  const [editingService, setEditingService] = useState<InstitutionService | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState<InstitutionService[]>([]);

  // Filtrar serviços baseado na busca
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = services.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.responsible.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices(services);
    }
  }, [services, searchQuery]);

  const handleCreateService = async (serviceData: CreateServiceData) => {
    try {
      const newService = await createService(serviceData);
      if (newService) {
        setActiveTab('list');
        onServiceCreated?.(newService);
        Alert.alert(
          'Sucesso',
          'Serviço criado com sucesso!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        'Erro ao criar serviço. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleUpdateService = async (serviceData: Partial<CreateServiceData>) => {
    if (!editingService) return;

    try {
      const updatedService = await updateService(editingService.id, serviceData);
      if (updatedService) {
        setEditingService(null);
        setActiveTab('list');
        onServiceUpdated?.(updatedService);
        Alert.alert(
          'Sucesso',
          'Serviço atualizado com sucesso!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        'Erro ao atualizar serviço. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteService(serviceId);
              if (success) {
                onServiceDeleted?.(serviceId);
                Alert.alert(
                  'Sucesso',
                  'Serviço excluído com sucesso!',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              Alert.alert(
                'Erro',
                'Erro ao excluir serviço. Tente novamente.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  const handleToggleStatus = async (serviceId: string) => {
    try {
      await toggleServiceStatus(serviceId);
    } catch (error) {
      Alert.alert(
        'Erro',
        'Erro ao alterar status do serviço. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleEditService = (service: InstitutionService) => {
    setEditingService(service);
    setActiveTab('form');
  };

  const renderTabButton = (tab: 'list' | 'form' | 'stats', icon: string, label: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={activeTab === tab ? Colors.primary : Colors.text} 
      />
      <Text style={[
        styles.tabButtonText,
        activeTab === tab && styles.tabButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderStatsCard = (title: string, value: number, icon: string, color: string) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsCardHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={styles.statsCardValue}>{value}</Text>
      </View>
      <Text style={styles.statsCardTitle}>{title}</Text>
    </View>
  );

  const renderServiceItem = ({ item }: { item: InstitutionService }) => (
    <ServiceCard
      service={item}
      onEdit={() => handleEditService(item)}
      onDelete={() => handleDeleteService(item.id)}
      onToggleStatus={() => handleToggleStatus(item.id)}
    />
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshServices}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gerenciamento de Serviços</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="filter" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={refreshServices}
          >
            <Ionicons name="refresh" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {renderTabButton('list', 'list', 'Serviços')}
        {renderTabButton('form', 'add-circle', editingService ? 'Editar' : 'Novo')}
        {renderTabButton('stats', 'stats-chart', 'Estatísticas')}
      </View>

      {/* Content */}
      {activeTab === 'list' ? (
        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar serviços..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textSecondary}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Services List */}
          <FlatList
            data={filteredServices}
            renderItem={renderServiceItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.servicesList}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={refreshServices} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="medical" size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado'}
                </Text>
              </View>
            }
          />
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refreshServices} />
          }
        >
          {activeTab === 'form' && (
            <ServiceForm
              service={editingService}
              onSubmit={editingService ? handleUpdateService : handleCreateService}
              onCancel={() => {
                setEditingService(null);
                setActiveTab('list');
              }}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'stats' && (
            <View style={styles.statsContainer}>
              <View style={styles.statsGrid}>
                {renderStatsCard('Total', stats.total, 'medical', Colors.primary)}
                {renderStatsCard('Ativos', stats.active, 'checkmark-circle', Colors.success)}
                {renderStatsCard('Inativos', stats.inactive, 'close-circle', Colors.error)}
              </View>

              {/* Stats by Category */}
              <View style={styles.statsSection}>
                <Text style={styles.statsSectionTitle}>Por Categoria</Text>
                {Object.entries(stats.byCategory).map(([category, count]) => (
                  <View key={category} style={styles.statsItem}>
                    <Text style={styles.statsItemLabel}>{category}</Text>
                    <Text style={styles.statsItemValue}>{count}</Text>
                  </View>
                ))}
              </View>

              {/* Stats by Department */}
              <View style={styles.statsSection}>
                <Text style={styles.statsSectionTitle}>Por Departamento</Text>
                {Object.entries(stats.byDepartment).map(([department, count]) => (
                  <View key={department} style={styles.statsItem}>
                    <Text style={styles.statsItemLabel}>{department}</Text>
                    <Text style={styles.statsItemValue}>{count}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <ServiceFilters
          onClose={() => setShowFilters(false)}
          onApplyFilters={(filters) => {
            // Implementar aplicação de filtros
            setShowFilters(false);
          }}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    padding: spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: fontSize.sm,
    color: Colors.text,
  },
  tabButtonTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: Colors.text,
  },
  servicesList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  errorText: {
    fontSize: fontSize.md,
    color: Colors.error,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  statsContainer: {
    padding: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statsCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
  },
  statsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  statsCardValue: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statsCardTitle: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  statsSection: {
    backgroundColor: Colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  statsSectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  statsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statsItemLabel: {
    fontSize: fontSize.sm,
    color: Colors.text,
    textTransform: 'capitalize',
  },
  statsItemValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
});

export default InstitutionServiceManagement;
