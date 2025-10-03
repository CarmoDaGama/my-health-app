import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReviewInput } from '../../types';
import { useReviews } from '../../hooks/useReviews';
import { useTranslation } from '../../hooks/useTranslation';

interface ReviewFormProps {
  serviceId: string;
  serviceName: string;
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  existingReview?: {
    id: string;
    rating: number;
    comment: string;
  };
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  serviceId,
  serviceName,
  visible,
  onClose,
  onSuccess,
  existingReview,
}) => {
  const { addReview, updateReview, isLoading } = useReviews();
  const { t } = useTranslation();
  
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!existingReview;

  const resetForm = useCallback(() => {
    setRating(existingReview?.rating || 0);
    setComment(existingReview?.comment || '');
    setIsSubmitting(false);
  }, [existingReview]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const validateForm = (): boolean => {
    if (rating === 0) {
      Alert.alert(t('errors.title'), t('reviews.ratingRequired'));
      return false;
    }

    if (comment.trim().length < 10) {
      Alert.alert(t('errors.title'), t('reviews.commentTooShort'));
      return false;
    }

    if (comment.trim().length > 500) {
      Alert.alert(t('errors.title'), t('reviews.commentTooLong'));
      return false;
    }

    return true;
  };

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let success = false;

      if (isEditing && existingReview) {
        // Update existing review
        success = await updateReview(existingReview.id, {
          rating,
          comment: comment.trim(),
        });
      } else {
        // Add new review
        const reviewInput: ReviewInput = {
          serviceId,
          rating,
          comment: comment.trim(),
        };
        success = await addReview(reviewInput);
      }

      if (success) {
        Alert.alert(
          'Sucesso',
          isEditing ? 'Avaliação atualizada com sucesso!' : 'Avaliação enviada com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => {
                onSuccess?.();
                handleClose();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert(
        t('errors.title'),
        t('reviews.submitError')
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateForm,
    isEditing,
    existingReview,
    rating,
    comment,
    serviceId,
    addReview,
    updateReview,
    onSuccess,
    handleClose,
  ]);

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        <Text style={styles.ratingLabel}>Sua avaliação:</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={32}
                color={star <= rating ? '#FFD700' : '#DDD'}
              />
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.ratingText}>
            {rating === 1 && 'Muito ruim'}
            {rating === 2 && 'Ruim'}
            {rating === 3 && 'Regular'}
            {rating === 4 && 'Bom'}
            {rating === 5 && 'Excelente'}
          </Text>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.title}>
                {isEditing ? 'Editar Avaliação' : 'Avaliar Serviço'}
              </Text>
              <View style={styles.placeholder} />
            </View>

            {/* Service Info */}
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{serviceName}</Text>
              <Text style={styles.servicePrompt}>
                {isEditing 
                  ? 'Edite sua avaliação sobre este serviço'
                  : 'Como foi sua experiência com este serviço?'
                }
              </Text>
            </View>

            {/* Rating Stars */}
            {renderStars()}

            {/* Comment Input */}
            <View style={styles.commentSection}>
              <Text style={styles.commentLabel}>Comentário:</Text>
              <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Compartilhe detalhes da sua experiência..."
                placeholderTextColor="#999"
                multiline
                textAlignVertical="top"
                maxLength={500}
                returnKeyType="done"
                blurOnSubmit
              />
              <Text style={styles.characterCount}>
                {comment.length}/500 caracteres
              </Text>
            </View>

            {/* Guidelines */}
            <View style={styles.guidelines}>
              <Text style={styles.guidelinesTitle}>Diretrizes para avaliações:</Text>
              <Text style={styles.guidelineText}>
                • Seja honesto e construtivo{'\n'}
                • Descreva sua experiência real{'\n'}
                • Evite linguagem ofensiva{'\n'}
                • Foque nos aspectos do atendimento
              </Text>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (rating === 0 || comment.trim().length < 10 || isSubmitting) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={rating === 0 || comment.trim().length < 10 || isSubmitting}
            >
              <Text style={[
                styles.submitButtonText,
                (rating === 0 || comment.trim().length < 10 || isSubmitting) && styles.submitButtonTextDisabled
              ]}>
                {isSubmitting ? t('reviews.submitting') : isEditing ? t('reviews.updateReview') : t('reviews.submitReview')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  serviceInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  servicePrompt: {
    fontSize: 14,
    color: '#666',
  },
  starsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
    marginHorizontal: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  commentSection: {
    padding: 16,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    backgroundColor: '#FAFAFA',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  guidelines: {
    margin: 16,
    padding: 16,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#999',
  },
});