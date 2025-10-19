/**
 * Health App Angola - Cloud Functions
 * Sistema Administrativo e de Moderação
 */

import {setGlobalOptions} from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

// Inicializar Firebase Admin SDK
admin.initializeApp();

// Configurações globais (limite de instâncias para controle de custos)
setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1',
});

// ========================================
// FASE 1: ROLES E PERMISSÕES
// ========================================
export {setAdminRole, removeAdminRole, listAdmins} from './roles';

// ========================================
// FASE 2: APROVAÇÃO DE PROFISSIONAIS
// ========================================
export {
  approveProfessional,
  rejectProfessional,
  listPendingServices,
  onNewServiceRegistered,
} from './approval';

// ========================================
// FASE 3: MODERAÇÃO DE CONTEÚDO
// ========================================
// export {autoModerateReview, moderateReview, listReportedReviews} from './moderation';

// ========================================
// FASE 4: ANALYTICS
// ========================================
// export {getSystemAnalytics, getGrowthHistory, exportReport} from './analytics';
