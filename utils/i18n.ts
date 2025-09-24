import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';

// Traduções
const translations = {
  en: {
    app: {
      title: 'Health Services Locator',
      search: 'Search health services...',
      noResults: 'No services found',
      loading: 'Loading...',
      locationPermission: 'Location permission required',
      locationPermissionMessage: 'Please allow location access to find nearby services',
      mapLoading: 'Loading map...',
      gettingLocation: 'Getting your location...',
      optimizingView: 'Optimizing view...',
    },
    services: {
      hospital: 'Hospital',
      clinic: 'Clinic', 
      pharmacy: 'Pharmacy',
      emergency: 'Emergency',
      laboratory: 'Laboratory',
      professional: 'Professional',
    },
    serviceTypes: {
      all: 'All Services',
      professionals: 'Health Professionals',
      institutions: 'Health Institutions',
      others: 'Other Services',
    },
    screens: {
      home: 'Home',
      map: 'Map',
      list: 'List',
      details: 'Details',
      profile: 'Profile',
      welcome: 'Welcome',
    },
    actions: {
      search: 'Search',
      cancel: 'Cancel',
      ok: 'OK',
      call: 'Call',
      directions: 'Directions',
      back: 'Back',
      retry: 'Try Again',
      dismiss: 'Dismiss',
      clearCache: 'Clear Cache',
    },
    details: {
      phone: 'Phone',
      address: 'Address',
      description: 'Description',
      rating: 'Rating',
      hours: 'Hours',
      services: 'Services',
      specialties: 'Specialties',
    },
    errors: {
      title: 'Error',
      networkError: 'Connection error. Check your internet and try again.',
      locationError: 'Unable to get location',
      locationDenied: 'Location permission is required to use this feature.',
      loadingServices: 'Error loading health services',
      unexpectedError: 'An unexpected error occurred',
      invalidCoordinates: 'Coordinates are outside Angolan territory',
      invalidPhone: 'Invalid phone number format',
      phoneRequired: 'Phone number is required',
    },
    validation: {
      phoneValid: 'Valid number',
      operator: 'Operator',
      phoneFormat: 'Format: +244 9XX XXX XXX',
      required: 'Required',
      invalid: 'Invalid',
    },
    cache: {
      cleared: 'Cache cleared successfully',
      stats: 'Cache Statistics',
      totalItems: 'Total items',
      validItems: 'Valid items',
      expiredItems: 'Expired items',
    }
  },
  pt: {
    app: {
      title: 'Localizador de Serviços de Saúde',
      search: 'Buscar serviços de saúde...',
      noResults: 'Nenhum serviço encontrado',
      loading: 'Carregando...',
      locationPermission: 'Permissão de localização necessária',
      locationPermissionMessage: 'Por favor, permita o acesso à localização para encontrar serviços próximos',
      mapLoading: 'Carregando mapa...',
      gettingLocation: 'Obtendo sua localização...',
      optimizingView: 'Otimizando visualização...',
    },
    services: {
      hospital: 'Hospital',
      clinic: 'Clínica',
      pharmacy: 'Farmácia',
      emergency: 'Emergência',
      laboratory: 'Laboratório',
      professional: 'Profissional',
    },
    serviceTypes: {
      all: 'Todos os Serviços',
      professionals: 'Profissionais de Saúde',
      institutions: 'Instituições de Saúde',
      others: 'Outros Serviços',
    },
    screens: {
      home: 'Início',
      map: 'Mapa',
      list: 'Lista',
      details: 'Detalhes',
      profile: 'Perfil',
      welcome: 'Bem-vindo',
    },
    actions: {
      search: 'Buscar',
      cancel: 'Cancelar',
      ok: 'OK',
      call: 'Ligar',
      directions: 'Direções',
      back: 'Voltar',
      retry: 'Tentar Novamente',
      dismiss: 'Dispensar',
      clearCache: 'Limpar Cache',
    },
    details: {
      phone: 'Telefone',
      address: 'Endereço',
      description: 'Descrição',
      rating: 'Avaliação',
      hours: 'Horários',
      services: 'Serviços',
      specialties: 'Especialidades',
    },
    errors: {
      title: 'Erro',
      networkError: 'Erro de conexão. Verifique sua internet e tente novamente.',
      locationError: 'Não foi possível obter a localização',
      locationDenied: 'É necessário permitir o acesso à localização para usar esta funcionalidade.',
      loadingServices: 'Erro ao carregar serviços de saúde',
      unexpectedError: 'Ocorreu um erro inesperado',
      invalidCoordinates: 'Coordenadas estão fora do território angolano',
      invalidPhone: 'Formato de telefone inválido',
      phoneRequired: 'Número de telefone é obrigatório',
    },
    validation: {
      phoneValid: 'Número válido',
      operator: 'Operadora',
      phoneFormat: 'Formato: +244 9XX XXX XXX',
      required: 'Obrigatório',
      invalid: 'Inválido',
    },
    cache: {
      cleared: 'Cache limpo com sucesso',
      stats: 'Estatísticas do Cache',
      totalItems: 'Total de itens',
      validItems: 'Itens válidos',
      expiredItems: 'Itens expirados',
    }
  }
};

// Configuração do i18n
const i18n = new I18n(translations);

// Configuração de fallback
i18n.enableFallback = true;
i18n.defaultLocale = 'pt';

// Detectar idioma do dispositivo
const deviceLanguage = getLocales()[0]?.languageCode || 'pt';
i18n.locale = translations[deviceLanguage as keyof typeof translations] ? deviceLanguage : 'pt';

export default i18n;
