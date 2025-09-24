import { useState, useEffect } from 'react';
import i18n from '../utils/i18n';
import { getLocales } from 'expo-localization';

export const useTranslation = () => {
  const [locale, setLocale] = useState(i18n.locale);

  useEffect(() => {
    const handleLocaleChange = () => {
      setLocale(i18n.locale);
    };

    // Não há listener nativo no i18n-js, então usamos polling simples se necessário
    // Em uma implementação mais robusta, você poderia usar Context API para isso
    
    return () => {
      // Cleanup se necessário
    };
  }, []);

  const t = (key: string, options?: object) => {
    return i18n.t(key, options);
  };

  const changeLanguage = (newLocale: string) => {
    i18n.locale = newLocale;
    setLocale(newLocale);
  };

  const getCurrentLocale = () => locale;

  const getAvailableLocales = () => ['pt', 'en'];

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