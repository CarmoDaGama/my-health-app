import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, spacing, borderRadius, fontSize } from '../../constants';
import { 
  CreateServiceData, 
  ServiceCategory, 
  InstitutionService 
} from '../../types/institutionService';

interface ServiceFormProps {
  service?: InstitutionService | null;
  onSubmit: (data: CreateServiceData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  service,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CreateServiceData>({
    name: '',
    description: '',
    category: ServiceCategory.CONSULTATION,
    responsible: '',
    department: '',
    price: 0,
    duration: 30,
    requirements: [],
    tags: []
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        category: service.category,
        responsible: service.responsible,
        department: service.department,
        price: service.price,
        duration: service.duration,
        requirements: service.requirements || [],
        tags: service.tags || []
      });
    }
  }, [service]);

  const categories = [
    { value: ServiceCategory.CONSULTATION, label: 'Consulta' },
    { value: ServiceCategory.EXAM, label: 'Exame' },
    { value: ServiceCategory.PROCEDURE, label: 'Procedimento' },
    { value: ServiceCategory.EMERGENCY, label: 'Emergência' },
    { value: ServiceCategory.ADMINISTRATIVE, label: 'Administrativo' },
    { value: ServiceCategory.LABORATORY, label: 'Laboratório' },
    { value: ServiceCategory.IMAGING, label: 'Imagem' },
    { value: ServiceCategory.THERAPY, label: 'Terapia' },
    { value: ServiceCategory.VACCINATION, label: 'Vacinação' },
    { value: ServiceCategory.OTHER, label: 'Outro' }
  ];

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    if (!formData.responsible.trim()) {
      newErrors.responsible = 'Responsável é obrigatório';
    }
    if (!formData.department.trim()) {
      newErrors.department = 'Departamento é obrigatório';
    }
    if (formData.price < 0) {
      newErrors.price = 'Preço deve ser maior ou igual a zero';
    }
    if (formData.duration <= 0) {
      newErrors.duration = 'Duração deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, corrija os campos obrigatórios.');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar serviço. Tente novamente.');
    }
  };

  const updateField = (field: keyof CreateServiceData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando ele for alterado
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        {/* Nome */}
        <View style={styles.field}>
          <Text style={styles.label}>Nome do Serviço *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            placeholder="Ex: Consulta Cardiológica"
            placeholderTextColor={Colors.textSecondary}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Descrição */}
        <View style={styles.field}>
          <Text style={styles.label}>Descrição *</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.description && styles.inputError]}
            value={formData.description}
            onChangeText={(value) => updateField('description', value)}
            placeholder="Descreva o serviço oferecido..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={3}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        {/* Categoria */}
        <View style={styles.field}>
          <Text style={styles.label}>Categoria *</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryOption,
                  formData.category === cat.value && styles.categoryOptionSelected
                ]}
                onPress={() => updateField('category', cat.value)}
              >
                <Text style={[
                  styles.categoryOptionText,
                  formData.category === cat.value && styles.categoryOptionTextSelected
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Responsável */}
        <View style={styles.field}>
          <Text style={styles.label}>Responsável *</Text>
          <TextInput
            style={[styles.input, errors.responsible && styles.inputError]}
            value={formData.responsible}
            onChangeText={(value) => updateField('responsible', value)}
            placeholder="Nome do profissional responsável"
            placeholderTextColor={Colors.textSecondary}
          />
          {errors.responsible && <Text style={styles.errorText}>{errors.responsible}</Text>}
        </View>

        {/* Departamento */}
        <View style={styles.field}>
          <Text style={styles.label}>Departamento *</Text>
          <TextInput
            style={[styles.input, errors.department && styles.inputError]}
            value={formData.department}
            onChangeText={(value) => updateField('department', value)}
            placeholder="Ex: Cardiologia, Emergência"
            placeholderTextColor={Colors.textSecondary}
          />
          {errors.department && <Text style={styles.errorText}>{errors.department}</Text>}
        </View>

        {/* Preço e Duração */}
        <View style={styles.row}>
          <View style={[styles.field, styles.halfWidth]}>
            <Text style={styles.label}>Preço (€) *</Text>
            <TextInput
              style={[styles.input, errors.price && styles.inputError]}
              value={formData.price.toString()}
              onChangeText={(value) => updateField('price', parseFloat(value) || 0)}
              placeholder="0.00"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
            />
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
          </View>

          <View style={[styles.field, styles.halfWidth]}>
            <Text style={styles.label}>Duração (min) *</Text>
            <TextInput
              style={[styles.input, errors.duration && styles.inputError]}
              value={formData.duration.toString()}
              onChangeText={(value) => updateField('duration', parseInt(value) || 0)}
              placeholder="30"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
            />
            {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
          </View>
        </View>

        {/* Botões */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {service ? 'Atualizar' : 'Criar'} Serviço
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: spacing.md,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  inputError: {
    borderColor: Colors.error,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: fontSize.sm,
    color: Colors.error,
    marginTop: spacing.xs,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  categoryOption: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: borderRadius.sm,
  },
  categoryOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryOptionText: {
    fontSize: fontSize.sm,
    color: Colors.text,
  },
  categoryOptionTextSelected: {
    color: Colors.white,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    color: Colors.text,
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
  submitButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default ServiceForm;
