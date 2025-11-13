import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, spacing, fontSize, borderRadius } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation';
import { AdvancedSearch } from '../../components/specific/AdvancedSearch';
import { HealthService } from '../../types';
import { useNavigation } from '@react-navigation/native';

export const SearchScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [searchResults, setSearchResults] = useState<HealthService[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleResultsChange = (results: HealthService[]) => {
    setSearchResults(results);
    setShowResults(results.length > 0);
  };

  const handleServiceSelect = (service: HealthService) => {
    // Navigate to service detail
    (navigation as any).navigate('ServiceDetail', { service });
  };

  const renderServiceItem = ({ item }: { item: HealthService }) => (
    <TouchableOpacity
      style={styles.serviceItem}
      onPress={() => handleServiceSelect(item)}
    >
      <View style={styles.serviceHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.serviceType}>{item.type}</Text>
        </View>
        <View style={styles.serviceActions}>
          {item.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </View>
      </View>
      
      <Text style={styles.serviceAddress} numberOfLines={1}>
        📍 {item.address}, {item.city}
      </Text>
      
      {item.specialty && (
        <Text style={styles.serviceSpecialty}>🔬 {item.specialty}</Text>
      )}
      
      {item.services && item.services.length > 0 && (
        <Text style={styles.serviceServices} numberOfLines={1}>
          💼 {item.services.slice(0, 3).join(', ')}{item.services.length > 3 ? '...' : ''}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Advanced Search Component */}
      <AdvancedSearch
        onResultsChange={handleResultsChange}
        onServiceSelect={handleServiceSelect}
      />
      
      {/* Search Results */}
      {showResults ? (
        <FlatList
          data={searchResults}
          keyExtractor={item => item.id}
          renderItem={renderServiceItem}
          style={styles.resultsList}
          contentContainerStyle={styles.resultsContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.iconContainer}>
            <Ionicons name="search-outline" size={64} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Advanced Search</Text>
          <Text style={styles.description}>
            Find healthcare services, professionals, and facilities with intelligent filters and auto-suggestions.
          </Text>
          
          {/* Search Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Search Tips:</Text>
            <View style={styles.tipItem}>
              <Ionicons name="search" size={16} color={Colors.primary} />
              <Text style={styles.tipText}>Try "cardiology", "emergency", or "pharmacy near me"</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="location" size={16} color={Colors.primary} />
              <Text style={styles.tipText}>Use filters for distance and service type</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="star" size={16} color={Colors.primary} />
              <Text style={styles.tipText}>Filter by rating and insurance acceptance</Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  resultsList: {
    flex: 1,
  },
  resultsContent: {
    paddingBottom: spacing.xl,
  },
  serviceItem: {
    backgroundColor: Colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  serviceType: {
    fontSize: fontSize.sm,
    color: Colors.primary,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  serviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: fontSize.sm,
    color: Colors.text,
    fontWeight: '500',
  },
  serviceAddress: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  serviceSpecialty: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  serviceServices: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  tipsContainer: {
    alignSelf: 'stretch',
  },
  tipsTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});