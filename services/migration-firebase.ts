import { collection, addDoc, GeoPoint, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase.js';
import * as healthServicesData from '../data/healthServices.json';

/**
 * Script para migrar dados do JSON local para o Firebase Firestore
 * Execute uma única vez após configurar o Firebase
 */

interface HealthServiceData {
  name: string;
  type: string;
  address: string;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  phone?: string;
  services: string[];
  rating?: number;
  description?: string;
  website?: string;
  operatingHours?: string;
}

export async function migrateHealthServices(): Promise<void> {
  console.log('🚀 Iniciando migração de dados para Firebase...');
  
  try {
    const services = (healthServicesData as any).healthServices as HealthServiceData[];
    console.log(`📊 Encontrados ${services.length} serviços para migrar`);

    const batch: Promise<any>[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (const service of services) {
      try {
        const serviceData = {
          name: service.name,
          type: service.type,
          address: service.address,
          city: service.city,
          coordinates: new GeoPoint(
            service.coordinates.latitude,
            service.coordinates.longitude
          ),
          phone: service.phone || '',
          services: service.services || [],
          rating: service.rating || 0,
          description: service.description || '',
          website: service.website || '',
          operatingHours: service.operatingHours || 'Não informado',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'active',
          createdBy: 'system' // Indica que foi criado pelo sistema
        };

        const promise = addDoc(collection(db, 'healthServices'), serviceData)
          .then(() => {
            successCount++;
            console.log(`✅ Migrado: ${service.name}`);
          })
          .catch((error) => {
            errorCount++;
            console.error(`❌ Erro ao migrar ${service.name}:`, error);
          });

        batch.push(promise);

        // Process in chunks to avoid overwhelming Firestore
        if (batch.length >= 10) {
          await Promise.all(batch);
          batch.length = 0; // Clear array
          console.log(`📈 Progresso: ${successCount} sucessos, ${errorCount} erros`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Erro ao processar ${service.name}:`, error);
      }
    }

    // Process remaining services
    if (batch.length > 0) {
      await Promise.all(batch);
    }

    console.log('✅ Migração concluída!');
    console.log(`📊 Resultados finais:`);
    console.log(`   • Sucessos: ${successCount}`);
    console.log(`   • Erros: ${errorCount}`);
    console.log(`   • Total: ${services.length}`);

  } catch (error) {
    console.error('💥 Erro fatal na migração:', error);
    throw error;
  }
}

/**
 * Função para criar coleções de exemplo (usuários, avaliações, etc.)
 */
export async function createSampleCollections(): Promise<void> {
  console.log('🔧 Criando coleções de exemplo...');

  try {
    // Criar documento de exemplo para users
    const exampleUser = {
      name: 'Usuário Exemplo',
      email: 'exemplo@email.com',
      phone: '+244 923 456 789',
      userType: 'patient',
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

    // Note: Este documento será substituído quando um usuário real se registrar
    await addDoc(collection(db, 'users'), exampleUser);
    console.log('✅ Coleção users criada');

    // Criar documento de exemplo para reviews
    const exampleReview = {
      serviceId: 'example-service-id',
      userId: 'example-user-id',
      rating: 5,
      comment: 'Excelente atendimento!',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await addDoc(collection(db, 'reviews'), exampleReview);
    console.log('✅ Coleção reviews criada');

    console.log('✅ Coleções de exemplo criadas com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao criar coleções de exemplo:', error);
    throw error;
  }
}

/**
 * Função principal para executar toda a migração
 */
export async function runMigration(): Promise<void> {
  console.log('🎯 Iniciando migração completa do sistema...');
  
  try {
    await migrateHealthServices();
    await createSampleCollections();
    
    console.log('🎉 Migração completa realizada com sucesso!');
    console.log('💡 Próximos passos:');
    console.log('   1. Configurar regras de segurança no Firebase Console');
    console.log('   2. Ativar autenticação por email/senha');
    console.log('   3. Testar o app com dados reais');
    console.log('   4. Configurar índices compostos se necessário');
    
  } catch (error) {
    console.error('💥 Falha na migração:', error);
    throw error;
  }
}

// Para executar no terminal:
// npm run migrate-firebase
async function main() {
  try {
    await runMigration();
    console.log('✅ Script de migração finalizado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Script de migração falhou:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}