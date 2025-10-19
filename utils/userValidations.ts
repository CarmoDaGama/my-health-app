import { UserType, AnyUser, isProfessional, isInstitution } from '../types';

/**
 * Validações de status do usuário
 */

/**
 * Verifica se o usuário está ativo (pode fazer login)
 */
export function isUserActive(user: AnyUser | null): boolean {
  if (!user || user.userType === UserType.GUEST) {
    return true; // Convidados são sempre considerados "ativos"
  }
  
  // Para usuários registrados, verificar campo isActive
  return (user as any).isActive === true;
}

/**
 * Verifica se o usuário está ativo nos serviços (aparece nas buscas)
 * Apenas aplicável para profissionais e instituições
 */
export function isUserServiceActive(user: AnyUser | null): boolean {
  if (!user || user.userType === UserType.GUEST || user.userType === UserType.NORMAL_USER) {
    return true; // Usuários normais e convidados não precisam de verificação de serviço
  }
  
  // Para profissionais e instituições, verificar campo isVerified (que controla o status do serviço)
  if (isProfessional(user) || isInstitution(user)) {
    return (user as any).isVerified === true;
  }
  
  return true;
}

/**
 * Obter mensagem de aviso para conta com serviço suspenso
 */
export function getSuspendedServiceMessage(language: 'pt' | 'en' = 'pt'): string {
  return language === 'pt'
    ? 'Seu serviço profissional está suspenso e não aparecerá nas buscas.'
    : 'Your professional service is suspended and will not appear in searches.';
}

/**
 * Verifica se o usuário deveria receber um aviso sobre status do serviço
 */
export function shouldShowServiceStatusWarning(user: AnyUser | null): boolean {
  if (!user || user.userType === UserType.GUEST || user.userType === UserType.NORMAL_USER) {
    return false;
  }
  
  return !isUserServiceActive(user);
}

/**
 * Obter mensagem de erro para conta inativa
 */
export function getInactiveAccountMessage(language: 'pt' | 'en' = 'pt'): string {
  return language === 'pt' 
    ? 'Sua conta foi desativada. Entre em contato com o suporte para assistência.'
    : 'Your account has been deactivated. Please contact support for assistance.';
}

/**
 * Obter mensagem de aviso para conta não verificada
 */
export function getUnverifiedAccountMessage(language: 'pt' | 'en' = 'pt'): string {
  return language === 'pt'
    ? 'Sua conta profissional ainda não foi verificada e não aparecerá nas buscas.'
    : 'Your professional account is not yet verified and will not appear in searches.';
}

/**
 * Verifica se o usuário deveria receber um aviso sobre verificação
 */
export function shouldShowVerificationWarning(user: AnyUser | null): boolean {
  if (!user || user.userType === UserType.GUEST || user.userType === UserType.NORMAL_USER) {
    return false;
  }
  
  return !isUserServiceActive(user);
}