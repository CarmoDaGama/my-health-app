import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Review, ReviewFilters } from '../../types';
import { useAuth } from '../../hooks/useAuth-firebase';
import { useReviews } from '../../hooks/useReviews';
import { useTranslation } from '../../hooks/useTranslation';

interface ReviewsListProps {
  serviceId: string;
  onEditReview?: (review: Review) => void;
  showFilters?: boolean;
  maxHeight?: number;
}

interface ReviewItemProps {
  review: Review;
  currentUserId?: string;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  onMarkHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  currentUserId,
  onEdit,
  onDelete,
  onMarkHelpful,
  onReport,
}) => {
  const { t } = useTranslation();
  const isOwnReview = currentUserId === review.userId;
  const reviewDate = new Date(review.createdAt);
  const isUpdated = review.updatedAt.getTime() !== review.createdAt.getTime();

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleEdit = () => {
    onEdit?.(review);
  };

  const handleDelete = () => {
    Alert.alert(
      t('reviews.deleteTitle'),
      t('reviews.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('reviews.deleteConfirm'),
          style: 'destructive',
          onPress: () => onDelete?.(review.id),
        },
      ]
    );
  };

  const handleMarkHelpful = () => {
    onMarkHelpful?.(review.id);
  };

  const handleReport = () => {
    Alert.alert(
      'Denunciar Avaliação',
      'Você deseja denunciar esta avaliação por conteúdo inadequado?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Denunciar',
          style: 'destructive',
          onPress: () => onReport?.(review.id),
        },
      ]
    );
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.reviewStars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color="#FFD700"
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.reviewItem}>
      {/* Header */}
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUserInfo}>
          <View style={styles.reviewAvatar}>
            <Text style={styles.reviewAvatarText}>
              {review.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.reviewUserDetails}>
            <Text style={styles.reviewUserName}>{review.userName}</Text>
            <Text style={styles.reviewDate}>
              {formatDate(reviewDate)}
              {isUpdated && ' (editado)'}
              {review.verified && (
                <Text style={styles.verifiedBadge}> {t('reviews.verified')}</Text>
              )}
            </Text>
          </View>
        </View>
        
        {/* Rating */}
        <View style={styles.reviewRatingContainer}>
          {renderStars(review.rating)}
          <Text style={styles.reviewRatingText}>{review.rating}/5</Text>
        </View>
      </View>

      {/* Comment */}
      <Text style={styles.reviewComment}>{review.comment}</Text>

      {/* Actions */}
      <View style={styles.reviewActions}>
        <View style={styles.reviewActionsLeft}>
          {!isOwnReview && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleMarkHelpful}
            >
              <Ionicons name="thumbs-up-outline" size={16} color="#666" />
              <Text style={styles.actionText}>
                Útil {review.helpful ? `(${review.helpful})` : ''}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.reviewActionsRight}>
          {isOwnReview ? (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleEdit}
              >
                <Ionicons name="pencil-outline" size={16} color="#2196F3" />
                <Text style={[styles.actionText, { color: '#2196F3' }]}>
                  Editar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={16} color="#f44336" />
                <Text style={[styles.actionText, { color: '#f44336' }]}>
                  Deletar
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleReport}
            >
              <Ionicons name="flag-outline" size={16} color="#ff9800" />
              <Text style={[styles.actionText, { color: '#ff9800' }]}>
                Denunciar
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export const ReviewsList: React.FC<ReviewsListProps> = ({
  serviceId,
  onEditReview,
  showFilters = true,
  maxHeight,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const {
    reviews,
    stats,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadReviews,
    loadMoreReviews,
    deleteReview,
    markHelpful,
    reportReview,
    refreshReviews,
  } = useReviews(serviceId);

  const [activeFilter, setActiveFilter] = React.useState<ReviewFilters>({
    sortBy: 'newest',
  });

  // Load initial reviews
  React.useEffect(() => {
    if (serviceId) {
      loadReviews(serviceId, activeFilter);
    }
  }, [serviceId, loadReviews, activeFilter]);

  const handleFilterChange = useCallback((newFilter: ReviewFilters) => {
    setActiveFilter(newFilter);
    loadReviews(serviceId, newFilter);
  }, [serviceId, loadReviews]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      loadMoreReviews();
    }
  }, [hasMore, isLoadingMore, loadMoreReviews]);

  const handleRefresh = useCallback(() => {
    refreshReviews();
  }, [refreshReviews]);

  const handleEdit = useCallback((review: Review) => {
    onEditReview?.(review);
  }, [onEditReview]);

  const handleDelete = useCallback(async (reviewId: string) => {
    await deleteReview(reviewId);
  }, [deleteReview]);

  const handleMarkHelpful = useCallback(async (reviewId: string) => {
    await markHelpful(reviewId);
  }, [markHelpful]);

  const handleReport = useCallback(async (reviewId: string) => {
    await reportReview(reviewId);
  }, [reportReview]);

  const renderFilterButtons = () => {
    if (!showFilters) return null;

    const filters = [
      { key: 'newest', label: 'Mais Recentes' },
      { key: 'oldest', label: 'Mais Antigas' },
      { key: 'rating_high', label: 'Maior Nota' },
      { key: 'rating_low', label: 'Menor Nota' },
      { key: 'helpful', label: 'Mais Úteis' },
    ];

    return (
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersLabel}>{t('reviews.sortBy')}</Text>
        <View style={styles.filtersButtons}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                activeFilter.sortBy === filter.key && styles.filterButtonActive,
              ]}
              onPress={() =>
                handleFilterChange({ ...activeFilter, sortBy: filter.key as any })
              }
            >
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilter.sortBy === filter.key && styles.filterButtonTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>
          {stats.totalReviews} avaliação{stats.totalReviews !== 1 ? 'ões' : ''}
        </Text>
        {stats.averageRating > 0 && (
          <View style={styles.averageRating}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.averageRatingText}>
              {stats.averageRating.toFixed(1)}
            </Text>
          </View>
        )}
      </View>
      {renderFilterButtons()}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubble-outline" size={48} color="#CCC" />
      <Text style={styles.emptyTitle}>{t('reviews.noReviews')}</Text>
      <Text style={styles.emptyText}>
        Seja o primeiro a avaliar este serviço e ajude outros usuários!
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator color="#2196F3" />
        <Text style={styles.loadingText}>{t('reviews.loadingMore')}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Review }) => (
    <ReviewItem
      review={item}
      currentUserId={user?.id}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onMarkHelpful={handleMarkHelpful}
      onReport={handleReport}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>{t('reviews.loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#f44336" />
        <Text style={styles.errorTitle}>{t('reviews.loadError')}</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>{t('actions.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, maxHeight ? { maxHeight } : null]}>
      <FlatList
        data={reviews}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={reviews.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  averageRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  averageRatingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  filtersContainer: {
    marginTop: 16,
  },
  filtersLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  filtersButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#F5F5F5',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  reviewItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewUserInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewAvatarText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  reviewUserDetails: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  verifiedBadge: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  reviewRatingContainer: {
    alignItems: 'flex-end',
  },
  reviewStars: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  reviewRatingText: {
    fontSize: 12,
    color: '#666',
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewActionsLeft: {
    flexDirection: 'row',
  },
  reviewActionsRight: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f44336',
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});