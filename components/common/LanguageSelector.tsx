import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from '../../hooks/useTranslation';
import { Colors } from '../../constants/colors';

interface LanguageSelectorProps {
  isGuest?: boolean;
  onLanguageChange?: (language: string) => void;
  showTitle?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  isGuest = false,
  onLanguageChange,
  showTitle = true
}) => {
  const { t, getCurrentLocale, getAvailableLocales, changeLanguage } = useTranslation();

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await changeLanguage(languageCode, isGuest);
      onLanguageChange?.(languageCode);
    } catch (error) {
      console.warn('Erro ao alterar idioma:', error);
    }
  };

  const currentLocale = getCurrentLocale();
  const availableLanguages = getAvailableLocales();

  return (
    <View style={styles.container}>
      {showTitle && (
        <Text style={styles.title}>
          {t('settings.language')}
        </Text>
      )}
      
      <View style={styles.languageOptions}>
        {availableLanguages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageOption,
              currentLocale === language.code && styles.selectedLanguage
            ]}
            onPress={() => handleLanguageChange(language.code)}
          >
            <Text
              style={[
                styles.languageText,
                currentLocale === language.code && styles.selectedLanguageText
              ]}
            >
              {language.nativeName}
            </Text>
            <Text
              style={[
                styles.languageSubtext,
                currentLocale === language.code && styles.selectedLanguageSubtext
              ]}
            >
              {language.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {isGuest && (
        <Text style={styles.guestNote}>
          {t('settings.guestLanguageNote')}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  languageOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  languageOption: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  selectedLanguage: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  selectedLanguageText: {
    color: Colors.primary,
  },
  languageSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  selectedLanguageSubtext: {
    color: Colors.primary,
  },
  guestNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});