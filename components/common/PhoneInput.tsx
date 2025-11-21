import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import ValidatedInput from './ValidatedInput';
import { validateAngolanPhoneNumber, PhoneValidationResult } from '../../utils/validation';
import { Colors } from '../../constants/colors';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onValidationChange?: (result: PhoneValidationResult) => void;
  label?: string;
  placeholder?: string;
  containerStyle?: ViewStyle;
  required?: boolean;
  autoFormat?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  onValidationChange,
  label = 'Phone Number',
  placeholder = '+244 9XX XXX XXX',
  containerStyle,
  required = false,
  autoFormat = true,
}) => {
  const [validationResult, setValidationResult] = useState<PhoneValidationResult>({ isValid: false });
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const formatPhoneNumber = (phone: string): string => {
    if (!autoFormat) return phone;

    // Remove todos os caracteres não numéricos exceto +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Se começar com +244, formatar
    if (cleaned.startsWith('+244')) {
      const national = cleaned.substring(4);
      if (national.length <= 3) return `+244 ${national}`;
      if (national.length <= 6) return `+244 ${national.substring(0, 3)} ${national.substring(3)}`;
      return `+244 ${national.substring(0, 3)} ${national.substring(3, 6)} ${national.substring(6, 9)}`;
    }
    
    // Se começar com 9 ou 2 (números angolanos)
    if (/^[92]/.test(cleaned)) {
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 6) return `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`;
      return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)}`;
    }
    
    return cleaned;
  };

  const handleChangeText = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setDisplayValue(formatted);
    
    // Validar o número
    const result = validateAngolanPhoneNumber(text);
    setValidationResult(result);
    
    if (onValidationChange) {
      onValidationChange(result);
    }
    
    // Usar o número formatado se válido, senão o texto original
    onChangeText(result.isValid && result.formatted ? result.formatted : text);
  };

  return (
    <View style={containerStyle}>
      <ValidatedInput
        label={label}
        placeholder={placeholder}
        value={displayValue}
        onChangeText={handleChangeText}
        error={!validationResult.isValid ? validationResult.error : null}
        isValid={validationResult.isValid}
        keyboardType="phone-pad"
        required={required}
        helperText={
          validationResult.isValid && validationResult.operator 
            ? `Operadora: ${validationResult.operator}`
            : 'Formato: +244 9XX XXX XXX'
        }
      />
      
      {validationResult.isValid && validationResult.formatted && (
        <View style={styles.validationInfo}>
          <Text style={styles.validationText}>
            ✓ Número válido: {validationResult.formatted}
          </Text>
          {validationResult.operator && validationResult.operator !== 'Unknown' && (
            <Text style={styles.operatorText}>
              Operadora: {validationResult.operator}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  validationInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: Colors.success + '20',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  validationText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
  },
  operatorText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default PhoneInput;