/**
 * MENDLINK - Neumorphic Shadow System
 * Modern neumorphic design shadows for consistent UI
 */

import { ViewStyle } from 'react-native';
import { Colors } from './colors';

export interface NeumorphicShadowStyle extends ViewStyle {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}

/**
 * Neumorphic shadow system - soft, subtle shadows for depth
 */
export const shadows = {
  neumorphic: {
    // Small - subtle depth for inputs, small cards
    small: {
      shadowColor: Colors.neumorphic.darkShadow,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 2,
    } as NeumorphicShadowStyle,

    // Medium - standard cards and buttons
    medium: {
      shadowColor: Colors.neumorphic.darkShadow,
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 4,
    } as NeumorphicShadowStyle,

    // Large - prominent elements, floating action buttons
    large: {
      shadowColor: Colors.neumorphic.darkShadow,
      shadowOffset: { width: 10, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 8,
    } as NeumorphicShadowStyle,

    // Inset - pressed state, inputs
    inset: {
      shadowColor: Colors.neumorphic.darkShadow,
      shadowOffset: { width: -3, height: -3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 0,
    } as NeumorphicShadowStyle,
  },

  // Standard Material Design shadows (fallback)
  material: {
    small: {
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    } as NeumorphicShadowStyle,

    medium: {
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    } as NeumorphicShadowStyle,

    large: {
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    } as NeumorphicShadowStyle,
  },
};

/**
 * Create dual neumorphic shadow (light + dark for 3D effect)
 */
export const createNeumorphicShadow = (intensity: 'small' | 'medium' | 'large' = 'medium') => {
  const shadowMap = {
    small: { offset: 3, radius: 6 },
    medium: { offset: 6, radius: 10 },
    large: { offset: 10, radius: 15 },
  };

  const config = shadowMap[intensity];

  return {
    // Dark shadow (bottom-right)
    shadowColor: Colors.neumorphic.darkShadow,
    shadowOffset: { width: config.offset, height: config.offset },
    shadowOpacity: 0.2,
    shadowRadius: config.radius,
    // Light highlight would be added in a separate layer for true neumorphism
  };
};
