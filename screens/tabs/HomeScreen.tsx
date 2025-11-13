import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, spacing, fontSize } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation';
import { MapView } from '../../components/specific/MapView';

type HomeSubTab = 'map' | 'list';

export const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState<HomeSubTab>('map');

  const renderSubTabButton = (tab: HomeSubTab, icon: string, label: string) => (
    <TouchableOpacity
      style={[
        styles.subTabButton,
        activeSubTab === tab && styles.subTabButtonActive
      ]}
      onPress={() => setActiveSubTab(tab)}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={activeSubTab === tab ? Colors.primary : Colors.textSecondary} 
      />
      <Text style={[
        styles.subTabText,
        activeSubTab === tab && styles.subTabTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeSubTab) {
      case 'map':
        return (
          <View style={styles.mapContainer}>
            <Text style={styles.contentTitle}>Interactive Map</Text>
            <Text style={styles.contentDescription}>
              Healthcare facilities are displayed with color-coded categories
            </Text>
            {/* MapView component will be rendered here */}
          </View>
        );
      case 'list':
        return (
          <View style={styles.listContainer}>
            <Text style={styles.contentTitle}>Professionals List</Text>
            <Text style={styles.contentDescription}>
              Browse healthcare professionals by specialty and location
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sub-tabs Header */}
      <View style={styles.subTabsContainer}>
        {renderSubTabButton('map', 'map-outline', 'Map')}
        {renderSubTabButton('list', 'list-outline', 'List')}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  subTabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  subTabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginHorizontal: spacing.xs,
  },
  subTabButtonActive: {
    backgroundColor: Colors.accent + '20', // Adding transparency
  },
  subTabText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  subTabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  contentDescription: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});