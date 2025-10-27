import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  doc, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  InstitutionService, 
  CreateServiceData, 
  UpdateServiceData, 
  ServiceFilters, 
  ServiceStats,
  InstitutionServiceResponse,
  ServiceCategory,
  ServiceStatus 
} from '../types/institutionService';

const INSTITUTION_SERVICES_KEY = '@health_app:institution_services';

export class InstitutionServiceAPI {
  
  /**
   * Obter serviços da instituição atual
   */
  static async getInstitutionServices(filters?: ServiceFilters, currentUser?: any): Promise<InstitutionServiceResponse> {
    try {
      // Se não foi passado usuário, tentar obter do storage
      const user = currentUser || await this.getCurrentUser();
      if (!user || user.userType !== 'institution') {
        throw new Error('Usuário não é uma instituição');
      }

      // Buscar no Firestore
      const firestoreServices = await this.getServicesFromFirestore(user.id, filters);
      
      // Buscar no AsyncStorage como fallback
      const localServices = await this.getServicesFromStorage(filters);
      
      // Combinar e remover duplicatas
      const allServices = this.combineServices(firestoreServices, localServices);
      
      // Calcular estatísticas
      const stats = this.calculateStats(allServices);
      
      return {
        services: allServices,
        stats,
        hasMore: false, // Implementar paginação depois
        currentPage: 1,
        totalPages: 1
      };
    } catch (error) {
      console.error('Erro ao obter serviços da instituição:', error);
      throw error;
    }
  }

  /**
   * Criar um novo serviço
   */
  static async createService(serviceData: CreateServiceData, currentUser?: any): Promise<InstitutionService> {
    try {
      // Se não foi passado usuário, tentar obter do storage
      const user = currentUser || await this.getCurrentUser();
      if (!user || user.userType !== 'institution') {
        throw new Error('Usuário não é uma instituição');
      }

      const newService: InstitutionService = {
        id: this.generateId(),
        ...serviceData,
        institutionId: user.id,
        institutionName: user.name || 'Instituição',
        status: ServiceStatus.ACTIVE,
        isAvailable: true,
        reviewCount: 0,
        averageRating: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Salvar no Firestore
      await this.saveServiceToFirestore(newService);
      
      // Salvar localmente como backup
      await this.saveServiceToStorage(newService);
      
      return newService;
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      throw error;
    }
  }

  /**
   * Atualizar um serviço existente
   */
  static async updateService(serviceId: string, updates: UpdateServiceData, currentUser?: any): Promise<InstitutionService> {
    try {
      // Se não foi passado usuário, tentar obter do storage
      const user = currentUser || await this.getCurrentUser();
      if (!user || user.userType !== 'institution') {
        throw new Error('Usuário não é uma instituição');
      }

      const updatedService = {
        ...updates,
        id: serviceId,
        institutionId: user.id,
        updatedAt: new Date()
      } as InstitutionService;

      // Atualizar no Firestore
      await this.updateServiceInFirestore(serviceId, updatedService);
      
      // Atualizar localmente
      await this.updateServiceInStorage(serviceId, updatedService);
      
      return updatedService;
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      throw error;
    }
  }

  /**
   * Deletar um serviço
   */
  static async deleteService(serviceId: string, currentUser?: any): Promise<void> {
    try {
      // Se não foi passado usuário, tentar obter do storage
      const user = currentUser || await this.getCurrentUser();
      if (!user || user.userType !== 'institution') {
        throw new Error('Usuário não é uma instituição');
      }

      // Deletar do Firestore
      await this.deleteServiceFromFirestore(serviceId);
      
      // Deletar localmente
      await this.deleteServiceFromStorage(serviceId);
      
    } catch (error) {
      console.error('Erro ao deletar serviço:', error);
      throw error;
    }
  }

  // MÉTODOS PRIVADOS
  
  /**
   * Obter usuário atual (temporário - deve usar o hook useAuth)
   */
  private static async getCurrentUser(): Promise<any> {
    // Esta função deve ser implementada para obter o usuário atual
    // Por enquanto, vamos simular
    try {
      const userDataJson = await AsyncStorage.getItem('@health_app:user_data');
      return userDataJson ? JSON.parse(userDataJson) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Obter serviços do Firestore
   */
  private static async getServicesFromFirestore(institutionId: string, filters?: ServiceFilters): Promise<InstitutionService[]> {
    try {
      const servicesRef = collection(db, 'institutionServices');
      let q = query(
        servicesRef, 
        where('institutionId', '==', institutionId),
        orderBy('createdAt', 'desc')
      );

      // Aplicar filtros se fornecidos
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }

      const querySnapshot = await getDocs(q);
      const services: InstitutionService[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        services.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as InstitutionService);
      });

      return services;
    } catch (error) {
      console.warn('Aviso: Não foi possível acessar Firestore (regras não configuradas):', error);
      // Retornar array vazio ao invés de gerar erro - usar só AsyncStorage
      return [];
    }
  }

  /**
   * Obter serviços do AsyncStorage
   */
  private static async getServicesFromStorage(filters?: ServiceFilters): Promise<InstitutionService[]> {
    try {
      const servicesJson = await AsyncStorage.getItem(INSTITUTION_SERVICES_KEY);
      let services: InstitutionService[] = servicesJson ? JSON.parse(servicesJson) : [];
      
      // Aplicar filtros se fornecidos
      if (filters?.category) {
        services = services.filter(s => s.category === filters.category);
      }
      if (filters?.status) {
        services = services.filter(s => s.status === filters.status);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        services = services.filter(s => 
          s.name.toLowerCase().includes(searchLower) ||
          s.description.toLowerCase().includes(searchLower)
        );
      }
      
      return services;
    } catch (error) {
      console.error('Erro ao obter serviços do storage:', error);
      return [];
    }
  }

  /**
   * Combinar serviços de diferentes fontes removendo duplicatas
   */
  private static combineServices(firestoreServices: InstitutionService[], localServices: InstitutionService[]): InstitutionService[] {
    const combined = [...firestoreServices];
    const firestoreIds = new Set(firestoreServices.map(s => s.id));
    
    // Adicionar serviços locais que não estão no Firestore
    localServices.forEach(localService => {
      if (!firestoreIds.has(localService.id)) {
        combined.push(localService);
      }
    });
    
    return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Calcular estatísticas dos serviços
   */
  private static calculateStats(services: InstitutionService[]): ServiceStats {
    const stats: ServiceStats = {
      total: services.length,
      active: 0,
      inactive: 0,
      byCategory: {} as Record<ServiceCategory, number>,
      byDepartment: {}
    };

    services.forEach(service => {
      // Contar por status
      if (service.status === ServiceStatus.ACTIVE) {
        stats.active++;
      } else {
        stats.inactive++;
      }

      // Contar por categoria
      stats.byCategory[service.category] = (stats.byCategory[service.category] || 0) + 1;

      // Contar por departamento
      stats.byDepartment[service.department] = (stats.byDepartment[service.department] || 0) + 1;
    });

    return stats;
  }

  /**
   * Salvar serviço no Firestore
   */
  private static async saveServiceToFirestore(service: InstitutionService): Promise<void> {
    try {
      const servicesRef = collection(db, 'institutionServices');
      const serviceData = {
        ...service,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(servicesRef, serviceData);
      console.log('✅ Serviço salvo no Firestore com sucesso');
    } catch (error) {
      console.warn('⚠️ Não foi possível salvar no Firestore (usando apenas AsyncStorage):', error);
      // Não gerar erro - continuar com AsyncStorage apenas
    }
  }

  /**
   * Salvar serviço no AsyncStorage
   */
  private static async saveServiceToStorage(service: InstitutionService): Promise<void> {
    try {
      const existingServices = await this.getServicesFromStorage();
      const updatedServices = [service, ...existingServices];
      await AsyncStorage.setItem(INSTITUTION_SERVICES_KEY, JSON.stringify(updatedServices));
    } catch (error) {
      console.error('Erro ao salvar serviço no storage:', error);
    }
  }

  /**
   * Atualizar serviço no Firestore
   */
  private static async updateServiceInFirestore(serviceId: string, updates: Partial<InstitutionService>): Promise<void> {
    try {
      const serviceRef = doc(db, 'institutionServices', serviceId);
      await updateDoc(serviceRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Serviço atualizado no Firestore com sucesso');
    } catch (error) {
      console.warn('⚠️ Não foi possível atualizar no Firestore (usando apenas AsyncStorage):', error);
      // Não gerar erro - continuar com AsyncStorage apenas
    }
  }

  /**
   * Atualizar serviço no AsyncStorage
   */
  private static async updateServiceInStorage(serviceId: string, updates: Partial<InstitutionService>): Promise<void> {
    try {
      const existingServices = await this.getServicesFromStorage();
      const updatedServices = existingServices.map(service => 
        service.id === serviceId ? { ...service, ...updates } : service
      );
      await AsyncStorage.setItem(INSTITUTION_SERVICES_KEY, JSON.stringify(updatedServices));
    } catch (error) {
      console.error('Erro ao atualizar serviço no storage:', error);
    }
  }

  /**
   * Deletar serviço do Firestore
   */
  private static async deleteServiceFromFirestore(serviceId: string): Promise<void> {
    try {
      const serviceRef = doc(db, 'institutionServices', serviceId);
      await deleteDoc(serviceRef);
      console.log('✅ Serviço deletado do Firestore com sucesso');
    } catch (error) {
      console.warn('⚠️ Não foi possível deletar do Firestore (usando apenas AsyncStorage):', error);
      // Não gerar erro - continuar com AsyncStorage apenas
    }
  }

  /**
   * Deletar serviço do AsyncStorage
   */
  private static async deleteServiceFromStorage(serviceId: string): Promise<void> {
    try {
      const existingServices = await this.getServicesFromStorage();
      const updatedServices = existingServices.filter(service => service.id !== serviceId);
      await AsyncStorage.setItem(INSTITUTION_SERVICES_KEY, JSON.stringify(updatedServices));
    } catch (error) {
      console.error('Erro ao deletar serviço do storage:', error);
    }
  }

  /**
   * Gerar ID único para serviços
   */
  private static generateId(): string {
    return `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
