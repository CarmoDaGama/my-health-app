# 🔍 Sistema de Pesquisa no Mapa OpenStreetMap

## ✅ Recurso de Pesquisa Implementado

O LocationPicker agora inclui um **campo de pesquisa integrado** que permite aos usuários pesquisar localizações diretamente no mapa OpenStreetMap.

### 🎯 **Funcionalidades da Pesquisa:**

#### **1. Campo de Pesquisa Inteligente**
- Campo de texto com ícone de pesquisa 🔍
- Placeholder: "Pesquisar localização (ex: Rua da Missão, Luanda)"
- **Pesquisa automática** com debounce de 500ms
- Loading indicator durante pesquisa
- Botão limpar (✕) quando há texto

#### **2. Integração com Nominatim API**
- Usa a **API gratuita do OpenStreetMap Nominatim**
- Filtra resultados para Angola (`countrycodes=ao`)
- Limitado a 5 resultados mais relevantes
- Mostra tipo de local e porcentagem de relevância

#### **3. Resultados Interativos**
- Lista suspensa com resultados da pesquisa
- Cada resultado mostra:
  - **Nome completo** da localização
  - **Tipo** (rua, bairro, cidade, etc.)
  - **Porcentagem de relevância**
- Toque para selecionar resultado

#### **4. Seleção Automática**
- Clique em resultado **centraliza o mapa** automaticamente
- **Adiciona marcador azul** temporariamente (pesquisa)
- **Converte para marcador vermelho** quando confirmado
- **Faz reverse geocoding** para obter endereço completo
- **Limpa pesquisa** automaticamente após seleção

### 🎨 **Interface do Usuário:**

```
┌─────────────────────────────────────┐
│ ✕ Selecionar Localização           │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │🔍 Pesquisar localização...     ✕│ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │ ← Resultados
│ │📍 Rua da Missão, Luanda        │ │   da pesquisa
│ │   rua • 85% relevância          │ │
│ ├─────────────────────────────────┤ │
│ │🏢 Hospital Militar, Luanda     │ │
│ │   hospital • 78% relevância     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │         MAPA OPENSTREETMAP      │ │ ← Mapa real
│ │  ═══════════════════════════    │ │
│ │  ║                         ║    │ │
│ │  ║      🔵 → 📍           ║    │ │ ← Marcador muda
│ │  ║   PESQUISA → SELEÇÃO    ║    │ │   de azul para
│ │  ║                         ║    │ │   vermelho
│ │  ═══════════════════════════    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 🔧 **Fluxo Técnico:**

#### **1. Pesquisa com Debounce:**
```typescript
// Debounce automático de 500ms
useEffect(() => {
  const timeoutId = setTimeout(() => {
    if (searchQuery.trim().length >= 3) {
      searchLocation(searchQuery);
    }
  }, 500);
  return () => clearTimeout(timeoutId);
}, [searchQuery]);
```

#### **2. API Nominatim:**
```typescript
const response = await fetch(
  `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=5&addressdetails=1&countrycodes=ao`,
  {
    headers: {
      'User-Agent': 'HealthApp/1.0 (Angola Health Services Locator)',
    },
  }
);
```

#### **3. Seleção e Marcação:**
```typescript
const selectSearchResult = (result) => {
  // 1. Centralizar mapa
  centerMapOnLocation(coordinates);
  
  // 2. Adicionar marcador via WebView
  const script = `
    centerMap(${lat}, ${lng}, 16);
    setTimeout(() => {
      addSelectionMarker(${lat}, ${lng});
    }, 500);
  `;
  webViewRef.current.postMessage(script);
  
  // 3. Processar coordenadas
  handleMapPress(coordinates);
  
  // 4. Limpar pesquisa
  setSearchQuery('');
  setShowSearchResults(false);
  Keyboard.dismiss();
};
```

### 🎮 **Fluxo de Uso Completo:**

1. **Usuário abre modal** do LocationPicker
2. **Digita no campo de pesquisa** (ex: "Rua da Missão")
3. **Sistema pesquisa automaticamente** após 500ms
4. **Resultados aparecem** em lista suspensa
5. **Usuário clica em resultado** desejado
6. **Mapa centraliza** na localização encontrada
7. **Marcador azul aparece** (resultado da pesquisa)
8. **Marcador vira vermelho** (seleção confirmada)
9. **Reverse geocoding** obtém endereço completo
10. **Usuário confirma** e coordenadas são salvas

### 🌟 **Vantagens do Sistema:**

- ✅ **Pesquisa rápida** sem sair do modal
- ✅ **Resultados relevantes** filtrados para Angola
- ✅ **Interface intuitiva** com feedback visual
- ✅ **Integração perfeita** com mapa real
- ✅ **Marcadores diferenciados** (pesquisa vs seleção)
- ✅ **Limpeza automática** da interface
- ✅ **Debounce inteligente** para performance
- ✅ **Feedback de loading** durante pesquisa
- ✅ **Tratamento de erro** com mensagens amigáveis

### 🔄 **Estados da Interface:**

1. **Estado Inicial**: Campo vazio, sem resultados
2. **Estado Digitando**: Usuário digitando (< 3 caracteres)
3. **Estado Pesquisando**: Loading indicator ativo
4. **Estado com Resultados**: Lista suspensa com opções
5. **Estado sem Resultados**: Mensagem "Nenhum resultado encontrado"
6. **Estado Selecionado**: Resultado escolhido, pesquisa limpa

## 🎉 **Sistema de Pesquisa Completo!**

Agora os usuários podem:
- ✅ **Pesquisar por nome** de ruas, bairros, hospitais
- ✅ **Ver resultados em tempo real** com relevância
- ✅ **Selecionar com um clique** da lista
- ✅ **Ver localização centralizada** no mapa
- ✅ **Confirmar coordenadas exatas** visualmente
- ✅ **Ter experiência fluida** entre pesquisa e seleção

**🚀 Pesquisa integrada ao mapa real implementada com sucesso!**