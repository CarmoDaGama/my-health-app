import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { HomeScreen } from '../screens/HomeScreen';
import { MapScreen } from '../screens/MapScreen';
import { ServiceDetailScreen } from '../screens/ServiceDetailScreen';
import { Colors } from '../constants';
import i18n from '../utils/i18n';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.text.onPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: i18n.t('screens.home'),
          }}
        />
        
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{
            title: i18n.t('screens.map'),
          }}
        />
        
        <Stack.Screen
          name="ServiceDetail"
          component={ServiceDetailScreen}
          options={{
            title: i18n.t('screens.details'),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
