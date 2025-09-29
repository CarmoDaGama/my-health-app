import { Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
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
      console.log('📍 Solicitando permissão de localização...');
      
      // Verificar primeiro se já temos permissão
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      
      if (existingStatus === 'granted') {
        console.log('✅ Permissão já concedida');
        return true;
      }
      
      // Solicitar permissão
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('❌ Permissão negada pelo usuário');
        Alert.alert(
          'Permissão de Localização',
          'O app precisa acessar sua localização para encontrar serviços próximos. Você pode habilitar nas configurações do dispositivo.',
          [
            { text: 'OK', style: 'default' }
          ]
        );
        return false;
      }
      
      console.log('✅ Permissão concedida');
      return true;
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão:', error);
      Alert.alert(
        'Erro de Permissão',
        'Não foi possível solicitar permissão de localização. Tente novamente.'
      );
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

      // Verificar se serviços de localização estão habilitados
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        Alert.alert(
          'GPS Desabilitado',
          'Por favor, habilite o GPS nas configurações do dispositivo para obter sua localização.'
        );
        return null;
      }

      // Obter localização atual com configuração otimizada
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Balanço entre precisão e velocidade
        timeInterval: 5000, // Máximo 5 segundos para obter localização
        distanceInterval: 0,
      });

      const result: LocationResult = {
        coordinates: {
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
        },
        accuracy: locationData.coords.accuracy || 0,
        timestamp: locationData.timestamp,
      };

      // Tentar obter endereço da localização
      try {
        const reverseResult = await this.reverseGeocode(
          result.coordinates.latitude, 
          result.coordinates.longitude
        );
        result.address = reverseResult.formattedAddress;
      } catch (error) {
        console.log('⚠️ Não foi possível obter endereço da localização atual:', error);
      }

      console.log('✅ Localização obtida:', result.coordinates);
      return result;
    } catch (error: any) {
      console.error('❌ Erro ao obter localização:', error);
      
      // Tratamento específico para diferentes tipos de erro
      if (error.code === 'E_LOCATION_TIMEOUT') {
        Alert.alert(
          'Timeout de Localização',
          'Não foi possível obter sua localização no tempo esperado. Verifique se o GPS está ativado e tente novamente.'
        );
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        Alert.alert(
          'Localização Indisponível',
          'Serviços de localização não estão disponíveis. Verifique suas configurações de GPS.'
        );
      } else {
        Alert.alert(
          'Erro de Localização',
          'Não foi possível obter sua localização. Verifique se o GPS está ativado e tente novamente.'
        );
      }
      return null;
    }
  }

  /**
   * Converte coordenadas em endereço (reverse geocoding)
   */
  static async reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResult> {
    try {
      console.log('🔄 Fazendo reverse geocoding:', { latitude, longitude });
      
      // Tentar primeiro com expo-location (mais rápido e confiável)
      try {
        const results = await Location.reverseGeocodeAsync({ latitude, longitude });
        
        if (results && results.length > 0) {
          const result = results[0];
          const formattedResult: ReverseGeocodeResult = {
            formattedAddress: [
              result.streetNumber,
              result.street,
              result.district,
              result.city,
              result.region,
              result.country
            ].filter(Boolean).join(', '),
            streetNumber: result.streetNumber || undefined,
            street: result.street || undefined,
            city: result.city || undefined,
            region: result.region || undefined,
            country: result.country || undefined,
            postalCode: result.postalCode || undefined,
          };
          
          console.log('✅ Reverse geocoding (Expo) concluído:', formattedResult.formattedAddress);
          return formattedResult;
        }
      } catch (expoError) {
        console.log('⚠️ Expo reverse geocoding falhou, tentando OpenStreetMap...', expoError);
      }
      
      // Fallback para OpenStreetMap
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

        console.log('✅ Reverse geocoding (OSM) concluído:', result.formattedAddress);
        return result;
      }

      throw new Error('Nenhum resultado encontrado');
    } catch (error) {
      console.error('❌ Erro no reverse geocoding:', error);
      
      // Fallback: retornar coordenadas formatadas
      return {
        formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        city: 'Localização Desconhecida',
        region: 'Angola',
        country: 'Angola',
      };
    }
  }

  /**
   * Observa mudanças na localização
   */
  static async watchLocation(
    callback: (location: LocationResult) => void,
    options?: {
      accuracy?: 'high' | 'balanced' | 'low';
      interval?: number; // em milissegundos
      distanceFilter?: number; // em metros
    }
  ): Promise<() => void> {
    console.log('👀 Iniciando observação de localização...');
    
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Permissão de localização necessária');
      }

      // Mapear accuracy
      let accuracy = Location.Accuracy.Balanced;
      switch (options?.accuracy) {
        case 'high':
          accuracy = Location.Accuracy.BestForNavigation;
          break;
        case 'low':
          accuracy = Location.Accuracy.Low;
          break;
        default:
          accuracy = Location.Accuracy.Balanced;
      }

      // Configurar observação
      const subscription = await Location.watchPositionAsync(
        {
          accuracy,
          timeInterval: options?.interval || 30000, // 30 segundos por padrão
          distanceInterval: options?.distanceFilter || 10, // 10 metros por padrão
        },
        async (locationData) => {
          const result: LocationResult = {
            coordinates: {
              latitude: locationData.coords.latitude,
              longitude: locationData.coords.longitude,
            },
            accuracy: locationData.coords.accuracy || 0,
            timestamp: locationData.timestamp,
          };

          // Tentar obter endereço (opcional, pode impactar performance)
          try {
            const reverseResult = await this.reverseGeocode(
              result.coordinates.latitude,
              result.coordinates.longitude
            );
            result.address = reverseResult.formattedAddress;
          } catch (error) {
            // Ignorar erro de reverse geocoding em watch
            console.log('⚠️ Erro ao obter endereço durante watch:', error);
          }

          callback(result);
        }
      );

      // Retornar função para parar a observação
      return () => {
        console.log('⏹️ Parando observação de localização');
        subscription.remove();
      };
    } catch (error) {
      console.error('❌ Erro ao iniciar observação de localização:', error);
      
      // Fallback: usar interval simples
      const interval = setInterval(async () => {
        const location = await this.getCurrentLocation();
        if (location) {
          callback(location);
        }
      }, options?.interval || 30000);

      return () => {
        console.log('⏹️ Parando observação de localização (fallback)');
        clearInterval(interval);
      };
    }
  }

  /**
   * Verifica se os serviços de localização estão habilitados
   */
  static async isLocationEnabled(): Promise<boolean> {
    try {
      const isEnabled = await Location.hasServicesEnabledAsync();
      console.log('📍 Serviços de localização habilitados:', isEnabled);
      return isEnabled;
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

  /**
   * Obter localização usando fallbacks em caso de falha
   */
  static async getLocationWithFallback(): Promise<LocationResult | null> {
    try {
      // Primeira tentativa: localização GPS
      const location = await this.getCurrentLocation();
      if (location) {
        return location;
      }
    } catch (error) {
      console.log('⚠️ GPS falhou, tentando fallbacks...', error);
    }

    try {
      // Fallback 1: Localização aproximada por rede (menos precisa)
      const hasPermission = await this.requestLocationPermission();
      if (hasPermission) {
        const locationData = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low, // Usar menor precisão
          timeInterval: 10000, // Timeout maior
        });

        const result: LocationResult = {
          coordinates: {
            latitude: locationData.coords.latitude,
            longitude: locationData.coords.longitude,
          },
          accuracy: locationData.coords.accuracy || 1000, // Menor precisão
          timestamp: locationData.timestamp,
        };

        console.log('✅ Localização obtida via rede (fallback 1)');
        return result;
      }
    } catch (error) {
      console.log('⚠️ Fallback 1 falhou, tentando fallback 2...', error);
    }

    // Fallback 2: Localização padrão (Luanda, Angola)
    console.log('📍 Usando localização padrão (Luanda, Angola)');
    return {
      coordinates: {
        latitude: -8.8379,
        longitude: 13.2894,
      },
      accuracy: 50000, // 50km de precisão (muito baixa)
      timestamp: Date.now(),
      address: 'Luanda, Angola (Localização Padrão)',
    };
  }

  /**
   * Obter coordenadas de um endereço (geocoding)
   */
  static async geocodeAddress(address: string): Promise<Coordinates | null> {
    try {
      console.log('🔍 Fazendo geocoding para:', address);
      
      // Tentar com expo-location primeiro
      try {
        const results = await Location.geocodeAsync(address);
        if (results && results.length > 0) {
          const result = results[0];
          console.log('✅ Geocoding (Expo) concluído:', result);
          return {
            latitude: result.latitude,
            longitude: result.longitude,
          };
        }
      } catch (expoError) {
        console.log('⚠️ Expo geocoding falhou, tentando OpenStreetMap...', expoError);
      }

      // Fallback para OpenStreetMap/Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
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
      
      if (data && data.length > 0) {
        const result = data[0];
        const coordinates = {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        };
        
        console.log('✅ Geocoding (OSM) concluído:', coordinates);
        return coordinates;
      }

      throw new Error('Nenhum resultado encontrado');
    } catch (error) {
      console.error('❌ Erro no geocoding:', error);
      return null;
    }
  }

  /**
   * Verificar se uma localização está dentro de uma área específica
   */
  static isLocationInAngola(coordinates: Coordinates): boolean {
    // Limites aproximados de Angola
    const angolaBounds = {
      north: -4.376,
      south: -18.042,
      east: 24.084,
      west: 11.679,
    };

    return (
      coordinates.latitude >= angolaBounds.south &&
      coordinates.latitude <= angolaBounds.north &&
      coordinates.longitude >= angolaBounds.west &&
      coordinates.longitude <= angolaBounds.east
    );
  }
}