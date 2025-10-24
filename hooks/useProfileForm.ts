import { useState, useEffect } from 'react';
import { User, NormalUser, Professional, Institution } from '../types';

interface UseProfileFormProps<T extends User> {
  user: T;
  onDataChange?: (data: T) => void;
}

interface UseProfileFormReturn<T> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  updateField: (field: keyof T, value: any) => void;
  resetForm: () => void;
  isDirty: boolean;
}

export function useProfileForm<T extends User>({ 
  user, 
  onDataChange 
}: UseProfileFormProps<T>): UseProfileFormReturn<T> {
  
  const [formData, setFormData] = useState<T>(user);
  const [initialData, setInitialData] = useState<T>(user);
  const [isDirty, setIsDirty] = useState(false);

  // Atualizar formulário quando os dados do usuário mudarem
  useEffect(() => {
    console.log('🔄 useProfileForm - Dados do usuário atualizados:', {
      userId: user.id,
      userType: user.userType,
      name: user.name,
      hasChanges: JSON.stringify(user) !== JSON.stringify(initialData)
    });

    setFormData(user);
    setInitialData(user);
    setIsDirty(false);
  }, [user, initialData]);

  // Detectar mudanças no formulário
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);
    setIsDirty(hasChanges);
    
    if (onDataChange && hasChanges) {
      onDataChange(formData);
    }
  }, [formData, initialData, onDataChange]);

  const updateField = (field: keyof T, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData(initialData);
    setIsDirty(false);
  };

  return {
    formData,
    setFormData,
    updateField,
    resetForm,
    isDirty
  };
}

// Hook específico para usuários normais
export function useNormalUserForm(user: NormalUser) {
  return useProfileForm({ user });
}

// Hook específico para profissionais
export function useProfessionalForm(user: Professional) {
  return useProfileForm({ user });
}

// Hook específico para instituições
export function useInstitutionForm(user: Institution) {
  return useProfileForm({ user });
}
