import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  AuthCredentials, 
  RegisterData, 
  AuthResponse, 
  ResetPasswordData, 
  ChangePasswordData,
  UserPreferences,
  UserType,
  NormalUser,
  Professional,
  Institution
} from '../types';

// Storage keys
const AUTH_TOKEN_KEY = '@health_app:auth_token';
const REFRESH_TOKEN_KEY = '@health_app:refresh_token';
const USER_DATA_KEY = '@health_app:user_data';
const REGISTERED_USERS_KEY = '@health_app:registered_users';
const REGISTERED_SERVICES_KEY = '@health_app:registered_services';

export class AuthService {
  private static baseURL = 'https://api.health-app.ao'; // Placeholder para API real
  
  /**
   * Registrar novo usuário
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validar dados de entrada
      this.validateRegisterData(data);
      
      // Verificar se o email já está em uso
      const existingUser = await this.findRegisteredUserByEmail(data.email);
      if (existingUser) {
        throw new Error('Este email já está em uso');
      }
      
      // Criar novo usuário
      const newUser = this.createMockUser(data);
      
      // Salvar usuário na base de dados local
      await this.saveRegisteredUser(newUser, data.password);
      
      // Se for profissional ou instituição, adicionar aos serviços de saúde
      if (data.userType === UserType.PROFESSIONAL || data.userType === UserType.INSTITUTION) {
        await this.addToHealthServices(newUser, data);
      }
      
      // Simular chamada de API
      const mockResponse = await this.simulateApiCall<AuthResponse>({
        user: newUser,
        token: this.generateMockToken(),
        refreshToken: this.generateMockToken(),
      });
      
      // Salvar tokens e dados do usuário
      await this.saveAuthData(mockResponse);
      
      return mockResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao registrar usuário';
      console.error('🚨 ERRO NO REGISTRO - Detalhes:', {
        email: data.email,
        userType: data.userType,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error(errorMessage);
    }
  }
  
  /**
   * Fazer login
   */
  static async login(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      // Validar credenciais
      this.validateCredentials(credentials);
      
      // Verificar se o usuário existe na base de dados local
      const registeredUser = await this.findRegisteredUser(credentials.email, credentials.password);
      
      if (!registeredUser) {
        throw new Error('Email ou senha incorretos');
      }
      
      // Simular chamada de API
      const mockResponse = await this.simulateApiCall<AuthResponse>({
        user: registeredUser,
        token: this.generateMockToken(),
        refreshToken: this.generateMockToken(),
      });
      
      // Salvar tokens e dados do usuário
      await this.saveAuthData(mockResponse);
      
      return mockResponse;
    } catch (error) {
      console.error('Erro no login:', error);
      throw new Error(error instanceof Error ? error.message : 'Email ou senha incorretos');
    }
  }
  
  /**
   * Fazer logout
   */
  static async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        AUTH_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_DATA_KEY,
      ]);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  }
  
  /**
   * Obter usuário atual do storage
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
  }
  
  /**
   * Obter token de autenticação
   */
  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  }
  
  /**
   * Verificar se o usuário está autenticado
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      const user = await this.getCurrentUser();
      return !!(token && user);
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Atualizar perfil do usuário
   */
  static async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }
      
      const updatedUser: any = {
        ...currentUser,
        ...userData,
        id: currentUser.id, // Manter ID original
        updatedAt: new Date(),
      };
      
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw new Error('Erro ao atualizar perfil');
    }
  }
  
  /**
   * Atualizar preferências do usuário
   */
  static async updatePreferences(preferences: Partial<UserPreferences>): Promise<User> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }
      
      const updatedUser: any = {
        ...currentUser,
        preferences: {
          ...currentUser.preferences,
          ...preferences,
        },
        updatedAt: new Date(),
      };
      
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      throw new Error('Erro ao atualizar preferências');
    }
  }
  
  /**
   * Solicitar reset de senha
   */
  static async requestPasswordReset(data: ResetPasswordData): Promise<void> {
    try {
      // Simular chamada de API
      await this.simulateApiCall<void>(undefined, 1000);
      console.log('Email de reset enviado para:', data.email);
    } catch (error) {
      console.error('Erro ao solicitar reset:', error);
      throw new Error('Erro ao enviar email de recuperação');
    }
  }
  
  /**
   * Alterar senha
   */
  static async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      if (data.newPassword !== data.confirmPassword) {
        throw new Error('As senhas não coincidem');
      }
      
      if (data.newPassword.length < 6) {
        throw new Error('A nova senha deve ter pelo menos 6 caracteres');
      }
      
      // Simular chamada de API
      await this.simulateApiCall<void>(undefined, 1000);
      console.log('Senha alterada com sucesso');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      throw new Error(error instanceof Error ? error.message : 'Erro ao alterar senha');
    }
  }
  
  // Métodos privados auxiliares
  
  private static validateRegisterData(data: RegisterData): void {
    if (!data.name.trim()) {
      throw new Error('Nome é obrigatório');
    }
    
    if (!this.isValidEmail(data.email)) {
      throw new Error('Email inválido - verifique o formato (exemplo@dominio.com)');
    }
    
    if (data.password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }
    
    if (data.phone && !this.isValidAngolanPhone(data.phone)) {
      throw new Error('Número de telefone inválido - use o formato angolano (+244 9XX XXX XXX)');
    }
    
    if (!data.acceptTerms) {
      throw new Error('É necessário aceitar os termos de uso para continuar');
    }
    
    // Validações específicas por tipo de usuário
    if (data.userType === UserType.PROFESSIONAL) {
      if (!data.professionalInfo?.specialty) {
        throw new Error('Especialidade é obrigatória para profissionais de saúde');
      }
      if (!data.professionalInfo?.license) {
        throw new Error('Número da licença profissional é obrigatório');
      }
    }
    
    if (data.userType === UserType.INSTITUTION) {
      if (!data.institutionInfo?.type) {
        throw new Error('Tipo de instituição é obrigatório');
      }
      if (!data.institutionInfo?.address?.street) {
        throw new Error('Endereço da instituição é obrigatório');
      }
      if (!data.institutionInfo?.address?.city) {
        throw new Error('Cidade da instituição é obrigatória');
      }
    }
  }
  
  private static validateCredentials(credentials: AuthCredentials): void {
    if (!this.isValidEmail(credentials.email)) {
      throw new Error('Email inválido');
    }
    
    if (!credentials.password) {
      throw new Error('Senha é obrigatória');
    }
  }
  
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidAngolanPhone(phone: string): boolean {
    // Formato angolano: +244 9xx xxx xxx ou 9xx xxx xxx
    const phoneRegex = /^(\+244\s?)?9[0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
  
  private static async saveAuthData(authResponse: AuthResponse): Promise<void> {
    await AsyncStorage.multiSet([
      [AUTH_TOKEN_KEY, authResponse.token],
      [REFRESH_TOKEN_KEY, authResponse.refreshToken],
      [USER_DATA_KEY, JSON.stringify(authResponse.user)],
    ]);
  }
  
  private static createMockUser(data: RegisterData): User {
    const defaultPreferences: UserPreferences = {
      language: 'pt',
      notifications: {
        enabled: true,
        serviceReminders: true,
        healthTips: true,
        emergencyAlerts: true,
      },
      favorites: {
        services: [],
        locations: [],
      },
      privacy: {
        shareLocation: true,
        publicProfile: false,
      },
    };
    
    return {
      id: this.generateId(),
      email: data.email,
      name: data.name,
      phone: data.phone,
      userType: data.userType,
      preferences: defaultPreferences,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
  }
  

  
  private static generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private static generateMockToken(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }
  
  private static async simulateApiCall<T>(data: T, delay = 500): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, delay));
    return data;
  }

  // Métodos para gerenciar usuários registrados
  private static async saveRegisteredUser(user: User, password: string): Promise<void> {
    try {
      const registeredUsersJson = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
      const registeredUsers = registeredUsersJson ? JSON.parse(registeredUsersJson) : [];
      
      registeredUsers.push({
        ...user,
        password: password // Em produção, a senha deveria ser hasheada
      });
      
      await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
    } catch (error) {
      console.error('Erro ao salvar usuário registrado:', error);
    }
  }

  private static async findRegisteredUser(email: string, password: string): Promise<User | null> {
    try {
      const registeredUsersJson = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
      const registeredUsers = registeredUsersJson ? JSON.parse(registeredUsersJson) : [];
      
      const user = registeredUsers.find(
        (user: any) => user.email === email && user.password === password
      );
      
      if (user) {
        // Remover a senha antes de retornar
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário registrado:', error);
      return null;
    }
  }

  private static async findRegisteredUserByEmail(email: string): Promise<User | null> {
    try {
      const registeredUsersJson = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
      const registeredUsers = registeredUsersJson ? JSON.parse(registeredUsersJson) : [];
      
      const user = registeredUsers.find((user: any) => user.email === email);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      return null;
    }
  }

  private static async addToHealthServices(user: User, data: RegisterData): Promise<void> {
    try {
      console.log('💾 Adicionando usuário aos serviços de saúde:', user.name, data.userType);
      const servicesJson = await AsyncStorage.getItem(REGISTERED_SERVICES_KEY);
      const services = servicesJson ? JSON.parse(servicesJson) : [];
      console.log('📊 Serviços existentes:', services.length);
      
      let newService;
      
      if (data.userType === UserType.PROFESSIONAL) {
        newService = {
          id: user.id,
          name: `Dr(a). ${user.name}`,
          type: 'professional',
          address: data.professionalInfo?.address || 'Endereço não informado',
          city: 'Luanda', // Default
          state: 'Luanda', // Default
          country: 'Angola',
          coordinates: data.professionalInfo?.coordinates || {
            latitude: -8.8379 + (Math.random() - 0.5) * 0.1,
            longitude: 13.2894 + (Math.random() - 0.5) * 0.1
          },
          phone: user.phone || 'Não informado',
          description: data.professionalInfo?.description || `Especialista em ${data.professionalInfo?.specialty}`,
          rating: 5.0,
          services: data.professionalInfo?.services || [data.professionalInfo?.specialty],
          specialty: data.professionalInfo?.specialty,
          license: data.professionalInfo?.license,
          experience: data.professionalInfo?.experience || 0
        };
      } else if (data.userType === UserType.INSTITUTION) {
        newService = {
          id: user.id,
          name: user.name,
          type: data.institutionInfo?.type || 'clinic',
          address: `${data.institutionInfo?.address?.street}, ${data.institutionInfo?.address?.city}`,
          city: data.institutionInfo?.address?.city || 'Luanda',
          state: data.institutionInfo?.address?.state || 'Luanda',
          country: 'Angola',
          coordinates: data.institutionInfo?.coordinates || {
            latitude: -8.8379 + (Math.random() - 0.5) * 0.1,
            longitude: 13.2894 + (Math.random() - 0.5) * 0.1
          },
          phone: user.phone || 'Não informado',
          description: data.institutionInfo?.description || 'Instituição de saúde',
          rating: 5.0,
          services: data.institutionInfo?.services || ['Consultas'],
          institutionType: data.institutionInfo?.type
        };
      }
      
      if (newService) {
        console.log('✅ Novo serviço criado:', newService.name, newService.type);
        services.push(newService);
        await AsyncStorage.setItem(REGISTERED_SERVICES_KEY, JSON.stringify(services));
        console.log('💾 Serviço salvo! Total de serviços registrados:', services.length);
        
        // Forçar recarregamento dos serviços
        console.log('🔄 Forçando recarregamento dos serviços...');
        await this.forceRefreshServices();
        
        // Debug: listar todos os serviços após registro
        await this.debugAllServices();
      } else {
        console.log('❌ Erro: newService é null');
      }
    } catch (error) {
      console.error('Erro ao adicionar aos serviços de saúde:', error);
    }
  }

  // Método para forçar recarregamento dos serviços
  private static async forceRefreshServices(): Promise<void> {
    try {
      console.log('🔄 Forçando refresh dos serviços via HealthServiceAPI...');
      // Importar dinamicamente para evitar dependência circular
      const { HealthServiceAPI } = require('./api');
      await HealthServiceAPI.refreshServices();
      console.log('✅ Serviços recarregados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao recarregar serviços:', error);
      // Fallback para o método antigo
      this.clearServicesCache();
    }
  }

  // Método para debug - listar todos os serviços
  private static async debugAllServices(): Promise<void> {
    try {
      // Importar dinamicamente para evitar dependência circular
      const { HealthServiceAPI } = require('./api');
      await HealthServiceAPI.debugListAllServices();
    } catch (error) {
      console.error('❌ Erro ao executar debug dos serviços:', error);
    }
  }

  // Método para limpar cache de serviços (fallback)
  private static clearServicesCache(): void {
    try {
      console.log('🧹 Iniciando limpeza de cache...');
      // Importar dinamicamente para evitar dependência circular
      const { serviceCache } = require('./cache');
      
      // Verificar cache antes da limpeza
      const cachedServices = serviceCache.get('all_services');
      console.log('📋 Serviços em cache antes da limpeza:', cachedServices ? cachedServices.length : 'nenhum');
      
      // Limpar cache específico
      serviceCache.remove('all_services');
      console.log('✅ Cache "all_services" removido');
      
      // Limpar outros caches relacionados
      serviceCache.clear();
      console.log('✅ Todo o cache limpo');
      
      // Verificar se foi realmente limpo
      const afterClear = serviceCache.get('all_services');
      console.log('📋 Serviços em cache após limpeza:', afterClear ? 'AINDA TEM CACHE' : 'cache limpo com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
    }
  }
}