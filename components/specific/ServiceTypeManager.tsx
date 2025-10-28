import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, spacing, borderRadius, fontSize } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation';
import { ServiceCategory } from '../../types/institutionService';
import { HealthServiceAPIFirebase } from '../../services/api-firebase';

interface ServiceType {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  isDefault: boolean;
  isActive: boolean;
}

interface ServiceTypeManagerProps {
  visible: boolean;
  onClose: () => void;
  userType: 'professional' | 'institution';
  onServiceTypeAdded?: (serviceType: ServiceType) => void;
  onServiceTypeRemoved?: (serviceTypeId: string) => void;
}

export const ServiceTypeManager: React.FC<ServiceTypeManagerProps> = ({
  visible,
  onClose,
  userType,
  onServiceTypeAdded,
  onServiceTypeRemoved,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'add' | 'remove'>('add');
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form states for adding new service type
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDescription, setNewServiceDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>(ServiceCategory.CONSULTATION);

  useEffect(() => {
    if (visible) {
      loadServiceTypes();
    }
  }, [visible]);

  const loadServiceTypes = async () => {
    setLoading(true);
    try {
      const userServiceTypes = await HealthServiceAPIFirebase.getUserServiceTypes();
      
      // Convert string array to ServiceType objects
      const serviceTypeObjects: ServiceType[] = userServiceTypes.map((serviceTypeName, index) => ({
        id: `${index + 1}`,
        name: serviceTypeName,
        description: `Serviço de ${serviceTypeName}`,
        category: ServiceCategory.OTHER, // Default category, could be enhanced
        isDefault: false,
        isActive: true,
      }));
      
      setServiceTypes(serviceTypeObjects);
    } catch (error) {
      console.error('Erro ao carregar tipos de serviço:', error);
      Alert.alert('Erro', 'Não foi possível carregar os tipos de serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleAddServiceType = async () => {
    if (!newServiceName.trim()) {
      Alert.alert('Erro', 'Nome do serviço é obrigatório');
      return;
    }

    setLoading(true);
    try {
      // Add service type to Firebase
      await HealthServiceAPIFirebase.addServiceType(newServiceName.trim(), userType);
      
      // Reload service types
      await loadServiceTypes();
      
      // Clear form
      setNewServiceName('');
      setNewServiceDescription('');
      setSelectedCategory(ServiceCategory.CONSULTATION);
      
      Alert.alert(
        t('common.success') || 'Sucesso',
        t('serviceType.addedSuccessfully') || 'Tipo de serviço adicionado com sucesso!'
      );
    } catch (error) {
      console.error('Erro ao adicionar tipo de serviço:', error);
      const errorMessage = error instanceof Error ? error.message : 'Não foi possível adicionar o tipo de serviço';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveServiceType = async (serviceType: ServiceType) => {
    Alert.alert(
      t('common.confirm') || 'Confirmar',
      `${t('serviceType.removeConfirm') || 'Tem certeza que deseja remover'} "${serviceType.name}"?`,
      [
        { text: t('common.cancel') || 'Cancelar', style: 'cancel' },
        {
          text: t('common.delete') || 'Remover',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Remove service type from Firebase
              await HealthServiceAPIFirebase.removeServiceType(serviceType.name);
              
              // Reload service types
              await loadServiceTypes();
              
              Alert.alert(
                t('common.success') || 'Sucesso',
                t('serviceType.removedSuccessfully') || 'Tipo de serviço removido com sucesso!'
              );
            } catch (error) {
              console.error('Erro ao remover tipo de serviço:', error);
              const errorMessage = error instanceof Error ? error.message : 'Não foi possível remover o tipo de serviço';
              Alert.alert('Erro', errorMessage);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const toggleServiceTypeStatus = async (serviceType: ServiceType) => {
    if (serviceType.isDefault) {
      Alert.alert(
        'Não Permitido',
        'Tipos de serviço padrão não podem ser desativados'
      );
      return;
    }

    setLoading(true);
    try {
      // Simulate API call - in real app, send to backend
      setServiceTypes(prev => 
        prev.map(st => 
          st.id === serviceType.id 
            ? { ...st, isActive: !st.isActive }
            : st
        )
      );
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      Alert.alert('Erro', 'Não foi possível alterar o status');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: ServiceCategory): string => {
    const labels = {
      [ServiceCategory.CONSULTATION]: 'Consulta',
      [ServiceCategory.EXAM]: 'Exame',
      [ServiceCategory.PROCEDURE]: 'Procedimento',
      [ServiceCategory.EMERGENCY]: 'Emergência',
      [ServiceCategory.ADMINISTRATIVE]: 'Administrativo',
      [ServiceCategory.LABORATORY]: 'Laboratório',
      [ServiceCategory.IMAGING]: 'Imagem',
      [ServiceCategory.THERAPY]: 'Terapia',
      [ServiceCategory.VACCINATION]: 'Vacinação',
      [ServiceCategory.OTHER]: 'Outro',
    };
    return labels[category] || category;
  };

  const renderTabButton = (tab: 'add' | 'remove', icon: string, label: string) => (
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

  const renderServiceTypeItem = ({ item }: { item: ServiceType }) => (
    <View style={styles.serviceTypeItem}>
      <View style={styles.serviceTypeInfo}>
        <View style={styles.serviceTypeHeader}>
          <Text style={styles.serviceTypeName}>{item.name}</Text>
          <View style={styles.serviceTypeBadges}>
            {item.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Padrão</Text>
              </View>
            )}
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.isActive ? Colors.success : Colors.error }
            ]}>
              <Text style={styles.statusBadgeText}>
                {item.isActive ? t('status.active') || 'Ativo' : t('status.inactive') || 'Inativo'}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.serviceTypeDescription}>{item.description}</Text>
        <Text style={styles.serviceTypeCategory}>
          Categoria: {getCategoryLabel(item.category)}
        </Text>
      </View>
      
      <View style={styles.serviceTypeActions}>
        {!item.isDefault && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.toggleButton]}
              onPress={() => toggleServiceTypeStatus(item)}
              disabled={loading}
            >
              <Ionicons 
                name={item.isActive ? 'pause' : 'play'} 
                size={16} 
                color={Colors.primary} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleRemoveServiceType(item)}
              disabled={loading}
            >
              <Ionicons name="trash" size={16} color={Colors.error} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const renderAddForm = () => (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formTitle}>
        {t('serviceType.addNew') || 'Adicionar Novo Tipo de Serviço'}
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nome do Serviço *</Text>
        <TextInput
          style={styles.textInput}
          value={newServiceName}
          onChangeText={setNewServiceName}
          placeholder="Ex: Consulta Cardiológica"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Descrição *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={newServiceDescription}
          onChangeText={setNewServiceDescription}
          placeholder="Descreva o tipo de serviço..."
          placeholderTextColor={Colors.textSecondary}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Categoria</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categorySelector}>
            {Object.values(ServiceCategory).map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryItem,
                  selectedCategory === category && styles.categoryItemSelected
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryItemText,
                  selectedCategory === category && styles.categoryItemTextSelected
                ]}>
                  {getCategoryLabel(category)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleAddServiceType}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Adicionando...' : 'Adicionar Tipo de Serviço'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderRemoveList = () => (
    <View style={styles.listContainer}>
      <Text style={styles.formTitle}>
        {t('serviceType.manageExisting') || 'Gerenciar Tipos de Serviço'}
      </Text>
      
      <FlatList
        data={serviceTypes}
        renderItem={renderServiceTypeItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="medical" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>
              Nenhum tipo de serviço cadastrado
            </Text>
          </View>
        }
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t('serviceType.management') || 'Gestão de Tipos de Serviço'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {renderTabButton('add', 'add-circle', t('common.add') || 'Adicionar')}
          {renderTabButton('remove', 'list', t('common.manage') || 'Gerenciar')}
        </View>

        {/* Content */}
        {activeTab === 'add' ? renderAddForm() : renderRemoveList()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerSpacer: {
    width: 24,
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
  formContainer: {
    flex: 1,
    padding: spacing.md,
  },
  formTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: Colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  categoryItem: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  categoryItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryItemText: {
    fontSize: fontSize.sm,
    color: Colors.text,
  },
  categoryItemTextSelected: {
    color: Colors.surface,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  submitButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: Colors.surface,
  },
  listContainer: {
    flex: 1,
    padding: spacing.md,
  },
  serviceTypeItem: {
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceTypeInfo: {
    flex: 1,
  },
  serviceTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  serviceTypeName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  serviceTypeBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  defaultBadge: {
    backgroundColor: Colors.info,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: Colors.surface,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusBadgeText: {
    fontSize: 10,
    color: Colors.surface,
    fontWeight: '600',
  },
  serviceTypeDescription: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  serviceTypeCategory: {
    fontSize: fontSize.xs,
    color: Colors.primary,
    fontWeight: '500',
  },
  serviceTypeActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: Colors.primary + '15',
  },
  deleteButton: {
    backgroundColor: Colors.error + '15',
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
});

export default ServiceTypeManager;