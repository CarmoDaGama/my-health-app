import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth-firebase';

interface LanguageContextType {
  initializeLanguage: (isGuest?: boolean, userPreferredLanguage?: string) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { initializeLanguage } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();

  // Inicializar idioma quando o estado de autenticação estiver determinado
  useEffect(() => {
    if (!authLoading) {
      const isGuest = !user;
      const userPreferredLanguage = user?.preferences?.language;
      
      initializeLanguage(isGuest, userPreferredLanguage);
    }
  }, [user, authLoading, initializeLanguage]);

  const contextValue: LanguageContextType = {
    initializeLanguage,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};