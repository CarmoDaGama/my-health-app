import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { 
  User, 
  AuthState, 
  AuthCredentials, 
  RegisterData, 
  ResetPasswordData,
  ChangePasswordData,
  UserPreferences
} from '../types';
import { AuthService } from '../services/auth';

// Contexto de autenticação
interface AuthContextType extends AuthState {
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  requestPasswordReset: (data: ResetPasswordData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider de autenticação
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isGuest: false,
    user: null,
    token: null,
    refreshToken: null,
    isLoading: true,
    error: null,
  });

  // Verificar autenticação inicial
  useEffect(() => {
    checkInitialAuth();
  }, []);

  const checkInitialAuth = async () => {
    try {
      console.log('🔄 Iniciando verificação de autenticação...');
      
      // Garantir que o splash seja mostrado por pelo menos 2 segundos
      const [authResult] = await Promise.all([
        // Verificar autenticação (que já inclui user e token)
        AuthService.isAuthenticated(),
        // Timeout mínimo para mostrar splash
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);

      console.log('🔐 Resultado da autenticação:', authResult);

      const [user, token] = await Promise.all([
        AuthService.getCurrentUser(),
        AuthService.getToken(),
      ]);

      console.log('👤 Usuário obtido:', user ? 'Sim' : 'Não');
      console.log('🎫 Token obtido:', token ? 'Sim' : 'Não');

      setAuthState(prev => ({
        ...prev,
        isAuthenticated: authResult,
        user,
        token,
        isLoading: false,
      }));

      console.log('✅ Estado de autenticação atualizado - isLoading: false');
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
      // Ainda aguardar o timeout mínimo mesmo com erro
      setTimeout(() => {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Erro ao verificar autenticação',
        }));
        console.log('⚠️ Estado de erro definido - isLoading: false');
      }, 2000);
    }
  };

  const login = async (credentials: AuthCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await AuthService.login(credentials);
      
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no login';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await AuthService.register(data);
      
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no registro';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      await AuthService.logout();
      
      setAuthState({
        isAuthenticated: false,
        isGuest: false,
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo com erro, limpa o estado
      setAuthState({
        isAuthenticated: false,
        isGuest: false,
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false,
        error: 'Erro no logout',
      });
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const updatedUser = await AuthService.updateProfile(userData);
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar perfil';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const updatePreferences = async (preferences: Partial<UserPreferences>) => {
    try {
      const updatedUser = await AuthService.updatePreferences(preferences);
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar preferências';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const requestPasswordReset = async (data: ResetPasswordData) => {
    try {
      await AuthService.requestPasswordReset(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao solicitar reset';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const changePassword = async (data: ChangePasswordData) => {
    try {
      await AuthService.changePassword(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar senha';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setAuthState(prev => ({
        ...prev,
        user,
        error: null,
      }));
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  };

  const continueAsGuest = () => {
    setAuthState(prev => ({
      ...prev,
      isAuthenticated: false,
      isGuest: true,
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,
    }));
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    continueAsGuest,
    updateProfile,
    updatePreferences,
    requestPasswordReset,
    changePassword,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar autenticação
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

// Hook específico para dados do usuário
export const useUser = () => {
  const { user, updateProfile, updatePreferences, refreshUser } = useAuth();
  
  return {
    user,
    updateProfile,
    updatePreferences,
    refreshUser,
    isLoggedIn: !!user,
  };
};

// Hook para verificar se o usuário tem permissão específica
export const usePermissions = () => {
  const { user } = useAuth();
  
  const canAccessFeature = (feature: string): boolean => {
    // Implementar lógica de permissões conforme necessário
    return !!user;
  };
  
  const canEditProfile = (): boolean => {
    return !!user;
  };
  
  const canViewMedicalData = (): boolean => {
    return !!user && user.preferences.privacy.shareLocation;
  };
  
  return {
    canAccessFeature,
    canEditProfile,
    canViewMedicalData,
  };
};