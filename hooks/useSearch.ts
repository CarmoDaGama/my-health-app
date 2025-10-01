import { useState } from 'react';import { useState, useEffect } from 'react';import { useState, useEffect } from      const mockResults = await mockSearchAPI(searchFilters, user?.userType || UserType.GUEST);

import { useAuth } from './useAuth-firebase';

import { Institution, UserType } from '../types';import { useAuth } from './useAuth-firebase';      setResults(mockResults);



interface SearchFilters {import { HealthService, Institution, UserType } from '../types';    } catch (error) {

  query: string;

  type?: string;      console.error('Search error:', error);

  location?: string;

}interface SearchFilters {    } finally {



export function useSearch() {  query: string;      setIsLoading(false);

  const { user } = useAuth();

  const [results, setResults] = useState<Institution[]>([]);  type?: string;    }

  const [isLoading, setIsLoading] = useState(false);

  location?: string;  };

  const searchInstitutions = async (filters: SearchFilters) => {

    setIsLoading(true);  services?: string[];

    try {

      // Mock search - replace with actual API  acceptsInsurance?: boolean;  const getSearchCapabilities = (): SearchCapabilities => {

      const mockResults: Institution[] = [];

      setResults(mockResults);  emergencyService?: boolean;    switch (user?.userType) {mport { useAuth } from './useAuth-firebase';

    } catch (error) {

      console.error('Search error:', error);}import { HealthService, Institution, UserType } from '../types';

    } finally {

      setIsLoading(false);

    }

  };interface SearchCapabilities {interface SearchFilters {



  return {  canSearch: boolean;  query: string;

    results,

    isLoading,  canViewDetails: boolean;  type?: string;

    searchInstitutions,

  };  canContact: boolean;  location?: string;

}
  canFavorite: boolean;  services?: string[];

  canReview: boolean;  acceptsInsurance?: boolean;

  canRegisterServices?: boolean;  emergencyService?: boolean;

  canManageProfile?: boolean;}

}

interface SearchCapabilities {

export function useSearch() {  canSearch: boolean;

  const { user } = useAuth();  canViewDetails: boolean;

  const [results, setResults] = useState<Institution[]>([]);  canContact: boolean;

  const [isLoading, setIsLoading] = useState(false);  canFavorite: boolean;

  const [filters, setFilters] = useState<SearchFilters>({ query: '' });  canReview: boolean;

  canRegisterServices?: boolean;

  const searchInstitutions = async (searchFilters: SearchFilters) => {  canManageProfile?: boolean;

    try {}

      setIsLoading(true);

      setFilters(searchFilters);export function useSearch() {

        const { user } = useAuth();

      // Mock implementation - replace with actual API call  const [results, setResults] = useState<Institution[]>([]);

      const mockResults = await mockSearchAPI(searchFilters, user?.userType || UserType.GUEST);  const [isLoading, setIsLoading] = useState(false);

      setResults(mockResults);  const [filters, setFilters] = useState<SearchFilters>({ query: '' });

    } catch (error) {

      console.error('Search error:', error);  const searchInstitutions = async (searchFilters: SearchFilters) => {

    } finally {    setIsLoading(true);

      setIsLoading(false);    setFilters(searchFilters);

    }    

  };    try {

      // Simular busca - aqui você faria a chamada para API

  const getSearchCapabilities = (): SearchCapabilities => {      const mockResults = await mockSearchAPI(searchFilters, userType);

    switch (user?.userType) {      setResults(mockResults);

      case UserType.GUEST:    } catch (error) {

        return {      console.error('Erro na busca:', error);

          canSearch: true,    } finally {

          canViewDetails: true,      setIsLoading(false);

          canContact: false,    }

          canFavorite: false,  };

          canReview: false,

        };  const getSearchCapabilities = (): SearchCapabilities => {

    switch (userType) {

      case UserType.NORMAL_USER:      case UserType.GUEST:

        return {        return {

          canSearch: true,          canSearch: true,

          canViewDetails: true,          canViewDetails: false,

          canContact: true,          canContact: false,

          canFavorite: true,          canFavorite: false,

          canReview: true,          canReview: false,

        };        };

      case UserType.NORMAL_USER:

      case UserType.PROFESSIONAL:        return {

      case UserType.INSTITUTION:          canSearch: true,

        return {          canViewDetails: true,

          canSearch: true,          canContact: true,

          canViewDetails: true,          canFavorite: true,

          canContact: true,          canReview: true,

          canFavorite: true,        };

          canReview: true,      case UserType.PROFESSIONAL:

          canRegisterServices: true,      case UserType.INSTITUTION:

          canManageProfile: true,        return {

        };          canSearch: true,

          canViewDetails: true,

      default:          canContact: true,

        return {          canFavorite: true,

          canSearch: true,          canReview: true,

          canViewDetails: true,          canRegisterServices: true,

          canContact: false,          canManageProfile: true,

          canFavorite: false,        };

          canReview: false,      default:

        };        return {

    }          canSearch: false,

  };          canViewDetails: false,

          canContact: false,

  return {          canFavorite: false,

    results,          canReview: false,

    isLoading,        };

    filters,    }

    searchInstitutions,  };

    capabilities: getSearchCapabilities(),

  };  return {

}    results,

    isLoading,

// Mock search API - replace with actual implementation    filters,

async function mockSearchAPI(filters: SearchFilters, userType: UserType): Promise<Institution[]> {    searchInstitutions,

  // Simulate API delay    capabilities: getSearchCapabilities(),

  await new Promise(resolve => setTimeout(resolve, 500));  };

}

  const mockInstitutions: Institution[] = [

    {// Mock API function

      id: '1',async function mockSearchAPI(filters: SearchFilters, userType: UserType): Promise<Institution[]> {

      email: 'contato@hospital1.com',  // Simular delay

      name: 'Hospital Exemplo 1',  await new Promise(resolve => setTimeout(resolve, 800));

      avatar: '',  

      phone: '+244912345678',  // Dados mockados baseados no tipo de usuário

      userType: UserType.INSTITUTION,  const mockInstitutions: Institution[] = [

      createdAt: new Date(),    {

      updatedAt: new Date(),      id: '1',

      institutionInfo: {      name: 'Hospital Américo Boavida',

        type: 'hospital',      email: 'contato@hab.ao',

        address: {      userType: UserType.INSTITUTION,

          street: 'Rua Principal, 123',      avatar: '',

          city: 'Luanda',      phone: '+244 222 334 455',

          state: 'Luanda',      createdAt: new Date('2023-01-15'),

          zipCode: '1000',      updatedAt: new Date('2024-01-15'),

          coordinates: { lat: -8.8383, lng: 13.2344 }      institutionInfo: {

        },        type: 'hospital',

        services: ['Emergência', 'Cardiologia', 'Pediatria'],        address: {

        workingHours: {          street: 'Rua Amílcar Cabral, 105',

          monday: { start: '06:00', end: '22:00', available: true },          city: 'Luanda',

          tuesday: { start: '06:00', end: '22:00', available: true },          state: 'Luanda',

          wednesday: { start: '06:00', end: '22:00', available: true },          zipCode: '1000',

          thursday: { start: '06:00', end: '22:00', available: true },          coordinates: { lat: -8.8368, lng: 13.2343 }

          friday: { start: '06:00', end: '22:00', available: true },        },

          saturday: { start: '08:00', end: '18:00', available: true },        services: ['Cardiologia', 'Pediatria', 'Emergência', 'Cirurgia Geral'],

          sunday: { start: '08:00', end: '18:00', available: false }        workingHours: {

        },          monday: { start: '06:00', end: '22:00', available: true },

        contactInfo: {          tuesday: { start: '06:00', end: '22:00', available: true },

          phone: '+244912345678',          wednesday: { start: '06:00', end: '22:00', available: true },

          email: 'contato@hospital1.com',          thursday: { start: '06:00', end: '22:00', available: true },

          website: 'https://hospital1.com'          friday: { start: '06:00', end: '22:00', available: true },

        },          saturday: { start: '08:00', end: '18:00', available: true },

        description: 'Hospital geral com serviços de emergência 24h',          sunday: { start: '08:00', end: '18:00', available: true }

        acceptsInsurance: true,        },

        emergencyService: true,        contactInfo: {

        verified: true,          phone: '+244 222 334 455',

        rating: 4.5,          email: 'contato@hab.ao',

        totalReviews: 150          website: 'https://hab.ao'

      },        },

      professionals: [],        description: 'Hospital público de referência em Luanda com atendimento 24h.',

      preferences: {        acceptsInsurance: true,

        language: 'pt',        emergencyService: true,

        notifications: {        verified: true,

          enabled: true,        rating: 4.2,

          serviceReminders: true,        totalReviews: 156

          healthTips: false,      },

          emergencyAlerts: true,      professionals: ['prof1', 'prof2'],

        },      preferences: {

        favorites: {        language: 'pt',

          services: [],        notifications: {

          locations: []          enabled: true,

        },          serviceReminders: true,

        privacy: {          healthTips: false,

          shareLocation: false,          emergencyAlerts: true

          publicProfile: true,        },

        }        favorites: {

      }          services: [],

    },          locations: []

    {        },

      id: '2',        privacy: {

      email: 'info@clinica2.com',          shareLocation: true,

      name: 'Clínica Exemplo 2',          publicProfile: true

      avatar: '',        }

      phone: '+244987654321',      }

      userType: UserType.INSTITUTION,    },

      createdAt: new Date(),    {

      updatedAt: new Date(),      id: '2',

      institutionInfo: {      name: 'Clínica Girassol',

        type: 'clinic',      email: 'info@girassol.ao',

        address: {      userType: UserType.INSTITUTION,

          street: 'Avenida Secundária, 456',      avatar: '',

          city: 'Luanda',      phone: '+244 923 456 789',

          state: 'Luanda',      createdAt: new Date('2023-03-20'),

          zipCode: '1001',      updatedAt: new Date('2024-02-10'),

          coordinates: { lat: -8.8500, lng: 13.2400 }      institutionInfo: {

        },        type: 'clinic',

        services: ['Consulta Geral', 'Ginecologia', 'Dermatologia'],        address: {

        workingHours: {          street: 'Rua da Samba, 45',

          monday: { start: '08:00', end: '17:00', available: true },          city: 'Luanda',

          tuesday: { start: '08:00', end: '17:00', available: true },          state: 'Luanda',

          wednesday: { start: '08:00', end: '17:00', available: true },          zipCode: '1001',

          thursday: { start: '08:00', end: '17:00', available: true },          coordinates: { lat: -8.8200, lng: 13.2500 }

          friday: { start: '08:00', end: '17:00', available: true },        },

          saturday: { start: '08:00', end: '12:00', available: true },        services: ['Clínica Geral', 'Dermatologia', 'Oftalmologia'],

          sunday: { start: '08:00', end: '12:00', available: false }        workingHours: {

        },          monday: { start: '08:00', end: '17:00', available: true },

        contactInfo: {          tuesday: { start: '08:00', end: '17:00', available: true },

          phone: '+244987654321',          wednesday: { start: '08:00', end: '17:00', available: true },

          email: 'info@clinica2.com'          thursday: { start: '08:00', end: '17:00', available: true },

        },          friday: { start: '08:00', end: '17:00', available: true },

        description: 'Clínica especializada em consultas médicas',          saturday: { start: '08:00', end: '12:00', available: true },

        acceptsInsurance: false,          sunday: { start: '08:00', end: '12:00', available: false }

        emergencyService: false,        },

        verified: true,        contactInfo: {

        rating: 4.2,          phone: '+244 923 456 789',

        totalReviews: 89          email: 'info@girassol.ao'

      },        },

      professionals: [],        description: 'Clínica privada com foco em atendimento de qualidade.',

      preferences: {        acceptsInsurance: true,

        language: 'pt',        emergencyService: false,

        notifications: {        verified: true,

          enabled: true,        rating: 4.5,

          serviceReminders: true,        totalReviews: 89

          healthTips: true,      },

          emergencyAlerts: false,      professionals: ['prof3', 'prof4'],

        },      preferences: {

        favorites: {        language: 'pt',

          services: [],        notifications: {

          locations: []          enabled: true,

        },          serviceReminders: true,

        privacy: {          healthTips: true,

          shareLocation: true,          emergencyAlerts: false

          publicProfile: true,        },

        }        favorites: {

      }          services: [],

    }          locations: []

  ];        },

        privacy: {

  // Filter institutions based on search criteria          shareLocation: true,

  let filtered = mockInstitutions;          publicProfile: true

        }

  if (filters.query) {      }

    const query = filters.query.toLowerCase();    }

    filtered = filtered.filter(institution =>  ];

      institution.name.toLowerCase().includes(query) ||  

      institution.institutionInfo.description.toLowerCase().includes(query) ||  // Filtrar resultados baseado na query e permissões do usuário

      institution.institutionInfo.services.some((service: string) =>  let filteredResults = mockInstitutions;

        service.toLowerCase().includes(query)  

      )  if (filters.query) {

    );    filteredResults = mockInstitutions.filter(institution => 

  }      institution.institutionInfo.type.toLowerCase().includes(filters.query.toLowerCase()) ||

      institution.name.toLowerCase().includes(filters.query.toLowerCase()) ||

  if (filters.type) {      institution.institutionInfo.services.some(service => 

    filtered = filtered.filter(institution =>        service.toLowerCase().includes(filters.query.toLowerCase())

      institution.institutionInfo.type === filters.type      )

    );    );

  }  }



  if (filters.location) {  // Para usuários convidados, limitar informações

    filtered = filtered.filter(institution =>  if (userType === UserType.GUEST) {

      institution.institutionInfo.address.city.toLowerCase().includes(filters.location!.toLowerCase())    filteredResults = filteredResults.map(institution => ({

    );      ...institution,

  }      institutionInfo: {

        ...institution.institutionInfo,

  if (filters.acceptsInsurance !== undefined) {        contactInfo: {

    filtered = filtered.filter(institution =>          ...institution.institutionInfo.contactInfo,

      institution.institutionInfo.acceptsInsurance === filters.acceptsInsurance          phone: 'Login necessário',

    );          email: 'Login necessário'

  }        }

      }

  if (filters.emergencyService !== undefined) {    }));

    filtered = filtered.filter(institution =>  }

      institution.institutionInfo.emergencyService === filters.emergencyService

    );  return filteredResults;

  }}

  // Limit results for guest users
  if (userType === UserType.GUEST) {
    filtered = filtered.slice(0, 3);
  }

  return filtered;
}