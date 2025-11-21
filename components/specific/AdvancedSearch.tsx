/**
 * Advanced Search Component
 * MENDLINK Phase 2: Intelligent search interface with filters and auto-suggestions
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Modal,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, spacing, borderRadius, fontSize, shadows } from '../../constants';
import { NeumorphicInput } from '../ui/NeumorphicInput';
import { NeumorphicButton } from '../ui/NeumorphicButton';
import { NeumorphicCard } from '../ui/NeumorphicCard';
import { createNeumorphicStyle } from '../../utils/neumorphicStyles';
import { 
  SearchFilters, 
  SearchResult, 
  SearchSuggestion,
  QuickFilter,
  QUICK_FILTERS,
  SERVICE_TYPE_OPTIONS,
  DISTANCE_OPTIONS 
} from '../../types/search';
import { HealthService, Coordinates } from '../../types';
import { AdvancedSearchService } from '../../services/AdvancedSearchService';
import { LocationService } from '../../services/location';

interface AdvancedSearchProps {
  onResultsChange?: (results: HealthService[]) => void;
  onServiceSelect?: (service: HealthService) => void;
  initialQuery?: string;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onResultsChange,
  onServiceSelect,
  initialQuery = '',
}) => {
  // State management
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Refs and control variables
  const inputRef = useRef<TextInput>(null);
  const shouldMaintainFocus = useRef(false);
  const focusTimeout = useRef<NodeJS.Timeout>();

  // Get user location on mount
  useEffect(() => {
    LocationService.getCurrentLocation()
      .then((location: any) => {
        if (location?.coordinates) {
          setUserLocation(location.coordinates);
        }
      })
      .catch((error: any) => console.log('Location not available:', error));
  }, []);

  // Perform search when filters change (with debounce for searchQuery)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() || Object.keys(filters).length > 0) {
        performSearch();
      } else {
        setResults(null);
        onResultsChange?.([]);
      }
    }, searchQuery.trim() ? 500 : 0); // Debounce search when typing

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  // Generate suggestions when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      generateSuggestions();
    } else {
      setSuggestions(AdvancedSearchService.getPopularSuggestions());
    }
  }, [searchQuery]);

  // Handle closing suggestions when input loses focus
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (!isSearchFocused && showSuggestions) {
      timeoutId = setTimeout(() => {
        setShowSuggestions(false);
        shouldMaintainFocus.current = false;
      }, 500); // Increased delay to prevent accidental closes
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isSearchFocused, showSuggestions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (focusTimeout.current) {
        clearTimeout(focusTimeout.current);
      }
    };
  }, []);

  const performSearch = async () => {
    setIsLoading(true);

    try {
      const searchFilters: SearchFilters = {
        ...filters,
        query: searchQuery.trim() || undefined,
      };

      const searchResult = await AdvancedSearchService.search(
        searchFilters,
        userLocation || undefined,
        50
      );

      setResults(searchResult);
      onResultsChange?.(searchResult.services);
    } catch (error) {
      console.error('❌ Search error:', error);
      setResults({
        services: [],
        totalResults: 0,
        searchTime: 0,
        appliedFilters: filters,
        suggestions: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = async () => {
    // For now, use static suggestions. In a real app, this could be more dynamic
    const popularSuggestions = AdvancedSearchService.getPopularSuggestions();
    const filteredSuggestions = popularSuggestions.filter(suggestion =>
      suggestion.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    setIsSearchFocused(false);
    
    // Apply filters based on suggestion type
    if (suggestion.type === 'specialty') {
      setFilters(prev => ({
        ...prev,
        specialties: [suggestion.text],
      }));
    }
  };

  const handleQuickFilterPress = (quickFilter: QuickFilter) => {
    setFilters(prev => ({
      ...prev,
      ...quickFilter.filter,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setResults(null);
    onResultsChange?.([]);
    // Don't automatically dismiss keyboard or close suggestions
    // Let the user continue interacting
  };

  const activeFiltersCount = useMemo(() => {
    return Object.keys(filters).length + (searchQuery.trim() ? 1 : 0);
  }, [filters, searchQuery]);

  // Stable handlers with useCallback
  const handleInputFocus = useCallback(() => {
    shouldMaintainFocus.current = true;
    setIsSearchFocused(true);
    setShowSuggestions(true);
    
    // Clear any existing timeout
    if (focusTimeout.current) {
      clearTimeout(focusTimeout.current);
    }
  }, []);

  const handleInputBlur = useCallback(() => {
    // Only proceed with blur if we're not trying to maintain focus
    if (!shouldMaintainFocus.current) {
      focusTimeout.current = setTimeout(() => {
        setIsSearchFocused(false);
      }, 150);
    } else {
      // Reset the flag and try to refocus
      shouldMaintainFocus.current = false;
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  }, []);

  const handleInputChange = useCallback((text: string) => {
    setSearchQuery(text);
    shouldMaintainFocus.current = true; // Maintain focus while typing
  }, []);

  // Handler for service selection with proper keyboard dismissal
  const handleServiceSelect = useCallback((service: HealthService) => {
    // Immediately close suggestions to prevent any UI conflicts
    setShowSuggestions(false);
    setIsSearchFocused(false);
    shouldMaintainFocus.current = false;
    
    // Force dismiss keyboard 
    Keyboard.dismiss();
    
    // Blur the input as well
    if (inputRef.current) {
      inputRef.current.blur();
    }
    
    // Call the parent handler with a slight delay to ensure proper navigation
    setTimeout(() => {
      onServiceSelect?.(service);
    }, 100);
  }, [onServiceSelect]);



  return (
    <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              ref={inputRef}
              placeholder="Search services, doctors, specialties..."
              value={searchQuery}
              onChangeText={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              autoCapitalize="words"
              autoCorrect={false}
              blurOnSubmit={false}
              returnKeyType="search"
              style={styles.searchInputNative}
              placeholderTextColor={Colors.textTertiary}
            />
          </View>
          {isLoading && (
            <ActivityIndicator size="small" color={Colors.primary} style={styles.loadingIndicator} />
          )}
          {searchQuery.length > 0 && !isLoading && (
            <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Filter Button */}
          <View style={styles.filterButtonContainer}>
            <NeumorphicButton
              icon="options"
              variant={activeFiltersCount > 0 ? 'primary' : 'tertiary'}
              onPress={() => setShowFilters(true)}
              style={styles.filterButton}
            />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{String(activeFiltersCount || 0)}</Text>
              </View>
            )}
          </View>
        </View>

      {/* Quick Filters */}
      {!showSuggestions && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickFiltersContainer}
          contentContainerStyle={styles.quickFiltersContent}
        >
          {QUICK_FILTERS.map(quickFilter => (
            <TouchableOpacity
              key={quickFilter.id}
              style={[
                styles.quickFilterChip,
                { borderColor: quickFilter.color },
                // Check if this filter is active
                Object.keys(quickFilter.filter).some(key => 
                  filters[key as keyof SearchFilters] !== undefined
                ) && [styles.quickFilterChipActive, { backgroundColor: quickFilter.color }]
              ]}
              onPress={() => handleQuickFilterPress(quickFilter)}
            >
              <Ionicons
                name={quickFilter.icon as any}
                size={16}
                color={
                  Object.keys(quickFilter.filter).some(key => 
                    filters[key as keyof SearchFilters] !== undefined
                  ) ? Colors.white : quickFilter.color
                }
              />
              <Text
                style={[
                  styles.quickFilterText,
                  { color: quickFilter.color },
                  Object.keys(quickFilter.filter).some(key => 
                    filters[key as keyof SearchFilters] !== undefined
                  ) && { color: Colors.white }
                ]}
              >
                {quickFilter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Auto-suggestions */}
      {showSuggestions ? (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSuggestionPress(item)}
              >
                <Ionicons
                  name={item.metadata?.icon as any || 'search'}
                  size={18}
                  color={Colors.textSecondary}
                  style={styles.suggestionIcon}
                />
                <Text style={styles.suggestionText}>{item.text || ''}</Text>
                {item.metadata?.count ? (
                  <Text style={styles.suggestionCount}>{String(item.metadata.count)}</Text>
                ) : null}
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled={true}
          />
        </View>
      ) : null}

      {/* Search Results Summary */}
      {results && !showSuggestions ? (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {String(results.totalResults || 0)} results found
            {results.searchTime > 0 && ` in ${results.searchTime}ms`}
          </Text>
          {activeFiltersCount > 0 ? (
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearFiltersText}>Clear all</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {/* Advanced Filters Modal */}
      <AdvancedFiltersModal
        visible={showFilters}
        filters={filters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={setFilters}
        userLocation={userLocation}
      />
    </View>
  );
};

// Advanced Filters Modal Component
interface AdvancedFiltersModalProps {
  visible: boolean;
  filters: SearchFilters;
  onClose: () => void;
  onApplyFilters: (filters: SearchFilters) => void;
  userLocation: Coordinates | null;
}

const AdvancedFiltersModal: React.FC<AdvancedFiltersModalProps> = ({
  visible,
  filters,
  onClose,
  onApplyFilters,
  userLocation,
}) => {
  const [tempFilters, setTempFilters] = useState<SearchFilters>(filters);

  useEffect(() => {
    setTempFilters(filters);
  }, [filters, visible]);

  const handleApply = () => {
    onApplyFilters(tempFilters);
    onClose();
  };

  const handleReset = () => {
    setTempFilters({});
    onApplyFilters({});
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Filters</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Service Types */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Service Type</Text>
            <View style={styles.serviceTypeGrid}>
              {SERVICE_TYPE_OPTIONS.map(option => {
                const isSelected = tempFilters.type?.includes(option.value);
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.serviceTypeOption,
                      isSelected && [styles.serviceTypeOptionActive, { backgroundColor: option.color }]
                    ]}
                    onPress={() => {
                      const currentTypes = tempFilters.type || [];
                      const newTypes = isSelected
                        ? currentTypes.filter(t => t !== option.value)
                        : [...currentTypes, option.value];
                      
                      setTempFilters(prev => ({
                        ...prev,
                        type: newTypes.length > 0 ? newTypes : undefined,
                      }));
                    }}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={isSelected ? Colors.white : option.color}
                    />
                    <Text style={[
                      styles.serviceTypeText,
                      isSelected && { color: Colors.white }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Distance Filter */}
          {userLocation && (
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Distance</Text>
              <View style={styles.distanceOptions}>
                {DISTANCE_OPTIONS.map(option => {
                  const isSelected = tempFilters.distance === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.distanceOption,
                        isSelected && styles.distanceOptionActive
                      ]}
                      onPress={() => {
                        setTempFilters(prev => ({
                          ...prev,
                          distance: isSelected ? undefined : option.value === -1 ? undefined : option.value,
                        }));
                      }}
                    >
                      <Text style={[
                        styles.distanceText,
                        isSelected && styles.distanceTextActive
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Additional Options */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Additional Options</Text>
            
            <TouchableOpacity
              style={styles.toggleOption}
              onPress={() => setTempFilters(prev => ({
                ...prev,
                acceptsInsurance: !prev.acceptsInsurance
              }))}
            >
              <Text style={styles.toggleText}>Accepts Insurance</Text>
              <Ionicons
                name={tempFilters.acceptsInsurance ? 'checkbox' : 'square-outline'}
                size={24}
                color={Colors.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleOption}
              onPress={() => setTempFilters(prev => ({
                ...prev,
                emergencyService: !prev.emergencyService
              }))}
            >
              <Text style={styles.toggleText}>Emergency Services</Text>
              <Ionicons
                name={tempFilters.emergencyService ? 'checkbox' : 'square-outline'}
                size={24}
                color={Colors.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleOption}
              onPress={() => setTempFilters(prev => ({
                ...prev,
                isOpen24h: !prev.isOpen24h
              }))}
            >
              <Text style={styles.toggleText}>Open 24 Hours</Text>
              <Ionicons
                name={tempFilters.isOpen24h ? 'checkbox' : 'square-outline'}
                size={24}
                color={Colors.primary}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flexShrink: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 44,
  },
  searchInputNative: {
    flex: 1,
    fontSize: fontSize.md,
    color: Colors.text,
    fontWeight: '500',
    marginLeft: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: Colors.text,
  },
  loadingIndicator: {
    marginLeft: spacing.sm,
  },
  clearButton: {
    marginLeft: spacing.sm,
  },
  filterButtonContainer: {
    position: 'relative',
  },
  filterButton: {
    padding: spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: Colors.white,
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  quickFiltersContainer: {
    maxHeight: 45,
  },
  quickFiltersContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
    paddingTop: spacing.xs,
    gap: spacing.sm,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 25,
    borderWidth: 1,
    gap: spacing.xs,
  },
  quickFilterChipActive: {
    // backgroundColor will be set dynamically
  },
  quickFilterText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  suggestionsContainer: {
    backgroundColor: Colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    maxHeight: 200,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  suggestionIcon: {
    marginRight: spacing.sm,
  },
  suggestionText: {
    flex: 1,
    fontSize: fontSize.md,
    color: Colors.text,
  },
  suggestionCount: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    backgroundColor: Colors.background,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  resultsText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  clearFiltersText: {
    fontSize: fontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
  },
  resetText: {
    fontSize: fontSize.md,
    color: Colors.primary,
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  filterSection: {
    marginVertical: spacing.md,
  },
  filterSectionTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  serviceTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  serviceTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: spacing.sm,
    minWidth: '45%',
  },
  serviceTypeOptionActive: {
    borderColor: 'transparent',
  },
  serviceTypeText: {
    fontSize: fontSize.sm,
    color: Colors.text,
  },
  distanceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  distanceOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  distanceOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  distanceText: {
    fontSize: fontSize.sm,
    color: Colors.text,
  },
  distanceTextActive: {
    color: Colors.white,
  },
  toggleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  toggleText: {
    fontSize: fontSize.md,
    color: Colors.text,
  },
  modalFooter: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  applyButtonText: {
    color: Colors.white,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
});