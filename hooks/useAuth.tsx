import { useState, useEffect, useContext, createContext, ReactNode, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  AnyUser,
  GuestUser,
  UserType,
  AuthState, 
  AuthCredentials, 
  RegisterData, 
  ResetPasswordData,
  ChangePasswordData,
  UserPreferences
} from '../types';
import { AuthService } from '../services/auth';

const USER_DATA_KEY = '@HealthApp:userData';

// Contexto de autenticação
interface AuthContextType extends Omit<AuthState, 'user'> {
  user: AnyUser | null;
  userType: UserType;
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

  // Computed values
  const isAuthenticated = useMemo(() => 
    authState.user !== null && authState.user.userType !== UserType.GUEST, 
    [authState.user]
  );

  const isGuest = useMemo(() => 
    authState.user === null || authState.user.userType === UserType.GUEST, 
    [authState.user]
  );

  const userType = useMemo(() => 
    authState.user?.userType || UserType.GUEST, 
    [authState.user]
  );

  // Verificar autenticação inicial
  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (userData) {
        const user = JSON.parse(userData);
        setAuthState(prev => ({
          ...prev,
          user,
          isLoading: false,
        }));
      } else {
        // Usuário convidado por padrão
        setAuthState(prev => ({
          ...prev,
          user: { userType: UserType.GUEST, id: 'guest' },
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setAuthState(prev => ({
        ...prev,
        user: { userType: UserType.GUEST, id: 'guest' },
        isLoading: false,
        error: 'Erro ao carregar dados',
      }));
    }
  };

  const validateUserTypeData = (userData: RegisterData) => {
    switch (userData.userType) {
      case UserType.PROFESSIONAL:
        if (!userData.professionalInfo?.specialty || !userData.professionalInfo?.license) {
          throw new Error('Especialidade e número da licença são obrigatórios para profissionais');
        }
        break;
      case UserType.INSTITUTION:
        if (!userData.institutionInfo?.type || !userData.institutionInfo?.address) {
          throw new Error('Tipo e endereço são obrigatórios para instituições');
        }
        break;
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
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no login';
      console.error('🚨 ERRO NO HOOK useAuth - Login falhou:', {
        error: errorMessage,
        credentials: {
          email: credentials.email,
          hasPassword: !!credentials.password
        }
      });
      
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
      
      // Validar dados específicos do tipo de usuário
      validateUserTypeData(data);
      
      const response = await AuthService.register(data);
      
      setAuthState(prev => ({
        ...prev,
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
        isLoading: false,
        error: null,
      }));

      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no registro';
      console.error('🚨 ERRO NO HOOK useAuth - Registro falhou:', {
        error: errorMessage,
        userData: {
          email: data.email,
          userType: data.userType,
          hasName: !!data.name,
          hasPhone: !!data.phone
        }
      });
      
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
    const guestUser: GuestUser = { userType: UserType.GUEST, id: 'guest' };
    setAuthState(prev => ({
      ...prev,
      user: guestUser,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,
    }));
  };

  const contextValue: AuthContextType = {
    ...authState,
    isAuthenticated,
    isGuest,
    userType,
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
    return !!user && user.userType !== UserType.GUEST && 'preferences' in user && user.preferences.privacy.shareLocation;
  };
  
  return {
    canAccessFeature,
    canEditProfile,
    canViewMedicalData,
  };
};