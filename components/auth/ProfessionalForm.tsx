import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ValidatedInput from '../common/ValidatedInput';

interface ProfessionalFormProps {
  data: any;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export default function ProfessionalForm({ data, onChange, errors }: ProfessionalFormProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informações Profissionais</Text>
      
      <ValidatedInput
        label="Especialidade"
        value={data.specialty || ''}
        onChangeText={(value) => onChange('specialty', value)}
        error={errors.specialty}
        placeholder="Ex: Cardiologia, Pediatria..."
        required
      />
      
      <ValidatedInput
        label="Número da Licença"
        value={data.license || ''}
        onChangeText={(value) => onChange('license', value)}
        error={errors.license}
        placeholder="Número do registro profissional"
        required
      />
      
      <ValidatedInput
        label="Anos de Experiência"
        value={data.experience?.toString() || ''}
        onChangeText={(value) => onChange('experience', parseInt(value) || 0)}
        error={errors.experience}
        placeholder="Ex: 5"
        keyboardType="numeric"
      />
      
      <ValidatedInput
        label="Biografia (opcional)"
        value={data.bio || ''}
        onChangeText={(value) => onChange('bio', value)}
        error={errors.bio}
        placeholder="Conte um pouco sobre sua experiência..."
        multiline
        numberOfLines={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#374151',
  },
});