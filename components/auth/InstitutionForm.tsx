import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import ValidatedInput from '../common/ValidatedInput';

interface InstitutionFormProps {
  data: any;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

const INSTITUTION_TYPES = [
  { label: 'Selecione o tipo', value: '' },
  { label: 'Hospital', value: 'hospital' },
  { label: 'Clínica', value: 'clinic' },
  { label: 'Laboratório', value: 'laboratory' },
  { label: 'Farmácia', value: 'pharmacy' },
  { label: 'Outro', value: 'other' },
];

export default function InstitutionForm({ data, onChange, errors }: InstitutionFormProps) {
  const [showTypePicker, setShowTypePicker] = useState(false);

  const handleNestedChange = (field: string, value: any) => {
    if (field.startsWith('address.')) {
      const addressField = field.replace('address.', '');
      onChange('address', {
        ...data.address,
        [addressField]: value
      });
    } else {
      onChange(field, value);
    }
  };

  const handleTypeSelect = (value: string) => {
    onChange('type', value);
    setShowTypePicker(false);
  };

  const selectedTypeLabel = INSTITUTION_TYPES.find(type => type.value === data.type)?.label || 'Selecione o tipo';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informações da Instituição</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tipo de Instituição *</Text>
        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => setShowTypePicker(true)}
        >
          <Text style={[styles.pickerText, !data.type && styles.placeholder]}>
            {selectedTypeLabel}
          </Text>
        </TouchableOpacity>
        {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
      </View>

      <Modal
        visible={showTypePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTypePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o Tipo</Text>
            <FlatList
              data={INSTITUTION_TYPES.filter(type => type.value !== '')}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleTypeSelect(item.value)}
                >
                  <Text style={styles.modalOptionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTypePicker(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <Text style={styles.sectionTitle}>Endereço</Text>
      
      <ValidatedInput
        label="Rua"
        value={data.address?.street || ''}
        onChangeText={(value) => handleNestedChange('address.street', value)}
        error={errors['address.street']}
        placeholder="Rua, número"
        required
      />
      
      <ValidatedInput
        label="Cidade"
        value={data.address?.city || ''}
        onChangeText={(value) => handleNestedChange('address.city', value)}
        error={errors['address.city']}
        placeholder="Cidade"
        required
      />
      
      <ValidatedInput
        label="Província"
        value={data.address?.state || ''}
        onChangeText={(value) => handleNestedChange('address.state', value)}
        error={errors['address.state']}
        placeholder="Província"
        required
      />
      
      <ValidatedInput
        label="Telefone da Instituição"
        value={data.contactPhone || ''}
        onChangeText={(value) => onChange('contactPhone', value)}
        error={errors.contactPhone}
        placeholder="+244 XXX XXX XXX"
        keyboardType="phone-pad"
        required
      />
      
      <ValidatedInput
        label="Descrição"
        value={data.description || ''}
        onChangeText={(value) => onChange('description', value)}
        error={errors.description}
        placeholder="Descreva os serviços oferecidos..."
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#374151',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 16,
    minHeight: 50,
    justifyContent: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#374151',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 20,
    maxHeight: 400,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  modalCloseButton: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
});