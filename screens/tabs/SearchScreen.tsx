import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, spacing, fontSize, borderRadius, shadows } from '../../constants';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { createNeumorphicStyle } from '../../utils/neumorphicStyles';
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
    // Close keyboard before navigation to prevent focus issues
    Keyboard.dismiss();
    
    // Use setTimeout to ensure keyboard is fully dismissed before navigation
    setTimeout(() => {
      (navigation as any).navigate('ServiceDetail', { service });
    }, 100);
  };

  // Helper function to safely format address
  const formatAddress = (address: any, city?: string) => {
    if (typeof address === 'string') {
      return address;
    }
    if (typeof address === 'object' && address !== null) {
      const { street, city: addrCity, state } = address;
      return `${street || ''}, ${addrCity || city || ''}`;
    }
    return 'N/A';
  };

  const renderServiceItem = ({ item }: { item: HealthService }) => {
    // Debug: verificar estrutura dos dados
    if (typeof item.address === 'object' || typeof item.name === 'object') {
      console.warn('⚠️ Dados inválidos detectados no item:', {
        id: item.id,
        name: typeof item.name,
        address: typeof item.address,
        addressValue: item.address
      });
    }
    
    return (
    <NeumorphicCard
      variant="default"
      onPress={() => handleServiceSelect(item)}
      style={styles.serviceItem}
    >
      <View style={styles.serviceHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{typeof item.name === 'string' ? item.name : 'N/A'}</Text>
          <Text style={styles.serviceType}>{typeof item.type === 'string' ? item.type : 'N/A'}</Text>
        </View>
        <View style={styles.serviceActions}>
          {item.rating ? (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={styles.ratingText}>{(item.rating || 0).toFixed(1)}</Text>
            </View>
          ) : null}
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </View>
      </View>
      
      <Text style={styles.serviceAddress} numberOfLines={1}>
        📍 {formatAddress(item.address, item.city)}, {typeof item.city === 'string' ? item.city : 'N/A'}
      </Text>
      
      {item.specialty && typeof item.specialty === 'string' ? (
        <Text style={styles.serviceSpecialty}>🔬 {item.specialty}</Text>
      ) : null}
      
      {item.services && Array.isArray(item.services) && item.services.length > 0 ? (
        <Text style={styles.serviceServices} numberOfLines={1}>
          💼 {item.services.filter(s => typeof s === 'string').slice(0, 3).join(', ')}{item.services.length > 3 ? '...' : ''}
        </Text>
      ) : null}
    </NeumorphicCard>
    );
  };

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
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      ) : (
        <View style={styles.emptyState}>
          <NeumorphicCard variant="elevated" style={styles.iconContainer}>
            <Ionicons name="search-outline" size={48} color={Colors.primary} />
          </NeumorphicCard>
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
    paddingTop: spacing.xs,
  },
  resultsList: {
    flex: 1,
    marginTop: spacing.sm,
  },
  resultsContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  serviceItem: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs / 2,
    paddingVertical: spacing.sm,
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 2,
  },
  iconContainer: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
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
    lineHeight: 22,
    marginBottom: spacing.lg,
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