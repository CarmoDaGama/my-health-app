import {onCall, HttpsError} from 'firebase-functions/v2/https';
import {onDocumentCreated} from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

const db = admin.firestore();
const authAdmin = admin.auth();

// Configurar transporter de email (usar variáveis de ambiente)
// Configure via: firebase functions:config:set email.user="seu-email" email.pass="sua-senha"
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'noreply@healthapp.ao',
    pass: process.env.EMAIL_PASS || 'sua-senha-aqui',
  },
});

/**
 * Aprovar um serviço de saúde registrado por profissional
 * Apenas admins e super admins podem executar
 */
export const approveProfessional = onCall(async (request) => {
  // Verificar autenticação
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Usuário deve estar autenticado');
  }

  // Verificar se é admin
  const callerToken = request.auth.token;
  if (!callerToken.isAdmin) {
    throw new HttpsError('permission-denied', 'Apenas admins podem aprovar profissionais');
  }

  const {serviceId, notes} = request.data;

  if (!serviceId) {
    throw new HttpsError('invalid-argument', 'serviceId é obrigatório');
  }

  try {
    // 1. Buscar o serviço em registeredServices
    const registeredServiceDoc = await db
      .collection('registeredServices')
      .doc(serviceId)
      .get();

    if (!registeredServiceDoc.exists) {
      throw new HttpsError('not-found', 'Serviço não encontrado');
    }

    const serviceData = registeredServiceDoc.data();

    if (!serviceData) {
      throw new HttpsError('internal', 'Erro ao buscar dados do serviço');
    }

    // Verificar se já foi processado
    if (serviceData.status !== 'pending') {
      throw new HttpsError(
        'failed-precondition',
        `Serviço já foi ${serviceData.status === 'approved' ? 'aprovado' : 'rejeitado'}`
      );
    }

    // 2. Criar documento em healthServices (serviços aprovados)
    const approvedServiceData: any = {
      ...serviceData,
      verified: true,
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      approvedBy: request.auth.uid,
      approverEmail: callerToken.email || 'unknown',
      approverNotes: notes || null,
    };

    // Remover campos internos de controle
    delete approvedServiceData.status;
    delete approvedServiceData.rejectedAt;
    delete approvedServiceData.rejectedBy;
    delete approvedServiceData.rejectionReason;

    await db.collection('healthServices').doc(serviceId).set(approvedServiceData);

    // 3. Atualizar status em registeredServices
    await db.collection('registeredServices').doc(serviceId).update({
      status: 'approved',
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      processedBy: request.auth.uid,
      approverNotes: notes || null,
    });

    // 4. Atualizar usuário para verified: true
    if (serviceData.createdBy) {
      await db.collection('users').doc(serviceData.createdBy).update({
        verified: true,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Atualizar Custom Claims do usuário
      try {
        const userRecord = await authAdmin.getUser(serviceData.createdBy);
        await authAdmin.setCustomUserClaims(serviceData.createdBy, {
          ...userRecord.customClaims,
          verified: true,
        });
      } catch (error) {
        console.error('Erro ao atualizar Custom Claims:', error);
      }
    }

    // 5. Enviar email de aprovação
    if (serviceData.contactEmail) {
      await sendApprovalEmail(
        serviceData.contactEmail,
        serviceData.name,
        serviceData.createdBy
      );
    }

    // 6. Registrar log
    await db.collection('adminLogs').add({
      adminId: request.auth.uid,
      adminEmail: callerToken.email || 'unknown',
      action: 'APPROVE_PROFESSIONAL',
      details: {
        serviceId,
        serviceName: serviceData.name,
        professionalId: serviceData.createdBy,
        notes,
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: `Serviço ${serviceData.name} aprovado com sucesso`,
      serviceId,
    };
  } catch (error: any) {
    console.error('Erro ao aprovar profissional:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Rejeitar um serviço de saúde registrado
 * Apenas admins e super admins podem executar
 */
export const rejectProfessional = onCall(async (request) => {
  // Verificar autenticação
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Usuário deve estar autenticado');
  }

  // Verificar se é admin
  const callerToken = request.auth.token;
  if (!callerToken.isAdmin) {
    throw new HttpsError('permission-denied', 'Apenas admins podem rejeitar profissionais');
  }

  const {serviceId, reason} = request.data;

  if (!serviceId || !reason) {
    throw new HttpsError('invalid-argument', 'serviceId e reason são obrigatórios');
  }

  try {
    // 1. Buscar o serviço em registeredServices
    const registeredServiceDoc = await db
      .collection('registeredServices')
      .doc(serviceId)
      .get();

    if (!registeredServiceDoc.exists) {
      throw new HttpsError('not-found', 'Serviço não encontrado');
    }

    const serviceData = registeredServiceDoc.data();

    if (!serviceData) {
      throw new HttpsError('internal', 'Erro ao buscar dados do serviço');
    }

    // Verificar se já foi processado
    if (serviceData.status !== 'pending') {
      throw new HttpsError(
        'failed-precondition',
        `Serviço já foi ${serviceData.status === 'approved' ? 'aprovado' : 'rejeitado'}`
      );
    }

    // 2. Atualizar status em registeredServices
    await db.collection('registeredServices').doc(serviceId).update({
      status: 'rejected',
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      processedBy: request.auth.uid,
      rejectedBy: request.auth.uid,
      rejectionReason: reason,
    });

    // 3. Enviar email de rejeição
    if (serviceData.contactEmail) {
      await sendRejectionEmail(
        serviceData.contactEmail,
        serviceData.name,
        reason
      );
    }

    // 4. Registrar log
    await db.collection('adminLogs').add({
      adminId: request.auth.uid,
      adminEmail: callerToken.email || 'unknown',
      action: 'REJECT_PROFESSIONAL',
      details: {
        serviceId,
        serviceName: serviceData.name,
        professionalId: serviceData.createdBy,
        reason,
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: `Serviço ${serviceData.name} rejeitado`,
      serviceId,
    };
  } catch (error: any) {
    console.error('Erro ao rejeitar profissional:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Listar todos os serviços pendentes de aprovação
 * Apenas admins podem visualizar
 */
export const listPendingServices = onCall(async (request) => {
  // Verificar autenticação
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Usuário deve estar autenticado');
  }

  // Verificar se é admin
  const callerToken = request.auth.token;
  if (!callerToken.isAdmin) {
    throw new HttpsError('permission-denied', 'Apenas admins podem listar serviços pendentes');
  }

  try {
    const {limit = 50, status = 'pending'} = request.data || {};

    // Buscar serviços com o status especificado
    let query = db
      .collection('registeredServices')
      .where('status', '==', status)
      .orderBy('createdAt', 'desc')
      .limit(limit);

    const snapshot = await query.get();

    const services = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        // Buscar informações do profissional
        let professionalInfo = null;
        if (data.createdBy) {
          try {
            const userDoc = await db.collection('users').doc(data.createdBy).get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              professionalInfo = {
                email: userData?.email,
                displayName: userData?.displayName,
                phoneNumber: userData?.phoneNumber,
              };
            }
          } catch (error) {
            console.error(`Erro ao buscar usuário ${data.createdBy}:`, error);
          }
        }

        return {
          id: doc.id,
          ...data,
          professionalInfo,
        };
      })
    );

    return {
      success: true,
      count: services.length,
      services,
    };
  } catch (error: any) {
    console.error('Erro ao listar serviços pendentes:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Trigger automático quando um novo serviço é registrado
 * Envia notificação para admins
 */
export const onNewServiceRegistered = onDocumentCreated(
  'registeredServices/{serviceId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data associated with the event');
      return;
    }

    const serviceData = snapshot.data();
    const serviceId = event.params.serviceId;

    console.log(`Novo serviço registrado: ${serviceId}`);

    try {
      // Buscar todos os admins
      const adminsSnapshot = await db
        .collection('adminRoles')
        .where('isAdmin', '==', true)
        .get();

      // Enviar notificação para cada admin
      const notificationPromises = adminsSnapshot.docs.map(async (adminDoc) => {
        const adminData = adminDoc.data();
        
        try {
          const userRecord = await authAdmin.getUser(adminData.userId);
          
          if (userRecord.email) {
            await sendNewServiceNotification(
              userRecord.email,
              serviceData.name,
              serviceId,
              serviceData.contactEmail
            );
          }
        } catch (error) {
          console.error(`Erro ao notificar admin ${adminData.userId}:`, error);
        }
      });

      await Promise.all(notificationPromises);

      console.log(`Notificações enviadas para ${adminsSnapshot.size} admins`);
    } catch (error) {
      console.error('Erro ao enviar notificações para admins:', error);
    }
  }
);

/**
 * Helper: Enviar email de aprovação
 */
async function sendApprovalEmail(
  email: string,
  serviceName: string,
  userId: string
): Promise<void> {
  const mailOptions = {
    from: '"Health App Angola" <noreply@healthapp.ao>',
    to: email,
    subject: '✅ Seu serviço foi aprovado - Health App Angola',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; padding: 12px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Parabéns!</h1>
          </div>
          <div class="content">
            <h2>Seu serviço foi aprovado!</h2>
            <p>Olá,</p>
            <p>Temos o prazer de informar que o seu serviço <strong>${serviceName}</strong> foi aprovado pela nossa equipe.</p>
            <p>Seu serviço agora está visível para todos os usuários do Health App Angola e você está verificado como profissional!</p>
            <h3>O que isso significa?</h3>
            <ul>
              <li>✅ Seu perfil agora tem o selo de verificado</li>
              <li>✅ Seu serviço aparece nos resultados de busca</li>
              <li>✅ Usuários podem avaliar seu serviço</li>
              <li>✅ Você pode adicionar mais serviços</li>
            </ul>
            <p style="text-align: center;">
              <a href="https://healthapp.ao" class="button">Acessar Minha Conta</a>
            </p>
            <p>Obrigado por fazer parte do Health App Angola!</p>
          </div>
          <div class="footer">
            <p>Health App Angola - Saúde ao alcance de todos</p>
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de aprovação enviado para ${email}`);
  } catch (error) {
    console.error('Erro ao enviar email de aprovação:', error);
    // Não lançar erro para não bloquear o fluxo principal
  }
}

/**
 * Helper: Enviar email de rejeição
 */
async function sendRejectionEmail(
  email: string,
  serviceName: string,
  reason: string
): Promise<void> {
  const mailOptions = {
    from: '"Health App Angola" <noreply@healthapp.ao>',
    to: email,
    subject: '❌ Seu serviço precisa de ajustes - Health App Angola',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f44336; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .reason-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Ajustes Necessários</h1>
          </div>
          <div class="content">
            <h2>Seu serviço precisa de ajustes</h2>
            <p>Olá,</p>
            <p>Agradecemos seu interesse em cadastrar o serviço <strong>${serviceName}</strong> no Health App Angola.</p>
            <p>Após análise da nossa equipe, identificamos que algumas informações precisam ser ajustadas:</p>
            <div class="reason-box">
              <strong>Motivo:</strong><br>
              ${reason}
            </div>
            <h3>O que fazer agora?</h3>
            <ul>
              <li>Revise as informações do seu serviço</li>
              <li>Faça os ajustes necessários</li>
              <li>Envie novamente para aprovação</li>
            </ul>
            <p style="text-align: center;">
              <a href="https://healthapp.ao/register" class="button">Cadastrar Novamente</a>
            </p>
            <p>Se tiver dúvidas, entre em contato conosco através do email: suporte@healthapp.ao</p>
          </div>
          <div class="footer">
            <p>Health App Angola - Saúde ao alcance de todos</p>
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de rejeição enviado para ${email}`);
  } catch (error) {
    console.error('Erro ao enviar email de rejeição:', error);
  }
}

/**
 * Helper: Notificar admins sobre novo serviço
 */
async function sendNewServiceNotification(
  adminEmail: string,
  serviceName: string,
  serviceId: string,
  professionalEmail: string
): Promise<void> {
  const mailOptions = {
    from: '"Health App Angola Admin" <noreply@healthapp.ao>',
    to: adminEmail,
    subject: '🔔 Novo serviço aguardando aprovação',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .info-box { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Nova Solicitação</h1>
          </div>
          <div class="content">
            <h2>Novo serviço aguardando aprovação</h2>
            <p>Um novo serviço de saúde foi registrado e aguarda sua aprovação.</p>
            <div class="info-box">
              <strong>Serviço:</strong> ${serviceName}<br>
              <strong>ID:</strong> ${serviceId}<br>
              <strong>Email do profissional:</strong> ${professionalEmail}
            </div>
            <p style="text-align: center;">
              <a href="https://admin.healthapp.ao/pending-services/${serviceId}" class="button">Ver Detalhes</a>
            </p>
            <p><small>Você está recebendo este email porque é administrador do Health App Angola.</small></p>
          </div>
          <div class="footer">
            <p>Health App Angola - Admin Panel</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Notificação enviada para admin ${adminEmail}`);
  } catch (error) {
    console.error('Erro ao enviar notificação para admin:', error);
  }
}
