import React, { useState, useEffect } from 'react';
import { HealthService, Coordinates } from '../types';
import { FavoritesServiceFirebase } from '../services/favorites-firebase';
import { useAuth } from './useAuth-firebase';

export const useFavorites = () => {
  const { isAuthenticated, user } = useAuth();
  const [favoriteServices, setFavoriteServices] = useState<string[]>([]);
  const [favoriteLocations, setFavoriteLocations] = useState<Coordinates[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar favoritos quando o usuário estiver autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavorites();
    } else {
      setFavoriteServices([]);
      setFavoriteLocations([]);
    }
  }, [isAuthenticated, user]);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const [services, locations] = await Promise.all([
        FavoritesServiceFirebase.getFavoriteServices(),
        FavoritesServiceFirebase.getFavoriteLocations(),
      ]);
      setFavoriteServices(services);
      setFavoriteLocations(locations);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addFavoriteService = async (serviceId: string): Promise<void> => {
    try {
      await FavoritesServiceFirebase.addFavoriteService(serviceId);
      setFavoriteServices(prev => [...prev, serviceId]);
    } catch (error) {
      console.error('Erro ao adicionar serviço favorito:', error);
      throw error;
    }
  };

  const removeFavoriteService = async (serviceId: string): Promise<void> => {
    try {
      await FavoritesServiceFirebase.removeFavoriteService(serviceId);
      setFavoriteServices(prev => prev.filter(id => id !== serviceId));
    } catch (error) {
      console.error('Erro ao remover serviço favorito:', error);
      throw error;
    }
  };

  const toggleFavoriteService = async (serviceId: string): Promise<boolean> => {
    try {
      const newStatus = await FavoritesServiceFirebase.toggleFavoriteService(serviceId);
      if (newStatus) {
        setFavoriteServices(prev => [...prev, serviceId]);
      } else {
        setFavoriteServices(prev => prev.filter(id => id !== serviceId));
      }
      return newStatus;
    } catch (error) {
      console.error('Erro ao alternar serviço favorito:', error);
      throw error;
    }
  };

  const isServiceFavorite = (serviceId: string): boolean => {
    return favoriteServices.includes(serviceId);
  };

  const addFavoriteLocation = async (coordinates: Coordinates, name?: string): Promise<void> => {
    try {
      await FavoritesServiceFirebase.addFavoriteLocation(coordinates, name);
      await loadFavorites(); // Recarregar para obter a lista atualizada
    } catch (error) {
      console.error('Erro ao adicionar localização favorita:', error);
      throw error;
    }
  };

  const removeFavoriteLocation = async (index: number): Promise<void> => {
    try {
      await FavoritesServiceFirebase.removeFavoriteLocation(index);
      setFavoriteLocations(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Erro ao remover localização favorita:', error);
      throw error;
    }
  };

  return {
    // Estado
    favoriteServices,
    favoriteLocations,
    isLoading,
    
    // Métodos para serviços
    addFavoriteService,
    removeFavoriteService,
    toggleFavoriteService,
    isServiceFavorite,
    
    // Métodos para localizações
    addFavoriteLocation,
    removeFavoriteLocation,
    
    // Utilitários
    loadFavorites,
    hasFavorites: favoriteServices.length > 0 || favoriteLocations.length > 0,
    favoriteServicesCount: favoriteServices.length,
    favoriteLocationsCount: favoriteLocations.length,
  };
};