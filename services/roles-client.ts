/**
 * Serviço de Gerenciamento de Roles (Client-Side)
 * 
 * ⚠️ IMPORTANTE: Esta é uma implementação client-side temporária.
 * Para produção, use Cloud Functions para maior segurança.
 * 
 * Funcionalidades:
 * - Atribuir roles administrativas
 * - Remover roles administrativas
 * - Listar administradores
 * - Registrar logs de ações
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';

export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'analytics_viewer';

interface AdminRoleData {
  userId: string;
  role: AdminRole;
  isAdmin: boolean;
  createdAt: any;
  assignedBy: string;
  assignedByEmail: string;
}

export interface AdminInfo {
  userId: string;
  email: string;
  role: AdminRole;
  createdAt: any;
  assignedBy: string;
}

/**
 * Verificar se o usuário atual é admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const token = await user.getIdTokenResult(true);
    return token.claims.isAdmin === true;
  } catch (error) {
    console.error('Erro ao verificar admin:', error);
    return false;
  }
}

/**
 * Verificar se o usuário atual é super admin
 */
export async function isCurrentUserSuperAdmin(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const token = await user.getIdTokenResult(true);
    return token.claims.role === 'super_admin';
  } catch (error) {
    console.error('Erro ao verificar super admin:', error);
    return false;
  }
}

/**
 * Obter role do usuário atual
 */
export async function getCurrentUserRole(): Promise<AdminRole | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const token = await user.getIdTokenResult(true);
    return (token.claims.role as AdminRole) || null;
  } catch (error) {
    console.error('Erro ao obter role:', error);
    return null;
  }
}

/**
 * Atribuir role administrativa a um usuário
 * ⚠️ Requer que o usuário atual seja super admin
 */
export async function setAdminRole(
  userId: string,
  role: AdminRole
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Verificar se o usuário atual é super admin
    const isSuperAdmin = await isCurrentUserSuperAdmin();
    if (!isSuperAdmin) {
      return { success: false, error: 'Apenas super admins podem atribuir roles' };
    }

    // Validar role
    const validRoles: AdminRole[] = ['super_admin', 'admin', 'moderator', 'analytics_viewer'];
    if (!validRoles.includes(role)) {
      return { success: false, error: 'Role inválida' };
    }

    // Verificar se o usuário alvo existe
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    // Criar documento em adminRoles
    const adminRoleData: AdminRoleData = {
      userId,
      role,
      isAdmin: true,
      createdAt: serverTimestamp(),
      assignedBy: user.uid,
      assignedByEmail: user.email || 'unknown',
    };

    await setDoc(doc(db, 'adminRoles', userId), adminRoleData);

    // Atualizar documento do usuário
    await updateDoc(doc(db, 'users', userId), {
      isAdmin: true,
      adminRole: role,
      updatedAt: serverTimestamp(),
    });

    // Registrar log
    await logAdminAction(user.uid, 'SET_ADMIN_ROLE', {
      targetUserId: userId,
      role,
    });

    console.log(`✅ Role ${role} atribuída ao usuário ${userId}`);
    
    return { 
      success: true,
    };
  } catch (error: any) {
    console.error('Erro ao atribuir role:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao atribuir role' 
    };
  }
}

/**
 * Remover role administrativa de um usuário
 * ⚠️ Requer que o usuário atual seja super admin
 */
export async function removeAdminRole(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Verificar se o usuário atual é super admin
    const isSuperAdmin = await isCurrentUserSuperAdmin();
    if (!isSuperAdmin) {
      return { success: false, error: 'Apenas super admins podem remover roles' };
    }

    // Verificar se o usuário alvo existe
    const adminRoleDoc = await getDoc(doc(db, 'adminRoles', userId));
    if (!adminRoleDoc.exists()) {
      return { success: false, error: 'Usuário não tem role administrativa' };
    }

    // Remover documento de adminRoles
    await deleteDoc(doc(db, 'adminRoles', userId));

    // Atualizar documento do usuário
    await updateDoc(doc(db, 'users', userId), {
      isAdmin: false,
      adminRole: null,
      updatedAt: serverTimestamp(),
    });

    // Registrar log
    await logAdminAction(user.uid, 'REMOVE_ADMIN_ROLE', {
      targetUserId: userId,
    });

    console.log(`✅ Role removida do usuário ${userId}`);
    
    return { 
      success: true,
    };
  } catch (error: any) {
    console.error('Erro ao remover role:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao remover role' 
    };
  }
}

/**
 * Listar todos os administradores
 * ⚠️ Requer que o usuário atual seja admin
 */
export async function listAdmins(): Promise<{
  success: boolean;
  admins?: AdminInfo[];
  error?: string;
}> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Verificar se o usuário atual é admin
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return { success: false, error: 'Sem permissão para listar admins' };
    }

    // Buscar todos os documentos em adminRoles
    const adminsQuery = query(
      collection(db, 'adminRoles'),
      where('isAdmin', '==', true)
    );
    
    const snapshot = await getDocs(adminsQuery);
    
    const admins: AdminInfo[] = [];
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data() as AdminRoleData;
      
      // Buscar email do usuário
      let email = 'unknown';
      try {
        const userDoc = await getDoc(doc(db, 'users', data.userId));
        if (userDoc.exists()) {
          email = userDoc.data().email || 'unknown';
        }
      } catch (error) {
        console.error(`Erro ao buscar usuário ${data.userId}:`, error);
      }
      
      admins.push({
        userId: data.userId,
        email,
        role: data.role,
        createdAt: data.createdAt,
        assignedBy: data.assignedBy,
      });
    }

    console.log(`✅ Listados ${admins.length} administradores`);
    
    return { 
      success: true,
      admins,
    };
  } catch (error: any) {
    console.error('Erro ao listar admins:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao listar admins' 
    };
  }
}

/**
 * Obter informações de um admin específico
 */
export async function getAdminInfo(userId: string): Promise<AdminInfo | null> {
  try {
    const adminRoleDoc = await getDoc(doc(db, 'adminRoles', userId));
    
    if (!adminRoleDoc.exists()) {
      return null;
    }

    const data = adminRoleDoc.data() as AdminRoleData;
    
    // Buscar email do usuário
    let email = 'unknown';
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        email = userDoc.data().email || 'unknown';
      }
    } catch (error) {
      console.error(`Erro ao buscar usuário ${userId}:`, error);
    }
    
    return {
      userId: data.userId,
      email,
      role: data.role,
      createdAt: data.createdAt,
      assignedBy: data.assignedBy,
    };
  } catch (error) {
    console.error('Erro ao obter info do admin:', error);
    return null;
  }
}

/**
 * Registrar ação administrativa
 */
async function logAdminAction(
  adminId: string,
  action: string,
  details: any
): Promise<void> {
  try {
    const user = auth.currentUser;
    
    await addDoc(collection(db, 'adminLogs'), {
      adminId,
      adminEmail: user?.email || 'unknown',
      action,
      details,
      timestamp: serverTimestamp(),
    });

    console.log(`📝 Log registrado: ${action}`);
  } catch (error) {
    console.error('Erro ao registrar log:', error);
    // Não lançar erro para não bloquear a operação principal
  }
}

/**
 * Verificar se tem permissão para moderar
 */
export async function canModerate(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === 'super_admin' || role === 'admin' || role === 'moderator';
}

/**
 * Verificar se tem acesso a analytics
 */
export async function canViewAnalytics(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === 'super_admin' || role === 'admin' || role === 'analytics_viewer';
}
