import React from 'react';
import { AppNavigator } from './navigation/AppNavigator';
import { ErrorBoundary } from './components';
import { AuthProvider } from './hooks/useAuth-firebase';
import { LanguageProvider } from './hooks/LanguageProvider';
import 'react-native-gesture-handler';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <AppNavigator />
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
