import { useState, useCallback } from 'react';
import {
  validateAngolanPhoneNumber,
  validateAngolanCoordinates,
  validateAngolanAddress,
  validateEmail,
  validateName,
  PhoneValidationResult,
  CoordinateValidationResult,
  AddressValidationResult,
} from '../utils/validation';

export interface ValidationState {
  isValid: boolean;
  error: string | null;
  touched: boolean;
}

export interface FormValidationState {
  [key: string]: ValidationState;
}

export const useValidation = () => {
  const [validationState, setValidationState] = useState<FormValidationState>({});

  const validateField = useCallback((
    fieldName: string,
    value: any,
    validationType: 'phone' | 'coordinates' | 'address' | 'email' | 'name' | 'custom',
    customValidator?: (value: any) => { isValid: boolean; error?: string }
  ) => {
    let result: { isValid: boolean; error?: string };

    switch (validationType) {
      case 'phone':
        result = validateAngolanPhoneNumber(value);
        break;
      case 'coordinates':
        if (typeof value === 'object' && value.latitude !== undefined && value.longitude !== undefined) {
          result = validateAngolanCoordinates(value.latitude, value.longitude);
        } else {
          result = { isValid: false, error: 'Coordenadas inválidas' };
        }
        break;
      case 'address':
        result = validateAngolanAddress(value);
        break;
      case 'email':
        result = validateEmail(value);
        break;
      case 'name':
        result = validateName(value);
        break;
      case 'custom':
        if (customValidator) {
          result = customValidator(value);
        } else {
          result = { isValid: true };
        }
        break;
      default:
        result = { isValid: true };
    }

    setValidationState(prev => ({
      ...prev,
      [fieldName]: {
        isValid: result.isValid,
        error: result.error || null,
        touched: true,
      }
    }));

    return result;
  }, []);

  const validatePhoneNumber = useCallback((fieldName: string, phone: string): PhoneValidationResult => {
    const result = validateAngolanPhoneNumber(phone);
    
    setValidationState(prev => ({
      ...prev,
      [fieldName]: {
        isValid: result.isValid,
        error: result.error || null,
        touched: true,
      }
    }));

    return result;
  }, []);

  const validateCoordinates = useCallback((
    fieldName: string, 
    latitude: number | string, 
    longitude: number | string
  ): CoordinateValidationResult => {
    const result = validateAngolanCoordinates(latitude, longitude);
    
    setValidationState(prev => ({
      ...prev,
      [fieldName]: {
        isValid: result.isValid,
        error: result.error || null,
        touched: true,
      }
    }));

    return result;
  }, []);

  const validateAddress = useCallback((fieldName: string, address: string): AddressValidationResult => {
    const result = validateAngolanAddress(address);
    
    setValidationState(prev => ({
      ...prev,
      [fieldName]: {
        isValid: result.isValid,
        error: result.error || null,
        touched: true,
      }
    }));

    return result;
  }, []);

  const markFieldAsTouched = useCallback((fieldName: string) => {
    setValidationState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        touched: true,
      }
    }));
  }, []);

  const clearFieldValidation = useCallback((fieldName: string) => {
    setValidationState(prev => {
      const newState = { ...prev };
      delete newState[fieldName];
      return newState;
    });
  }, []);

  const clearAllValidation = useCallback(() => {
    setValidationState({});
  }, []);

  const isFormValid = useCallback((fieldNames?: string[]) => {
    const fieldsToCheck = fieldNames || Object.keys(validationState);
    return fieldsToCheck.every(fieldName => 
      validationState[fieldName]?.isValid !== false
    );
  }, [validationState]);

  const getFieldError = useCallback((fieldName: string) => {
    const field = validationState[fieldName];
    return field?.touched && !field.isValid ? field.error : null;
  }, [validationState]);

  const hasFieldError = useCallback((fieldName: string) => {
    const field = validationState[fieldName];
    return field?.touched && !field.isValid;
  }, [validationState]);

  return {
    validationState,
    validateField,
    validatePhoneNumber,
    validateCoordinates,
    validateAddress,
    markFieldAsTouched,
    clearFieldValidation,
    clearAllValidation,
    isFormValid,
    getFieldError,
    hasFieldError,
  };
};

export default useValidation;