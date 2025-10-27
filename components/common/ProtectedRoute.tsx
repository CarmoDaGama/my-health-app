import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../../hooks/useAuth-firebase';
import { useTranslation } from '../../hooks/useTranslation';
import { Colors } from '../../constants/colors';
import { spacing } from '../../constants/dimensions';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
  onLoginPress?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  requireAuth = true,
  onLoginPress,
}) => {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useTranslation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>
          {t('auth.checkingAuth') || 'Verificando autenticação...'}
        </Text>
      </View>
    );
  }

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          {t('auth.loginRequired') || 'Login Necessário'}
        </Text>
        <Text style={styles.message}>
          {t('auth.loginRequiredMessage') || 'Você precisa estar logado para acessar esta área.'}
        </Text>
        {onLoginPress && (
          <TouchableOpacity style={styles.loginButton} onPress={onLoginPress}>
            <Text style={styles.loginButtonText}>
              {t('auth.goToLogin') || 'Fazer Login'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // If user shouldn't be authenticated but is (for login/register screens)
  if (!requireAuth && isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          {t('auth.alreadyLoggedIn') || 'Já Logado'}
        </Text>
        <Text style={styles.message}>
          {t('auth.alreadyLoggedInMessage') || 'Você já está logado no sistema.'}
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },
});