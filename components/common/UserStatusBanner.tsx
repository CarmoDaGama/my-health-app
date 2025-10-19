import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { spacing } from '../../constants/dimensions';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth-firebase';
import { shouldShowServiceStatusWarning } from '../../utils/userValidations';

export const UserStatusBanner: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!shouldShowServiceStatusWarning(user)) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.bannerContent}>
        <Text style={styles.title}>
          {t('auth.serviceSuspended')}
        </Text>
        <Text style={styles.message}>
          {t('auth.serviceSuspendedMessage')}
        </Text>
        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactButtonText}>
            {t('common.contactSupport') || 'Entrar em Contato'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  bannerContent: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFE69C',
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.lg,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  contactButton: {
    backgroundColor: '#856404',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  contactButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});