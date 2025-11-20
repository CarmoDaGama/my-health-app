import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createNeumorphicStyle } from '../../utils/neumorphicStyles';
import { Colors, spacing, fontSize, borderRadius } from '../../constants';

interface NeumorphicButtonProps {
  title?: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  rounded?: boolean;
}

export const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
  rounded = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getButtonStyle = (): ViewStyle => {
    const baseStyle = createNeumorphicStyle({
      size: size as 'small' | 'medium' | 'large',
      pressed: isPressed,
      rounded: rounded ? borderRadius.round : borderRadius.lg,
      backgroundColor: getBackgroundColor(),
    });

    const sizeStyles = {
      small: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        minHeight: 36,
      },
      medium: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        minHeight: 44,
      },
      large: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        minHeight: 52,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.6 : 1,
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
      ...style,
    };
  };

  const getBackgroundColor = (): string => {
    switch (variant) {
      case 'primary':
        return Colors.primary;
      case 'secondary':
        return Colors.secondary;
      case 'tertiary':
        return Colors.surface;
      case 'ghost':
        return 'transparent';
      default:
        return Colors.primary;
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return Colors.textOnPrimary;
      case 'tertiary':
      case 'ghost':
        return Colors.text;
      default:
        return Colors.textOnPrimary;
    }
  };

  const getTextSize = (): number => {
    switch (size) {
      case 'small':
        return fontSize.sm;
      case 'medium':
        return fontSize.md;
      case 'large':
        return fontSize.lg;
      default:
        return fontSize.md;
    }
  };

  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 18;
      case 'large':
        return 20;
      default:
        return 18;
    }
  };

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          size="small" 
          color={getTextColor()} 
        />
      );
    }

    const iconElement = icon ? (
      <Ionicons
        name={icon as any}
        size={getIconSize()}
        color={getTextColor()}
        style={{
          marginRight: iconPosition === 'left' && title ? spacing.xs : 0,
          marginLeft: iconPosition === 'right' && title ? spacing.xs : 0,
        }}
      />
    ) : null;

    const textElement = title ? (
      <Text
        style={[
          {
            fontSize: getTextSize(),
            fontWeight: '600',
            color: getTextColor(),
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    ) : null;

    return (
      <>
        {iconPosition === 'left' && iconElement}
        {textElement}
        {iconPosition === 'right' && iconElement}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};