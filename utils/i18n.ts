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
    },
    services: {
      hospital: 'Hospital',
      clinic: 'Clinic', 
      pharmacy: 'Pharmacy',
      emergency: 'Emergency',
      laboratory: 'Laboratory',
    },
    screens: {
      home: 'Home',
      map: 'Map',
      list: 'List',
      details: 'Details',
    },
    actions: {
      search: 'Search',
      cancel: 'Cancel',
      ok: 'OK',
      call: 'Call',
      directions: 'Directions',
      back: 'Back',
    },
    details: {
      phone: 'Phone',
      address: 'Address',
      description: 'Description',
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
    },
    services: {
      hospital: 'Hospital',
      clinic: 'Clínica',
      pharmacy: 'Farmácia',
      emergency: 'Emergência',
      laboratory: 'Laboratório',
    },
    screens: {
      home: 'Início',
      map: 'Mapa',
      list: 'Lista',
      details: 'Detalhes',
    },
    actions: {
      search: 'Buscar',
      cancel: 'Cancelar',
      ok: 'OK',
      call: 'Ligar',
      directions: 'Direções',
      back: 'Voltar',
    },
    details: {
      phone: 'Telefone',
      address: 'Endereço',
      description: 'Descrição',
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
