# Implementação da Área de Edição de Dados dos Usuários

## Resumo
Foi implementada uma área completa para edição de dados dos usuários já registrados na aplicação, permitindo que usuários normais, profissionais e instituições editem suas informações.

## Funcionalidades Implementadas

### 1. Serviço de Atualização de Perfil (`services/userProfile.ts`)
- **UserProfileService**: Classe responsável por gerenciar atualizações de perfil
- **Métodos principais**:
  - `updateProfile()`: Atualiza dados do usuário com validações
  - `updatePreferences()`: Atualiza apenas preferências do usuário
  - `getProfile()`: Obtém dados do perfil atual
  - `canEditField()`: Verifica permissões de edição para campos específicos

- **Características**:
  - Validações específicas por tipo de usuário
  - Sincronização com serviços de saúde (para profissionais e instituições)
  - Preservação de dados sensíveis (verificação, ratings, etc.)
  - Tratamento de erros robusto

### 2. Formulários de Edição por Tipo de Usuário

#### Usuários Normais (`components/specific/NormalUserForm.tsx`)
- **Campos editáveis**:
  - Nome completo
  - Telefone
  - Data de nascimento
  - Gênero
  - Endereço
  - Contato de emergência (nome, telefone, relacionamento)

- **Validações**:
  - Nome obrigatório
  - Formato de telefone válido
  - Contato de emergência completo (se preenchido)

#### Profissionais (`components/specific/ProfessionalForm.tsx`)
- **Campos editáveis**:
  - Informações básicas (nome, telefone)
  - Especialidade (obrigatória)
  - Número da licença profissional
  - Anos de experiência
  - Biografia/Descrição
  - Certificações
  - Taxa de consulta
  - Aceita seguro (sim/não)
  - Horário de atendimento por dia da semana

- **Validações**:
  - Especialidade obrigatória
  - Experiência não pode ser negativa
  - Taxa de consulta não pode ser negativa

#### Instituições (`components/specific/InstitutionForm.tsx`)
- **Campos editáveis**:
  - Nome da instituição
  - Tipo (hospital, clínica, laboratório, farmácia, outro)
  - Descrição dos serviços
  - Serviços oferecidos
  - Endereço completo (rua, cidade, província, código postal)
  - Informações de contato (telefone, email, website)
  - Aceita seguro (sim/não)
  - Atendimento 24h (sim/não)
  - Horário de funcionamento por dia da semana

- **Validações**:
  - Nome obrigatório
  - Endereço completo obrigatório

### 3. Tela Principal de Edição (`screens/EditProfileScreen.tsx`)
- **Recursos**:
  - Detecção automática do tipo de usuário
  - Renderização do formulário apropriado
  - Feedback visual durante salvamento
  - Tratamento de erros com alertas
  - Navegação automática após salvamento
  - Suporte a múltiplos idiomas

### 4. Integração com Navegação
- **Configurações**:
  - Adicionada rota `EditProfile` ao `AppNavigator`
  - Tipos de navegação atualizados em `types/navigation.ts`
  - Botão "Editar Perfil" adicionado à `ProfileScreen`
  - Proteção de rota para usuários autenticados

### 5. Componentes Atualizados
- **`components/index.ts`**: Exportação dos novos componentes de formulário
- **`ProfileScreen.tsx`**: Botão de navegação para edição
- **Compatibilidade**: Mantida compatibilidade com componentes existentes

## Características Técnicas

### Validações
- **Campos obrigatórios**: Nome, especialidade (profissionais), endereço (instituições)
- **Formatos específicos**: Telefone, email, números
- **Regras de negócio**: Valores não negativos, campos condicionais

### Segurança
- **Campos protegidos**: ID, email, tipo de usuário, data de criação
- **Verificação**: Status de verificação preservado para profissionais/instituições
- **Permissões**: Verificação de permissões antes da edição

### Experiência do Usuário
- **Interface responsiva**: Adaptada para diferentes tamanhos de tela
- **Feedback visual**: Loading states e indicadores de progresso
- **Acessibilidade**: Suporte a leitores de tela e navegação por teclado
- **Internacionalização**: Suporte a português e inglês

### Persistência de Dados
- **AsyncStorage**: Armazenamento local para simulação
- **Sincronização**: Atualização automática de serviços relacionados
- **Consistência**: Manutenção da integridade dos dados

## Como Usar

1. **Acesso**: Usuário logado vai ao perfil e clica em "Editar Perfil"
2. **Edição**: Formulário apropriado é exibido baseado no tipo de usuário
3. **Validação**: Sistema valida dados antes de permitir salvamento
4. **Salvamento**: Dados são atualizados e usuário recebe confirmação
5. **Navegação**: Retorno automático à tela anterior

## Tipos de Usuário Suportados

✅ **Usuários Normais**: Dados pessoais e contato de emergência
✅ **Profissionais**: Informações profissionais e horários de atendimento  
✅ **Instituições**: Dados institucionais e horários de funcionamento

## Campos Não Editáveis (Protegidos)
- Email (usado para login)
- Tipo de usuário
- ID do usuário
- Data de criação
- Status de verificação (profissionais/instituições)
- Rating e número de avaliações

## Melhorias Futuras Sugeridas
- Upload de avatar/foto
- Validação de CPF/CNPJ
- Integração com mapas para coordenadas
- Histórico de alterações
- Verificação por email para mudanças sensíveis
- Backup automático das alterações