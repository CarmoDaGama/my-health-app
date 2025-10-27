import { useState, useEffect, useCallback } from 'react';
import { 
  InstitutionService, 
  CreateServiceData, 
  UpdateServiceData, 
  ServiceFilters, 
  ServiceStats,
  ServiceStatus,
  ServiceCategory 
} from '../types/institutionService';
import { UserType } from '../types';
import { useAuth } from './useAuth-firebase';
import { InstitutionServiceAPI } from '../services/institutionServiceAPI';

interface UseInstitutionServicesState {
  services: InstitutionService[];
  stats: ServiceStats;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
}

interface UseInstitutionServicesActions {
  loadServices: (filters?: ServiceFilters) => Promise<void>;
  createService: (serviceData: CreateServiceData) => Promise<InstitutionService | null>;
  updateService: (id: string, updates: UpdateServiceData) => Promise<InstitutionService | null>;
  deleteService: (id: string) => Promise<boolean>;
  toggleServiceStatus: (id: string) => Promise<boolean>;
  getServicesByCategory: (category: ServiceCategory) => InstitutionService[];
  getActiveServices: () => InstitutionService[];
  searchServices: (query: string) => InstitutionService[];
  refreshServices: () => Promise<void>;
}

export interface UseInstitutionServicesReturn extends UseInstitutionServicesState, UseInstitutionServicesActions {}

export const useInstitutionServices = (): UseInstitutionServicesReturn => {
  const { user, isAuthenticated } = useAuth();
  
  const [state, setState] = useState<UseInstitutionServicesState>({
    services: [],
    stats: {
      total: 0,
      active: 0,
      inactive: 0,
      byCategory: {} as Record<ServiceCategory, number>,
      byDepartment: {}
    },
    isLoading: false,
    error: null,
    hasMore: false
  });

  // Verificar se é usuário institucional
  const isInstitutionUser = user?.userType === UserType.INSTITUTION;

  // Debug logs para identificar o problema
  console.log('🔍 Debug useInstitutionServices:', {
    isAuthenticated,
    userType: user?.userType,
    userTypeEnum: UserType.INSTITUTION,
    isInstitutionUser,
    userId: user?.id,
    userName: user?.name
  });

  // Carregar serviços ao montar ou quando usuário mudar
  useEffect(() => {
    if (isAuthenticated && isInstitutionUser) {
      console.log('🏥 Usuário é instituição, carregando serviços...');
      loadServices();
    } else if (isAuthenticated && !isInstitutionUser) {
      console.log('🚫 Usuário não é instituição, limpando estado');
      setState(prev => ({
        ...prev,
        services: [],
        stats: {
          total: 0,
          active: 0,
          inactive: 0,
          byCategory: {} as Record<ServiceCategory, number>,
          byDepartment: {}
        },
        error: null, // Limpar erro se não é instituição
        isLoading: false
      }));
    }
  }, [isAuthenticated, isInstitutionUser]);

  const loadServices = useCallback(async (filters?: ServiceFilters) => {
    if (!isInstitutionUser) {
      console.log('🚫 loadServices: Usuário não é instituição, não carregando serviços');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await InstitutionServiceAPI.getInstitutionServices(filters, user);
      
      setState(prev => ({
        ...prev,
        services: response.services,
        stats: response.stats,
        hasMore: response.hasMore,
        isLoading: false
      }));
    } catch (error) {
      console.error('Erro ao carregar serviços da instituição:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao carregar serviços',
        isLoading: false
      }));
    }
  }, [isInstitutionUser]);

  const createService = useCallback(async (serviceData: CreateServiceData): Promise<InstitutionService | null> => {
    if (!isInstitutionUser) {
      console.log('🚫 createService: Usuário não é instituição');
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const newService = await InstitutionServiceAPI.createService(serviceData, user);
      
      setState(prev => ({
        ...prev,
        services: [newService, ...prev.services],
        stats: {
          ...prev.stats,
          total: prev.stats.total + 1,
          active: newService.status === ServiceStatus.ACTIVE ? prev.stats.active + 1 : prev.stats.active,
          byCategory: {
            ...prev.stats.byCategory,
            [newService.category]: (prev.stats.byCategory[newService.category] || 0) + 1
          },
          byDepartment: {
            ...prev.stats.byDepartment,
            [newService.department]: (prev.stats.byDepartment[newService.department] || 0) + 1
          }
        },
        isLoading: false
      }));
      
      return newService;
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao criar serviço',
        isLoading: false
      }));
      return null;
    }
  }, [isInstitutionUser]);

  const updateService = useCallback(async (id: string, updates: UpdateServiceData): Promise<InstitutionService | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const updatedService = await InstitutionServiceAPI.updateService(id, updates, user);
      
      setState(prev => ({
        ...prev,
        services: prev.services.map(service => 
          service.id === id ? updatedService : service
        ),
        isLoading: false
      }));
      
      return updatedService;
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao atualizar serviço',
        isLoading: false
      }));
      return null;
    }
  }, []);

  const deleteService = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await InstitutionServiceAPI.deleteService(id, user);
      
      setState(prev => {
        const serviceToDelete = prev.services.find(s => s.id === id);
        if (!serviceToDelete) return { ...prev, isLoading: false };
        
        return {
          ...prev,
          services: prev.services.filter(service => service.id !== id),
          stats: {
            ...prev.stats,
            total: prev.stats.total - 1,
            active: serviceToDelete.status === ServiceStatus.ACTIVE ? prev.stats.active - 1 : prev.stats.active,
            byCategory: {
              ...prev.stats.byCategory,
              [serviceToDelete.category]: Math.max(0, (prev.stats.byCategory[serviceToDelete.category] || 0) - 1)
            },
            byDepartment: {
              ...prev.stats.byDepartment,
              [serviceToDelete.department]: Math.max(0, (prev.stats.byDepartment[serviceToDelete.department] || 0) - 1)
            }
          },
          isLoading: false
        };
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar serviço:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao deletar serviço',
        isLoading: false
      }));
      return false;
    }
  }, []);

  const toggleServiceStatus = useCallback(async (id: string): Promise<boolean> => {
    const service = state.services.find(s => s.id === id);
    if (!service) return false;
    
    const newStatus = service.status === ServiceStatus.ACTIVE ? ServiceStatus.INACTIVE : ServiceStatus.ACTIVE;
    const updated = await updateService(id, { status: newStatus });
    
    return !!updated;
  }, [state.services, updateService]);

  const getServicesByCategory = useCallback((category: ServiceCategory): InstitutionService[] => {
    return state.services.filter(service => service.category === category);
  }, [state.services]);

  const getActiveServices = useCallback((): InstitutionService[] => {
    return state.services.filter(service => 
      service.status === ServiceStatus.ACTIVE && service.isAvailable
    );
  }, [state.services]);

  const searchServices = useCallback((query: string): InstitutionService[] => {
    const lowerQuery = query.toLowerCase();
    return state.services.filter(service =>
      service.name.toLowerCase().includes(lowerQuery) ||
      service.description.toLowerCase().includes(lowerQuery) ||
      service.responsible.toLowerCase().includes(lowerQuery) ||
      service.department.toLowerCase().includes(lowerQuery)
    );
  }, [state.services]);

  const refreshServices = useCallback(async (): Promise<void> => {
    await loadServices();
  }, [loadServices]);

  return {
    ...state,
    loadServices,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    getServicesByCategory,
    getActiveServices,
    searchServices,
    refreshServices
  };
};
