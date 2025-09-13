// Configurações de API
export const API_CONFIG = {
  // OSRM - Open Source Routing Machine (gratuito, sem chave necessária)
  OSRM_BASE_URL: 'https://router.project-osrm.org',
  
  // GraphHopper API pública (gratuita, sem chave para uso básico)
  GRAPHHOPPER_BASE_URL: 'https://graphhopper.com/api/1',
  
  // Nominatim para geocoding (não precisa de chave)
  NOMINATIM_BASE_URL: 'https://nominatim.openstreetmap.org',
};

export const ROUTE_PROFILES = {
  DRIVING: 'driving',
  WALKING: 'walking',
  CYCLING: 'cycling',
} as const;

// Mapeamento para diferentes APIs
export const OSRM_PROFILES = {
  DRIVING: 'car',
  WALKING: 'foot', 
  CYCLING: 'bike',
} as const;
