/**
 * Tela de Serviços Pendentes
 * 
 * Lista de profissionais aguardando aprovação com ações para:
 * - Visualizar detalhes do serviço
 * - Aprovar profissional
 * - Rejeitar profissional
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
  listPendingServices,
  approveProfessional,
  rejectProfessional,
  getServiceDetails,
} from '../services/approval-client';
import { isCurrentUserAdmin } from '../services/roles-client';
import LoadingSpinner from '../components/common/LoadingSpinner';

type NavigationProp = StackNavigationProp<any>;

interface PendingService {
  id: string;
  name: string;
  serviceType: string;
  specialty: string;
  description: string;
  address: string;
  city: string;
  province: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: any;
  status: string;
  professionalInfo?: {
    email?: string;
    displayName?: string;
    phoneNumber?: string;
  };
}

export default function AdminPendingServicesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState<PendingService[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedService, setSelectedService] = useState<PendingService | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Recarregar dados sempre que a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      loadServices();
    }, [])
  );

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const adminStatus = await isCurrentUserAdmin();
      setIsAdmin(adminStatus);
      
      if (!adminStatus) {
        Alert.alert(
          'Acesso Negado',
          'Você não tem permissão para acessar esta área.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      await loadServices();
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const result = await listPendingServices('pending', 100);
      if (result.success && result.services) {
        setServices(result.services);
      } else {
        Alert.alert('Erro', result.error || 'Erro ao carregar serviços');
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  const handleApprove = (service: PendingService) => {
    setSelectedService(service);
    setApprovalNotes('');
    setShowApprovalModal(true);
  };

  const confirmApproval = async () => {
    if (!selectedService) return;

    setProcessing(true);
    try {
      const result = await approveProfessional(
        selectedService.id,
        approvalNotes || undefined
      );

      if (result.success) {
        Alert.alert(
          'Sucesso!',
          `${selectedService.name} foi aprovado com sucesso.`,
          [{ text: 'OK' }]
        );
        setShowApprovalModal(false);
        setSelectedService(null);
        setApprovalNotes('');
        await loadServices();
      } else {
        Alert.alert('Erro', result.error || 'Erro ao aprovar profissional');
      }
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      Alert.alert('Erro', 'Erro ao processar aprovação');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = (service: PendingService) => {
    setSelectedService(service);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const confirmRejection = async () => {
    if (!selectedService) return;

    if (!rejectionReason.trim()) {
      Alert.alert('Atenção', 'Por favor, informe o motivo da rejeição.');
      return;
    }

    setProcessing(true);
    try {
      const result = await rejectProfessional(selectedService.id, rejectionReason);

      if (result.success) {
        Alert.alert(
          'Rejeitado',
          `${selectedService.name} foi rejeitado.`,
          [{ text: 'OK' }]
        );
        setShowRejectModal(false);
        setSelectedService(null);
        setRejectionReason('');
        await loadServices();
      } else {
        Alert.alert('Erro', result.error || 'Erro ao rejeitar profissional');
      }
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      Alert.alert('Erro', 'Erro ao processar rejeição');
    } finally {
      setProcessing(false);
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
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const renderServiceCard = ({ item }: { item: PendingService }) => (
    <View style={styles.serviceCard}>
      {/* Cabeçalho do Card */}
      <View style={styles.cardHeader}>
        <View style={styles.serviceIcon}>
          <Ionicons name="business-outline" size={24} color={Colors.primary} />
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.serviceSpecialty}>
            {item.serviceType} - {item.specialty}
          </Text>
        </View>
      </View>

      {/* Informações do Profissional */}
      {item.professionalInfo && (
        <View style={styles.professionalInfo}>
          <Ionicons name="person" size={16} color={Colors.textSecondary} />
          <Text style={styles.professionalText}>
            {item.professionalInfo.displayName || 'Nome não informado'}
          </Text>
        </View>
      )}

      {/* Localização */}
      <View style={styles.serviceInfo}>
        <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
        <Text style={styles.serviceInfoText}>
          {item.city}, {item.province}
        </Text>
      </View>

      {/* Contato */}
      <View style={styles.serviceInfo}>
        <Ionicons name="mail-outline" size={16} color={Colors.textSecondary} />
        <Text style={styles.serviceInfoText}>{item.contactEmail}</Text>
      </View>

      {/* Data de Registro */}
      <View style={styles.serviceInfo}>
        <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
        <Text style={styles.serviceInfoText}>
          Registrado em: {formatDate(item.createdAt)}
        </Text>
      </View>

      {/* Descrição */}
      {item.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      )}

      {/* Ações */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.rejectBtn]}
          onPress={() => handleReject(item)}
        >
          <Ionicons name="close-circle" size={20} color="#fff" />
          <Text style={styles.actionBtnText}>Rejeitar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.approveBtn]}
          onPress={() => handleApprove(item)}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.actionBtnText}>Aprovar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
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
        <Text style={styles.headerTitle}>Serviços Pendentes</Text>
        <Text style={styles.headerSubtitle}>
          {services.length} {services.length === 1 ? 'serviço aguardando' : 'serviços aguardando'} aprovação
        </Text>
      </View>

      {/* Lista de Serviços */}
      <FlatList
        data={services}
        renderItem={renderServiceCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle" size={64} color={Colors.success} />
            <Text style={styles.emptyText}>Nenhum serviço pendente</Text>
            <Text style={styles.emptySubtext}>
              Todos os profissionais foram processados
            </Text>
          </View>
        }
      />

      {/* Modal de Aprovação */}
      <Modal
        visible={showApprovalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowApprovalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Aprovar Profissional</Text>
            <Text style={styles.modalSubtitle}>
              {selectedService?.name}
            </Text>

            <Text style={styles.inputLabel}>Notas (opcional):</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Adicionar observações sobre a aprovação..."
              placeholderTextColor={Colors.textSecondary}
              value={approvalNotes}
              onChangeText={setApprovalNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setShowApprovalModal(false)}
                disabled={processing}
              >
                <Text style={styles.modalCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirmBtn]}
                onPress={confirmApproval}
                disabled={processing}
              >
                {processing ? (
                  <LoadingSpinner size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Rejeição */}
      <Modal
        visible={showRejectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rejeitar Profissional</Text>
            <Text style={styles.modalSubtitle}>
              {selectedService?.name}
            </Text>

            <Text style={styles.inputLabel}>Motivo da rejeição *:</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Informe o motivo da rejeição..."
              placeholderTextColor={Colors.textSecondary}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setShowRejectModal(false)}
                disabled={processing}
              >
                <Text style={styles.modalCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalRejectBtn]}
                onPress={confirmRejection}
                disabled={processing}
              >
                {processing ? (
                  <LoadingSpinner size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalRejectBtnText}>Confirmar Rejeição</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  listContainer: {
    padding: 16,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  serviceSpecialty: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  professionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  professionalText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceInfoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  descriptionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  approveBtn: {
    backgroundColor: Colors.success,
  },
  rejectBtn: {
    backgroundColor: Colors.error,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
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
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    minHeight: 100,
    marginBottom: 20,
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
    backgroundColor: Colors.success,
  },
  modalConfirmBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  modalRejectBtn: {
    backgroundColor: Colors.error,
  },
  modalRejectBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
