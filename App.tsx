import React from 'react';
import { AppNavigator } from './navigation/AppNavigator';
import { ErrorBoundary } from './components';
import 'react-native-gesture-handler';

export default function App() {
  return (
    <ErrorBoundary>
      <AppNavigator />
    </ErrorBoundary>
  );
}
