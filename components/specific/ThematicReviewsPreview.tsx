/**
 * MENDLINK - Preview de Reviews Temáticos
 * Componente para mostrar preview dos reviews temáticos na tela de detalhes
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThematicReview } from '../../types/reviews';
import { ThematicReviewService } from '../../services/thematic-reviews';
import { useAuth } from '../../hooks/useAuth-firebase';
import { useTranslation } from '../../hooks/useTranslation';
import { Colors, spacing, fontSize } from '../../constants';

interface ThematicReviewsPreviewProps {
  serviceId: string;
  onEditReview?: (review: ThematicReview) => void;
  maxReviews?: number;
  refreshTrigger?: number;
}

export const ThematicReviewsPreview: React.FC<ThematicReviewsPreviewProps> = ({
  serviceId,
  onEditReview,
  maxReviews = 3,
  refreshTrigger = 0,
}) => {
  console.log('🎬 [ThematicReviewsPreview] Componente renderizado:', {
    serviceId,
    maxReviews,
    timestamp: new Date().toISOString()
  });
  
  const { user } = useAuth();
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<ThematicReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    console.log('🔄 [ThematicReviewsPreview] useEffect disparado:', {
      serviceId,
      maxReviews,
      refreshTrigger,
      timestamp: new Date().toISOString()
    });
    loadThematicReviews();
  }, [serviceId, maxReviews, refreshTrigger]);

  const loadThematicReviews = async () => {
    console.log('🎯 [ThematicReviewsPreview] loadThematicReviews chamado:', {
      serviceId,
      hasServiceId: !!serviceId,
      maxReviews
    });
    
    if (!serviceId) {
      console.warn('⚠️ [ThematicReviewsPreview] serviceId não fornecido, saindo...');
      return;
    }
    
    try {
      console.log('🔍 [ThematicReviewsPreview] Iniciando carregamento para serviceId:', serviceId);
      setIsLoading(true);
      setError(null);
      
      console.log('📡 [ThematicReviewsPreview] Chamando ThematicReviewService.getServiceReviews...');
      const result = await ThematicReviewService.getServiceReviews(serviceId, undefined, maxReviews);
      
      console.log('📊 [ThematicReviewsPreview] Reviews carregados:', {
        count: result.reviews.length,
        totalReviews: result.reviews.length,
        reviews: result.reviews.map(r => ({ 
          id: typeof r.id === 'string' ? r.id : 'unknown',
          userName: typeof r.userName === 'string' ? r.userName : 'unknown',
          rating: typeof r.overallRating === 'number' ? r.overallRating : 0,
          serviceId: typeof r.serviceId === 'string' ? r.serviceId : 'unknown',
          serviceName: typeof r.serviceName === 'string' ? r.serviceName : 'unknown'
        }))
      });
      
      setReviews(result.reviews);
      setTotalReviews(result.reviews.length);
      
      console.log('✅ [ThematicReviewsPreview] Estado atualizado:', {
        reviewsCount: result.reviews.length,
        isLoading: false,
        error: null
      });
      
    } catch (error) {
      console.error('❌ [ThematicReviewsPreview] Erro ao carregar reviews:', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        serviceId
      });
      setError(error instanceof Error ? error.message : 'Erro ao carregar reviews');
    } finally {
      setIsLoading(false);
      console.log('🏁 [ThematicReviewsPreview] loadThematicReviews finalizado');
    }
  };

  const renderStars = (rating: number) => {
    const roundedRating = Math.round(rating);
    return (
      <View style={styles.reviewStars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= roundedRating ? 'star' : 'star-outline'}
            size={14}
            color="#FFD700"
          />
        ))}
      </View>
    );
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const renderTopCategories = (categoryRatings: Record<string, number>) => {
    // Validar se categoryRatings é um objeto válido
    if (!categoryRatings || typeof categoryRatings !== 'object') {
      return null;
    }
    
    // Get the 2 categories with the best ratings
    const sortedCategories = Object.entries(categoryRatings)
      .filter(([category, rating]) => typeof category === 'string' && typeof rating === 'number')
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2);

    // Se não há categorias, não renderizar nada
    if (sortedCategories.length === 0) {
      return null;
    }

    return (
      <View style={styles.topCategories}>
        {sortedCategories.map(([categoryId, rating]) => (
          <View key={categoryId} style={styles.categoryTag}>
            <Text style={styles.categoryName}>
              {typeof categoryId === 'string' ? categoryId.replace('_', ' ') : 'Category'}
            </Text>
            <Text style={styles.categoryRating}>{typeof rating === 'number' ? rating.toFixed(1) : '0'}/5</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderReviewItem = (review: ThematicReview, index: number) => {
    const isOwnReview = user?.id === review.userId;

    // Validar que temos um review válido
    if (!review || !review.id) {
      return null;
    }

    return (
      <View key={`review-${review.id}-${index}`} style={[styles.reviewItem, index > 0 ? styles.reviewItemBorder : null]}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewUserInfo}>
            <View style={styles.reviewAvatar}>
              <Text style={styles.reviewAvatarText}>
                {typeof review.userName === 'string' ? review.userName.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <View style={styles.reviewUserDetails}>
              <Text style={styles.reviewUserName}>{typeof review.userName === 'string' ? review.userName : 'Usuário Anônimo'}</Text>
              <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
            </View>
          </View>
          
          <View style={styles.reviewRatingContainer}>
            {renderStars(review.overallRating)}
            <Text style={styles.reviewRatingText}>{typeof review.overallRating === 'number' ? review.overallRating : 0}/5</Text>
          </View>
        </View>

        {/* Top Categories */}
        {renderTopCategories(review.categoryRatings)}

        {/* General Comment if available */}
        {review.generalComment && typeof review.generalComment === 'string' && (
          <Text style={styles.reviewComment} numberOfLines={2}>
            {review.generalComment}
          </Text>
        )}

        {/* Visit Context */}
        {review.visitContext && (
          <View style={styles.visitContext}>
            <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.visitContextText}>
              {typeof review.visitContext === 'string' 
                ? review.visitContext 
                : (review.visitContext && typeof review.visitContext === 'object' && typeof review.visitContext.visitType === 'string' 
                  ? review.visitContext.visitType 
                  : 'Visita')
              }
            </Text>
          </View>
        )}

        {isOwnReview && onEditReview ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEditReview(review)}
          >
            <Ionicons name="pencil-outline" size={14} color="#2196F3" />
            <Text style={styles.editButtonText}>{t('common.edit')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#2196F3" size="small" />
        <Text style={styles.loadingText}>{t('reviews.loadingReviews') || 'Loading thematic reviews...'}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={24} color="#f44336" />
        <Text style={styles.errorText}>{t('reviews.errorLoading') || 'Error loading reviews'}</Text>
        <TouchableOpacity onPress={loadThematicReviews} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>{t('common.tryAgain') || 'Try again'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="star-outline" size={48} color="#ccc" />
        <Text style={styles.emptyTitle}>No thematic reviews yet</Text>
        <Text style={styles.emptyText}>
          Be the first to rate this service by categories!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsHeader}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{reviews.length}</Text>
          <Text style={styles.statLabel}>
            {reviews.length !== 1 ? (t('reviews.reviews') || 'Reviews') : (t('reviews.review') || 'Review')}
          </Text>
        </View>
        
        {reviews.length > 0 && (
          <View style={styles.statItem}>
            <View style={styles.avgRatingContainer}>
              {renderStars(reviews.reduce((sum, r) => sum + (typeof r.overallRating === 'number' ? r.overallRating : 0), 0) / reviews.length)}
              <Text style={styles.avgRatingText}>
                {(reviews.reduce((sum, r) => sum + (typeof r.overallRating === 'number' ? r.overallRating : 0), 0) / reviews.length).toFixed(1)}
              </Text>
            </View>
            <Text style={styles.statLabel}>{t('reviews.overallAverage') || 'Overall Average'}</Text>
          </View>
        )}
      </View>

      {/* Reviews List */}
      {reviews.slice(0, maxReviews).map((review, index) => {
        const reviewItem = renderReviewItem(review, index);
        return reviewItem;
      }).filter(Boolean)}
      
      {totalReviews > maxReviews && (
        <View style={styles.moreIndicator}>
          <Text style={styles.moreText}>
            +{totalReviews - maxReviews} {totalReviews - maxReviews !== 1 ? (t('reviews.moreThematicReviews') || 'more thematic reviews') : (t('reviews.moreThematicReview') || 'more thematic review')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
  },
  statsHeader: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  avgRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  avgRatingText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  reviewItemBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  reviewUserInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  reviewAvatarText: {
    color: Colors.surface,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
  reviewUserDetails: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewDate: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  reviewRatingContainer: {
    alignItems: 'flex-end',
  },
  reviewStars: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  reviewRatingText: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
  },
  topCategories: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  categoryTag: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  categoryName: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  categoryRating: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  reviewComment: {
    fontSize: fontSize.sm,
    color: Colors.text,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  visitContext: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: 4,
  },
  visitContextText: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  editButtonText: {
    fontSize: fontSize.xs,
    color: '#2196F3',
    marginLeft: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginLeft: spacing.sm,
  },
  errorContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSize.sm,
    color: '#f44336',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  retryButtonText: {
    fontSize: fontSize.sm,
    color: Colors.surface,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  moreIndicator: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  moreText: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});