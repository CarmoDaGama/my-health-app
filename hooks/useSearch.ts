import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { UserType, Institution } from '../types';

interface SearchFilters {
  query: string;
  type?: string;
  location?: string;
  services?: string[];
  acceptsInsurance?: boolean;
  emergencyService?: boolean;
}

interface SearchCapabilities {
  canSearch: boolean;
  canViewDetails: boolean;
  canContact: boolean;
  canFavorite: boolean;
  canReview: boolean;
  canRegisterServices?: boolean;
  canManageProfile?: boolean;
}

export function useSearch() {
  const { userType } = useAuth();
  const [results, setResults] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ query: '' });

  const searchInstitutions = async (searchFilters: SearchFilters) => {
    setIsLoading(true);
    setFilters(searchFilters);
    
    try {
      // Simular busca - aqui você faria a chamada para API
      const mockResults = await mockSearchAPI(searchFilters, userType);
      setResults(mockResults);
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSearchCapabilities = (): SearchCapabilities => {
    switch (userType) {
      case UserType.GUEST:
        return {
          canSearch: true,
          canViewDetails: false,
          canContact: false,
          canFavorite: false,
          canReview: false,
        };
      case UserType.NORMAL_USER:
        return {
          canSearch: true,
          canViewDetails: true,
          canContact: true,
          canFavorite: true,
          canReview: true,
        };
      case UserType.PROFESSIONAL:
      case UserType.INSTITUTION:
        return {
          canSearch: true,
          canViewDetails: true,
          canContact: true,
          canFavorite: true,
          canReview: true,
          canRegisterServices: true,
          canManageProfile: true,
        };
      default:
        return {
          canSearch: false,
          canViewDetails: false,
          canContact: false,
          canFavorite: false,
          canReview: false,
        };
    }
  };

  return {
    results,
    isLoading,
    filters,
    searchInstitutions,
    capabilities: getSearchCapabilities(),
  };
}

// Mock API function
async function mockSearchAPI(filters: SearchFilters, userType: UserType): Promise<Institution[]> {
  // Simular delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Dados mockados baseados no tipo de usuário
  const mockInstitutions: Institution[] = [
    {
      id: '1',
      name: 'Hospital Américo Boavida',
      email: 'contato@hab.ao',
      userType: UserType.INSTITUTION,
      avatar: '',
      phone: '+244 222 334 455',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2024-01-15'),
      institutionInfo: {
        type: 'hospital',
        address: {
          street: 'Rua Amílcar Cabral, 105',
          city: 'Luanda',
          state: 'Luanda',
          zipCode: '1000',
          coordinates: { lat: -8.8368, lng: 13.2343 }
        },
        services: ['Cardiologia', 'Pediatria', 'Emergência', 'Cirurgia Geral'],
        workingHours: {
          monday: { start: '06:00', end: '22:00', available: true },
          tuesday: { start: '06:00', end: '22:00', available: true },
          wednesday: { start: '06:00', end: '22:00', available: true },
          thursday: { start: '06:00', end: '22:00', available: true },
          friday: { start: '06:00', end: '22:00', available: true },
          saturday: { start: '08:00', end: '18:00', available: true },
          sunday: { start: '08:00', end: '18:00', available: true }
        },
        contactInfo: {
          phone: '+244 222 334 455',
          email: 'contato@hab.ao',
          website: 'https://hab.ao'
        },
        description: 'Hospital público de referência em Luanda com atendimento 24h.',
        acceptsInsurance: true,
        emergencyService: true,
        verified: true,
        rating: 4.2,
        totalReviews: 156
      },
      professionals: ['prof1', 'prof2'],
      preferences: {
        language: 'pt',
        notifications: {
          enabled: true,
          serviceReminders: true,
          healthTips: false,
          emergencyAlerts: true
        },
        favorites: {
          services: [],
          locations: []
        },
        privacy: {
          shareLocation: true,
          publicProfile: true
        }
      }
    },
    {
      id: '2',
      name: 'Clínica Girassol',
      email: 'info@girassol.ao',
      userType: UserType.INSTITUTION,
      avatar: '',
      phone: '+244 923 456 789',
      createdAt: new Date('2023-03-20'),
      updatedAt: new Date('2024-02-10'),
      institutionInfo: {
        type: 'clinic',
        address: {
          street: 'Rua da Samba, 45',
          city: 'Luanda',
          state: 'Luanda',
          zipCode: '1001',
          coordinates: { lat: -8.8200, lng: 13.2500 }
        },
        services: ['Clínica Geral', 'Dermatologia', 'Oftalmologia'],
        workingHours: {
          monday: { start: '08:00', end: '17:00', available: true },
          tuesday: { start: '08:00', end: '17:00', available: true },
          wednesday: { start: '08:00', end: '17:00', available: true },
          thursday: { start: '08:00', end: '17:00', available: true },
          friday: { start: '08:00', end: '17:00', available: true },
          saturday: { start: '08:00', end: '12:00', available: true },
          sunday: { start: '08:00', end: '12:00', available: false }
        },
        contactInfo: {
          phone: '+244 923 456 789',
          email: 'info@girassol.ao'
        },
        description: 'Clínica privada com foco em atendimento de qualidade.',
        acceptsInsurance: true,
        emergencyService: false,
        verified: true,
        rating: 4.5,
        totalReviews: 89
      },
      professionals: ['prof3', 'prof4'],
      preferences: {
        language: 'pt',
        notifications: {
          enabled: true,
          serviceReminders: true,
          healthTips: true,
          emergencyAlerts: false
        },
        favorites: {
          services: [],
          locations: []
        },
        privacy: {
          shareLocation: true,
          publicProfile: true
        }
      }
    }
  ];
  
  // Filtrar resultados baseado na query e permissões do usuário
  let filteredResults = mockInstitutions;
  
  if (filters.query) {
    filteredResults = mockInstitutions.filter(institution => 
      institution.institutionInfo.type.toLowerCase().includes(filters.query.toLowerCase()) ||
      institution.name.toLowerCase().includes(filters.query.toLowerCase()) ||
      institution.institutionInfo.services.some(service => 
        service.toLowerCase().includes(filters.query.toLowerCase())
      )
    );
  }

  // Para usuários convidados, limitar informações
  if (userType === UserType.GUEST) {
    filteredResults = filteredResults.map(institution => ({
      ...institution,
      institutionInfo: {
        ...institution.institutionInfo,
        contactInfo: {
          ...institution.institutionInfo.contactInfo,
          phone: 'Login necessário',
          email: 'Login necessário'
        }
      }
    }));
  }

  return filteredResults;
}