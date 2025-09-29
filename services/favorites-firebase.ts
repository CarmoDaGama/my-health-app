import { 
  doc, 
  getDoc,
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { HealthService } from '../types';

export class FavoritesServiceFirebase {
  
  /**
   * Get user's favorite services
   */
  static async getFavoriteServices(): Promise<string[]> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return [];
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.preferences?.favorites?.services || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching favorite services:', error);
      return [];
    }
  }

  /**
   * Add service to favorites
   */
  static async addFavoriteService(serviceId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Check if user document exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        await setDoc(userDocRef, {
          preferences: {
            favorites: {
              services: [serviceId],
              locations: []
            }
          },
          updatedAt: serverTimestamp()
        }, { merge: true });
      } else {
        // Update existing document
        await updateDoc(userDocRef, {
          'preferences.favorites.services': arrayUnion(serviceId),
          updatedAt: serverTimestamp()
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding favorite service:', error);
      return { 
        success: false, 
        error: 'Erro ao adicionar aos favoritos' 
      };
    }
  }

  /**
   * Remove service from favorites
   */
  static async removeFavoriteService(serviceId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      await updateDoc(doc(db, 'users', user.uid), {
        'preferences.favorites.services': arrayRemove(serviceId),
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error removing favorite service:', error);
      return { 
        success: false, 
        error: 'Erro ao remover dos favoritos' 
      };
    }
  }

  /**
   * Check if service is favorite
   */
  static async isFavoriteService(serviceId: string): Promise<boolean> {
    try {
      const favoriteServices = await this.getFavoriteServices();
      return favoriteServices.includes(serviceId);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }

  /**
   * Toggle favorite status
   */
  static async toggleFavoriteService(serviceId: string): Promise<{ success: boolean; isFavorite: boolean; error?: string }> {
    try {
      const isFavorite = await this.isFavoriteService(serviceId);
      
      if (isFavorite) {
        const result = await this.removeFavoriteService(serviceId);
        return { 
          success: result.success, 
          isFavorite: false, 
          error: result.error 
        };
      } else {
        const result = await this.addFavoriteService(serviceId);
        return { 
          success: result.success, 
          isFavorite: true, 
          error: result.error 
        };
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return { 
        success: false, 
        isFavorite: false, 
        error: 'Erro ao alterar favorito' 
      };
    }
  }

  /**
   * Get favorite locations
   */
  static async getFavoriteLocations(): Promise<Array<{ id: string; name: string; coordinates: { latitude: number; longitude: number } }>> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return [];
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.preferences?.favorites?.locations || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching favorite locations:', error);
      return [];
    }
  }

  /**
   * Add location to favorites
   */
  static async addFavoriteLocation(location: {
    id: string;
    name: string;
    coordinates: { latitude: number; longitude: number };
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          preferences: {
            favorites: {
              services: [],
              locations: [location]
            }
          },
          updatedAt: serverTimestamp()
        }, { merge: true });
      } else {
        await updateDoc(userDocRef, {
          'preferences.favorites.locations': arrayUnion(location),
          updatedAt: serverTimestamp()
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding favorite location:', error);
      return { 
        success: false, 
        error: 'Erro ao adicionar localização aos favoritos' 
      };
    }
  }

  /**
   * Remove location from favorites
   */
  static async removeFavoriteLocation(locationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Get current locations and filter out the one to remove
      const favoriteLocations = await this.getFavoriteLocations();
      const updatedLocations = favoriteLocations.filter(loc => loc.id !== locationId);

      await updateDoc(doc(db, 'users', user.uid), {
        'preferences.favorites.locations': updatedLocations,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error removing favorite location:', error);
      return { 
        success: false, 
        error: 'Erro ao remover localização dos favoritos' 
      };
    }
  }

  /**
   * Clear all favorites
   */
  static async clearAllFavorites(): Promise<{ success: boolean; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      await updateDoc(doc(db, 'users', user.uid), {
        'preferences.favorites.services': [],
        'preferences.favorites.locations': [],
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error clearing favorites:', error);
      return { 
        success: false, 
        error: 'Erro ao limpar favoritos' 
      };
    }
  }
}