import * as admin from 'firebase-admin';

export class Validators {
  
  /**
   * Verifica se usuário é admin
   */
  static async isAdmin(uid: string): Promise<boolean> {
    try {
      const userRecord = await admin.auth().getUser(uid);
      return userRecord.customClaims?.admin === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica se usuário tem role específico
   */
  static async hasRole(uid: string, role: string): Promise<boolean> {
    try {
      const userRecord = await admin.auth().getUser(uid);
      return userRecord.customClaims?.role === role;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica se é super admin
   */
  static async isSuperAdmin(uid: string): Promise<boolean> {
    return this.hasRole(uid, 'super_admin');
  }

  /**
   * Valida email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida telefone angolano
   */
  static isValidAngolanPhone(phone: string): boolean {
    const phoneRegex = /^\+244\s?9[0-9]{2}\s?[0-9]{3}\s?[0-9]{3}$/;
    return phoneRegex.test(phone);
  }
}
