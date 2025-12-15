import { useState, useEffect } from 'react';
import { UserPreferences } from '../types';
import { useAuth } from './useAuth-firebase';
import { useTranslation } from './useTranslation';
import { saveUserLanguagePreference } from '../utils/i18n';

export const usePreferences = () => {
  const { user, updatePreferences: updateUserPreferences } = useAuth();
  const { changeLanguage } = useTranslation();
  
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar preferências quando o usuário estiver disponível
  useEffect(() => {
    if (user?.preferences) {
      setPreferences(user.preferences);
    } else {
      setPreferences(null);
    }
  }, [user]);

  /**
   * Atualizar preferências do usuário
   */
  const updatePreferences = async (newPreferences: Partial<UserPreferences>): Promise<void> => {
    if (!user || !preferences) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      
      const updatedPreferences: UserPreferences = {
        ...preferences,
        ...newPreferences,
      };

      await updateUserPreferences(updatedPreferences);
      setPreferences(updatedPreferences);
      
      // Se o idioma foi alterado, atualizar o i18n
      if (newPreferences.language && newPreferences.language !== preferences.language) {
        changeLanguage(newPreferences.language);
      }
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Alterar idioma do aplicativo
   */
  const setLanguage = async (language: 'pt' | 'en'): Promise<void> => {
    try {
      // Atualizar o i18n imediatamente
      await changeLanguage(language, !user); // isGuest = !user
      
      // Se o usuário estiver autenticado, salvar nas preferências do perfil
      if (user && preferences) {
        await updatePreferences({ language });
      }
      // Nota: saveUserLanguagePreference é sempre chamado em changeLanguage agora
    } catch (error) {
      console.error('Erro ao alterar idioma:', error);
      throw error;
    }
  };

  /**
   * Alterar configurações de notificações
   */
  const updateNotificationSettings = async (
    notifications: Partial<UserPreferences['notifications']>
  ): Promise<void> => {
    if (!preferences) {
      throw new Error('Preferências não disponíveis');
    }

    try {
      await updatePreferences({
        notifications: {
          ...preferences.notifications,
          ...notifications,
        },
      });
    } catch (error) {
      console.error('Erro ao atualizar configurações de notificação:', error);
      throw error;
    }
  };

  /**
   * Alterar configurações de privacidade
   */
  const updatePrivacySettings = async (
    privacy: Partial<UserPreferences['privacy']>
  ): Promise<void> => {
    if (!preferences) {
      throw new Error('Preferências não disponíveis');
    }

    try {
      await updatePreferences({
        privacy: {
          ...preferences.privacy,
          ...privacy,
        },
      });
    } catch (error) {
      console.error('Erro ao atualizar configurações de privacidade:', error);
      throw error;
    }
  };

  /**
   * Resetar preferências para os valores padrão
   */
  const resetPreferences = async (): Promise<void> => {
    const defaultPreferences: UserPreferences = {
      language: 'en',
      notifications: {
        enabled: true,
        serviceReminders: true,
        healthTips: true,
        emergencyAlerts: true,
      },
      favorites: {
        services: [],
        locations: [],
      },
      privacy: {
        shareLocation: true,
        publicProfile: false,
      },
    };

    try {
      await updatePreferences(defaultPreferences);
    } catch (error) {
      console.error('Erro ao resetar preferências:', error);
      throw error;
    }
  };

  return {
    // Estado
    preferences,
    isLoading,
    
    // Métodos principais
    updatePreferences,
    resetPreferences,
    
    // Métodos específicos
    setLanguage,
    updateNotificationSettings,
    updatePrivacySettings,
    
    // Getters convenientes
    currentLanguage: preferences?.language || 'en',
    notificationsEnabled: preferences?.notifications?.enabled || false,
    locationSharingEnabled: preferences?.privacy?.shareLocation || false,
    publicProfileEnabled: preferences?.privacy?.publicProfile || false,
    
    // Verificações
    hasPreferences: !!preferences,
    isLanguagePortuguese: preferences?.language === 'pt',
    isLanguageEnglish: preferences?.language === 'en',
  };
};