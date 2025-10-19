import { HealthService, Coordinates } from '../types';
import healthServicesData from '../data/healthServices.json';
import { serviceCache } from './cache';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

const REGISTERED_SERVICES_KEY = '@health_app:registered_services';

export class HealthServiceAPI {
  private static services: HealthService[] = healthServicesData.healthServices as HealthService[];

  // Obter serviços registrados do Firestore
  private static async getFirestoreServices(): Promise<HealthService[]> {
    try {
      console.log('🔥 Buscando serviços do Firestore...');
      const servicesQuery = query(
        collection(db, 'healthServices'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(servicesQuery);
      const firestoreServices: HealthService[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // APLICAR FILTROS RIGOROSOS para profissionais e instituições
        const serviceStatus = data.status !== undefined ? data.status : 'active';
        const isVerified = data.verified !== undefined ? data.verified : true;
        
        // Para profissionais e instituições, filtrar não ativos ou não verificados
        if (data.type === 'professional' || data.serviceType === 'professional' || 
            data.type === 'institution' || data.serviceType === 'institution') {
          
          if (serviceStatus !== 'active' || !isVerified) {
            return; // Pular este serviço
          }
        }
        
        firestoreServices.push({
          id: doc.id,
          ...data
        } as HealthService);
      });
      
      console.log('✅ Serviços do Firestore carregados:', firestoreServices.length);
      if (firestoreServices.length > 0) {
        console.log('🏥 Nomes dos serviços do Firestore:', firestoreServices.map(s => s.name).join(', '));
      }
      
      return firestoreServices;
    } catch (error) {
      console.error('❌ Erro ao buscar serviços do Firestore:', error);
      // Fallback para AsyncStorage se Firestore falhar
      return await this.getRegisteredServicesFromStorage();
    }
  }

  // Obter serviços registrados do AsyncStorage (renomeado para ser mais específico)
  private static async getRegisteredServicesFromStorage(): Promise<HealthService[]> {
    try {
      const servicesJson = await AsyncStorage.getItem(REGISTERED_SERVICES_KEY);
      const registeredServices = servicesJson ? JSON.parse(servicesJson) : [];
      console.log('📱 Serviços registrados carregados:', registeredServices.length);
      if (registeredServices.length > 0) {
        console.log('🏥 Nomes dos serviços registrados:', registeredServices.map((s: any) => s.name).join(', '));
      }
      return registeredServices;
    } catch (error) {
      console.error('Erro ao obter serviços registrados:', error);
      return [];
    }
  }

  // Combinar serviços estáticos com serviços registrados
  private static async getAllCombinedServices(): Promise<HealthService[]> {
    // Priorizar Firestore, usar AsyncStorage como fallback
    const registeredServices = await this.getFirestoreServices();
    const combined = [...this.services, ...registeredServices];
    console.log(`🔗 Combinando serviços: ${this.services.length} estáticos + ${registeredServices.length} registrados = ${combined.length} total`);
    return combined;
  }

  // Obter todos os serviços (com cache) incluindo registrados
  static async getAllServices(): Promise<HealthService[]> {
    const cacheKey = 'all_services';
    const cachedServices = serviceCache.get<HealthService[]>(cacheKey);
    
    if (cachedServices) {
      console.log('📋 Usando serviços do cache:', cachedServices.length);
      return cachedServices;
    }
    
    console.log('🔄 Carregando serviços do storage...');
    const allServices = await this.getAllCombinedServices();
    
    // Cache os serviços por 10 minutos (menor tempo por incluir serviços dinâmicos)
    serviceCache.set(cacheKey, allServices, { ttl: 1000 * 60 * 10 });
    return allServices;
  }

  // Forçar recarregamento dos serviços (limpar cache e recarregar)
  static async refreshServices(): Promise<HealthService[]> {
    console.log('🔄 Forçando recarregamento de serviços...');
    const cacheKey = 'all_services';
    
    // Limpar cache
    serviceCache.remove(cacheKey);
    console.log('✅ Cache removido');
    
    // Recarregar serviços
    const allServices = await this.getAllCombinedServices();
    
    // Recriar cache
    serviceCache.set(cacheKey, allServices, { ttl: 1000 * 60 * 10 });
    console.log('✅ Serviços recarregados:', allServices.length);
    
    return allServices;
  }

  // Método de debug para listar todos os serviços
  static async debugListAllServices(): Promise<void> {
    console.log('🔍 === DEBUG: LISTANDO TODOS OS SERVIÇOS ===');
    
    // Serviços estáticos
    console.log('📋 Serviços estáticos:', this.services.length);
    this.services.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.name} (${service.type})`);
    });
    
    // Serviços registrados
    const registeredServices = await this.getFirestoreServices();
    console.log('📱 Serviços registrados:', registeredServices.length);
    registeredServices.forEach((service: any, index: number) => {
      console.log(`   ${index + 1}. ${service.name} (${service.type}) - ${service.address}`);
    });
    
    // Total combinado
    const allServices = await this.getAllCombinedServices();
    console.log('🔗 Total combinado:', allServices.length);
    
    // Cache status
    const cachedServices = serviceCache.get<HealthService[]>('all_services');
    console.log('💾 Em cache:', cachedServices ? cachedServices.length : 'nenhum');
    
    console.log('🔍 === FIM DEBUG ===');
  }

  // Buscar serviços por texto (com cache)
  static async searchServices(query: string): Promise<HealthService[]> {
    if (!query.trim()) {
      return await this.getAllServices();
    }

    const searchTerm = query.toLowerCase().trim();
    const cacheKey = `search_${searchTerm}`;
    const cachedResults = serviceCache.get<HealthService[]>(cacheKey);
    
    if (cachedResults) {
      return cachedResults;
    }

    const allServices = await this.getAllCombinedServices();
    const results = allServices.filter(service => 
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
  static async getServicesByType(type: string): Promise<HealthService[]> {
    const cacheKey = `type_${type}`;
    const cachedResults = serviceCache.get<HealthService[]>(cacheKey);
    
    if (cachedResults) {
      return cachedResults;
    }
    
    const allServices = await this.getAllCombinedServices();
    const results = allServices.filter(service => service.type === type);
    
    // Cache os resultados por tipo por 30 minutos
    serviceCache.set(cacheKey, results, { ttl: 1000 * 60 * 30 });
    return results;
  }

  // Obter serviço por ID
  static async getServiceById(id: string): Promise<HealthService | undefined> {
    const allServices = await this.getAllCombinedServices();
    return allServices.find(service => service.id === id);
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
  static async getNearbyServices(
    userLocation: Coordinates,
    radiusKm: number = 10
  ): Promise<HealthService[]> {
    // Criar chave de cache baseada na localização (arredondada para evitar cache excessivo)
    const roundedLat = Math.round(userLocation.latitude * 1000) / 1000;
    const roundedLng = Math.round(userLocation.longitude * 1000) / 1000;
    const cacheKey = `nearby_${roundedLat}_${roundedLng}_${radiusKm}`;
    
    const cachedResults = serviceCache.get<HealthService[]>(cacheKey);
    if (cachedResults) {
      return cachedResults;
    }

    const allServices = await this.getAllCombinedServices();
    const results = allServices
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
