import { useState, useEffect, useCallback } from 'react';
import i18n, { 
  determineLanguage, 
  setLanguage, 
  getAvailableLanguages,
  saveUserLanguagePreference
} from '../utils/i18n';
import { getLocales } from 'expo-localization';
import { getCountryConfig, DEFAULT_COUNTRY } from '../utils/countries';

// Estado global para forçar re-render quando idioma muda
let globalTranslationUpdateId = 0;
const globalTranslationListeners: Set<(id: number) => void> = new Set();

const notifyTranslationChange = () => {
  globalTranslationUpdateId++;
  console.log('🔄 Notificando mudança de idioma para', globalTranslationListeners.size, 'componentes');
  globalTranslationListeners.forEach(listener => {
    try {
      listener(globalTranslationUpdateId);
    } catch (error) {
      console.warn('Erro em listener de tradução:', error);
    }
  });
};

export const useTranslation = () => {
  const [locale, setLocale] = useState(i18n.locale);
  const [isInitialized, setIsInitialized] = useState(false);
  const [translationUpdateId, setTranslationUpdateId] = useState(0);

  /**
   * Inicializa o idioma com base nas preferências do usuário
   */
  const initializeLanguage = useCallback(async (isGuest: boolean = false, userPreferredLanguage?: string) => {
    try {
      const determinedLanguage = await determineLanguage(isGuest, userPreferredLanguage);
      setLanguage(determinedLanguage);
      setLocale(determinedLanguage);
      setIsInitialized(true);
      
      // Notificar sobre inicialização/mudança
      notifyTranslationChange();
    } catch (error) {
      console.warn('Erro ao inicializar idioma:', error);
      // Fallback para inglês
      setLanguage('en');
      setLocale('en');
      setIsInitialized(true);
      notifyTranslationChange();
    }
  }, []);

  // Registrar listener para mudanças globais de tradução
  useEffect(() => {
    const listener = (updateId: number) => {
      console.log('📱 Componente recebeu atualização de idioma:', updateId);
      setLocale(i18n.locale);
      setTranslationUpdateId(updateId);
    };
    
    globalTranslationListeners.add(listener);
    console.log('✅ Listener registrado. Total de listeners:', globalTranslationListeners.size);
    
    return () => {
      globalTranslationListeners.delete(listener);
      console.log('🗑️ Listener removido. Total de listeners:', globalTranslationListeners.size);
    };
  }, []);

  useEffect(() => {
    // Inicializar com idioma padrão se ainda não foi inicializado
    if (!isInitialized) {
      initializeLanguage();
    }
  }, [initializeLanguage, isInitialized]);

  const t = (key: string, options?: object) => {
    // Usar translationUpdateId para garantir re-render quando idioma muda
    const translation = i18n.t(key, options);
    // Log para debug (remover em produção)
    if (translationUpdateId > 0) {
      console.log(`🔤 Traduzindo "${key}" (updateId: ${translationUpdateId}):`, translation);
    }
    return translation;
  };

  const changeLanguage = async (newLocale: string, isGuest: boolean = false) => {
    try {
      setLanguage(newLocale);
      setLocale(newLocale);
      
      // Sempre salvar a preferência localmente para persistência
      await saveUserLanguagePreference(newLocale);
      
      // Notificar todos os componentes sobre mudança de idioma
      notifyTranslationChange();
    } catch (error) {
      console.warn('Erro ao alterar idioma:', error);
    }
  };

  const getCurrentLocale = () => locale;

  const getAvailableLocales = () => getAvailableLanguages();

  const isRTL = () => {
    // Angola usa escrita da esquerda para direita
    return false;
  };

  // Funções de conveniência para traduções comuns
  const tError = (key: string) => t(`errors.${key}`);
  const tAction = (key: string) => t(`actions.${key}`);
  const tService = (key: string) => t(`services.${key}`);
  const tScreen = (key: string) => t(`screens.${key}`);
  const tValidation = (key: string) => t(`validation.${key}`);

  return {
    t,
    tError,
    tAction,
    tService,
    tScreen,
    tValidation,
    changeLanguage,
    getCurrentLocale,
    getAvailableLocales,
    isRTL,
    locale,
    isInitialized,
    initializeLanguage,
  };
};

// Hook para formatação de números e datas internacionais
export const useLocalization = () => {
  const { locale } = useTranslation();

  const formatCurrency = (amount: number, countryCode?: string) => {
    // Obter configuração do país atual ou padrão
    const targetCountry = countryCode || DEFAULT_COUNTRY;
    const countryConfig = getCountryConfig(targetCountry);
    
    if (!countryConfig) {
      // Fallback para formato angolano
      return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'pt-AO', {
        style: 'currency',
        currency: 'AOA',
      }).format(amount);
    }

    // Usar configuração do país
    return new Intl.NumberFormat(countryConfig.locale, {
      style: 'currency',
      currency: countryConfig.currency,
    }).format(amount);
  };

  const formatNumber = (number: number, decimals = 0, countryCode?: string) => {
    const targetCountry = countryCode || DEFAULT_COUNTRY;
    const countryConfig = getCountryConfig(targetCountry);
    const targetLocale = countryConfig?.locale || (locale === 'en' ? 'en-US' : 'pt-AO');
    
    return new Intl.NumberFormat(targetLocale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number);
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return locale === 'en' ? `${minutes} min` : `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return locale === 'en' 
      ? `${hours}h ${remainingMinutes}min`
      : `${hours}h ${remainingMinutes}min`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'pt-AO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'pt-AO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  };

  return {
    formatCurrency,
    formatNumber,
    formatDistance,
    formatDuration,
    formatDate,
    formatTime,
  };
};

export default useTranslation;