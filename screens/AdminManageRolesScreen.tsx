/**
 * Tela de Gerenciamento de Roles
 * 
 * Permite que super admins:
 * - Listar administradores
 * - Adicionar novos admins
 * - Remover admins
 * - Ver permissões
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import {
  listAdmins,
  setAdminRole,
  removeAdminRole,
  isCurrentUserSuperAdmin,
  getCurrentUserRole,
  type AdminInfo,
} from '../services/roles-client';
import LoadingSpinner from '../components/common/LoadingSpinner';

type NavigationProp = StackNavigationProp<any>;

type Admin = AdminInfo;

export default function AdminManageRolesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'moderator'>('admin');
  const [processing, setProcessing] = useState(false);

  // Recarregar dados sempre que a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      loadAdmins();
    }, [])
  );

  useEffect(() => {
    checkPermissionsAndLoad();
  }, []);

  const checkPermissionsAndLoad = async () => {
    try {
      const superAdminStatus = await isCurrentUserSuperAdmin();
      setIsSuperAdmin(superAdminStatus);
      
      const role = await getCurrentUserRole();
      setCurrentUserRole(role);

      if (!superAdminStatus && role !== 'admin') {
        Alert.alert(
          'Acesso Negado',
          'Você não tem permissão para acessar esta área. Apenas Super Admins e Admins podem gerenciar roles.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      await loadAdmins();
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      const result = await listAdmins();
      if (result.success && result.admins) {
        setAdmins(result.admins);
      } else {
        Alert.alert('Erro', result.error || 'Erro ao carregar administradores');
      }
    } catch (error) {
      console.error('Erro ao carregar admins:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdmins();
    setRefreshing(false);
  };

  const handleAddAdmin = () => {
    if (!isSuperAdmin) {
      Alert.alert(
        'Permissão Negada',
        'Apenas Super Admins podem adicionar novos administradores.'
      );
      return;
    }
    setNewAdminEmail('');
    setNewAdminRole('admin');
    setShowAddModal(true);
  };

  const confirmAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      Alert.alert('Atenção', 'Por favor, informe o email do usuário.');
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdminEmail)) {
      Alert.alert('Atenção', 'Por favor, informe um email válido.');
      return;
    }

    setProcessing(true);
    try {
      const result = await setAdminRole(newAdminEmail, newAdminRole);

      if (result.success) {
        Alert.alert(
          'Sucesso!',
          `${newAdminEmail} foi adicionado como ${newAdminRole === 'admin' ? 'Admin' : 'Moderador'}.`,
          [{ text: 'OK' }]
        );
        setShowAddModal(false);
        setNewAdminEmail('');
        await loadAdmins();
      } else {
        Alert.alert('Erro', result.error || 'Erro ao adicionar administrador');
      }
    } catch (error) {
      console.error('Erro ao adicionar admin:', error);
      Alert.alert('Erro', 'Erro ao processar solicitação');
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveAdmin = (admin: Admin) => {
    if (!isSuperAdmin) {
      Alert.alert(
        'Permissão Negada',
        'Apenas Super Admins podem remover administradores.'
      );
      return;
    }

    if (admin.role === 'super_admin') {
      Alert.alert(
        'Ação Não Permitida',
        'Super Admins não podem ser removidos por esta interface.'
      );
      return;
    }

    Alert.alert(
      'Confirmar Remoção',
      `Tem certeza que deseja remover ${admin.email} como ${admin.role === 'admin' ? 'Admin' : 'Moderador'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => confirmRemoveAdmin(admin),
        },
      ]
    );
  };

  const confirmRemoveAdmin = async (admin: Admin) => {
    setProcessing(true);
    try {
      const result = await removeAdminRole(admin.email);

      if (result.success) {
        Alert.alert(
          'Removido',
          `${admin.email} foi removido como administrador.`,
          [{ text: 'OK' }]
        );
        await loadAdmins();
      } else {
        Alert.alert('Erro', result.error || 'Erro ao remover administrador');
      }
    } catch (error) {
      console.error('Erro ao remover admin:', error);
      Alert.alert('Erro', 'Erro ao processar solicitação');
    } finally {
      setProcessing(false);
    }
  };

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'moderator':
        return 'Moderador';
      case 'analytics_viewer':
        return 'Visualizador';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'super_admin':
        return Colors.error;
      case 'admin':
        return Colors.primary;
      case 'moderator':
        return Colors.info;
      case 'analytics_viewer':
        return Colors.warning;
      default:
        return Colors.textSecondary;
    }
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'Data não disponível';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const renderAdminCard = ({ item }: { item: Admin }) => (
    <View style={styles.adminCard}>
      {/* Cabeçalho do Card */}
      <View style={styles.cardHeader}>
        <View style={[styles.roleIcon, { backgroundColor: `${getRoleColor(item.role)}15` }]}>
          <Ionicons 
            name={item.role === 'super_admin' ? 'shield-checkmark' : item.role === 'admin' ? 'person' : 'people'} 
            size={24} 
            color={getRoleColor(item.role)} 
          />
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.adminEmail}>{item.email}</Text>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
          <Text style={styles.roleBadgeText}>{getRoleLabel(item.role)}</Text>
        </View>
      </View>

      {/* Informações */}
      <View style={styles.adminInfo}>
        <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
        <Text style={styles.adminInfoText}>
          Adicionado em: {formatDate(item.createdAt)}
        </Text>
      </View>

      {item.assignedBy && (
        <View style={styles.adminInfo}>
          <Ionicons name="person-add-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.adminInfoText}>
            Por: {item.assignedBy}
          </Text>
        </View>
      )}

      {/* Ações */}
      {isSuperAdmin && item.role !== 'super_admin' && (
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => handleRemoveAdmin(item)}
        >
          <Ionicons name="trash-outline" size={16} color={Colors.error} />
          <Text style={styles.removeBtnText}>Remover</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isSuperAdmin && currentUserRole !== 'admin') {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="lock-closed" size={64} color={Colors.error} />
        <Text style={styles.errorText}>Acesso Negado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Gerenciar Roles</Text>
            <Text style={styles.headerSubtitle}>
              {admins.length} {admins.length === 1 ? 'administrador' : 'administradores'}
            </Text>
          </View>
          {isSuperAdmin && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddAdmin}
            >
              <Ionicons name="add-circle" size={32} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Legenda de Roles */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
            <Text style={styles.legendText}>Super Admin</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.legendText}>Admin</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.info }]} />
            <Text style={styles.legendText}>Moderador</Text>
          </View>
        </View>
      </View>

      {/* Lista de Admins */}
      <FlatList
        data={admins}
        renderItem={renderAdminCard}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>Nenhum administrador</Text>
          </View>
        }
      />

      {/* Modal de Adicionar Admin */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Administrador</Text>

            <Text style={styles.inputLabel}>Email do usuário *:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="exemplo@email.com"
              placeholderTextColor={Colors.textSecondary}
              value={newAdminEmail}
              onChangeText={setNewAdminEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.inputLabel}>Tipo de Role:</Text>
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  newAdminRole === 'admin' && styles.roleOptionSelected,
                ]}
                onPress={() => setNewAdminRole('admin')}
              >
                <Ionicons 
                  name="person" 
                  size={24} 
                  color={newAdminRole === 'admin' ? '#fff' : Colors.primary} 
                />
                <Text
                  style={[
                    styles.roleOptionText,
                    newAdminRole === 'admin' && styles.roleOptionTextSelected,
                  ]}
                >
                  Admin
                </Text>
                <Text
                  style={[
                    styles.roleOptionDesc,
                    newAdminRole === 'admin' && styles.roleOptionDescSelected,
                  ]}
                >
                  Pode aprovar e gerenciar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleOption,
                  newAdminRole === 'moderator' && styles.roleOptionSelected,
                ]}
                onPress={() => setNewAdminRole('moderator')}
              >
                <Ionicons 
                  name="people" 
                  size={24} 
                  color={newAdminRole === 'moderator' ? '#fff' : Colors.info} 
                />
                <Text
                  style={[
                    styles.roleOptionText,
                    newAdminRole === 'moderator' && styles.roleOptionTextSelected,
                  ]}
                >
                  Moderador
                </Text>
                <Text
                  style={[
                    styles.roleOptionDesc,
                    newAdminRole === 'moderator' && styles.roleOptionDescSelected,
                  ]}
                >
                  Pode ver e moderar
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setShowAddModal(false)}
                disabled={processing}
              >
                <Text style={styles.modalCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirmBtn]}
                onPress={confirmAddAdmin}
                disabled={processing}
              >
                {processing ? (
                  <LoadingSpinner size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>Adicionar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Info Card */}
      {!isSuperAdmin && (
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={Colors.info} />
          <Text style={styles.infoText}>
            Você pode visualizar os administradores, mas apenas Super Admins podem adicionar ou remover.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  addButton: {
    padding: 4,
  },
  legendContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  listContainer: {
    padding: 16,
  },
  adminCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  adminEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  adminName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  adminInfoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 6,
  },
  removeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.error,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 16,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  roleOption: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  roleOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 6,
  },
  roleOptionTextSelected: {
    color: '#fff',
  },
  roleOptionDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  roleOptionDescSelected: {
    color: '#fff',
    opacity: 0.9,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelBtn: {
    backgroundColor: Colors.border,
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  modalConfirmBtn: {
    backgroundColor: Colors.primary,
  },
  modalConfirmBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: `${Colors.info}15`,
    padding: 12,
    margin: 16,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.text,
    lineHeight: 18,
  },
});
