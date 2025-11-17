/**
 * Map Category Legend Component
 * MENDLINK Phase 2: Visual legend for map categories
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, spacing, borderRadius, fontSize } from '../../constants';
import { 
  CategoryStats,
  getCategoryById 
} from '../../constants/categories';

interface MapCategoryLegendProps {
  categoryStats: CategoryStats[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  collapsible?: boolean;
}

export const MapCategoryLegend: React.FC<MapCategoryLegendProps> = ({
  categoryStats,
  selectedCategories,
  onCategoryToggle,
  position = 'top-right',
  collapsible = true,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const toggleCollapse = () => {
    const toValue = collapsed ? 1 : 0;
    
    Animated.timing(fadeAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
    
    setCollapsed(!collapsed);
  };

  const getPositionStyle = () => {
    const baseStyle: any = {
      position: 'absolute',
      zIndex: 1000,
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyle, top: spacing.md, left: spacing.md };
      case 'top-right':
        return { ...baseStyle, top: spacing.md, right: spacing.md };
      case 'bottom-left':
        return { ...baseStyle, bottom: spacing.xl, left: spacing.md };
      case 'bottom-right':
        return { ...baseStyle, bottom: spacing.xl, right: spacing.md };
      default:
        return { ...baseStyle, top: spacing.md, right: spacing.md };
    }
  };

  const isAllSelected = selectedCategories.length === 0;
  
  // Only show categories that have services
  const visibleStats = categoryStats.filter(stat => stat.count > 0);

  if (visibleStats.length === 0) return null;

  return (
    <View style={[styles.container, getPositionStyle()]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        {collapsible && (
          <TouchableOpacity
            style={styles.collapseButton}
            onPress={toggleCollapse}
          >
            <Ionicons
              name={collapsed ? 'chevron-down' : 'chevron-up'}
              size={16}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Legend Items */}
      {!collapsed && (
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {visibleStats.map((stat) => {
            const category = getCategoryById(stat.categoryId);
            const isSelected = isAllSelected || selectedCategories.includes(stat.categoryId);
            
            return (
              <TouchableOpacity
                key={stat.categoryId}
                style={[
                  styles.legendItem,
                  !isSelected && styles.legendItemDisabled
                ]}
                onPress={() => onCategoryToggle(stat.categoryId)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.colorIndicator,
                    {
                      backgroundColor: isSelected ? stat.color : stat.color + '40',
                      borderColor: stat.color,
                    }
                  ]}
                />
                <View style={styles.legendText}>
                  <Text
                    style={[
                      styles.categoryName,
                      !isSelected && styles.categoryNameDisabled
                    ]}
                  >
                    {category.icon} {stat.name}
                  </Text>
                  <Text
                    style={[
                      styles.categoryCount,
                      !isSelected && styles.categoryCountDisabled
                    ]}
                  >
                    {stat.count} ({stat.percentage.toFixed(0)}%)
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Total count */}
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>
              Total: {visibleStats.reduce((sum, stat) => sum + stat.count, 0)} facilities
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxWidth: 200,
    minWidth: 150,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: Colors.text,
  },
  collapseButton: {
    padding: spacing.xs / 2,
  },
  content: {
    gap: spacing.xs / 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  legendItemDisabled: {
    opacity: 0.5,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
    borderWidth: 1,
  },
  legendText: {
    flex: 1,
  },
  categoryName: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 1,
  },
  categoryNameDisabled: {
    color: Colors.textSecondary,
  },
  categoryCount: {
    fontSize: fontSize.xs - 1,
    color: Colors.textSecondary,
  },
  categoryCountDisabled: {
    color: Colors.textSecondary + '80',
  },
  totalRow: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
  },
});