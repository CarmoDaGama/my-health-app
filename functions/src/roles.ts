import {onCall, HttpsError} from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

const db = admin.firestore();
const authAdmin = admin.auth();

/**
 * Define role de admin para um usuário
 * Apenas super admins podem executar
 */
export const setAdminRole = onCall(async (request) => {
  // Verificar autenticação
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'Usuário deve estar autenticado'
    );
  }

  // Verificar se o usuário é super admin
  const callerToken = request.auth.token;
  if (!callerToken.role || callerToken.role !== 'super_admin') {
    throw new HttpsError(
      'permission-denied',
      'Apenas super admins podem atribuir roles'
    );
  }

  const {userId, role} = request.data;

  // Validar parâmetros
  const validRoles = ['admin', 'moderator', 'analytics_viewer', 'super_admin'];
  if (!userId || !role || !validRoles.includes(role)) {
    throw new HttpsError(
      'invalid-argument',
      'userId e role válido são obrigatórios'
    );
  }

  try {
    // Definir Custom Claims
    await authAdmin.setCustomUserClaims(userId, {
      role: role,
      isAdmin: true,
      assignedAt: Date.now(),
      assignedBy: request.auth.uid,
    });

    // Registrar no Firestore
    await db.collection('adminRoles').doc(userId).set({
      userId,
      role,
      isAdmin: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      assignedBy: request.auth.uid,
      assignedByEmail: request.auth.token.email,
    });

    // Log da ação
    await logAdminAction(
      request.auth.uid,
      'SET_ADMIN_ROLE',
      {targetUserId: userId, role}
    );

    return {
      success: true,
      message: `Role ${role} atribuída ao usuário ${userId}`,
    };
  } catch (error: any) {
    console.error('Erro ao definir role de admin:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Remove role de admin de um usuário
 * Apenas super admins podem executar
 */
export const removeAdminRole = onCall(async (request) => {
  // Verificar autenticação
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Usuário deve estar autenticado');
  }

  // Verificar permissão
  const callerToken = request.auth.token;
  if (!callerToken.role || callerToken.role !== 'super_admin') {
    throw new HttpsError('permission-denied', 'Apenas super admins podem remover roles');
  }

  const {userId} = request.data;

  if (!userId) {
    throw new HttpsError('invalid-argument', 'userId é obrigatório');
  }

  try {
    // Verificar se o usuário existe e remover Custom Claims
    await authAdmin.getUser(userId);
    await authAdmin.setCustomUserClaims(userId, null);

    // Remover do Firestore
    await db.collection('adminRoles').doc(userId).delete();

    // Log da ação
    await logAdminAction(request.auth.uid, 'REMOVE_ADMIN_ROLE', {targetUserId: userId});

    return {success: true, message: `Role de admin removida do usuário ${userId}`};
  } catch (error: any) {
    console.error('Erro ao remover role de admin:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Lista todos os administradores
 * Admins podem visualizar
 */
export const listAdmins = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Usuário deve estar autenticado');
  }

  const callerToken = request.auth.token;
  if (!callerToken.isAdmin) {
    throw new HttpsError('permission-denied', 'Sem permissão');
  }

  try {
    const adminsSnapshot = await db.collection('adminRoles').get();

    const admins = await Promise.all(
      adminsSnapshot.docs.map(async (doc) => {
        const adminData = doc.data();
        try {
          const userRecord = await authAdmin.getUser(adminData.userId);
          return {
            userId: adminData.userId,
            email: userRecord.email,
            role: adminData.role,
            createdAt: adminData.createdAt,
            assignedBy: adminData.assignedBy,
          };
        } catch (error) {
          console.error(`Erro ao buscar usuário ${adminData.userId}:`, error);
          return null;
        }
      })
    );

    return {
      success: true,
      admins: admins.filter((admin) => admin !== null),
    };
  } catch (error: any) {
    console.error('Erro ao listar admins:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Helper para registrar ações administrativas
 */
async function logAdminAction(
  adminId: string,
  action: string,
  details: any
): Promise<void> {
  try {
    const adminRecord = await authAdmin.getUser(adminId);

    await db.collection('adminLogs').add({
      adminId,
      adminEmail: adminRecord.email,
      action,
      details,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ip: null, // Você pode adicionar context.rawRequest.ip no v2
    });
  } catch (error) {
    console.error('Erro ao registrar log de admin:', error);
  }
}
