/**
 * Advanced Search Service
 * MENDLINK Phase 2: Intelligent Search with Auto-suggestions and Filters
 */

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  QueryConstraint 
} from 'firebase/firestore';
import { db } from './firebase';
import { HealthService, Coordinates } from '../types';
import { 
  SearchFilters, 
  SearchResult, 
  SearchSuggestion, 
  ServiceType,
  MEDICAL_SPECIALTIES 
} from '../types/search';

export class AdvancedSearchService {
  
  /**
   * Perform advanced search with filters and auto-suggestions
   */
  static async search(
    filters: SearchFilters,
    userLocation?: Coordinates,
    maxResults: number = 50
  ): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      // Get services from both collections
      const [healthServices, registeredServices] = await Promise.all([
        this.searchInCollection('healthServices', filters, maxResults / 2),
        this.searchInCollection('registeredServices', filters, maxResults / 2)
      ]);
      
      // Combine and deduplicate results
      let allServices = [...healthServices, ...registeredServices];
      allServices = this.removeDuplicates(allServices);
      
      // Apply distance filter if location is provided
      if (userLocation && filters.distance && filters.distance > 0) {
        allServices = this.filterByDistance(allServices, userLocation, filters.distance);
      }
      
      // Apply additional filters
      allServices = this.applyAdvancedFilters(allServices, filters);
      
      // Sort by relevance and rating
      allServices = this.sortResults(allServices, filters.query);
      
      // Generate suggestions
      const suggestions = await this.generateSuggestions(filters.query || '', allServices);
      
      const searchTime = Date.now() - startTime;
      
      return {
        services: allServices.slice(0, maxResults),
        totalResults: allServices.length,
        searchTime,
        appliedFilters: filters,
        suggestions,
      };
      
    } catch (error) {
      console.error('❌ Advanced search error:', error);
      return {
        services: [],
        totalResults: 0,
        searchTime: Date.now() - startTime,
        appliedFilters: filters,
        suggestions: [],
      };
    }
  }
  
  /**
   * Search in specific Firestore collection
   */
  private static async searchInCollection(
    collectionName: string,
    filters: SearchFilters,
    maxResults: number
  ): Promise<HealthService[]> {
    const constraints: QueryConstraint[] = [];
    
    // Text search (prefix matching)
    if (filters.query) {
      const searchLower = filters.query.toLowerCase();
      constraints.push(
        where('name', '>=', searchLower),
        where('name', '<=', searchLower + '\uf8ff')
      );
    }
    
    // Service type filter
    if (filters.type && filters.type.length > 0) {
      if (filters.type.length === 1) {
        constraints.push(where('type', '==', filters.type[0]));
      }
      // For multiple types, we'll filter after query due to Firestore limitations
    }
    
    // City filter
    if (filters.city) {
      constraints.push(where('city', '==', filters.city));
    }
    
    // State filter
    if (filters.state) {
      constraints.push(where('state', '==', filters.state));
    }
    
    // Rating filter
    if (filters.rating) {
      constraints.push(where('rating', '>=', filters.rating));
    }
    
    // Emergency service filter
    if (filters.emergencyService) {
      constraints.push(where('emergencyService', '==', true));
    }
    
    // Insurance filter
    if (filters.acceptsInsurance) {
      constraints.push(where('acceptsInsurance', '==', true));
    }
    
    // Add ordering and limit
    constraints.push(orderBy('name'));
    constraints.push(limit(maxResults));
    
    const q = query(collection(db, collectionName), ...constraints);
    const snapshot = await getDocs(q);
    
    const services: HealthService[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Apply status and verification filters
      const serviceStatus = data.status || 'active';
      const isVerified = data.verified !== false; // Default to true if not specified
      
      // Skip inactive or unverified services
      if (serviceStatus !== 'active' || !isVerified) {
        return;
      }
      
      // Handle coordinates
      let coordinates: Coordinates;
      if (data.coordinates) {
        coordinates = {
          latitude: data.coordinates.latitude || 0,
          longitude: data.coordinates.longitude || 0
        };
      } else if (data.location) {
        coordinates = {
          latitude: data.location.latitude || 0,
          longitude: data.location.longitude || 0
        };
      } else {
        coordinates = { latitude: 0, longitude: 0 };
      }
      
      const service: HealthService = {
        id: doc.id,
        name: data.name || '',
        type: data.type || data.serviceType || 'clinic',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || 'Angola',
        coordinates,
        phone: data.phone || '',
        description: data.description || '',
        rating: data.rating || 0,
        reviews: data.reviews || 0,
        services: data.services || [],
        specialty: data.specialty || data.specialization,
        status: serviceStatus,
        ...data
      };
      
      services.push(service);
    });
    
    return services;
  }
  
  /**
   * Apply advanced filters after initial query
   */
  private static applyAdvancedFilters(
    services: HealthService[], 
    filters: SearchFilters
  ): HealthService[] {
    return services.filter(service => {
      // Multiple service types filter
      if (filters.type && filters.type.length > 1) {
        if (!filters.type.includes(service.type as ServiceType)) {
          return false;
        }
      }
      
      // Specialties filter
      if (filters.specialties && filters.specialties.length > 0) {
        const serviceSpecialties = [
          service.specialty,
          ...(service.services || [])
        ].filter(Boolean).map(s => s!.toLowerCase());
        
        const hasMatchingSpecialty = filters.specialties.some(specialty =>
          serviceSpecialties.some(serviceSpec =>
            serviceSpec.includes(specialty.toLowerCase())
          )
        );
        
        if (!hasMatchingSpecialty) {
          return false;
        }
      }
      
      // Text search in description and services
      if (filters.query) {
        const searchLower = filters.query.toLowerCase();
        const searchableText = [
          service.name,
          service.description,
          service.specialty,
          ...(service.services || [])
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  /**
   * Filter services by distance from user location
   */
  private static filterByDistance(
    services: HealthService[],
    userLocation: Coordinates,
    maxDistanceKm: number
  ): HealthService[] {
    return services.filter(service => {
      if (!service.coordinates) return false;
      
      const distance = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        service.coordinates.latitude,
        service.coordinates.longitude
      );
      
      return distance <= maxDistanceKm;
    });
  }
  
  /**
   * Calculate distance between two points (Haversine formula)
   */
  private static calculateDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  
  /**
   * Remove duplicate services by ID or name
   */
  private static removeDuplicates(services: HealthService[]): HealthService[] {
    const seen = new Set<string>();
    return services.filter(service => {
      const identifier = service.id || `${service.name}-${service.address}`;
      if (seen.has(identifier)) {
        return false;
      }
      seen.add(identifier);
      return true;
    });
  }
  
  /**
   * Sort results by relevance and rating
   */
  private static sortResults(services: HealthService[], query?: string): HealthService[] {
    return services.sort((a, b) => {
      // If there's a query, prioritize exact name matches
      if (query) {
        const aExactMatch = a.name.toLowerCase().startsWith(query.toLowerCase());
        const bExactMatch = b.name.toLowerCase().startsWith(query.toLowerCase());
        
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;
      }
      
      // Then sort by rating (higher first)
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      
      // Finally sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }
  
  /**
   * Generate auto-suggestions based on query and existing services
   */
  private static async generateSuggestions(
    query: string,
    services: HealthService[]
  ): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];
    
    if (!query) return suggestions;
    
    const queryLower = query.toLowerCase();
    
    // Service name suggestions
    const serviceNames = services
      .map(s => s.name)
      .filter(name => name.toLowerCase().includes(queryLower))
      .slice(0, 3);
      
    serviceNames.forEach(name => {
      suggestions.push({
        id: `service-${name}`,
        text: name,
        type: 'service',
        metadata: { icon: 'medical' }
      });
    });
    
    // Specialty suggestions
    const matchingSpecialties = MEDICAL_SPECIALTIES
      .filter(specialty => specialty.toLowerCase().includes(queryLower))
      .slice(0, 3);
      
    matchingSpecialties.forEach(specialty => {
      suggestions.push({
        id: `specialty-${specialty}`,
        text: specialty,
        type: 'specialty',
        metadata: { icon: 'school' }
      });
    });
    
    // Location suggestions
    const cities = [...new Set(services
      .map(s => s.city)
      .filter(city => city && city.toLowerCase().includes(queryLower))
    )].slice(0, 2);
    
    cities.forEach(city => {
      suggestions.push({
        id: `location-${city}`,
        text: city,
        type: 'location',
        metadata: { icon: 'location' }
      });
    });
    
    return suggestions;
  }
  
  /**
   * Get popular search suggestions
   */
  static getPopularSuggestions(): SearchSuggestion[] {
    return [
      {
        id: 'popular-emergency',
        text: 'Emergency Services',
        type: 'facility',
        metadata: { icon: 'car-sport', count: 15 }
      },
      {
        id: 'popular-cardiology',
        text: 'Cardiology',
        type: 'specialty',
        metadata: { icon: 'heart', count: 23 }
      },
      {
        id: 'popular-pharmacy',
        text: 'Nearby Pharmacy',
        type: 'facility',
        metadata: { icon: 'medical', count: 45 }
      },
      {
        id: 'popular-pediatrics',
        text: 'Pediatrics',
        type: 'specialty',
        metadata: { icon: 'people', count: 18 }
      },
      {
        id: 'popular-hospital',
        text: 'Hospital',
        type: 'facility',
        metadata: { icon: 'business', count: 12 }
      }
    ];
  }
}