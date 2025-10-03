# Sistema de Seleção de Idioma - Documentação

## Resumo da Implementação

O sistema de seleção de idioma foi implementado para detectar automaticamente o idioma do sistema operativo do dispositivo. Os usuários podem alterar manualmente o idioma através das configurações de perfil.

## Recursos Implementados

### 1. Detecção Automática de Idioma
- **Prioridade 1**: Preferência manual definida pelo usuário autenticado
- **Prioridade 2**: Idioma do sistema operativo do dispositivo (automático)
- **Prioridade 3**: Inglês como idioma padrão

### 2. Componente LanguageSelector
- Interface visual para seleção de idioma nas configurações
- Disponível apenas para usuários autenticados
- Salva automaticamente a preferência selecionada

### 3. Persistência de Preferências
- **Usuários autenticados**: Salvo no perfil do usuário + AsyncStorage local
- **Detecção automática**: Sempre usa idioma do sistema quando não há preferência manual

### 4. Integração com Interface
- **Tela de Perfil**: Seção de idioma para usuários autenticados
- **Inicialização automática**: Sistema detecta e aplica idioma do sistema na inicialização
- **Sem interferência**: Usuários convidados sempre usam idioma do sistema automaticamente

## Arquivos Modificados

### Core do Sistema
- `utils/i18n.ts` - Sistema de internacionalização com nova lógica de fallback
- `hooks/useTranslation.ts` - Hook atualizado com inicialização automática
- `hooks/usePreferences.ts` - Integração com novo sistema de idiomas
- `hooks/useAuth-firebase.tsx` - Limpeza de preferências no logout

### Novo Componente
- `components/common/LanguageSelector.tsx` - Componente visual para seleção

### Provider
- `hooks/LanguageProvider.tsx` - Provider para inicialização automática do idioma

### Interface
- `screens/WelcomeScreen.tsx` - Removido seletor, detecção automática
- `screens/ProfileScreen.tsx` - Seletor apenas para usuários autenticados
- `components/index.ts` - Export do componente

### Traduções
- Adicionadas traduções para configurações de idioma em PT e EN

## Como Funciona

### 1. Inicialização
1. App inicia com o `LanguageProvider`
2. Sistema detecta idioma do sistema operativo automaticamente
3. Se usuário autenticado tem preferência salva, usa ela
4. Caso contrário, aplica idioma detectado do sistema

### 2. Seleção Manual (Apenas Usuários Autenticados)
1. Usuário autenticado acessa configurações de perfil
2. Seleciona idioma preferido no LanguageSelector
3. Preferência é salva no perfil e localmente
4. Interface atualiza imediatamente

### 3. Persistência
- **Usuários autenticados**: Preferência sincronizada entre dispositivos
- **Usuários convidados**: Sempre usam detecção automática do sistema
- **Logout**: Preferências mantidas para próximo login

## Uso do Componente

### Exemplo para Usuário Autenticado
```tsx
<LanguageSelector 
  isGuest={false}
  showTitle={true}
  onLanguageChange={(language) => {
    console.log('Idioma alterado para:', language);
  }}
/>
```

## Funções Utilitárias Disponíveis

### Detecção e Configuração
- `getDeviceLanguage()` - Obtém idioma do dispositivo automaticamente
- `determineLanguage(isGuest, userPreferredLanguage)` - Determina idioma a usar
- `setLanguage(language)` - Configura idioma no i18n

### Persistência
- `saveUserLanguagePreference(language)` - Salva preferência do usuário autenticado
- `clearLanguagePreferences()` - Limpa preferências salvas

### Informações
- `getAvailableLanguages()` - Lista idiomas disponíveis

## Vantagens da Implementação

1. **UX Intuitiva**: Sistema detecta automaticamente o idioma do dispositivo
2. **Simplicidade**: Usuários convidados não precisam configurar nada
3. **Flexibilidade**: Usuários autenticados podem personalizar quando necessário
4. **Performance**: Detecção automática sem intervenção do usuário
5. **Manutenibilidade**: Código simplificado e direto

## Próximos Passos Possíveis

1. **Novos Idiomas**: Adicionar mais idiomas (ES, FR, etc.)
2. **Formato Regional**: Detectar formato de data/moeda por região automaticamente
3. **Configurações Avançadas**: Permitir override manual da detecção automática
4. **Analytics**: Tracking de distribuição de idiomas por região
5. **Testes**: Adicionar testes unitários e de integração

## Comportamento Atual

### Usuários Convidados
- ✅ **Detecção automática** do idioma do sistema operativo
- ✅ **Sem configuração necessária** - funciona imediatamente
- ✅ **Português**: Se sistema em português
- ✅ **Inglês**: Se sistema em qualquer outro idioma

### Usuários Autenticados
- ✅ **Detecção automática** por padrão
- ✅ **Configuração manual** disponível no perfil
- ✅ **Sincronização** entre dispositivos
- ✅ **Persistência** da escolha manual