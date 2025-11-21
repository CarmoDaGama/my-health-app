# 🔧 Fix para Expo Go no Render

## ❌ Problema Identificado
A URL `exp://my-health-app-r6bk.onrender.com` não está funcionando porque:

1. O Expo Go precisa de endpoints específicos (`/manifest`, `/--/manifest`)
2. Estrutura de arquivos precisa seguir padrão Expo
3. Servidor precisa responder como um Expo development server

## ✅ Soluções Implementadas

### 1. Servidor Corrigido
- ✅ Endpoint `/manifest` com manifest completo
- ✅ Endpoint `/--/manifest` alternativo  
- ✅ Endpoint `/status` para Expo Go
- ✅ Estrutura `/_expo/` para assets

### 2. Deploy Atualizado
- ✅ Cópia automática de assets
- ✅ Estrutura de diretórios corrigida
- ✅ Manifest JSON específico

## 🚀 Como Corrigir

### Passo 1: Re-deploy
```bash
# Execute o script atualizado
./scripts/deploy-render.sh

# Commit e push
git add .
git commit -m "Fix Expo Go compatibility"
git push origin master
```

### Passo 2: Teste URLs
Depois do re-deploy, teste estas URLs:

1. **Manifest:** `https://my-health-app-r6bk.onrender.com/manifest`
2. **Health:** `https://my-health-app-r6bk.onrender.com/health`
3. **Status:** `https://my-health-app-r6bk.onrender.com/status`

### Passo 3: Acesso via Expo Go

#### Método 1: QR Code
1. Acesse: `https://my-health-app-r6bk.onrender.com/expo-qr`
2. Escaneie com Expo Go

#### Método 2: URL Manual (Corrigida)
No Expo Go, use:
```
https://my-health-app-r6bk.onrender.com
```
**Não use `exp://`** - use `https://`

#### Método 3: URL de Desenvolvimento
```
exp+my-health-app-r6bk://expo-development-client/?url=https%3A%2F%2Fmy-health-app-r6bk.onrender.com
```

## 🔍 Debug URLs

Teste estes endpoints para verificar se está funcionando:

```bash
# Manifest (principal)
curl https://my-health-app-r6bk.onrender.com/manifest

# Status Expo
curl https://my-health-app-r6bk.onrender.com/status

# Health check
curl https://my-health-app-r6bk.onrender.com/health
```

## 📱 Alternativas se não funcionar

### Opção A: Development Build
```bash
# Gerar APK de desenvolvimento
./scripts/build-development.sh

# Instalar APK diretamente no Android
```

### Opção B: Tunnel Local
```bash
# Em desenvolvimento local
npx expo start --tunnel

# Use a URL gerada no Expo Go
```

### Opção C: Expo Snack
1. Copie o código para https://snack.expo.dev
2. Teste diretamente no Snack
3. Use QR code do Snack

## 🎯 Próximos Passos

1. **Execute:** `./scripts/deploy-render.sh`
2. **Commit:** `git add . && git commit -m "Fix Expo Go" && git push`
3. **Aguarde** re-deploy no Render (5-10 min)
4. **Teste** URLs de debug
5. **Use** `https://` no lugar de `exp://`

## 💡 Dica Importante

**Para Expo Go no Render, use sempre:**
```
https://my-health-app-r6bk.onrender.com
```

**NÃO use:**
```
exp://my-health-app-r6bk.onrender.com
```

O protocolo `exp://` só funciona com servidores de desenvolvimento local ou Expo development builds específicos.