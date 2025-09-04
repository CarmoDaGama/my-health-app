import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { HealthService, Coordinates } from './index';

export type RootStackParamList = {
  Home: undefined;
  Map: {
    services: HealthService[];
    userLocation?: Coordinates;
  };
  ServiceDetail: {
    service: HealthService;
  };
};

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Map'>;
export type ServiceDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ServiceDetail'>;

export type MapScreenRouteProp = RouteProp<RootStackParamList, 'Map'>;
export type ServiceDetailScreenRouteProp = RouteProp<RootStackParamList, 'ServiceDetail'>;
