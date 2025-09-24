import { HealthService, Coordinates } from '../types';
import { AuthService } from './auth';

export class FavoritesService {
  
  /**
   * Adicionar serviço aos favoritos
   */
  static async addFavoriteService(serviceId: string): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const favorites = [...user.preferences.favorites.services];
      if (!favorites.includes(serviceId)) {
        favorites.push(serviceId);
        
        await AuthService.updatePreferences({
          ...user.preferences,
          favorites: {
            ...user.preferences.favorites,
            services: favorites,
          },
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      throw new Error('Erro ao adicionar aos favoritos');
    }
  }

  /**
   * Remover serviço dos favoritos
   */
  static async removeFavoriteService(serviceId: string): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const favorites = user.preferences.favorites.services.filter(id => id !== serviceId);
      
      await AuthService.updatePreferences({
        ...user.preferences,
        favorites: {
          ...user.preferences.favorites,
          services: favorites,
        },
      });
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      throw new Error('Erro ao remover dos favoritos');
    }
  }

  /**
   * Verificar se um serviço está nos favoritos
   */
  static async isServiceFavorite(serviceId: string): Promise<boolean> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) {
        return false;
      }

      return user.preferences.favorites.services.includes(serviceId);
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
      return false;
    }
  }

  /**
   * Obter todos os serviços favoritos do usuário
   */
  static async getFavoriteServices(): Promise<string[]> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) {
        return [];
      }

      return user.preferences.favorites.services;
    } catch (error) {
      console.error('Erro ao obter favoritos:', error);
      return [];
    }
  }

  /**
   * Adicionar localização aos favoritos
   */
  static async addFavoriteLocation(coordinates: Coordinates, name?: string): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const favoriteLocation = {
        ...coordinates,
        name: name || `Localização ${user.preferences.favorites.locations.length + 1}`,
        addedAt: new Date().toISOString(),
      };

      const locations = [...user.preferences.favorites.locations, favoriteLocation];
      
      await AuthService.updatePreferences({
        ...user.preferences,
        favorites: {
          ...user.preferences.favorites,
          locations: locations,
        },
      });
    } catch (error) {
      console.error('Erro ao adicionar localização favorita:', error);
      throw new Error('Erro ao adicionar localização aos favoritos');
    }
  }

  /**
   * Remover localização dos favoritos
   */
  static async removeFavoriteLocation(index: number): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const locations = user.preferences.favorites.locations.filter((_, i) => i !== index);
      
      await AuthService.updatePreferences({
        ...user.preferences,
        favorites: {
          ...user.preferences.favorites,
          locations: locations,
        },
      });
    } catch (error) {
      console.error('Erro ao remover localização favorita:', error);
      throw new Error('Erro ao remover localização dos favoritos');
    }
  }

  /**
   * Obter todas as localizações favoritas do usuário
   */
  static async getFavoriteLocations(): Promise<Coordinates[]> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) {
        return [];
      }

      return user.preferences.favorites.locations;
    } catch (error) {
      console.error('Erro ao obter localizações favoritas:', error);
      return [];
    }
  }

  /**
   * Alternar favorito de um serviço (adicionar se não existe, remover se existe)
   */
  static async toggleFavoriteService(serviceId: string): Promise<boolean> {
    try {
      const isFavorite = await this.isServiceFavorite(serviceId);
      
      if (isFavorite) {
        await this.removeFavoriteService(serviceId);
        return false;
      } else {
        await this.addFavoriteService(serviceId);
        return true;
      }
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
      throw error;
    }
  }
}