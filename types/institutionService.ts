/**
 * Tipos para gerenciamento de serviços institucionais
 */

export interface InstitutionService {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  status: ServiceStatus;
  responsible: string;
  department: string;
  price: number;
  duration: number; // em minutos
  isAvailable: boolean;
  institutionId: string;
  requirements?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export enum ServiceCategory {
  CONSULTATION = 'consultation',
  EXAM = 'exam',
  PROCEDURE = 'procedure',
  EMERGENCY = 'emergency',
  ADMINISTRATIVE = 'administrative',
  LABORATORY = 'laboratory',
  IMAGING = 'imaging',
  THERAPY = 'therapy',
  VACCINATION = 'vaccination',
  OTHER = 'other'
}

export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  SUSPENDED = 'suspended'
}

export interface CreateServiceData {
  name: string;
  description: string;
  category: ServiceCategory;
  responsible: string;
  department: string;
  price: number;
  duration: number;
  requirements?: string[];
  tags?: string[];
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  status?: ServiceStatus;
  isAvailable?: boolean;
}

export interface ServiceFilters {
  category?: ServiceCategory;
  status?: ServiceStatus;
  department?: string;
  responsible?: string;
  isAvailable?: boolean;
  search?: string;
}

export interface ServiceStats {
  total: number;
  active: number;
  inactive: number;
  byCategory: Record<ServiceCategory, number>;
  byDepartment: Record<string, number>;
}

// Interface para compatibilidade com tipos existentes
export interface InstitutionServiceResponse {
  services: InstitutionService[];
  stats: ServiceStats;
  hasMore: boolean;
  lastId?: string;
}
