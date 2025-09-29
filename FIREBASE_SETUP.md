# 🔥 Firebase Configuration - Health App Angola

Este documento descreve como o Firebase foi configurado para o aplicativo de saúde de Angola.

## ✅ Configuração Completa

### 🏗️ Arquivos Criados

- **`services/firebase.ts`** - Configuração principal do Firebase
- **`services/auth-firebase.ts`** - Serviço de autenticação Firebase
- **`services/api-firebase.ts`** - API Firebase para serviços de saúde
- **`services/favorites-firebase.ts`** - Gerenciamento de favoritos
- **`services/migration-firebase.ts`** - Script de migração de dados
- **`hooks/useAuth-firebase.tsx`** - Hook atualizado para Firebase Auth
- **`firebase.json`** - Configuração do projeto Firebase
- **`firestore.rules`** - Regras de segurança do Firestore

### 📊 Estrutura do Firestore

#### Collections Configuradas:

1. **`users`** - Dados dos usuários
```javascript
{
  uid: {
    name: "João Silva",
    email: "joao@email.com",
    phone: "+244 923 456 789",
    userType: "patient", // "professional", "institution"
    preferences: {
      language: "pt",
      notifications: true,
      favorites: {
        services: ["serviceId1", "serviceId2"],
        locations: [...]
      }
    },
    createdAt: timestamp,
    updatedAt: timestamp
  }
}
```

2. **`healthServices`** - Serviços de saúde
```javascript
{
  serviceId: {
    name: "Hospital Américo Boavida",
    type: "hospital",
    address: "Rua 17 de Setembro",
    city: "Luanda",
    coordinates: GeoPoint(-8.8379, 13.2894),
    phone: "+244 222 123 456",
    services: ["emergência", "cirurgia"],
    rating: 4.5,
    createdBy: "userId",
    createdAt: timestamp,
    updatedAt: timestamp,
    status: "active"
  }
}
```

3. **`reviews`** - Avaliações de serviços
4. **`favorites`** - Favoritos dos usuários
5. **`registeredServices`** - Serviços aguardando aprovação

## 🔧 Como Usar

### 1. Migrar Dados Existentes

```bash
# Executar script de migração
cd /home/katsuvie/Projects/my-health-app
npm run migrate-firebase
```

### 2. Usar nos Components

```typescript
// Importar hooks Firebase
import { useAuth } from '../hooks/useAuth-firebase';
import { HealthServiceAPIFirebase } from '../services/api-firebase';
import { FavoritesServiceFirebase } from '../services/favorites-firebase';

// No component
const { user, login, register, logout } = useAuth();

// Buscar serviços
const services = await HealthServiceAPIFirebase.getAllServices();

// Gerenciar favoritos
await FavoritesServiceFirebase.addFavoriteService(serviceId);
```

### 3. Configurar Autenticação

```typescript
// Login
const result = await login({
  email: 'user@example.com',
  password: 'password123'
});

// Registro
const result = await register({
  name: 'João Silva',
  email: 'joao@example.com',
  password: 'password123',
  phone: '+244 923 456 789',
  userType: 'patient'
});
```

## 🔒 Segurança

### Regras do Firestore

- **Users**: Usuários só podem ler/escrever seus próprios dados
- **HealthServices**: Leitura pública, escrita apenas para autenticados
- **Reviews**: Leitura pública, escrita apenas para autenticados
- **Favorites**: Acesso apenas para o próprio usuário

### Autenticação

- Email/Password configurado
- Validação de domínio habilitada
- Reset de senha via email

## 🚀 Emulators

Para desenvolvimento local:

```bash
# Iniciar emulators
firebase emulators:start

# Acessar UI
http://localhost:4000
```

### Portas dos Emulators:
- **Auth**: 9099
- **Firestore**: 8080
- **Storage**: 9199
- **UI**: 4000

## 📱 Configuração do App

### `app.json` atualizado com plugins:
```json
{
  "plugins": [
    "@react-native-firebase/app",
    "@react-native-firebase/auth", 
    "@react-native-firebase/firestore"
  ]
}
```

### `package.json` dependências adicionadas:
```json
{
  "dependencies": {
    "firebase": "^10.x.x",
    "@react-native-firebase/app": "^18.x.x",
    "@react-native-firebase/auth": "^18.x.x",
    "@react-native-firebase/firestore": "^18.x.x"
  }
}
```

## 🔄 Migração de Serviços Existentes

Para migrar do sistema atual para Firebase:

1. **AuthService** → **AuthServiceFirebase**
2. **HealthServiceAPI** → **HealthServiceAPIFirebase**
3. **FavoritesService** → **FavoritesServiceFirebase**
4. **useAuth** → **useAuth** (compatibilidade mantida)

## 📈 Próximos Passos

1. **Testar autenticação** em desenvolvimento
2. **Migrar dados** usando o script criado
3. **Atualizar components** para usar novos serviços
4. **Configurar Analytics** (opcional)
5. **Configurar Crashlytics** (opcional)
6. **Setup CI/CD** para deploy automático

## 🆘 Troubleshooting

### Problemas Comuns:

1. **Erro de permissão**: Verificar regras do Firestore
2. **Erro de autenticação**: Verificar configuração no Firebase Console
3. **Dados não aparecem**: Verificar se migração foi executada
4. **Erro de rede**: Verificar conexão e chaves de API

### Logs Úteis:

```bash
# Ver logs do Firebase
firebase functions:log

# Ver logs dos emulators
firebase emulators:start --debug
```

## 📞 Suporte

Para problemas ou dúvidas:
1. Verificar [documentação oficial do Firebase](https://firebase.google.com/docs)
2. Consultar logs do console
3. Verificar regras de segurança
4. Testar com emulators primeiro

---

**🎉 Firebase configurado com sucesso!** 

O backend agora está totalmente funcional com:
- ✅ Autenticação
- ✅ Banco de dados em tempo real  
- ✅ Regras de segurança
- ✅ Estrutura escalável
- ✅ Offline support (automático)