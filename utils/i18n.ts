import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave para salvar a preferência de idioma do usuário
const LANGUAGE_PREFERENCE_KEY = '@health_app:language_preference';

// Traduções
const translations = {
  en: {
    // Authentication
    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      name: 'Name',
      phone: 'Phone',
      welcomeBack: 'Welcome Back',
      createAccount: 'Create Account',
      forgotPassword: 'Forgot Password?',
      loginSubtitle: 'Access your account to continue',
      registerSubtitle: 'Fill in the details to register',
      forgotPasswordSubtitle: 'Enter your email to receive a recovery link',
      emailPlaceholder: 'Enter your email',
      passwordPlaceholder: 'Enter your password',
      confirmPasswordPlaceholder: 'Confirm your password',
      namePlaceholder: 'Enter your full name',
      phonePlaceholder: 'Ex: +244 9XX XXX XXX',
      noAccount: "Don't have an account?",
      alreadyHaveAccount: 'Already have an account?',
      acceptTerms: 'I accept the',
      termsOfService: 'terms of service',
      and: ' and ',
      privacyPolicy: 'privacy policy',
      signingIn: 'Signing in...',
      creatingAccount: 'Creating account...',
      loginError: 'Login Error',
      registerError: 'Registration Error',
      resetPasswordError: 'Error',
      loginGenericError: 'Unknown error',
      registerGenericError: 'Registration error',
      resetPasswordGenericError: 'Error sending recovery email',
      emailSent: 'Email Sent',
      emailSentMessage: 'We sent a recovery link to your email. Check your inbox and spam folder.',
      backToLogin: 'Back to Login',
      rememberPassword: 'Remember your password?',
      sendResetLink: 'Send Recovery Link',
      checkingAuth: 'Checking authentication...',
      loginRequired: 'Login Required',
      loginRequiredMessage: 'You need to be logged in to access this area.',
      goToLogin: 'Go to Login',
      alreadyLoggedIn: 'Already Logged In',
      alreadyLoggedInMessage: 'You are already logged into the system.',
      user: 'User',
      selectAccountType: 'Account Type',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Your full name',
      emailAddress: 'Email Address',
      emailAddressPlaceholder: 'your@email.com',
      phoneNumber: 'Phone Number',
      confirmPasswordLabel: 'Confirm Password',
      confirmPasswordPlaceholderText: 'Confirm your password',
      acceptTermsLabel: 'I accept the Terms of Use and Privacy Policy',
      termsOfUse: 'Terms of Use',
      privacyPolicyLabel: 'Privacy Policy',
      alreadyHaveAccountLabel: 'Already have an account?',
      signIn: 'Sign In',
      registrationSuccess: 'Success!',
      accountCreated: 'Account created successfully!',
      emailAlreadyRegistered: 'Email Already Registered',
      emailAlreadyInUse: 'This email already has a registered account. Try logging in or use another email.',
      invalidEmail: 'Invalid Email',
      checkEmailFormat: 'Please check if the email is in the correct format.',
      passwordProblem: 'Password Problem',
      invalidPhone: 'Invalid Phone',
      checkPhoneNumber: 'Please check if the phone number is correct.',
      requiredFields: 'Required Fields',
      fillAllFields: 'Please fill in all required fields.',
      registrationFailed: 'Could not create account. Please try again.',
      
      // Account status validations
      accountInactive: 'Account Inactive',
      accountInactiveMessage: 'Your account has been deactivated. Please contact support for assistance.',
      serviceSuspended: 'Service Suspended',
      serviceSuspendedMessage: 'Your professional service is suspended and will not appear in searches.',
    },
    
    // Profile
    profile: {
      myProfile: 'My Profile',
      guestUser: 'Guest User',
      guestMessage: 'Log in to access your personal data and preferences',
      account: 'Account',
      editProfile: 'Edit Profile',
      personalInfo: 'Personal Information',
      accountInfo: 'Account Information',
      favorites: 'Favorites',
      userDetails: 'User Details',
      userType: 'User Type',
      accountStatus: 'Account Status',
      verification: 'Verification',
      favoriteServices: 'Favorite Services',
      favoriteLocations: 'Favorite Locations',
      language: 'Language',
      notifications: 'Notifications',
      appInfo: 'About App',
      version: 'Version',
      developer: 'Developer',
      memberSince: 'Member since',
      lastUpdate: 'Last update',
      loading: 'Loading...',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      success: 'Success',
      error: 'Error',
      profileUpdated: 'Profile updated successfully',
      updateError: 'Error updating profile',
      logout: 'Logout',
      logoutConfirmation: 'Are you sure you want to log out of your account?',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      namePlaceholder: 'Enter your name',
      phonePlaceholder: 'Enter your phone',
      addressPlaceholder: 'Enter your address',
      emailNote: 'Email cannot be changed',
      notProvided: 'Not provided',
      changeLanguage: 'Change Language',
      changeLanguageConfirmation: 'Change language to',
      
      // Profile edit form translations
      basicInfo: 'Basic Information',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      emergencyContact: 'Emergency Contact',
      emergencyName: 'Emergency Contact Name',
      emergencyPhone: 'Emergency Contact Phone',
      emergencyRelationship: 'Relationship',
      emergencyNamePlaceholder: 'Name of emergency contact',
      emergencyPhonePlaceholder: 'Emergency contact phone',
      emergencyRelationshipPlaceholder: 'e.g., Father/Mother, Spouse, Sibling',
      
      // Professional form translations
      professionalInfo: 'Professional Information',
      specialty: 'Specialty',
      license: 'License Number',
      experience: 'Years of Experience',
      bio: 'Biography/Description',
      certifications: 'Certifications',
      consultationFee: 'Consultation Fee (AOA)',
      acceptsInsurance: 'Accepts Insurance',
      workingHours: 'Working Hours',
      specialtyPlaceholder: 'e.g., Cardiology, Pediatrics, etc.',
      licensePlaceholder: 'Professional registration number',
      bioPlaceholder: 'Describe your professional experience and approach',
      certificationsPlaceholder: 'Separate certifications with commas',
      
      // Institution form translations
      institutionName: 'Institution Name',
      institutionNamePlaceholder: 'Name of health institution',
      type: 'Institution Type',
      description: 'Description',
      services: 'Services Offered',
      street: 'Street/Avenue',
      city: 'City',
      state: 'Province',
      zipCode: 'Postal Code',
      contactInfo: 'Contact Information',
      website: 'Website',
      serviceSettings: 'Service Settings',
      emergencyService: '24h Emergency Service',
      descriptionPlaceholder: 'Describe the services and differentials of the institution',
      servicesPlaceholder: 'Separate services with commas (e.g., Consultations, Exams, Surgeries)',
      streetPlaceholder: 'Street, number, neighborhood',
      cityPlaceholder: 'City',
      statePlaceholder: 'Province',
      zipCodePlaceholder: 'Postal code',
      emailPlaceholder: 'Contact email',
      websitePlaceholder: 'https://www.example.com',
      
      // Institution types
      hospital: 'Hospital',
      clinic: 'Clinic',
      laboratory: 'Laboratory',
      pharmacy: 'Pharmacy',
      
      // Days of the week
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
      
      // Time labels
      startTime: 'Start Time',
      endTime: 'End Time',
      
      // Errors
      errors: {
        nameRequired: 'Name is required',
        specialtyRequired: 'Specialty is required',
        addressRequired: 'Complete address is required',
      },
      
      // Success messages
      updateSuccess: 'Profile updated successfully!',
    },

    // Status
    status: {
      active: 'Active',
      verified: 'Verified',
      pending: 'Pending',
      inactive: 'Inactive',
      unverified: 'Unverified',
    },

    // User Types
    userTypes: {
      normal_user: 'Normal User',
      professional: 'Professional',
      institution: 'Institution',
    },
    
    // Common
    common: {
      ok: 'OK',
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      confirm: 'Confirm',
      enabled: 'Enabled',
      disabled: 'Disabled',
      yes: 'Yes',
      no: 'No',
      contactSupport: 'Contact Support',
      other: 'Other',
      loading: 'Loading...',
      saving: 'Saving...',
      success: 'Success',
      back: 'Back',
      notAvailable: 'Not available',
    },
    
    // Validation
    validation: {
      emailRequired: 'Email is required',
      emailInvalid: 'Invalid email',
      passwordRequired: 'Password is required',
      passwordMinLength: 'Password must have at least 6 characters',
      confirmPasswordRequired: 'Password confirmation is required',
      passwordMismatch: 'Passwords do not match',
      nameRequired: 'Name is required',
      nameMinLength: 'Name must have at least 2 characters',
      phoneInvalid: 'Invalid phone number (use Angolan format)',
      acceptTermsRequired: 'You must accept the terms of use',
      phoneValid: 'Valid number',
      operator: 'Operator',
      phoneFormat: 'Format: +244 9XX XXX XXX',
      required: 'Required',
      invalid: 'Invalid',
      specialtyRequired: 'Specialty is required',
      licenseRequired: 'License number is required',
      institutionTypeRequired: 'Institution type is required',
      addressRequired: 'Address is required',
      cityRequired: 'City is required',
    },
    app: {
      title: 'Health Services Locator',
      name: 'MEDILOCATOR',
      search: 'Search health services...',
      searchPlaceholder: 'Search health services...',
      noResults: 'No services found',
      loading: 'Loading...',
      locationPermission: 'Location permission required',
      locationPermissionMessage: 'Please allow location access to find nearby services',
      mapLoading: 'Loading map...',
      gettingLocation: 'Getting your location...',
      loadingMap: 'Loading OpenStreetMap...',
      locationError: 'Location Error',
      locationGpsError: 'Could not get your location via GPS. Use manual selection on the map.',
      optimizingView: 'Optimizing view...',
      adjustOnMap: '📍 Adjust on Map',
      selectOnMap: '🗺️ Select on Map',
      institutionInfo: 'Institution Information',
      locationPrecisionInstitution: 'For better map accuracy, capture the exact location of the institution:',
      locationPrecisionProfessional: 'For better map accuracy, capture your exact location:',
      reviewGuidelines: 'Review Guidelines:',
    },
    services: {
      hospital: 'Hospital',
      clinic: 'Clinic', 
      pharmacy: 'Pharmacy',
      emergency: 'Emergency',
      laboratory: 'Laboratory',
      professional: 'Professional',
    },
    serviceTypes: {
      all: 'All Services',
      professionals: 'Professionals',
      institutions: 'Institutions',
      others: 'Other Services',
      professional: 'Professional',
      institution: 'Institution',
      types: {
        hospital: 'Hospital',
        clinic: 'Clinic',
        laboratory: 'Laboratory',
        pharmacy: 'Pharmacy',
      },
      healthProfessionals: 'Health Professionals',
      healthInstitutions: 'Health Institutions',
      otherServices: 'Other Services',
    },
    screens: {
      home: 'Home',
      map: 'Map',
      list: 'List',
      details: 'Details',
      profile: 'Profile',
      welcome: 'Welcome',
    },
    actions: {
      search: 'Search',
      cancel: 'Cancel',
      ok: 'OK',
      call: 'Call',
      directions: 'Directions',
      back: 'Back',
      retry: 'Try Again',
      dismiss: 'Dismiss',
      clearCache: 'Clear Cache',
      viewAll: 'View All',
    },
    details: {
      phone: 'Phone',
      address: 'Address',
      description: 'Description',
      rating: 'Rating',
      hours: 'Hours',
      services: 'Services',
      specialties: 'Specialties',
    },
    errors: {
      title: 'Error',
      networkError: 'Connection error. Check your internet and try again.',
      locationError: 'Unable to get location',
      locationDenied: 'Location permission is required to use this feature.',
      loadingServices: 'Error loading health services',
      unexpectedError: 'An unexpected error occurred',
      invalidCoordinates: 'Coordinates are outside Angolan territory',
      invalidPhone: 'Invalid phone number format',
      phoneRequired: 'Phone number is required',
      updatePreferences: 'Could not update preferences',
    },

    cache: {
      cleared: 'Cache cleared successfully',
      stats: 'Cache Statistics',
      totalItems: 'Total items',
      validItems: 'Valid items',
      expiredItems: 'Expired items',
    },
    welcome: {
      title: 'Welcome to MediLocator',
      subtitle: 'Quickly find the best health services in your region. Access detailed information, locations and reviews.',
      login: 'Login',
      continueAsGuest: 'Continue as Guest',
      findProfessional: 'Find Professional',
    },
    categories: {
      title: 'Categories',
      professionals: 'Professionals',
      institutions: 'Institutions',
      more: 'More',
    },
    serviceDetail: {
      loginRequired: 'Login Required',
      loginRequiredMessage: 'You need to be logged in to rate this service.',
      specialty: 'Specialty',
      businessHours: 'Business Hours',
      professionalDetails: 'Professional Details',
      institutionDetails: 'Institution Details',
      editMyReview: 'Edit My Review',
      rateService: 'Rate Service',
    },
    reviews: {
      title: 'Reviews',
      allReviews: 'All Reviews',
      reviewsCount: 'reviews',
      verified: '✓ Verified',
      sortBy: 'Sort by:',
      noReviews: 'No reviews yet',
      loadingMore: 'Loading more reviews...',
      loading: 'Loading reviews...',
      loadError: 'Error loading reviews',
      submitError: 'An error occurred while submitting your review. Please try again.',
      ratingRequired: 'Please select a rating from 1 to 5 stars.',
      commentTooShort: 'Comment must be at least 10 characters.',
      commentTooLong: 'Comment cannot be more than 500 characters.',
      deleteTitle: 'Delete Review',
      deleteMessage: 'Are you sure you want to delete your review? This action cannot be undone.',
      deleteConfirm: 'Delete',
      submitting: 'Submitting...',
      updateReview: 'Update Review',
      submitReview: 'Submit Review',
      beFirstToReview: 'Be the first to review this service and help other users!',
      submitSuccess: 'Review submitted successfully!',
      updateSuccess: 'Review updated successfully!',
    },
    map: {
      loading: 'Loading map...',
      locationError: 'Error getting location',
    },
    forms: {
      selectType: 'Select type',
      selectServices: 'Select offered services',
      selectServicesTitle: 'Select Services',
      selectTypeTitle: 'Select Type',
      selectLocation: 'Select a Location',
      selectLocationMessage: 'Please tap on the map to select a location.',
      locationNotAvailable: 'Could not get your current location. Please select manually on the map.',
      officeAddress: 'Office or clinic address',
      professionalDescription: 'Doctor, nurse or other health professional',
      institutionDescription: 'Hospital, clinic, laboratory or pharmacy',
      userDescription: 'Search and find health services in your area',
      institutionInfo: 'Institution Information',
      professionalInfo: 'Professional Information',
      institutionType: 'Institution Type',
      availableServices: 'Available Services',
      exactLocation: 'Exact Location',
      gettingCoordinates: 'Getting coordinates...',
      close: 'Close',
      specialty: 'Specialty',
      licenseNumber: 'License Number',
      yearsPlaceholder: 'Ex: 5',
      descriptionPlaceholder: 'Describe your services...',
      address: 'Address',
      descriptionBiography: 'Description/Biography',
      coordinatesCaptured: 'Coordinates Captured',
      useGPS: 'Use GPS',
      institutionName: 'Institution Name',
      institutionDescriptionForm: 'Institution Description',
      servicesSelected: 'service(s) selected',
      street: 'Street',
      city: 'City',
      streetPlaceholder: 'Street, number',
      cityPlaceholder: 'City',
      institutionDescriptionPlaceholder: 'Describe the institution and its services...',
      yearsOfExperience: 'Years of Experience',
      specialtyPlaceholder: 'Ex: Cardiology, Pediatrics...',
      licenseNumberPlaceholder: 'Professional license number',
      province: 'Province',
      provincePlaceholder: 'Province',
      exactInstitutionLocation: 'Exact Institution Location',
      selectInstitutionLocation: 'Select Institution Location',
    },
    ratings: {
      veryBad: 'Very bad',
      bad: 'Bad',
      regular: 'Regular',
      good: 'Good',
      excellent: 'Excellent',
      yourRating: 'Your rating:',
      editReview: 'Edit Review',
      rateService: 'Rate Service',
      experiencePrompt: 'How was your experience with this service?',
      editPrompt: 'Edit your review about this service',
    },
    tabs: {
      professionals: 'Professionals',
      institutions: 'Institutions',
      more: 'More',
    },
    directions: {
      title: 'Directions',
      show: 'Show',
      hide: 'Hide',
    },
    company: {
      developer: 'Health App Team',
    },
    medicalServices: {
      emergency: 'Emergency',
      surgery: 'Surgery',
      pediatrics: 'Pediatrics',
      cardiology: 'Cardiology',
      consultations: 'Consultations',
      exams: 'Exams',
      vaccination: 'Vaccination',
      checkup: 'Check-up',
      laboratory: 'Laboratory',
      radiology: 'Radiology',
      physiotherapy: 'Physiotherapy',
      nutrition: 'Nutrition',
      psychology: 'Psychology',
      gynecology: 'Gynecology',
      urology: 'Urology',
      dermatology: 'Dermatology',
      ophthalmology: 'Ophthalmology',
      orthopedics: 'Orthopedics',
      neurology: 'Neurology',
      oncology: 'Oncology',
      pharmacy: 'Pharmacy',
      hospitalization: 'Hospitalization',
      icu: 'ICU',
      maternity: 'Maternity',
    },
    settings: {
      language: 'Language',
      selectLanguage: 'Select Language',
      guestLanguageNote: 'Language preference will be saved for your next visit',
      languageChanged: 'Language changed successfully',
    }
  },
  pt: {
    // Authentication
    auth: {
      login: 'Entrar',
      register: 'Registrar',
      logout: 'Sair',
      email: 'Email',
      password: 'Senha',
      confirmPassword: 'Confirmar Senha',
      name: 'Nome',
      phone: 'Telefone',
      welcomeBack: 'Bem-vindo de volta',
      createAccount: 'Criar Conta',
      forgotPassword: 'Esqueceu a senha?',
      loginSubtitle: 'Acesse sua conta para continuar',
      registerSubtitle: 'Preencha os dados para se registrar',
      forgotPasswordSubtitle: 'Digite seu email para receber um link de recuperação',
      emailPlaceholder: 'Digite seu email',
      passwordPlaceholder: 'Digite sua senha',
      confirmPasswordPlaceholder: 'Confirme sua senha',
      namePlaceholder: 'Digite seu nome completo',
      phonePlaceholder: 'Ex: +244 9XX XXX XXX',
      noAccount: 'Não tem conta?',
      alreadyHaveAccount: 'Já tem conta?',
      acceptTerms: 'Aceito os',
      termsOfService: 'termos de uso',
      and: ' e a ',
      privacyPolicy: 'política de privacidade',
      signingIn: 'Fazendo login...',
      creatingAccount: 'Criando conta...',
      loginError: 'Erro no Login',
      registerError: 'Erro no Registro',
      resetPasswordError: 'Erro',
      loginGenericError: 'Erro desconhecido',
      registerGenericError: 'Erro no registro',
      resetPasswordGenericError: 'Erro ao enviar email de recuperação',
      emailSent: 'Email Enviado',
      emailSentMessage: 'Enviamos um link de recuperação para seu email. Verifique sua caixa de entrada e spam.',
      backToLogin: 'Voltar ao Login',
      rememberPassword: 'Lembrou da senha?',
      sendResetLink: 'Enviar Link de Recuperação',
      checkingAuth: 'Verificando autenticação...',
      loginRequired: 'Login Necessário',
      loginRequiredMessage: 'Você precisa estar logado para acessar esta área.',
      goToLogin: 'Fazer Login',
      alreadyLoggedIn: 'Já Logado',
      alreadyLoggedInMessage: 'Você já está logado no sistema.',
      user: 'Usuário',
      selectAccountType: 'Tipo de Conta',
      fullName: 'Nome Completo',
      fullNamePlaceholder: 'Seu nome completo',
      emailAddress: 'Email',
      emailAddressPlaceholder: 'seu@email.com',
      phoneNumber: 'Telefone',
      confirmPasswordLabel: 'Confirmar Senha',
      confirmPasswordPlaceholderText: 'Confirme sua senha',
      acceptTermsLabel: 'Aceito os Termos de Uso e Política de Privacidade',
      termsOfUse: 'Termos de Uso',
      privacyPolicyLabel: 'Política de Privacidade',
      alreadyHaveAccountLabel: 'Já tem uma conta?',
      signIn: 'Entrar',
      registrationSuccess: 'Sucesso!',
      accountCreated: 'Conta criada com sucesso!',
      emailAlreadyRegistered: 'Email já Cadastrado',
      emailAlreadyInUse: 'Este email já possui uma conta registrada. Tente fazer login ou use outro email.',
      invalidEmail: 'Email Inválido',
      checkEmailFormat: 'Por favor, verifique se o email está no formato correto.',
      passwordProblem: 'Problema com a Senha',
      invalidPhone: 'Telefone Inválido',
      checkPhoneNumber: 'Por favor, verifique se o número de telefone está correto.',
      requiredFields: 'Campos Obrigatórios',
      fillAllFields: 'Por favor, preencha todos os campos obrigatórios.',
      registrationFailed: 'Não foi possível criar a conta. Tente novamente.',
      
      // Account status validations
      accountInactive: 'Conta Inativa',
      accountInactiveMessage: 'Sua conta foi desativada. Entre em contato com o suporte para assistência.',
      serviceSuspended: 'Serviço Suspenso',
      serviceSuspendedMessage: 'Seu serviço profissional está suspenso e não aparecerá nas buscas.',
    },
    
    // Profile
    profile: {
      myProfile: 'Meu Perfil',
      guestUser: 'Usuário Convidado',
      guestMessage: 'Faça login para acessar seus dados pessoais e preferências',
      account: 'Conta',
      editProfile: 'Editar Perfil',
      personalInfo: 'Informações Pessoais',
      accountInfo: 'Informações da Conta',
      favorites: 'Favoritos',
      userDetails: 'Detalhes do Usuário',
      userType: 'Tipo de Usuário',
      accountStatus: 'Status da Conta',
      verification: 'Verificação',
      favoriteServices: 'Serviços Favoritos',
      favoriteLocations: 'Locais Favoritos',
      language: 'Idioma',
      notifications: 'Notificações',
      appInfo: 'Sobre o App',
      version: 'Versão',
      developer: 'Desenvolvedor',
      memberSince: 'Membro desde',
      lastUpdate: 'Última atualização',
      loading: 'Carregando...',
      edit: 'Editar',
      save: 'Salvar',
      cancel: 'Cancelar',
      success: 'Sucesso',
      error: 'Erro',
      profileUpdated: 'Perfil atualizado com sucesso',
      updateError: 'Erro ao atualizar perfil',
      logout: 'Sair',
      logoutConfirmation: 'Tem certeza que deseja sair da sua conta?',
      name: 'Nome',
      email: 'Email',
      phone: 'Telefone',
      address: 'Endereço',
      namePlaceholder: 'Digite seu nome',
      phonePlaceholder: 'Digite seu telefone',
      addressPlaceholder: 'Digite seu endereço',
      emailNote: 'Email não pode ser alterado',
      notProvided: 'Não informado',
      changeLanguage: 'Alterar Idioma',
      changeLanguageConfirmation: 'Alterar idioma para',
      
      // Traduções do formulário de edição de perfil
      basicInfo: 'Informações Básicas',
      dateOfBirth: 'Data de Nascimento',
      gender: 'Gênero',
      male: 'Masculino',
      female: 'Feminino',
      other: 'Outro',
      emergencyContact: 'Contato de Emergência',
      emergencyName: 'Nome do Contato de Emergência',
      emergencyPhone: 'Telefone do Contato de Emergência',
      emergencyRelationship: 'Relacionamento',
      emergencyNamePlaceholder: 'Nome da pessoa de contato',
      emergencyPhonePlaceholder: 'Telefone da pessoa de contato',
      emergencyRelationshipPlaceholder: 'Ex: Pai/Mãe, Cônjuge, Irmão(ã)',
      
      // Traduções do formulário profissional
      professionalInfo: 'Informações Profissionais',
      specialty: 'Especialidade',
      license: 'Número da Licença',
      experience: 'Anos de Experiência',
      bio: 'Biografia/Descrição',
      certifications: 'Certificações',
      consultationFee: 'Taxa de Consulta (AOA)',
      acceptsInsurance: 'Aceita Seguro',
      workingHours: 'Horário de Atendimento',
      specialtyPlaceholder: 'Ex: Cardiologia, Pediatria, etc.',
      licensePlaceholder: 'Número do registro profissional',
      bioPlaceholder: 'Descreva sua experiência e abordagem profissional',
      certificationsPlaceholder: 'Separe as certificações por vírgula',
      
      // Traduções do formulário institucional
      institutionName: 'Nome da Instituição',
      institutionNamePlaceholder: 'Nome da instituição de saúde',
      type: 'Tipo de Instituição',
      description: 'Descrição',
      services: 'Serviços Oferecidos',
      street: 'Rua/Avenida',
      city: 'Cidade',
      state: 'Província',
      zipCode: 'Código Postal',
      contactInfo: 'Informações de Contato',
      website: 'Website',
      serviceSettings: 'Configurações de Serviço',
      emergencyService: 'Atendimento de Emergência 24h',
      descriptionPlaceholder: 'Descreva os serviços e diferenciais da instituição',
      servicesPlaceholder: 'Separe os serviços por vírgula (Ex: Consultas, Exames, Cirurgias)',
      streetPlaceholder: 'Rua, número, bairro',
      cityPlaceholder: 'Cidade',
      statePlaceholder: 'Província',
      zipCodePlaceholder: 'Código postal',
      emailPlaceholder: 'Email para contato',
      websitePlaceholder: 'https://www.example.com',
      
      // Tipos de instituição
      hospital: 'Hospital',
      clinic: 'Clínica',
      laboratory: 'Laboratório',
      pharmacy: 'Farmácia',
      
      // Dias da semana
      monday: 'Segunda-feira',
      tuesday: 'Terça-feira',
      wednesday: 'Quarta-feira',
      thursday: 'Quinta-feira',
      friday: 'Sexta-feira',
      saturday: 'Sábado',
      sunday: 'Domingo',
      
      // Rótulos de tempo
      startTime: 'Início',
      endTime: 'Fim',
      
      // Erros
      errors: {
        nameRequired: 'Nome é obrigatório',
        specialtyRequired: 'Especialidade é obrigatória',
        addressRequired: 'Endereço completo é obrigatório',
      },
      
      // Mensagens de sucesso
      updateSuccess: 'Perfil atualizado com sucesso!',
    },

    // Status
    status: {
      active: 'Ativo',
      verified: 'Verificado',
      pending: 'Pendente',
      inactive: 'Inativo',
      unverified: 'Não Verificado',
    },

    // Tipos de Usuário
    userTypes: {
      normal_user: 'Usuário Normal',
      professional: 'Profissional',
      institution: 'Instituição',
    },
    
    // Common
    common: {
      ok: 'OK',
      cancel: 'Cancelar',
      save: 'Salvar',
      edit: 'Editar',
      delete: 'Excluir',
      confirm: 'Confirmar',
      enabled: 'Ativado',
      disabled: 'Desativado',
      yes: 'Sim',
      no: 'Não',
      contactSupport: 'Entrar em Contato',
      other: 'Outro',
      loading: 'Carregando...',
      saving: 'Salvando...',
      success: 'Sucesso',
      back: 'Voltar',
      notAvailable: 'Não disponível',
    },
    
    // Validation
    validation: {
      emailRequired: 'Email é obrigatório',
      emailInvalid: 'Email inválido',
      passwordRequired: 'Senha é obrigatória',
      passwordMinLength: 'Senha deve ter pelo menos 6 caracteres',
      confirmPasswordRequired: 'Confirmação de senha é obrigatória',
      passwordMismatch: 'As senhas não coincidem',
      nameRequired: 'Nome é obrigatório',
      nameMinLength: 'Nome deve ter pelo menos 2 caracteres',
      phoneInvalid: 'Número de telefone inválido (use formato angolano)',
      acceptTermsRequired: 'É necessário aceitar os termos de uso',
      phoneValid: 'Número válido',
      operator: 'Operadora',
      phoneFormat: 'Formato: +244 9XX XXX XXX',
      required: 'Obrigatório',
      invalid: 'Inválido',
      specialtyRequired: 'Especialidade é obrigatória',
      licenseRequired: 'Número da licença é obrigatório',
      institutionTypeRequired: 'Tipo de instituição é obrigatório',
      addressRequired: 'Endereço é obrigatório',
      cityRequired: 'Cidade é obrigatória',
    },
    app: {
      title: 'Localizador de Serviços de Saúde',
      name: 'MEDILOCATOR',
      search: 'Buscar serviços de saúde...',
      searchPlaceholder: 'Pesquisar serviços de saúde...',
      noResults: 'Nenhum serviço encontrado',
      loading: 'Carregando...',
      locationPermission: 'Permissão de localização necessária',
      locationPermissionMessage: 'Por favor, permita o acesso à localização para encontrar serviços próximos',
      mapLoading: 'Carregando mapa...',
      gettingLocation: 'Obtendo sua localização...',
      loadingMap: 'Carregando mapa OpenStreetMap...',
      locationError: 'Erro ao obter localização',
      locationGpsError: 'Não foi possível obter sua localização via GPS. Use a seleção manual no mapa.',
      optimizingView: 'Otimizando visualização...',
      adjustOnMap: '📍 Ajustar no Mapa',
      selectOnMap: '🗺️ Selecionar no Mapa',
      institutionInfo: 'Informações da Instituição',
      locationPrecisionInstitution: 'Para melhor precisão no mapa, capture a localização exata da instituição:',
      locationPrecisionProfessional: 'Para melhor precisão no mapa, capture sua localização exata:',
      reviewGuidelines: 'Diretrizes para avaliações:',
    },
    services: {
      hospital: 'Hospital',
      clinic: 'Clínica',
      pharmacy: 'Farmácia',
      emergency: 'Emergência',
      laboratory: 'Laboratório',
      professional: 'Profissional',
    },
    serviceTypes: {
      all: 'Todos os Serviços',
      professionals: 'Profissionais',
      institutions: 'Instituições',
      others: 'Mais',
      professional: 'Profissional',
      institution: 'Instituição',
      types: {
        hospital: 'Hospital',
        clinic: 'Clínica',
        laboratory: 'Laboratório',
        pharmacy: 'Farmácia',
      },
      healthProfessionals: 'Profissionais de Saúde',
      healthInstitutions: 'Instituições de Saúde',
      otherServices: 'Outros Serviços',
    },
    screens: {
      home: 'Início',
      map: 'Mapa',
      list: 'Lista',
      details: 'Detalhes',
      profile: 'Perfil',
      welcome: 'Bem-vindo',
    },
    actions: {
      search: 'Buscar',
      cancel: 'Cancelar',
      ok: 'OK',
      call: 'Ligar',
      directions: 'Direções',
      back: 'Voltar',
      retry: 'Tentar Novamente',
      dismiss: 'Dispensar',
      clearCache: 'Limpar Cache',
      viewAll: 'Ver Todas',
    },
    details: {
      phone: 'Telefone',
      address: 'Endereço',
      description: 'Descrição',
      rating: 'Avaliação',
      hours: 'Horários',
      services: 'Serviços',
      specialties: 'Especialidades',
    },
    errors: {
      title: 'Erro',
      networkError: 'Erro de conexão. Verifique sua internet e tente novamente.',
      locationError: 'Não foi possível obter a localização',
      locationDenied: 'É necessário permitir o acesso à localização para usar esta funcionalidade.',
      loadingServices: 'Erro ao carregar serviços de saúde',
      unexpectedError: 'Ocorreu um erro inesperado',
      invalidCoordinates: 'Coordenadas estão fora do território angolano',
      invalidPhone: 'Formato de telefone inválido',
      phoneRequired: 'Número de telefone é obrigatório',
      updatePreferences: 'Não foi possível atualizar as preferências',
    },
    cache: {
      cleared: 'Cache limpo com sucesso',
      stats: 'Estatísticas do Cache',
      totalItems: 'Total de itens',
      validItems: 'Itens válidos',
      expiredItems: 'Itens expirados',
    },
    welcome: {
      title: 'Boas-Vindas ao MediLocator',
      subtitle: 'Encontre rapidamente os melhores serviços de saúde da sua região. Acesse informações detalhadas, localizações e avaliações.',
      login: 'Entrar',
      continueAsGuest: 'Continuar como Convidado',
      findProfessional: 'Encontrar Profissional',
    },
    categories: {
      title: 'Categorias',
      professionals: 'Profissionais',
      institutions: 'Instituições',
      more: 'Mais',
    },
    serviceDetail: {
      loginRequired: 'Login Necessário',
      loginRequiredMessage: 'Você precisa estar logado para avaliar este serviço.',
      specialty: 'Especialidade',
      businessHours: 'Horários de Atendimento',
      professionalDetails: 'Detalhes do Profissional',
      institutionDetails: 'Detalhes da Instituição',
      editMyReview: 'Editar Minha Avaliação',
      rateService: 'Avaliar Serviço',
    },
    reviews: {
      title: 'Avaliações',
      allReviews: 'Todas as Avaliações',
      reviewsCount: 'avaliações',
      verified: '✓ Verificado',
      sortBy: 'Ordenar por:',
      noReviews: 'Nenhuma avaliação ainda',
      loadingMore: 'Carregando mais avaliações...',
      loading: 'Carregando avaliações...',
      loadError: 'Erro ao carregar avaliações',
      submitError: 'Ocorreu um erro ao enviar sua avaliação. Tente novamente.',
      ratingRequired: 'Por favor, selecione uma avaliação de 1 a 5 estrelas.',
      commentTooShort: 'O comentário deve ter pelo menos 10 caracteres.',
      commentTooLong: 'O comentário não pode ter mais de 500 caracteres.',
      deleteTitle: 'Deletar Avaliação',
      deleteMessage: 'Tem certeza que deseja deletar sua avaliação? Esta ação não pode ser desfeita.',
      deleteConfirm: 'Deletar',
      submitting: 'Enviando...',
      updateReview: 'Atualizar Avaliação',
      submitReview: 'Enviar Avaliação',
      beFirstToReview: 'Seja o primeiro a avaliar este serviço e ajude outros usuários!',
      submitSuccess: 'Avaliação enviada com sucesso!',
      updateSuccess: 'Avaliação atualizada com sucesso!',
    },
    map: {
      loading: 'Carregando mapa...',
      locationError: 'Erro ao obter localização',
    },
    forms: {
      selectType: 'Selecione o tipo',
      selectServices: 'Selecione os serviços oferecidos',
      selectServicesTitle: 'Selecione os Serviços',
      selectTypeTitle: 'Selecione o Tipo',
      selectLocation: 'Selecione uma Localização',
      selectLocationMessage: 'Por favor, toque no mapa para selecionar uma localização.',
      locationNotAvailable: 'Não foi possível obter sua localização atual. Selecione manualmente no mapa.',
      officeAddress: 'Endereço do consultório ou clínica',
      professionalDescription: 'Médico, enfermeiro ou outro profissional de saúde',
      institutionDescription: 'Hospital, clínica, laboratório ou farmácia',
      userDescription: 'Pesquise e encontre serviços de saúde na sua região',
      institutionInfo: 'Informações da Instituição',
      professionalInfo: 'Informações Profissionais',
      institutionType: 'Tipo de Instituição',
      availableServices: 'Serviços Disponíveis',
      exactLocation: 'Localização Exata',
      gettingCoordinates: 'Obtendo coordenadas...',
      close: 'Fechar',
      specialty: 'Especialidade',
      licenseNumber: 'Número da Licença',
      yearsPlaceholder: 'Ex: 5',
      descriptionPlaceholder: 'Descreva seus serviços...',
      address: 'Endereço',
      descriptionBiography: 'Descrição/Biografia',
      coordinatesCaptured: 'Coordenadas Capturadas',
      useGPS: 'Usar GPS',
      institutionName: 'Nome da Instituição',
      institutionDescriptionForm: 'Descrição da Instituição',
      servicesSelected: 'serviço(s) selecionado(s)',
      street: 'Rua',
      city: 'Cidade',
      streetPlaceholder: 'Rua, número',
      cityPlaceholder: 'Cidade',
      institutionDescriptionPlaceholder: 'Descreva a instituição e seus serviços...',
      yearsOfExperience: 'Anos de Experiência',
      specialtyPlaceholder: 'Ex: Cardiologia, Pediatria...',
      licenseNumberPlaceholder: 'Número do registro profissional',
      province: 'Província',
      provincePlaceholder: 'Província',
      exactInstitutionLocation: 'Localização Exata da Instituição',
      selectInstitutionLocation: 'Selecionar Localização da Instituição',
    },
    ratings: {
      veryBad: 'Muito ruim',
      bad: 'Ruim',
      regular: 'Regular',
      good: 'Bom',
      excellent: 'Excelente',
      yourRating: 'Sua avaliação:',
      editReview: 'Editar Avaliação',
      rateService: 'Avaliar Serviço',
      experiencePrompt: 'Como foi sua experiência com este serviço?',
      editPrompt: 'Edite sua avaliação sobre este serviço',
    },
    tabs: {
      professionals: 'Profissionais',
      institutions: 'Instituições',
      more: 'Mais',
    },
    directions: {
      title: 'Direções',
      show: 'Ver',
      hide: 'Ocultar',
    },
    company: {
      developer: 'Health App Team',
    },
    medicalServices: {
      emergency: 'Emergência',
      surgery: 'Cirurgia',
      pediatrics: 'Pediatria',
      cardiology: 'Cardiologia',
      consultations: 'Consultas',
      exams: 'Exames',
      vaccination: 'Vacinação',
      checkup: 'Check-up',
      laboratory: 'Laboratório',
      radiology: 'Radiologia',
      physiotherapy: 'Fisioterapia',
      nutrition: 'Nutrição',
      psychology: 'Psicologia',
      gynecology: 'Ginecologia',
      urology: 'Urologia',
      dermatology: 'Dermatologia',
      ophthalmology: 'Oftalmologia',
      orthopedics: 'Ortopedia',
      neurology: 'Neurologia',
      oncology: 'Oncologia',
      pharmacy: 'Farmácia',
      hospitalization: 'Internação',
      icu: 'UTI',
      maternity: 'Maternidade',
    },
    settings: {
      language: 'Idioma',
      selectLanguage: 'Selecionar Idioma',
      guestLanguageNote: 'A preferência de idioma será salva para sua próxima visita',
      languageChanged: 'Idioma alterado com sucesso',
    }
  }
};

// Configuração do i18n
const i18n = new I18n(translations);

// Configuração de fallback
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

/**
 * Obtém o idioma do dispositivo
 */
export const getDeviceLanguage = (): string => {
  try {
    const locales = getLocales();
    const deviceLanguage = locales[0]?.languageCode || 'en';
    
    // Verificar se o idioma do dispositivo está disponível
    return translations[deviceLanguage as keyof typeof translations] ? deviceLanguage : 'en';
  } catch (error) {
    console.warn('Erro ao detectar idioma do dispositivo:', error);
    return 'en';
  }
};

/**
 * Salva a preferência de idioma do usuário
 */
export const saveUserLanguagePreference = async (language: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_PREFERENCE_KEY, language);
  } catch (error) {
    console.warn('Erro ao salvar preferência de idioma:', error);
  }
};

/**
 * Obtém a preferência de idioma do usuário
 */
export const getUserLanguagePreference = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY);
  } catch (error) {
    console.warn('Erro ao carregar preferência de idioma:', error);
    return null;
  }
};

/**
 * Remove as preferências de idioma
 */
export const clearLanguagePreferences = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(LANGUAGE_PREFERENCE_KEY);
  } catch (error) {
    console.warn('Erro ao limpar preferências de idioma:', error);
  }
};

/**
 * Determina qual idioma usar baseado na seguinte prioridade:
 * 1. Preferência do usuário autenticado
 * 2. Preferência salva localmente (para guests que já escolheram)
 * 3. Idioma do sistema operativo
 * 4. Idioma padrão (en)
 */
export const determineLanguage = async (isGuest: boolean = false, userPreferredLanguage?: string): Promise<string> => {
  try {
    // 1. Se o usuário autenticado tem preferência definida nas configurações, usar ela
    if (!isGuest && userPreferredLanguage) {
      return userPreferredLanguage;
    }
    
    // 2. Verificar se há preferência salva localmente (para guests ou backup)
    const savedLanguage = await getUserLanguagePreference();
    if (savedLanguage && translations[savedLanguage as keyof typeof translations]) {
      return savedLanguage;
    }
    
    // 3. Para usuários sem preferência definida, usar idioma do sistema
    const deviceLanguage = getDeviceLanguage();
    
    return deviceLanguage;
  } catch (error) {
    console.warn('Erro ao determinar idioma:', error);
    return 'en'; // Fallback final
  }
};

/**
 * Configura o idioma do i18n
 */
export const setLanguage = (language: string): void => {
  i18n.locale = language;
};

/**
 * Obtém os idiomas disponíveis
 */
export const getAvailableLanguages = () => {
  return [
    { code: 'pt', name: 'Português', nativeName: 'Português' },
    { code: 'en', name: 'English', nativeName: 'English' }
  ];
};

// Inicialização com idioma padrão
setLanguage('en');

export default i18n;
