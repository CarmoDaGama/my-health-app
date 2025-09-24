import React from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { Colors } from '../../constants/colors';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

interface SkeletonListItemProps {
  showImage?: boolean;
  lines?: number;
  style?: ViewStyle;
}

export const SkeletonListItem: React.FC<SkeletonListItemProps> = ({
  showImage = true,
  lines = 3,
  style,
}) => {
  return (
    <View style={[styles.listItemContainer, style]}>
      {showImage && (
        <Skeleton 
          width={60} 
          height={60} 
          borderRadius={8} 
          style={styles.image} 
        />
      )}
      <View style={styles.textContainer}>
        <Skeleton width="80%" height={16} style={styles.title} />
        {Array.from({ length: lines - 1 }).map((_, index) => (
          <Skeleton
            key={index}
            width={index === lines - 2 ? '60%' : '90%'}
            height={12}
            style={styles.line}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.border,
    opacity: 0.6,
  },
  listItemContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  image: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 8,
  },
  line: {
    marginBottom: 6,
  },
});

export default Skeleton;