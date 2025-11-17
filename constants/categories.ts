/**
 * Healthcare Service Categories and Visual System
 * MENDLINK Phase 2: Visual Categorization System
 */

export interface ServiceCategory {
  id: string;
  name: string;
  color: string;
  darkColor: string; // For dark mode or hover states
  icon: string;
  description: string;
  subcategories?: string[];
  priority: number; // For sorting (1 = highest priority)
}

export const HEALTHCARE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'emergency',
    name: 'Emergency Services',
    color: '#E53E3E', // Red
    darkColor: '#C53030',
    icon: '🚑',
    description: 'Emergency medical services, urgent care, and trauma centers',
    subcategories: ['Emergency Room', 'Urgent Care', 'Trauma Center', 'Ambulance Service'],
    priority: 1,
  },
  {
    id: 'hospital',
    name: 'Hospitals',
    color: '#3182CE', // Blue
    darkColor: '#2B6CB0',
    icon: '🏥',
    description: 'General and specialized hospitals',
    subcategories: ['General Hospital', 'Teaching Hospital', 'Specialty Hospital', 'Private Hospital'],
    priority: 2,
  },
  {
    id: 'clinic',
    name: 'Clinics',
    color: '#38A169', // Green
    darkColor: '#2F855A',
    icon: '🏩',
    description: 'Medical clinics and outpatient facilities',
    subcategories: ['Family Clinic', 'Specialist Clinic', 'Walk-in Clinic', 'Community Health Center'],
    priority: 3,
  },
  {
    id: 'pharmacy',
    name: 'Pharmacies',
    color: '#D69E2E', // Orange/Yellow
    darkColor: '#B7791F',
    icon: '💊',
    description: 'Pharmacies and drug stores',
    subcategories: ['Retail Pharmacy', 'Hospital Pharmacy', 'Online Pharmacy', '24-Hour Pharmacy'],
    priority: 4,
  },
  {
    id: 'laboratory',
    name: 'Laboratories',
    color: '#9F7AEA', // Purple
    darkColor: '#805AD5',
    icon: '🔬',
    description: 'Medical laboratories and diagnostic centers',
    subcategories: ['Clinical Lab', 'Pathology Lab', 'Imaging Center', 'Blood Bank'],
    priority: 5,
  },
  {
    id: 'specialist',
    name: 'Specialists',
    color: '#319795', // Teal
    darkColor: '#2C7A7B',
    icon: '👨‍⚕️',
    description: 'Medical specialists and specialized care',
    subcategories: ['Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'Orthopedics'],
    priority: 6,
  },
  {
    id: 'dental',
    name: 'Dental Care',
    color: '#E2E8F0', // Light Gray
    darkColor: '#A0AEC0',
    icon: '🦷',
    description: 'Dental clinics and oral health services',
    subcategories: ['General Dentistry', 'Orthodontics', 'Oral Surgery', 'Pediatric Dentistry'],
    priority: 7,
  },
  {
    id: 'mental_health',
    name: 'Mental Health',
    color: '#ED64A6', // Pink
    darkColor: '#D53F8C',
    icon: '🧠',
    description: 'Mental health and psychological services',
    subcategories: ['Psychology', 'Psychiatry', 'Counseling', 'Therapy Centers'],
    priority: 8,
  },
  {
    id: 'rehabilitation',
    name: 'Rehabilitation',
    color: '#68D391', // Light Green
    darkColor: '#48BB78',
    icon: '🏃‍♂️',
    description: 'Physical therapy and rehabilitation services',
    subcategories: ['Physical Therapy', 'Occupational Therapy', 'Speech Therapy', 'Sports Medicine'],
    priority: 9,
  },
  {
    id: 'alternative',
    name: 'Alternative Medicine',
    color: '#F6AD55', // Light Orange
    darkColor: '#ED8936',
    icon: '🌿',
    description: 'Alternative and complementary medicine',
    subcategories: ['Acupuncture', 'Homeopathy', 'Herbal Medicine', 'Chiropractic'],
    priority: 10,
  },
];

// Default category for services that don't match any specific category
export const DEFAULT_CATEGORY: ServiceCategory = {
  id: 'general',
  name: 'General Healthcare',
  color: '#718096', // Gray
  darkColor: '#4A5568',
  icon: '🏥',
  description: 'General healthcare services',
  priority: 99,
};

/**
 * Map service types to categories
 */
export const SERVICE_TYPE_CATEGORY_MAP: Record<string, string> = {
  // Direct matches
  'emergency': 'emergency',
  'hospital': 'hospital',
  'clinic': 'clinic',
  'pharmacy': 'pharmacy',
  'laboratory': 'laboratory',
  'specialist': 'specialist',
  'professional': 'specialist',
  'dental': 'dental',
  'dentist': 'dental',
  
  // Alternative names
  'urgent_care': 'emergency',
  'trauma_center': 'emergency',
  'medical_center': 'hospital',
  'health_center': 'clinic',
  'family_clinic': 'clinic',
  'drug_store': 'pharmacy',
  'diagnostic_center': 'laboratory',
  'imaging_center': 'laboratory',
  'mental_health': 'mental_health',
  'psychology': 'mental_health',
  'psychiatry': 'mental_health',
  'therapy': 'rehabilitation',
  'physiotherapy': 'rehabilitation',
  'alternative_medicine': 'alternative',
};

/**
 * Get category by service type
 */
export function getCategoryByType(serviceType: string): ServiceCategory {
  const normalizedType = serviceType.toLowerCase().replace(/\s+/g, '_');
  const categoryId = SERVICE_TYPE_CATEGORY_MAP[normalizedType];
  
  if (categoryId) {
    const category = HEALTHCARE_CATEGORIES.find(cat => cat.id === categoryId);
    if (category) return category;
  }
  
  return DEFAULT_CATEGORY;
}

/**
 * Get category by ID
 */
export function getCategoryById(categoryId: string): ServiceCategory {
  const category = HEALTHCARE_CATEGORIES.find(cat => cat.id === categoryId);
  return category || DEFAULT_CATEGORY;
}

/**
 * Get all categories sorted by priority
 */
export function getAllCategories(): ServiceCategory[] {
  return [...HEALTHCARE_CATEGORIES].sort((a, b) => a.priority - b.priority);
}

/**
 * Get category color for service
 */
export function getServiceColor(serviceType: string, darkMode: boolean = false): string {
  const category = getCategoryByType(serviceType);
  return darkMode ? category.darkColor : category.color;
}

/**
 * Get category icon for service
 */
export function getServiceIcon(serviceType: string): string {
  const category = getCategoryByType(serviceType);
  return category.icon;
}

/**
 * Color palette for quick access
 */
export const CATEGORY_COLORS = {
  emergency: '#E53E3E',
  hospital: '#3182CE',
  clinic: '#38A169',
  pharmacy: '#D69E2E',
  laboratory: '#9F7AEA',
  specialist: '#319795',
  dental: '#E2E8F0',
  mental_health: '#ED64A6',
  rehabilitation: '#68D391',
  alternative: '#F6AD55',
  general: '#718096',
} as const;

/**
 * Category statistics interface
 */
export interface CategoryStats {
  categoryId: string;
  name: string;
  color: string;
  count: number;
  percentage: number;
}

/**
 * Calculate category distribution from services
 */
export function calculateCategoryStats(services: any[]): CategoryStats[] {
  const categoryCount: Record<string, number> = {};
  const total = services.length;
  
  // Count services by category
  services.forEach(service => {
    const category = getCategoryByType(service.type || 'general');
    categoryCount[category.id] = (categoryCount[category.id] || 0) + 1;
  });
  
  // Convert to stats array
  return Object.entries(categoryCount).map(([categoryId, count]) => {
    const category = getCategoryById(categoryId);
    return {
      categoryId,
      name: category.name,
      color: category.color,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    };
  }).sort((a, b) => b.count - a.count); // Sort by count descending
}