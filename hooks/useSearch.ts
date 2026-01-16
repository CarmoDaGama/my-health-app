import { useState, useEffect } from 'react';
import { UserType, Institution, HealthService } from '../types';

export interface SearchFilters {
  query?: string;
  type?: 'hospital' | 'clinic' | 'pharmacy' | 'emergency' | 'laboratory' | 'professional';
  location?: string;
  acceptsInsurance?: boolean;
  emergencyService?: boolean;
  rating?: number;
  distance?: number;
}

export interface SearchCapabilities {
  canSearch: boolean;
  canViewDetails: boolean;
  canContact: boolean;
  canReview: boolean;
  canFavorite: boolean;
}

export interface SearchResult {
  results: Institution[];
  isLoading: boolean;
  filters: SearchFilters;
  searchInstitutions: (filters: SearchFilters) => Promise<void>;
  capabilities: SearchCapabilities;
}

export const useSearch = (userType: UserType): SearchResult => {
  const [results, setResults] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const getSearchCapabilities = (): SearchCapabilities => {
    switch (userType) {
      case UserType.GUEST:
        return {
          canSearch: true,
          canViewDetails: false,
          canContact: false,
          canReview: false,
          canFavorite: false,
        };
      case UserType.NORMAL_USER:
        return {
          canSearch: true,
          canViewDetails: true,
          canContact: true,
          canReview: true,
          canFavorite: true,
        };
      case UserType.PROFESSIONAL:
        return {
          canSearch: true,
          canViewDetails: true,
          canContact: true,
          canReview: false,
          canFavorite: true,
        };
      case UserType.INSTITUTION:
        return {
          canSearch: true,
          canViewDetails: true,
          canContact: true,
          canReview: false,
          canFavorite: false,
        };
      case UserType.ADMIN:
        return {
          canSearch: true,
          canViewDetails: true,
          canContact: true,
          canReview: true,
          canFavorite: true,
        };
      default:
        return {
          canSearch: false,
          canViewDetails: false,
          canContact: false,
          canReview: false,
          canFavorite: false,
        };
    }
  };

  const searchInstitutions = async (searchFilters: SearchFilters): Promise<void> => {
    setIsLoading(true);
    setFilters(searchFilters);

    try {
      // Mock search API - replace with actual implementation
      const mockResults = await mockSearchAPI(searchFilters, userType);
      setResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    results,
    isLoading,
    filters,
    searchInstitutions,
    capabilities: getSearchCapabilities(),
  };
};

// Mock search API - replace with actual implementation
async function mockSearchAPI(filters: SearchFilters, userType: UserType): Promise<Institution[]> {
  // Mock institutions data
  const mockInstitutions: Institution[] = [
    {
      id: '1',
      email: 'contato@hospital1.com',
      name: 'Hospital Exemplo 1',
      avatar: '',
      phone: '+244912345678',
      userType: UserType.INSTITUTION,
      isActive: true,
      isVerified: true,
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date(),
      institutionInfo: {
        type: 'hospital',
        coordinates: { latitude: -8.8383, longitude: 13.2344 },
        address: 'Rua Exemplo 123, Luanda, Luanda, 1000',
        services: ['Emergência', 'Cardiologia', 'Pediatria'],
        workingHours: {
          monday: { start: '06:00', end: '22:00', available: true },
          tuesday: { start: '06:00', end: '22:00', available: true },
          wednesday: { start: '06:00', end: '22:00', available: true },
          thursday: { start: '06:00', end: '22:00', available: true },
          friday: { start: '06:00', end: '22:00', available: true },
          saturday: { start: '08:00', end: '18:00', available: true },
          sunday: { start: '08:00', end: '18:00', available: false }
        },
        contactInfo: {
          phone: '+244912345678',
          email: 'contato@hospital1.com',
          website: 'https://hospital1.com'
        },
        description: 'Hospital geral com serviços de emergência 24h',
        acceptsInsurance: true,
        emergencyService: true,
        verified: true,
        rating: 4.5,
        totalReviews: 150
      },
      professionals: [],
      preferences: {
        language: 'pt',
        notifications: {
          enabled: true,
          serviceReminders: true,
          healthTips: false,
          emergencyAlerts: true,
        },
        favorites: {
          services: [],
          locations: []
        },
        privacy: {
          shareLocation: false,
          publicProfile: true,
        }
      }
    }
  ];

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  let filtered = mockInstitutions;

  // Apply filters
  if (filters.query) {
    const query = filters.query.toLowerCase();
    filtered = filtered.filter(institution =>
      institution.name.toLowerCase().includes(query) ||
      institution.institutionInfo.description.toLowerCase().includes(query) ||
      institution.institutionInfo.services.some((service: string) =>
        service.toLowerCase().includes(query)
      )
    );
  }

  if (filters.type) {
    filtered = filtered.filter(institution =>
      institution.institutionInfo.type === filters.type
    );
  }

  if (filters.location) {
    filtered = filtered.filter(institution =>
      institution.institutionInfo.address.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }

  if (filters.acceptsInsurance !== undefined) {
    filtered = filtered.filter(institution =>
      institution.institutionInfo.acceptsInsurance === filters.acceptsInsurance
    );
  }

  if (filters.emergencyService !== undefined) {
    filtered = filtered.filter(institution =>
      institution.institutionInfo.emergencyService === filters.emergencyService
    );
  }

  // Apply user type restrictions
  if (userType === UserType.GUEST) {
    // Guests see limited information
    filtered = filtered.map(institution => ({
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

  return filtered;
}
