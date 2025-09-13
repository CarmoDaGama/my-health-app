export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Schedule {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface HealthService {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'emergency' | 'laboratory' | 'professional';
  address: string;
  city: string;
  state: string;
  country?: string;
  coordinates: Coordinates;
  phone: string;
  description: string;
  rating?: number;
  reviews?: number;
  services?: string[];
  
  // Propriedades específicas para profissionais
  specialty?: string;
  clinic?: string;
  email?: string;
  schedule?: Schedule;
  education?: string;
  experience?: string;
}

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
