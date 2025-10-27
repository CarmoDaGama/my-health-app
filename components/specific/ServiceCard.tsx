import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, spacing, borderRadius, fontSize } from '../../constants';
import { 
  InstitutionService, 
  ServiceStatus 
} from '../../types/institutionService';

interface ServiceCardProps {
  service: InstitutionService;
  onEdit: (service: InstitutionService) => void;
  onDelete: (service: InstitutionService) => void;
  onToggleStatus: (service: InstitutionService) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.ACTIVE:
        return Colors.success;
      case ServiceStatus.INACTIVE:
        return Colors.error;
      case ServiceStatus.MAINTENANCE:
        return Colors.warning;
      case ServiceStatus.SUSPENDED:
        return Colors.error;
      default:
        return Colors.text;
    }
  };

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.ACTIVE:
        return 'checkmark-circle';
      case ServiceStatus.INACTIVE:
        return 'close-circle';
      case ServiceStatus.MAINTENANCE:
        return 'construct';
      case ServiceStatus.SUSPENDED:
        return 'ban';
      default:
        return 'help-circle';
    }
  };

  const getStatusText = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.ACTIVE:
        return 'Ativo';
      case ServiceStatus.INACTIVE:
        return 'Inativo';
      case ServiceStatus.MAINTENANCE:
        return 'Manutenção';
      case ServiceStatus.SUSPENDED:
        return 'Suspenso';
      default:
        return 'Desconhecido';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'consultation':
        return 'person';
      case 'exam':
        return 'search';
      case 'procedure':
        return 'medical';
      case 'emergency':
        return 'flash';
      case 'laboratory':
        return 'flask';
      case 'imaging':
        return 'camera';
      case 'therapy':
        return 'heart';
      case 'vaccination':
        return 'shield-checkmark';
      default:
        return 'medical';
    }
  };

  return (
    <View style={[
      styles.card,
      service.status !== ServiceStatus.ACTIVE && styles.cardInactive
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons 
            name={getCategoryIcon(service.category) as any} 
            size={24} 
            color={Colors.primary} 
          />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{service.name}</Text>
            <Text style={styles.department}>{service.department}</Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(service.status) + '20' }]}>
            <Ionicons 
              name={getStatusIcon(service.status) as any} 
              size={16} 
              color={getStatusColor(service.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(service.status) }]}>
              {getStatusText(service.status)}
            </Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {service.description}
      </Text>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="person" size={16} color={Colors.text} />
          <Text style={styles.detailText}>{service.responsible}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="time" size={16} color={Colors.text} />
          <Text style={styles.detailText}>{service.duration} min</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="card" size={16} color={Colors.text} />
          <Text style={styles.detailText}>€{service.price.toFixed(2)}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(service)}
        >
          <Ionicons name="create" size={18} color={Colors.primary} />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.statusButton]}
          onPress={() => onToggleStatus(service)}
        >
          <Ionicons 
            name={service.status === ServiceStatus.ACTIVE ? 'pause' : 'play'} 
            size={18} 
            color={Colors.warning} 
          />
          <Text style={styles.statusButtonText}>
            {service.status === ServiceStatus.ACTIVE ? 'Desativar' : 'Ativar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(service)}
        >
          <Ionicons name="trash" size={18} color={Colors.error} />
          <Text style={styles.deleteButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardInactive: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  department: {
    fontSize: fontSize.sm,
    color: Colors.text,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  statusText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  description: {
    fontSize: fontSize.sm,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  detailText: {
    fontSize: fontSize.sm,
    color: Colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary + '30',
  },
  editButtonText: {
    fontSize: fontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  statusButton: {
    backgroundColor: Colors.warning + '10',
    borderColor: Colors.warning + '30',
  },
  statusButtonText: {
    fontSize: fontSize.sm,
    color: Colors.warning,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: Colors.error + '10',
    borderColor: Colors.error + '30',
  },
  deleteButtonText: {
    fontSize: fontSize.sm,
    color: Colors.error,
    fontWeight: '500',
  },
});

export default ServiceCard;
