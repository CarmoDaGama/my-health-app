export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface HealthService {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'emergency' | 'laboratory';
  address: string;
  city: string;
  state: string;
  coordinates: Coordinates;
  phone: string;
  description: string;
}

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
