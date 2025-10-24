import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { spacing } from '../../constants/dimensions';
import { User, isNormalUser, isProfessional, isInstitution } from '../../types';

interface ProfileDebugProps {
  user: User;
}

export const ProfileDebug: React.FC<ProfileDebugProps> = ({ user }) => {
  const renderUserData = () => {
    return (
      <View>
        <Text style={styles.title}>Dados do Usuário</Text>
        <Text style={styles.item}>ID: {user.id}</Text>
        <Text style={styles.item}>Email: {user.email}</Text>
        <Text style={styles.item}>Nome: {user.name || 'N/A'}</Text>
        <Text style={styles.item}>Telefone: {user.phone || 'N/A'}</Text>
        <Text style={styles.item}>Tipo: {user.userType}</Text>
        <Text style={styles.item}>Ativo: {user.isActive ? 'Sim' : 'Não'}</Text>
        <Text style={styles.item}>Verificado: {user.isVerified ? 'Sim' : 'Não'}</Text>
        
        <Text style={styles.subtitle}>Verificações de Tipo:</Text>
        <Text style={styles.item}>isNormalUser: {isNormalUser(user) ? 'Sim' : 'Não'}</Text>
        <Text style={styles.item}>isProfessional: {isProfessional(user) ? 'Sim' : 'Não'}</Text>
        <Text style={styles.item}>isInstitution: {isInstitution(user) ? 'Sim' : 'Não'}</Text>
        
        {isNormalUser(user) && (
          <View style={styles.typeSection}>
            <Text style={styles.subtitle}>Dados de Usuário Normal:</Text>
            <Text style={styles.item}>Data Nascimento: {user.dateOfBirth || 'N/A'}</Text>
            <Text style={styles.item}>Gênero: {user.gender || 'N/A'}</Text>
            <Text style={styles.item}>Endereço: {user.address || 'N/A'}</Text>
            <Text style={styles.item}>Contato Emergência: {user.emergencyContact ? 'Configurado' : 'N/A'}</Text>
            {user.emergencyContact && (
              <View style={styles.subItem}>
                <Text style={styles.item}>  Nome: {user.emergencyContact.name}</Text>
                <Text style={styles.item}>  Telefone: {user.emergencyContact.phone}</Text>
                <Text style={styles.item}>  Relacionamento: {user.emergencyContact.relationship}</Text>
              </View>
            )}
          </View>
        )}
        
        {isProfessional(user) && (
          <View style={styles.typeSection}>
            <Text style={styles.subtitle}>Dados Profissionais:</Text>
            <Text style={styles.item}>Especialidade: {user.professionalInfo?.specialty || 'N/A'}</Text>
            <Text style={styles.item}>Licença: {user.professionalInfo?.license || 'N/A'}</Text>
            <Text style={styles.item}>Experiência: {user.professionalInfo?.experience || 0} anos</Text>
            <Text style={styles.item}>Bio: {user.professionalInfo?.bio ? 'Configurada' : 'N/A'}</Text>
            <Text style={styles.item}>Taxa Consulta: {user.professionalInfo?.consultationFee || 'N/A'}</Text>
            <Text style={styles.item}>Aceita Seguro: {user.professionalInfo?.acceptsInsurance ? 'Sim' : 'Não'}</Text>
          </View>
        )}
        
        {isInstitution(user) && (
          <View style={styles.typeSection}>
            <Text style={styles.subtitle}>Dados da Instituição:</Text>
            <Text style={styles.item}>Tipo: {user.institutionInfo?.type || 'N/A'}</Text>
            <Text style={styles.item}>Descrição: {user.institutionInfo?.description ? 'Configurada' : 'N/A'}</Text>
            <Text style={styles.item}>Serviços: {user.institutionInfo?.services?.length || 0}</Text>
            <Text style={styles.item}>Aceita Seguro: {user.institutionInfo?.acceptsInsurance ? 'Sim' : 'Não'}</Text>
            <Text style={styles.item}>Emergência: {user.institutionInfo?.emergencyService ? 'Sim' : 'Não'}</Text>
            {user.institutionInfo?.address && (
              <View style={styles.subItem}>
                <Text style={styles.item}>Endereço:</Text>
                <Text style={styles.item}>  Rua: {user.institutionInfo.address.street || 'N/A'}</Text>
                <Text style={styles.item}>  Cidade: {user.institutionInfo.address.city || 'N/A'}</Text>
                <Text style={styles.item}>  Estado: {user.institutionInfo.address.state || 'N/A'}</Text>
                <Text style={styles.item}>  CEP: {user.institutionInfo.address.zipCode || 'N/A'}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {renderUserData()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  item: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: spacing.xs,
  },
  typeSection: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: 8,
  },
  subItem: {
    marginLeft: spacing.sm,
    marginTop: spacing.xs,
  },
});
