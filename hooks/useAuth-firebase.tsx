import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { AuthServiceFirebase } from '../services/auth-firebase';
import { AuthCredentials, RegisterData, UserProfile, UserType } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  isLoading: boolean; // Alias para compatibilidade
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (credentials: AuthCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
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
        // Get user data from Firestore
        const userData = await AuthServiceFirebase.getUserData(firebaseUser.uid);
        if (userData) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: userData.name || firebaseUser.displayName || '',
            phone: userData.phone || '',
            userType: userData.userType || 'patient',
            preferences: userData.preferences || {
              language: 'pt',
              notifications: true,
              favorites: { services: [], locations: [] }
            }
          });
        } else {
          // User exists in Firebase Auth but not in Firestore
          console.warn('⚠️ Usuário Firebase sem dados no Firestore');
          setUser(null);
        }
      } else {
        console.log('🚪 Usuário não autenticado');
        setUser(null);
      }
      
      console.log('✅ Auth loading completed, setting loading = false');
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (credentials: AuthCredentials) => {
    try {
      setLoading(true);
      const response = await AuthServiceFirebase.login(credentials);
      
      if (response.success && response.user) {
        setUser(response.user);
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

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const response = await AuthServiceFirebase.updateProfile(user.id, updates);
      
      if (response.success) {
        // Update local state
        setUser(current => current ? { ...current, ...updates } : null);
      }
      
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Erro ao atualizar perfil' };
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
        language: 'pt',
        notifications: false,
        favorites: { services: [], locations: [] }
      }
    });
    setLoading(false);
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    isLoading: loading, // Alias para compatibilidade
    isAuthenticated: !!user && !isGuestMode,
    isGuest: isGuestMode || (user?.userType === UserType.GUEST),
    login,
    register,
    logout,
    forgotPassword,
    updateProfile,
    updatePreferences,
    continueAsGuest
  };

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