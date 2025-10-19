# Localizador de Serviços de Saúde

Um aplicativo móvel multiplataforma para localizar serviços de saúde próximos, desenvolvido com React Native Expo.

## 🎯 Funcionalidades

### Para Usuários
- **Localização de serviços de saúde próximos** usando GPS
- **Visualização em mapa interativo** com OpenStreetMap
- **Lista de serviços** com informações detalhadas
- **Busca por nome ou tipo** de serviço
- **Detalhes completos** de cada serviço
- **Direções** integradas com aplicativo de mapas
- **Ligação direta** para os serviços
- **Suporte multilíngue** (Português e Inglês)
- **Sistema de avaliações** e comentários
- **Favoritos** para acesso rápido

### Para Profissionais de Saúde
- **Registro de serviços** (hospitais, clínicas, farmácias)
- **Submissão para aprovação** por administradores
- **Status de aprovação** em tempo real

### Para Administradores ⭐ NOVO!
- **Dashboard administrativo** com estatísticas
- **Aprovação de profissionais** aguardando cadastro
- **Rejeição com motivo** personalizado
- **Gerenciamento de roles** (Super Admin, Admin, Moderador)
- **Logs de ações** administrativas
- **Interface moderna** e intuitiva

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
- **Firebase** - Backend as a Service
  - Authentication - Autenticação de usuários
  - Firestore - Banco de dados NoSQL
  - Storage - Armazenamento de arquivos
- **OpenStreetMap** - Mapas de código aberto
- **Leaflet** - Biblioteca de mapas interativos
- **Expo Location** - Serviços de geolocalização
- **i18n-js** - Internacionalização

## 🗂️ Estrutura do Projeto

```
my-health-app/
├── components/           # Componentes reutilizáveis
│   ├── common/          # Componentes genéricos
│   ├── specific/        # Componentes específicos
│   └── auth/            # Componentes de autenticação
├── constants/           # Constantes (cores, dimensões)
├── data/               # Dados mockados
├── hooks/              # Custom hooks
├── navigation/         # Configuração de navegação
├── screens/            # Telas da aplicação
│   ├── Admin*.tsx      # Telas administrativas ⭐
│   └── ...             # Outras telas
├── services/           # Serviços e APIs
│   ├── *-client.ts     # Serviços client-side ⭐
│   ├── *-firebase.ts   # Integração Firebase
│   └── ...             # Outros serviços
├── scripts/            # Scripts administrativos ⭐
├── types/              # Definições de tipos TypeScript
├── utils/              # Utilitários e configurações
├── firestore.rules     # Regras de segurança Firestore
└── 📚 Documentação/    # Guias e documentos ⭐
```

⭐ = Novo na Fase 2 (Sistema Administrativo)

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

## 🎓 Sistema Administrativo

Este projeto inclui um **sistema completo de aprovação de profissionais** implementado sem custos adicionais (Firebase Spark Plan).

### 📖 Documentação

- **[QUICKSTART.md](./QUICKSTART.md)** - Guia rápido (5 minutos)
- **[CLIENT_SIDE_IMPLEMENTATION.md](./CLIENT_SIDE_IMPLEMENTATION.md)** - Documentação técnica completa
- **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Índice de toda a documentação

### ⚡ Quick Start

```bash
# 1. Instalar Firebase Admin SDK
npm install firebase-admin

# 2. Configurar primeiro Super Admin
node scripts/set-super-admin.js set seu-email@exemplo.com

# 3. Ver documentação completa
cat QUICKSTART.md
```

### ✨ Features Administrativas

- ✅ Dashboard com estatísticas
- ✅ Aprovar/rejeitar profissionais
- ✅ Gerenciar roles de admin
- ✅ Logs de ações administrativas
- ✅ Interface moderna e responsiva
- ✅ **Custo: R$ 0,00/mês**

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📞 Suporte

Para suporte ou dúvidas, entre em contato através do GitHub Issues.
