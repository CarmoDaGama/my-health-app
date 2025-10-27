import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth-firebase';
import { PermissionsManager } from '../../utils/permissions';
import { Colors, spacing, borderRadius, fontSize } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation';

interface ProtectedComponentProps {
  children: React.ReactNode;
  requiredAction?: string;
  fallbackMessage?: string;
  showLoginPrompt?: boolean;
  onLoginPress?: () => void;
}

/**
 * Higher-order component that wraps content with permission checks
 */
export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  children,
  requiredAction,
  fallbackMessage,
  showLoginPrompt = true,
  onLoginPress
}) => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  // If no specific action is required, just check if user is authenticated
  if (!requiredAction) {
    if (!isAuthenticated) {
      return (
        <View style={styles.permissionDeniedContainer}>
          <Ionicons name="lock-closed" size={48} color={Colors.textSecondary} />
          <Text style={styles.permissionDeniedTitle}>
            {t('permissions.loginRequired') || 'Login Necessário'}
          </Text>
          <Text style={styles.permissionDeniedMessage}>
            {fallbackMessage || t('permissions.loginRequiredMessage') || 'Você precisa estar logado para acessar este conteúdo.'}
          </Text>
          {showLoginPrompt && (
            <TouchableOpacity style={styles.loginButton} onPress={onLoginPress}>
              <Text style={styles.loginButtonText}>
                {t('auth.login') || 'Fazer Login'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    return <>{children}</>;
  }

  // Check specific action permission
  const hasPermission = PermissionsManager.isActionAllowed(user, requiredAction);

  if (!hasPermission) {
    return (
      <View style={styles.permissionDeniedContainer}>
        <Ionicons name="ban" size={48} color={Colors.error} />
        <Text style={styles.permissionDeniedTitle}>
          {t('permissions.accessDenied') || 'Acesso Negado'}
        </Text>
        <Text style={styles.permissionDeniedMessage}>
          {fallbackMessage || PermissionsManager.getPermissionDeniedMessage(requiredAction)}
        </Text>
        {!isAuthenticated && showLoginPrompt && (
          <TouchableOpacity style={styles.loginButton} onPress={onLoginPress}>
            <Text style={styles.loginButtonText}>
              {t('auth.login') || 'Fazer Login'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return <>{children}</>;
};

/**
 * Hook to conditionally render content based on permissions
 */
export function useConditionalRender() {
  const { user } = useAuth();

  const renderIfAllowed = (action: string, content: React.ReactNode, fallback?: React.ReactNode) => {
    if (PermissionsManager.isActionAllowed(user, action)) {
      return content;
    }
    return fallback || null;
  };

  const renderIfUserType = (userType: string | string[], content: React.ReactNode, fallback?: React.ReactNode) => {
    const userTypes = Array.isArray(userType) ? userType : [userType];
    if (user && userTypes.includes(user.userType)) {
      return content;
    }
    return fallback || null;
  };

  return {
    renderIfAllowed,
    renderIfUserType,
    user
  };
}

/**
 * Hook for handling permission-based actions
 */
export function usePermissionedAction() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const executeWithPermission = (
    action: string,
    callback: () => void,
    onDenied?: (message: string) => void
  ) => {
    if (PermissionsManager.isActionAllowed(user, action)) {
      callback();
    } else {
      const message = PermissionsManager.getPermissionDeniedMessage(action);
      if (onDenied) {
        onDenied(message);
      } else {
        // Default behavior - could show toast or alert
        console.warn('Permission denied:', message);
      }
    }
  };

  const checkPermission = (action: string): boolean => {
    return PermissionsManager.isActionAllowed(user, action);
  };

  return {
    executeWithPermission,
    checkPermission,
    user
  };
}

const styles = StyleSheet.create({
  permissionDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: Colors.background,
  },
  permissionDeniedTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  permissionDeniedMessage: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  loginButtonText: {
    color: Colors.surface,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
