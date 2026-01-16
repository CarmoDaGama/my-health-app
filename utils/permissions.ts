import { UserType, UserProfile } from '../types';

/**
 * Utility for checking user permissions and capabilities
 */
export class PermissionsManager {
  
  /**
   * Check if user can access admin features
   */
  static canAccessAdmin(user: UserProfile | null): boolean {
    return user?.userType === UserType.ADMIN;
  }

  /**
   * Check if user can manage services
   */
  static canManageServices(user: UserProfile | null): boolean {
    return user?.userType === UserType.PROFESSIONAL || 
           user?.userType === UserType.INSTITUTION ||
           user?.userType === UserType.ADMIN;
  }

  /**
   * Check if user can view analytics
   */
  static canViewAnalytics(user: UserProfile | null): boolean {
    return user?.userType === UserType.PROFESSIONAL || 
           user?.userType === UserType.INSTITUTION ||
           user?.userType === UserType.ADMIN;
  }

  /**
   * Check if user can save favorites
   */
  static canSaveFavorites(user: UserProfile | null): boolean {
    return user !== null && user.userType !== 'guest';
  }

  /**
   * Check if user can write reviews
   */
  static canWriteReviews(user: UserProfile | null): boolean {
    return user?.userType === UserType.NORMAL_USER ||
           user?.userType === UserType.ADMIN;
  }

  /**
   * Check if user can manage appointments
   */
  static canManageAppointments(user: UserProfile | null): boolean {
    return user?.userType === UserType.PROFESSIONAL || 
           user?.userType === UserType.INSTITUTION ||
           user?.userType === UserType.ADMIN;
  }

  /**
   * Check if user can view appointment requests
   */
  static canViewAppointmentRequests(user: UserProfile | null): boolean {
    return user?.userType === UserType.PROFESSIONAL || 
           user?.userType === UserType.INSTITUTION ||
           user?.userType === UserType.ADMIN;
  }

  /**
   * Check if user can manage institution staff
   */
  static canManageStaff(user: UserProfile | null): boolean {
    return user?.userType === UserType.INSTITUTION ||
           user?.userType === UserType.ADMIN;
  }

  /**
   * Check if user can create services
   */
  static canCreateServices(user: UserProfile | null): boolean {
    return user?.userType === UserType.PROFESSIONAL || 
           user?.userType === UserType.INSTITUTION ||
           user?.userType === UserType.ADMIN;
  }

  /**
   * Check if user can view system reports
   */
  static canViewSystemReports(user: UserProfile | null): boolean {
    return user?.userType === UserType.ADMIN;
  }

  /**
   * Check if user can manage user roles
   */
  static canManageUserRoles(user: UserProfile | null): boolean {
    return user?.userType === UserType.ADMIN;
  }

  /**
   * Check if user can access professional features
   */
  static canAccessProfessionalFeatures(user: UserProfile | null): boolean {
    return user?.userType === UserType.PROFESSIONAL ||
           user?.userType === UserType.ADMIN;
  }

  /**
   * Check if user can access institution features
   */
  static canAccessInstitutionFeatures(user: UserProfile | null): boolean {
    return user?.userType === UserType.INSTITUTION ||
           user?.userType === UserType.ADMIN;
  }

  /**
   * Check if user can contact professionals directly
   */
  static canContactProfessionals(user: UserProfile | null): boolean {
    return user !== null; // All authenticated users can contact
  }

  /**
   * Check if user can schedule appointments
   */
  static canScheduleAppointments(user: UserProfile | null): boolean {
    return user?.userType === UserType.NORMAL_USER ||
           user?.userType === UserType.ADMIN;
  }

  /**
   * Get allowed navigation screens for user type
   */
  static getAllowedScreens(user: UserProfile | null): string[] {
    const commonScreens = ['Map', 'ServiceDetail'];
    
    if (!user) {
      return [...commonScreens, 'Login', 'Register', 'ForgotPassword'];
    }

    const authenticatedScreens = [...commonScreens, 'Profile', 'EditProfile'];

    switch (user.userType) {
      case UserType.NORMAL_USER:
        return [
          ...authenticatedScreens,
          'Favorites',
          'Appointments',
          'MedicalHistory',
          'Reviews'
        ];

      case UserType.PROFESSIONAL:
        return [
          ...authenticatedScreens,
          'CreateService',
          'EditService',
          'ManageAppointments',
          'Analytics',
          'Reviews',
          'ProfessionalSettings'
        ];

      case UserType.INSTITUTION:
        return [
          ...authenticatedScreens,
          'ManageServices',
          'ManageProfessionals',
          'InstitutionSchedule',
          'InstitutionReports',
          'InstitutionSettings',
          'CreateService'
        ];

      case UserType.ADMIN:
        return [
          ...authenticatedScreens,
          'AdminDashboard',
          'AdminManageRoles',
          'AdminPendingServices',
          'SystemReports',
          'UserManagement',
          'ManageServices',
          'Analytics'
        ];

      default:
        return authenticatedScreens;
    }
  }

  /**
   * Get dashboard features available for user type
   */
  static getDashboardFeatures(user: UserProfile | null): {
    canSaveFavorites: boolean;
    canWriteReviews: boolean;
    canScheduleAppointments: boolean;
    canManageServices: boolean;
    canViewAnalytics: boolean;
    canManageAppointments: boolean;
    canAccessAdmin: boolean;
    showPremiumFeatures: boolean;
  } {
    return {
      canSaveFavorites: this.canSaveFavorites(user),
      canWriteReviews: this.canWriteReviews(user),
      canScheduleAppointments: this.canScheduleAppointments(user),
      canManageServices: this.canManageServices(user),
      canViewAnalytics: this.canViewAnalytics(user),
      canManageAppointments: this.canManageAppointments(user),
      canAccessAdmin: this.canAccessAdmin(user),
      showPremiumFeatures: user !== null
    };
  }

  /**
   * Check if a specific action is allowed for the user
   */
  static isActionAllowed(user: UserProfile | null, action: string): boolean {
    const permissions = this.getDashboardFeatures(user);
    
    switch (action) {
      case 'save_favorite':
        return permissions.canSaveFavorites;
      case 'write_review':
        return permissions.canWriteReviews;
      case 'schedule_appointment':
        return permissions.canScheduleAppointments;
      case 'manage_service':
        return permissions.canManageServices;
      case 'view_analytics':
        return permissions.canViewAnalytics;
      case 'manage_appointments':
        return permissions.canManageAppointments;
      case 'access_admin':
        return permissions.canAccessAdmin;
      default:
        return false;
    }
  }

  /**
   * Get user-friendly error message for denied action
   */
  static getPermissionDeniedMessage(action: string): string {
    switch (action) {
      case 'save_favorite':
        return 'You need to be logged in to save favorites.';
      case 'write_review':
        return 'Only patients can write reviews.';
      case 'schedule_appointment':
        return 'Only patients can schedule appointments.';
      case 'manage_service':
        return 'Only professionals and institutions can manage services.';
      case 'view_analytics':
        return 'Access restricted to professionals and institutions.';
      case 'manage_appointments':
        return 'Only professionals can manage appointments.';
      case 'access_admin':
        return 'Access restricted to administrators.';
      default:
        return 'You do not have permission for this action.';
    }
  }
}

/**
 * Hook to check user permissions
 */
export function usePermissions(user: UserProfile | null) {
  return {
    canAccessAdmin: PermissionsManager.canAccessAdmin(user),
    canManageServices: PermissionsManager.canManageServices(user),
    canViewAnalytics: PermissionsManager.canViewAnalytics(user),
    canSaveFavorites: PermissionsManager.canSaveFavorites(user),
    canWriteReviews: PermissionsManager.canWriteReviews(user),
    canManageAppointments: PermissionsManager.canManageAppointments(user),
    canContactProfessionals: PermissionsManager.canContactProfessionals(user),
    canScheduleAppointments: PermissionsManager.canScheduleAppointments(user),
    getAllowedScreens: () => PermissionsManager.getAllowedScreens(user),
    getDashboardFeatures: () => PermissionsManager.getDashboardFeatures(user),
    isActionAllowed: (action: string) => PermissionsManager.isActionAllowed(user, action),
    getPermissionDeniedMessage: (action: string) => PermissionsManager.getPermissionDeniedMessage(action)
  };
}
