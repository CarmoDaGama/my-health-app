import React, { useState } from 'react';
import { View, StyleSheet, Text, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { ProfileScreenNavigationProp } from '../types/navigation';
import { Colors, spacing } from '../constants';

interface Props {
  navigation: ProfileScreenNavigationProp;
}

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = () => {
    // Implementation for saving profile
    console.log('Saving profile...');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/100' }}
              style={styles.avatar}
            />
            <View style={styles.editIconContainer}>
              <Text style={styles.editIcon}>✓</Text>
            </View>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Digite seu nome"
              placeholderTextColor={Colors.text.secondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="exemplo@email.com"
              placeholderTextColor={Colors.text.secondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Digite sua senha"
              placeholderTextColor={Colors.text.secondary}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirme sua senha"
              placeholderTextColor={Colors.text.secondary}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contrato</Text>
            <View style={styles.contractContainer}>
              <Text style={styles.contractText}>
                Li e aceito os termos de uso e política de privacidade
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  editIcon: {
    color: Colors.text.onPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    backgroundColor: Colors.surface,
    color: Colors.text.primary,
  },
  contractContainer: {
    padding: spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contractText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveButtonText: {
    color: Colors.text.onPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
