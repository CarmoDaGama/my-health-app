/**
 * MENDLINK - Componente de Visualização de Reviews
 * Exibe reviews temáticos com insights e estatísticas
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, spacing, fontSize } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation';
import { ThematicReviewService } from '../../services/thematic-reviews';
import { 
  ThematicReview, 
  ServiceInsights, 
  ServiceType, 
  REVIEW_CATEGORIES 
} from '../../types/reviews';
import { HealthService } from '../../types';

interface ServiceReviewsProps {
  service: HealthService;
  onWriteReview: () => void;
}

interface ReviewCardProps {
  review: ThematicReview;
  onMarkHelpful: (reviewId: string) => void;
}

interface CategoryStatsProps {
  insights: ServiceInsights;
  t: (key: string) => string;
}

const StarDisplay: React.FC<{ rating: number; size?: number }> = ({ 
  rating, 
  size = 16 
}) => {
  return (
    <View style={styles.starDisplayContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={size}
          color={star <= rating ? Colors.warning : Colors.border}
          style={styles.starIcon}
        />
      ))}
    </View>
  );
};

const CategoryStatsCard: React.FC<CategoryStatsProps> = ({ insights, t }) => {
  const serviceType = insights.serviceType as ServiceType;
  const categories = REVIEW_CATEGORIES[serviceType] || [];

  return (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>{t('reviews.title') || 'Reviews by Category'}</Text>
      
      {insights.categoryStats.map((stat) => {
        const category = categories.find(cat => cat.id === stat.categoryId);
        if (!category) return null;

        const getPerformanceColor = (rating: number) => {
          if (rating >= 4.0) return Colors.success;
          if (rating >= 3.0) return Colors.warning;
          return Colors.error;
        };

        const performanceColor = getPerformanceColor(stat.averageRating);

        return (
          <View key={stat.categoryId} style={styles.categoryStatRow}>
            <View style={styles.categoryStatInfo}>
              <Ionicons 
                name={category.icon as any} 
                size={20} 
                color={Colors.primary} 
                style={styles.categoryIcon}
              />
              <View style={styles.categoryStatText}>
                <Text style={styles.categoryStatName}>{category.name}</Text>
                <Text style={styles.categoryStatCount}>
                  {stat.reviewCount} {t('reviews.reviewsCount') || 'reviews'}
                </Text>
              </View>
            </View>
            
            <View style={styles.categoryStatRating}>
              <Text style={[styles.ratingNumber, { color: performanceColor }]}>
                {stat.averageRating.toFixed(1)}
              </Text>
              <StarDisplay rating={Math.round(stat.averageRating)} />
              <View style={[styles.trendIndicator, { backgroundColor: performanceColor + '20' }]}>
                <Ionicons 
                  name={
                    stat.trend === 'improving' ? 'trending-up' : 
                    stat.trend === 'declining' ? 'trending-down' : 
                    'remove'
                  }
                  size={12}
                  color={performanceColor}
                />
              </View>
            </View>
          </View>
        );
      })}
      
      {/* Overall Summary */}
      <View style={styles.overallSummary}>
        <View style={styles.overallRating}>
          <Text style={styles.overallLabel}>{t('reviews.overallRating') || 'Overall Rating'}:</Text>
          <Text style={styles.overallValue}>{insights.overallRating.toFixed(1)}</Text>
          <StarDisplay rating={Math.round(insights.overallRating)} size={18} />
        </View>
        <Text style={styles.totalReviews}>
          {t('reviews.basedOn') || 'Based on'} {insights.totalReviews} {t('reviews.reviewsCount') || 'reviews'}
        </Text>
      </View>
    </View>
  );
};

const InsightsCard: React.FC<{ insights: ServiceInsights }> = ({ insights }) => {
  if (insights.insights.length === 0) return null;

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength': return 'checkmark-circle';
      case 'weakness': return 'alert-circle';
      case 'trend': return 'trending-up';
      case 'recommendation': return 'bulb';
      default: return 'information-circle';
    }
  };

  const getInsightColor = (type: string, priority: string) => {
    if (priority === 'high') return Colors.error;
    if (type === 'strength') return Colors.success;
    if (type === 'weakness') return Colors.warning;
    return Colors.primary;
  };

  return (
    <View style={styles.insightsCard}>
      <Text style={styles.insightsTitle}>Insights Automáticos</Text>
      
      {insights.insights.slice(0, 3).map((insight) => {
        const color = getInsightColor(insight.type, insight.priority);
        
        return (
          <View key={insight.id} style={styles.insightItem}>
            <Ionicons 
              name={getInsightIcon(insight.type) as any} 
              size={20} 
              color={color}
              style={styles.insightIcon}
            />
            <View style={styles.insightContent}>
              <Text style={styles.insightMessage}>{insight.message}</Text>
              <Text style={styles.insightCategory}>{insight.category}</Text>
            </View>
          </View>
        );
      })}
      
      {insights.insights.length > 3 && (
        <TouchableOpacity style={styles.viewMoreInsights}>
          <Text style={styles.viewMoreText}>
            Ver mais {insights.insights.length - 3} insights
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onMarkHelpful }) => {
  const { t } = useTranslation();
  const [showFullComment, setShowFullComment] = useState(false);
  const serviceType = review.serviceType as ServiceType;
  const categories = REVIEW_CATEGORIES[serviceType] || [];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <View style={styles.reviewCard}>
      {/* Header */}
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.reviewerAvatar}>
            {review.userAvatar ? (
              <Text>👤</Text>
            ) : (
              <Ionicons name="person" size={20} color={Colors.textSecondary} />
            )}
          </View>
          <View style={styles.reviewerDetails}>
            <Text style={styles.reviewerName}>{review.userName}</Text>
            <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
          </View>
        </View>
        
        <View style={styles.overallRatingBadge}>
          <Text style={styles.overallRatingText}>{review.overallRating.toFixed(1)}</Text>
          <StarDisplay rating={Math.round(review.overallRating)} size={14} />
        </View>
      </View>

      {/* Category Ratings */}
      <View style={styles.categoryRatings}>
        {Object.entries(review.categoryRatings).map(([categoryId, rating]) => {
          const category = categories.find(cat => cat.id === categoryId);
          if (!category) return null;

          return (
            <View key={categoryId} style={styles.categoryRatingRow}>
              <Text style={styles.categoryRatingName}>{category.name}:</Text>
              <StarDisplay rating={rating} size={14} />
              <Text style={styles.categoryRatingValue}>{rating}</Text>
            </View>
          );
        })}
      </View>

      {/* General Comment */}
      {review.generalComment && (
        <View style={styles.commentSection}>
          <Text style={styles.commentText}>
            {showFullComment ? 
              review.generalComment : 
              truncateText(review.generalComment, 150)
            }
          </Text>
          
          {review.generalComment.length > 150 && (
            <TouchableOpacity 
              onPress={() => setShowFullComment(!showFullComment)}
              style={styles.showMoreButton}
            >
              <Text style={styles.showMoreText}>
                {showFullComment ? (t('common.showLess') || 'Show less') : (t('common.showMore') || 'Show more')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.reviewActions}>
        <TouchableOpacity 
          style={styles.helpfulButton}
          onPress={() => onMarkHelpful(review.id)}
        >
          <Ionicons name="thumbs-up-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.helpfulText}>
            {t('reviews.helpful') || 'Helpful'} ({review.helpful})
          </Text>
        </TouchableOpacity>
        
        {review.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.verifiedText}>{t('reviews.verified') || 'Verified'}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export const ServiceReviews: React.FC<ServiceReviewsProps> = ({
  service,
  onWriteReview,
}) => {
  console.log('🎬 [ServiceReviews] Componente renderizado com service:', {
    id: service.id,
    name: typeof service.name === 'string' ? service.name : 'N/A',
    type: service.type
  });

  const { t } = useTranslation();
  const [reviews, setReviews] = useState<ThematicReview[]>([]);
  const [insights, setInsights] = useState<ServiceInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      console.log('🔄 [ServiceReviews] Iniciando carregamento de dados para service:', service.id);
      setLoading(true);

      // Carregar reviews
      console.log('📡 [ServiceReviews] Chamando ThematicReviewService.getServiceReviews...');
      const reviewsResult = await ThematicReviewService.getServiceReviews(service.id);
      
      console.log('📊 [ServiceReviews] Reviews carregados:', {
        count: reviewsResult.reviews.length,
        reviews: reviewsResult.reviews.map(r => ({ id: r.id, userName: r.userName, rating: r.overallRating }))
      });
      
      setReviews(reviewsResult.reviews);

      // Gerar insights se houver reviews
      if (reviewsResult.reviews.length > 0) {
        console.log('🧠 [ServiceReviews] Gerando insights para', reviewsResult.reviews.length, 'reviews...');
        const serviceInsights = await ThematicReviewService.generateServiceInsights(service.id);
        setInsights(serviceInsights);
        console.log('✅ [ServiceReviews] Insights gerados:', serviceInsights);
      } else {
        console.log('⚠️ [ServiceReviews] Nenhum review encontrado para gerar insights');
      }

    } catch (error) {
      console.error('❌ [ServiceReviews] Erro ao carregar reviews:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log('🎬 [ServiceReviews] useEffect disparado para service.id:', service.id);
    loadData();
  }, [service.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await ThematicReviewService.markReviewHelpful(reviewId);
      
      // Atualizar localmente
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId 
            ? { ...review, helpful: review.helpful + 1 }
            : review
        )
      );
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{t('reviews.loadingReviews') || 'Loading reviews...'}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('reviews.reviewsOf') || 'Reviews of'} {typeof service.name === 'string' ? service.name : (t('common.service') || 'Service')}</Text>
        <TouchableOpacity style={styles.writeReviewButton} onPress={onWriteReview}>
          <Ionicons name="create" size={20} color={Colors.surface} />
          <Text style={styles.writeReviewText}>{t('actions.rate') || 'Rate'}</Text>
        </TouchableOpacity>
      </View>

      {/* Statistics and Insights */}
      {insights && (
        <>
          <CategoryStatsCard insights={insights} t={t} />
          <InsightsCard insights={insights} />
        </>
      )}

      {/* Reviews List */}
      <View style={styles.reviewsSection}>
        <Text style={styles.reviewsSectionTitle}>
          {t('reviews.recentReviews') || 'Recent Reviews'} ({reviews.length})
        </Text>
        
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onMarkHelpful={handleMarkHelpful}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>No reviews yet</Text>
            <Text style={styles.emptyStateText}>
                Be the first to rate this service and help other users!
            </Text>
            <TouchableOpacity style={styles.firstReviewButton} onPress={onWriteReview}>
                <Text style={styles.firstReviewButtonText}>Make First Assessment</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: spacing.md,
  },
  writeReviewButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  writeReviewText: {
    color: Colors.surface,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  
  // Stats Card
  statsCard: {
    backgroundColor: Colors.surface,
    margin: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 12,
    padding: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statsTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: spacing.md,
  },
  categoryStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryStatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    marginRight: spacing.sm,
  },
  categoryStatText: {
    flex: 1,
  },
  categoryStatName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  categoryStatCount: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
  },
  categoryStatRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    marginRight: spacing.xs,
  },
  trendIndicator: {
    marginLeft: spacing.xs,
    padding: spacing.xs,
    borderRadius: 10,
  },
  overallSummary: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: spacing.md,
    alignItems: 'center',
  },
  overallRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  overallLabel: {
    fontSize: fontSize.md,
    color: Colors.text,
    marginRight: spacing.sm,
  },
  overallValue: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: spacing.sm,
  },
  totalReviews: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },

  // Insights Card
  insightsCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 12,
    padding: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  insightsTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: spacing.md,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  insightIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  insightContent: {
    flex: 1,
  },
  insightMessage: {
    fontSize: fontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  insightCategory: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  viewMoreInsights: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  viewMoreText: {
    fontSize: fontSize.sm,
    color: Colors.primary,
  },

  // Reviews Section
  reviewsSection: {
    padding: spacing.lg,
  },
  reviewsSectionTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: spacing.lg,
  },

  // Review Card
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewDate: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
  },
  overallRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  overallRatingText: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: spacing.xs,
  },

  // Category Ratings
  categoryRatings: {
    marginBottom: spacing.md,
  },
  categoryRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryRatingName: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    width: 100,
  },
  categoryRatingValue: {
    fontSize: fontSize.xs,
    color: Colors.text,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },

  // Star Display
  starDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 2,
  },

  // Comment Section
  commentSection: {
    marginBottom: spacing.md,
  },
  commentText: {
    fontSize: fontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  showMoreButton: {
    marginTop: spacing.xs,
  },
  showMoreText: {
    fontSize: fontSize.sm,
    color: Colors.primary,
  },

  // Review Actions
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpfulText: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    marginLeft: spacing.xs,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: fontSize.xs,
    color: Colors.success,
    marginLeft: spacing.xs,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  firstReviewButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  firstReviewButtonText: {
    color: Colors.surface,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});