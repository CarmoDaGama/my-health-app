import { ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';
import { shadows } from '../constants/shadows';
import { borderRadius } from '../constants/dimensions';

interface NeumorphicOptions {
  size?: 'small' | 'medium' | 'large';
  pressed?: boolean;
  elevated?: boolean;
  rounded?: boolean | number;
  backgroundColor?: string;
}

/**
 * Generates neumorphic styles for components
 */
export function createNeumorphicStyle({
  size = 'medium',
  pressed = false,
  elevated = true,
  rounded = true,
  backgroundColor,
}: NeumorphicOptions = {}): ViewStyle {
  // Default background color
  const bgColor = backgroundColor || Colors.surface || '#ffffff';

  // Get shadow style
  const shadowStyle = pressed
    ? (shadows?.neumorphic?.inset || {})
    : (shadows?.neumorphic?.[size] || {});

  // Calculate border radius
  let borderRadiusValue: number;
  if (typeof rounded === 'number') {
    borderRadiusValue = rounded;
  } else if (rounded === true) {
    borderRadiusValue = size === 'small' ? (borderRadius?.md || 12) :
      size === 'medium' ? (borderRadius?.lg || 18) : (borderRadius?.xl || 24);
  } else {
    borderRadiusValue = 0;
  }

  // Build base style
  const baseStyle: ViewStyle = {
    backgroundColor: bgColor,
    borderRadius: borderRadiusValue,
  };

  // Add main shadow if elevated and not pressed
  if (elevated && !pressed && shadowStyle) {
    Object.assign(baseStyle, shadowStyle);
  }

  return baseStyle;
}

/**
 * Pre-defined styles for neumorphic buttons
 */
export const neumorphicButton = {
  default: createNeumorphicStyle({ size: 'medium' }),
  small: createNeumorphicStyle({ size: 'small' }),
  large: createNeumorphicStyle({ size: 'large' }),
  pressed: createNeumorphicStyle({ size: 'medium', pressed: true }),
  circular: createNeumorphicStyle({ size: 'medium', rounded: 50 }),
};

/**
 * Pre-defined styles for neumorphic cards
 */
export const neumorphicCard = {
  default: createNeumorphicStyle({
    size: 'medium',
    rounded: 18
  }),
  elevated: createNeumorphicStyle({
    size: 'large',
    rounded: 24
  }),
  flat: createNeumorphicStyle({
    size: 'small',
    rounded: 12
  }),
};

/**
 * Estilos para inputs neumórficos
 */
export const neumorphicInput = {
  default: createNeumorphicStyle({
    size: 'small',
    pressed: true,
    rounded: 18
  }),
  focused: createNeumorphicStyle({
    size: 'medium',
    pressed: false,
    rounded: 18
  }),
};

/**
 * Gradient backgrounds para elementos neumórficos
 */
export const neumorphicGradients = {
  primary: {
    colors: Colors.gradients.primary,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  secondary: {
    colors: Colors.gradients.secondary,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  surface: {
    colors: Colors.gradients.surface,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  background: {
    colors: Colors.gradients.background,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
};

/**
 * Animations for neumorphic effects
 */
export const neumorphicAnimations = {
  pressIn: {
    transform: [{ scale: 0.98 }],
    duration: 100,
  },
  pressOut: {
    transform: [{ scale: 1 }],
    duration: 100,
  },
  hover: {
    transform: [{ scale: 1.02 }],
    duration: 150,
  },
};

/**
 * Utility for creating text with neumorphic shadow
 */
export const neumorphicTextShadow = {
  light: {
    textShadowColor: Colors.neumorphic.lightShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dark: {
    textShadowColor: Colors.neumorphic.darkShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
};