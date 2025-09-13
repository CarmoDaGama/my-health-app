// Teste simples para verificar o serviço de rotas
import { RoutingService } from './routing';

const testOSRMConnection = async () => {
  try {
    console.log('🧪 Testando conexão OSRM...');
    
    // Teste com coordenadas de Lisboa (conhecidas por funcionar bem com OSRM)
    const start = { latitude: 38.7223, longitude: -9.1393 }; // Lisboa Centro
    const end = { latitude: 38.7569, longitude: -9.1568 }; // Aeroporto de Lisboa
    
    // Fazer uma requisição direta ao OSRM para testar
    const testUrl = 'https://router.project-osrm.org/route/v1/car/-9.1393,38.7223;-9.1568,38.7569?overview=false';
    
    console.log('📍 URL de teste:', testUrl);
    
    const response = await fetch(testUrl);
    const data = await response.json();
    
    if (response.ok && data.routes && data.routes.length > 0) {
      console.log('✅ OSRM está funcionando!');
      console.log('🛣️  Distância do teste:', (data.routes[0].distance / 1000).toFixed(1) + ' km');
      console.log('⏱️  Duração do teste:', Math.round(data.routes[0].duration / 60) + ' min');
      return true;
    } else {
      console.log('❌ OSRM retornou erro:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao testar OSRM:', error);
    return false;
  }
};

const testLuandaRoute = async () => {
  try {
    console.log('🧪 Testando rota em Luanda...');
    
    const luandaCenter = { latitude: -8.8379, longitude: 13.2894 };
    const hospitalMilitar = { latitude: -8.8154, longitude: 13.2302 };
    
    const route = await RoutingService.getRoute(luandaCenter, hospitalMilitar, 'DRIVING');
    
    console.log('✅ Rota obtida:');
    console.log(`📏 Distância: ${route.distance}`);
    console.log(`⏱️  Duração: ${route.duration}`);
    console.log(`📍 Pontos na rota: ${route.coordinates.length}`);
    console.log(`📋 Passos: ${route.steps.length}`);
    
    if (route.coordinates.length > 2) {
      console.log('✅ Rota real obtida com sucesso!');
    } else {
      console.log('⚠️  Usando rota fallback');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro no teste de rota:', error);
    return false;
  }
};

export { testOSRMConnection, testLuandaRoute };
