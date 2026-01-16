/**
 * Lista de especialidades médicas disponíveis
 * Chaves para tradução no sistema i18n
 */

export const MEDICAL_SPECIALTIES_KEYS = [
  'specialties.cardiology',
  'specialties.dermatology',
  'specialties.endocrinology',
  'specialties.gastroenterology',
  'specialties.gynecology',
  'specialties.neurology',
  'specialties.ophthalmology',
  'specialties.orthopedics',
  'specialties.otolaryngology',
  'specialties.pediatrics',
  'specialties.pneumology',
  'specialties.psychiatry',
  'specialties.radiology',
  'specialties.urology',
  'specialties.anesthesiology',
  'specialties.generalSurgery',
  'specialties.generalMedicine',
  'specialties.familyMedicine',
  'specialties.internalMedicine',
  'specialties.occupationalMedicine',
  'specialties.preventiveMedicine',
  'specialties.physiatry',
  'specialties.geriatrics',
  'specialties.hematology',
  'specialties.infectiology',
  'specialties.nephrology',
  'specialties.neonatology',
  'specialties.oncology',
  'specialties.pathology',
  'specialties.rheumatology'
];

// Default values in Portuguese (for compatibility)
export const MEDICAL_SPECIALTIES = [
  'Cardiologia',
  'Dermatologia', 
  'Endocrinologia',
  'Gastroenterologia',
  'Ginecologia',
  'Neurologia',
  'Oftalmologia',
  'Ortopedia',
  'Otorrinolaringologia',
  'Pediatria',
  'Pneumologia',
  'Psiquiatria',
  'Radiologia',
  'Urologia',
  'Anestesiologia',
  'Cirurgia Geral',
  'Clínica Geral',
  'Medicina de Família',
  'Medicina Interna',
  'Medicina do Trabalho',
  'Medicina Preventiva',
  'Fisiatria',
  'Geriatria',
  'Hematologia',
  'Infectologia',
  'Nefrologia',
  'Neonatologia',
  'Oncologia',
  'Patologia',
  'Reumatologia'
];

export const INSTITUTION_SPECIALTIES = [
  'Hospital Geral',
  'Hospital Especializado', 
  'Clínica Médica',
  'Clínica Especializada',
  'Centro de Diagnóstico',
  'Laboratório de Análises',
  'Centro de Fisioterapia',
  'Centro de Reabilitação',
  'Maternidade',
  'Centro Pediátrico',
  'Centro Cardiológico',
  'Centro Oncológico',
  'Centro de Medicina Preventiva',
  'Farmácia',
  'Centro de Vacinação',
  'Centro de Medicina do Trabalho',
  'Centro de Medicina Estética',
  'Centro de Psicologia',
  'Centro de Nutrição',
  'Centro de Medicina Alternativa'
];

/**
 * Retorna a lista de especialidades traduzidas
 * @param t - Função de tradução do i18n
 * @returns Array de especialidades traduzidas
 */
export const getTranslatedSpecialties = (t: (key: string) => string): string[] => {
  return MEDICAL_SPECIALTIES_KEYS.map(key => t(key));
};

/**
 * Chaves para serviços disponíveis dos profissionais
 */
export const PROFESSIONAL_SERVICES_KEYS = [
  'professionalServices.generalConsultations',
  'professionalServices.cardiology',
  'professionalServices.pediatrics',
  'professionalServices.gynecology',
  'professionalServices.dermatology',
  'professionalServices.orthopedics',
  'professionalServices.neurology',
  'professionalServices.psychiatry',
  'professionalServices.ophthalmology',
  'professionalServices.otolaryngology',
  'professionalServices.urology',
  'professionalServices.endocrinology',
  'professionalServices.rheumatology',
  'professionalServices.gastroenterology',
  'professionalServices.pneumology',
  'professionalServices.oncology',
  'professionalServices.physiotherapy',
  'professionalServices.nutrition',
  'professionalServices.psychology',
  'professionalServices.emergency',
  'professionalServices.generalSurgery',
];

/**
 * Retorna a lista de serviços traduzidos
 * @param t - Função de tradução do i18n
 * @returns Array de serviços traduzidos
 */
export const getTranslatedServices = (t: (key: string) => string): string[] => {
  return PROFESSIONAL_SERVICES_KEYS.map(key => t(key));
};
