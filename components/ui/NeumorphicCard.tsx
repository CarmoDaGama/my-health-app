import React, { ReactNode } from 'react';
import {
  View,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { createNeumorphicStyle } from '../../utils/neumorphicStyles';
import { Colors, spacing, borderRadius } from '../../constants';

interface NeumorphicCardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'flat' | 'pressed';
  onPress?: () => void;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
  rounded?: boolean | keyof typeof borderRadius;
  backgroundColor?: string;
}

export const NeumorphicCard: React.FC<NeumorphicCardProps> = ({
  children,
  variant = 'default',
  onPress,
  style,
  padding = 'md',
  rounded = true,
  backgroundColor = Colors.surface,
}) => {
  const getCardStyle = (): ViewStyle => {
    let size: 'small' | 'medium' | 'large';
    let pressed = false;

    switch (variant) {
      case 'elevated':
        size = 'large';
        break;
      case 'flat':
        size = 'small';
        break;
      case 'pressed':
        size = 'medium';
        pressed = true;
        break;
      default:
        size = 'medium';
    }

    let borderRadiusValue: number | boolean = true;
    if (typeof rounded === 'boolean') {
      borderRadiusValue = rounded;
    } else if (typeof rounded === 'string') {
      borderRadiusValue = borderRadius[rounded];
    }

    const baseStyle = createNeumorphicStyle({
      size,
      pressed,
      rounded: borderRadiusValue,
      backgroundColor,
    });

    return {
      ...baseStyle,
      padding: spacing[padding],
      ...style,
    };
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={getCardStyle()}
      onPress={onPress}
      activeOpacity={onPress ? 0.9 : 1}
    >
      {children}
    </CardComponent>
  );
};