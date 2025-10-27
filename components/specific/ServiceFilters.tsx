import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, spacing, borderRadius, fontSize } from '../../constants';
import { 
  ServiceFilters as ServiceFiltersType,
  ServiceCategory,
  ServiceStatus 
} from '../../types/institutionService';

interface ServiceFiltersProps {
  onClose: () => void;
  onApplyFilters: (filters: ServiceFiltersType) => void;
  initialFilters?: ServiceFiltersType;
}

const ServiceFilters: React.FC<ServiceFiltersProps> = ({
  onClose,
  onApplyFilters,
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState<ServiceFiltersType>(initialFilters);

  const categories = [
    { value: undefined, label: 'Todas as Categorias' },
    { value: ServiceCategory.CONSULTATION, label: 'Consulta' },
    { value: ServiceCategory.EXAM, label: 'Exame' },
    { value: ServiceCategory.PROCEDURE, label: 'Procedimento' },
    { value: ServiceCategory.EMERGENCY, label: 'Emergência' },
    { value: ServiceCategory.ADMINISTRATIVE, label: 'Administrativo' },
    { value: ServiceCategory.LABORATORY, label: 'Laboratório' },
    { value: ServiceCategory.IMAGING, label: 'Imagem' },
    { value: ServiceCategory.THERAPY, label: 'Terapia' },
    { value: ServiceCategory.VACCINATION, label: 'Vacinação' },
    { value: ServiceCategory.OTHER, label: 'Outro' }
  ];

  const statuses = [
    { value: undefined, label: 'Todos os Status' },
    { value: ServiceStatus.ACTIVE, label: 'Ativo' },
    { value: ServiceStatus.INACTIVE, label: 'Inativo' },
    { value: ServiceStatus.MAINTENANCE, label: 'Manutenção' },
    { value: ServiceStatus.SUSPENDED, label: 'Suspenso' }
  ];

  const availabilityOptions = [
    { value: undefined, label: 'Qualquer Disponibilidade' },
    { value: true, label: 'Disponível' },
    { value: false, label: 'Indisponível' }
  ];

  const updateFilter = (key: keyof ServiceFiltersType, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const renderFilterSection = (
    title: string,
    options: Array<{ value: any; label: string }>,
    currentValue: any,
    onSelect: (value: any) => void
  ) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              currentValue === option.value && styles.optionSelected
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text style={[
              styles.optionText,
              currentValue === option.value && styles.optionTextSelected
            ]}>
              {option.label}
            </Text>
            {currentValue === option.value && (
              <Ionicons name="checkmark" size={16} color={Colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Filtrar Serviços</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderFilterSection(
            'Categoria',
            categories,
            filters.category,
            (value) => updateFilter('category', value)
          )}

          {renderFilterSection(
            'Status',
            statuses,
            filters.status,
            (value) => updateFilter('status', value)
          )}

          {renderFilterSection(
            'Disponibilidade',
            availabilityOptions,
            filters.isAvailable,
            (value) => updateFilter('isAvailable', value)
          )}
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={clearFilters}
          >
            <Text style={styles.clearButtonText}>Limpar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.applyButton]}
            onPress={applyFilters}
          >
            <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  filterSection: {
    marginBottom: spacing.lg,
  },
  filterTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  optionsContainer: {
    gap: spacing.xs,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionSelected: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: fontSize.md,
    color: Colors.text,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clearButtonText: {
    fontSize: fontSize.md,
    color: Colors.text,
  },
  applyButton: {
    backgroundColor: Colors.primary,
  },
  applyButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default ServiceFilters;
