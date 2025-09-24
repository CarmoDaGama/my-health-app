import { HealthService, Coordinates } from '../types';
import healthServicesData from '../data/healthServices.json';
import { serviceCache } from './cache';

export class HealthServiceAPI {
  private static services: HealthService[] = healthServicesData.healthServices as HealthService[];

  // Obter todos os serviços (com cache)
  static getAllServices(): HealthService[] {
    const cacheKey = 'all_services';
    const cachedServices = serviceCache.get<HealthService[]>(cacheKey);
    
    if (cachedServices) {
      return cachedServices;
    }
    
    // Cache os serviços por 30 minutos
    serviceCache.set(cacheKey, this.services, { ttl: 1000 * 60 * 30 });
    return this.services;
  }

  // Buscar serviços por texto (com cache)
  static searchServices(query: string): HealthService[] {
    if (!query.trim()) {
      return this.getAllServices();
    }

    const searchTerm = query.toLowerCase().trim();
    const cacheKey = `search_${searchTerm}`;
    const cachedResults = serviceCache.get<HealthService[]>(cacheKey);
    
    if (cachedResults) {
      return cachedResults;
    }

    const results = this.services.filter(service => 
      service.name.toLowerCase().includes(searchTerm) ||
      service.type.toLowerCase().includes(searchTerm) ||
      service.address.toLowerCase().includes(searchTerm) ||
      service.description.toLowerCase().includes(searchTerm)
    );
    
    // Cache os resultados de busca por 15 minutos
    serviceCache.set(cacheKey, results, { ttl: 1000 * 60 * 15 });
    return results;
  }

  // Buscar serviços por tipo (com cache)
  static getServicesByType(type: string): HealthService[] {
    const cacheKey = `type_${type}`;
    const cachedResults = serviceCache.get<HealthService[]>(cacheKey);
    
    if (cachedResults) {
      return cachedResults;
    }
    
    const results = this.services.filter(service => service.type === type);
    
    // Cache os resultados por tipo por 60 minutos
    serviceCache.set(cacheKey, results, { ttl: 1000 * 60 * 60 });
    return results;
  }

  // Obter serviço por ID
  static getServiceById(id: string): HealthService | undefined {
    return this.services.find(service => service.id === id);
  }

  // Calcular distância entre dois pontos (fórmula de Haversine)
  static calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) * 
      Math.cos(this.toRadians(point2.latitude)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Obter serviços próximos (ordenados por distância) com cache
  static getNearbyServices(
    userLocation: Coordinates,
    radiusKm: number = 10
  ): HealthService[] {
    // Criar chave de cache baseada na localização (arredondada para evitar cache excessivo)
    const roundedLat = Math.round(userLocation.latitude * 1000) / 1000;
    const roundedLng = Math.round(userLocation.longitude * 1000) / 1000;
    const cacheKey = `nearby_${roundedLat}_${roundedLng}_${radiusKm}`;
    
    const cachedResults = serviceCache.get<HealthService[]>(cacheKey);
    if (cachedResults) {
      return cachedResults;
    }

    const results = this.services
      .map(service => ({
        ...service,
        distance: this.calculateDistance(userLocation, service.coordinates)
      }))
      .filter(service => service.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
    
    // Cache os resultados de proximidade por 10 minutos (localização pode mudar)
    serviceCache.set(cacheKey, results, { ttl: 1000 * 60 * 10 });
    return results;
  }

  // Limpar cache (útil quando dados são atualizados)
  static clearCache(): void {
    serviceCache.clear();
  }

  // Invalidar cache específico
  static invalidateSearchCache(): void {
    // Em uma implementação mais sofisticada, removeríamos apenas chaves de busca
    serviceCache.cleanup();
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
