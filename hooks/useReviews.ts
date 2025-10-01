import { useState, useEffect, useCallback } from 'react';
import { Review, ReviewInput, ReviewsResponse, ReviewFilters, ReviewStats } from '../types';
import { ReviewsService } from '../services/reviews-firebase';
import { useAuth } from './useAuth-firebase';

interface UseReviewsState {
  reviews: Review[];
  stats: ReviewStats;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  lastDocId?: string;
}

interface UseReviewsActions {
  loadReviews: (serviceId: string, filters?: ReviewFilters) => Promise<void>;
  loadMoreReviews: () => Promise<void>;
  addReview: (reviewInput: ReviewInput) => Promise<boolean>;
  updateReview: (reviewId: string, updates: Partial<Pick<Review, 'rating' | 'comment'>>) => Promise<boolean>;
  deleteReview: (reviewId: string) => Promise<boolean>;
  markHelpful: (reviewId: string) => Promise<boolean>;
  reportReview: (reviewId: string) => Promise<boolean>;
  refreshReviews: () => Promise<void>;
  checkUserReview: (serviceId: string) => Promise<Review | null>;
}

export interface UseReviewsReturn extends UseReviewsState, UseReviewsActions {}

export const useReviews = (initialServiceId?: string): UseReviewsReturn => {
  const { user, isAuthenticated } = useAuth();
  
  const [state, setState] = useState<UseReviewsState>({
    reviews: [],
    stats: {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    },
    isLoading: false,
    isLoadingMore: false,
    error: null,
    hasMore: false,
    lastDocId: undefined,
  });

  const [currentServiceId, setCurrentServiceId] = useState<string | undefined>(initialServiceId);
  const [currentFilters, setCurrentFilters] = useState<ReviewFilters>({});

  // Load reviews for a service
  const loadReviews = useCallback(async (serviceId: string, filters: ReviewFilters = {}) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await ReviewsService.getServiceReviews(serviceId, filters);
      
      setState(prev => ({
        ...prev,
        reviews: response.reviews,
        stats: response.stats,
        hasMore: response.hasMore,
        lastDocId: response.lastDocId,
        isLoading: false,
      }));
      
      setCurrentServiceId(serviceId);
      setCurrentFilters(filters);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao carregar avaliações',
        isLoading: false,
      }));
    }
  }, []);

  // Load more reviews (pagination)
  const loadMoreReviews = useCallback(async () => {
    if (!currentServiceId || !state.hasMore || state.isLoadingMore) return;
    
    setState(prev => ({ ...prev, isLoadingMore: true, error: null }));
    
    try {
      const response = await ReviewsService.getServiceReviews(currentServiceId, {
        ...currentFilters,
        lastDocId: state.lastDocId,
      });
      
      setState(prev => ({
        ...prev,
        reviews: [...prev.reviews, ...response.reviews],
        hasMore: response.hasMore,
        lastDocId: response.lastDocId,
        isLoadingMore: false,
      }));
    } catch (error) {
      console.error('Error loading more reviews:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao carregar mais avaliações',
        isLoadingMore: false,
      }));
    }
  }, [currentServiceId, currentFilters, state.hasMore, state.isLoadingMore, state.lastDocId]);

  // Add a new review
  const addReview = useCallback(async (reviewInput: ReviewInput): Promise<boolean> => {
    if (!isAuthenticated || !user || user.id === 'guest') {
      setState(prev => ({ ...prev, error: 'Você precisa estar logado para avaliar' }));
      return false;
    }

    try {
      const userName = (user as any).name || 'Usuário';
      const userAvatar = (user as any).avatar;
      
      await ReviewsService.addReview(reviewInput, user.id, userName, userAvatar);
      
      // Reload reviews to reflect the new addition
      if (currentServiceId === reviewInput.serviceId) {
        await loadReviews(currentServiceId, currentFilters);
      }
      
      return true;
    } catch (error) {
      console.error('Error adding review:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao adicionar avaliação',
      }));
      return false;
    }
  }, [isAuthenticated, user, currentServiceId, currentFilters, loadReviews]);

  // Update an existing review
  const updateReview = useCallback(async (
    reviewId: string,
    updates: Partial<Pick<Review, 'rating' | 'comment'>>
  ): Promise<boolean> => {
    if (!isAuthenticated || !user || user.id === 'guest') {
      setState(prev => ({ ...prev, error: 'Você precisa estar logado para editar avaliações' }));
      return false;
    }

    try {
      await ReviewsService.updateReview(reviewId, user.id, updates);
      
      // Update the review in local state
      setState(prev => ({
        ...prev,
        reviews: prev.reviews.map(review => 
          review.id === reviewId 
            ? { ...review, ...updates, updatedAt: new Date() }
            : review
        ),
      }));
      
      // Reload to get updated stats
      if (currentServiceId) {
        const stats = await ReviewsService.getServiceReviewStats(currentServiceId);
        setState(prev => ({ ...prev, stats }));
      }
      
      return true;
    } catch (error) {
      console.error('Error updating review:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao atualizar avaliação',
      }));
      return false;
    }
  }, [isAuthenticated, user, currentServiceId]);

  // Delete a review
  const deleteReview = useCallback(async (reviewId: string): Promise<boolean> => {
    if (!isAuthenticated || !user || user.id === 'guest') {
      setState(prev => ({ ...prev, error: 'Você precisa estar logado para deletar avaliações' }));
      return false;
    }

    try {
      await ReviewsService.deleteReview(reviewId, user.id);
      
      // Remove the review from local state
      setState(prev => ({
        ...prev,
        reviews: prev.reviews.filter(review => review.id !== reviewId),
        stats: {
          ...prev.stats,
          totalReviews: prev.stats.totalReviews - 1,
        },
      }));
      
      // Reload to get updated stats
      if (currentServiceId) {
        const stats = await ReviewsService.getServiceReviewStats(currentServiceId);
        setState(prev => ({ ...prev, stats }));
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao deletar avaliação',
      }));
      return false;
    }
  }, [isAuthenticated, user, currentServiceId]);

  // Mark review as helpful
  const markHelpful = useCallback(async (reviewId: string): Promise<boolean> => {
    try {
      await ReviewsService.markReviewHelpful(reviewId);
      
      // Update the helpful count in local state
      setState(prev => ({
        ...prev,
        reviews: prev.reviews.map(review => 
          review.id === reviewId 
            ? { ...review, helpful: (review.helpful || 0) + 1 }
            : review
        ),
      }));
      
      return true;
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao marcar como útil',
      }));
      return false;
    }
  }, []);

  // Report a review
  const reportReview = useCallback(async (reviewId: string): Promise<boolean> => {
    try {
      await ReviewsService.reportReview(reviewId);
      
      // Update the reported status in local state
      setState(prev => ({
        ...prev,
        reviews: prev.reviews.map(review => 
          review.id === reviewId 
            ? { ...review, reported: true }
            : review
        ),
      }));
      
      return true;
    } catch (error) {
      console.error('Error reporting review:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao denunciar avaliação',
      }));
      return false;
    }
  }, []);

  // Refresh reviews
  const refreshReviews = useCallback(async () => {
    if (currentServiceId) {
      await loadReviews(currentServiceId, currentFilters);
    }
  }, [currentServiceId, currentFilters, loadReviews]);

  // Check if user has reviewed a service
  const checkUserReview = useCallback(async (serviceId: string): Promise<Review | null> => {
    if (!isAuthenticated || !user || user.id === 'guest') {
      return null;
    }

    try {
      return await ReviewsService.getUserReviewForService(serviceId, user.id);
    } catch (error) {
      console.error('Error checking user review:', error);
      return null;
    }
  }, [isAuthenticated, user]);

  // Load initial reviews if serviceId is provided
  useEffect(() => {
    if (initialServiceId) {
      loadReviews(initialServiceId);
    }
  }, [initialServiceId, loadReviews]);

  // Clear error after some time
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, error: null }));
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  return {
    // State
    reviews: state.reviews,
    stats: state.stats,
    isLoading: state.isLoading,
    isLoadingMore: state.isLoadingMore,
    error: state.error,
    hasMore: state.hasMore,
    lastDocId: state.lastDocId,
    
    // Actions
    loadReviews,
    loadMoreReviews,
    addReview,
    updateReview,
    deleteReview,
    markHelpful,
    reportReview,
    refreshReviews,
    checkUserReview,
  };
};