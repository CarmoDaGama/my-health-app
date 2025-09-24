// Cache service sem AsyncStorage para simplicidade
// Em produção, recomenda-se instalar @react-native-async-storage/async-storage

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live em milissegundos
  maxSize?: number; // Tamanho máximo do cache em número de itens
  storageKey?: string; // Chave para armazenamento persistente
}

class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultTTL: number = 1000 * 60 * 15; // 15 minutos
  private maxSize: number = 100;
  private storagePrefix: string = '@health_app_cache_';

  constructor(options?: CacheOptions) {
    if (options?.ttl) this.defaultTTL = options.ttl;
    if (options?.maxSize) this.maxSize = options.maxSize;
  }

  /**
   * Adiciona um item ao cache
   */
  set<T>(key: string, data: T, options?: { ttl?: number }): void {
    const ttl = options?.ttl || this.defaultTTL;
    const expiresAt = Date.now() + ttl;
    
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresAt,
    };

    // Se o cache estiver cheio, remover o item mais antigo
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, cacheItem);
  }

  /**
   * Recupera um item do cache
   */
  get<T>(key: string): T | null {
    const cachedItem = this.cache.get(key);
    
    if (cachedItem) {
      if (this.isExpired(cachedItem)) {
        this.cache.delete(key);
        return null;
      } else {
        return cachedItem.data as T;
      }
    }

    return null;
  }

  /**
   * Remove um item do cache
   */
  remove(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Verifica se um item existe no cache e não expirou
   */
  has(key: string): boolean {
    const item = this.get(key);
    return item !== null;
  }

  /**
   * Recupera múltiplos itens do cache
   */
  getMultiple<T>(keys: string[]): Map<string, T> {
    const result = new Map<string, T>();
    
    for (const key of keys) {
      const item = this.get<T>(key);
      if (item !== null) {
        result.set(key, item);
      }
    }
    
    return result;
  }

  /**
   * Limpa itens expirados do cache
   */
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt <= now) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key);
    });
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats() {
    const now = Date.now();
    let validItems = 0;
    let expiredItems = 0;

    for (const item of this.cache.values()) {
      if (item.expiresAt > now) {
        validItems++;
      } else {
        expiredItems++;
      }
    }

    return {
      totalItems: this.cache.size,
      validItems,
      expiredItems,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
    };
  }

  private isExpired(item: CacheItem<any>): boolean {
    return item.expiresAt <= Date.now();
  }

  private getOldestKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  // Métodos privados para funcionalidade interna

  private calculateHitRate(): number {
    // Implementação simplificada - em produção, você manteria contadores
    return 0;
  }
}

// Instâncias globais de cache
export const serviceCache = new CacheService({
  ttl: 1000 * 60 * 30, // 30 minutos para serviços
  maxSize: 200,
});

export const routeCache = new CacheService({
  ttl: 1000 * 60 * 60 * 2, // 2 horas para rotas
  maxSize: 50,
});

export const locationCache = new CacheService({
  ttl: 1000 * 60 * 5, // 5 minutos para localizações
  maxSize: 10,
});

export default CacheService;