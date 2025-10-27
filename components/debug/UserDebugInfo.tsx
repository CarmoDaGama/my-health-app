import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../hooks/useAuth-firebase';
import { UserType } from '../../types';
import { Colors } from '../../constants';

export const UserDebugInfo: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!__DEV__) return null; // Only show in development

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐛 Debug Info</Text>
      <Text style={styles.text}>Authenticated: {isAuthenticated ? '✅' : '❌'}</Text>
      <Text style={styles.text}>User ID: {user?.id || 'N/A'}</Text>
      <Text style={styles.text}>Name: {user?.name || 'N/A'}</Text>
      <Text style={styles.text}>Email: {user?.email || 'N/A'}</Text>
      <Text style={styles.text}>UserType: {user?.userType || 'N/A'}</Text>
      <Text style={styles.text}>Is Institution: {user?.userType === UserType.INSTITUTION ? '✅' : '❌'}</Text>
      <Text style={styles.text}>Is Active: {user?.isActive ? '✅' : '❌'}</Text>
      {user?.userType === UserType.INSTITUTION && (
        <Text style={styles.text}>Institution Type: {(user as any)?.institutionInfo?.type || 'N/A'}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.warning + '20',
    borderColor: Colors.warning,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.warning,
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    color: Colors.text,
    marginVertical: 2,
  },
});
