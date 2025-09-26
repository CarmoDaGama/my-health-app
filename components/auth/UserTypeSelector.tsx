import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserType } from '../../types';

interface UserTypeSelectorProps {
  selectedType: UserType;
  onSelect: (type: UserType) => void;
  disabled?: boolean;
}

const USER_TYPE_OPTIONS = [
  {
    type: UserType.NORMAL_USER,
    title: 'Usuário',
    description: 'Procurar instituições e profissionais de saúde',
    icon: '👤'
  },
  {
    type: UserType.PROFESSIONAL,
    title: 'Profissional',
    description: 'Médico, enfermeiro ou outro profissional de saúde',
    icon: '👨‍⚕️'
  },
  {
    type: UserType.INSTITUTION,
    title: 'Instituição',
    description: 'Hospital, clínica, laboratório ou farmácia',
    icon: '🏥'
  }
];

export default function UserTypeSelector({ selectedType, onSelect, disabled }: UserTypeSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tipo de Conta</Text>
      {USER_TYPE_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.type}
          style={[
            styles.option,
            selectedType === option.type && styles.optionSelected,
            disabled && styles.optionDisabled
          ]}
          onPress={() => !disabled && onSelect(option.type)}
          disabled={disabled}
        >
          <Text style={styles.icon}>{option.icon}</Text>
          <View style={styles.optionContent}>
            <Text style={[
              styles.optionTitle,
              selectedType === option.type && styles.optionTextSelected
            ]}>
              {option.title}
            </Text>
            <Text style={[
              styles.optionDescription,
              selectedType === option.type && styles.optionDescriptionSelected
            ]}>
              {option.description}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  optionDisabled: {
    opacity: 0.6,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  optionTextSelected: {
    color: '#1D4ED8',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  optionDescriptionSelected: {
    color: '#3B82F6',
  },
});