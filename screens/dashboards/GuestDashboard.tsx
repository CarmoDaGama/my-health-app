import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, spacing, borderRadius, fontSize } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth-firebase';
import { HealthService } from '../../types';
import { HealthServiceAPIFirebase } from '../../services/api-firebase';
import { NavigationProp } from '../../types/navigation';

const { width } = Dimensions.get('window');

export const GuestDashboard: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { continueAsGuest } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredServices, setFeaturedServices] = useState<HealthService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedServices();
  }, []);

    const loadFeaturedServices = async () => {
    try {
      console.log('🔄 Iniciando carregamento dos serviços em destaque...');
      setLoading(true);
      const result = await HealthServiceAPIFirebase.getAllServices(6); // Get 6 featured services
      console.log('📊 Resultado da API:', result);
      
      if (result.services && result.services.length > 0) {
        const featured = result.services.slice(0, 6);
        setFeaturedServices(featured); // Take first 6 as featured
        console.log('✅ Serviços em destaque carregados:', featured.length);
      } else {
        console.log('⚠️ Nenhum serviço retornado pela API, usando dados mock');
        // Fallback para dados mock quando não há serviços na API
        const mockServices = [
          {
            id: 'mock-1',
            name: 'Hospital Américo Boavida',
            type: 'hospital',
            address: 'Rua Amílcar Cabral, 105, Maianga, Luanda',
            coordinates: { latitude: -8.8383, longitude: 13.2344 },
            rating: 4.2,
            specialty: 'Geral',
            verified: true
          },
          {
            id: 'mock-2',
            name: 'Clínica Girassol',
            type: 'clinic',
            address: 'Avenida 4 de Fevereiro, 321, Ingombota, Luanda',
            coordinates: { latitude: -8.8368, longitude: 13.2343 },
            rating: 4.5,
            specialty: 'Clínica Geral',
            verified: true
          },
          {
            id: 'mock-3',
            name: 'Hospital Josina Machel',
            type: 'hospital',
            address: 'Rua Major Kanhangulo, 100, Ingombota, Luanda',
            coordinates: { latitude: -8.8300, longitude: 13.2400 },
            rating: 4.0,
            specialty: 'Emergência',
            verified: true
          }
        ];
        setFeaturedServices(mockServices);
        console.log('✅ Usando serviços mock:', mockServices.length);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar serviços em destaque:', error);
      // Em caso de erro, usar dados mock como fallback
      const mockServices = [
        {
          id: 'mock-1',
          name: 'Hospital Américo Boavida',
          type: 'hospital',
          address: 'Rua Amílcar Cabral, 105, Maianga, Luanda',
          coordinates: { latitude: -8.8383, longitude: 13.2344 },
          rating: 4.2,
          specialty: 'Geral',
          verified: true
        },
        {
          id: 'mock-2',
          name: 'Clínica Girassol',
          type: 'clinic',
          address: 'Avenida 4 de Fevereiro, 321, Ingombota, Luanda',
          coordinates: { latitude: -8.8368, longitude: 13.2343 },
          rating: 4.5,
          specialty: 'Clínica Geral',
          verified: true
        }
      ];
      setFeaturedServices(mockServices);
      console.log('✅ Fallback para serviços mock devido a erro');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    console.log('🔍 handleSearch chamado:', {
      searchQuery: searchQuery.trim(),
      featuredServicesLength: featuredServices.length,
      featuredServices: featuredServices.slice(0, 2) // Log apenas os primeiros 2 para não sobrecarregar
    });
    
    if (searchQuery.trim()) {
      console.log('✅ Navegando para Map com parâmetros:', {
        services: featuredServices,
        searchQuery: searchQuery.trim()
      });
      
      try {
        // Garantir que services é sempre um array válido
        const servicesToSend = Array.isArray(featuredServices) ? featuredServices : [];
        
        navigation.navigate('Map', { 
          services: servicesToSend,
          searchQuery: searchQuery.trim()
        });
        console.log('✅ Navegação iniciada com sucesso');
      } catch (error) {
        console.error('❌ Erro na navegação:', error);
        Alert.alert('Erro', 'Não foi possível abrir o mapa. Tente novamente.');
      }
    } else {
      console.log('⚠️ Query de busca vazia');
      Alert.alert('Aviso', 'Digite algo para buscar');
    }
  };

  const handleServicePress = (service: HealthService) => {
    navigation.navigate('ServiceDetail', { service });
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const renderFeatureCard = (
    icon: string, 
    title: string, 
    description: string, 
    isPremium = false
  ) => (
    <View style={[styles.featureCard, isPremium && styles.premiumCard]}>
      <View style={[styles.featureIcon, isPremium && styles.premiumIcon]}>
        <Ionicons 
          name={icon as any} 
          size={24} 
          color={isPremium ? Colors.primary : Colors.textSecondary} 
        />
      </View>
      <Text style={[styles.featureTitle, isPremium && styles.premiumTitle]}>
        {title}
      </Text>
      <Text style={styles.featureDescription}>{description}</Text>
      {isPremium && (
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumBadgeText}>Premium</Text>
        </View>
      )}
    </View>
  );

  const renderServiceCard = (service: HealthService) => (
    <TouchableOpacity 
      key={service.id}
      style={styles.serviceCard}
      onPress={() => handleServicePress(service)}
    >
      <View style={styles.serviceHeader}>
        <Ionicons 
          name={service.type === 'professional' ? 'person' : 'medical'} 
          size={20} 
          color={Colors.primary} 
        />
        <Text style={styles.serviceName} numberOfLines={1}>
          {service.name}
        </Text>
      </View>
      <Text style={styles.serviceType}>
        {service.specialty || service.type}
      </Text>
      {service.rating && (
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{service.rating}</Text>
        </View>
      )}
      <View style={styles.serviceFooter}>
        <Text style={styles.serviceAddress} numberOfLines={1}>
          {service.address}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header com Logo e Ações */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>MEDILOCATOR</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.welcomeText}>
          {t('guest.welcome') || 'Encontre profissionais de saúde próximos a você'}
        </Text>
      </View>

      {/* Barra de Busca */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('app.searchPlaceholder') || 'Buscar serviços de saúde...'}
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="arrow-forward" size={20} color={Colors.surface} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Convite para Registro */}
      <View style={styles.ctaSection}>
        <View style={styles.ctaCard}>
          <Ionicons name="heart" size={32} color={Colors.primary} />
          <Text style={styles.ctaTitle}>
            {t('guest.ctaTitle') || 'Crie sua conta gratuita'}
          </Text>
          <Text style={styles.ctaDescription}>
            {t('guest.ctaDescription') || 'Acesse recursos exclusivos e salve seus profissionais favoritos'}
          </Text>
          <TouchableOpacity style={styles.ctaButton} onPress={handleRegister}>
            <Text style={styles.ctaButtonText}>
              {t('auth.register') || 'Registrar Gratuitamente'}
            </Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.surface} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recursos Disponíveis */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>
          {t('guest.features') || 'O que você pode fazer'}
        </Text>
        
        <View style={styles.featuresGrid}>
          {renderFeatureCard(
            'search',
            t('guest.feature1Title') || 'Buscar Serviços',
            t('guest.feature1Desc') || 'Encontre profissionais e instituições'
          )}
          
          {renderFeatureCard(
            'heart',
            t('guest.feature2Title') || 'Salvar Favoritos',
            t('guest.feature2Desc') || 'Guarde seus profissionais preferidos',
            true
          )}
          
          {renderFeatureCard(
            'star',
            t('guest.feature3Title') || 'Fazer Avaliações',
            t('guest.feature3Desc') || 'Compartilhe sua experiência',
            true
          )}
          
          {renderFeatureCard(
            'chatbubble',
            t('guest.feature4Title') || 'Contato Direto',
            t('guest.feature4Desc') || 'Fale diretamente com profissionais',
            true
          )}
        </View>
      </View>

      {/* Serviços em Destaque */}
      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>
          {t('guest.featured') || 'Serviços em Destaque'}
        </Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesContainer}
          >
            {featuredServices.map(renderServiceCard)}
          </ScrollView>
        )}
      </View>

      {/* Call to Action Final */}
      <View style={styles.finalCta}>
        <Text style={styles.finalCtaTitle}>
          {t('guest.finalCtaTitle') || 'Pronto para começar?'}
        </Text>
        <Text style={styles.finalCtaDescription}>
          {t('guest.finalCtaDescription') || 'Registre-se agora e tenha acesso completo à plataforma'}
        </Text>
        
        <View style={styles.finalCtaButtons}>
          <TouchableOpacity style={styles.primaryCtaButton} onPress={handleRegister}>
            <Text style={styles.primaryCtaButtonText}>
              {t('auth.register') || 'Criar Conta'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryCtaButton} onPress={handleLogin}>
            <Text style={styles.secondaryCtaButtonText}>
              {t('auth.login') || 'Já tenho conta'}
            </Text>
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
  header: {
    padding: spacing.lg,
    backgroundColor: Colors.surface,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logo: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  headerActions: {
    flexDirection: 'row',
  },
  loginButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: borderRadius.md,
  },
  loginButtonText: {
    color: Colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  welcomeText: {
    fontSize: fontSize.lg,
    color: Colors.text,
    textAlign: 'center',
  },
  searchSection: {
    padding: spacing.lg,
    backgroundColor: Colors.surface,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    color: Colors.text,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  ctaSection: {
    padding: spacing.lg,
  },
  ctaCard: {
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary + '20',
  },
  ctaTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  ctaDescription: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  ctaButtonText: {
    color: Colors.surface,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  featuresSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: spacing.lg,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - spacing.lg * 3) / 2,
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  premiumCard: {
    borderWidth: 2,
    borderColor: Colors.primary + '30',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  premiumIcon: {
    backgroundColor: Colors.primary + '10',
  },
  featureTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  premiumTitle: {
    color: Colors.primary,
  },
  featureDescription: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  premiumBadgeText: {
    color: Colors.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
  featuredSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  loadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: fontSize.md,
  },
  servicesContainer: {
    paddingRight: spacing.lg,
  },
  serviceCard: {
    width: 200,
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  serviceName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  serviceType: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rating: {
    fontSize: fontSize.sm,
    color: Colors.text,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  serviceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceAddress: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  finalCta: {
    margin: spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  finalCtaTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  finalCtaDescription: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  finalCtaButtons: {
    width: '100%',
  },
  primaryCtaButton: {
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryCtaButtonText: {
    color: Colors.surface,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  secondaryCtaButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryCtaButtonText: {
    color: Colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
