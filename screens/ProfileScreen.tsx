import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ProfileScreenNavigationProp } from '../types/navigation';
import { useAuth, useUser } from '../hooks/useAuth-firebase';
import { useTranslation, useLocalization } from '../hooks/useTranslation';
import { usePreferences } from '../hooks/usePreferences';
import { UserAvatar, LanguageSelector } from '../components';
import { Colors } from '../constants/colors';
import { spacing } from '../constants/dimensions';
import { UserType, isProfessional, isInstitution, NormalUser } from '../types';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { isAuthenticated, logout } = useAuth();
  const { user } = useUser();
  const { t } = useTranslation();
  const { formatDate } = useLocalization();
  const { setLanguage } = usePreferences();

  // Debug: Log user data
  React.useEffect(() => {
    if (user) {
      console.log('👤 ProfileScreen - Dados do usuário:', {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        ...(user.userType === UserType.NORMAL_USER && {
          dateOfBirth: (user as NormalUser).dateOfBirth,
          gender: (user as NormalUser).gender,
          address: (user as NormalUser).address,
          emergencyContact: (user as NormalUser).emergencyContact
        })
      });
    } else {
      console.log('👤 ProfileScreen - Usuário não autenticado ou dados não carregados');
    }
  }, [user]);

  const handleEditProfile = () => {
    if (isAuthenticated && user) {
      navigation.navigate('EditProfile');
    } else {
      navigation.navigate('Login');
    }
  };

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  const handleLanguageChange = () => {
    if (!user) return;
    
    const currentLanguage = user.preferences.language || 'en';
    const newLanguage = currentLanguage === 'pt' ? 'en' : 'pt';
    const newLanguageName = newLanguage === 'pt' ? 'Português' : 'English';
    
    Alert.alert(
      t('profile.changeLanguage') || 'Change Language',
      `${t('profile.changeLanguageConfirmation') || 'Change language to'} ${newLanguageName}?`,
      [
        {
          text: t('common.cancel') || 'Cancel',
          style: 'cancel',
        },
        {
          text: t('common.confirm') || 'Confirm',
          onPress: async () => {
            try {
              await setLanguage(newLanguage);
            } catch (error) {
              Alert.alert(
                t('errors.title') || 'Error',
                t('errors.updatePreferences') || 'Could not update language preferences'
              );
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout') || 'Sair',
      t('profile.logoutConfirmation') || 'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: t('common.cancel') || 'Cancelar',
          style: 'cancel',
        },
        {
          text: t('profile.logout') || 'Sair',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  if (!isAuthenticated || !user) {
    // Guest user view
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.guestHeader}>
          <View style={styles.guestAvatarContainer}>
            <Text style={styles.guestAvatarText}>?</Text>
          </View>
          <Text style={styles.guestTitle}>
            {t('profile.guestUser') || 'Usuário Convidado'}
          </Text>
          <Text style={styles.guestSubtitle}>
            {t('profile.guestMessage') || 'Faça login para acessar seus dados pessoais e preferências'}
          </Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
            <Text style={styles.loginButtonText}>
              {t('auth.login') || 'Fazer Login'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>
              {t('auth.register') || 'Criar Conta'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('profile.appInfo') || 'Sobre o App'}
          </Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              {t('profile.version') || 'Versão'}
            </Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              {t('profile.developer') || 'Desenvolvedor'}
            </Text>
            <Text style={styles.infoValue}>{t('company.developer')}</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Authenticated user view
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <UserAvatar 
          name={user.name} 
          avatar={user.avatar} 
          size="large" 
          style={styles.avatar}
        />
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('profile.account') || 'Conta'}
        </Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
          <Text style={styles.menuItemText}>
            {t('profile.editProfile') || 'Editar Perfil'}
          </Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>
        
        {/* Language Selection Section */}
        <View style={styles.languageSection}>
          <LanguageSelector 
            isGuest={false}
            onLanguageChange={(language) => {
              // This will automatically save via the LanguageSelector component
              console.log('Language changed to:', language);
            }}
          />
        </View>
        
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>
            {t('profile.notifications') || 'Notificações'}
          </Text>
          <Text style={styles.menuItemValue}>
            {user.preferences.notifications.enabled ? 
              t('common.enabled') || 'Ativado' : 
              t('common.disabled') || 'Desativado'
            }
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('profile.favorites') || 'Favoritos'}
        </Text>
        
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>
            {t('profile.favoriteServices') || 'Serviços Favoritos'}
          </Text>
          <Text style={styles.menuItemValue}>
            {user.preferences.favorites.services.length}
          </Text>
        </View>
        
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>
            {t('profile.favoriteLocations') || 'Locais Favoritos'}
          </Text>
          <Text style={styles.menuItemValue}>
            {user.preferences.favorites.locations.length}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('profile.userDetails') || 'Detalhes do Usuário'}
        </Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>
            {t('profile.userType') || 'Tipo de Usuário'}
          </Text>
          <Text style={styles.infoValue}>
            {user.userType === UserType.NORMAL_USER ? (t('userTypes.normalUser') || 'Usuário Normal') :
             user.userType === UserType.PROFESSIONAL ? (t('userTypes.professional') || 'Profissional') :
             user.userType === UserType.INSTITUTION ? (t('userTypes.institution') || 'Instituição') :
             (user as any).userType || (t('common.unknown') || 'Desconhecido')}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>
            {t('profile.phone') || 'Telefone'}
          </Text>
          <Text style={styles.infoValue}>
            {user.phone || (t('common.notProvided') || 'Não informado')}
          </Text>
        </View>
        
        {/* <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>
            {t('profile.memberSince') || 'Membro desde'}
          </Text>
          <Text style={styles.infoValue}>
            {user.createdAt ? formatDate(new Date(user.createdAt)) : (t('common.notAvailable') || 'Não disponível')}
          </Text>
        </View> */}
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>
            {t('profile.accountStatus') || 'Status da Conta'}
          </Text>
          <Text style={[styles.infoValue, { color: user.isActive ? Colors.success : Colors.error }]}>
            {user.isActive ? (t('status.active') || 'Ativa') : (t('status.inactive') || 'Inativa')}
          </Text>
        </View>
        
        {(isProfessional(user) || isInstitution(user)) && (user as any).isVerified !== undefined && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              {t('profile.verification') || 'Verificação'}
            </Text>
            <Text style={[styles.infoValue, { color: (user as any).isVerified ? Colors.success : Colors.warning }]}>
              {(user as any).isVerified ? (t('status.verified') || 'Verificado') : (t('status.pending') || 'Pendente')}
            </Text>
          </View>
        )}
      </View>

      {/* Card com informações específicas do tipo de usuário - Apenas para Profissional e Instituição */}
      {user && (
        (isProfessional(user) && (user as any).professionalInfo) ||
        (isInstitution(user) && (user as any).institutionInfo)
      ) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isProfessional(user) ? (t('profile.professionalInfo') || 'Informações Profissionais') :
             (t('profile.institutionInfo') || 'Informações da Instituição')}
          </Text>
          
          {/* Informações específicas para profissional */}
          {isProfessional(user) && (user as any).professionalInfo && (
            <>
              {(user as any).professionalInfo.specialty && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    {t('profile.specialty') || 'Especialidade'}
                  </Text>
                  <Text style={styles.infoValue}>
                    {(user as any).professionalInfo.specialty}
                  </Text>
                </View>
              )}
              
              {(user as any).professionalInfo.license && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    {t('profile.license') || 'Licença'}
                  </Text>
                  <Text style={styles.infoValue}>
                    {(user as any).professionalInfo.license}
                  </Text>
                </View>
              )}
              
              {(user as any).professionalInfo.experience && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    {t('profile.experience') || 'Experiência'}
                  </Text>
                  <Text style={styles.infoValue}>
                    {(user as any).professionalInfo.experience} {t('time.years') || 'anos'}
                  </Text>
                </View>
              )}
              
              {(user as any).professionalInfo.bio && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    {t('profile.bio') || 'Biografia'}
                  </Text>
                  <Text style={[styles.infoValue, styles.multilineText]}>
                    {(user as any).professionalInfo.bio}
                  </Text>
                </View>
              )}
            </>
          )}
          
          {/* Informações específicas para instituição */}
          {isInstitution(user) && (user as any).institutionInfo && (
            <>
              {(user as any).institutionInfo.type && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    {t('profile.institutionType') || 'Tipo de Instituição'}
                  </Text>
                  <Text style={styles.infoValue}>
                    {(user as any).institutionInfo.type === 'hospital' ? (t('institutionTypes.hospital') || 'Hospital') :
                     (user as any).institutionInfo.type === 'clinic' ? (t('institutionTypes.clinic') || 'Clínica') :
                     (user as any).institutionInfo.type === 'laboratory' ? (t('institutionTypes.laboratory') || 'Laboratório') :
                     (user as any).institutionInfo.type === 'pharmacy' ? (t('institutionTypes.pharmacy') || 'Farmácia') :
                     (t('common.other') || 'Outro')}
                  </Text>
                </View>
              )}
              
              {(user as any).institutionInfo.address && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    {t('profile.institutionAddress') || 'Endereço da Instituição'}
                  </Text>
                  <Text style={[styles.infoValue, styles.multilineText]}>
                    {typeof (user as any).institutionInfo.address === 'string' 
                      ? (user as any).institutionInfo.address 
                      : `${(user as any).institutionInfo.address.street}, ${(user as any).institutionInfo.address.city}`}
                  </Text>
                </View>
              )}
              
              {(user as any).institutionInfo.services && (user as any).institutionInfo.services.length > 0 && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    {t('profile.services') || 'Serviços'}
                  </Text>
                  <Text style={[styles.infoValue, styles.multilineText]}>
                    {(user as any).institutionInfo.services.join(', ')}
                  </Text>
                </View>
              )}
              
              {(user as any).institutionInfo.description && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    {t('profile.description') || 'Descrição'}
                  </Text>
                  <Text style={[styles.infoValue, styles.multilineText]}>
                    {(user as any).institutionInfo.description}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>
            {t('profile.logout') || 'Sair da Conta'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  
  // Guest user styles
  guestHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  guestAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  guestAvatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.surface,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  
  // Authenticated user styles
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  
  // Section styles
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.md,
  },
  languageSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  
  // Menu items
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: spacing.sm,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  menuItemValue: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  menuItemArrow: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  
  // Info items
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    width: '35%',
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    width: '65%',
    textAlign: 'right',
  },
  multilineText: {
    textAlign: 'right',
    lineHeight: 20,
  },
  
  // Buttons
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },
  registerButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  
  // Actions
  actions: {
    marginTop: spacing.lg,
  },
  logoutButton: {
    backgroundColor: Colors.error,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },
});