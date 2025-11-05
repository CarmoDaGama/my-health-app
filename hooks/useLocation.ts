import { useState, useEffect } from 'react';
import { Coordinates } from '../types';
import { LocationService, LocationResult } from '../services/location';

interface LocationState {
  location: Coordinates | null;
  loading: boolean;
  error: string | null;
  accuracy: number | null;
  address: string | null;
  timestamp: number | null;
}

export const useLocation = () => {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: true,
    error: null,
    accuracy: null,
    address: null,
    timestamp: null,
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('🔍 Hook useLocation: Obtendo localização...');
      
      // Usar o novo serviço de localização com fallbacks
      const locationResult = await LocationService.getLocationWithFallback();
      
      if (locationResult && LocationService.isValidCoordinates(locationResult.coordinates)) {
        console.log('✅ Hook useLocation: Localização válida obtida:', locationResult.coordinates);
        setState({
          location: locationResult.coordinates,
          loading: false,
          error: null,
          accuracy: locationResult.accuracy,
          address: locationResult.address || null,
          timestamp: locationResult.timestamp,
        });
      } else {
        console.log('⚠️ Hook useLocation: Não foi possível obter localização válida');
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Não foi possível obter localização válida',
        }));
      }
    } catch (error: any) {
      console.error('❌ Hook useLocation: Erro ao obter localização:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Falha ao obter localização',
      }));
    }
  };

  const getCurrentLocationPrecise = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('🎯 Hook useLocation: Obtendo localização precisa (sem fallbacks)...');
      
      // Usar método direto para maior precisão (sem fallbacks)
      const locationResult = await LocationService.getCurrentLocation();
      
      if (locationResult && LocationService.isValidCoordinates(locationResult.coordinates)) {
        console.log('✅ Hook useLocation: Localização precisa obtida:', locationResult.coordinates);
        setState({
          location: locationResult.coordinates,
          loading: false,
          error: null,
          accuracy: locationResult.accuracy,
          address: locationResult.address || null,
          timestamp: locationResult.timestamp,
        });
      } else {
        console.log('⚠️ Hook useLocation: Localização precisa não disponível');
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Permissão negada ou GPS não disponível',
        }));
      }
    } catch (error: any) {
      console.error('❌ Hook useLocation: Erro ao obter localização precisa:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Falha ao obter localização precisa',
      }));
    }
  };

  return {
    ...state,
    refetch: getCurrentLocation,
    getCurrentLocationPrecise,
    isLocationInAngola: state.location ? LocationService.isLocationInAngola(state.location) : null,
  };
};
