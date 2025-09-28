
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { Coordinates } from '../types';

export interface LocationResult {
  coordinates: Coordinates;
  accuracy: number;
  address?: string;
  timestamp: number;
}

export class LocationServiceExpo {
  /**
   * Solicita permissão real de localização usando Expo Location
   */
  static async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Negada',
          'O app precisa de permissão de localização para funcionar corretamente.'
        );
        return false;
      }
      return true;
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível solicitar permissão de localização.');
      return false;
    }
  }

  /**
   * Obtém a localização atual do dispositivo
   */
  static async getCurrentLocation(): Promise<LocationResult | null> {
    try {
      const permission = await LocationServiceExpo.requestLocationPermission();
      if (!permission) return null;
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      return {
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        accuracy: location.coords.accuracy || 0,
        timestamp: location.timestamp,
      };
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter sua localização.');
      return null;
    }
  }
  
    /**
     * Faz reverse geocoding para obter endereço a partir das coordenadas
     */
    static async reverseGeocode(latitude: number, longitude: number): Promise<{ formattedAddress: string }> {
      try {
        const results = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (results && results.length > 0) {
          const r = results[0];
          // Monta endereço formatado
          const formattedAddress = [r.street, r.name, r.district, r.city, r.region, r.country]
            .filter(Boolean)
            .join(', ');
          return { formattedAddress };
        }
        return { formattedAddress: '' };
      } catch (error) {
        return { formattedAddress: '' };
      }
    }
}
