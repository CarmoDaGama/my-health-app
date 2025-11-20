import { ViewStyle } from 'react-native';
import { Colors, shadows, borderRadius } from '../constants';

interface NeumorphicOptions {
  size?: 'small' | 'medium' | 'large';
  pressed?: boolean;
  elevated?: boolean;
  rounded?: boolean | number;
  backgroundColor?: string;
}

/**
 * Gera estilos neumórficos para componentes
 */
export const createNeumorphicStyle = ({
  size = 'medium',
  pressed = false,
  elevated = true,
  rounded = true,
  backgroundColor = Colors.surface,
}: NeumorphicOptions = {}): ViewStyle => {
  const shadowStyle = pressed ? shadows.neumorphic.inset : shadows.neumorphic[size];
  const lightShadowStyle = pressed ? {} : shadows.light[size === 'large' ? 'medium' : 'small'];
  
  let borderRadiusValue: number;
  if (typeof rounded === 'number') {
    borderRadiusValue = rounded;
  } else if (rounded === true) {
    borderRadiusValue = size === 'small' ? borderRadius.md : 
                      size === 'medium' ? borderRadius.lg : borderRadius.xl;
  } else {
    borderRadiusValue = 0;
  }

  return {
    backgroundColor,
    borderRadius: borderRadiusValue,
    ...(elevated && !pressed && shadowStyle),
    // Adicionar sombra clara para o efeito neumórfico completo no iOS
    ...(elevated && !pressed && {
      shadowColor: Colors.neumorphic.lightShadow,
      shadowOffset: {
        width: -shadowStyle.shadowOffset.width,
        height: -shadowStyle.shadowOffset.height,
      },
      shadowOpacity: 0.9,
      shadowRadius: shadowStyle.shadowRadius * 0.5,
    }),
  };
};

/**
 * Estilos pré-definidos para botões neumórficos
 */
export const neumorphicButton = {
  default: createNeumorphicStyle({ size: 'medium' }),
  small: createNeumorphicStyle({ size: 'small' }),
  large: createNeumorphicStyle({ size: 'large' }),
  pressed: createNeumorphicStyle({ size: 'medium', pressed: true }),
  circular: createNeumorphicStyle({ size: 'medium', rounded: borderRadius.round }),
};

/**
 * Estilos pré-definidos para cards neumórficos
 */
export const neumorphicCard = {
  default: createNeumorphicStyle({ 
    size: 'medium', 
    backgroundColor: Colors.surface,
    rounded: borderRadius.lg 
  }),
  elevated: createNeumorphicStyle({ 
    size: 'large', 
    backgroundColor: Colors.surface,
    rounded: borderRadius.xl 
  }),
  flat: createNeumorphicStyle({ 
    size: 'small', 
    backgroundColor: Colors.surfaceDark,
    rounded: borderRadius.md 
  }),
};

/**
 * Estilos para inputs neumórficos
 */
export const neumorphicInput = {
  default: createNeumorphicStyle({ 
    size: 'small', 
    pressed: true,
    backgroundColor: Colors.backgroundDark,
    rounded: borderRadius.lg 
  }),
  focused: createNeumorphicStyle({ 
    size: 'medium', 
    pressed: false,
    backgroundColor: Colors.surface,
    rounded: borderRadius.lg 
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
 * Animações para efeitos neumórficos
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
 * Utilitário para criar texto com sombra neumórfica
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