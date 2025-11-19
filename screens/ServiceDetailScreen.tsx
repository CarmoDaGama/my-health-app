import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HealthService, Review } from '../types';
import { ServiceDetailScreenNavigationProp, ServiceDetailScreenRouteProp } from '../types/navigation';
import { Button } from '../components/common/Button';
import { Colors, spacing, borderRadius, fontSize } from '../constants';
import { ReviewForm } from '../components/specific/ReviewForm';
import { ReviewsList } from '../components/specific/ReviewsList';
import { ReviewsPreview } from '../components/specific/ReviewsPreview';
import { ThematicReviewForm } from '../components/specific/ThematicReviewForm';
import { ServiceReviews } from '../components/specific/ServiceReviews';
import { useReviews } from '../hooks/useReviews';
import { useAuth } from '../hooks/useAuth-firebase';
import { useTranslation } from '../hooks/useTranslation';

interface ServiceDetailScreenProps {
  navigation: ServiceDetailScreenNavigationProp;
  route: ServiceDetailScreenRouteProp;
}

export const ServiceDetailScreen: React.FC<ServiceDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { service } = route.params;
  const { isAuthenticated } = useAuth();
  const { checkUserReview } = useReviews();
  const { t } = useTranslation();
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  // Thematic Reviews states
  const [showThematicReviewForm, setShowThematicReviewForm] = useState(false);
  const [showThematicReviews, setShowThematicReviews] = useState(false);
  const [activeReviewTab, setActiveReviewTab] = useState<'traditional' | 'thematic'>('thematic');

  const getServiceTypeLabel = (type: string) => {
    if (type === 'professional') return t('serviceDetail.professionalDetails');
    return t(`services.${type}`);
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

  // Check if user has already reviewed this service
  useEffect(() => {
    const checkUserReviewStatus = async () => {
      if (isAuthenticated && service.id) {
        const existingReview = await checkUserReview(service.id);
        setUserReview(existingReview);
      }
    };
    
    checkUserReviewStatus();
  }, [isAuthenticated, service.id, checkUserReview]);

  const handleAddReview = () => {
    if (!isAuthenticated) {
      Alert.alert(
        t('serviceDetail.loginRequired'),
        t('serviceDetail.loginRequiredMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('auth.login'), onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    
    // Use thematic reviews by default
    if (activeReviewTab === 'thematic') {
      setShowThematicReviewForm(true);
    } else {
      setEditingReview(null);
      setShowReviewForm(true);
    }
  };

  const handleThematicReviewSubmitted = (reviewId: string) => {
    console.log('Review temático enviado:', reviewId);
    setShowThematicReviewForm(false);
    // Refresh reviews or show success message
  };

  const handleShowReviews = () => {
    if (activeReviewTab === 'thematic') {
      setShowThematicReviews(true);
    } else {
      setShowAllReviews(true);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleReviewSuccess = async () => {
    // Refresh user review status
    if (isAuthenticated && service.id) {
      const updatedReview = await checkUserReview(service.id);
      setUserReview(updatedReview);
    }
  };

  const handleCloseReviewForm = () => {
    setShowReviewForm(false);
    setEditingReview(null);
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
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Avaliações</Text>
          {service.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.ratingText}>
                {service.rating}/5.0
              </Text>
              <Text style={styles.reviewsText}>
                ({service.reviews || 0})
              </Text>
            </View>
          )}
        </View>
        
        {/* Review Actions */}
        <View style={styles.reviewActions}>
          {userReview ? (
            <TouchableOpacity
              style={[styles.reviewButton, styles.editReviewButton]}
              onPress={() => handleEditReview(userReview)}
            >
              <Ionicons name="pencil" size={16} color="#2196F3" />
              <Text style={[styles.reviewButtonText, { color: '#2196F3' }]}>
                {t('serviceDetail.editMyReview')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={handleAddReview}
            >
              <Ionicons name="star" size={16} color="#FFF" />
              <Text style={styles.reviewButtonText}>{t('serviceDetail.rateService')}</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.reviewButton, styles.viewAllButton]}
            onPress={() => setShowAllReviews(true)}
          >
            <Ionicons name="list" size={16} color="#666" />
            <Text style={[styles.reviewButtonText, { color: '#666' }]}>
              {t('actions.viewAll')}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Reviews Preview */}
        <View style={styles.reviewsPreview}>
          <ReviewsPreview
            serviceId={service.id}
            onEditReview={handleEditReview}
            maxReviews={3}
          />
        </View>
      </View>

      {/* Especialidade */}
      {service.specialty && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('serviceDetail.specialty')}</Text>
          <Text style={styles.sectionContent}>{service.specialty}</Text>
        </View>
      )}

      {/* Clínica */}
      {service.clinic && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('details.services')}</Text>
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
          <Text style={styles.sectionTitle}>{t('serviceDetail.businessHours')}</Text>
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

      {/* Avaliações */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Avaliações</Text>
          {service.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.ratingText}>
                {service.rating}/5.0
              </Text>
              <Text style={styles.reviewsText}>
                ({service.reviews || 0})
              </Text>
            </View>
          )}
        </View>
        
        {/* Review Actions */}
        <View style={styles.reviewActions}>
          {userReview ? (
            <TouchableOpacity
              style={[styles.reviewButton, styles.editReviewButton]}
              onPress={() => handleEditReview(userReview)}
            >
              <Ionicons name="pencil" size={16} color="#2196F3" />
              <Text style={[styles.reviewButtonText, { color: '#2196F3' }]}>
                {t('serviceDetail.editMyReview')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={handleAddReview}
            >
              <Ionicons name="star" size={16} color="#FFF" />
              <Text style={styles.reviewButtonText}>{t('serviceDetail.rateService')}</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.reviewButton, styles.viewAllButton]}
            onPress={() => setShowAllReviews(true)}
          >
            <Ionicons name="list" size={16} color="#666" />
            <Text style={[styles.reviewButtonText, { color: '#666' }]}>
              {t('actions.viewAll')}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Reviews Preview */}
        <View style={styles.reviewsPreview}>
          <ReviewsPreview
            serviceId={service.id}
            onEditReview={handleEditReview}
            maxReviews={3}
          />
        </View>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primary} />

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
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('details.address')}</Text>
            <Text style={styles.sectionContent}>
              {service.address}
              {'\n'}
              {service.city}, {service.state}
              {service.country && `, ${service.country}`}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('details.description')}</Text>
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
      
      {/* Review Form Modal */}
      <ReviewForm
        serviceId={service.id}
        serviceName={service.name}
        visible={showReviewForm}
        onClose={handleCloseReviewForm}
        onSuccess={handleReviewSuccess}
        existingReview={editingReview ? {
          id: editingReview.id,
          rating: editingReview.rating,
          comment: editingReview.comment,
        } : undefined}
      />
      
      {/* Thematic Review Form Modal */}
      {showThematicReviewForm && (
        <View style={styles.fullScreenModal}>
          <SafeAreaView style={styles.modalContainer}>
            <ThematicReviewForm
              service={service}
              onReviewSubmitted={handleThematicReviewSubmitted}
              onCancel={() => setShowThematicReviewForm(false)}
            />
          </SafeAreaView>
        </View>
      )}

      {/* Thematic Reviews Modal */}
      {showThematicReviews && (
        <View style={styles.fullScreenModal}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowThematicReviews(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Avaliações Temáticas</Text>
              <View style={styles.modalPlaceholder} />
            </View>
            <ServiceReviews
              service={service}
              onWriteReview={() => {
                setShowThematicReviews(false);
                setShowThematicReviewForm(true);
              }}
            />
          </SafeAreaView>
        </View>
      )}

      {/* All Reviews Modal */}
      {showAllReviews && (
        <View style={styles.fullScreenModal}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAllReviews(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{t('reviews.allReviews')}</Text>
              <View style={styles.modalPlaceholder} />
            </View>
            <ReviewsList
              serviceId={service.id}
              onEditReview={handleEditReview}
              showFilters={true}
            />
          </SafeAreaView>
        </View>
      )}
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
    justifyContent: 'flex-start',
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
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
    color: Colors.text,
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
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  sectionContent: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
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
    color: Colors.text,
    marginLeft: spacing.sm,
  },
  reviewsText: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
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
    color: Colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  scheduleText: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
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
    color: Colors.text,
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
    color: Colors.text,
    marginLeft: spacing.md,
  },
  actionsContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  actionSpacing: {
    height: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  reviewActions: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    flex: 1,
    justifyContent: 'center',
  },
  editReviewButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  viewAllButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  reviewButtonText: {
    color: '#FFF',
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  reviewsPreview: {
    backgroundColor: Colors.background,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  fullScreenModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFF',
    zIndex: 1000,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  modalCloseButton: {
    padding: spacing.sm,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  modalPlaceholder: {
    width: 40,
  },
  
  // Thematic Reviews Styles
  reviewTabs: {
    flexDirection: 'row',
    marginVertical: spacing.md,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: spacing.xs,
  },
  reviewTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    position: 'relative',
  },
  reviewTabActive: {
    backgroundColor: Colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reviewTabText: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  reviewTabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  newBadge: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.xs,
    backgroundColor: Colors.error,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 8,
    color: Colors.surface,
    fontWeight: 'bold',
  },
  thematicPreview: {
    backgroundColor: Colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    margin: spacing.md,
  },
  thematicPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  thematicPreviewTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: spacing.sm,
  },
  thematicPreviewDescription: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  tryThematicButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  tryThematicButtonText: {
    color: Colors.surface,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
