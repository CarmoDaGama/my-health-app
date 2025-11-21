import React, { useState, forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createNeumorphicStyle } from '../../utils/neumorphicStyles';
import { Colors, spacing, fontSize, borderRadius } from '../../constants';

interface NeumorphicInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  size?: 'small' | 'medium' | 'large';
}

export const NeumorphicInput = forwardRef<TextInput, NeumorphicInputProps>((
  {
    label,
    error,
    icon,
    iconPosition = 'left',
    containerStyle,
    inputStyle,
    size = 'medium',
    ...textInputProps
  },
  ref
) => {
  const [isFocused, setIsFocused] = useState(false);

  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle = createNeumorphicStyle({
      size: 'small',
      pressed: isFocused,
      rounded: borderRadius.lg,
      backgroundColor: isFocused ? Colors.surface : Colors.backgroundDark,
    });

    const sizeStyles = {
      small: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        minHeight: 36,
      },
      medium: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        minHeight: 44,
      },
      large: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        minHeight: 52,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: isFocused ? 1 : 0,
      borderColor: isFocused ? Colors.primary : 'transparent',
    };
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

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          style={{
            fontSize: fontSize.sm,
            fontWeight: '600',
            color: Colors.text,
            marginBottom: spacing.xs,
          }}
        >
          {label}
        </Text>
      )}
      
      <View style={getInputContainerStyle()}>
        {icon && iconPosition === 'left' && (
          <Ionicons
            name={icon as any}
            size={getIconSize()}
            color={isFocused ? Colors.primary : Colors.textSecondary}
            style={{ marginRight: spacing.sm }}
          />
        )}
        
        <TextInput
          ref={ref}
          {...textInputProps}
          style={[
            {
              flex: 1,
              fontSize: getTextSize(),
              color: Colors.text,
              fontWeight: '500',
            },
            inputStyle,
          ]}
          placeholderTextColor={Colors.textTertiary}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
        />
        
        {icon && iconPosition === 'right' && (
          <Ionicons
            name={icon as any}
            size={getIconSize()}
            color={isFocused ? Colors.primary : Colors.textSecondary}
            style={{ marginLeft: spacing.sm }}
          />
        )}
      </View>
      
      {error && (
        <Text
          style={{
            fontSize: fontSize.xs,
            color: Colors.error,
            marginTop: spacing.xs,
            fontWeight: '500',
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
});

NeumorphicInput.displayName = 'NeumorphicInput';