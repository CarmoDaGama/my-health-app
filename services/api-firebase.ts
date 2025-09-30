import { 
  collection, 
  doc,
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  GeoPoint,
  serverTimestamp,
  DocumentSnapshot
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { HealthService, ServiceType, ServiceFilters } from '../types';

export class HealthServiceAPIFirebase {
  
  /**
   * Get all health services with pagination
   */
  static async getAllServices(
    pageSize: number = 20,
    lastDoc?: DocumentSnapshot
  ): Promise<{ services: HealthService[]; lastDoc?: DocumentSnapshot }> {
    try {
      console.log('🔍 Buscando serviços na coleção healthServices...');
      
      // Tentar sem ordenação primeiro para ver se os dados existem
      let q = query(
        collection(db, 'healthServices'),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      console.log('📡 Executando query no Firestore...');
      const querySnapshot = await getDocs(q);
      console.log(`📋 Query retornou ${querySnapshot.size} documentos`);
      
      const services: HealthService[] = [];
      let newLastDoc: DocumentSnapshot | undefined;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`📄 Processando documento: ${doc.id}`);
        services.push({
          id: doc.id,
          ...data,
          coordinates: {
            latitude: data.coordinates.latitude,
            longitude: data.coordinates.longitude
          }
        } as HealthService);
        newLastDoc = doc;
      });

      console.log(`✅ Processados ${services.length} serviços com sucesso`);
      return { services, lastDoc: newLastDoc };
    } catch (error) {
      console.error('❌ Error fetching services:', error);
      throw new Error('Erro ao buscar serviços de saúde');
    }
  }

  /**
   * Get service by ID
   */
  static async getServiceById(serviceId: string): Promise<HealthService | null> {
    try {
      const docRef = doc(db, 'healthServices', serviceId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          coordinates: {
            latitude: data.coordinates.latitude,
            longitude: data.coordinates.longitude
          }
        } as HealthService;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching service:', error);
      return null;
    }
  }

  /**
   * Search services by name or type
   */
  static async searchServices(
    searchQuery: string,
    filters?: ServiceFilters
  ): Promise<HealthService[]> {
    try {
      let q = collection(db, 'healthServices');
      const constraints: any[] = [];

      // Text search (Firebase doesn't have full-text search, so we use prefix matching)
      if (searchQuery) {
        constraints.push(
          where('name', '>=', searchQuery),
          where('name', '<=', searchQuery + '\uf8ff')
        );
      }

      // Filter by type
      if (filters?.type && filters.type !== 'all') {
        constraints.push(where('type', '==', filters.type));
      }

      // Filter by city
      if (filters?.city) {
        constraints.push(where('city', '==', filters.city));
      }

      const finalQuery = query(q, ...constraints, orderBy('name'), limit(50));
      const querySnapshot = await getDocs(finalQuery);
      
      const services: HealthService[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        services.push({
          id: doc.id,
          ...data,
          coordinates: {
            latitude: data.coordinates.latitude,
            longitude: data.coordinates.longitude
          }
        } as HealthService);
      });

      return services;
    } catch (error) {
      console.error('Error searching services:', error);
      return [];
    }
  }

  /**
   * Get services by location (nearby)
   */
  static async getNearbyServices(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<HealthService[]> {
    try {
      // Firebase doesn't have built-in geo queries, so we'll fetch all and filter
      // For production, consider using Algolia or similar for geo search
      const allServices = await this.getAllServices(100);
      
      const nearbyServices = allServices.services.filter(service => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          service.coordinates.latitude,
          service.coordinates.longitude
        );
        return distance <= radiusKm;
      });

      // Sort by distance
      nearbyServices.sort((a, b) => {
        const distanceA = this.calculateDistance(
          latitude, longitude,
          a.coordinates.latitude, a.coordinates.longitude
        );
        const distanceB = this.calculateDistance(
          latitude, longitude,
          b.coordinates.latitude, b.coordinates.longitude
        );
        return distanceA - distanceB;
      });

      return nearbyServices;
    } catch (error) {
      console.error('Error fetching nearby services:', error);
      return [];
    }
  }

  /**
   * Add new health service
   */
  static async addService(service: Omit<HealthService, 'id'>): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const serviceData = {
        ...service,
        coordinates: new GeoPoint(
          service.coordinates.latitude,
          service.coordinates.longitude
        ),
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active'
      };

      const docRef = await addDoc(collection(db, 'healthServices'), serviceData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding service:', error);
      throw new Error('Erro ao adicionar serviço');
    }
  }

  /**
   * Update existing service
   */
  static async updateService(
    serviceId: string, 
    updates: Partial<Omit<HealthService, 'id'>>
  ): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Convert coordinates if provided
      if (updates.coordinates) {
        updateData.coordinates = new GeoPoint(
          updates.coordinates.latitude,
          updates.coordinates.longitude
        );
      }

      await updateDoc(doc(db, 'healthServices', serviceId), updateData);
    } catch (error) {
      console.error('Error updating service:', error);
      throw new Error('Erro ao atualizar serviço');
    }
  }

  /**
   * Delete service
   */
  static async deleteService(serviceId: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      await deleteDoc(doc(db, 'healthServices', serviceId));
    } catch (error) {
      console.error('Error deleting service:', error);
      throw new Error('Erro ao deletar serviço');
    }
  }

  /**
   * Get services by type
   */
  static async getServicesByType(type: ServiceType): Promise<HealthService[]> {
    try {
      const q = query(
        collection(db, 'healthServices'),
        where('type', '==', type),
        orderBy('name'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      const services: HealthService[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        services.push({
          id: doc.id,
          ...data,
          coordinates: {
            latitude: data.coordinates.latitude,
            longitude: data.coordinates.longitude
          }
        } as HealthService);
      });

      return services;
    } catch (error) {
      console.error('Error fetching services by type:', error);
      return [];
    }
  }

  /**
   * Get user's submitted services
   */
  static async getUserServices(): Promise<HealthService[]> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return [];
      }

      const q = query(
        collection(db, 'healthServices'),
        where('createdBy', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const services: HealthService[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        services.push({
          id: doc.id,
          ...data,
          coordinates: {
            latitude: data.coordinates.latitude,
            longitude: data.coordinates.longitude
          }
        } as HealthService);
      });

      return services;
    } catch (error) {
      console.error('Error fetching user services:', error);
      return [];
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in kilometers
    return d;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Instance methods for compatibility
  async getAllServices(): Promise<HealthService[]> {
    try {
      console.log('🔥 Iniciando busca de serviços no Firebase...');
      const result = await HealthServiceAPIFirebase.getAllServices(100);
      console.log(`✅ Firebase retornou ${result.services.length} serviços`);
      return result.services;
    } catch (error) {
      console.error('❌ Erro no getAllServices:', error);
      throw error;
    }
  }

  async getServiceById(serviceId: string): Promise<HealthService | null> {
    return HealthServiceAPIFirebase.getServiceById(serviceId);
  }

  async searchServices(searchQuery: string, filters?: ServiceFilters): Promise<HealthService[]> {
    return HealthServiceAPIFirebase.searchServices(searchQuery, filters);
  }

  async getNearbyServices(lat: number, lng: number, radiusKm: number = 10): Promise<HealthService[]> {
    return HealthServiceAPIFirebase.getNearbyServices(lat, lng, radiusKm);
  }
}