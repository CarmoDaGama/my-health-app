/**
 * AUTHENTICATION GUARD
 * Componente que bloqueia acesso a features que requerem autenticação
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth-firebase';
import { Colors, spacing, fontSize } from '../../constants';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  message?: string;
  onAuthRequired?: () => void;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  requireAuth = true,
  message = 'Você precisa estar logado para acessar esta funcionalidade.',
  onAuthRequired,
}) => {
  const { user, isAuthenticated } = useAuth();

  // Log auth state for debugging
  React.useEffect(() => {
    console.log('🔐 AuthGuard Check:', {
      isAuthenticated,
      hasUser: !!user,
      userId: user?.id,
      userType: (user as any)?.userType,
      requireAuth,
    });
  }, [isAuthenticated, user, requireAuth]);

  // If auth is not required, always show children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Check if user is authenticated
  const isUserAuthenticated = isAuthenticated && user && user.id !== 'guest';

  if (!isUserAuthenticated) {
    // Show fallback if provided
    if (fallback) {
      return <>{fallback}</>;
    }

    // Show default auth required UI
    return (
      <View style={styles.container}>
        <View style={styles.authRequired}>
          <Ionicons name="lock-closed" size={48} color={Colors.primary} />
          <Text style={styles.title}>Acesso Restrito</Text>
          <Text style={styles.message}>{message}</Text>
          
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => {
              if (onAuthRequired) {
                onAuthRequired();
              } else {
                Alert.alert(
                  'Login Necessário',
                  'Redirecionando para a tela de login...',
                  [{ text: 'OK' }]
                );
              }
            }}
          >
            <Text style={styles.loginButtonText}>Fazer Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // User is authenticated, show children
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  authRequired: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    minWidth: 120,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: fontSize.md,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});