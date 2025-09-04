# Proposta de MVP Simplificado para Localizador de Serviços de Saúde

## Introdução

Este documento apresenta uma proposta de Produto Mínimo Viável (MVP) simplificado para um aplicativo de localização de serviços de saúde, com foco em um prazo de desenvolvimento de um mês. A base para esta proposta é o documento 'MVP FEATURE LIST FOR DEVELOPER' fornecido, que descreve as funcionalidades desejadas para o aplicativo. Nosso objetivo é destilar as funcionalidades essenciais para entregar valor rapidamente, mantendo a flexibilidade para futuras expansões. As recomendações de arquitetura serão focadas em React Native Expo, Expo Go e integração com a API do OpenStreetMap, garantindo uma solução multiplataforma e multilíngue (Português e Inglês).



## Funcionalidades do MVP Simplificado (Prazo de 1 Mês)

Para o MVP, focaremos nas funcionalidades mais críticas que entregam o valor central do aplicativo: a localização e visualização de serviços de saúde.

### 1. Localização e Visualização de Serviços de Saúde

*   **Descoberta Geo-localizada:** O aplicativo detectará a localização do usuário (com permissão) e exibirá serviços de saúde próximos. Esta será a funcionalidade principal, inspirada no conceito de localizador de caixas eletrônicos.
*   **Visualização em Mapa:** Os serviços de saúde serão exibidos em um mapa interativo, utilizando a API do OpenStreetMap. O usuário poderá navegar pelo mapa, dar zoom e pan para explorar diferentes áreas.
*   **Lista de Serviços Próximos:** Além da visualização no mapa, uma lista dos serviços de saúde mais próximos será apresentada, permitindo uma visão rápida e fácil acesso aos detalhes.
*   **Detalhes Básicos do Serviço:** Ao selecionar um ponto no mapa ou um item na lista, o usuário poderá visualizar detalhes essenciais do serviço, como nome, endereço e tipo de instituição (hospital, clínica, farmácia, etc.).

### 2. Pesquisa Simplificada

*   **Barra de Pesquisa:** Uma barra de pesquisa simples permitirá que o usuário procure por serviços de saúde por nome ou tipo (ex: "hospital", "farmácia"). Para o MVP, os filtros avançados serão limitados ou omitidos, focando na funcionalidade básica de busca.

### 3. Suporte Multi-idioma (Inglês e Português)

*   **Internacionalização (i18n):** O aplicativo será desenvolvido com suporte para múltiplos idiomas desde o início, permitindo que o usuário alterne entre Português e Inglês. Isso será implementado usando bibliotecas de i18n compatíveis com React Native.

### Funcionalidades Excluídas do MVP (para futuras fases)

Para manter o escopo do MVP em um mês, as seguintes funcionalidades, embora importantes, serão adiadas para fases futuras:

*   **Contas de Usuário e Perfis:** A gestão de diferentes tipos de contas (Paciente, Profissional, Instituição) e seus respectivos perfis será implementada em fases posteriores. O MVP funcionará sem a necessidade de login, focando na acessibilidade imediata.
*   **Avaliações e Comentários:** O sistema de classificação e revisão de serviços será uma adição valiosa, mas não essencial para a primeira versão do MVP.
*   **Monetização:** Publicidade e opções de visibilidade paga serão consideradas após a validação do conceito principal do aplicativo.
*   **Itinerário/Navegação:** Embora o documento original mencione itinerário, para o MVP, a integração direta com um sistema de navegação (como Google Maps ou Waze) será feita através de um link externo, em vez de uma funcionalidade de navegação interna completa. Isso simplifica a implementação inicial.

Esta abordagem garante que o MVP seja entregue dentro do prazo de um mês, fornecendo uma base sólida para futuras iterações e a adição de funcionalidades mais complexas.



## Recomendações de Arquitetura Técnica

### 1. Plataforma de Desenvolvimento: React Native Expo e Expo Go

**React Native Expo** é a escolha ideal para o desenvolvimento rápido de aplicativos móveis multiplataforma (iOS e Android) a partir de uma única base de código JavaScript/TypeScript. A plataforma Expo simplifica significativamente o processo de desenvolvimento, abstraindo muitas das complexidades da configuração nativa.

*   **Vantagens:**
    *   **Desenvolvimento Rápido:** Componentes pré-construídos e APIs simplificadas aceleram o desenvolvimento.
    *   **Multiplataforma:** Um único código-base para iOS e Android, reduzindo o tempo e custo de desenvolvimento.
    *   **Ecossistema Rico:** Acesso a uma vasta gama de bibliotecas e ferramentas da comunidade React Native.
    *   **Hot Reloading e Fast Refresh:** Permite ver as mudanças no código instantaneamente, agilizando a depuração e o desenvolvimento.

**Expo Go** é um aplicativo cliente que permite testar o aplicativo em dispositivos físicos (iOS e Android) sem a necessidade de compilar o código nativo ou usar emuladores/simuladores. Isso é crucial para o ciclo de desenvolvimento rápido do MVP.

*   **Vantagens:**
    *   **Testes Simplificados:** Facilita o teste em tempo real em dispositivos reais, o que é essencial para funcionalidades baseadas em localização e mapa.
    *   **Compartilhamento Fácil:** Permite compartilhar o progresso com stakeholders e testadores de forma rápida, apenas enviando um link ou QR code.

### 2. Gerenciamento de Estado

Para um MVP, o gerenciamento de estado pode ser simples. Recomenda-se o uso do **React Context API** ou de uma biblioteca leve como **Zustand** ou **Jotai**. Para o escopo do MVP, que não envolve um estado global complexo (como autenticação de usuário ou dados de perfil), o Context API do React pode ser suficiente para gerenciar a localização do usuário e os dados dos serviços de saúde exibidos no mapa.

### 3. API de Mapas: OpenStreetMap (OSM) e Bibliotecas React Native

O **OpenStreetMap (OSM)** é uma excelente alternativa de código aberto ao Google Maps, oferecendo dados de mapas detalhados e personalizáveis. Para integrar o OSM em um aplicativo React Native, a biblioteca **`react-native-maps`** é a escolha padrão para componentes de mapa nativos. No entanto, se a flexibilidade de uma biblioteca web for preferida, **Leaflet.js** pode ser integrado através de um `WebView` no React Native. Embora `react-native-maps` suporte Google Maps e Apple Maps nativamente, ele pode ser configurado para usar tiles do OpenStreetMap. Leaflet.js é uma biblioteca JavaScript de código aberto para mapas interativos otimizados para dispositivos móveis, ideal para aplicações web, mas sua integração em React Native requer um `WebView` para renderizar o conteúdo web.

*   **Configuração com OSM:** Para usar o OpenStreetMap com `react-native-maps`, será necessário configurar um provedor de tiles (Tile Server) que sirva os dados do OSM. Existem provedores gratuitos e pagos, ou pode-se hospedar um servidor de tiles próprio. Para o MVP, um provedor de tiles público e gratuito (como o da OpenStreetMap Foundation ou de terceiros) pode ser usado inicialmente para agilizar o desenvolvimento.
*   **Funcionalidades:** A API permitirá:
    *   Exibir o mapa com a localização atual do usuário.
    *   Adicionar marcadores (pins) para os serviços de saúde.
    *   Controlar o zoom e a região visível do mapa.

### 4. Backend e Armazenamento de Dados (Simplificado para MVP)

Para o MVP, a complexidade do backend deve ser minimizada. Considerando o prazo de um mês, as opções incluem:

*   **Dados Estáticos/Mockados:** Para a primeira versão, uma lista de serviços de saúde pode ser mockada diretamente no aplicativo ou carregada de um arquivo JSON local. Isso elimina a necessidade de um backend complexo e um banco de dados na fase inicial.
*   **Firebase Firestore/Realtime Database:** Se houver a necessidade de dados dinâmicos e atualizáveis, o Firebase (especialmente Firestore) oferece uma solução de backend-as-a-service (BaaS) que é rápida de configurar e escalar. Ele pode ser usado para armazenar os dados dos serviços de saúde de forma simples.

Para o MVP, a recomendação é começar com dados mockados ou um arquivo JSON local para os serviços de saúde. Isso permite focar na interface do usuário e na integração com o mapa. A transição para um backend como Firebase pode ser feita em uma fase posterior, se a necessidade de dados dinâmicos se tornar crítica.

### 5. Suporte Multi-idioma (Internacionalização - i18n)

Para implementar o suporte multi-idioma (Português e Inglês), a biblioteca **`react-native-localize`** em conjunto com **`i18n-js`** ou **`react-i18next`** são as opções mais robustas e amplamente utilizadas no ecossistema React Native.

*   **`react-native-localize`:** Ajuda a detectar as preferências de idioma do dispositivo do usuário.
*   **`i18n-js` / `react-i18next`:** Permitem gerenciar as traduções de strings no aplicativo. As traduções serão armazenadas em arquivos JSON separados para cada idioma (ex: `en.json`, `pt.json`).

### 6. Estrutura de Pastas (Exemplo)

Uma estrutura de pastas limpa e organizada é crucial para a manutenibilidade do projeto:

```
my-health-app/
├── assets/
│   ├── images/
│   └── fonts/
├── components/
│   ├── common/
│   └── specific/
├── constants/
│   ├── colors.js
│   ├── dimensions.js
│   └── index.js
├── data/
│   └── healthServices.json  // Dados mockados dos serviços de saúde
├── hooks/
├── navigation/
│   └── AppNavigator.js
├── screens/
│   ├── HomeScreen.js
│   ├── MapScreen.js
│   └── ServiceDetailScreen.js
├── services/
│   └── api.js  // Futuras chamadas à API
├── utils/
│   └── i18n.js  // Configuração de internacionalização
├── App.js
├── app.json
├── babel.config.js
└── package.json
```

### 7. Considerações de Desempenho e Otimização

*   **Otimização de Imagens:** Usar imagens otimizadas para mobile para reduzir o tamanho do aplicativo e melhorar o tempo de carregamento.
*   **Renderização de Mapas:** Otimizar a renderização de marcadores no mapa, especialmente se houver muitos serviços. Considerar clustering de marcadores para melhorar o desempenho visual.
*   **Testes em Dispositivos Reais:** Priorizar testes em dispositivos físicos usando Expo Go para identificar e resolver problemas de desempenho específicos de hardware.

Esta arquitetura proposta visa um desenvolvimento ágil e eficiente para o MVP, permitindo que o aplicativo seja lançado dentro do prazo de um mês com as funcionalidades essenciais e uma base sólida para futuras expansões.

