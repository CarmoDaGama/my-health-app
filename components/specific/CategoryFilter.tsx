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
  const [collapsed, setCollapsed] = useState(true); // Start collapsed by default
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
        {/* Control buttons with expand/collapse */}
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Filter by Category</Text>
          <View style={styles.headerControls}>
            <TouchableOpacity
              style={styles.expandToggle}
              onPress={() => setCollapsed(!collapsed)}
            >
              <Text style={styles.expandToggleText}>
                {collapsed ? 'Show Filters' : 'Hide Filters'}
              </Text>
              <Text style={styles.expandToggleIcon}>
                {collapsed ? '▼' : '▲'}
              </Text>
            </TouchableOpacity>
            {!collapsed && renderControlButtons()}
          </View>
        </View>
        
        {/* Horizontal scrollable categories - only show when not collapsed */}
        {!collapsed && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalContainer}
            style={styles.horizontalScroll}
          >
            {categories.map(renderCategoryChip)}
          </ScrollView>
        )}
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
    minHeight: 60, // Ensure minimum container height
    backgroundColor: Colors.background, // Add background color
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm, // Reduced from md to sm
    paddingHorizontal: spacing.md,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
  },
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    gap: spacing.xs,
  },
  expandToggleText: {
    fontSize: fontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  expandToggleIcon: {
    fontSize: fontSize.xs,
    color: Colors.primary,
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
    minHeight: 60, // Ensure minimum height to prevent clipping
    marginBottom: spacing.sm, // Add bottom margin
  },
  horizontalContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs, // Add vertical padding
    gap: spacing.sm,
    alignItems: 'center', // Center align items
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
    paddingHorizontal: spacing.md, // Increased padding
    paddingVertical: spacing.sm, // Increased padding
    marginVertical: 0, // Remove margin to prevent layout issues
    minHeight: 40, // Ensure minimum height
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
    paddingVertical: 3, // Slightly increased
    borderRadius: 12,
    minWidth: 22, // Slightly larger
    alignItems: 'center',
    justifyContent: 'center', // Center content
  },
  statsText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
    lineHeight: fontSize.xs + 2, // Improve text alignment
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