/**
 * Category Filter Component
 * MENDLINK Phase 2: Visual category filtering with color-coded chips
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { Colors, spacing, borderRadius, fontSize } from '../../constants';
import { 
  HEALTHCARE_CATEGORIES, 
  ServiceCategory, 
  CategoryStats,
  getAllCategories 
} from '../../constants/categories';

interface CategoryFilterProps {
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  categoryStats?: CategoryStats[];
  showStats?: boolean;
  horizontal?: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategories,
  onCategoryToggle,
  onSelectAll,
  onClearAll,
  categoryStats,
  showStats = true,
  horizontal = true,
}) => {
  const [expanded, setExpanded] = useState(false);
  const categories = getAllCategories();
  
  const getStatsForCategory = (categoryId: string): CategoryStats | undefined => {
    return categoryStats?.find(stat => stat.categoryId === categoryId);
  };

  const isAllSelected = selectedCategories.length === 0; // Empty means all selected
  const hasSelections = selectedCategories.length > 0;

  const renderCategoryChip = (category: ServiceCategory) => {
    const isSelected = selectedCategories.length === 0 || selectedCategories.includes(category.id);
    const stats = getStatsForCategory(category.id);
    
    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryChip,
          {
            backgroundColor: isSelected ? category.color : Colors.surface,
            borderColor: category.color,
          }
        ]}
        onPress={() => onCategoryToggle(category.id)}
        activeOpacity={0.7}
      >
        <View style={styles.chipContent}>
          <Text style={styles.chipIcon}>{category.icon}</Text>
          <Text
            style={[
              styles.chipText,
              { color: isSelected ? 'white' : category.color }
            ]}
          >
            {category.name}
          </Text>
          {showStats && stats && (
            <View
              style={[
                styles.statsBadge,
                { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : category.color + '20' }
              ]}
            >
              <Text
                style={[
                  styles.statsText,
                  { color: isSelected ? 'white' : category.color }
                ]}
              >
                {stats.count}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderControlButtons = () => (
    <View style={styles.controlButtons}>
      <TouchableOpacity
        style={[styles.controlButton, isAllSelected && styles.controlButtonActive]}
        onPress={onSelectAll}
      >
        <Text style={[styles.controlButtonText, isAllSelected && styles.controlButtonTextActive]}>
          All
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.controlButton, hasSelections && styles.controlButtonClear]}
        onPress={onClearAll}
        disabled={!hasSelections}
      >
        <Text style={[styles.controlButtonText, hasSelections && styles.controlButtonTextClear]}>
          Clear
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (horizontal) {
    return (
      <View style={styles.container}>
        {/* Control buttons */}
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Filter by Category</Text>
          {renderControlButtons()}
        </View>
        
        {/* Horizontal scrollable categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalContainer}
          style={styles.horizontalScroll}
        >
          {categories.map(renderCategoryChip)}
        </ScrollView>
      </View>
    );
  }

  // Vertical layout
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Filter by Category</Text>
        {renderControlButtons()}
      </View>
      
      <View style={styles.verticalContainer}>
        {categories.slice(0, expanded ? categories.length : 6).map(renderCategoryChip)}
        
        {categories.length > 6 && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setExpanded(!expanded)}
          >
            <Text style={styles.expandButtonText}>
              {expanded ? 'Show Less' : `Show ${categories.length - 6} More`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  controlButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  controlButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  controlButtonClear: {
    backgroundColor: Colors.error + '10',
    borderColor: Colors.error,
  },
  controlButtonText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  controlButtonTextActive: {
    color: 'white',
  },
  controlButtonTextClear: {
    color: Colors.error,
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  horizontalContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  verticalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    borderRadius: 25,
    borderWidth: 1.5,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginVertical: spacing.xs / 2,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chipIcon: {
    fontSize: 16,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  statsBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  statsText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  expandButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  expandButtonText: {
    fontSize: fontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
});