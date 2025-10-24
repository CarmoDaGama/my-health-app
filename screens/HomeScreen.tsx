import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HomeScreenNavigationProp } from '../types/navigation';
import { useAuth } from '../hooks/useAuth-firebase';
import { SmartDashboard } from '../components/common/SmartDashboard';
import { Colors } from '../constants';

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <View style={styles.container}>
      <SmartDashboard 
        userType={user?.userType || null}
        isAuthenticated={isAuthenticated}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

export default HomeScreen;
