import { useState, useEffect } from 'react';import { useState } from 'react';import { useState, useEffect } from 'react';import { useState, useEffect } from      const mockResults = await mockSearchAPI(searchFilters, user?.userType || UserType.GUEST);

import { useAuth } from './useAuth-firebase';

import { HealthService, Institution, UserType } from '../types';import { useAuth } from './useAuth-firebase';



interface SearchFilters {import { Institution, UserType } from '../types';import { useAuth } from './useAuth-firebase';      setResults(mockResults);

  query: string;

  type?: string;

  location?: string;

  services?: string[];interface SearchFilters {import { HealthService, Institution, UserType } from '../types';    } catch (error) {

  acceptsInsurance?: boolean;

  emergencyService?: boolean;  query: string;

}

  type?: string;      console.error('Search error:', error);

interface SearchCapabilities {

  canSearch: boolean;  location?: string;

  canViewDetails: boolean;

  canContact: boolean;}interface SearchFilters {    } finally {

  canFavorite: boolean;

  canReview: boolean;

  canRegisterServices?: boolean;

  canManageProfile?: boolean;export function useSearch() {  query: string;      setIsLoading(false);

}

  const { user } = useAuth();

export function useSearch() {

  const [results, setResults] = useState<Institution[]>([]);  const [results, setResults] = useState<Institution[]>([]);  type?: string;    }

  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({  const [isLoading, setIsLoading] = useState(false);

    query: '',

    type: '',  location?: string;  };

    location: '',

    services: [],  const searchInstitutions = async (filters: SearchFilters) => {

    acceptsInsurance: undefined,

    emergencyService: undefined,    setIsLoading(true);  services?: string[];

  });

    try {

  const { user } = useAuth();

      // Mock search - replace with actual API  acceptsInsurance?: boolean;  const getSearchCapabilities = (): SearchCapabilities => {

  const searchInstitutions = async (searchFilters: SearchFilters) => {

    try {      const mockResults: Institution[] = [];

      setIsLoading(true);

            setResults(mockResults);  emergencyService?: boolean;    switch (user?.userType) {mport { useAuth } from './useAuth-firebase';

      // Simulate API call with mock data

      const mockResults = await mockSearchAPI(searchFilters, user?.userType || UserType.GUEST);    } catch (error) {

      setResults(mockResults);

    } catch (error) {      console.error('Search error:', error);}import { HealthService, Institution, UserType } from '../types';

      console.error('Erro na busca:', error);

      setResults([]);    } finally {

    } finally {

      setIsLoading(false);      setIsLoading(false);

    }

  };    }



  const getSearchCapabilities = (): SearchCapabilities => {  };interface SearchCapabilities {interface SearchFilters {

    switch (user?.userType) {

      case UserType.GUEST:

        return {

          canSearch: true,  return {  canSearch: boolean;  query: string;

          canViewDetails: true,

          canContact: false,    results,

          canFavorite: false,

          canReview: false,    isLoading,  canViewDetails: boolean;  type?: string;

        };

    searchInstitutions,

      case UserType.PROFESSIONAL:

      case UserType.INSTITUTION:  };  canContact: boolean;  location?: string;

        return {

          canSearch: true,}

          canViewDetails: true,  canFavorite: boolean;  services?: string[];

          canContact: true,

          canFavorite: true,  canReview: boolean;  acceptsInsurance?: boolean;

          canReview: true,

          canRegisterServices: true,  canRegisterServices?: boolean;  emergencyService?: boolean;

          canManageProfile: true,

        };  canManageProfile?: boolean;}



      default:}

        return {

          canSearch: false,interface SearchCapabilities {

          canViewDetails: false,

          canContact: false,export function useSearch() {  canSearch: boolean;

          canFavorite: false,

          canReview: false,  const { user } = useAuth();  canViewDetails: boolean;

        };

    }  const [results, setResults] = useState<Institution[]>([]);  canContact: boolean;

  };

  const [isLoading, setIsLoading] = useState(false);  canFavorite: boolean;

  return {

    results,  const [filters, setFilters] = useState<SearchFilters>({ query: '' });  canReview: boolean;

    isLoading,

    filters,  canRegisterServices?: boolean;

    setFilters,

    searchInstitutions,  const searchInstitutions = async (searchFilters: SearchFilters) => {  canManageProfile?: boolean;

    capabilities: getSearchCapabilities(),

  };    try {}

}

      setIsLoading(true);

// Mock search API function

async function mockSearchAPI(filters: SearchFilters, userType: UserType): Promise<Institution[]> {      setFilters(searchFilters);export function useSearch() {

  // Simulate API delay

  await new Promise(resolve => setTimeout(resolve, 800));        const { user } = useAuth();



  const mockInstitutions: Institution[] = [      // Mock implementation - replace with actual API call  const [results, setResults] = useState<Institution[]>([]);

    {

      id: '1',      const mockResults = await mockSearchAPI(searchFilters, user?.userType || UserType.GUEST);  const [isLoading, setIsLoading] = useState(false);

      name: 'Hospital Exemplo 1',

      email: 'hospital1@example.com',      setResults(mockResults);  const [filters, setFilters] = useState<SearchFilters>({ query: '' });

      avatar: '',

      phone: '+244923456789',    } catch (error) {

      userType: UserType.INSTITUTION,

      createdAt: new Date(),      console.error('Search error:', error);  const searchInstitutions = async (searchFilters: SearchFilters) => {

      preferences: {

        language: 'en',    } finally {    setIsLoading(true);

        notifications: {

          enabled: true,      setIsLoading(false);    setFilters(searchFilters);

          serviceReminders: true,

          healthTips: false,    }    

          emergencyAlerts: true,

        },  };    try {

        favorites: {

          services: [],      // Simular busca - aqui você faria a chamada para API

          locations: []

        },  const getSearchCapabilities = (): SearchCapabilities => {      const mockResults = await mockSearchAPI(searchFilters, userType);

        privacy: {

          shareLocation: true,    switch (user?.userType) {      setResults(mockResults);

          publicProfile: true,

        }      case UserType.GUEST:    } catch (error) {

      },

      institutionInfo: {        return {      console.error('Erro na busca:', error);

        type: 'hospital',

        address: {          canSearch: true,    } finally {

          street: 'Rua Exemplo, 123',

          city: 'Luanda',          canViewDetails: true,      setIsLoading(false);

          province: 'Luanda',

          coordinates: { lat: -8.8383, lng: 13.2344 }          canContact: false,    }

        },

        services: ['emergencia', 'cardiologia', 'neurologia'],          canFavorite: false,  };

        workingHours: {

          monday: { start: '06:00', end: '22:00', available: true },          canReview: false,

          tuesday: { start: '06:00', end: '22:00', available: true },

          wednesday: { start: '06:00', end: '22:00', available: true },        };  const getSearchCapabilities = (): SearchCapabilities => {

          thursday: { start: '06:00', end: '22:00', available: true },

          friday: { start: '06:00', end: '22:00', available: true },    switch (userType) {

          saturday: { start: '08:00', end: '18:00', available: true },

          sunday: { start: '08:00', end: '18:00', available: false }      case UserType.NORMAL_USER:      case UserType.GUEST:

        },

        contactInfo: {        return {        return {

          phone: '+244923456789',

          email: 'contato@hospital1.com',          canSearch: true,          canSearch: true,

          website: 'https://hospital1.com'

        },          canViewDetails: true,          canViewDetails: false,

        acceptsInsurance: true,

        emergencyService: true,          canContact: true,          canContact: false,

        averageRating: 4.5,

        totalReviews: 150          canFavorite: true,          canFavorite: false,

      }

    },          canReview: true,          canReview: false,

    {

      id: '2',        };        };

      name: 'Clínica Exemplo 2',

      email: 'clinica2@example.com',      case UserType.NORMAL_USER:

      avatar: '',

      phone: '+244987654321',      case UserType.PROFESSIONAL:        return {

      userType: UserType.INSTITUTION,

      createdAt: new Date(),      case UserType.INSTITUTION:          canSearch: true,

      preferences: {

        language: 'en',        return {          canViewDetails: true,

        notifications: {

          enabled: true,          canSearch: true,          canContact: true,

          serviceReminders: true,

          healthTips: true,          canViewDetails: true,          canFavorite: true,

          emergencyAlerts: false,

        },          canContact: true,          canReview: true,

        favorites: {

          services: [],          canFavorite: true,        };

          locations: []

        },          canReview: true,      case UserType.PROFESSIONAL:

        privacy: {

          shareLocation: true,          canRegisterServices: true,      case UserType.INSTITUTION:

          publicProfile: true,

        }          canManageProfile: true,        return {

      },

      institutionInfo: {        };          canSearch: true,

        type: 'clinica',

        address: {          canViewDetails: true,

          street: 'Avenida Exemplo, 456',

          city: 'Luanda',      default:          canContact: true,

          province: 'Luanda',

          coordinates: { lat: -8.8500, lng: 13.2400 }        return {          canFavorite: true,

        },

        services: ['pediatria', 'ginecologia', 'dermatologia'],          canSearch: true,          canReview: true,

        workingHours: {

          monday: { start: '08:00', end: '17:00', available: true },          canViewDetails: true,          canRegisterServices: true,

          tuesday: { start: '08:00', end: '17:00', available: true },

          wednesday: { start: '08:00', end: '17:00', available: true },          canContact: false,          canManageProfile: true,

          thursday: { start: '08:00', end: '17:00', available: true },

          friday: { start: '08:00', end: '17:00', available: true },          canFavorite: false,        };

          saturday: { start: '08:00', end: '12:00', available: true },

          sunday: { start: '08:00', end: '12:00', available: false }          canReview: false,      default:

        },

        contactInfo: {        };        return {

          phone: '+244987654321',

          email: 'info@clinica2.com'    }          canSearch: false,

        },

        acceptsInsurance: false,  };          canViewDetails: false,

        emergencyService: false,

        averageRating: 4.2,          canContact: false,

        totalReviews: 89

      }  return {          canFavorite: false,

    }

  ];    results,          canReview: false,



  let filteredResults = mockInstitutions;    isLoading,        };



  // Filter by query    filters,    }

  if (filters.query) {

    filteredResults = mockInstitutions.filter(institution =>    searchInstitutions,  };

      institution.institutionInfo.type.toLowerCase().includes(filters.query.toLowerCase()) ||

      institution.name.toLowerCase().includes(filters.query.toLowerCase()) ||    capabilities: getSearchCapabilities(),

      institution.institutionInfo.services.some(service =>

        service.toLowerCase().includes(filters.query.toLowerCase())  };  return {

      )

    );}    results,

  }

    isLoading,

  // Filter by type

  if (filters.type) {// Mock search API - replace with actual implementation    filters,

    filteredResults = filteredResults.filter(institution =>

      institution.institutionInfo.type === filters.typeasync function mockSearchAPI(filters: SearchFilters, userType: UserType): Promise<Institution[]> {    searchInstitutions,

    );

  }  // Simulate API delay    capabilities: getSearchCapabilities(),



  // Filter by location  await new Promise(resolve => setTimeout(resolve, 500));  };

  if (filters.location) {

    filteredResults = filteredResults.filter(institution =>}

      institution.institutionInfo.address.city.toLowerCase().includes(filters.location!.toLowerCase())

    );  const mockInstitutions: Institution[] = [

  }

    {// Mock API function

  // Filter by insurance acceptance

  if (filters.acceptsInsurance !== undefined) {      id: '1',async function mockSearchAPI(filters: SearchFilters, userType: UserType): Promise<Institution[]> {

    filteredResults = filteredResults.filter(institution =>

      institution.institutionInfo.acceptsInsurance === filters.acceptsInsurance      email: 'contato@hospital1.com',  // Simular delay

    );

  }      name: 'Hospital Exemplo 1',  await new Promise(resolve => setTimeout(resolve, 800));



  // Filter by emergency service      avatar: '',  

  if (filters.emergencyService !== undefined) {

    filteredResults = filteredResults.filter(institution =>      phone: '+244912345678',  // Dados mockados baseados no tipo de usuário

      institution.institutionInfo.emergencyService === filters.emergencyService

    );      userType: UserType.INSTITUTION,  const mockInstitutions: Institution[] = [

  }

      createdAt: new Date(),    {

  // Hide sensitive information for guest users

  if (userType === UserType.GUEST) {      updatedAt: new Date(),      id: '1',

    filteredResults = filteredResults.map(institution => ({

      ...institution,      institutionInfo: {      name: 'Hospital Américo Boavida',

      institutionInfo: {

        ...institution.institutionInfo,        type: 'hospital',      email: 'contato@hab.ao',

        contactInfo: {

          ...institution.institutionInfo.contactInfo,        address: {      userType: UserType.INSTITUTION,

          phone: 'Login necessário',

          email: 'Login necessário',          street: 'Rua Principal, 123',      avatar: '',

        }

      }          city: 'Luanda',      phone: '+244 222 334 455',

    }));

  }          state: 'Luanda',      createdAt: new Date('2023-01-15'),



  return filteredResults;          zipCode: '1000',      updatedAt: new Date('2024-01-15'),

}
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