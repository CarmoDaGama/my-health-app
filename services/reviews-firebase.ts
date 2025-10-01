import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  writeBatch,
  Timestamp,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { Review, ReviewInput, ReviewStats, ReviewsResponse, ReviewFilters } from '../types';

const REVIEWS_COLLECTION = 'reviews';
const SERVICES_COLLECTION = 'healthServices';

export class ReviewsService {
  /**
   * Add a new review for a service
   */
  static async addReview(
    reviewInput: ReviewInput,
    userId: string,
    userName: string,
    userAvatar?: string
  ): Promise<string> {
    try {
      // Check if user already reviewed this service
      const existingReview = await this.getUserReviewForService(reviewInput.serviceId, userId);
      if (existingReview) {
        throw new Error('Você já avaliou este serviço');
      }

      // Validate rating
      if (reviewInput.rating < 1 || reviewInput.rating > 5) {
        throw new Error('Avaliação deve ser entre 1 e 5 estrelas');
      }

      const now = new Date();
      const reviewData: Omit<Review, 'id'> = {
        serviceId: reviewInput.serviceId,
        userId,
        userName,
        userAvatar: userAvatar || null,
        rating: reviewInput.rating,
        comment: reviewInput.comment.trim(),
        createdAt: now,
        updatedAt: now,
        verified: false,
        helpful: 0,
        reported: false,
      };

      // Use batch to add review and update service stats
      const batch = writeBatch(db);

      // Add review - filter out undefined values
      const reviewRef = doc(collection(db, REVIEWS_COLLECTION));
      const firestoreData = {
        ...reviewData,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      };
      
      // Remove undefined values for Firestore
      Object.keys(firestoreData).forEach(key => {
        if (firestoreData[key as keyof typeof firestoreData] === undefined) {
          delete firestoreData[key as keyof typeof firestoreData];
        }
      });

      batch.set(reviewRef, firestoreData);

      // Update service rating stats
      const serviceRef = doc(db, SERVICES_COLLECTION, reviewInput.serviceId);
      batch.update(serviceRef, {
        reviews: increment(1),
      });

      await batch.commit();

      // Recalculate and update average rating
      await this.updateServiceRating(reviewInput.serviceId);

      return reviewRef.id;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  /**
   * Get reviews for a specific service (simple version without complex sorting)
   */
  static async getServiceReviews(
    serviceId: string,
    filters: ReviewFilters = {}
  ): Promise<ReviewsResponse> {
    try {
      const { limit: pageLimit = 10 } = filters;

      // Simple query without complex sorting to avoid index requirements
      const reviewQuery = query(
        collection(db, REVIEWS_COLLECTION),
        where('serviceId', '==', serviceId),
        limit(pageLimit + 1)
      );

      const snapshot = await getDocs(reviewQuery);
      const reviews: Review[] = [];
      
      snapshot.docs.slice(0, pageLimit).forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          serviceId: data.serviceId,
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar || null,
          rating: data.rating,
          comment: data.comment,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          verified: data.verified || false,
          helpful: data.helpful || 0,
          reported: data.reported || false,
        });
      });

      // Sort in memory by date (newest first)
      reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const hasMore = snapshot.docs.length > pageLimit;
      const newLastDocId = reviews.length > 0 ? reviews[reviews.length - 1].id : undefined;

      // Get review stats
      const stats = await this.getServiceReviewStats(serviceId);

      return {
        reviews,
        stats,
        hasMore,
        lastDocId: newLastDocId,
      };
    } catch (error) {
      console.error('Error getting service reviews:', error);
      throw error;
    }
  }

  /**
   * Get review statistics for a service
   */
  static async getServiceReviewStats(serviceId: string): Promise<ReviewStats> {
    try {
      const reviewsQuery = query(
        collection(db, REVIEWS_COLLECTION),
        where('serviceId', '==', serviceId)
      );

      const snapshot = await getDocs(reviewsQuery);
      const totalReviews = snapshot.size;

      if (totalReviews === 0) {
        return {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };
      }

      let totalRating = 0;
      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      snapshot.docs.forEach((doc) => {
        const rating = doc.data().rating;
        totalRating += rating;
        ratingDistribution[rating as keyof typeof ratingDistribution]++;
      });

      const averageRating = Number((totalRating / totalReviews).toFixed(1));

      return {
        totalReviews,
        averageRating,
        ratingDistribution,
      };
    } catch (error) {
      console.error('Error getting review stats:', error);
      throw error;
    }
  }

  /**
   * Update service average rating and review count
   */
  static async updateServiceRating(serviceId: string): Promise<void> {
    try {
      const stats = await this.getServiceReviewStats(serviceId);
      
      const serviceRef = doc(db, SERVICES_COLLECTION, serviceId);
      await updateDoc(serviceRef, {
        rating: stats.averageRating,
        reviews: stats.totalReviews,
      });
    } catch (error) {
      console.error('Error updating service rating:', error);
      throw error;
    }
  }

  /**
   * Check if user has already reviewed a service
   */
  static async getUserReviewForService(serviceId: string, userId: string): Promise<Review | null> {
    try {
      const reviewQuery = query(
        collection(db, REVIEWS_COLLECTION),
        where('serviceId', '==', serviceId),
        where('userId', '==', userId),
        limit(1)
      );

      const snapshot = await getDocs(reviewQuery);
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        serviceId: data.serviceId,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar || null,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        verified: data.verified || false,
        helpful: data.helpful || 0,
        reported: data.reported || false,
      };
    } catch (error) {
      console.error('Error checking user review:', error);
      throw error;
    }
  }

  /**
   * Update an existing review
   */
  static async updateReview(
    reviewId: string,
    userId: string,
    updates: Partial<Pick<Review, 'rating' | 'comment'>>
  ): Promise<void> {
    try {
      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      const reviewDoc = await getDoc(reviewRef);

      if (!reviewDoc.exists()) {
        throw new Error('Avaliação não encontrada');
      }

      const reviewData = reviewDoc.data();
      if (reviewData.userId !== userId) {
        throw new Error('Você só pode editar suas próprias avaliações');
      }

      await updateDoc(reviewRef, {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      // Recalculate service rating if rating was updated
      if (updates.rating) {
        await this.updateServiceRating(reviewData.serviceId);
      }
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  /**
   * Delete a review
   */
  static async deleteReview(reviewId: string, userId: string): Promise<void> {
    try {
      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      const reviewDoc = await getDoc(reviewRef);

      if (!reviewDoc.exists()) {
        throw new Error('Avaliação não encontrada');
      }

      const reviewData = reviewDoc.data();
      if (reviewData.userId !== userId) {
        throw new Error('Você só pode deletar suas próprias avaliações');
      }

      const serviceId = reviewData.serviceId;

      // Use batch to delete review and update service stats
      const batch = writeBatch(db);

      batch.delete(reviewRef);

      const serviceRef = doc(db, SERVICES_COLLECTION, serviceId);
      batch.update(serviceRef, {
        reviews: increment(-1),
      });

      await batch.commit();

      // Recalculate average rating
      await this.updateServiceRating(serviceId);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  /**
   * Mark review as helpful
   */
  static async markReviewHelpful(reviewId: string): Promise<void> {
    try {
      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      await updateDoc(reviewRef, {
        helpful: increment(1),
      });
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      throw error;
    }
  }

  /**
   * Report a review
   */
  static async reportReview(reviewId: string): Promise<void> {
    try {
      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      await updateDoc(reviewRef, {
        reported: true,
      });
    } catch (error) {
      console.error('Error reporting review:', error);
      throw error;
    }
  }

  /**
   * Get user's reviews across all services
   */
  static async getUserReviews(userId: string, pageLimit = 10): Promise<ReviewsResponse> {
    try {
      const reviewQuery = query(
        collection(db, REVIEWS_COLLECTION),
        where('userId', '==', userId),
        limit(pageLimit)
      );

      const snapshot = await getDocs(reviewQuery);
      const reviews: Review[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          serviceId: data.serviceId,
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar || null,
          rating: data.rating,
          comment: data.comment,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          verified: data.verified || false,
          helpful: data.helpful || 0,
          reported: data.reported || false,
        });
      });

      // Sort in memory by date (newest first)
      reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return {
        reviews,
        stats: {
          totalReviews: reviews.length,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
        hasMore: reviews.length === pageLimit,
        lastDocId: reviews.length > 0 ? reviews[reviews.length - 1].id : undefined,
      };
    } catch (error) {
      console.error('Error getting user reviews:', error);
      throw error;
    }
  }
}