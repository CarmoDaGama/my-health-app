import { Alert, Platform } from 'react-native';
import { Coordinates } from '../types';

export interface LocationResult {
  coordinates: Coordinates;
  accuracy: number; // Em metros
  address?: string;
  timestamp: number;
}

export interface ReverseGeocodeResult {
  formattedAddress: string;
  streetNumber?: string;
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
}

export class LocationService {
  /**
   * Solicita permissão de localização do usuário
   */
  static async requestLocationPermission(): Promise<boolean> {
    try {
      // Para React Native sem Expo, usar react-native-permissions
      // Como estamos usando Expo, vamos simular a permissão por enquanto
      console.log('📍 Solicitando permissão de localização...');
      
      // Simular diálogo de permissão
      return new Promise((resolve) => {
        Alert.alert(
          'Permissão de Localização',
          'O app precisa acessar sua localização para encontrar serviços próximos e ajudar no registro de profissionais/instituições.',
          [
            {
              text: 'Negar',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Permitir',
              onPress: () => resolve(true),
            },
          ]
        );
      });
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão:', error);
      return false;
    }
  }

  /**
   * Obtém a localização atual do dispositivo
   */
  static async getCurrentLocation(): Promise<LocationResult | null> {
    try {
      console.log('🔍 Obtendo localização atual...');
      
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permissão Negada', 
          'Não é possível obter sua localização sem permissão. Você pode selecionar manualmente no mapa.'
        );
        return null;
      }

      // Simular obtenção de localização (coordenadas de Luanda como exemplo)
      // Em produção, usar expo-location ou @react-native-community/geolocation
      const mockLocation: LocationResult = {
        coordinates: {
          latitude: -8.8379 + (Math.random() - 0.5) * 0.01, // Pequena variação aleatória
          longitude: 13.2894 + (Math.random() - 0.5) * 0.01,
        },
        accuracy: 10 + Math.random() * 20, // 10-30 metros de precisão
        timestamp: Date.now(),
      };

      // Obter endereço da localização
      try {
        const reverseResult = await this.reverseGeocode(
          mockLocation.coordinates.latitude, 
          mockLocation.coordinates.longitude
        );
        mockLocation.address = reverseResult.formattedAddress;
      } catch (error) {
        console.log('⚠️ Não foi possível obter endereço da localização atual');
      }

      console.log('✅ Localização obtida:', mockLocation.coordinates);
      return mockLocation;
    } catch (error) {
      console.error('❌ Erro ao obter localização:', error);
      Alert.alert(
        'Erro de Localização',
        'Não foi possível obter sua localização. Verifique se o GPS está ativado e tente novamente.'
      );
      return null;
    }
  }

  /**
   * Converte coordenadas em endereço (reverse geocoding)
   */
  static async reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResult> {
    try {
      console.log('🔄 Fazendo reverse geocoding:', { latitude, longitude });
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'HealthApp/1.0 (Angola Health Services Locator)',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        const result: ReverseGeocodeResult = {
          formattedAddress: data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          streetNumber: addr.house_number,
          street: addr.road || addr.street,
          city: addr.city || addr.town || addr.village,
          region: addr.state || addr.province,
          country: addr.country,
          postalCode: addr.postcode,
        };

        console.log('✅ Reverse geocoding concluído:', result.formattedAddress);
        return result;
      }

      throw new Error('Nenhum resultado encontrado');
    } catch (error) {
      console.error('❌ Erro no reverse geocoding:', error);
      
      // Fallback: retornar coordenadas formatadas
      return {
        formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        city: 'Luanda', // Default para Angola
        region: 'Luanda',
        country: 'Angola',
      };
    }
  }

  /**
   * Observa mudanças na localização (para uso futuro)
   */
  static async watchLocation(
    callback: (location: LocationResult) => void,
    options?: {
      accuracy?: 'high' | 'balanced' | 'low';
      interval?: number; // em milissegundos
    }
  ): Promise<() => void> {
    console.log('👀 Iniciando observação de localização...');
    
    // Simular observação de localização
    const interval = setInterval(async () => {
      const location = await this.getCurrentLocation();
      if (location) {
        callback(location);
      }
    }, options?.interval || 30000); // A cada 30 segundos por padrão

    // Retornar função para parar a observação
    return () => {
      console.log('⏹️ Parando observação de localização');
      clearInterval(interval);
    };
  }

  /**
   * Verifica se os serviços de localização estão habilitados
   */
  static async isLocationEnabled(): Promise<boolean> {
    try {
      // Em um app real, verificar se GPS/localização está ativado no dispositivo
      // Por enquanto, retornar true
      return true;
    } catch (error) {
      console.error('❌ Erro ao verificar serviços de localização:', error);
      return false;
    }
  }

  /**
   * Formatar coordenadas para exibição
   */
  static formatCoordinates(coordinates: Coordinates, precision: number = 6): string {
    return `${coordinates.latitude.toFixed(precision)}, ${coordinates.longitude.toFixed(precision)}`;
  }

  /**
   * Validar se as coordenadas são válidas
   */
  static isValidCoordinates(coordinates: Coordinates): boolean {
    const { latitude, longitude } = coordinates;
    
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180 &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    );
  }

  /**
   * Calcular distância entre duas localizações (mesmo que no GeocodingService)
   * Mantido aqui para conveniência
   */
  static calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLon = this.toRadians(coord2.longitude - coord1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.latitude)) * 
      Math.cos(this.toRadians(coord2.latitude)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}