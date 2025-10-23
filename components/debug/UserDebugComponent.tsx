import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { spacing } from '../../constants/dimensions';
import { 
  AnyUser, 
  isNormalUser, 
  isProfessional, 
  isInstitution,
  NormalUser,
  Professional,
  Institution
} from '../../types';

interface UserDebugComponentProps {
  user: AnyUser;
}

export const UserDebugComponent: React.FC<UserDebugComponentProps> = ({ user }) => {
  const renderObject = (obj: any, title: string) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.debugText}>{JSON.stringify(obj, null, 2)}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 DEBUG - Dados do Usuário</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Básicas</Text>
        <Text style={styles.debugText}>ID: {user.id}</Text>
        <Text style={styles.debugText}>Email: {(user as any).email || 'N/A'}</Text>
        <Text style={styles.debugText}>Nome: {(user as any).name || 'N/A'}</Text>
        <Text style={styles.debugText}>Telefone: {(user as any).phone || 'N/A'}</Text>
        <Text style={styles.debugText}>Tipo: {user.userType}</Text>
        <Text style={styles.debugText}>Ativo: {String((user as any).isActive)}</Text>
        <Text style={styles.debugText}>Verificado: {String((user as any).isVerified)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Verificações de Tipo</Text>
        <Text style={styles.debugText}>isNormalUser: {String(isNormalUser(user))}</Text>
        <Text style={styles.debugText}>isProfessional: {String(isProfessional(user))}</Text>
        <Text style={styles.debugText}>isInstitution: {String(isInstitution(user))}</Text>
      </View>

      {isNormalUser(user) && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados de Usuário Normal</Text>
            <Text style={styles.debugText}>Data nascimento: {(user as NormalUser).dateOfBirth || 'N/A'}</Text>
            <Text style={styles.debugText}>Gênero: {(user as NormalUser).gender || 'N/A'}</Text>
            <Text style={styles.debugText}>Endereço: {(user as NormalUser).address || 'N/A'}</Text>
            <Text style={styles.debugText}>Tem contato emergência: {String(!!(user as NormalUser).emergencyContact)}</Text>
          </View>
          
          {(user as NormalUser).emergencyContact && (
            renderObject((user as NormalUser).emergencyContact, 'Contato de Emergência')
          )}
        </>
      )}

      {isProfessional(user) && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados de Profissional</Text>
            <Text style={styles.debugText}>Tem professionalInfo: {String(!!(user as Professional).professionalInfo)}</Text>
          </View>
          
          {(user as Professional).professionalInfo && (
            renderObject((user as Professional).professionalInfo, 'Informações Profissionais')
          )}
        </>
      )}

      {isInstitution(user) && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados de Instituição</Text>
            <Text style={styles.debugText}>Tem institutionInfo: {String(!!(user as Institution).institutionInfo)}</Text>
          </View>
          
          {(user as Institution).institutionInfo && (
            renderObject((user as Institution).institutionInfo, 'Informações da Instituição')
          )}
        </>
      )}

      {(user as any).preferences && (
        renderObject((user as any).preferences, 'Preferências')
      )}

      {renderObject(user, 'Objeto Completo do Usuário')}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  section: {
    backgroundColor: Colors.surface,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: spacing.xs,
  },
  debugText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontFamily: 'monospace',
    marginBottom: spacing.xs,
  },
});