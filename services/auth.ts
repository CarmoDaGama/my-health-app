import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  AuthCredentials, 
  RegisterData, 
  AuthResponse, 
  ResetPasswordData, 
  ChangePasswordData,
  UserPreferences 
} from '../types';

// Storage keys
const AUTH_TOKEN_KEY = '@health_app:auth_token';
const REFRESH_TOKEN_KEY = '@health_app:refresh_token';
const USER_DATA_KEY = '@health_app:user_data';

export class AuthService {
  private static baseURL = 'https://api.health-app.ao'; // Placeholder para API real
  
  /**
   * Registrar novo usuário
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validar dados de entrada
      this.validateRegisterData(data);
      
      // Simular chamada de API (substituir por API real em produção)
      const mockResponse = await this.simulateApiCall<AuthResponse>({
        user: this.createMockUser(data),
        token: this.generateMockToken(),
        refreshToken: this.generateMockToken(),
      });
      
      // Salvar tokens e dados do usuário
      await this.saveAuthData(mockResponse);
      
      return mockResponse;
    } catch (error) {
      console.error('Erro no registro:', error);
      throw new Error(error instanceof Error ? error.message : 'Erro ao registrar usuário');
    }
  }
  
  /**
   * Fazer login
   */
  static async login(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      // Validar credenciais
      this.validateCredentials(credentials);
      
      // Simular chamada de API
      const mockResponse = await this.simulateApiCall<AuthResponse>({
        user: this.createMockUserFromLogin(credentials.email),
        token: this.generateMockToken(),
        refreshToken: this.generateMockToken(),
      });
      
      // Salvar tokens e dados do usuário
      await this.saveAuthData(mockResponse);
      
      return mockResponse;
    } catch (error) {
      console.error('Erro no login:', error);
      throw new Error('Email ou senha incorretos');
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
      
      const updatedUser: User = {
        ...currentUser,
        ...userData,
        id: currentUser.id, // Manter ID original
        updatedAt: new Date().toISOString(),
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
      
      const updatedUser: User = {
        ...currentUser,
        preferences: {
          ...currentUser.preferences,
          ...preferences,
        },
        updatedAt: new Date().toISOString(),
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
      throw new Error('Email inválido');
    }
    
    if (data.password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }
    
    if (!data.acceptTerms) {
      throw new Error('É necessário aceitar os termos de uso');
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
      preferences: defaultPreferences,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  
  private static createMockUserFromLogin(email: string): User {
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
      email,
      name: 'Usuário Teste',
      preferences: defaultPreferences,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
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
}