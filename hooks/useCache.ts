import { useState, useCallback, useEffect } from 'react';
import { serviceCache, routeCache, locationCache } from '../services/cache';

export type CacheType = 'service' | 'route' | 'location';

interface UseCacheOptions {
  cacheType: CacheType;
  ttl?: number;
  autoCleanup?: boolean;
}

export const useCache = <T>(options: UseCacheOptions) => {
  const { cacheType, ttl, autoCleanup = true } = options;
  const [isLoading, setIsLoading] = useState(false);

  const getCache = () => {
    switch (cacheType) {
      case 'service':
        return serviceCache;
      case 'route':
        return routeCache;
      case 'location':
        return locationCache;
      default:
        return serviceCache;
    }
  };

  const cache = getCache();

  // Cleanup automático na inicialização
  useEffect(() => {
    if (autoCleanup) {
      cache.cleanup();
    }
  }, [cache, autoCleanup]);

  const getCachedData = useCallback((key: string): T | null => {
    return cache.get<T>(key);
  }, [cache]);

  const setCachedData = useCallback((key: string, data: T, customTtl?: number) => {
    cache.set(key, data, { ttl: customTtl || ttl });
  }, [cache, ttl]);

  const removeCachedData = useCallback((key: string) => {
    cache.remove(key);
  }, [cache]);

  const clearCache = useCallback(() => {
    cache.clear();
  }, [cache]);

  const hasCachedData = useCallback((key: string): boolean => {
    return cache.has(key);
  }, [cache]);

  const getOrFetch = useCallback(async <R = T>(
    key: string,
    fetchFunction: () => Promise<R>,
    customTtl?: number
  ): Promise<R> => {
    setIsLoading(true);
    
    try {
      // Tentar buscar do cache primeiro
      const cachedData = cache.get<R>(key);
      if (cachedData !== null) {
        setIsLoading(false);
        return cachedData;
      }

      // Se não estiver no cache, buscar dados
      const freshData = await fetchFunction();
      
      // Cachear os novos dados
      cache.set(key, freshData, { ttl: customTtl || ttl });
      
      setIsLoading(false);
      return freshData;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [cache, ttl]);

  const invalidatePattern = useCallback((pattern: string) => {
    const stats = cache.getStats();
    // Como não temos acesso direto às chaves, vamos fazer cleanup geral
    cache.cleanup();
  }, [cache]);

  const getCacheStats = useCallback(() => {
    return cache.getStats();
  }, [cache]);

  return {
    getCachedData,
    setCachedData,
    removeCachedData,
    clearCache,
    hasCachedData,
    getOrFetch,
    invalidatePattern,
    getCacheStats,
    isLoading,
  };
};

// Hook específico para serviços de saúde
export const useServiceCache = () => {
  return useCache<any>({
    cacheType: 'service',
    ttl: 1000 * 60 * 30, // 30 minutos
  });
};

// Hook específico para rotas
export const useRouteCache = () => {
  return useCache<any>({
    cacheType: 'route',
    ttl: 1000 * 60 * 60 * 2, // 2 horas
  });
};

// Hook específico para localizações
export const useLocationCache = () => {
  return useCache<any>({
    cacheType: 'location',
    ttl: 1000 * 60 * 5, // 5 minutos
  });
};

export default useCache;