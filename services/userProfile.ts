import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { 
  User, 
  NormalUser, 
  Professional, 
  Institution,
  UserType,
  UserPreferences,
  Coordinates,
  isNormalUser,
  isProfessional,
  isInstitution
} from '../types';

// Storage keys
const USER_DATA_KEY = '@health_app:user_data';
const REGISTERED_USERS_KEY = '@health_app:registered_users';
const REGISTERED_SERVICES_KEY = '@health_app:registered_services';

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
  // Campos específicos para usuários normais
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  // Campos específicos para profissionais
  professionalInfo?: {
    specialty?: string;
    license?: string;
    experience?: number;
    bio?: string;
    certifications?: string[];
    workingHours?: {
      [key: string]: { start: string; end: string; available: boolean };
    };
    consultationFee?: number;
    acceptsInsurance?: boolean;
  };
  // Campos específicos para instituições
  institutionInfo?: {
    type?: 'hospital' | 'clinic' | 'laboratory' | 'pharmacy' | 'other';
    address?: string;
    city?: string;
    state?: string;
    coordinates?: Coordinates;
    services?: string[];
    workingHours?: {
      [key: string]: { start: string; end: string; available: boolean };
    };
    contactInfo?: {
      phone: string;
      email: string;
      website?: string;
    };
    description?: string;
    acceptsInsurance?: boolean;
    emergencyService?: boolean;
  };
  preferences?: Partial<UserPreferences>;
}

export interface UpdateProfileResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export class UserProfileService {
  
  /**
   * Atualizar perfil do usuário
   */
  static async updateProfile(userId: string, updateData: UpdateProfileData): Promise<UpdateProfileResponse> {
    try {
      // Validar dados de entrada
      this.validateUpdateData(updateData);
      
      // Get current user
      const currentUser = await this.getCurrentUser(userId);
      if (!currentUser) {
        throw new Error('User not found');
      }
      
      console.log('🔍 UserProfileService - Usuário atual:', {
        id: currentUser.id,
        userType: currentUser.userType,
        hasProfessionalInfo: isProfessional(currentUser) ? !!currentUser.professionalInfo : 'N/A',
        hasInstitutionInfo: isInstitution(currentUser) ? !!currentUser.institutionInfo : 'N/A'
      });
      
      // Aplicar atualizações específicas do tipo de usuário
      const updatedUser = this.applyUpdatesToUser(currentUser, updateData);
      
      // Salvar no AsyncStorage (simulando base de dados local)
      await this.saveUpdatedUser(updatedUser);
      
      // Se for profissional ou instituição, atualizar também nos serviços de saúde
      if (isProfessional(updatedUser) || isInstitution(updatedUser)) {
        await this.updateHealthService(updatedUser);
      }
      
      return {
        success: true,
        user: updatedUser
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao atualizar perfil';
      console.error('🚨 ERRO NA ATUALIZAÇÃO DO PERFIL:', {
        userId,
        error: errorMessage,
        updateData
      });
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Atualizar apenas preferências do usuário
   */
  static async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UpdateProfileResponse> {
    return this.updateProfile(userId, { preferences });
  }
  
  /**
   * Obter usuário atual
   */
  private static async getCurrentUser(userId: string): Promise<User | null> {
    try {
      // Primeiro tentar AsyncStorage
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (userData) {
        const user = JSON.parse(userData);
        if (user.id === userId) {
          return user;
        }
      }
      
      // Se não encontrar, verificar na lista de usuários registrados
      const registeredUsers = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
      if (registeredUsers) {
        const users = JSON.parse(registeredUsers);
        const user = users.find((u: any) => u.id === userId);
        if (user) {
          return user;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }
  
  /**
   * Aplicar atualizações ao usuário baseado no tipo
   */
  private static applyUpdatesToUser(currentUser: User, updateData: UpdateProfileData): User {
    const updatedUser = { ...currentUser };
    
    // Campos comuns para todos os tipos de usuário
    if (updateData.name !== undefined) updatedUser.name = updateData.name;
    if (updateData.phone !== undefined) updatedUser.phone = updateData.phone;
    if (updateData.avatar !== undefined) updatedUser.avatar = updateData.avatar;
    
    // Atualizar preferências
    if (updateData.preferences) {
      updatedUser.preferences = {
        ...updatedUser.preferences,
        ...updateData.preferences
      };
    }
    
    // Atualizações específicas por tipo de usuário
    if (isNormalUser(updatedUser)) {
      this.applyNormalUserUpdates(updatedUser, updateData);
    } else if (isProfessional(updatedUser)) {
      this.applyProfessionalUpdates(updatedUser, updateData);
    } else if (isInstitution(updatedUser)) {
      this.applyInstitutionUpdates(updatedUser, updateData);
    }
    
    // Atualizar timestamp
    updatedUser.updatedAt = new Date();
    
    return updatedUser;
  }
  
  /**
   * Aplicar atualizações específicas para usuários normais
   */
  private static applyNormalUserUpdates(user: NormalUser, updateData: UpdateProfileData): void {
    if (updateData.dateOfBirth !== undefined) user.dateOfBirth = updateData.dateOfBirth;
    if (updateData.gender !== undefined) user.gender = updateData.gender;
    if (updateData.address !== undefined) user.address = updateData.address;
    if (updateData.emergencyContact !== undefined) user.emergencyContact = updateData.emergencyContact;
  }
  
  /**
   * Aplicar atualizações específicas para profissionais
   */
  private static applyProfessionalUpdates(user: Professional, updateData: UpdateProfileData): void {
    // Garantir que professionalInfo existe
    if (!user.professionalInfo) {
      user.professionalInfo = {
        specialty: '',
        license: '',
        experience: 0,
        bio: '',
        certifications: [],
        workingHours: {
          monday: { start: '', end: '', available: false },
          tuesday: { start: '', end: '', available: false },
          wednesday: { start: '', end: '', available: false },
          thursday: { start: '', end: '', available: false },
          friday: { start: '', end: '', available: false },
          saturday: { start: '', end: '', available: false },
          sunday: { start: '', end: '', available: false },
        },
        consultationFee: 0,
        acceptsInsurance: false
      };
    }
    
    if (updateData.professionalInfo) {
      user.professionalInfo = {
        ...user.professionalInfo,
        ...updateData.professionalInfo
      };
    }
  }
  
  /**
   * Aplicar atualizações específicas para instituições
   */
  private static applyInstitutionUpdates(user: Institution, updateData: UpdateProfileData): void {
    // Garantir que institutionInfo existe
    if (!user.institutionInfo) {
      user.institutionInfo = {
        type: 'clinic',
        address: '',
        services: [],
        workingHours: {
          monday: { start: '', end: '', available: false },
          tuesday: { start: '', end: '', available: false },
          wednesday: { start: '', end: '', available: false },
          thursday: { start: '', end: '', available: false },
          friday: { start: '', end: '', available: false },
          saturday: { start: '', end: '', available: false },
          sunday: { start: '', end: '', available: false },
        },
        contactInfo: {
          phone: '',
          email: '',
          website: ''
        },
        description: '',
        acceptsInsurance: false,
        emergencyService: false,
        verified: false,
        rating: 0,
        totalReviews: 0
      };
    }
    
    if (updateData.institutionInfo) {
      user.institutionInfo = {
        ...user.institutionInfo,
        ...updateData.institutionInfo
      };
    }
  }
  
  /**
   * Salvar usuário atualizado no AsyncStorage
   */
  private static async saveUpdatedUser(user: User): Promise<void> {
    try {
      // Salvar como usuário atual
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      
      // Atualizar na lista de usuários registrados
      const registeredUsers = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
      if (registeredUsers) {
        const users = JSON.parse(registeredUsers);
        const userIndex = users.findIndex((u: any) => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex] = user;
          await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
        }
      }
    } catch (error) {
      console.error('Error saving updated user:', error);
      throw new Error('Failed to save updated data');
    }
  }
  
  /**
   * Atualizar serviço de saúde correspondente para profissionais e instituições
   */
  private static async updateHealthService(user: Professional | Institution): Promise<void> {
    try {
      const registeredServices = await AsyncStorage.getItem(REGISTERED_SERVICES_KEY);
      if (!registeredServices) return;
      
      const services = JSON.parse(registeredServices);
      const serviceIndex = services.findIndex((s: any) => s.id === user.id);
      
      if (serviceIndex !== -1) {
        // Atualizar dados básicos do serviço
        services[serviceIndex].name = user.name;
        services[serviceIndex].phone = user.phone || services[serviceIndex].phone;
        services[serviceIndex].email = user.email;
        
        if (isProfessional(user)) {
          services[serviceIndex].specialty = user.professionalInfo.specialty;
          services[serviceIndex].description = user.professionalInfo.bio || services[serviceIndex].description;
          services[serviceIndex].schedule = user.professionalInfo.workingHours;
        } else if (isInstitution(user)) {
          services[serviceIndex].type = user.institutionInfo.type;
          services[serviceIndex].description = user.institutionInfo.description;
          services[serviceIndex].services = user.institutionInfo.services;
          services[serviceIndex].schedule = user.institutionInfo.workingHours;
          if (user.institutionInfo.address) {
            services[serviceIndex].address = user.institutionInfo.address;
          }
        }
        
        await AsyncStorage.setItem(REGISTERED_SERVICES_KEY, JSON.stringify(services));
      }
    } catch (error) {
      console.error('Erro ao atualizar serviço de saúde:', error);
      // Não jogar erro aqui para não falhar a atualização do perfil
    }
  }
  
  /**
   * Validar dados de atualização
   */
  private static validateUpdateData(updateData: UpdateProfileData): void {
    // Basic validations
    if (updateData.name !== undefined && !updateData.name.trim()) {
      throw new Error('Name cannot be empty');
    }
    
    if (updateData.phone !== undefined && updateData.phone && !/^\+?[\d\s\-\(\)]+$/.test(updateData.phone)) {
      throw new Error('Invalid phone format');
    }
    
    // Validations for normal users
    if (updateData.emergencyContact) {
      if (!updateData.emergencyContact.name?.trim()) {
        throw new Error('Emergency contact name is required');
      }
      if (!updateData.emergencyContact.phone?.trim()) {
        throw new Error('Emergency contact phone is required');
      }
      if (!updateData.emergencyContact.relationship?.trim()) {
        throw new Error('Emergency contact relationship is required');
      }
    }
    
    // Validations for professionals
    if (updateData.professionalInfo) {
      if (updateData.professionalInfo.experience !== undefined && updateData.professionalInfo.experience < 0) {
        throw new Error('Years of experience cannot be negative');
      }
      if (updateData.professionalInfo.consultationFee !== undefined && updateData.professionalInfo.consultationFee < 0) {
        throw new Error('Consultation fee cannot be negative');
      }
    }
    
    // Validations for institutions
    if (updateData.institutionInfo?.address) {
      if (!updateData.institutionInfo.address.trim()) {
        throw new Error('Address is required');
      }
    }
  }
  
  /**
   * Obter dados do perfil do usuário
   */
  static async getProfile(userId: string): Promise<User | null> {
    return this.getCurrentUser(userId);
  }
  
  /**
   * Verificar se o usuário pode editar determinado campo
   */
  static canEditField(user: User, fieldName: string): boolean {
    // Campos que não podem ser editados
    const readOnlyFields = ['id', 'email', 'userType', 'createdAt', 'isActive'];
    
    if (readOnlyFields.includes(fieldName)) {
      return false;
    }
    
    // Campos específicos de verificação para profissionais e instituições
    if ((isProfessional(user) || isInstitution(user)) && fieldName === 'isVerified') {
      return false; // Apenas administradores podem alterar status de verificação
    }
    
    return true;
  }
}