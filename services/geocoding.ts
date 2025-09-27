import { Alert } from 'react-native';
import { Coordinates } from '../types';

export interface GeocodingResult {
  coordinates: Coordinates;
  formattedAddress: string;
  confidence: number; // 0-1, onde 1 é máxima confiança
}

export class GeocodingService {
  /**
   * Converte endereço em coordenadas usando OpenStreetMap Nominatim (gratuito)
   */
  static async getCoordinatesFromAddress(address: string): Promise<GeocodingResult | null> {
    try {
      console.log('🔍 Geocodificando endereço:', address);
      
      if (!address || address.trim().length < 5) {
        console.log('❌ Endereço muito curto para geocodificação');
        return null;
      }

      const encodedAddress = encodeURIComponent(address.trim());
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=3&countrycodes=ao&addressdetails=1`,
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
      console.log('📍 Resultados da geocodificação:', data.length);
      
      if (data && data.length > 0) {
        const result = data[0];
        const geocodingResult: GeocodingResult = {
          coordinates: {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
          },
          formattedAddress: result.display_name || address,
          confidence: parseFloat(result.importance || '0.5'),
        };

        console.log('✅ Coordenadas encontradas:', geocodingResult.coordinates);
        return geocodingResult;
      }
      
      console.log('❌ Nenhuma coordenada encontrada para o endereço');
      return null;
    } catch (error) {
      console.error('❌ Erro na geocodificação:', error);
      return null;
    }
  }

  /**
   * Converte endereço em coordenadas usando Google Geocoding API
   * Requer API key configurada
   */
  static async getCoordinatesFromAddressGoogle(address: string): Promise<GeocodingResult | null> {
    try {
      // TODO: Configurar API key no ambiente
      const GOOGLE_API_KEY = process.env.GOOGLE_GEOCODING_API_KEY;
      
      if (!GOOGLE_API_KEY) {
        console.log('⚠️ Google API key não configurada, usando OpenStreetMap');
        return this.getCoordinatesFromAddress(address);
      }

      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&components=country:AO&key=${GOOGLE_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;
        
        return {
          coordinates: {
            latitude: location.lat,
            longitude: location.lng,
          },
          formattedAddress: result.formatted_address,
          confidence: 0.9, // Google geralmente tem alta confiança
        };
      }
      
      console.log('❌ Google Geocoding falhou:', data.status);
      return null;
    } catch (error) {
      console.error('❌ Erro na geocodificação Google:', error);
      // Fallback para OpenStreetMap
      return this.getCoordinatesFromAddress(address);
    }
  }

  /**
   * Valida se as coordenadas estão dentro de Angola
   */
  static isLocationInAngola(coordinates: Coordinates): boolean {
    const { latitude, longitude } = coordinates;
    
    // Limites aproximados de Angola
    const angolaBounds = {
      north: -4.376,
      south: -18.042,
      west: 11.679,
      east: 24.084,
    };

    return (
      latitude >= angolaBounds.south &&
      latitude <= angolaBounds.north &&
      longitude >= angolaBounds.west &&
      longitude <= angolaBounds.east
    );
  }

  /**
   * Geocodificação com debounce para evitar muitas chamadas
   */
  private static geocodingTimeout: NodeJS.Timeout | null = null;

  static async geocodeWithDebounce(
    address: string,
    callback: (result: GeocodingResult | null) => void,
    delay: number = 2000
  ): Promise<void> {
    // Limpar timeout anterior
    if (this.geocodingTimeout) {
      clearTimeout(this.geocodingTimeout);
    }

    // Definir novo timeout
    this.geocodingTimeout = setTimeout(async () => {
      const result = await this.getCoordinatesFromAddress(address);
      callback(result);
    }, delay);
  }

  /**
   * Calcular distância entre duas coordenadas (em km)
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