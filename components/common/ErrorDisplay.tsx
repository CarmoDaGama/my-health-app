import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { AsyncError } from '../../hooks/useAsyncError';

interface ErrorDisplayProps {
  error: AsyncError | string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  style?: any;
  compact?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  style,
  compact = false,
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <View style={[styles.container, compact && styles.compactContainer, style]}>
      <View style={styles.content}>
        <Text style={[styles.message, compact && styles.compactMessage]}>
          {errorMessage}
        </Text>
        
        <View style={styles.actions}>
          {onDismiss && (
            <TouchableOpacity 
              style={[styles.button, styles.dismissButton]} 
              onPress={onDismiss}
            >
              <Text style={styles.dismissButtonText}>Dispensar</Text>
            </TouchableOpacity>
          )}
          
          {onRetry && (
            <TouchableOpacity 
              style={[styles.button, styles.retryButton]} 
              onPress={onRetry}
            >
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.error + '10',
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
    margin: 16,
    borderRadius: 8,
    padding: 16,
  },
  compactContainer: {
    margin: 8,
    padding: 12,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: Colors.error,
    marginBottom: 12,
    lineHeight: 20,
  },
  compactMessage: {
    fontSize: 12,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  dismissButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  retryButton: {
    backgroundColor: Colors.error,
  },
  dismissButtonText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '500',
  },
  retryButtonText: {
    color: Colors.text.onPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ErrorDisplay;