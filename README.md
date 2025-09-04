# Localizador de Serviços de Saúde

Um aplicativo móvel multiplataforma para localizar serviços de saúde próximos, desenvolvido com React Native Expo.

## 🎯 Funcionalidades

- **Localização de serviços de saúde próximos** usando GPS
- **Visualização em mapa interativo** com OpenStreetMap
- **Lista de serviços** com informações detalhadas
- **Busca por nome ou tipo** de serviço
- **Detalhes completos** de cada serviço
- **Direções** integradas com aplicativo de mapas
- **Ligação direta** para os serviços
- **Suporte multilíngue** (Português e Inglês)

## 🏥 Tipos de Serviços

- Hospitais
- Clínicas
- Farmácias
- Emergências (UPA)
- Laboratórios

## 🚀 Como executar

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI
- Expo Go (aplicativo no seu celular)

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd health-locator-app
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o projeto:
```bash
npm start
```

4. Use o aplicativo Expo Go para escanear o QR code e testar no seu dispositivo

### Scripts disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run android` - Executa no emulador Android
- `npm run ios` - Executa no simulador iOS (apenas macOS)
- `npm run web` - Executa no navegador

## 📱 Tecnologias Utilizadas

- **React Native** - Framework para desenvolvimento mobile
- **Expo** - Plataforma de desenvolvimento
- **TypeScript** - Linguagem de programação
- **React Navigation** - Navegação entre telas
- **OpenStreetMap** - Mapas de código aberto
- **Leaflet** - Biblioteca de mapas interativos
- **Expo Location** - Serviços de geolocalização
- **i18n-js** - Internacionalização

## 🗂️ Estrutura do Projeto

```
my-health-app/
├── components/           # Componentes reutilizáveis
│   ├── common/          # Componentes genéricos
│   └── specific/        # Componentes específicos
├── constants/           # Constantes (cores, dimensões)
├── data/               # Dados mockados
├── hooks/              # Custom hooks
├── navigation/         # Configuração de navegação
├── screens/            # Telas da aplicação
├── services/           # Serviços e APIs
├── types/              # Definições de tipos TypeScript
└── utils/              # Utilitários e configurações
```

## 🌍 Internacionalização

O aplicativo suporta múltiplos idiomas:

- **Português** (idioma padrão)
- **Inglês**

A detecção do idioma é automática baseada nas configurações do dispositivo.

## 📍 Dados de Exemplo

O aplicativo inclui dados mockados de serviços de saúde em São Paulo para demonstração. Em uma versão de produção, estes dados seriam obtidos de uma API real.

## 🔮 Funcionalidades Futuras

- Sistema de contas de usuário
- Avaliações e comentários
- Filtros avançados
- Notificações
- Integração com APIs de saúde pública
- Modo offline

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📞 Suporte

Para suporte ou dúvidas, entre em contato através do GitHub Issues.
