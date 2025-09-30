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
          preferences: userData.preferences
        } as any,
        token
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
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
        preferences: {
          language: 'pt',
          notifications: true,
          favorites: {
            services: [],
            locations: []
          }
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add specific data based on user type
      if (data.userType === UserType.PROFESSIONAL && data.professionalInfo) {
        userData.professionalInfo = data.professionalInfo;
      } else if (data.userType === UserType.INSTITUTION && data.institutionInfo) {
        userData.institutionInfo = data.institutionInfo;
      }
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      // Get token
      const token = await userCredential.user.getIdToken();
      
      const newUser = {
        id: userCredential.user.uid,
        email: data.email,
        name: data.name,
        phone: data.phone,
        userType: data.userType,
        preferences: userData.preferences
      };
      
      // Adicionar aos serviços de saúde se for profissional ou instituição
      if (data.userType === UserType.PROFESSIONAL || data.userType === UserType.INSTITUTION) {
        try {
          console.log('🏥 Adicionando usuário aos serviços de saúde...', data.userType);
          await AuthService.addToHealthServices(newUser, data);
          console.log('✅ Usuário adicionado aos serviços de saúde com sucesso!');
        } catch (error) {
          console.error('❌ Erro ao adicionar aos serviços de saúde:', error);
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
  static async updateProfile(userId: string, updates: Partial<{
    name: string;
    phone: string;
    preferences: any;
  }>): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Update Firebase Auth profile if name changed
      if (updates.name && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: updates.name
        });
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: 'Erro ao atualizar perfil'
      };
    }
  }

  /**
   * Get user data from Firestore
   */
  static async getUserData(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
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