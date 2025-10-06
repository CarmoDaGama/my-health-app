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
  const { initializeLanguage, isInitialized } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();

  // Inicializar idioma quando o estado de autenticação estiver determinado
  // mas apenas uma vez ou quando houver mudança significativa de usuário
  useEffect(() => {
    if (!authLoading && !isInitialized) {
      const isGuest = !user;
      const userPreferredLanguage = user?.preferences?.language;
      
      initializeLanguage(isGuest, userPreferredLanguage);
    }
  }, [authLoading, isInitialized, initializeLanguage]);

  // Separar effect para mudanças de usuário após inicialização
  useEffect(() => {
    if (!authLoading && isInitialized && user?.preferences?.language) {
      const currentLanguage = user.preferences.language;
      initializeLanguage(false, currentLanguage);
    }
  }, [user?.preferences?.language, authLoading, isInitialized, initializeLanguage]);

  const contextValue: LanguageContextType = {
    initializeLanguage,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};