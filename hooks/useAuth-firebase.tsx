import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { AuthServiceFirebase } from '../services/auth-firebase';
import { AuthCredentials, RegisterData, UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: AuthCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
          console.warn('User data not found in Firestore');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
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

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    forgotPassword,
    updateProfile
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