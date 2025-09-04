import { HealthService, Coordinates } from '../types';
import healthServicesData from '../data/healthServices.json';

export class HealthServiceAPI {
  private static services: HealthService[] = healthServicesData.healthServices as HealthService[];

  // Obter todos os serviços
  static getAllServices(): HealthService[] {
    return this.services;
  }

  // Buscar serviços por texto
  static searchServices(query: string): HealthService[] {
    if (!query.trim()) {
      return this.services;
    }

    const searchTerm = query.toLowerCase().trim();
    return this.services.filter(service => 
      service.name.toLowerCase().includes(searchTerm) ||
      service.type.toLowerCase().includes(searchTerm) ||
      service.address.toLowerCase().includes(searchTerm) ||
      service.description.toLowerCase().includes(searchTerm)
    );
  }

  // Buscar serviços por tipo
  static getServicesByType(type: string): HealthService[] {
    return this.services.filter(service => service.type === type);
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

  // Obter serviços próximos (ordenados por distância)
  static getNearbyServices(
    userLocation: Coordinates,
    radiusKm: number = 10
  ): HealthService[] {
    return this.services
      .map(service => ({
        ...service,
        distance: this.calculateDistance(userLocation, service.coordinates)
      }))
      .filter(service => service.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
