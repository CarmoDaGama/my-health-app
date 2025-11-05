import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { AuthServiceFirebase } from '../services/auth-firebase';
import { AuthCredentials, RegisterData, UserProfile, UserType } from '../types';
import { getUserLanguagePreference } from '../utils/i18n';
import { normalizePreferences, normalizeCoordinates, debugUserData } from '../utils/userDataNormalizers';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  isLoading: boolean; // Alias para compatibilidade
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (credentials: AuthCredentials) => Promise<{ success: boolean; error?: string; needsEmailVerification?: boolean }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string; needsEmailVerification?: boolean }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendEmailVerification: () => Promise<{ success: boolean; error?: string }>;
  checkEmailVerification: () => Promise<{ success: boolean; isVerified: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => Promise<{ success: boolean; error?: string }>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 Auth state changed:', firebaseUser ? 'User logged in' : 'No user');
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          console.log('🔥 Buscando dados do usuário no Firestore:', firebaseUser.uid);
          const userData = await AuthServiceFirebase.getUserData(firebaseUser.uid);
          console.log('📊 Dados RAW do Firestore:', JSON.stringify(userData, null, 2));
          
          if (userData) {
            const defaultPreferences = {
              language: 'en',
              notifications: {
                enabled: true,
                serviceReminders: true,
                healthTips: true,
                emergencyAlerts: true,
              },
              favorites: { services: [], locations: [] },
              privacy: { shareLocation: true, publicProfile: false }
            };
            
            const mergedPreferences = {
              ...defaultPreferences,
              ...userData.preferences,
              notifications: {
                ...defaultPreferences.notifications,
                ...userData.preferences?.notifications,
              },
              favorites: {
                ...defaultPreferences.favorites,
                ...userData.preferences?.favorites,
              },
              privacy: {
                ...defaultPreferences.privacy,
                ...userData.preferences?.privacy,
              }
            };
            
            // Criar objeto de usuário completo com todos os campos necessários
            console.log('🔧 Construindo objeto completo do usuário...');
            console.log('👤 UserType detectado:', userData.userType);
            console.log('📋 Campos específicos disponíveis:', {
              normalUser: userData.userType === UserType.NORMAL_USER ? {
                dateOfBirth: userData.dateOfBirth,
                gender: userData.gender,
                address: userData.address,
                emergencyContact: userData.emergencyContact
              } : 'N/A',
              professional: userData.userType === UserType.PROFESSIONAL ? {
                professionalInfo: userData.professionalInfo
              } : 'N/A',
              institution: userData.userType === UserType.INSTITUTION ? {
                institutionInfo: userData.institutionInfo
              } : 'N/A'
            });
            
            // Construir objeto base comum
            const baseUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: userData.name || firebaseUser.displayName || '',
              phone: userData.phone || '',
              avatar: userData.avatar,
              userType: userData.userType || UserType.NORMAL_USER,
              isActive: userData.isActive !== false,
              isVerified: userData.isVerified,
              createdAt: userData.createdAt,
              updatedAt: userData.updatedAt,
              preferences: mergedPreferences
            };
            
            // Adicionar campos específicos por tipo, PRESERVANDO dados existentes
            let completeUser: any = { ...baseUser };
            
            if (userData.userType === UserType.NORMAL_USER) {
              completeUser.favoriteInstitutions = userData.favoriteInstitutions || [];
              completeUser.searchHistory = userData.searchHistory || [];
              completeUser.dateOfBirth = userData.dateOfBirth;
              completeUser.gender = userData.gender;
              completeUser.address = userData.address;
              completeUser.emergencyContact = userData.emergencyContact;
            } else if (userData.userType === UserType.PROFESSIONAL) {
              completeUser.professionalInfo = userData.professionalInfo; // PRESERVAR dados existentes
              completeUser.institutionId = userData.institutionId;
              completeUser.favoriteInstitutions = userData.favoriteInstitutions || [];
            } else if (userData.userType === UserType.INSTITUTION) {
              completeUser.institutionInfo = userData.institutionInfo; // PRESERVAR dados existentes
              completeUser.professionals = userData.professionals || [];
            }
            
            console.log('✅ Objeto completo criado:', JSON.stringify(completeUser, null, 2));
            
            setUser(completeUser as any);
            setIsGuestMode(false); // Reset guest mode when user is authenticated
          } else {
            // User exists in Firebase Auth but not in Firestore
            console.warn('⚠️ Usuário Firebase sem dados no Firestore');
            setUser(null);
          }
        } catch (error) {
          console.error('❌ Erro ao buscar dados do usuário:', error);
          setUser(null);
        }
      } else {
        console.log('🚪 Usuário não autenticado');
        setUser(null);
      }
      
      console.log('✅ Auth loading completed, setting loading = false');
      setLoading(false);
    });

    // Safety timeout to ensure loading never stays true forever
    const safetyTimeout = setTimeout(() => {
      console.log('⏰ Safety timeout: forçando loading = false');
      setLoading(false);
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const login = async (credentials: AuthCredentials) => {
    try {
      setLoading(true);
      const response = await AuthServiceFirebase.login(credentials);
      
      if (response.success && response.user) {
        setUser(response.user);
        setIsGuestMode(false); // Reset guest mode when user successfully logs in
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Erro no login' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erro no login' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      const response = await AuthServiceFirebase.register(data);
      
      if (response.success && response.user) {
        setUser(response.user);
        setIsGuestMode(false); // Reset guest mode when user successfully registers
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Erro no registro' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Erro no registro' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const response = await AuthServiceFirebase.logout();
      
      if (response.success) {
        setUser(null);
        setFirebaseUser(null);
        setIsGuestMode(false);
        
        // Não limpar preferências de idioma no logout
        // O sistema usará detecção automática do sistema operativo
      }
      
      return response;
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Erro no logout' };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await AuthServiceFirebase.forgotPassword(email);
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error: 'Erro ao enviar email de recuperação' };
    }
  };

  const resendEmailVerification = async () => {
    try {
      const response = await AuthServiceFirebase.resendEmailVerification();
      return response;
    } catch (error) {
      console.error('Resend email verification error:', error);
      return { success: false, error: 'Erro ao reenviar email de verificação' };
    }
  };

  const checkEmailVerification = async () => {
    try {
      const response = await AuthServiceFirebase.checkEmailVerification();
      
      // If email was verified, update the user state
      if (response.success && response.isVerified && firebaseUser) {
        try {
          const userData = await AuthServiceFirebase.getUserData(firebaseUser.uid);
          if (userData) {
            setUser(userData as any);
          }
        } catch (error) {
          console.warn('Error updating user data after email verification:', error);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Check email verification error:', error);
      return { success: false, isVerified: false, error: 'Erro ao verificar status do email' };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      console.log('🔄 useAuth.updateProfile - Iniciando atualização para:', user.id);
      console.log('📝 useAuth.updateProfile - Updates recebidos:', JSON.stringify(updates, null, 2));

      const response = await AuthServiceFirebase.updateProfile(user.id, updates);
      
      console.log('📥 useAuth.updateProfile - Resposta do AuthServiceFirebase:', response);
      
      if (response.success) {
        console.log('✅ useAuth.updateProfile - Sucesso! Buscando dados atualizados...');
        // Buscar dados atualizados do Firestore para garantir sincronização completa
        const updatedUserData = await AuthServiceFirebase.getUserData(user.id);
        
        if (updatedUserData) {
          console.log('📊 useAuth.updateProfile - Dados atualizados do Firestore:', JSON.stringify(updatedUserData, null, 2));
          // Usar a função utilitária para normalizar preferences
          const normalizedPreferences = normalizePreferences(updatedUserData.preferences);
          
          // Reconstruir usuário completo com dados atualizados
          const completeUpdatedUser = {
            id: user.id,
            email: updatedUserData.email || user.email,
            name: updatedUserData.name || user.name,
            phone: updatedUserData.phone || '',
            avatar: updatedUserData.avatar,
            userType: updatedUserData.userType || user.userType,
            isActive: updatedUserData.isActive !== false,
            isVerified: updatedUserData.isVerified,
            createdAt: updatedUserData.createdAt || user.createdAt,
            updatedAt: updatedUserData.updatedAt,
            preferences: normalizedPreferences,
            
            // Campos específicos para usuários normais
            ...(updatedUserData.userType === UserType.NORMAL_USER && {
              favoriteInstitutions: updatedUserData.favoriteInstitutions || [],
              searchHistory: updatedUserData.searchHistory || [],
              dateOfBirth: updatedUserData.dateOfBirth,
              gender: updatedUserData.gender,
              address: updatedUserData.address,
              emergencyContact: updatedUserData.emergencyContact
            }),
            
            // Campos específicos para profissionais
            ...(updatedUserData.userType === UserType.PROFESSIONAL && {
              professionalInfo: updatedUserData.professionalInfo || {},
              institutionId: updatedUserData.institutionId,
              favoriteInstitutions: updatedUserData.favoriteInstitutions || []
            }),
            
            // Campos específicos para instituições
            ...(updatedUserData.userType === UserType.INSTITUTION && {
              institutionInfo: updatedUserData.institutionInfo || {},
              professionals: updatedUserData.professionals || []
            })
          };
          
          console.log('✅ useAuth.updateProfile - Atualizando estado local com dados completos');
          setUser(completeUpdatedUser as any);
        } else {
          console.log('⚠️ useAuth.updateProfile - Não foi possível buscar dados atualizados, usando fallback');
          // Fallback: atualizar apenas localmente se não conseguir buscar do Firestore
          setUser(current => current ? { ...current, ...updates } as any : null);
        }
      } else {
        console.error('❌ useAuth.updateProfile - Falha na atualização:', response.error);
      }
      
      return response;
    } catch (error) {
      console.error('❌ useAuth.updateProfile - Exception capturada:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error
      });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao atualizar perfil'
      };
    }
  };

  const updatePreferences = async (preferences: Partial<UserProfile['preferences']>) => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      const updates = { preferences: { ...user.preferences, ...preferences } };
      const response = await AuthServiceFirebase.updateProfile(user.id, updates);
      
      if (response.success) {
        // Update local state
        setUser(current => current ? { ...current, ...updates } : null);
      }
      
      return response;
    } catch (error) {
      console.error('Update preferences error:', error);
      return { success: false, error: 'Erro ao atualizar preferências' };
    }
  };

  const continueAsGuest = () => {
    setIsGuestMode(true);
    setUser({
      id: 'guest',
      email: '',
      name: 'Convidado',
      phone: '',
      userType: UserType.GUEST,
      preferences: {
        language: 'en',
        notifications: {
          enabled: false,
          serviceReminders: false,
          healthTips: false,
          emergencyAlerts: false,
        },
        favorites: { services: [], locations: [] },
        privacy: { shareLocation: false, publicProfile: false }
      }
    } as any);
    setLoading(false);
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    isLoading: loading, // Alias para compatibilidade
    isAuthenticated: !!user && !isGuestMode,
    isGuest: isGuestMode || (user as any)?.userType === UserType.GUEST,
    login,
    register,
    logout,
    forgotPassword,
    resendEmailVerification,
    checkEmailVerification,
    updateProfile,
    updatePreferences,
    continueAsGuest
  };

  // Debug logs
  console.log('🔍 Auth Debug:', {
    hasUser: !!user,
    isGuestMode,
    userType: (user as any)?.userType,
    isAuthenticated: !!user && !isGuestMode,
    isGuest: isGuestMode || (user as any)?.userType === UserType.GUEST
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthFirebase(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthFirebase must be used within an AuthProvider');
  }
  return context;
}

// Backward compatibility hook
export function useAuth() {
  return useAuthFirebase();
}

// Hook específico para dados do usuário
export function useUser() {
  const { user, updateProfile, updatePreferences } = useAuthFirebase();
  
  return {
    user,
    updateProfile,
    updatePreferences,
    isLoggedIn: !!user,
  };
}