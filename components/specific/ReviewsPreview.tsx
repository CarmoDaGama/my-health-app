import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Review } from '../../types';
import { useReviews } from '../../hooks/useReviews';
import { useAuth } from '../../hooks/useAuth-firebase';
import { useTranslation } from '../../hooks/useTranslation';

interface ReviewsPreviewProps {
  serviceId: string;
  onEditReview?: (review: Review) => void;
  maxReviews?: number;
  refreshTrigger?: number;
}

export const ReviewsPreview: React.FC<ReviewsPreviewProps> = ({
  serviceId,
  onEditReview,
  maxReviews = 3,
  refreshTrigger = 0,
}) => {
  const { user } = useAuth();
  const { loadReviews, reviews, stats, isLoading, error } = useReviews();
  const { t } = useTranslation();

  useEffect(() => {
    if (serviceId) {
      loadReviews(serviceId, { limit: maxReviews });
    }
  }, [serviceId, loadReviews, maxReviews, refreshTrigger]);

  const renderStars = (rating: number) => {
    return (
      <View style={styles.reviewStars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
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

  const renderReviewItem = (review: Review, index: number) => {
    const isOwnReview = user?.id === review.userId;

    return (
      <View key={review.id} style={[styles.reviewItem, index > 0 && styles.reviewItemBorder]}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewUserInfo}>
            <View style={styles.reviewAvatar}>
              <Text style={styles.reviewAvatarText}>
                {typeof review.userName === 'string' ? review.userName.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <View style={styles.reviewUserDetails}>
              <Text style={styles.reviewUserName}>{typeof review.userName === 'string' ? review.userName : 'Usuário Anônimo'}</Text>
              <Text style={styles.reviewDate}>{formatDate(new Date(review.createdAt))}</Text>
            </View>
          </View>
          
          <View style={styles.reviewRatingContainer}>
            {renderStars(typeof review.rating === 'number' ? review.rating : 0)}
            <Text style={styles.reviewRatingText}>{typeof review.rating === 'number' ? review.rating : 0}/5</Text>
          </View>
        </View>

        <Text style={styles.reviewComment} numberOfLines={2}>
          {typeof review.comment === 'string' ? review.comment : 'Comment not available'}
        </Text>

        {isOwnReview && onEditReview && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEditReview(review)}
          >
            <Ionicons name="pencil-outline" size={14} color="#2196F3" />
            <Text style={styles.editButtonText}>{t('common.edit')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#2196F3" size="small" />
        <Text style={styles.loadingText}>{t('reviews.loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('reviews.loadError')}</Text>
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('reviews.noReviews')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {reviews.slice(0, maxReviews).map((review, index) => 
        renderReviewItem(review, index)
      )}
      
      {stats.totalReviews > maxReviews && (
        <View style={styles.moreIndicator}>
          <Text style={styles.moreText}>
            +{stats.totalReviews - maxReviews} {stats.totalReviews - maxReviews !== 1 ? (t('reviews.moreReviews') || 'more reviews') : (t('reviews.moreReview') || 'more review')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  reviewItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  reviewItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewUserInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  reviewAvatarText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  reviewUserDetails: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviewDate: {
    fontSize: 11,
    color: '#666',
    marginTop: 1,
  },
  reviewRatingContainer: {
    alignItems: 'flex-end',
  },
  reviewStars: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  reviewRatingText: {
    fontSize: 11,
    color: '#666',
  },
  reviewComment: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
    marginBottom: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 12,
    color: '#2196F3',
    marginLeft: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  errorContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#f44336',
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  moreIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    alignItems: 'center',
  },
  moreText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});