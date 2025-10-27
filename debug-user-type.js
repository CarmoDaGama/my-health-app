const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'my-health-app-424017'
  });
}

const db = admin.firestore();

async function debugUserTypes() {
  try {
    console.log('🔍 Verificando tipos de usuários...');
    
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('⚠️ Nenhum usuário encontrado na coleção users');
      return;
    }
    
    usersSnapshot.docs.forEach(doc => {
      const userData = doc.data();
      console.log(`📋 ID: ${doc.id}`);
      console.log(`   Nome: ${userData.name || 'N/A'}`);
      console.log(`   Email: ${userData.email || 'N/A'}`);
      console.log(`   UserType: ${userData.userType || 'N/A'}`);
      console.log(`   IsActive: ${userData.isActive}`);
      console.log('---');
    });
    
    // Verificar especificamente usuários institucionais
    const institutionQuery = await db.collection('users')
      .where('userType', '==', 'institution')
      .get();
      
    console.log(`\n🏥 Instituições encontradas: ${institutionQuery.docs.length}`);
    
    if (institutionQuery.docs.length === 0) {
      console.log('⚠️ Nenhuma instituição encontrada!');
      console.log('💡 Criando usuário de teste...');
      
      // Criar um usuário institucional de teste
      const testInstitution = {
        name: 'Hospital Teste',
        email: 'hospital@teste.com',
        userType: 'institution',
        isActive: true,
        isVerified: true,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        institutionInfo: {
          type: 'hospital',
          address: {
            street: 'Rua Teste, 123',
            city: 'Luanda',
            state: 'Luanda',
            zipCode: '1000'
          },
          services: ['Emergência', 'Consultas'],
          workingHours: {
            monday: { start: '08:00', end: '18:00', available: true }
          },
          contactInfo: {
            phone: '+244912345678',
            email: 'hospital@teste.com'
          },
          description: 'Hospital de teste para desenvolvimento',
          acceptsInsurance: true,
          emergencyService: true,
          verified: true,
          rating: 4.5,
          totalReviews: 0
        },
        professionals: [],
        preferences: {
          language: 'pt',
          notifications: {
            enabled: true,
            serviceReminders: true,
            healthTips: false,
            emergencyAlerts: true
          },
          favorites: {
            services: [],
            locations: []
          },
          privacy: {
            shareLocation: false,
            publicProfile: true
          }
        }
      };
      
      const docRef = await db.collection('users').add(testInstitution);
      console.log(`✅ Usuário de teste criado com ID: ${docRef.id}`);
      console.log('📧 Email: hospital@teste.com');
      console.log('🔑 Senha sugerida: Hospital123!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
  }
}

debugUserTypes().then(() => {
  console.log('✅ Debug concluído');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
