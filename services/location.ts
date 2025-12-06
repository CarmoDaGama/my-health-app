import { Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import { Coordinates } from '../types';
import { getCountryConfig, detectCountryByCoordinates, DEFAULT_COUNTRY } from '../utils/countries';

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

      // Obter localização atual com configuração otimizada para maior precisão
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation, // Máxima precisão disponível
        timeInterval: 10000, // Aumentar timeout para 10 segundos
        distanceInterval: 0,
        mayShowUserSettingsDialog: true, // Permitir que o usuário habilite GPS se necessário
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
      
      // Validar se as coordenadas estão em uma região razoável (não são (0,0) ou muito incorretas)
      if (!this.isValidCoordinates(result.coordinates)) {
        console.log('⚠️ Coordenadas inválidas recebidas:', result.coordinates);
        throw new Error('Coordenadas inválidas');
      }
      
      // Detectar país baseado nas coordenadas
      const detectedCountry = detectCountryByCoordinates(result.coordinates.latitude, result.coordinates.longitude);
      const countryConfig = getCountryConfig(detectedCountry);
      
      if (detectedCountry !== DEFAULT_COUNTRY) {
        console.log(`🌍 Localização detectada em: ${countryConfig?.name || detectedCountry}`);
        
        // Informar sobre o país detectado
        Alert.alert(
          'Localização Detectada',
          `Você está em ${countryConfig?.name || detectedCountry}. Os serviços serão adaptados para sua região.`,
          [{ text: 'OK' }]
        );
      }
      
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
            'User-Agent': 'HealthApp/1.0 (International Health Services Locator)',
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
      
      // Detectar país pelas coordenadas para fallback
      const detectedCountry = detectCountryByCoordinates(latitude, longitude);
      const fallbackCountryConfig = getCountryConfig(detectedCountry);
      
      // Fallback: retornar coordenadas formatadas
      return {
        formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        city: 'Localização Desconhecida',
        region: fallbackCountryConfig?.name || 'Unknown',
        country: fallbackCountryConfig?.name || 'Unknown',
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
      !isNaN(longitude) &&
      // Verificar se não são coordenadas "nulas" comuns
      !(latitude === 0 && longitude === 0) &&
      // Verificar se não são coordenadas obviamente incorretas
      Math.abs(latitude) > 0.0001 && Math.abs(longitude) > 0.0001
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
   * Obtém localização com alta precisão (para inicialização automática estilo ATM Locator)
   */
  static async getCurrentLocationHighAccuracy(): Promise<LocationResult | null> {
    try {
      console.log('🎯 Tentando geolocalização de alta precisão (ATM Locator style)...');
      
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Permission denied');
      }

      // Verificar se GPS está habilitado
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        throw new Error('GPS services disabled');
      }

      // Usar configuração de máxima precisão com timeout otimizado
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 15000, // 15s timeout para inicialização automática
        distanceInterval: 0,
        mayShowUserSettingsDialog: true,
      });

      const result: LocationResult = {
        coordinates: {
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
        },
        accuracy: locationData.coords.accuracy || 0,
        timestamp: locationData.timestamp,
      };

      // Validar coordenadas
      if (!this.isValidCoordinates(result.coordinates)) {
        throw new Error('Invalid coordinates received');
      }

      console.log('✅ High accuracy location obtained:', result.coordinates);
      return result;
    } catch (error) {
      console.log('⚠️ High accuracy geolocation failed:', error);
      return null;
    }
  }

  /**
   * Obter localização usando fallbacks em caso de falha
   */
  static async getLocationWithFallback(): Promise<LocationResult | null> {
    try {
      // Primeira tentativa: localização GPS de alta precisão
      console.log('🎯 Tentativa 1: Localização GPS de alta precisão...');
      const location = await this.getCurrentLocation();
      if (location && this.isValidCoordinates(location.coordinates)) {
        console.log('✅ Localização GPS obtida com sucesso');
        return location;
      }
    } catch (error) {
      console.log('⚠️ GPS de alta precisão falhou, tentando fallbacks...', error);
    }

    try {
      // Fallback 1: Localização aproximada por rede (menos precisa)
      console.log('🎯 Tentativa 2: Localização de rede...');
      const hasPermission = await this.requestLocationPermission();
      if (hasPermission) {
        const locationData = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low, // Usar menor precisão
          timeInterval: 15000, // Timeout maior
          mayShowUserSettingsDialog: false, // Não mostrar dialog no fallback
        });

        const result: LocationResult = {
          coordinates: {
            latitude: locationData.coords.latitude,
            longitude: locationData.coords.longitude,
          },
          accuracy: locationData.coords.accuracy || 1000, // Menor precisão
          timestamp: locationData.timestamp,
        };

        if (this.isValidCoordinates(result.coordinates)) {
          console.log('✅ Localização de rede obtida (fallback 1)');
          return result;
        }
      }
    } catch (error) {
      console.log('⚠️ Fallback de rede falhou, usando localização padrão...', error);
    }

    // Fallback 2: Localização padrão baseada no país padrão
    const defaultCountryConfig = getCountryConfig(DEFAULT_COUNTRY);
    const defaultCoords = defaultCountryConfig ? {
      latitude: (defaultCountryConfig.coordinates.north + defaultCountryConfig.coordinates.south) / 2,
      longitude: (defaultCountryConfig.coordinates.east + defaultCountryConfig.coordinates.west) / 2,
    } : {
      latitude: -8.8383, // Luanda como fallback final
      longitude: 13.2344,
    };
    
    console.log(`📍 Usando localização padrão (${defaultCountryConfig?.name || 'Angola'})`);
    return {
      coordinates: defaultCoords,
      accuracy: 50000, // 50km de precisão (muito baixa)
      timestamp: Date.now(),
      address: `${defaultCountryConfig?.name || 'Angola'} (Localização Padrão)`,
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
            'User-Agent': 'HealthApp/1.0 (International Health Services Locator)',
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
   * Verificar se uma localização está dentro de um país específico
   */
  static isLocationInCountry(coordinates: Coordinates, countryCode?: string): boolean {
    const targetCountry = countryCode || DEFAULT_COUNTRY;
    const countryConfig = getCountryConfig(targetCountry);
    
    if (!countryConfig) {
      return false;
    }

    const bounds = countryConfig.coordinates;
    return (
      coordinates.latitude >= bounds.south &&
      coordinates.latitude <= bounds.north &&
      coordinates.longitude >= bounds.west &&
      coordinates.longitude <= bounds.east
    );
  }

  /**
   * Função legada para compatibilidade - verifica se está em Angola
   */
  static isLocationInAngola(coordinates: Coordinates): boolean {
    return this.isLocationInCountry(coordinates, 'AO');
  }
}