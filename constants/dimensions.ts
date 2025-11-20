import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const screenWidth = width;
export const screenHeight = height;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  xs: 2,
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 32,
  round: 50,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 19,
  xxl: 22,
  xxxl: 26,
  display: 32,
};

// Neumorphic Shadows
export const shadows = {
  neumorphic: {
    small: {
      shadowColor: '#a3b1c6',
      shadowOffset: {
        width: 2,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#a3b1c6',
      shadowOffset: {
        width: 4,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#a3b1c6',
      shadowOffset: {
        width: 8,
        height: 8,
      },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
    inset: {
      shadowColor: '#d1d9e6',
      shadowOffset: {
        width: -2,
        height: -2,
      },
      shadowOpacity: 0.6,
      shadowRadius: 4,
      elevation: -2,
    },
  },
  
  // Light Shadows for highlights
  light: {
    small: {
      shadowColor: '#ffffff',
      shadowOffset: {
        width: -2,
        height: -2,
      },
      shadowOpacity: 0.9,
      shadowRadius: 4,
      elevation: 1,
    },
    medium: {
      shadowColor: '#ffffff',
      shadowOffset: {
        width: -4,
        height: -4,
      },
      shadowOpacity: 0.9,
      shadowRadius: 8,
      elevation: 2,
    },
  },
};
