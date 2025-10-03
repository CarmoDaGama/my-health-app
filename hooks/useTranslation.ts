import { useState, useEffect, useCallback } from 'react';
import i18n, { 
  determineLanguage, 
  setLanguage, 
  getAvailableLanguages,
  saveUserLanguagePreference
} from '../utils/i18n';
import { getLocales } from 'expo-localization';

export const useTranslation = () => {
  const [locale, setLocale] = useState(i18n.locale);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Inicializa o idioma com base nas preferências do usuário
   */
  const initializeLanguage = useCallback(async (isGuest: boolean = false, userPreferredLanguage?: string) => {
    try {
      const determinedLanguage = await determineLanguage(isGuest, userPreferredLanguage);
      setLanguage(determinedLanguage);
      setLocale(determinedLanguage);
      setIsInitialized(true);
    } catch (error) {
      console.warn('Erro ao inicializar idioma:', error);
      // Fallback para inglês
      setLanguage('en');
      setLocale('en');
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    // Inicializar com idioma padrão se ainda não foi inicializado
    if (!isInitialized) {
      initializeLanguage();
    }
  }, [initializeLanguage, isInitialized]);

  const t = (key: string, options?: object) => {
    return i18n.t(key, options);
  };

  const changeLanguage = async (newLocale: string, isGuest: boolean = false) => {
    try {
      setLanguage(newLocale);
      setLocale(newLocale);
      
      // Salvar a preferência apenas se não for usuário convidado
      if (!isGuest) {
        await saveUserLanguagePreference(newLocale);
      }
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

// Hook para formatação de números e datas no contexto angolano
export const useLocalization = () => {
  const { locale } = useTranslation();

  const formatCurrency = (amount: number) => {
    // Formato de moeda angolana (Kwanza)
    return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'pt-AO', {
      style: 'currency',
      currency: 'AOA',
    }).format(amount);
  };

  const formatNumber = (number: number, decimals = 0) => {
    return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'pt-AO', {
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