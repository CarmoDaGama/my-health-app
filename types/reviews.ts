/**
 * MENDLINK - Sistema de Reviews Temáticos
 * Tipos TypeScript para avaliações categorizadas
 */

export interface ReviewCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  weight: number; // Peso para cálculo da nota geral (0-1)
  applicableToTypes: ServiceType[]; // Tipos de serviço onde se aplica
}

export type ServiceType = 'hospital' | 'clinic' | 'pharmacy' | 'laboratory' | 'professional' | 'emergency' | 'rehabilitation';

export interface CategoryRating {
  categoryId: string;
  rating: number; // 1-5 estrelas
  comment?: string;
}

export interface ThematicReview {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceType: ServiceType;
  userId: string;
  userName: string;
  userAvatar?: string;
  
  // Ratings por categoria (como objeto para compatibilidade Firestore)
  categoryRatings: Record<string, number>;
  
  // Nota geral calculada automaticamente
  overallRating: number;
  
  // Comentário geral opcional
  generalComment?: string;
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
  verified: boolean; // Se o usuário realmente usou o serviço
  helpful: number; // Quantas pessoas marcaram como útil
  reportCount: number; // Número de denúncias
  
  // Context da visita
  visitContext?: {
    visitDate: Date;
    visitType: 'emergency' | 'routine' | 'consultation' | 'exam' | 'procedure';
    waitTime?: number; // Em minutos
    costRange?: 'low' | 'medium' | 'high';
  };
}

export interface ServiceInsights {
  serviceId: string;
  serviceName: string;
  serviceType: ServiceType;
  
  // Estatísticas por categoria
  categoryStats: {
    categoryId: string;
    averageRating: number;
    reviewCount: number;
    trend: 'improving' | 'declining' | 'stable';
    percentile: number; // Posição vs outros serviços similares (0-100)
  }[];
  
  // Nota geral
  overallRating: number;
  totalReviews: number;
  
  // Insights automáticos
  insights: {
    id: string;
    type: 'strength' | 'weakness' | 'trend' | 'recommendation';
    priority: 'high' | 'medium' | 'low';
    category: string;
    message: string;
    supportingData: any;
    generatedAt: Date;
  }[];
  
  // Comparações
  comparison: {
    betterThan: number; // % de serviços similares que é melhor
    categoryRankings: {
      categoryId: string;
      rank: number;
      totalInCategory: number;
    }[];
  };
  
  // Padrões temporais
  timePatterns: {
    bestDaysOfWeek: string[];
    bestTimesOfDay: string[];
    avgWaitTimeByPeriod: Record<string, number>;
  };
  
  lastUpdated: Date;
}

export interface ReviewFilter {
  serviceTypes?: ServiceType[];
  categories?: string[];
  ratingRange?: [number, number];
  dateRange?: [Date, Date];
  verified?: boolean;
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
}

// Predefined categories for different service types
export const REVIEW_CATEGORIES: Record<ServiceType, ReviewCategory[]> = {
  hospital: [
    {
      id: 'infrastructure',
      name: 'Infrastructure',
      icon: 'business',
      description: 'Facilities, equipment and physical environment',
      weight: 0.2,
      applicableToTypes: ['hospital', 'clinic', 'laboratory', 'rehabilitation']
    },
    {
      id: 'medical_care',
      name: 'Medical Care',
      icon: 'medical',
      description: 'Quality of medical and nursing care',
      weight: 0.3,
      applicableToTypes: ['hospital', 'clinic', 'emergency', 'professional']
    },
    {
      id: 'wait_time',
      name: 'Wait Time',
      icon: 'time',
      description: 'Time between arrival and service',
      weight: 0.2,
      applicableToTypes: ['hospital', 'clinic', 'emergency', 'laboratory']
    },
    {
      id: 'cleanliness',
      name: 'Cleanliness and Hygiene',
      icon: 'shield-checkmark',
      description: 'Facility cleanliness and hygiene protocols',
      weight: 0.15,
      applicableToTypes: ['hospital', 'clinic', 'laboratory', 'pharmacy']
    },
    {
      id: 'cost_benefit',
      name: 'Cost-Benefit',
      icon: 'card',
      description: 'Relationship between price charged and service quality',
      weight: 0.1,
      applicableToTypes: ['hospital', 'clinic', 'professional', 'pharmacy']
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      icon: 'accessibility',
      description: 'Facilities for people with special needs',
      weight: 0.05,
      applicableToTypes: ['hospital', 'clinic', 'pharmacy', 'laboratory']
    }
  ],
  clinic: [
    {
      id: 'medical_care',
      name: 'Medical Care',
      icon: 'medical',
      description: 'Quality of medical care',
      weight: 0.35,
      applicableToTypes: ['clinic', 'professional']
    },
    {
      id: 'wait_time',
      name: 'Punctuality',
      icon: 'time',
      description: 'Respect for scheduled appointments',
      weight: 0.25,
      applicableToTypes: ['clinic', 'professional']
    },
    {
      id: 'infrastructure',
      name: 'Facilities',
      icon: 'business',
      description: 'Quality of facilities and equipment',
      weight: 0.2,
      applicableToTypes: ['clinic']
    },
    {
      id: 'communication',
      name: 'Communication',
      icon: 'chatbubbles',
      description: 'Clarity in communication and explanations',
      weight: 0.15,
      applicableToTypes: ['clinic', 'professional']
    },
    {
      id: 'cost_benefit',
      name: 'Cost-Benefit',
      icon: 'card',
      description: 'Relationship between price and quality',
      weight: 0.05,
      applicableToTypes: ['clinic', 'professional']
    }
  ],
  pharmacy: [
    {
      id: 'availability',
      name: 'Disponibilidade',
      icon: 'checkmark-circle',
      description: 'Medications always in stock',
      weight: 0.4,
      applicableToTypes: ['pharmacy']
    },
    {
      id: 'service_speed',
      name: 'Service Speed',
      icon: 'flash',
      description: 'Speed of service',
      weight: 0.25,
      applicableToTypes: ['pharmacy']
    },
    {
      id: 'staff_knowledge',
      name: 'Staff Knowledge',
      icon: 'school',
      description: 'Knowledge about medications and guidance',
      weight: 0.2,
      applicableToTypes: ['pharmacy']
    },
    {
      id: 'cleanliness',
      name: 'Organização',
      icon: 'library',
      description: 'Organization and cleanliness of pharmacy',
      weight: 0.1,
      applicableToTypes: ['pharmacy']
    },
    {
      id: 'pricing',
      name: 'Prices',
      icon: 'pricetag',
      description: 'Fair and competitive prices',
      weight: 0.05,
      applicableToTypes: ['pharmacy']
    }
  ],
  laboratory: [
    {
      id: 'accuracy',
      name: 'Test Accuracy',
      icon: 'analytics',
      description: 'Reliability and accuracy of results',
      weight: 0.4,
      applicableToTypes: ['laboratory']
    },
    {
      id: 'delivery_time',
      name: 'Delivery Time',
      icon: 'time',
      description: 'Compliance with promised deadlines',
      weight: 0.25,
      applicableToTypes: ['laboratory']
    },
    {
      id: 'collection_process',
      name: 'Collection Process',
      icon: 'medical',
      description: 'Quality and comfort during collection',
      weight: 0.2,
      applicableToTypes: ['laboratory']
    },
    {
      id: 'cleanliness',
      name: 'Hygiene',
      icon: 'shield-checkmark',
      description: 'Cleanliness and security protocols',
      weight: 0.1,
      applicableToTypes: ['laboratory']
    },
    {
      id: 'cost_benefit',
      name: 'Custo-Benefício',
      icon: 'card',
      description: 'Price vs service quality',
      weight: 0.05,
      applicableToTypes: ['laboratory']
    }
  ],
  professional: [
    {
      id: 'expertise',
      name: 'Competência Técnica',
      icon: 'school',
      description: 'Conhecimento e habilidades profissionais',
      weight: 0.35,
      applicableToTypes: ['professional']
    },
    {
      id: 'communication',
      name: 'Comunicação',
      icon: 'chatbubbles',
      description: 'Clareza e empatia na comunicação',
      weight: 0.25,
      applicableToTypes: ['professional']
    },
    {
      id: 'punctuality',
      name: 'Pontualidade',
      icon: 'time',
      description: 'Respeito aos horários marcados',
      weight: 0.2,
      applicableToTypes: ['professional']
    },
    {
      id: 'availability',
      name: 'Disponibilidade',
      icon: 'calendar',
      description: 'Facilidade para agendar consultas',
      weight: 0.15,
      applicableToTypes: ['professional']
    },
    {
      id: 'cost_benefit',
      name: 'Custo-Benefício',
      icon: 'card',
      description: 'Valor cobrado vs qualidade do atendimento',
      weight: 0.05,
      applicableToTypes: ['professional']
    }
  ],
  emergency: [
    {
      id: 'response_time',
      name: 'Tempo de Resposta',
      icon: 'flash',
      description: 'Rapidez no atendimento de emergência',
      weight: 0.4,
      applicableToTypes: ['emergency', 'hospital']
    },
    {
      id: 'medical_care',
      name: 'Qualidade do Atendimento',
      icon: 'medical',
      description: 'Competência no atendimento de emergência',
      weight: 0.35,
      applicableToTypes: ['emergency', 'hospital']
    },
    {
      id: 'equipment',
      name: 'Equipamentos',
      icon: 'hardware-chip',
      description: 'Disponibilidade e qualidade dos equipamentos',
      weight: 0.15,
      applicableToTypes: ['emergency', 'hospital']
    },
    {
      id: 'organization',
      name: 'Organização',
      icon: 'list',
      description: 'Organização do fluxo de atendimento',
      weight: 0.1,
      applicableToTypes: ['emergency', 'hospital']
    }
  ],
  rehabilitation: [
    {
      id: 'treatment_quality',
      name: 'Qualidade do Tratamento',
      icon: 'fitness',
      description: 'Eficácia dos tratamentos oferecidos',
      weight: 0.4,
      applicableToTypes: ['rehabilitation']
    },
    {
      id: 'professional_care',
      name: 'Atendimento Profissional',
      icon: 'people',
      description: 'Qualidade do atendimento da equipe',
      weight: 0.25,
      applicableToTypes: ['rehabilitation']
    },
    {
      id: 'infrastructure',
      name: 'Equipamentos',
      icon: 'barbell',
      description: 'Qualidade e variedade dos equipamentos',
      weight: 0.2,
      applicableToTypes: ['rehabilitation']
    },
    {
      id: 'progress_tracking',
      name: 'Acompanhamento',
      icon: 'trending-up',
      description: 'Acompanhamento da evolução do paciente',
      weight: 0.1,
      applicableToTypes: ['rehabilitation']
    },
    {
      id: 'accessibility',
      name: 'Acessibilidade',
      icon: 'accessibility',
      description: 'Facilidades para pessoas com limitações',
      weight: 0.05,
      applicableToTypes: ['rehabilitation']
    }
  ]
};