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
import { HealthService } from '../types';

// Types locais para API
type ServiceType = 'hospital' | 'clinic' | 'pharmacy' | 'emergency' | 'laboratory' | 'professional' | 'all';

interface ServiceFilters {
  type?: ServiceType;
  city?: string;
  state?: string;
  specialty?: string;
}

export class HealthServiceAPIFirebase {
  
  /**
   * Get all health services with pagination
   */
  static async getAllServices(
    pageSize: number = 20,
    lastDoc?: DocumentSnapshot
  ): Promise<{ services: HealthService[]; lastDoc?: DocumentSnapshot }> {
    try {
      console.log('🔍 Buscando serviços nas coleções healthServices e registeredServices...');
      
      const services: HealthService[] = [];
      let newLastDoc: DocumentSnapshot | undefined;

      // 1. Buscar na coleção healthServices (serviços migrados)
      let healthServicesQuery = query(
        collection(db, 'healthServices'),
        limit(pageSize)
      );

      if (lastDoc) {
        healthServicesQuery = query(healthServicesQuery, startAfter(lastDoc));
      }

      console.log('📡 Executando query em healthServices...');
      const healthServicesSnapshot = await getDocs(healthServicesQuery);
      console.log(`📋 healthServices retornou ${healthServicesSnapshot.size} documentos`);
      
      // Debug: Verificar se HospGama está nos documentos retornados
      const hospGamaDoc = healthServicesSnapshot.docs.find(doc => {
        const data = doc.data();
        return data.name && data.name.includes('HospGama');
      });
      
      if (hospGamaDoc) {
        console.log('✅ [API] HospGama ENCONTRADO na query do Firestore:', hospGamaDoc.id);
      } else {
        console.log('❌ [API] HospGama NÃO ENCONTRADO na query do Firestore');
        console.log('🔍 [API] Documentos disponíveis:', healthServicesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        })).slice(0, 10));
      }

      // 2. POR ENQUANTO: Usar apenas healthServices até resolver permissões
      // TODO: Reativar registeredServices quando as regras Firestore forem atualizadas
      console.log('⚠️ TEMPORÁRIO: Usando apenas healthServices devido a problemas de permissão');

      // 3. Processar serviços apenas de healthServices
      const allSnapshots = [
        ...healthServicesSnapshot.docs
      ];

      console.log(`📊 Total de documentos para processar: ${allSnapshots.length}`);

      allSnapshots.forEach((doc) => {
        const data = doc.data();
        console.log(`📄 Processando documento: ${doc.id}`);
        
        // Debug específico para HospGama
        const isHospGama = data.name && data.name.includes('HospGama');
        if (isHospGama) {
          console.log('🏥 [API] HospGama encontrado no Firestore - dados completos:', {
            id: doc.id,
            name: data.name,
            type: data.type,
            serviceType: data.serviceType,
            status: data.status,
            verified: data.verified,
            rawData: data
          });
        }
        
        // FILTRO RIGOROSO PARA PROFISSIONAIS E INSTITUIÇÕES
        // Apenas serviços ativos E verificados devem aparecer
        const serviceStatus = data.status !== undefined ? data.status : 'active';
        const isVerified = data.verified !== undefined ? data.verified : true;
        
        console.log(`🔍 Analisando serviço ${data.name}:`, {
          type: data.type,
          serviceType: data.serviceType,
          status: serviceStatus,
          verified: isVerified,
          isProfessionalOrInstitution: data.type === 'professional' || data.serviceType === 'professional' || 
                                     data.type === 'institution' || data.serviceType === 'institution'
        });
        
        // Para profissionais e instituições, aplicar filtro rigoroso
        if (data.type === 'professional' || data.serviceType === 'professional' || 
            data.type === 'institution' || data.serviceType === 'institution') {
          
          // Serviço deve estar ativo E verificado
          if (serviceStatus !== 'active' || !isVerified) {
            if (isHospGama) {
              console.log(`🚫 [API] HospGama FILTRADO como profissional/instituição - Status: ${serviceStatus}, Verificado: ${isVerified}`);
            } else {
              console.log(`🚫 Serviço ${data.name} filtrado - Status: ${serviceStatus}, Verificado: ${isVerified}`);
            }
            return; // Pular este serviço
          }
          
          if (isHospGama) {
            console.log(`✅ [API] HospGama APROVADO como profissional/instituição`);
          } else {
            console.log(`✅ Serviço profissional/instituição ${data.name} APROVADO`);
          }
        } else {
          // Para outros tipos (hospital, clinic, pharmacy, etc), só verificar se está ativo
          if (serviceStatus !== 'active') {
            if (isHospGama) {
              console.log(`🚫 [API] HospGama FILTRADO por status inativo: ${serviceStatus}`);
            } else {
              console.log(`🚫 Serviço ${data.name} filtrado - Status inativo: ${serviceStatus}`);
            }
            return; // Pular este serviço
          }
          
          if (isHospGama) {
            console.log(`✅ [API] HospGama APROVADO como serviço geral - Status: ${serviceStatus}`);
          } else {
            console.log(`✅ Serviço geral ${data.name} APROVADO - Status: ${serviceStatus}`);
          }
        }
        
        // Continuar processando o serviço aprovado
        
        // Se tem createdBy (foi criado via registro), verificar se usuário está ativo
        if (data.createdBy) {
          // TODO: Consultar status do usuário que criou o serviço
          // Por agora, assumir que se chegou até aqui, está ok
        }
        
        // CORREÇÃO: Padronizar campo coordinates (antes era location)
        const coordinates = (() => {
          let lat = 0;
          let lng = 0;
          
          // Prioridade 1: Campo coordinates (padrão correto)
          if (data.coordinates && typeof data.coordinates === 'object') {
            lat = data.coordinates.latitude || 0;
            lng = data.coordinates.longitude || 0;
          }
          // Prioridade 2: Campo location (compatibilidade com registros antigos)
          else if (data.location && typeof data.location === 'object') {
            lat = data.location.latitude || 0;
            lng = data.location.longitude || 0;
            
            // Log para identificar registros com estrutura antiga
            console.warn(`📍 Serviço ${data.name} usando campo 'location' (deve ser 'coordinates')`);
          }
          
          // Se não há coordenadas válidas, usar coordenadas padrão de Luanda
          if (!lat || !lng || lat === 0 || lng === 0) {
            console.warn(`⚠️ Documento ${doc.id} (${data.name}) sem coordenadas válidas - usando coordenadas padrão de Luanda`);
            return {
              latitude: -8.8390526,
              longitude: 13.2894116
            };
          }
          
          return {
            latitude: lat,
            longitude: lng
          };
        })();
        
        // CORREÇÃO: Normalizar campo address (objeto -> string)
        let normalizedAddress = '';
        if (typeof data.address === 'string') {
          // Address já é string (formato correto)
          normalizedAddress = data.address;
        } else if (data.address && typeof data.address === 'object') {
          // Address é objeto (compatibilidade com registros antigos)
          const addr = data.address;
          const parts = [
            addr.street || addr.rua,
            addr.city || addr.cidade,
            addr.state || addr.estado || addr.provincia,
            addr.country || addr.pais
          ].filter(Boolean);
          
          normalizedAddress = parts.length > 0 ? parts.join(', ') : 'Endereço não especificado';
          console.warn(`📍 Serviço ${data.name} usando address como objeto (deve ser string)`);
        } else {
          // Usar city como fallback se address não existir
          normalizedAddress = data.city || 'Luanda, Angola';
          console.warn(`📍 Serviço ${data.name} sem address, usando city como fallback: ${normalizedAddress}`);
        }
        
        // Validar campos obrigatórios (agora com address normalizado)
        if (!data.name || !data.type || !normalizedAddress) {
          if (isHospGama) {
            console.warn(`⚠️ [API] HospGama FILTRADO por campos obrigatórios ausentes:`, {
              hasName: !!data.name,
              hasType: !!data.type,
              hasAddress: !!normalizedAddress
            });
          } else {
            console.warn(`⚠️ Documento ${doc.id} com campos obrigatórios ausentes:`, {
              hasName: !!data.name,
              hasType: !!data.type,
              hasAddress: !!normalizedAddress
            });
          }
          return; // Pular este serviço
        }
        
        // Validar tipos dos campos obrigatórios
        if (typeof data.name !== 'string' || typeof data.type !== 'string') {
          if (isHospGama) {
            console.warn(`⚠️ [API] HospGama FILTRADO por campos de tipo inválido:`, {
              nameType: typeof data.name,
              typeType: typeof data.type,
              normalizedAddress: normalizedAddress
            });
          } else {
            console.warn(`⚠️ Documento ${doc.id} com campos obrigatórios de tipo inválido:`, {
              nameType: typeof data.name,
              typeType: typeof data.type,
              normalizedAddress: normalizedAddress
            });
          }
          return; // Pular este serviço
        }
        
        // CORREÇÃO: Normalizar campos e adicionar campos ausentes
        const finalService = {
          ...data,
          id: doc.id,
          address: normalizedAddress, // Address sempre como string
          coordinates, // Coordinates padronizado
          // CORREÇÃO: Usar city como fallback para state
          state: data.state || data.city || 'Luanda',
          city: data.city || 'Luanda',
          // CORREÇÃO: Garantir que category existe (mapeado do type se ausente)
          category: data.category || data.type || 'general'
        } as unknown as HealthService;
        
        if (isHospGama) {
          console.log(`✅ [API] HospGama ADICIONADO à lista final de serviços:`, {
            id: finalService.id,
            name: finalService.name,
            type: finalService.type,
            coordinates: finalService.coordinates
          });
        }
        
        services.push(finalService);
        newLastDoc = doc;
      });

      console.log(`✅ [API] Processados ${services.length} serviços com sucesso`);
      
      // Debug: Verificar se HospGama está na lista final
      const hospGamaInFinal = services.find(s => s.name && s.name.includes('HospGama'));
      if (hospGamaInFinal) {
        console.log('✅ [API] HospGama FOUND in final services list:', {
          id: hospGamaInFinal.id,
          name: hospGamaInFinal.name,
          type: hospGamaInFinal.type,
          coordinates: hospGamaInFinal.coordinates
        });
      } else {
        console.log('❌ [API] HospGama NOT FOUND in final services list');
      }
      
      return { services, lastDoc: newLastDoc };
    } catch (error) {
      console.error('❌ Error fetching services:', error);
      throw new Error('Error fetching nearby services');
    }
  }

  /**
   * Add service type to user's health service record
   */
  static async addServiceType(serviceType: string, userType: 'professional' | 'institution'): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Find user's health service record
      const q = query(
        collection(db, 'healthServices'),
        where('createdBy', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Create new health service record if doesn't exist
        const newServiceData = {
          name: `Serviços ${userType === 'professional' ? 'Profissionais' : 'Institucionais'}`,
          type: userType,
          address: '',
          city: '',
          state: '',
          coordinates: new GeoPoint(0, 0),
          phone: '',
          description: '',
          services: [serviceType],
          status: 'active',
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await addDoc(collection(db, 'healthServices'), newServiceData);
        return true;
      } else {
        // Update existing record
        const doc = querySnapshot.docs[0];
        const currentData = doc.data();
        const currentServices = currentData.services || [];
        
        // Check if service type already exists
        if (currentServices.includes(serviceType)) {
          throw new Error('Service type already exists');
        }
        
        const updatedServices = [...currentServices, serviceType];
        
        await updateDoc(doc.ref, {
          services: updatedServices,
          updatedAt: serverTimestamp()
        });
        
        return true;
      }
    } catch (error) {
      console.error('Error adding service type:', error);
      throw error;
    }
  }

  /**
   * Remove service type from user's health service record
   */
  static async removeServiceType(serviceType: string): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const q = query(
        collection(db, 'healthServices'),
        where('createdBy', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('No service records found');
      }
      
      const doc = querySnapshot.docs[0];
      const currentData = doc.data();
      const currentServices = currentData.services || [];
      
      // Check if service type exists
      if (!currentServices.includes(serviceType)) {
        throw new Error('Service type not found');
      }
      
      const updatedServices = currentServices.filter((service: string) => service !== serviceType);
      
      await updateDoc(doc.ref, {
        services: updatedServices,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error removing service type:', error);
      throw error;
    }
  }

  /**
   * Get user's service types
   */
  static async getUserServiceTypes(): Promise<string[]> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const q = query(
        collection(db, 'healthServices'),
        where('createdBy', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return [];
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return data.services || [];
    } catch (error) {
      console.error('Error getting user service types:', error);
      throw error;
    }
  }

  /**
   * Get total count of user's services
   */
  static async getUserServicesCount(): Promise<number> {
    try {
      const services = await this.getUserServiceTypes();
      return services.length;
    } catch (error) {
      console.error('Error getting user services count:', error);
      return 0;
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
        
        // Validar campos obrigatórios
        if (!data.name || !data.type || !data.address) {
          console.warn(`⚠️ Serviço ${serviceId} com campos obrigatórios ausentes`);
          return null;
        }
        
        // Validar tipos dos campos obrigatórios
        if (typeof data.name !== 'string' || typeof data.type !== 'string' || typeof data.address !== 'string') {
          console.warn(`⚠️ Serviço ${serviceId} com campos obrigatórios de tipo inválido:`, {
            nameType: typeof data.name,
            typeType: typeof data.type,
            addressType: typeof data.address
          });
          return null;
        }
        
        // Validar estrutura de coordinates
        let coordinates;
        if (data.coordinates && typeof data.coordinates === 'object') {
          coordinates = {
            latitude: data.coordinates.latitude || data.location?.latitude || 0,
            longitude: data.coordinates.longitude || data.location?.longitude || 0
          };
        } else if (data.location && typeof data.location === 'object') {
          // Fallback para campo location (estrutura antiga)
          coordinates = {
            latitude: data.location.latitude || 0,
            longitude: data.location.longitude || 0
          };
        } else {
          coordinates = {
            latitude: 0,
            longitude: 0
          };
        }
        
        return {
          id: docSnap.id,
          ...data,
          coordinates
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
      const services: HealthService[] = [];

      // 1. Buscar na coleção healthServices
      let healthConstraints: any[] = [];

      // Text search (Firebase doesn't have full-text search, so we use prefix matching)
      if (searchQuery) {
        healthConstraints.push(
          where('name', '>=', searchQuery),
          where('name', '<=', searchQuery + '\uf8ff')
        );
      }

      // Filter by type
      if (filters?.type && filters.type !== 'all') {
        healthConstraints.push(where('type', '==', filters.type));
      }

      // Filter by city
      if (filters?.city) {
        healthConstraints.push(where('city', '==', filters.city));
      }

      const healthQuery = query(collection(db, 'healthServices'), ...healthConstraints, orderBy('name'), limit(25));
      const healthSnapshot = await getDocs(healthQuery);

      // 2. Buscar também em registeredServices (approved)
      let registeredConstraints: any[] = [
        where('status', '==', 'approved')
      ];

      // Adicionar mesmo filtro de busca para registeredServices
      if (searchQuery) {
        registeredConstraints.push(
          where('name', '>=', searchQuery),
          where('name', '<=', searchQuery + '\uf8ff')
        );
      }

      if (filters?.type && filters.type !== 'all') {
        // Para registeredServices, o tipo pode estar em 'serviceType' ao invés de 'type'
        registeredConstraints.push(where('serviceType', '==', filters.type));
      }

      if (filters?.city) {
        registeredConstraints.push(where('city', '==', filters.city));
      }

      const registeredQuery = query(collection(db, 'registeredServices'), ...registeredConstraints, orderBy('name'), limit(25));
      const registeredSnapshot = await getDocs(registeredQuery);

      // 3. Combinar resultados de ambas as coleções
      const allDocs = [...healthSnapshot.docs, ...registeredSnapshot.docs];
      
      allDocs.forEach((doc) => {
        const data = doc.data();
        
        // FILTRO RIGOROSO PARA PROFISSIONAIS E INSTITUIÇÕES (mesmo do getAllServices)
        const serviceStatus = data.status !== undefined ? data.status : 'active';
        const isVerified = data.verified !== undefined ? data.verified : true;
        
        // Para profissionais e instituições, aplicar filtro rigoroso
        if (data.type === 'professional' || data.serviceType === 'professional' || 
            data.type === 'institution' || data.serviceType === 'institution') {
          
          // Serviço deve estar ativo E verificado
          if (serviceStatus !== 'active' || !isVerified) {
            return; // Pular este serviço
          }
        }
        
        // Validar estrutura de coordinates
        let coordinates;
        if (data.coordinates && typeof data.coordinates === 'object') {
          coordinates = {
            latitude: data.coordinates.latitude || data.location?.latitude || 0,
            longitude: data.coordinates.longitude || data.location?.longitude || 0
          };
        } else if (data.location && typeof data.location === 'object') {
          coordinates = {
            latitude: data.location.latitude || 0,
            longitude: data.location.longitude || 0
          };
        } else {
          coordinates = { latitude: 0, longitude: 0 };
        }
        
        services.push({
          id: doc.id,
          ...data,
          coordinates
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
  static async addService(serviceData: any): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
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
        status: 'active' // Novos serviços sempre começam como ativos
      };

      const docRef = await addDoc(collection(db, 'healthServices'), serviceData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding service:', error);
      throw new Error('Error adding service');
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
      throw new Error('Error updating service');
    }
  }

  /**
   * Delete service
   */
  static async deleteService(serviceId: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      await deleteDoc(doc(db, 'healthServices', serviceId));
    } catch (error) {
      console.error('Error deleting service:', error);
      throw new Error('Error deleting service');
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
        
        // FILTRO RIGOROSO PARA PROFISSIONAIS E INSTITUIÇÕES
        const serviceStatus = data.status !== undefined ? data.status : 'active';
        const isVerified = data.verified !== undefined ? data.verified : true;
        
        // Para profissionais e instituições, aplicar filtro rigoroso
        if (data.type === 'professional' || data.serviceType === 'professional' || 
            data.type === 'institution' || data.serviceType === 'institution') {
          
          // Serviço deve estar ativo E verificado
          if (serviceStatus !== 'active' || !isVerified) {
            return; // Pular este serviço
          }
        }
        
        // Validar estrutura de coordinates
        let coordinates;
        if (data.coordinates && typeof data.coordinates === 'object') {
          coordinates = {
            latitude: data.coordinates.latitude || data.location?.latitude || 0,
            longitude: data.coordinates.longitude || data.location?.longitude || 0
          };
        } else if (data.location && typeof data.location === 'object') {
          coordinates = {
            latitude: data.location.latitude || 0,
            longitude: data.location.longitude || 0
          };
        } else {
          coordinates = { latitude: 0, longitude: 0 };
        }
        
        services.push({
          id: doc.id,
          ...data,
          coordinates
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
        
        // NOTA: Para getUserServices, não aplicamos filtros de status/verificação
        // O usuário deve poder ver seus próprios serviços independente do status
        
        // Validar estrutura de coordinates
        let coordinates;
        if (data.coordinates && typeof data.coordinates === 'object') {
          coordinates = {
            latitude: data.coordinates.latitude || data.location?.latitude || 0,
            longitude: data.coordinates.longitude || data.location?.longitude || 0
          };
        } else if (data.location && typeof data.location === 'object') {
          coordinates = {
            latitude: data.location.latitude || 0,
            longitude: data.location.longitude || 0
          };
        } else {
          coordinates = { latitude: 0, longitude: 0 };
        }
        
        services.push({
          id: doc.id,
          ...data,
          coordinates
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