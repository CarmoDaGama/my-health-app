import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../../constants/colors';
import { spacing } from '../../constants/dimensions';

interface UserAvatarProps {
  name: string;
  avatar?: string;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  style?: any;
}

const sizeStyles = {
  small: { width: 32, height: 32, borderRadius: 16 },
  medium: { width: 48, height: 48, borderRadius: 24 },
  large: { width: 80, height: 80, borderRadius: 40 },
};

const textSizes = {
  small: 14,
  medium: 18,
  large: 32,
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatar,
  size = 'medium',
  onPress,
  style,
}) => {
  const initials = name
    .split(' ')
    .map(n => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const containerStyle = [
    styles.container,
    sizeStyles[size],
    style,
  ];

  const content = avatar ? (
    <Image source={{ uri: avatar }} style={[sizeStyles[size], styles.image]} />
  ) : (
    <Text style={[styles.initials, { fontSize: textSizes[size] }]}>
      {initials}
    </Text>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={containerStyle} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    color: Colors.text.onPrimary,
    fontWeight: 'bold',
  },
});