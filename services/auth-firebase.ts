import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
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

      // Check if email is verified (except for admin users)
      if (!userCredential.user.emailVerified && userData.userType !== UserType.ADMIN) {
        return {
          success: false,
          error: 'Por favor, verifique seu email antes de fazer login. Verifique sua caixa de entrada.',
          needsEmailVerification: true
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

      // Send email verification
      try {
        await sendEmailVerification(userCredential.user);
        console.log('✅ Email de verificação enviado com sucesso');
      } catch (emailError) {
        console.warn('⚠️ Erro ao enviar email de verificação:', emailError);
        // Não falha o registro se não conseguir enviar o email de verificação
      }
      
      // Save additional user data to Firestore
      const userData: any = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        userType: data.userType,
        isActive: true, // New users are active by default
        isVerified: data.userType === UserType.NORMAL_USER ? true : false, // Normal users are verified, professionals/institutions need verification
        emailVerified: false, // Email not verified initially
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
        emailVerified: userCredential.user.emailVerified,
        preferences: userData.preferences
      };
      
      // Adicionar aos serviços de saúde se for profissional ou instituição
      // Registro direto em healthServices com status ativo e verificado
      if (data.userType === UserType.PROFESSIONAL || data.userType === UserType.INSTITUTION) {
        try {
          console.log('🏥 Registrando serviço diretamente em healthServices...', {
            userType: data.userType,
            userId: newUser.id,
            email: data.email,
            isAuthenticated: !!auth.currentUser
          });
          await this.addToHealthServices(newUser, data);
          console.log('✅ Serviço registrado e ativo em healthServices!');
        } catch (error) {
          console.error('❌ Erro ao registrar serviço:', {
            error: error,
            errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
            userId: newUser.id,
            userType: data.userType
          });
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
   * Resend email verification
   */
  static async resendEmailVerification(): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      if (currentUser.emailVerified) {
        return { success: false, error: 'Email já foi verificado' };
      }

      await sendEmailVerification(currentUser);
      return { success: true };
    } catch (error: any) {
      console.error('Resend email verification error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Check if current user's email is verified
   */
  static async checkEmailVerification(): Promise<{ success: boolean; isVerified: boolean; error?: string }> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, isVerified: false, error: 'Usuário não autenticado' };
      }

      // Reload user to get latest verification status
      await currentUser.reload();
      
      const isVerified = currentUser.emailVerified;

      // Update Firestore if email was verified
      if (isVerified) {
        try {
          await updateDoc(doc(db, 'users', currentUser.uid), {
            emailVerified: true,
            updatedAt: serverTimestamp()
          });
        } catch (updateError) {
          console.warn('Error updating email verification status in Firestore:', updateError);
          // Don't fail the whole operation if Firestore update fails
        }
      }

      return { success: true, isVerified };
    } catch (error: any) {
      console.error('Check email verification error:', error);
      return {
        success: false,
        isVerified: false,
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
      
      // Se for profissional ou instituição, atualizar também em healthServices
      if (cleanUpdates.professionalInfo || cleanUpdates.institutionInfo) {
        await this.updateHealthService(userId, cleanUpdates);
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
   * Update health service data when user profile is updated
   */
  static async updateHealthService(userId: string, updates: any): Promise<void> {
    try {
      console.log('🏥 Atualizando dados do serviço de saúde para usuário:', userId);
      console.log('📝 Updates recebidos:', JSON.stringify(updates, null, 2));
      
      // Verificar se o serviço existe em healthServices
      const serviceRef = doc(db, 'healthServices', userId);
      const serviceDoc = await getDoc(serviceRef);
      
      if (!serviceDoc.exists()) {
        console.log('⚠️ Serviço não encontrado em healthServices, pulando atualização');
        return;
      }
      
      const serviceUpdates: any = {
        updatedAt: serverTimestamp()
      };
      
      // Atualizar campos básicos
      if (updates.name) {
        serviceUpdates.name = updates.name;
      }
      if (updates.phone) {
        serviceUpdates.contactPhone = updates.phone;
      }
      
      // Atualizar campos específicos de profissionais
      if (updates.professionalInfo) {
        const prof = updates.professionalInfo;
        if (prof.specialty) serviceUpdates.specialty = prof.specialty;
        if (prof.bio) serviceUpdates.description = prof.bio;
        if (prof.address) serviceUpdates.address = prof.address;
        if (prof.coordinates) serviceUpdates.coordinates = prof.coordinates;
        if (prof.workingHours) serviceUpdates.workingHours = prof.workingHours;
        if (prof.acceptsInsurance !== undefined) serviceUpdates.acceptsInsurance = prof.acceptsInsurance;
        if (prof.services) serviceUpdates.services = prof.services;
      }
      
      // Atualizar campos específicos de instituições
      if (updates.institutionInfo) {
        const inst = updates.institutionInfo;
        if (inst.type) {
          serviceUpdates.type = inst.type; // Campo 'type' correto
        }
        if (inst.description) serviceUpdates.description = inst.description;
        if (inst.address && inst.address.street) {
          // Converter objeto address para string
          const addressParts = [
            inst.address.street,
            inst.address.city,
            inst.address.state
          ].filter(Boolean);
          serviceUpdates.address = addressParts.join(', ');
        }
        if (inst.address && inst.address.city) serviceUpdates.city = inst.address.city;
        if (inst.address && inst.address.state) serviceUpdates.province = inst.address.state;
        if (inst.coordinates) {
          serviceUpdates.coordinates = inst.coordinates; // Campo 'coordinates' correto
        }
        if (inst.workingHours) serviceUpdates.workingHours = inst.workingHours;
        if (inst.acceptsInsurance !== undefined) serviceUpdates.acceptsInsurance = inst.acceptsInsurance;
        if (inst.emergencyService !== undefined) serviceUpdates.emergencyService = inst.emergencyService;
        if (inst.services) serviceUpdates.services = inst.services;
      }
      
      console.log('🔄 Atualizando healthServices com:', JSON.stringify(serviceUpdates, null, 2));
      await updateDoc(serviceRef, serviceUpdates);
      
      console.log('✅ Dados do serviço de saúde atualizados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar serviço de saúde:', error);
      // Não fazer throw do erro para não quebrar a atualização do perfil
    }
  }

  /**
   * Add professional/institution to healthServices (active and verified)
   * Registro direto em healthServices com status ativo
   */
  static async addToHealthServices(user: any, data: RegisterData): Promise<void> {
    try {
      // Verificar se o usuário está autenticado
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn('⚠️ Usuário não autenticado ao criar serviço. Tentando novamente...');
        // Aguardar um momento para a autenticação se completar
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const retryUser = auth.currentUser;
        if (!retryUser) {
          throw new Error('Usuário não autenticado para criar serviço');
        }
      }
      
      const professionalInfo = data.professionalInfo || {};
      const institutionInfo = data.institutionInfo || {};
      
      const serviceData = {
        // Informações do serviço
        name: institutionInfo.name || professionalInfo.name || data.name,
        type: data.userType === UserType.PROFESSIONAL ? 'professional' : (institutionInfo.type || 'clinic'),
        serviceType: data.userType === UserType.PROFESSIONAL ? 'professional' : 'institution',
        specialty: professionalInfo.specialty || institutionInfo.specialty || 'Geral',
        description: professionalInfo.description || institutionInfo.description || '',
        
        // Localização
        address: professionalInfo.address || institutionInfo.address || '',
        city: professionalInfo.city || institutionInfo.city || 'Luanda',
        province: professionalInfo.province || institutionInfo.province || 'Luanda',
        coordinates: professionalInfo.coordinates || institutionInfo.coordinates || { 
          latitude: -8.8383, 
          longitude: 13.2344 
        },
        
        // Contato
        contactEmail: data.email,
        contactPhone: data.phone || professionalInfo.phone || institutionInfo.phone || '',
        
        // Metadata de registro - ATIVO E VERIFICADO
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active', // Status ativo imediatamente
        verified: true, // Verificado automaticamente
        isActive: true,
        
        // Informações de avaliação
        rating: 0,
        reviewCount: 0,
        totalReviews: 0,
        
        // Informações adicionais
        userType: data.userType,
        userId: user.id, // Referência ao usuário
        
        // Serviços oferecidos (para instituições)
        services: data.userType === UserType.INSTITUTION ? 
          (data.institutionInfo?.services || []) : 
          [professionalInfo.specialty || 'Consulta Geral'],
        
        // Horários de funcionamento
        workingHours: professionalInfo.workingHours || institutionInfo.workingHours || {
          monday: { start: '08:00', end: '17:00', available: true },
          tuesday: { start: '08:00', end: '17:00', available: true },
          wednesday: { start: '08:00', end: '17:00', available: true },
          thursday: { start: '08:00', end: '17:00', available: true },
          friday: { start: '08:00', end: '17:00', available: true },
          saturday: { start: '08:00', end: '12:00', available: false },
          sunday: { start: '00:00', end: '00:00', available: false }
        },
        
        // Informações de seguro e emergência
        acceptsInsurance: professionalInfo.acceptsInsurance || institutionInfo.acceptsInsurance || false,
        emergencyService: institutionInfo.emergencyService || false,
      };

      // Criar documento em healthServices com ID do usuário
      const serviceRef = doc(db, 'healthServices', user.id);
      
      console.log('💾 Tentando salvar em healthServices:', {
        userId: user.id,
        serviceName: serviceData.name,
        status: serviceData.status,
        verified: serviceData.verified,
        currentUser: auth.currentUser?.uid
      });
      
      await setDoc(serviceRef, serviceData);

      console.log('✅ Serviço registrado em healthServices:', user.id);
    } catch (error) {
      console.error('❌ Erro ao adicionar a healthServices:', {
        error: error,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
        errorCode: (error as any)?.code,
        userId: user.id,
        currentUser: auth.currentUser?.uid
      });
      throw error;
    }
  }

  /**
   * Convert Firebase error codes to user-friendly messages
   */
  private static getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'User not found';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'This email is already in use';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters';
      case 'auth/invalid-email':
        return 'Invalid email';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Connection error. Check your internet';
      default:
        return 'Authentication error. Please try again';
    }
  }
}