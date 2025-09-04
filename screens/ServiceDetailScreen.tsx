import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
} from 'react-native';
import { HealthService } from '../types';
import { ServiceDetailScreenNavigationProp, ServiceDetailScreenRouteProp } from '../types/navigation';
import { Button } from '../components/common/Button';
import { Colors, spacing, borderRadius, fontSize } from '../constants';
import i18n from '../utils/i18n';

interface ServiceDetailScreenProps {
  navigation: ServiceDetailScreenNavigationProp;
  route: ServiceDetailScreenRouteProp;
}

export const ServiceDetailScreen: React.FC<ServiceDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { service } = route.params;

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

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primary} />
      
      <View style={styles.header}>
        <Button
          title={i18n.t('actions.back')}
          onPress={handleBack}
          variant="outline"
          size="small"
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.serviceCard}>
          <View style={styles.titleSection}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceType}>{getServiceTypeLabel(service.type)}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{i18n.t('details.address')}</Text>
            <Text style={styles.sectionContent}>
              {service.address}
              {'\n'}
              {service.city}, {service.state}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{i18n.t('details.phone')}</Text>
            <Text style={styles.sectionContent}>{service.phone}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{i18n.t('details.description')}</Text>
            <Text style={styles.sectionContent}>{service.description}</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <Button
            title={i18n.t('actions.call')}
            onPress={handleCall}
            variant="primary"
            size="large"
          />
          
          <View style={styles.actionSpacing} />
          
          <Button
            title={i18n.t('actions.directions')}
            onPress={handleDirections}
            variant="secondary"
            size="large"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  content: {
    flex: 1,
  },
  serviceCard: {
    backgroundColor: Colors.surface,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  titleSection: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  serviceName: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: spacing.sm,
  },
  serviceType: {
    fontSize: fontSize.lg,
    color: Colors.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: spacing.sm,
  },
  sectionContent: {
    fontSize: fontSize.md,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  actionsContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  actionSpacing: {
    height: spacing.md,
  },
});
