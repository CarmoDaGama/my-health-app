const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc, serverTimestamp } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCOxpoXvaG9wNRoMrSVf0o5Xdqvmm19NWY",
  authDomain: "health-app-angola.firebaseapp.com",
  projectId: "health-app-angola",
  storageBucket: "health-app-angola.firebasestorage.app",
  messagingSenderId: "435118303895",
  appId: "1:435118303895:web:8c42f4faaf46ec716117d2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testInstitutionUpdate() {
  try {
    console.log('🔍 Testando atualização de perfil de instituição...');

    // Simular dados de atualização vindos do InstitutionForm
    const testUserId = 'n1KbATJbQJgaDboSNDRu4E1Tmr42'; // ID do HospGama
    const updateData = {
      name: 'HospGama - Hospital Premium',
      phone: '+244 923 456 789',
      institutionInfo: {
        type: 'hospital',
        description: 'Hospital de referência em Luanda com serviços premium',
        services: ['Cardiologia', 'Pediatria', 'Emergência'],
        acceptsInsurance: true,
        emergencyService: true,
        coordinates: {
          latitude: -8.8299,
          longitude: 13.2441
        },
        address: {
          street: 'Rua da Missão, 123',
          city: 'Luanda',
          state: 'Luanda',
          zipCode: '1000'
        },
        workingHours: {
          monday: { start: '06:00', end: '22:00', available: true },
          tuesday: { start: '06:00', end: '22:00', available: true },
          wednesday: { start: '06:00', end: '22:00', available: true },
          thursday: { start: '06:00', end: '22:00', available: true },
          friday: { start: '06:00', end: '22:00', available: true },
          saturday: { start: '06:00', end: '18:00', available: true },
          sunday: { start: '08:00', end: '16:00', available: true }
        }
      }
    };

    console.log('📝 Dados de teste para atualização:', JSON.stringify(updateData, null, 2));

    // 1. Verificar estado atual em users
    console.log('\n📋 1. Verificando estado atual em users...');
    const userRef = doc(db, 'users', testUserId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      console.log('✅ Usuário encontrado em users:', {
        id: userDoc.id,
        name: userDoc.data().name,
        userType: userDoc.data().userType,
        hasInstitutionInfo: !!userDoc.data().institutionInfo
      });
    } else {
      console.log('❌ Usuário não encontrado em users');
      return;
    }

    // 2. Verificar estado atual em healthServices
    console.log('\n🏥 2. Verificando estado atual em healthServices...');
    const serviceRef = doc(db, 'healthServices', testUserId);
    const serviceDoc = await getDoc(serviceRef);
    
    if (serviceDoc.exists()) {
      console.log('✅ Serviço encontrado em healthServices:', {
        id: serviceDoc.id,
        name: serviceDoc.data().name,
        type: serviceDoc.data().type,
        coordinates: serviceDoc.data().coordinates,
        location: serviceDoc.data().location, // Campo antigo
        address: serviceDoc.data().address
      });
    } else {
      console.log('❌ Serviço não encontrado em healthServices');
    }

    // 3. Simular atualização em users (como faz o AuthServiceFirebase.updateProfile)
    console.log('\n🔄 3. Atualizando dados em users...');
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    console.log('✅ Usuário atualizado em users');

    // 4. Simular atualização em healthServices (nova funcionalidade)
    console.log('\n🏥 4. Atualizando dados em healthServices...');
    
    if (serviceDoc.exists()) {
      const serviceUpdates = {
        name: updateData.name,
        contactPhone: updateData.phone,
        type: updateData.institutionInfo.type, // Campo 'type' correto
        description: updateData.institutionInfo.description,
        coordinates: updateData.institutionInfo.coordinates, // Campo 'coordinates' correto
        address: `${updateData.institutionInfo.address.street}, ${updateData.institutionInfo.address.city}, ${updateData.institutionInfo.address.state}`,
        city: updateData.institutionInfo.address.city,
        province: updateData.institutionInfo.address.state,
        services: updateData.institutionInfo.services,
        acceptsInsurance: updateData.institutionInfo.acceptsInsurance,
        emergencyService: updateData.institutionInfo.emergencyService,
        workingHours: updateData.institutionInfo.workingHours,
        updatedAt: serverTimestamp()
      };

      console.log('📝 Atualizações para healthServices:', JSON.stringify(serviceUpdates, null, 2));
      
      await updateDoc(serviceRef, serviceUpdates);
      console.log('✅ Serviço atualizado em healthServices');
    }

    // 5. Verificar resultado final
    console.log('\n📊 5. Verificando resultado final...');
    
    const updatedUserDoc = await getDoc(userRef);
    const updatedServiceDoc = await getDoc(serviceRef);
    
    console.log('👤 Usuário atualizado:', {
      name: updatedUserDoc.data()?.name,
      institutionInfo: updatedUserDoc.data()?.institutionInfo
    });
    
    console.log('🏥 Serviço atualizado:', {
      name: updatedServiceDoc.data()?.name,
      type: updatedServiceDoc.data()?.type,
      coordinates: updatedServiceDoc.data()?.coordinates,
      address: updatedServiceDoc.data()?.address
    });

    console.log('\n✅ Teste de atualização completado com sucesso!');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }

  process.exit(0);
}

testInstitutionUpdate();