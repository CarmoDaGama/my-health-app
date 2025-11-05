import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { EmailVerificationScreenNavigationProp } from '../types/navigation';
import { useAuth } from '../hooks/useAuth-firebase';
import { useTranslation } from '../hooks/useTranslation';
import { Colors } from '../constants/colors';
import { spacing } from '../constants/dimensions';
import { Button } from '../components';

interface EmailVerificationRouteParams {
  email?: string;
}

export default function EmailVerificationScreen() {
  const navigation = useNavigation<EmailVerificationScreenNavigationProp>();
  const route = useRoute();
  const { resendEmailVerification, checkEmailVerification, logout } = useAuth();
  const { t } = useTranslation();
  
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [cooldownTimer, setCooldownTimer] = useState(0);
  
  const params = route.params as EmailVerificationRouteParams;
  const email = params?.email || '';

  // Cooldown timer for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldownTimer > 0) {
      timer = setTimeout(() => setCooldownTimer(cooldownTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldownTimer]);

  const handleResendEmail = async () => {
    if (cooldownTimer > 0 || isResending) return;
    
    setIsResending(true);
    
    try {
      const result = await resendEmailVerification();
      
      if (result.success) {
        Alert.alert(
          t('auth.emailSent'),
          t('auth.verificationEmailResent'),
          [{ text: t('common.ok') }]
        );
        setCooldownTimer(60); // 60 seconds cooldown
      } else {
        Alert.alert(
          t('auth.error'),
          result.error || t('auth.resendEmailError'),
          [{ text: t('common.ok') }]
        );
      }
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
      Alert.alert(
        t('auth.error'),
        t('auth.resendEmailError'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = async () => {
    try {
      await logout();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erro no logout:', error);
      navigation.navigate('Login');
    }
  };

  const handleCheckEmailApp = () => {
    // This would ideally open the user's email app
    // For now, we just show an instruction
    Alert.alert(
      t('auth.checkEmail'),
      t('auth.openEmailAppInstruction'),
      [{ text: t('common.ok') }]
    );
  };

  const handleCheckVerification = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    
    try {
      const result = await checkEmailVerification();
      
      if (result.success && result.isVerified) {
        Alert.alert(
          t('common.success'),
          'Email verificado com sucesso! Você será redirecionado.',
          [{ 
            text: t('common.ok'), 
            onPress: () => navigation.navigate('Home')
          }]
        );
      } else {
        Alert.alert(
          t('auth.emailNotVerified') || 'Email não verificado',
          'Seu email ainda não foi verificado. Por favor, verifique sua caixa de entrada e clique no link de verificação.',
          [{ text: t('common.ok') }]
        );
      }
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      Alert.alert(
        t('auth.error'),
        'Erro ao verificar status do email',
        [{ text: t('common.ok') }]
      );
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Email verification icon */}
        <View style={styles.iconContainer}>
          <View style={styles.emailIcon}>
            <Text style={styles.emailIconText}>📧</Text>
          </View>
        </View>

        <Text style={styles.title}>{t('auth.verifyYourEmail')}</Text>
        
        <Text style={styles.description}>
          {t('auth.verificationEmailSent')} {email}
        </Text>
        
        <Text style={styles.instruction}>
          {t('auth.clickLinkInEmail')}
        </Text>

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title={t('auth.checkEmailApp')}
            onPress={handleCheckEmailApp}
          />

          <Button
            title={isChecking ? t('common.loading') : 'Já Verifiquei'}
            onPress={handleCheckVerification}
            disabled={isChecking}
            loading={isChecking}
            variant="outline"
          />

          <TouchableOpacity
            style={[
              styles.resendButton,
              (cooldownTimer > 0 || isResending) && styles.disabledButton
            ]}
            onPress={handleResendEmail}
            disabled={cooldownTimer > 0 || isResending}
          >
            {isResending ? (
              <ActivityIndicator color={Colors.primary} size="small" />
            ) : (
              <Text style={[
                styles.resendButtonText,
                (cooldownTimer > 0) && styles.disabledButtonText
              ]}>
                {cooldownTimer > 0 
                  ? `${t('auth.resendEmail')} (${cooldownTimer}s)`
                  : t('auth.resendEmail')
                }
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Help text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            {t('auth.didntReceiveEmail')}
          </Text>
          
          <Text style={styles.helpInstruction}>
            • {t('auth.checkSpamFolder')}{'\n'}
            • {t('auth.checkEmailAddress')}{'\n'}
            • {t('auth.waitFewMinutes')}
          </Text>
        </View>

        {/* Back to login */}
        <TouchableOpacity
          style={styles.backToLoginButton}
          onPress={handleBackToLogin}
        >
          <Text style={styles.backToLoginText}>
            ← {t('auth.backToLogin')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  emailIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailIconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.md,
    color: '#1F2937',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.md,
    color: '#6B7280',
    lineHeight: 24,
  },
  instruction: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  resendButton: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  disabledButton: {
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  resendButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
  helpContainer: {
    width: '100%',
    padding: spacing.lg,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: spacing.xl,
  },
  helpText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.sm,
    color: '#374151',
  },
  helpInstruction: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  backToLoginButton: {
    padding: spacing.md,
  },
  backToLoginText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
});