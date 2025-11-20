import { useState, useCallback } from 'react';
import { ThematicReviewService } from '../services/thematic-reviews';
import { CategoryRating, ServiceType } from '../types/reviews';
import { useAuth } from './useAuth-firebase';

interface UseThematicReviewsState {
  isLoading: boolean;
  error: string | null;
}

interface UseThematicReviewsActions {
  createReview: (
    serviceId: string,
    serviceName: string,
    serviceType: ServiceType,
    categoryRatings: CategoryRating[],
    generalComment?: string,
    visitContext?: any
  ) => Promise<string | null>;
  markHelpful: (reviewId: string) => Promise<boolean>;
}

export interface UseThematicReviewsReturn extends UseThematicReviewsState, UseThematicReviewsActions {}

export const useThematicReviews = (): UseThematicReviewsReturn => {
  const { user, isAuthenticated } = useAuth();
  
  const [state, setState] = useState<UseThematicReviewsState>({
    isLoading: false,
    error: null,
  });

  const createReview = useCallback(async (
    serviceId: string,
    serviceName: string,
    serviceType: ServiceType,
    categoryRatings: CategoryRating[],
    generalComment?: string,
    visitContext?: any
  ): Promise<string | null> => {
    console.log('🎯 [Hook] useThematicReviews.createReview iniciado');
    console.log('🔍 [Hook] Estado de autenticação:', {
      isAuthenticated,
      hasUser: !!user,
      userId: user?.id,
      userType: (user as any)?.userType
    });

    // ⚠️ TEMPORÁRIO: Permitir criação mesmo sem autenticação (para debug)
    if (!isAuthenticated || !user || user.id === 'guest') {
      console.log('⚠️ [Hook] Usuário não autenticado - criando como guest para debug');
      // setState(prev => ({ 
      //   ...prev, 
      //   error: 'Você precisa estar logado para criar avaliações temáticas' 
      // }));
      // return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('🎯 [Hook] Preparando dados para ThematicReviewService.createReview:', {
        userId: user?.id || 'guest',
        userName: user?.name || 'Usuário Guest',
        serviceId,
        serviceName,
        serviceType,
        categoryRatingsLength: categoryRatings.length,
        hasGeneralComment: !!generalComment,
        visitContext
      });

      // 🔥 AGUARDAR UM POUCO MAIS ANTES DE CHAMAR O SERVICE
      console.log('⏳ [Hook] Aguardando 500ms antes de criar review...');
      await new Promise(resolve => setTimeout(resolve, 500));

      const reviewId = await ThematicReviewService.createReview(
        serviceId,
        serviceName,
        serviceType,
        categoryRatings,
        generalComment,
        visitContext
      );

      setState(prev => ({ ...prev, isLoading: false }));
      console.log('✅ [Hook] Review temático criado com sucesso:', reviewId);
      
      return reviewId;
    } catch (error) {
      console.error('❌ [Hook] Erro ao criar review temático:', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        code: (error as any)?.code,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao criar avaliação temática',
      }));
      return null;
    }
  }, [isAuthenticated, user]);

  const markHelpful = useCallback(async (reviewId: string): Promise<boolean> => {
    if (!isAuthenticated || !user || user.id === 'guest') {
      setState(prev => ({ 
        ...prev, 
        error: 'Você precisa estar logado para marcar como útil' 
      }));
      return false;
    }

    try {
      await ThematicReviewService.markReviewHelpful(reviewId);
      return true;
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao marcar como útil',
      }));
      return false;
    }
  }, [isAuthenticated, user]);

  return {
    ...state,
    createReview,
    markHelpful,
  };
};