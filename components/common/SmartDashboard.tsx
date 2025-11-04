import React from 'react';
import { UserType } from '../../types';
import { GuestDashboard, PatientDashboard, ProfessionalDashboard, InstitutionDashboard } from '../../screens/dashboards';
import AdminDashboardScreen from '../../screens/AdminDashboardScreen';

interface SmartDashboardProps {
  userType: UserType | null;
  isAuthenticated: boolean;
}

export const SmartDashboard: React.FC<SmartDashboardProps> = ({
  userType,
  isAuthenticated
}) => {
  // Debug logs
  console.log('🎯 SmartDashboard Debug:', {
    userType,
    isAuthenticated,
    userTypeEnum: {
      GUEST: UserType.GUEST,
      NORMAL_USER: UserType.NORMAL_USER,
      PROFESSIONAL: UserType.PROFESSIONAL,
      INSTITUTION: UserType.INSTITUTION,
      ADMIN: UserType.ADMIN
    }
  });

  // Se não está autenticado, sempre mostrar dashboard de convidado
  if (!isAuthenticated) {
    console.log('🚪 Não autenticado - mostrando GuestDashboard');
    return <GuestDashboard />;
  }

  // Roteamento baseado no tipo de usuário autenticado
  switch (userType) {
    case UserType.NORMAL_USER:
      console.log('👤 Mostrando PatientDashboard');
      return <PatientDashboard />;
    
    case UserType.PROFESSIONAL:
      console.log('👨‍⚕️ Mostrando ProfessionalDashboard');
      return <ProfessionalDashboard />;
    
    case UserType.INSTITUTION:
      console.log('🏥 Mostrando InstitutionDashboard');
      return <InstitutionDashboard />;
    
    case UserType.ADMIN:
      console.log('👑 Mostrando AdminDashboard');
      return <AdminDashboardScreen />;
    
    case UserType.GUEST:
    default:
      console.log('🔄 Fallback para GuestDashboard, userType:', userType);
      // Fallback para dashboard de convidado
      return <GuestDashboard />;
  }
};
