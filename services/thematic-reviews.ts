/**
 * MENDLINK - Serviço de Reviews Temáticos
 * API para gerenciar avaliações categorizadas no Firebase
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  serverTimestamp,
  DocumentSnapshot,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { 
  ThematicReview, 
  ServiceInsights, 
  ReviewFilter, 
  CategoryRating, 
  ServiceType,
  REVIEW_CATEGORIES 
} from '../types/reviews';

export class ThematicReviewService {
  
  /**
   * Criar nova avaliação temática
   */
  static async createReview(
    serviceId: string, 
    serviceName: string, 
    serviceType: ServiceType,
    categoryRatings: CategoryRating[],
    generalComment?: string,
    visitContext?: any
  ): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Calcular nota geral baseada nos pesos das categorias
      const overallRating = this.calculateOverallRating(serviceType, categoryRatings);

      // Converter categoryRatings de array para object
      const categoryRatingsMap = categoryRatings.reduce((acc, rating) => {
        acc[rating.categoryId] = rating.rating;
        return acc;
      }, {} as Record<string, number>);

      const reviewData: Omit<ThematicReview, 'id'> = {
        serviceId,
        serviceName,
        serviceType,
        userId: user.uid,
        userName: user.displayName || 'Usuário Anônimo',
        ...(user.photoURL && { userAvatar: user.photoURL }), // Only include if not null/undefined
        categoryRatings: categoryRatingsMap,
        overallRating,
        ...(generalComment && generalComment.trim() && { generalComment: generalComment.trim() }), // Only include if not empty
        visitContext,
        createdAt: new Date(),
        updatedAt: new Date(),
        verified: false, // Will be verified later
        helpful: 0,
        reportCount: 0
      };

      console.log('🎯 Criando review temático:', reviewData);

      // Limpar campos undefined/null e strings vazias antes de enviar ao Firebase
      const cleanReviewData = Object.fromEntries(
        Object.entries(reviewData).filter(([_, value]) => 
          value !== undefined && 
          value !== null && 
          (typeof value !== 'string' || value.trim() !== '')
        )
      );

      // Adicionar review (usando new Date() em vez de serverTimestamp())
      const reviewRef = await addDoc(collection(db, 'thematicReviews'), cleanReviewData);

      // Atualizar estatísticas do serviço (batch operation)
      await this.updateServiceStats(serviceId, serviceType, categoryRatings, overallRating);

      console.log('✅ Review temático criado:', reviewRef.id);
      return reviewRef.id;

    } catch (error) {
      console.error('❌ Erro ao criar review temático:', error);
      throw error;
    }
  }

  /**
   * Buscar reviews de um serviço
   */
  static async getServiceReviews(
    serviceId: string, 
    filters?: ReviewFilter,
    pageSize: number = 10,
    lastDoc?: DocumentSnapshot
  ): Promise<{ reviews: ThematicReview[]; lastDoc?: DocumentSnapshot }> {
    try {
      console.log(`🔍 Buscando reviews para serviço: ${serviceId}`);

      let q = query(
        collection(db, 'thematicReviews'),
        where('serviceId', '==', serviceId)
      );

      // Aplicar filtros
      if (filters?.verified !== undefined) {
        q = query(q, where('verified', '==', filters.verified));
      }

      if (filters?.ratingRange) {
        q = query(
          q, 
          where('overallRating', '>=', filters.ratingRange[0]),
          where('overallRating', '<=', filters.ratingRange[1])
        );
      }

      // Ordenação
      const sortField = this.getSortField(filters?.sortBy || 'newest');
      const sortDirection = filters?.sortBy === 'oldest' ? 'asc' : 'desc';
      q = query(q, orderBy(sortField, sortDirection));

      // Paginação
      q = query(q, limit(pageSize));
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const reviews: ThematicReview[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as ThematicReview);
      });

      console.log(`📋 Encontrados ${reviews.length} reviews`);

      return {
        reviews,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };

    } catch (error) {
      console.error('❌ Erro ao buscar reviews:', error);
      throw error;
    }
  }

  /**
   * Gerar insights automáticos para um serviço
   */
  static async generateServiceInsights(serviceId: string): Promise<ServiceInsights> {
    try {
      console.log(`🧠 Gerando insights para serviço: ${serviceId}`);

      // Buscar todos os reviews do serviço
      const { reviews } = await this.getServiceReviews(serviceId, undefined, 1000);

      if (reviews.length === 0) {
        throw new Error('Nenhum review encontrado para gerar insights');
      }

      const serviceType = reviews[0].serviceType;
      const serviceName = reviews[0].serviceName;

      // Calcular estatísticas por categoria
      const categoryStats = this.calculateCategoryStats(serviceType, reviews);
      
      // Calcular nota geral
      const overallRating = reviews.reduce((sum, review) => sum + review.overallRating, 0) / reviews.length;

      // Gerar insights automáticos
      const insights = await this.generateAutomaticInsights(serviceType, categoryStats, reviews);

      // Calcular comparações (simulado por enquanto)
      const comparison = await this.calculateComparisons(serviceType, categoryStats);

      // Analisar padrões temporais
      const timePatterns = this.analyzeTimePatterns(reviews);

      const serviceInsights: ServiceInsights = {
        serviceId,
        serviceName,
        serviceType,
        categoryStats,
        overallRating: Math.round(overallRating * 10) / 10,
        totalReviews: reviews.length,
        insights,
        comparison,
        timePatterns,
        lastUpdated: new Date()
      };

      // Salvar insights no Firestore
      await this.saveInsights(serviceInsights);

      console.log('🎯 Insights gerados com sucesso');
      return serviceInsights;

    } catch (error) {
      console.error('❌ Erro ao gerar insights:', error);
      throw error;
    }
  }

  /**
   * Marcar review como útil
   */
  static async markReviewHelpful(reviewId: string): Promise<void> {
    try {
      const reviewRef = doc(db, 'thematicReviews', reviewId);
      await updateDoc(reviewRef, {
        helpful: increment(1)
      });
      console.log('👍 Review marcado como útil');
    } catch (error) {
      console.error('❌ Erro ao marcar review como útil:', error);
      throw error;
    }
  }

  /**
   * MÉTODOS PRIVADOS DE UTILIDADE
   */

  private static calculateOverallRating(serviceType: ServiceType, categoryRatings: CategoryRating[]): number {
    const categories = REVIEW_CATEGORIES[serviceType];
    let weightedSum = 0;
    let totalWeight = 0;

    categoryRatings.forEach(rating => {
      const category = categories.find(cat => cat.id === rating.categoryId);
      if (category) {
        weightedSum += rating.rating * category.weight;
        totalWeight += category.weight;
      }
    });

    return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;
  }

  private static calculateCategoryStats(serviceType: ServiceType, reviews: ThematicReview[]) {
    const categories = REVIEW_CATEGORIES[serviceType];
    
    return categories.map(category => {
      const categoryRatings = reviews
        .map(review => review.categoryRatings[category.id])
        .filter(rating => rating !== undefined);

      const averageRating = categoryRatings.length > 0 
        ? categoryRatings.reduce((sum, rating) => sum + rating, 0) / categoryRatings.length 
        : 0;

      // Simular trend analysis (poderia ser mais sofisticado)
      const trend = averageRating > 3.5 ? 'improving' : averageRating < 2.5 ? 'declining' : 'stable';
      
      // Simular percentil (comparação com outros serviços)
      const percentile = Math.min(95, Math.max(5, averageRating * 20));

      return {
        categoryId: category.id,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: categoryRatings.length,
        trend: trend as 'improving' | 'declining' | 'stable',
        percentile
      };
    });
  }

  private static async generateAutomaticInsights(
    serviceType: ServiceType, 
    categoryStats: any[], 
    reviews: ThematicReview[]
  ): Promise<ServiceInsights['insights']> {
    const insights: ServiceInsights['insights'] = [];
    const categories = REVIEW_CATEGORIES[serviceType];

    // Identificar pontos fortes
    const strongCategories = categoryStats.filter(stat => stat.averageRating >= 4.0);
    strongCategories.forEach(stat => {
      const category = categories.find(cat => cat.id === stat.categoryId);
      if (category) {
        insights.push({
          id: `strength_${stat.categoryId}`,
          type: 'strength' as const,
          priority: 'medium' as const,
          category: category.name,
          message: `Excelente em ${category.name.toLowerCase()} (${stat.averageRating}/5)`,
          supportingData: { rating: stat.averageRating, reviewCount: stat.reviewCount },
          generatedAt: new Date()
        });
      }
    });

    // Identificar pontos fracos
    const weakCategories = categoryStats.filter(stat => stat.averageRating <= 2.5);
    weakCategories.forEach(stat => {
      const category = categories.find(cat => cat.id === stat.categoryId);
      if (category) {
        insights.push({
          id: `weakness_${stat.categoryId}`,
          type: 'weakness' as const,
          priority: 'high' as const,
          category: category.name,
          message: `Necessita melhorias em ${category.name.toLowerCase()} (${stat.averageRating}/5)`,
          supportingData: { rating: stat.averageRating, reviewCount: stat.reviewCount },
          generatedAt: new Date()
        });
      }
    });

    // Identificar tendências
    const trendingUp = categoryStats.filter(stat => stat.trend === 'improving');
    trendingUp.forEach(stat => {
      const category = categories.find(cat => cat.id === stat.categoryId);
      if (category) {
        insights.push({
          id: `trend_${stat.categoryId}`,
          type: 'trend' as const,
          priority: 'low' as const,
          category: category.name,
          message: `Mostrando melhoria em ${category.name.toLowerCase()}`,
          supportingData: { trend: stat.trend, rating: stat.averageRating },
          generatedAt: new Date()
        });
      }
    });

    return insights;
  }

  private static async calculateComparisons(serviceType: ServiceType, categoryStats: any[]) {
    // Simulação simples - em produção, compararia com outros serviços do mesmo tipo
    const overallPercentile = categoryStats.reduce((sum, stat) => sum + stat.percentile, 0) / categoryStats.length;
    
    return {
      betterThan: Math.round(overallPercentile),
      categoryRankings: categoryStats.map(stat => ({
        categoryId: stat.categoryId,
        rank: Math.ceil((100 - stat.percentile) / 10), // Simular ranking
        totalInCategory: 50 // Simular total de serviços na categoria
      }))
    };
  }

  private static analyzeTimePatterns(reviews: ThematicReview[]) {
    // Análise simples de padrões temporais
    const reviewsWithContext = reviews.filter(review => review.visitContext?.visitDate);
    
    // Simular padrões (em produção, analisaria dados reais)
    return {
      bestDaysOfWeek: ['Tuesday', 'Wednesday', 'Thursday'],
      bestTimesOfDay: ['09:00-11:00', '14:00-16:00'],
      avgWaitTimeByPeriod: {
        morning: 15,
        afternoon: 25,
        evening: 20
      }
    };
  }

  private static async updateServiceStats(
    serviceId: string, 
    serviceType: ServiceType, 
    categoryRatings: CategoryRating[], 
    overallRating: number
  ) {
    const batch = writeBatch(db);

    // Atualizar contadores no documento do serviço
    const serviceRef = doc(db, 'healthServices', serviceId);
    batch.update(serviceRef, {
      reviewCount: increment(1),
      lastReviewDate: serverTimestamp()
    });

    // Atualizar estatísticas por categoria
    categoryRatings.forEach(rating => {
      const statsRef = doc(db, 'reviewStats', `${serviceId}_${rating.categoryId}`);
      batch.set(statsRef, {
        serviceId,
        categoryId: rating.categoryId,
        totalRating: increment(rating.rating),
        reviewCount: increment(1),
        averageRating: 0, // Será calculado via Cloud Function
        lastUpdated: serverTimestamp()
      }, { merge: true });
    });

    await batch.commit();
  }

  private static async saveInsights(insights: ServiceInsights) {
    const insightsRef = doc(db, 'serviceInsights', insights.serviceId);
    await updateDoc(insightsRef, {
      ...insights,
      lastUpdated: serverTimestamp()
    });
  }

  private static getSortField(sortBy: string): string {
    switch (sortBy) {
      case 'newest': return 'createdAt';
      case 'oldest': return 'createdAt';
      case 'highest': return 'overallRating';
      case 'lowest': return 'overallRating';
      case 'helpful': return 'helpful';
      default: return 'createdAt';
    }
  }
}