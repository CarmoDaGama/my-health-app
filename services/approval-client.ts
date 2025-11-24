/**
 * Serviço de Aprovação de Profissionais (Client-Side)
 * 
 * ⚠️ IMPORTANTE: Esta é uma implementação client-side temporária.
 * Para produção, use Cloud Functions para maior segurança e envio de emails.
 * 
 * Funcionalidades:
 * - Aprovar serviços de profissionais
 * - Rejeitar serviços
 * - Listar serviços pendentes
 * - Mover serviços aprovados para healthServices
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
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { isCurrentUserAdmin } from './roles-client';

export type ServiceStatus = 'pending' | 'approved' | 'rejected';

interface RegisteredService {
  id: string;
  name: string;
  serviceType: string;
  specialty: string;
  description: string;
  address: string;
  city: string;
  province: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  contactEmail: string;
  contactPhone: string;
  createdBy: string;
  createdAt: any;
  status: ServiceStatus;
  verified: boolean;
  processedAt?: any;
  processedBy?: string;
  approvedBy?: string;
  approverEmail?: string;
  approverNotes?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  userType: string;
  professionalInfo?: any;
  institutionInfo?: any;
}

interface ProfessionalInfo {
  email?: string;
  displayName?: string;
  phoneNumber?: string;
}

interface PendingService extends RegisteredService {
  professionalInfo?: ProfessionalInfo;
}

/**
 * Aprovar um serviço de profissional
 * Move de registeredServices para healthServices
 */
export async function approveProfessional(
  serviceId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Verificar se é admin
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return { success: false, error: 'Apenas admins podem aprovar profissionais' };
    }

    // 1. Buscar o serviço em registeredServices
    const serviceRef = doc(db, 'registeredServices', serviceId);
    const serviceDoc = await getDoc(serviceRef);

    if (!serviceDoc.exists()) {
      return { success: false, error: 'Serviço não encontrado' };
    }

    const serviceData = serviceDoc.data() as RegisteredService;

    // Verificar se já foi processado
    if (serviceData.status !== 'pending') {
      return { 
        success: false, 
        error: `Serviço já foi ${serviceData.status === 'approved' ? 'aprovado' : 'rejeitado'}` 
      };
    }

    // 2. Criar documento em healthServices (serviços aprovados)
    const approvedServiceData = {
      ...serviceData,
      verified: true,
      approvedAt: serverTimestamp(),
      approvedBy: user.uid,
      approverEmail: user.email || 'unknown',
      approverNotes: notes || null,
    };

    // Remover campos internos de controle
    delete (approvedServiceData as any).status;
    delete (approvedServiceData as any).rejectedAt;
    delete (approvedServiceData as any).rejectedBy;
    delete (approvedServiceData as any).rejectionReason;

    await setDoc(doc(db, 'healthServices', serviceId), approvedServiceData);

    // 3. Atualizar status em registeredServices
    await updateDoc(serviceRef, {
      status: 'approved',
      processedAt: serverTimestamp(),
      processedBy: user.uid,
      approverNotes: notes || null,
    });

    // 4. Atualizar usuário para verified: true
    if (serviceData.createdBy) {
      try {
        await updateDoc(doc(db, 'users', serviceData.createdBy), {
          verified: true,
          verifiedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
      }
    }

    // 5. Registrar log
    await logAdminAction(user.uid, 'APPROVE_PROFESSIONAL', {
      serviceId,
      serviceName: serviceData.name,
      professionalId: serviceData.createdBy,
      notes,
    });

    console.log(`✅ Serviço ${serviceData.name} aprovado com sucesso`);
    
    // ⚠️ Nota: Emails não são enviados na versão client-side
    // Para enviar emails, é necessário usar Cloud Functions
    
    return { 
      success: true,
    };
  } catch (error: any) {
    console.error('Erro ao aprovar profissional:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao aprovar profissional' 
    };
  }
}

/**
 * Rejeitar um serviço de profissional
 */
export async function rejectProfessional(
  serviceId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Verificar se é admin
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return { success: false, error: 'Apenas admins podem rejeitar profissionais' };
    }

    if (!reason || reason.trim() === '') {
      return { success: false, error: 'Motivo da rejeição é obrigatório' };
    }

    // 1. Buscar o serviço em registeredServices
    const serviceRef = doc(db, 'registeredServices', serviceId);
    const serviceDoc = await getDoc(serviceRef);

    if (!serviceDoc.exists()) {
      return { success: false, error: 'Serviço não encontrado' };
    }

    const serviceData = serviceDoc.data() as RegisteredService;

    // Verificar se já foi processado
    if (serviceData.status !== 'pending') {
      return { 
        success: false, 
        error: `Serviço já foi ${serviceData.status === 'approved' ? 'aprovado' : 'rejeitado'}` 
      };
    }

    // 2. Atualizar status em registeredServices
    await updateDoc(serviceRef, {
      status: 'rejected',
      processedAt: serverTimestamp(),
      processedBy: user.uid,
      rejectedBy: user.uid,
      rejectionReason: reason,
    });

    // 3. Registrar log
    await logAdminAction(user.uid, 'REJECT_PROFESSIONAL', {
      serviceId,
      serviceName: serviceData.name,
      professionalId: serviceData.createdBy,
      reason,
    });

    console.log(`❌ Serviço ${serviceData.name} rejeitado`);
    
    // ⚠️ Nota: Emails não são enviados na versão client-side
    // Para enviar emails, é necessário usar Cloud Functions
    
    return { 
      success: true,
    };
  } catch (error: any) {
    console.error('Erro ao rejeitar profissional:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao rejeitar profissional' 
    };
  }
}

/**
 * Listar serviços pendentes, aprovados ou rejeitados
 */
export async function listPendingServices(
  status: ServiceStatus = 'pending',
  limitCount: number = 50
): Promise<{
  success: boolean;
  services?: PendingService[];
  count?: number;
  error?: string;
}> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Verificar se é admin
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return { success: false, error: 'Apenas admins podem listar serviços pendentes' };
    }

    // Buscar serviços com o status especificado
    const servicesQuery = query(
      collection(db, 'registeredServices'),
      where('status', '==', status),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limitCount)
    );

    const snapshot = await getDocs(servicesQuery);

    const services: PendingService[] = [];

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data() as RegisteredService;
      
      // Buscar informações do profissional
      let professionalInfo: ProfessionalInfo | undefined;
      if (data.createdBy) {
        try {
          const userDoc = await getDoc(doc(db, 'users', data.createdBy));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            professionalInfo = {
              email: userData.email,
              displayName: userData.displayName || userData.name,
              phoneNumber: userData.phoneNumber || userData.phone,
            };
          }
        } catch (error) {
          console.error(`Erro ao buscar usuário ${data.createdBy}:`, error);
        }
      }

      services.push({
        ...data,
        id: docSnapshot.id,
        professionalInfo,
      });
    }

    console.log(`✅ Listados ${services.length} serviços com status: ${status}`);
    
    return { 
      success: true,
      services,
      count: services.length,
    };
  } catch (error: any) {
    console.error('Erro ao listar serviços pendentes:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao listar serviços' 
    };
  }
}

/**
 * Obter detalhes de um serviço específico
 */
export async function getServiceDetails(
  serviceId: string
): Promise<{
  success: boolean;
  service?: PendingService;
  error?: string;
}> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Buscar o serviço
    const serviceDoc = await getDoc(doc(db, 'registeredServices', serviceId));

    if (!serviceDoc.exists()) {
      return { success: false, error: 'Serviço não encontrado' };
    }

    const data = serviceDoc.data() as RegisteredService;
    
    // Buscar informações do profissional
    let professionalInfo: ProfessionalInfo | undefined;
    if (data.createdBy) {
      try {
        const userDoc = await getDoc(doc(db, 'users', data.createdBy));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          professionalInfo = {
            email: userData.email,
            displayName: userData.displayName || userData.name,
            phoneNumber: userData.phoneNumber || userData.phone,
          };
        }
      } catch (error) {
        console.error(`Erro ao buscar usuário ${data.createdBy}:`, error);
      }
    }

    const service: PendingService = {
      ...data,
      id: serviceDoc.id,
      professionalInfo,
    };
    
    return { 
      success: true,
      service,
    };
  } catch (error: any) {
    console.error('Erro ao obter detalhes do serviço:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao obter detalhes' 
    };
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
 * Obter estatísticas de serviços
 */
export async function getServicesStats(): Promise<{
  success: boolean;
  stats?: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  error?: string;
}> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Verificar se é admin
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return { success: false, error: 'Sem permissão' };
    }

    // Contar pendentes
    const pendingQuery = query(
      collection(db, 'registeredServices'),
      where('status', '==', 'pending')
    );
    const pendingSnapshot = await getDocs(pendingQuery);
    const pending = pendingSnapshot.size;

    // Contar aprovados
    const approvedQuery = query(
      collection(db, 'registeredServices'),
      where('status', '==', 'approved')
    );
    const approvedSnapshot = await getDocs(approvedQuery);
    const approved = approvedSnapshot.size;

    // Contar rejeitados
    const rejectedQuery = query(
      collection(db, 'registeredServices'),
      where('status', '==', 'rejected')
    );
    const rejectedSnapshot = await getDocs(rejectedQuery);
    const rejected = rejectedSnapshot.size;

    const stats = {
      pending,
      approved,
      rejected,
      total: pending + approved + rejected,
    };

    console.log('📊 Estatísticas:', stats);
    
    return { 
      success: true,
      stats,
    };
  } catch (error: any) {
    console.error('Erro ao obter estatísticas:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao obter estatísticas' 
    };
  }
}
