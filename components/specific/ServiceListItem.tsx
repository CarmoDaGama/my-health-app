import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { HealthService } from '../../types';
import { Colors, spacing, borderRadius, fontSize } from '../../constants';
import i18n from '../../utils/i18n';

interface ServiceListItemProps {
  service: HealthService;
  onPress: () => void;
  distance?: number;
}

export const ServiceListItem: React.FC<ServiceListItemProps> = ({
  service,
  onPress,
  distance,
}) => {
  const getServiceTypeLabel = (type: string) => {
    return i18n.t(`services.${type}`);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${service.phone}`);
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${service.coordinates.latitude},${service.coordinates.longitude}`;
    Linking.openURL(url);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.name}>{service.name}</Text>
          <Text style={styles.type}>{getServiceTypeLabel(service.type)}</Text>
        </View>
        {distance && (
          <Text style={styles.distance}>{distance.toFixed(1)} km</Text>
        )}
      </View>
      
      <Text style={styles.address}>{service.address}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {service.description}
      </Text>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
          <Text style={styles.actionText}>{i18n.t('actions.call')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
          <Text style={styles.actionText}>{i18n.t('actions.directions')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  type: {
    fontSize: fontSize.sm,
    color: Colors.primary,
    textTransform: 'capitalize',
  },
  distance: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  address: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: spacing.sm,
  },
  actionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  actionText: {
    fontSize: fontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
});
