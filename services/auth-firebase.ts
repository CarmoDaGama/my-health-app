import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { AuthCredentials, RegisterData, AuthResponse, UserType } from '../types';
import { AuthService } from './auth';

export class AuthServiceFirebase {
  
  /**
   * Login with email and password
   */
  static async login(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );
      
      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();
      
      if (!userData) {
        throw new Error('Dados do usuário não encontrados');
      }
      
      // Validate if user is active
      if (userData.isActive === false || userData.isActive === null || userData.isActive === undefined) {
        // Sign out the user immediately since account is inactive
        await signOut(auth);
        return {
          success: false,
          error: 'Sua conta foi desativada. Entre em contato com o suporte para assistência.'
        };
      }
      
      // Get Firebase token
      const token = await userCredential.user.getIdToken();
      
      return {
        success: true,
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
          name: userData.name,
          phone: userData.phone,
          userType: userData.userType,
          isActive: userData.isActive,
          isVerified: userData.isVerified,
          preferences: userData.preferences
        } as any,
        token
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code) || error.message
      };
    }
  }

  /**
   * Register new user
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        data.email, 
        data.password
      );
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: data.name
      });
      
      // Save additional user data to Firestore
      const userData: any = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        userType: data.userType,
        isActive: true, // New users are active by default
        isVerified: data.userType === UserType.NORMAL_USER ? true : false, // Normal users are verified, professionals/institutions need verification
        preferences: {
          language: 'en',
          notifications: {
            enabled: true,
            serviceReminders: true,
            healthTips: true,
            emergencyAlerts: true,
          },
          favorites: {
            services: [],
            locations: []
          },
          privacy: {
            shareLocation: true,
            publicProfile: false
          }
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add specific data based on user type
      if (data.userType === UserType.NORMAL_USER) {
        // Inicializar campos específicos do usuário normal
        userData.favoriteInstitutions = [];
        userData.searchHistory = [];
        userData.dateOfBirth = null;
        userData.gender = null;
        userData.address = null;
        userData.emergencyContact = null;
        console.log('👤 Inicializando campos de usuário normal');
      } else if (data.userType === UserType.PROFESSIONAL && data.professionalInfo) {
        userData.professionalInfo = data.professionalInfo;
        userData.favoriteInstitutions = [];
        userData.institutionId = null;
        console.log('👨‍⚕️ Salvando dados profissionais:', data.professionalInfo);
      } else if (data.userType === UserType.INSTITUTION && data.institutionInfo) {
        userData.institutionInfo = data.institutionInfo;
        userData.professionals = [];
        console.log('🏥 Salvando dados de instituição:', data.institutionInfo);
      }
      
      console.log('💾 Salvando dados do usuário no Firestore:', JSON.stringify(userData, null, 2));
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      console.log('✅ Dados salvos com sucesso no Firestore');
      
      // Get token
      const token = await userCredential.user.getIdToken();
      
      const newUser = {
        id: userCredential.user.uid,
        email: data.email,
        name: data.name,
        phone: data.phone,
        userType: data.userType,
        isActive: userData.isActive,
        isVerified: userData.isVerified,
        preferences: userData.preferences
      };
      
      // Adicionar aos serviços de saúde se for profissional ou instituição
      // FASE 2: Usar registeredServices (aguardar aprovação) ao invés de healthServices direto
      if (data.userType === UserType.PROFESSIONAL || data.userType === UserType.INSTITUTION) {
        try {
          console.log('🏥 Registrando serviço para aprovação...', data.userType);
          await this.addToRegisteredServices(newUser, data);
          console.log('✅ Serviço registrado e aguardando aprovação!');
        } catch (error) {
          console.error('❌ Erro ao registrar serviço:', error);
          // Não falha o registro se houver erro na adição aos serviços
        }
      }
      
      return {
        success: true,
        user: newUser as any, // Usar any para contornar problemas de tipos
        token
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { 
        success: false, 
        error: 'Erro ao fazer logout' 
      };
    }
  }

  /**
   * Send password reset email
   */
  static async forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Get current user
   */
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Update user profile
   */
  /**
   * Update user profile in Firestore
   */
  static async updateProfile(userId: string, updates: Partial<any>): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 Atualizando perfil do usuário:', userId);
      console.log('📝 Dados de atualização recebidos:', JSON.stringify(updates, null, 2));
      
      // Remove campos undefined para evitar sobrescrever dados existentes
      const cleanUpdates = Object.keys(updates).reduce((acc, key) => {
        if (updates[key] !== undefined) {
          acc[key] = updates[key];
        }
        return acc;
      }, {} as any);

      console.log('🧹 Dados limpos para atualização:', JSON.stringify(cleanUpdates, null, 2));

      await updateDoc(doc(db, 'users', userId), {
        ...cleanUpdates,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Perfil atualizado no Firestore com sucesso');
      
      // Update Firebase Auth profile if name changed
      if (updates.name && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: updates.name
        });
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Profile update error detalhado:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        fullError: error
      });
      return {
        success: false,
        error: error.message || 'Erro ao atualizar perfil'
      };
    }
  }

  /**
   * Get user data from Firestore
   */
  static async getUserData(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('📥 Dados brutos do Firestore:', JSON.stringify(userData, null, 2));
        
        // Verificar se precisa migrar campos faltantes
        const migratedData = await this.ensureUserFieldsExist(userId, userData);
        console.log('🔄 Dados após migração (se necessária):', JSON.stringify(migratedData, null, 2));
        
        return migratedData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  /**
   * Garantir que todos os campos necessários existem para cada tipo de usuário
   */
  static async ensureUserFieldsExist(userId: string, userData: any): Promise<any> {
    let needsUpdate = false;
    const updates: any = {};

    // Para usuários normais, garantir que campos específicos existem
    if (userData.userType === UserType.NORMAL_USER) {
      if (userData.favoriteInstitutions === undefined) {
        updates.favoriteInstitutions = [];
        needsUpdate = true;
      }
      if (userData.searchHistory === undefined) {
        updates.searchHistory = [];
        needsUpdate = true;
      }
      // Não inicializar dateOfBirth, gender, address, emergencyContact como null
      // pois o usuário pode querer deixá-los vazios intencionalmente
      
      console.log('👤 Verificando campos de usuário normal...');
    }

    // Para profissionais
    if (userData.userType === UserType.PROFESSIONAL) {
      if (userData.favoriteInstitutions === undefined) {
        updates.favoriteInstitutions = [];
        needsUpdate = true;
      }
      if (userData.professionalInfo === undefined) {
        updates.professionalInfo = {};
        needsUpdate = true;
      }
      
      console.log('👨‍⚕️ Verificando campos de profissional...');
    }

    // Para instituições
    if (userData.userType === UserType.INSTITUTION) {
      if (userData.professionals === undefined) {
        updates.professionals = [];
        needsUpdate = true;
      }
      if (userData.institutionInfo === undefined) {
        updates.institutionInfo = {};
        needsUpdate = true;
      }
      
      console.log('🏥 Verificando campos de instituição...');
    }

    // Se precisar atualizar, fazer a atualização
    if (needsUpdate) {
      console.log('🔄 Migração necessária, atualizando campos:', updates);
      try {
        await updateDoc(doc(db, 'users', userId), {
          ...updates,
          updatedAt: serverTimestamp()
        });
        
        // Retornar dados atualizados
        return { ...userData, ...updates };
      } catch (error) {
        console.error('❌ Erro na migração de campos:', error);
        return userData; // Retornar dados originais se a migração falhar
      }
    }

    return userData;
  }

  /**
   * Add professional/institution to registeredServices (pending approval)
   * FASE 2: Novo fluxo de aprovação
   */
  static async addToRegisteredServices(user: any, data: RegisterData): Promise<void> {
    try {
      const professionalInfo = data.professionalInfo || {};
      const institutionInfo = data.institutionInfo || {};
      
      const serviceData = {
        // Informações do serviço
        name: institutionInfo.name || professionalInfo.name || data.name,
        serviceType: data.userType === UserType.PROFESSIONAL ? 'professional' : 'institution',
        specialty: professionalInfo.specialty || institutionInfo.specialty || 'Geral',
        description: professionalInfo.description || institutionInfo.description || '',
        
        // Localização
        address: professionalInfo.address || institutionInfo.address || '',
        city: professionalInfo.city || institutionInfo.city || 'Luanda',
        province: professionalInfo.province || institutionInfo.province || 'Luanda',
        location: professionalInfo.location || institutionInfo.location || { 
          latitude: -8.8383, 
          longitude: 13.2344 
        },
        
        // Contato
        contactEmail: data.email,
        contactPhone: data.phone || professionalInfo.phone || institutionInfo.phone || '',
        
        // Metadata de registro
        createdBy: user.id,
        createdAt: serverTimestamp(),
        status: 'suspended', // Status inicial: suspenso até aprovação
        verified: false, // Campo adicional para controle interno
        
        // Informações adicionais
        userType: data.userType,
        professionalInfo: data.professionalInfo || null,
        institutionInfo: data.institutionInfo || null,
      };

      // Criar documento em registeredServices com ID do usuário
      const serviceRef = doc(db, 'registeredServices', user.id);
      await setDoc(serviceRef, serviceData);

      console.log('✅ Serviço registrado em registeredServices:', user.id);
    } catch (error) {
      console.error('❌ Erro ao adicionar a registeredServices:', error);
      throw error;
    }
  }

  /**
   * Convert Firebase error codes to user-friendly messages
   */
  private static getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Usuário não encontrado';
      case 'auth/wrong-password':
        return 'Senha incorreta';
      case 'auth/email-already-in-use':
        return 'Este email já está em uso';
      case 'auth/weak-password':
        return 'A senha deve ter pelo menos 6 caracteres';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua internet';
      default:
        return 'Erro de autenticação. Tente novamente';
    }
  }
}