/**
 * Types for Advanced Search System
 * MENDLINK Phase 2: Advanced Search Implementation
 */

export interface SearchFilters {
  query?: string;
  type?: ServiceType[];
  specialties?: string[];
  distance?: number;
  city?: string;
  state?: string;
  rating?: number;
  acceptsInsurance?: boolean;
  emergencyService?: boolean;
  isOpen24h?: boolean;
}

export type ServiceType = 
  | 'hospital' 
  | 'clinic' 
  | 'pharmacy' 
  | 'emergency' 
  | 'laboratory' 
  | 'professional';

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'service' | 'specialty' | 'location' | 'facility';
  category?: string;
  metadata?: {
    count?: number;
    icon?: string;
  };
}

export interface SearchResult {
  services: import('./index').HealthService[];
  totalResults: number;
  searchTime: number;
  appliedFilters: SearchFilters;
  suggestions: SearchSuggestion[];
}

export interface QuickFilter {
  id: string;
  label: string;
  icon: string;
  filter: Partial<SearchFilters>;
  color: string;
}

export interface DistanceOption {
  value: number;
  label: string;
}

export const DISTANCE_OPTIONS: DistanceOption[] = [
  { value: 1, label: '1 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: -1, label: 'Any distance' },
];

export const SERVICE_TYPE_OPTIONS = [
  { value: 'hospital', label: 'Hospital', icon: 'medical', color: '#E53E3E' },
  { value: 'clinic', label: 'Clinic', icon: 'medical-outline', color: '#3182CE' },
  { value: 'pharmacy', label: 'Pharmacy', icon: 'medical-sharp', color: '#38A169' },
  { value: 'laboratory', label: 'Laboratory', icon: 'flask', color: '#9F7AEA' },
  { value: 'emergency', label: 'Emergency', icon: 'car-sport', color: '#DD6B20' },
  { value: 'professional', label: 'Professional', icon: 'person-circle', color: '#319795' },
] as const;

export const QUICK_FILTERS: QuickFilter[] = [
  {
    id: 'nearby',
    label: 'Nearby',
    icon: 'location',
    filter: { distance: 5 },
    color: '#3182CE',
  },
  {
    id: 'emergency',
    label: 'Emergency',
    icon: 'car-sport',
    filter: { type: ['emergency'], emergencyService: true },
    color: '#E53E3E',
  },
  {
    id: '24h',
    label: '24h Open',
    icon: 'time',
    filter: { isOpen24h: true },
    color: '#38A169',
  },
  {
    id: 'highly-rated',
    label: 'Top Rated',
    icon: 'star',
    filter: { rating: 4 },
    color: '#D69E2E',
  },
  {
    id: 'insurance',
    label: 'Insurance',
    icon: 'card',
    filter: { acceptsInsurance: true },
    color: '#9F7AEA',
  },
];

// Common medical specialties for auto-suggestions
export const MEDICAL_SPECIALTIES = [
  'General Medicine',
  'Cardiology',
  'Pediatrics',
  'Gynecology',
  'Dermatology',
  'Orthopedics',
  'Neurology',
  'Psychiatry',
  'Ophthalmology',
  'Otolaryngology',
  'Urology',
  'Endocrinology',
  'Rheumatology',
  'Gastroenterology',
  'Pneumology',
  'Oncology',
  'Physiotherapy',
  'Nutrition',
  'Psychology',
  'Emergency Medicine',
  'Anesthesiology',
  'Radiology',
  'Pathology',
  'Surgery',
  'Plastic Surgery',
  'Vascular Surgery',
  'Neurosurgery',
  'Dental Care',
  'Oral Surgery',
  'Orthodontics',
];