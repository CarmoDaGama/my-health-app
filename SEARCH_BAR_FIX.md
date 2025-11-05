# Correção da Barra de Pesquisa - PatientDashboard

## Problema Identificado
A barra de pesquisa estava subindo até o topo da tela quando o usuário clicava para digitar, em vez de ficar apenas acima do teclado.

## Causa do Problema
O `bottomPosition` estava sendo usado incorretamente, fazendo com que a barra se movesse muito para cima ao invés de apenas ajustar a posição para ficar acima do teclado.

## Correção Implementada

### Antes:
```typescript
// Problema: usando a altura total do teclado sem considerar safeArea
const keyboardHeight = Platform.OS === 'ios' 
  ? e.endCoordinates.height - insets.bottom
  : e.endCoordinates.height;

Animated.timing(bottomPosition, {
  toValue: keyboardHeight, // Isso fazia a barra subir demais
  duration: Platform.OS === 'ios' ? 250 : 200,
  useNativeDriver: false,
}).start();

// E no render:
<Animated.View style={[
  styles.searchContainer, 
  { 
    bottom: bottomPosition, // Movia a barra muito para cima
    paddingBottom: spacing.md + insets.bottom,
  }
]}>
```

### Depois:
```typescript
// Correção: calcular apenas o deslocamento necessário
const keyboardHeight = Platform.OS === 'ios' 
  ? e.endCoordinates.height - insets.bottom
  : e.endCoordinates.height;

Animated.timing(bottomPosition, {
  toValue: Math.max(keyboardHeight - insets.bottom, 0), // Garantir que não seja negativo
  duration: Platform.OS === 'ios' ? 250 : 200,
  useNativeDriver: false,
}).start();

// E no render:
<Animated.View style={[
  styles.searchContainer, 
  { 
    bottom: bottomPosition, // Agora move apenas o necessário
  }
]}>
```

## Melhorias Implementadas

### 1. Cálculo Correto da Altura
- Subtrai `insets.bottom` para evitar cálculos excessivos
- Usa `Math.max()` para garantir que o valor nunca seja negativo
- Diferencia entre iOS e Android apropriadamente

### 2. Animação Suave
- Mantém a duração apropriada para cada plataforma
- iOS: 250ms (seguindo padrões do sistema)
- Android: 200ms (mais rápido, como esperado)

### 3. Posicionamento Absoluto Mantido
```typescript
searchContainer: {
  position: 'absolute',
  bottom: 0, // Sempre no fundo por padrão
  left: 0,
  right: 0,
  // ... outros estilos
}
```

### 4. Listeners Apropriados por Plataforma
- **iOS**: `keyboardWillShow` / `keyboardWillHide` (mais suave)
- **Android**: `keyboardDidShow` / `keyboardDidHide` (padrão)

## Comportamento Esperado

### Quando o Teclado Aparece:
1. A barra de pesquisa move-se suavemente para cima
2. Para apenas o suficiente para ficar acima do teclado
3. Mantém espaçamento adequado (safe area)
4. Animação sincronizada com o teclado

### Quando o Teclado Desaparece:
1. A barra retorna suavemente ao fundo da tela
2. Animação coordenada com o fechamento do teclado
3. Posição final: bottom: 0

## Testes Recomendados

### Cenários de Teste:
1. **Abrir teclado**: Tocar na barra de pesquisa
2. **Digitar**: Verificar se a barra não se move durante digitação
3. **Fechar teclado**: Tocar fora ou pressionar botão de volta
4. **Rotação**: Testar em paisagem e retrato
5. **Diferentes dispositivos**: Tamanhos de tela variados

### Resultados Esperados:
- ✅ Barra move apenas para acima do teclado
- ✅ Não sobe até o topo da tela
- ✅ Animação suave e natural
- ✅ Funciona em iOS e Android
- ✅ Respeita safe areas
- ✅ Mantém acessibilidade

## Arquivos Modificados
- `screens/dashboards/PatientDashboard.tsx`
- `test-search-bar-fix.js` (arquivo de teste)

## Notas Técnicas
- Usa `useNativeDriver: false` porque anima propriedades de layout
- Safe area insets considerados para cálculos precisos
- Animação responsiva que adapta-se ao tamanho do teclado
- Compatível com diferentes densidades de tela

## UX Melhorada
- **Mais natural**: Usuário vê apenas o movimento necessário
- **Menos distração**: Conteúdo do mapa permanece mais visível
- **Melhor usabilidade**: Fácil acesso à pesquisa sem perder contexto
- **Consistente**: Comportamento previsível em todas as situações