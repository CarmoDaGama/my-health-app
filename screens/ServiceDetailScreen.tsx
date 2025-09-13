import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    if (type === 'professional') return 'Profissional';
    return i18n.t(`services.${type}`);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${service.phone}`);
  };

  const handleEmail = () => {
    if (service.email) {
      Linking.openURL(`mailto:${service.email}`);
    }
  };

  const handleDirections = () => {
    navigation.navigate('MapDirections', { service });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const formatSchedule = (schedule: any) => {
    if (!schedule) return 'Não informado';
    
    const days = {
      monday: 'Segunda',
      tuesday: 'Terça', 
      wednesday: 'Quarta',
      thursday: 'Quinta',
      friday: 'Sexta',
      saturday: 'Sábado',
      sunday: 'Domingo'
    };

    return Object.entries(schedule)
      .filter(([_, time]) => time)
      .map(([day, time]) => `${days[day as keyof typeof days]}: ${time}`)
      .join('\n');
  };

  const renderProfessionalDetails = () => (
    <>
      {/* Avaliações */}
      {service.rating && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avaliações</Text>
          <View style={styles.ratingSection}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={styles.ratingText}>
                {service.rating}/5.0
              </Text>
              <Text style={styles.reviewsText}>
                ({service.reviews} avaliações)
              </Text>
            </View>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.floor(service.rating!) ? "star" : star <= service.rating! ? "star-half" : "star-outline"}
                  size={20}
                  color="#FFD700"
                  style={styles.star}
                />
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Especialidade */}
      {service.specialty && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Especialidade</Text>
          <Text style={styles.sectionContent}>{service.specialty}</Text>
        </View>
      )}

      {/* Clínica */}
      {service.clinic && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clínica/Hospital</Text>
          <Text style={styles.sectionContent}>{service.clinic}</Text>
        </View>
      )}

      {/* Serviços */}
      {service.services && service.services.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serviços Oferecidos</Text>
          {service.services.map((serviceItem, index) => (
            <View key={index} style={styles.serviceItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
              <Text style={styles.serviceItemText}>{serviceItem}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Horários */}
      {service.schedule && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horários de Atendimento</Text>
          <Text style={styles.scheduleText}>{formatSchedule(service.schedule)}</Text>
        </View>
      )}

      {/* Formação */}
      {service.education && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Formação</Text>
          <Text style={styles.sectionContent}>{service.education}</Text>
        </View>
      )}

      {/* Experiência */}
      {service.experience && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experiência</Text>
          <Text style={styles.sectionContent}>{service.experience}</Text>
        </View>
      )}
    </>
  );

  const renderInstitutionDetails = () => (
    <>
      {/* Serviços */}
      {service.services && service.services.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serviços Disponíveis</Text>
          {service.services.map((serviceItem, index) => (
            <View key={index} style={styles.serviceItem}>
              <Ionicons name="medical" size={16} color={Colors.primary} />
              <Text style={styles.serviceItemText}>{serviceItem}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Avaliação */}
      {service.rating && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avaliação</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.ratingText}>{service.rating}/5.0</Text>
          </View>
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primary} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {service.type === 'professional' ? 'Detalhes do Profissional' : 'Detalhes da Instituição'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.serviceCard}>
          <View style={styles.titleSection}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={service.type === 'professional' ? 'person' : 'medical'} 
                size={40} 
                color={Colors.primary} 
              />
            </View>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceType}>{getServiceTypeLabel(service.type)}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Endereço</Text>
            <Text style={styles.sectionContent}>
              {service.address}
              {'\n'}
              {service.city}, {service.state}
              {service.country && `, ${service.country}`}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.sectionContent}>{service.description}</Text>
          </View>

          {service.type === 'professional' ? renderProfessionalDetails() : renderInstitutionDetails()}
        </View>

        {/* Contatos */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Contatos</Text>
          
          <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
            <Ionicons name="call" size={20} color={Colors.primary} />
            <Text style={styles.contactText}>{service.phone}</Text>
          </TouchableOpacity>

          {service.email && (
            <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
              <Ionicons name="mail" size={20} color={Colors.primary} />
              <Text style={styles.contactText}>{service.email}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.contactItem} onPress={handleDirections}>
            <Ionicons name="navigate" size={20} color={Colors.primary} />
            <Text style={styles.contactText}>Obter direções</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsContainer}>
          <Button
            title="Ligar Agora"
            onPress={handleCall}
            variant="primary"
            size="large"
          />
          
          <View style={styles.actionSpacing} />
          
          <Button
            title="Obter Direções"
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: Colors.text.primary,
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
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  serviceName: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
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
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: spacing.sm,
  },
  sectionContent: {
    fontSize: fontSize.md,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  ratingSection: {
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ratingText: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginLeft: spacing.sm,
  },
  reviewsText: {
    fontSize: fontSize.md,
    color: Colors.text.secondary,
    marginLeft: spacing.sm,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 2,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  serviceItemText: {
    fontSize: fontSize.md,
    color: Colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  scheduleText: {
    fontSize: fontSize.md,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
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
  contactTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contactText: {
    fontSize: fontSize.md,
    color: Colors.text.primary,
    marginLeft: spacing.md,
  },
  actionsContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  actionSpacing: {
    height: spacing.md,
  },
});
