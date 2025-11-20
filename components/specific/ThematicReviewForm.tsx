/**
 * MENDLINK - Componente de Avaliação Temática
 * Interface para usuários avaliarem serviços por categorias
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, spacing, fontSize } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth-firebase';
import { useThematicReviews } from '../../hooks/useThematicReviews';
import { CategoryRating, ServiceType, REVIEW_CATEGORIES } from '../../types/reviews';
import { HealthService } from '../../types';

interface ThematicReviewFormProps {
  service: HealthService;
  onReviewSubmitted: (reviewId: string) => void;
  onCancel: () => void;
}

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  onRatingChange, 
  size = 24, 
  disabled = false 
}) => {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => !disabled && onRatingChange(star)}
          disabled={disabled}
          style={styles.starButton}
        >
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? Colors.warning : Colors.border}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export const ThematicReviewForm: React.FC<ThematicReviewFormProps> = ({
  service,
  onReviewSubmitted,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { createReview, isLoading: isCreatingReview, error: reviewError } = useThematicReviews();

  // 🚨 TEMPORÁRIO: Debug logging (auth check removido temporariamente)
  React.useEffect(() => {
    console.log('🔍 [ThematicReviewForm] Auth Check:', {
      isAuthenticated,
      hasUser: !!user,
      userId: user?.id,
      userType: (user as any)?.userType
    });
    
    // ⚠️ TEMPORÁRIO: Comentado para permitir debug
    // if (!isAuthenticated || !user || user.id === 'guest') {
    //   console.error('❌ ThematicReviewForm aberto sem autenticação!');
    //   Alert.alert(...);
    // }
  }, [isAuthenticated, user, onCancel]);

  // ⚠️ TEMPORÁRIO: Permitir renderização mesmo sem auth para debug
  // if (!isAuthenticated || !user || user.id === 'guest') {
  //   return (
  //     <View style={styles.container}>
  //       <View style={styles.authWarning}>
  //         ...
  //       </View>
  //     </View>
  //   );
  // }
  const [categoryRatings, setCategoryRatings] = useState<CategoryRating[]>([]);
  const [generalComment, setGeneralComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitType, setVisitType] = useState<string>('consultation');

  const serviceType = service.type as ServiceType;
  const availableCategories = REVIEW_CATEGORIES[serviceType] || [];

  // Inicializar ratings das categorias
  useEffect(() => {
    const initialRatings: CategoryRating[] = availableCategories.map(category => ({
      categoryId: category.id,
      rating: 0,
      comment: ''
    }));
    setCategoryRatings(initialRatings);
  }, [serviceType]);

  const updateCategoryRating = (categoryId: string, rating: number) => {
    setCategoryRatings(prev => 
      prev.map(item => 
        item.categoryId === categoryId 
          ? { ...item, rating }
          : item
      )
    );
  };

  const updateCategoryComment = (categoryId: string, comment: string) => {
    setCategoryRatings(prev => 
      prev.map(item => 
        item.categoryId === categoryId 
          ? { ...item, comment }
          : item
      )
    );
  };

  const calculateOverallRating = (): number => {
    if (categoryRatings.length === 0) return 0;
    
    let weightedSum = 0;
    let totalWeight = 0;

    categoryRatings.forEach(rating => {
      const category = availableCategories.find(cat => cat.id === rating.categoryId);
      if (category && rating.rating > 0) {
        weightedSum += rating.rating * category.weight;
        totalWeight += category.weight;
      }
    });

    return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;
  };

  const validateForm = (): boolean => {
    const ratedCategories = categoryRatings.filter(rating => rating.rating > 0);
    
    if (ratedCategories.length === 0) {
      Alert.alert(
        'Avaliação Incompleta',
        'Por favor, avalie pelo menos uma categoria.',
        [{ text: 'OK' }]
      );
      return false;
    }

    // Verificar se pelo menos as categorias principais foram avaliadas
    const mainCategories = availableCategories
      .filter(cat => cat.weight >= 0.2)
      .map(cat => cat.id);
    
    const ratedMainCategories = ratedCategories
      .filter(rating => mainCategories.includes(rating.categoryId));

    if (ratedMainCategories.length === 0) {
      Alert.alert(
        'Avaliação Incompleta',
        'Por favor, avalie pelo menos uma das categorias principais.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    console.log('🚀 [ThematicReviewForm] handleSubmit iniciado');
    
    // ⚠️ TEMPORÁRIO: Auth check comentado para debug
    // if (!isAuthenticated || !user) {
    //   Alert.alert(...);
    //   return;
    // }

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      console.log('🔍 [ThematicReviewForm] Dados da submissão:', {
        userId: user?.id || 'guest',
        userName: user?.name || 'Guest User',
        serviceId: service.id,
        serviceName: service.name,
        serviceType: serviceType,
        isAuthenticated,
        userType: (user as any)?.userType,
        categoryRatingsCount: categoryRatings.length,
        validRatingsCount: categoryRatings.filter(rating => rating.rating > 0).length
      });

      const validRatings = categoryRatings.filter(rating => rating.rating > 0);
      
      console.log('🎯 [ThematicReviewForm] Valid ratings:', validRatings);
      
      const visitContext = {
        visitDate: new Date(),
        visitType: visitType as any,
      };

      console.log('🎯 [ThematicReviewForm] Chamando createReview...');

      const reviewId = await createReview(
        service.id,
        service.name,
        serviceType,
        validRatings,
        generalComment || undefined,
        visitContext
      );

      console.log('📥 [ThematicReviewForm] Resposta do createReview:', reviewId);

      if (reviewId) {
        console.log('✅ [ThematicReviewForm] Review criado com sucesso:', reviewId);
        Alert.alert(
          'Avaliação Enviada!',
          'Obrigado por sua avaliação. Ela ajudará outros usuários a fazer melhores escolhas.',
          [
            {
              text: 'OK',
              onPress: () => onReviewSubmitted(reviewId)
            }
          ]
        );
      } else {
        console.error('❌ [ThematicReviewForm] CreateReview retornou null');
        Alert.alert(
          'Erro na Avaliação',
          reviewError || 'Não foi possível enviar sua avaliação. Tente novamente.',
          [{ text: 'OK' }]
        );
      }

    } catch (error) {
      console.error('❌ [ThematicReviewForm] Exception capturada:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        code: (error as any)?.code,
        stack: error instanceof Error ? error.stack : undefined
      });
      Alert.alert(
        'Erro',
        `Erro detalhado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const overallRating = calculateOverallRating();
  const completedCategories = categoryRatings.filter(rating => rating.rating > 0).length;
  const progressPercent = (completedCategories / availableCategories.length) * 100;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceType}>{serviceType}</Text>
          </View>
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedCategories}/{availableCategories.length} categorias avaliadas
          </Text>
        </View>

        {/* Overall Rating */}
        {overallRating > 0 && (
          <View style={styles.overallRating}>
            <Text style={styles.overallRatingLabel}>Nota Geral:</Text>
            <View style={styles.overallRatingValue}>
              <Text style={styles.overallRatingNumber}>{overallRating}</Text>
              <StarRating rating={Math.round(overallRating)} onRatingChange={() => {}} disabled size={20} />
            </View>
          </View>
        )}
      </View>

      {/* Visit Context */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipo de Visita</Text>
        <View style={styles.visitTypeContainer}>
          {['consultation', 'emergency', 'routine', 'exam', 'procedure'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.visitTypeButton,
                visitType === type && styles.visitTypeButtonActive
              ]}
              onPress={() => setVisitType(type)}
            >
              <Text style={[
                styles.visitTypeText,
                visitType === type && styles.visitTypeTextActive
              ]}>
                {t(`reviews.visitTypes.${type}`) || type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Category Ratings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avalie por Categoria</Text>
        <Text style={styles.sectionDescription}>
          Sua avaliação detalhada ajuda outros usuários a entender melhor a qualidade do serviço.
        </Text>
        
        {availableCategories.map((category) => {
          const currentRating = categoryRatings.find(r => r.categoryId === category.id);
          
          return (
            <View key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                  <Ionicons name={category.icon as any} size={24} color={Colors.primary} />
                  <View style={styles.categoryText}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryDescription}>{category.description}</Text>
                  </View>
                </View>
                <View style={styles.categoryWeight}>
                  <Text style={styles.weightText}>{Math.round(category.weight * 100)}%</Text>
                </View>
              </View>
              
              <View style={styles.ratingSection}>
                <StarRating
                  rating={currentRating?.rating || 0}
                  onRatingChange={(rating) => updateCategoryRating(category.id, rating)}
                />
                
                {currentRating && currentRating.rating > 0 && (
                  <TextInput
                    style={styles.commentInput}
                    placeholder={`Comentário sobre ${category.name.toLowerCase()} (opcional)`}
                    value={currentRating.comment}
                    onChangeText={(text) => updateCategoryComment(category.id, text)}
                    multiline
                    numberOfLines={2}
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* General Comment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comentário Geral (Opcional)</Text>
        <TextInput
          style={styles.generalCommentInput}
          placeholder="Conte sobre sua experiência geral..."
          value={generalComment}
          onChangeText={setGeneralComment}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (completedCategories === 0 || isSubmitting) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={completedCategories === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.surface} size="small" />
          ) : (
            <Text style={styles.submitButtonText}>
              Enviar Avaliação
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  authWarning: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large,
  },
  authWarningText: {
    fontSize: fontSize.large,
    fontWeight: 'bold',
    color: Colors.error,
    marginTop: spacing.medium,
    marginBottom: spacing.small,
    textAlign: 'center',
  },
  authWarningSubtext: {
    fontSize: fontSize.medium,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.large,
  },
  authWarningButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: 8,
  },
  authWarningButtonText: {
    color: Colors.white,
    fontSize: fontSize.medium,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: Colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  serviceName: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  serviceType: {
    fontSize: fontSize.sm,
    color: Colors.primary,
    textTransform: 'capitalize',
  },
  closeButton: {
    padding: spacing.xs,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
  },
  overallRating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  overallRatingLabel: {
    fontSize: fontSize.md,
    color: Colors.text,
    fontWeight: '600',
  },
  overallRatingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overallRatingNumber: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: spacing.sm,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  visitTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  visitTypeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  visitTypeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  visitTypeText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  visitTypeTextActive: {
    color: Colors.surface,
    fontWeight: '600',
  },
  categoryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  categoryInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  categoryText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  categoryName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  categoryDescription: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  categoryWeight: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  weightText: {
    fontSize: fontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
  ratingSection: {
    alignItems: 'flex-start',
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  starButton: {
    padding: spacing.xs,
  },
  commentInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: fontSize.sm,
    color: Colors.text,
    backgroundColor: Colors.background,
    textAlignVertical: 'top',
  },
  generalCommentInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: fontSize.sm,
    color: Colors.text,
    backgroundColor: Colors.surface,
    minHeight: 100,
  },
  buttonContainer: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.border,
  },
  submitButtonText: {
    color: Colors.surface,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: fontSize.md,
  },
});