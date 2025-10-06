import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation as useI18nTranslation } from './useTranslation';

interface TranslationContextType {
  forceUpdate: () => void;
  updateId: number;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [updateId, setUpdateId] = useState(0);

  const forceUpdate = () => {
    setUpdateId(prev => prev + 1);
  };

  const contextValue: TranslationContextType = {
    forceUpdate,
    updateId,
  };

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationContext = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslationContext must be used within TranslationProvider');
  }
  return context;
};

// Hook melhorado que força re-render quando contexto muda
export const useTranslation = () => {
  const translationHook = useI18nTranslation();
  const { updateId } = useTranslationContext();

  // O updateId força re-render quando o contexto muda
  const t = (key: string, options?: object) => {
    return translationHook.t(key, options);
  };

  // Wrapper para changeLanguage que força update global
  const changeLanguage = async (newLocale: string, isGuest: boolean = false) => {
    await translationHook.changeLanguage(newLocale, isGuest);
    // O sistema global já notifica, mas garantir que o contexto também atualiza
  };

  return {
    ...translationHook,
    t,
    changeLanguage,
    _updateId: updateId, // Para debug
  };
};